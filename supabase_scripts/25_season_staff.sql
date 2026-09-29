-- 25: Make staff roster membership season-specific while keeping admin roles global.
begin;

create table if not exists public.season_staff (
  season_id uuid not null references public.seasons(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (season_id, user_id)
);

-- Preserve everyone with a historical assignment in that season, then place
-- all pre-migration regular staff on the most recently archived season.
insert into public.season_staff (season_id, user_id)
select distinct season_id, user_id from public.staff_assignments
on conflict do nothing;

insert into public.season_staff (season_id, user_id)
select previous_season.id, ur.user_id
from (
  select id
  from public.seasons
  where not is_active
  order by archived_at desc nulls last, created_at desc
  limit 1
) previous_season
cross join public.user_roles ur
where ur.role = 'staff'
on conflict do nothing;

-- Admins are global and must appear on every season's staff roster.
insert into public.season_staff (season_id, user_id)
select s.id, ur.user_id
from public.seasons s
cross join public.user_roles ur
where ur.role = 'admin'
on conflict do nothing;

create or replace function public.sync_admin_season_staff()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_table_name = 'seasons' then
    insert into public.season_staff (season_id, user_id)
    select new.id, user_id from public.user_roles where role = 'admin'
    on conflict do nothing;
  elsif new.role = 'admin' then
    insert into public.season_staff (season_id, user_id)
    select id, new.user_id from public.seasons
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_admin_roster_on_season_insert on public.seasons;
create trigger sync_admin_roster_on_season_insert
after insert on public.seasons
for each row execute function public.sync_admin_season_staff();

drop trigger if exists sync_admin_roster_on_role_insert on public.user_roles;
create trigger sync_admin_roster_on_role_insert
after insert on public.user_roles
for each row execute function public.sync_admin_season_staff();

-- Assignments cannot outlive their season roster membership.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'staff_assignments_season_staff_fkey'
  ) then
    alter table public.staff_assignments
      add constraint staff_assignments_season_staff_fkey
      foreign key (season_id, user_id)
      references public.season_staff(season_id, user_id)
      on delete cascade;
  end if;
end $$;

alter table public.season_staff enable row level security;

-- Admin remains a global authorization role. Staff authorization is valid only
-- when the user is on the active season's roster.
create or replace function public.has_app_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and (
    (
      'admin' = any (allowed_roles)
      and exists (
        select 1 from public.user_roles
        where user_id = auth.uid() and role = 'admin'
      )
    )
    or
    (
      'staff' = any (allowed_roles)
      and exists (
        select 1
        from public.user_roles ur
        join public.season_staff ss on ss.user_id = ur.user_id
        where ur.user_id = auth.uid()
          and ur.role = 'staff'
          and ss.season_id = public.get_active_season_id()
      )
    )
  );
$$;

drop policy if exists "season_staff_select" on public.season_staff;
create policy "season_staff_select" on public.season_staff
  for select to authenticated
  using (public.has_app_role(array['staff', 'admin']));

drop policy if exists "season_staff_insert" on public.season_staff;
create policy "season_staff_insert" on public.season_staff
  for insert to authenticated
  with check (
    public.has_app_role(array['admin'])
    and season_id = public.get_active_season_id()
  );

drop policy if exists "season_staff_delete" on public.season_staff;
create policy "season_staff_delete" on public.season_staff
  for delete to authenticated
  using (
    public.has_app_role(array['admin'])
    and season_id = public.get_active_season_id()
    and not exists (
      select 1 from public.user_roles
      where user_id = season_staff.user_id and role = 'admin'
    )
  );

revoke all on public.season_staff from anon, authenticated;
grant select, insert, delete on public.season_staff to authenticated;

commit;
