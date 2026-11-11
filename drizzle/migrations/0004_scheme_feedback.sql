-- Citizen feedback for individual schemes.
-- Guests can submit feedback without an account; everyone can read it.
-- There is deliberately no update/delete policy: feedback is append-only from
-- the client and can only be moderated with the service role.

create table if not exists public.scheme_feedback (
  id uuid primary key default gen_random_uuid(),
  scheme_id uuid not null references public.schemes(id) on delete cascade,
  name text,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists scheme_feedback_scheme_id_created_at_idx
  on public.scheme_feedback (scheme_id, created_at desc);

alter table public.scheme_feedback enable row level security;

drop policy if exists "feedback readable by everyone" on public.scheme_feedback;
create policy "feedback readable by everyone"
  on public.scheme_feedback for select
  to anon, authenticated
  using (true);

drop policy if exists "feedback insertable by everyone" on public.scheme_feedback;
create policy "feedback insertable by everyone"
  on public.scheme_feedback for insert
  to anon, authenticated
  with check (
    rating between 1 and 5
    and char_length(coalesce(comment, '')) <= 1000
    and char_length(coalesce(name, '')) <= 80
    and exists (
      select 1 from public.schemes s
      where s.id = scheme_id and s.status = 'published'
    )
  );

grant select, insert on public.scheme_feedback to anon, authenticated;
grant all on public.scheme_feedback to service_role;

notify pgrst, 'reload schema';
