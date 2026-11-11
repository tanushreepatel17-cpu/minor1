-- Feedback becomes private to the person who wrote it.
--
-- Signed-in users own their rows through `user_id`; anonymous visitors own
-- their rows through a random `guest_key` that the browser keeps in
-- localStorage and sends as the `x-guest-key` header. The select policy only
-- returns rows matching the caller, so a new visitor no longer sees other
-- people's comments; an aggregate rating (count + average) is exposed
-- separately through `scheme_feedback_stats()` so the star summary still works.

alter table public.scheme_feedback
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists guest_key text;

create index if not exists scheme_feedback_user_id_idx on public.scheme_feedback (user_id);
create index if not exists scheme_feedback_guest_key_idx on public.scheme_feedback (guest_key);

drop policy if exists "feedback readable by everyone" on public.scheme_feedback;
drop policy if exists "feedback insertable by everyone" on public.scheme_feedback;
drop policy if exists "feedback readable by its author" on public.scheme_feedback;
drop policy if exists "feedback insertable by its author" on public.scheme_feedback;

create policy "feedback readable by its author"
  on public.scheme_feedback for select
  to anon, authenticated
  using (
    (auth.uid() is not null and user_id = auth.uid())
    or (
      user_id is null
      and guest_key is not null
      and guest_key <> ''
      and guest_key = coalesce(
        nullif(current_setting('request.headers', true), '')::json ->> 'x-guest-key',
        ''
      )
    )
  );

create policy "feedback insertable by its author"
  on public.scheme_feedback for insert
  to anon, authenticated
  with check (
    rating between 1 and 5
    and char_length(coalesce(comment, '')) <= 1000
    and char_length(coalesce(name, '')) <= 80
    and char_length(coalesce(guest_key, '')) <= 64
    and (
      (auth.uid() is not null and user_id = auth.uid() and guest_key is null)
      or (auth.uid() is null and user_id is null and guest_key is not null and guest_key <> '')
    )
    and exists (
      select 1 from public.schemes s
      where s.id = scheme_id and s.status = 'published'
    )
  );

-- Aggregate rating for a scheme without exposing anyone's comments.
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
  where scheme_id = p_scheme_id
    and (user_id is not null or guest_key is not null);
$$;

revoke all on function public.scheme_feedback_stats(uuid) from public;
grant execute on function public.scheme_feedback_stats(uuid) to anon, authenticated;

notify pgrst, 'reload schema';
