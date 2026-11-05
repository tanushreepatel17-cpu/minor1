-- Stores the citizen profile submitted from the /eligibility matcher.
create table public.citizen_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  full_name text not null,
  age integer not null check (age >= 0 and age <= 120),
  gender text not null,
  annual_income numeric(14,2) not null check (annual_income >= 0),
  social_category text not null,
  occupation text not null,
  residence text not null,
  bpl boolean not null default false,
  disability boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.citizen_profiles enable row level security;
create policy "own profile readable" on public.citizen_profiles for select to authenticated using (user_id = auth.uid());
create policy "own profile insertable" on public.citizen_profiles for insert to authenticated with check (user_id = auth.uid());
create policy "own profile updatable" on public.citizen_profiles for update to authenticated using (user_id = auth.uid());
grant select, insert, update on public.citizen_profiles to authenticated;
