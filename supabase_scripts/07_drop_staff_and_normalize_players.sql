-- 07: Drop staff table, normalize players to reference users via FK.
-- Assumes 00-06 have been applied.

-- ============================================================
-- 1. Backfill players.user_id for any rows still missing it
-- ============================================================
-- Best-effort match by players.name = users.username before we drop the column.
update public.players p
set user_id = u.id
from public.users u
where p.user_id is null
  and p.name is not null
  and p.name = u.username;

-- ============================================================
-- 1b. Add FK from user_roles.user_id -> public.users(id)
-- ============================================================
-- Needed so PostgREST can embed public.users when selecting user_roles.
-- public.users.id itself references auth.users(id), so this is a parallel
-- constraint, not a replacement.
alter table public.user_roles
  drop constraint if exists user_roles_user_id_public_users_fkey;

alter table public.user_roles
  add constraint user_roles_user_id_public_users_fkey
  foreign key (user_id) references public.users(id) on delete cascade;

-- ============================================================
-- 2. Add staff assignment tracking to user_roles
-- ============================================================
-- user_roles becomes the single source of truth for who is staff/admin.
-- `assignment` is only meaningful for role='staff' (station/task label).
alter table public.user_roles
  add column if not exists assignment text
    check (assignment is null or btrim(assignment) <> '');

-- Migrate existing staff.assignment into user_roles where we can match by name.
-- Match staff.name -> users.username -> user_roles(user_id, role='staff').
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'staff'
  ) then
    update public.user_roles ur
    set assignment = s.assignment
    from public.staff s
    join public.users u on u.username = s.name
    where ur.user_id = u.id
      and ur.role = 'staff'
      and s.assignment is not null
      and ur.assignment is null;
  end if;
end $$;

-- ============================================================
-- 3. Drop staff table
-- ============================================================
drop table if exists public.staff cascade;

-- ============================================================
-- 4. Normalize players: require user_id, drop redundant name
-- ============================================================
-- Fail loudly if any player row still lacks a user_id — these need manual
-- reconciliation before we can enforce NOT NULL.
do $$
declare
  orphan_count int;
begin
  select count(*) into orphan_count from public.players where user_id is null;
  if orphan_count > 0 then
    raise exception
      'Cannot drop players.name: % player row(s) have no user_id. Reconcile first.',
      orphan_count;
  end if;
end $$;

alter table public.players
  alter column user_id set not null;

-- Ensure one player row per user.
create unique index if not exists players_user_id_key on public.players(user_id);

-- Drop the redundant name column (display name lives on users).
alter table public.players
  drop column if exists name;
