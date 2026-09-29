-- Run after 21_seasons.sql. Admins can update active-season dates and the
-- tournament link. Season names and creation are reserved for maintainers.
-- Archived event records cannot be changed through the client or its RPCs.
begin;

alter table public.seasons
  add column if not exists tournament_slug text
  check (tournament_slug is null or btrim(tournament_slug) <> '');

update public.seasons set tournament_slug = 'gamefest-2026'
where slug = 'gamefest-2026' and tournament_slug is null;

grant select on public.seasons to anon, authenticated;
revoke all on public.seasons from public;
revoke insert, update, delete on public.seasons from anon, authenticated;

-- Remove earlier admin RPC signatures if a prior draft was applied.
drop function if exists public.update_active_season(uuid, text, date, date, text);
drop function if exists public.start_new_season(text, text, date, date, text);

create or replace function public.update_active_season(
  p_season_id uuid,
  p_starts_on date,
  p_ends_on date,
  p_tournament_slug text
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.has_app_role(array['admin']) then
    raise exception 'Only admins can edit the active season';
  end if;
  if p_starts_on is not null and p_ends_on is not null and p_ends_on < p_starts_on then
    raise exception 'End date must be on or after start date';
  end if;
  if nullif(btrim(p_tournament_slug), '') is not null
     and p_tournament_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Tournament slug must use lowercase letters, numbers, and hyphens';
  end if;

  update public.seasons
  set starts_on = p_starts_on,
      ends_on = p_ends_on,
      tournament_slug = nullif(btrim(p_tournament_slug), '')
  where id = p_season_id and is_active;

  if not found then
    raise exception 'The active season changed. Reload and try again';
  end if;
end;
$$;

revoke all on function public.update_active_season(uuid, date, date, text) from public;
grant execute on function public.update_active_season(uuid, date, date, text) to authenticated;

create or replace function public.guard_active_season_write()
returns trigger
language plpgsql security invoker set search_path = public
as $$
declare
  v_old_season uuid;
  v_new_season uuid;
begin
  if tg_table_name = 'teams' then
    if tg_op <> 'INSERT' then
      select season_id into v_old_season from public.games where id = old.game_id;
    end if;
    if tg_op <> 'DELETE' then
      select season_id into v_new_season from public.games where id = new.game_id;
    end if;
  elsif tg_table_name = 'team_assignments' then
    if tg_op <> 'INSERT' then
      select season_id into v_old_season from public.players where id = old.player_id;
    end if;
    if tg_op <> 'DELETE' then
      select season_id into v_new_season from public.players where id = new.player_id;
      if v_new_season is distinct from (
        select g.season_id from public.teams t
        join public.games g on g.id = t.game_id where t.id = new.team_id
      ) then
        raise exception 'Player and team must belong to the same season';
      end if;
    end if;
  else
    if tg_op <> 'INSERT' then v_old_season := old.season_id; end if;
    if tg_op <> 'DELETE' then v_new_season := new.season_id; end if;
  end if;

  -- A cascaded delete can run after its parent game/player has been removed.
  -- The parent's own guard already checked that it belonged to the active season.
  if tg_op = 'DELETE' and v_old_season is null
     and tg_table_name in ('teams', 'team_assignments') then
    v_old_season := public.get_active_season_id();
  end if;

  if tg_op <> 'DELETE' and tg_table_name = 'player_activity' then
    if v_new_season is distinct from
       (select season_id from public.players where id = new.player_id)
       or (new.game_id is not null and v_new_season is distinct from
           (select season_id from public.games where id = new.game_id))
       or (new.challenge_id is not null and v_new_season is distinct from
           (select season_id from public.challenges where id = new.challenge_id)) then
      raise exception 'Award, player, and event must belong to the same season';
    end if;
  end if;

  if tg_op <> 'DELETE' and tg_table_name = 'staff_assignments' then
    if (new.game_id is not null and v_new_season is distinct from
        (select season_id from public.games where id = new.game_id))
       or (new.challenge_id is not null and v_new_season is distinct from
           (select season_id from public.challenges where id = new.challenge_id)) then
      raise exception 'Staff assignment must belong to its game or challenge season';
    end if;
  end if;

  if tg_op <> 'DELETE' and tg_table_name = 'check_in_events'
     and new.player_id is not null and v_new_season is distinct from
         (select season_id from public.players where id = new.player_id) then
    raise exception 'Check-in and player must belong to the same season';
  end if;

  if (tg_op <> 'INSERT' and v_old_season is distinct from public.get_active_season_id())
     or (tg_op <> 'DELETE' and v_new_season is distinct from public.get_active_season_id()) then
    raise exception 'Inactive seasons are read-only';
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

do $$
declare
  event_table text;
begin
  foreach event_table in array array[
    'games', 'challenges', 'players', 'registrations',
    'player_activity', 'check_in_events', 'staff_assignments',
    'teams', 'team_assignments'
  ] loop
    execute format('drop trigger if exists guard_active_season_write on public.%I', event_table);
    execute format(
      'create trigger guard_active_season_write before insert or update or delete on public.%I
       for each row execute function public.guard_active_season_write()', event_table
    );
  end loop;
end $$;

commit;
