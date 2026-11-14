-- Official links now come only from each scheme's own official portal
-- (`official_url`). The MyScheme resolver column is no longer read or
-- written by the app, so drop it together with its index.
drop index if exists public.schemes_myscheme_slug_idx;
alter table public.schemes drop column if exists myscheme_slug;
