-- 21: Preserve prior GameFest data and make all event data season-aware.
-- Existing rows are archived as GameFest 2026; GameFest 2027 becomes active.
-- Review the two seed rows before applying if the production season labels differ.

begin;

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (btrim(slug) <> ''),
  name text not null check (btrim(name) <> ''),
  starts_on date,
  ends_on date,
  is_active boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create unique index if not exists seasons_one_active_idx
  on public.seasons (is_active) where is_active;

alter table public.seasons enable row level security;
drop policy if exists "Public read access for seasons" on public.seasons;
create policy "Public read access for seasons" on public.seasons
  for select using (true);

insert into public.seasons (slug, name, is_active, archived_at)
values
  ('gamefest-2026', 'GameFest 2026', false, now()),
  ('gamefest-2027', 'GameFest 2027', true, null)
on conflict (slug) do nothing;

create or replace function public.get_active_season_id()
returns uuid
language sql
stable
security invoker
set search_path = public
as $$
  select id from public.seasons where is_active
$$;

grant execute on function public.get_active_season_id() to anon, authenticated;

-- All existing event data belongs to the legacy season, including check-in
-- history without a player_id. New rows default to the active season.
do $$
declare
  old_season uuid;
  event_table text;
begin
  select id into old_season from public.seasons where slug = 'gamefest-2026';
  foreach event_table in array array[
    'games', 'challenges', 'players', 'registrations', 'winners',
    'player_activity', 'check_in_events', 'staff_assignments'
  ] loop
    execute format(
      'alter table public.%I add column if not exists season_id uuid references public.seasons(id)',
      event_table
    );
    execute format('update public.%I set season_id = $1 where season_id is null', event_table)
      using old_season;
    execute format(
      'alter table public.%I alter column season_id set not null,
         alter column season_id set default public.get_active_season_id()',
      event_table
    );
  end loop;
end $$;

-- Names and user registrations may repeat in a later season.
alter table public.games drop constraint if exists games_name_key;
alter table public.challenges drop constraint if exists challenges_name_key;
alter table public.registrations drop constraint if exists registrations_user_id_key;
alter table public.winners drop constraint if exists winners_game_match_id_key;
drop index if exists public.players_user_id_key;

create unique index if not exists games_season_name_key on public.games(season_id, name);
create unique index if not exists challenges_season_name_key on public.challenges(season_id, name);
create unique index if not exists registrations_season_user_key on public.registrations(season_id, user_id);
create unique index if not exists players_season_user_key on public.players(season_id, user_id);
create unique index if not exists winners_season_game_match_key on public.winners(season_id, game, match_id);
create index if not exists player_activity_season_idx on public.player_activity(season_id);
create index if not exists check_in_events_season_idx on public.check_in_events(season_id);

-- Registration creates a player in the same season.
create or replace function public.handle_new_registration_player()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.players (user_id, season_id)
  values (new.user_id, new.season_id)
  on conflict (season_id, user_id) do nothing;
  return new;
end;
$$;

-- Check-in operations only affect the active season.
create or replace function public.check_in_user(p_user_id uuid) returns void
language plpgsql security invoker set search_path = public as $$
declare v_updated int; v_season uuid := public.get_active_season_id();
begin
  if not public.has_app_role(array['staff','admin']) then raise exception 'Only staff or admins can check in players'; end if;
  update public.registrations set checked_in=true, checked_in_at=now(), checked_in_by=auth.uid()
    where user_id=p_user_id and season_id=v_season;
  get diagnostics v_updated = row_count;
  if v_updated=0 then raise exception 'This player has not registered for the active season.'; end if;
  insert into public.check_in_events(user_id, player_id, season_id, event_type, performed_by)
    select p_user_id, id, v_season, 'check_in', auth.uid() from public.players
    where user_id=p_user_id and season_id=v_season;
end; $$;

create or replace function public.check_out_user(p_user_id uuid) returns void
language plpgsql security invoker set search_path = public as $$
declare v_updated int; v_season uuid := public.get_active_season_id();
begin
  if not public.has_app_role(array['staff','admin']) then raise exception 'Only staff or admins can check out players'; end if;
  update public.registrations set checked_in=false, checked_in_at=null, checked_in_by=null
    where user_id=p_user_id and season_id=v_season;
  get diagnostics v_updated = row_count;
  if v_updated=0 then raise exception 'Player is not registered for the active season.'; end if;
  insert into public.check_in_events(user_id, player_id, season_id, event_type, performed_by)
    select p_user_id, id, v_season, 'check_out', auth.uid() from public.players
    where user_id=p_user_id and season_id=v_season;
end; $$;

create or replace function public.reset_all_check_ins() returns int
language plpgsql security invoker set search_path = public as $$
declare v_count int; v_season uuid := public.get_active_season_id();
begin
  if not public.has_app_role(array['staff','admin']) then raise exception 'Only staff or admins can reset check-ins'; end if;
  with reset as (
    update public.registrations set checked_in=false, checked_in_at=null, checked_in_by=null
      where checked_in=true and season_id=v_season returning user_id
  ), logged as (
    insert into public.check_in_events(user_id, player_id, season_id, event_type, performed_by)
    select r.user_id, p.id, v_season, 'check_out', auth.uid()
      from reset r join public.players p on p.user_id=r.user_id and p.season_id=v_season returning 1
  ) select count(*) into v_count from logged;
  return coalesce(v_count,0);
end; $$;

commit;
