-- Registration no longer collects email/password, so citizen profiles are no
-- longer tied to a Supabase Auth user. Guests register through the
-- register_citizen_profile() function below instead of creating an account.

alter table public.citizen_profiles alter column user_id drop not null;

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

  insert into public.citizen_profiles (
    user_id,
    full_name,
    age,
    gender,
    annual_income,
    social_category,
    occupation,
    residence,
    bpl,
    disability
  ) values (
    null,
    btrim(p_full_name),
    p_age,
    p_gender,
    p_annual_income,
    p_social_category,
    p_occupation,
    p_residence,
    coalesce(p_bpl, false),
    coalesce(p_disability, false)
  )
  returning id into v_id;

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
