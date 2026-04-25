-- 19: Ensure ON DELETE CASCADE from players -> check_in_events.
--
-- Two fixes:
--   a) players.user_id FK was added without ON DELETE, defaulting to RESTRICT.
--      Re-create it with CASCADE so deleting a user also removes their player row.
--   b) check_in_events had no FK to players, so deleting a players row left
--      check_in_events rows alive.  Add player_id with ON DELETE CASCADE and
--      backfill from the existing user_id / players.user_id join.

-- ── a) Fix players.user_id → public.users(id) ────────────────────────────────

alter table public.players
  drop constraint if exists players_user_id_fkey;

alter table public.players
  add constraint players_user_id_fkey
  foreign key (user_id) references public.users(id) on delete cascade;

-- ── b) Add player_id to check_in_events with ON DELETE CASCADE ────────────────

alter table public.check_in_events
  add column if not exists player_id uuid references public.players(id) on delete cascade;

-- Backfill: match via check_in_events.user_id = players.user_id
update public.check_in_events cie
set player_id = p.id
from public.players p
where p.user_id = cie.user_id
  and cie.player_id is null;

create index if not exists idx_check_in_events_player_id
  on public.check_in_events(player_id);
