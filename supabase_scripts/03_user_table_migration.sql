-- 1. Create public.users table
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.users enable row level security;

-- 3. Create RLS policies
drop policy if exists "Public profiles are viewable by everyone" on public.users;
create policy "Public profiles are viewable by everyone"
  on public.users for select
  using ( true );

drop policy if exists "Users can insert their own profile" on public.users;
create policy "Users can insert their own profile"
  on public.users for insert
  with check ( auth.uid() = id );

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users for update
  using ( auth.uid() = id );

-- 4. Create Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username, display_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name', -- Map Discord full_name to username initially
    new.raw_user_meta_data->>'full_name', -- Map Discord full_name to display_name initially
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 5. Create Trigger for auto-creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Backfill existing users from auth.users
insert into public.users (id, username, display_name, avatar_url)
select
  id,
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'avatar_url'
from auth.users
where id not in (select id from public.users);

-- 7. Add user_id to players table
alter table public.players
add column if not exists user_id uuid references public.users(id);

-- 8. Backfill players user_id by matching name
-- This assumes public.users.username matches public.players.name
update public.players p
set user_id = u.id
from public.users u
where p.name = u.username
and p.user_id is null;
