-- Serverless RLS policies for frontend-only API access.
-- Authorization source of truth: public.user_roles linked to auth.users(id).

-- Legacy helper no longer needed once roles move out of JWT metadata.
drop function if exists public.jwt_role();

-- SECURITY DEFINER is used so policy checks can read user_roles safely.
create or replace function public.has_app_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and exists (
      select 1
      from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = any (allowed_roles)
    );
$$;

grant execute on function public.has_app_role(text[]) to anon, authenticated;

-- Role management helpers for admin flows.
create or replace function public.assign_app_role(target_user_id uuid, target_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_role text := lower(btrim(target_role));
begin
  if not public.has_app_role(array['admin']) then
    raise exception 'Only admins can assign roles';
  end if;

  if normalized_role not in ('staff', 'admin') then
    raise exception 'Invalid role: %', target_role;
  end if;

  insert into public.user_roles (user_id, role)
  values (target_user_id, normalized_role)
  on conflict (user_id, role) do nothing;
end;
$$;

create or replace function public.revoke_app_role(target_user_id uuid, target_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_role text := lower(btrim(target_role));
begin
  if not public.has_app_role(array['admin']) then
    raise exception 'Only admins can revoke roles';
  end if;

  if normalized_role not in ('staff', 'admin') then
    raise exception 'Invalid role: %', target_role;
  end if;

  delete from public.user_roles
  where user_id = target_user_id
    and role = normalized_role;
end;
$$;

grant execute on function public.assign_app_role(uuid, text) to authenticated;
grant execute on function public.revoke_app_role(uuid, text) to authenticated;

-- Explicit grants + RLS together provide defense in depth.
revoke all on public.challenges from anon, authenticated;
revoke all on public.games from anon, authenticated;
revoke all on public.teams from anon, authenticated;
revoke all on public.players from anon, authenticated;
revoke all on public.team_assignments from anon, authenticated;
revoke all on public.staff from anon, authenticated;
revoke all on public.user_roles from anon, authenticated;
revoke all on public.winners from anon, authenticated;

grant select on public.challenges, public.games, public.teams, public.players, public.team_assignments, public.winners to anon;
grant select on public.challenges, public.games, public.teams, public.players, public.team_assignments, public.staff, public.user_roles, public.winners to authenticated;
grant insert, update, delete on public.players, public.team_assignments to authenticated;
grant insert, update, delete on public.challenges, public.games, public.teams, public.staff, public.user_roles, public.winners to authenticated;

-- user_roles policies
-- Initial bootstrap admin still needs service role / SQL editor.
drop policy if exists "Users can read own roles" on public.user_roles;
drop policy if exists "Admins can read all roles" on public.user_roles;
drop policy if exists "Admins can insert roles" on public.user_roles;
drop policy if exists "Admins can update roles" on public.user_roles;
drop policy if exists "Admins can delete roles" on public.user_roles;

create policy "Users can read own roles"
on public.user_roles
for select
using (auth.uid() = user_id);

create policy "Admins can read all roles"
on public.user_roles
for select
using (public.has_app_role(array['admin']));

create policy "Admins can insert roles"
on public.user_roles
for insert
with check (public.has_app_role(array['admin']));

create policy "Admins can update roles"
on public.user_roles
for update
using (public.has_app_role(array['admin']))
with check (public.has_app_role(array['admin']));

create policy "Admins can delete roles"
on public.user_roles
for delete
using (public.has_app_role(array['admin']));

-- Players + assignments: staff and admin can write.
drop policy if exists "Staff/Admin write players" on public.players;
drop policy if exists "Staff/Admin insert players" on public.players;
drop policy if exists "Staff/Admin update players" on public.players;
drop policy if exists "Staff/Admin delete players" on public.players;

create policy "Staff/Admin insert players"
on public.players
for insert
with check (public.has_app_role(array['staff', 'admin']));

create policy "Staff/Admin update players"
on public.players
for update
using (public.has_app_role(array['staff', 'admin']))
with check (public.has_app_role(array['staff', 'admin']));

create policy "Staff/Admin delete players"
on public.players
for delete
using (public.has_app_role(array['staff', 'admin']));

drop policy if exists "Staff/Admin write team_assignments" on public.team_assignments;
drop policy if exists "Staff/Admin insert team_assignments" on public.team_assignments;
drop policy if exists "Staff/Admin update team_assignments" on public.team_assignments;
drop policy if exists "Staff/Admin delete team_assignments" on public.team_assignments;

create policy "Staff/Admin insert team_assignments"
on public.team_assignments
for insert
with check (public.has_app_role(array['staff', 'admin']));

create policy "Staff/Admin update team_assignments"
on public.team_assignments
for update
using (public.has_app_role(array['staff', 'admin']))
with check (public.has_app_role(array['staff', 'admin']));

create policy "Staff/Admin delete team_assignments"
on public.team_assignments
for delete
using (public.has_app_role(array['staff', 'admin']));

-- Admin-only writes.
drop policy if exists "Admin write games" on public.games;
drop policy if exists "Admin insert games" on public.games;
drop policy if exists "Admin update games" on public.games;
drop policy if exists "Admin delete games" on public.games;

create policy "Admin insert games"
on public.games
for insert
with check (public.has_app_role(array['admin']));

create policy "Admin update games"
on public.games
for update
using (public.has_app_role(array['admin']))
with check (public.has_app_role(array['admin']));

create policy "Admin delete games"
on public.games
for delete
using (public.has_app_role(array['admin']));

drop policy if exists "Admin write teams" on public.teams;
drop policy if exists "Admin insert teams" on public.teams;
drop policy if exists "Admin update teams" on public.teams;
drop policy if exists "Admin delete teams" on public.teams;

create policy "Admin insert teams"
on public.teams
for insert
with check (public.has_app_role(array['admin']));

create policy "Admin update teams"
on public.teams
for update
using (public.has_app_role(array['admin']))
with check (public.has_app_role(array['admin']));

create policy "Admin delete teams"
on public.teams
for delete
using (public.has_app_role(array['admin']));

drop policy if exists "Admin write challenges" on public.challenges;
drop policy if exists "Admin insert challenges" on public.challenges;
drop policy if exists "Admin update challenges" on public.challenges;
drop policy if exists "Admin delete challenges" on public.challenges;

create policy "Admin insert challenges"
on public.challenges
for insert
with check (public.has_app_role(array['admin']));

create policy "Admin update challenges"
on public.challenges
for update
using (public.has_app_role(array['admin']))
with check (public.has_app_role(array['admin']));

create policy "Admin delete challenges"
on public.challenges
for delete
using (public.has_app_role(array['admin']));

drop policy if exists "Admin write staff" on public.staff;
drop policy if exists "Admin insert staff" on public.staff;
drop policy if exists "Admin update staff" on public.staff;
drop policy if exists "Admin delete staff" on public.staff;

create policy "Admin insert staff"
on public.staff
for insert
with check (public.has_app_role(array['admin']));

create policy "Admin update staff"
on public.staff
for update
using (public.has_app_role(array['admin']))
with check (public.has_app_role(array['admin']));

create policy "Admin delete staff"
on public.staff
for delete
using (public.has_app_role(array['admin']));

drop policy if exists "Admin write winners" on public.winners;
drop policy if exists "Admin insert winners" on public.winners;
drop policy if exists "Admin update winners" on public.winners;
drop policy if exists "Admin delete winners" on public.winners;

create policy "Admin insert winners"
on public.winners
for insert
with check (public.has_app_role(array['admin']));

create policy "Admin update winners"
on public.winners
for update
using (public.has_app_role(array['admin']))
with check (public.has_app_role(array['admin']));

create policy "Admin delete winners"
on public.winners
for delete
using (public.has_app_role(array['admin']));
