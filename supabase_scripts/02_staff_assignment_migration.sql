-- Migrate staff table from role/is_admin to assignment-only model.
-- Intended for existing projects after applying 00 + 01 scripts.

-- 1) Rename role -> assignment (idempotent)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'staff'
      and column_name = 'role'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'staff'
      and column_name = 'assignment'
  ) then
    alter table public.staff rename column role to assignment;
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'staff'
      and column_name = 'role'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'staff'
      and column_name = 'assignment'
  ) then
    update public.staff
    set assignment = coalesce(nullif(btrim(assignment), ''), role);

    alter table public.staff drop column role;
  end if;
end $$;

-- 2) Remove deprecated admin flag
alter table public.staff drop column if exists is_admin;

-- 3) Assignment is optional. Normalize blank values to NULL.
update public.staff
set assignment = null
where btrim(coalesce(assignment, '')) = '';

alter table public.staff alter column assignment drop not null;

-- Drop potential legacy checks and recreate a stable named check
alter table public.staff drop constraint if exists staff_role_check;
alter table public.staff drop constraint if exists staff_assignment_check;
alter table public.staff
  add constraint staff_assignment_check check (assignment is null or btrim(assignment) <> '');
