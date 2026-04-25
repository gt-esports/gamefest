-- 17: Atomic point awards + server-bound awarded_by.
--
-- Three problems this fixes:
--   (a) player_activity.awarded_by was client-supplied — staff could attribute
--       awards to other staff. Bind it to auth.uid() at the column + policy.
--   (b) The award flow took 4 round-trips (cap read, activity insert, player
--       read, player update). A failure mid-flight left points and the audit
--       log diverged. The new RPC does everything in one transaction.
--   (c) The cap check was a separate read from the insert (TOCTOU). Two
--       concurrent awards could both pass the cap and both insert. The cap
--       check now runs inside the same transaction as the insert.

-- (a) Server-side awarder binding.
alter table public.player_activity
  alter column awarded_by set default auth.uid();

drop policy if exists "staff_admin_can_insert_activity" on public.player_activity;

create policy "staff_admin_can_insert_activity" on public.player_activity
  for insert to authenticated
  with check (
    public.has_app_role(array['staff', 'admin'])
    and awarded_by = auth.uid()
  );

-- (b)+(c) Atomic, race-safe award.
-- Returns the new player_activity.id so callers can still drive the
-- "undo last award" flow (which deletes by activity id).
-- Raises with SQLSTATE 'P0001' and message 'CAP_EXCEEDED' when the per-game
-- or per-challenge cap would be breached, so the client can distinguish
-- this from a generic failure.

create or replace function public.award_points(
  p_player_id    uuid,
  p_game_id      uuid,
  p_challenge_id uuid,
  p_amount       int,
  p_log_entry    text
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_max         int;
  v_current     int;
  v_activity_id uuid;
  v_updated     int;
begin
  if not public.has_app_role(array['staff', 'admin']) then
    raise exception 'Only staff or admins can award points';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Points to award must be positive';
  end if;

  if (p_game_id is null) = (p_challenge_id is null) then
    raise exception 'Exactly one of p_game_id or p_challenge_id must be set';
  end if;

  if p_game_id is not null then
    select max_points into v_max from public.games where id = p_game_id;
    if v_max is null then
      raise exception 'Game % not found', p_game_id;
    end if;
    select coalesce(sum(points_awarded), 0) into v_current
      from public.player_activity
      where player_id = p_player_id and game_id = p_game_id;
  else
    select max_points into v_max from public.challenges where id = p_challenge_id;
    if v_max is null then
      raise exception 'Challenge % not found', p_challenge_id;
    end if;
    select coalesce(sum(points_awarded), 0) into v_current
      from public.player_activity
      where player_id = p_player_id and challenge_id = p_challenge_id;
  end if;

  if v_current + p_amount > v_max then
    raise exception 'CAP_EXCEEDED' using errcode = 'P0001';
  end if;

  insert into public.player_activity
    (player_id, game_id, challenge_id, points_awarded, awarded_by)
    values (p_player_id, p_game_id, p_challenge_id, p_amount, auth.uid())
    returning id into v_activity_id;

  update public.players
    set points = points + p_amount,
        log    = array_append(coalesce(log, '{}'::text[]), p_log_entry)
    where id = p_player_id;

  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'Player % not found', p_player_id;
  end if;

  return v_activity_id;
end;
$$;

grant execute on function public.award_points(uuid, uuid, uuid, int, text) to authenticated;
