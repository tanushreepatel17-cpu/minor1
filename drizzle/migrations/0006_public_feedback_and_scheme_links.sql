-- Public feedback, per-scheme MyScheme links, and user-owned citizen profiles.
--
-- 1. Scheme pages now store the resolved slug of that scheme's own MyScheme
--    page (`myscheme_slug`), so "Official Links" can open the particular
--    scheme instead of a generic search URL.
-- 2. Feedback is public: everyone may read every review. Authorship is still
--    recorded and insert rules are unchanged.
-- 3. A signed-in citizen's profile is attached to their account, so /eligibility
--    can prefill only that user's data. Guests keep a separate, unowned row.

alter table public.schemes
  add column if not exists myscheme_slug text;

create index if not exists schemes_myscheme_slug_idx on public.schemes (myscheme_slug);

-- ---------------------------------------------------------------------------
-- Public feedback
-- ---------------------------------------------------------------------------

drop policy if exists "feedback readable by its author" on public.scheme_feedback;
drop policy if exists "feedback readable by everyone" on public.scheme_feedback;

create policy "feedback readable by everyone"
  on public.scheme_feedback for select
  to anon, authenticated
  using (true);

-- The summary now counts every public review, including legacy rows that
-- predate the authorship columns.
create or replace function public.scheme_feedback_stats(p_scheme_id uuid)
returns table (review_count bigint, average_rating numeric)
language sql
security definer
set search_path = ''
as $$
  select
    count(*)::bigint as review_count,
    round(coalesce(avg(rating), 0), 1) as average_rating
  from public.scheme_feedback
  where scheme_id = p_scheme_id;
$$;

revoke all on function public.scheme_feedback_stats(uuid) from public;
grant execute on function public.scheme_feedback_stats(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Citizen profiles: attach to the signed-in user, never to someone else
-- ---------------------------------------------------------------------------

create or replace function public.register_citizen_profile(
  p_full_name text,
  p_age integer,
  p_gender text,
  p_annual_income numeric,
  p_social_category text,
  p_occupation text,
  p_residence text,
  p_bpl boolean default false,
  p_disability boolean default false
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_uid uuid := auth.uid();
begin
  if p_full_name is null or length(btrim(p_full_name)) < 3 then
    raise exception 'Full name must be at least 3 characters.' using errcode = '22023';
  end if;
  if p_age is null or p_age < 0 or p_age > 120 then
    raise exception 'Age must be between 0 and 120.' using errcode = '22023';
  end if;
  if p_annual_income is null or p_annual_income < 0 then
    raise exception 'Family annual income must be zero or greater.' using errcode = '22023';
  end if;
  if p_gender is null or p_gender not in ('male', 'female', 'transgender') then
    raise exception 'Please select a valid gender.' using errcode = '22023';
  end if;
  if p_social_category is null or p_social_category = '' then
    raise exception 'Please select a social category.' using errcode = '22023';
  end if;
  if p_occupation is null or p_occupation = '' then
    raise exception 'Please select an occupation.' using errcode = '22023';
  end if;
  if p_residence is null or p_residence not in ('rural', 'urban') then
    raise exception 'Please select your area of residence.' using errcode = '22023';
  end if;

  if v_uid is not null then
    insert into public.citizen_profiles (
      user_id, full_name, age, gender, annual_income, social_category,
      occupation, residence, bpl, disability
    ) values (
      v_uid, btrim(p_full_name), p_age, p_gender, p_annual_income, p_social_category,
      p_occupation, p_residence, coalesce(p_bpl, false), coalesce(p_disability, false)
    )
    on conflict (user_id) do update set
      full_name = excluded.full_name,
      age = excluded.age,
      gender = excluded.gender,
      annual_income = excluded.annual_income,
      social_category = excluded.social_category,
      occupation = excluded.occupation,
      residence = excluded.residence,
      bpl = excluded.bpl,
      disability = excluded.disability,
      updated_at = now()
    returning id into v_id;
  else
    insert into public.citizen_profiles (
      user_id, full_name, age, gender, annual_income, social_category,
      occupation, residence, bpl, disability
    ) values (
      null, btrim(p_full_name), p_age, p_gender, p_annual_income, p_social_category,
      p_occupation, p_residence, coalesce(p_bpl, false), coalesce(p_disability, false)
    )
    returning id into v_id;
  end if;

  return v_id;
end;
$$;

revoke all on function public.register_citizen_profile(
  text, integer, text, numeric, text, text, text, boolean, boolean
) from public;

grant execute on function public.register_citizen_profile(
  text, integer, text, numeric, text, text, text, boolean, boolean
) to anon, authenticated;

notify pgrst, 'reload schema';
