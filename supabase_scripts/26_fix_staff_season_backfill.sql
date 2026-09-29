-- 26: Move the staff imported by migration 25 to the previous season.
-- Admins remain on every existing and future season roster.
begin;

do $$
declare
  active_season_id uuid := public.get_active_season_id();
begin
  if exists (
    select 1
    from public.staff_assignments sa
    join public.user_roles ur
      on ur.user_id = sa.user_id and ur.role = 'staff'
    where sa.season_id = active_season_id
      and not exists (
        select 1
        from public.user_roles admin_role
        where admin_role.user_id = sa.user_id
          and admin_role.role = 'admin'
      )
  ) then
    raise exception 'Correction stopped: regular staff have assignments in the active season';
  end if;
end $$;

-- Add current non-admin staff to the most recently archived season.
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
  and not exists (
    select 1
    from public.user_roles admin_role
    where admin_role.user_id = ur.user_id
      and admin_role.role = 'admin'
  )
on conflict do nothing;

-- Remove those non-admin staff from the active season. Admin memberships remain.
delete from public.season_staff ss
using public.user_roles ur
where ss.user_id = ur.user_id
  and ur.role = 'staff'
  and ss.season_id = public.get_active_season_id()
  and not exists (
    select 1
    from public.user_roles admin_role
    where admin_role.user_id = ss.user_id
      and admin_role.role = 'admin'
  );

commit;
