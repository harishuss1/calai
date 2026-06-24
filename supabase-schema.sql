-- CalAI database schema.
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  photo_url text,
  name text,
  calories int,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  eaten_at timestamptz default now(),
  is_manual boolean default false
);

-- Distinguishes hand-typed meals from photo-analyzed ones (added after launch).
alter table meals add column if not exists is_manual boolean default false;

-- Helps the Log and Stats screens query by date range quickly.
create index if not exists meals_eaten_at_idx on meals (eaten_at desc);

-- Body-weight tracking for the Stats tab.
create table if not exists weight_logs (
  id uuid primary key default gen_random_uuid(),
  weight_kg numeric not null,
  note text,
  logged_at timestamptz default now()
);

create index if not exists weight_logs_logged_at_idx on weight_logs (logged_at desc);

-- Single-user app with no authentication: enable RLS and allow the anon key
-- full access. This is intentional for a personal, single-user project only.
alter table meals enable row level security;

drop policy if exists "Allow anon full access to meals" on meals;
create policy "Allow anon full access to meals"
  on meals
  for all
  using (true)
  with check (true);

alter table weight_logs enable row level security;

drop policy if exists "Allow anon full access to weight_logs" on weight_logs;
create policy "Allow anon full access to weight_logs"
  on weight_logs
  for all
  using (true)
  with check (true);
