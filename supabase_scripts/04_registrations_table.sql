-- 1. Create registrations table
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  admission_type text not null check (admission_type in ('BYOC', 'GA')),
  school text,
  heard_from text,
  created_at timestamptz default now(),
  checked_in boolean default false,
  unique (user_id)
);

-- 2. Enable RLS
alter table public.registrations enable row level security;

-- 3. Grant table-level access (RLS policies further restrict)
revoke all on public.registrations from anon, authenticated;
grant select, insert, update on public.registrations to authenticated;

-- 4. RLS policies
drop policy if exists "Users can view own registration" on public.registrations;
create policy "Users can view own registration"
  on public.registrations for select
  using (auth.uid() = user_id);

drop policy if exists "Staff/Admin can view all registrations" on public.registrations;
create policy "Staff/Admin can view all registrations"
  on public.registrations for select
  using (public.has_app_role(array['staff', 'admin']));

drop policy if exists "Users can insert own registration" on public.registrations;
create policy "Users can insert own registration"
  on public.registrations for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own registration" on public.registrations;
create policy "Users can update own registration"
  on public.registrations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Staff/Admin can update registrations" on public.registrations;
create policy "Staff/Admin can update registrations"
  on public.registrations for update
  using (public.has_app_role(array['staff', 'admin']))
  with check (public.has_app_role(array['staff', 'admin']));
