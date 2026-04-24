-- 08: Drop display_name from users.
-- username is the Discord username (single source of truth).
-- Full name is stored in fname + lname (set via CompleteProfileModal).
-- Assumes 00-07 have been applied.

-- ============================================================
-- 1. Backfill username from display_name for any rows where
--    username is null but display_name is set.
-- ============================================================
update public.users
set username = display_name
where username is null
  and display_name is not null;

-- ============================================================
-- 2. Drop the redundant display_name column
-- ============================================================
alter table public.users
  drop column if exists display_name;
