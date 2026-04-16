-- 09: Structured point awards.
-- Adds points_per_award + max_points to games/challenges,
-- adds game_assignment_id / challenge_assignment_id to user_roles,
-- and creates the player_activity table for cap-aware award tracking.
-- Assumes 00-08 have been applied.

-- ============================================================
-- 1. Add point configuration to games
-- ============================================================
alter table public.games
  add column if not exists points_per_award integer not null default 10,
  add column if not exists max_points integer not null default 50;

-- ============================================================
-- 2. Add point configuration to challenges
-- ============================================================
alter table public.challenges
  add column if not exists points_per_award integer not null default 10,
  add column if not exists max_points integer not null default 50;

-- ============================================================
-- 3. Add FK assignment columns to user_roles
-- ============================================================
alter table public.user_roles
  add column if not exists game_assignment_id uuid references public.games(id) on delete set null,
  add column if not exists challenge_assignment_id uuid references public.challenges(id) on delete set null;

-- Only one FK can be set at a time per staff member.
alter table public.user_roles
  add constraint chk_user_roles_single_assignment
  check (not (game_assignment_id is not null and challenge_assignment_id is not null));

-- ============================================================
-- 4. Create player_activity table
-- ============================================================
create table if not exists public.player_activity (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  game_id uuid references public.games(id) on delete set null,
  challenge_id uuid references public.challenges(id) on delete set null,
  points_awarded integer not null check (points_awarded > 0),
  awarded_by uuid references public.users(id) on delete set null,
  awarded_at timestamptz not null default now(),
  constraint chk_player_activity_single_source
    check (
      (game_id is not null and challenge_id is null) or
      (game_id is null and challenge_id is not null)
    )
);

-- Indexes for common queries
create index if not exists idx_player_activity_player_game
  on public.player_activity(player_id, game_id);
create index if not exists idx_player_activity_player_challenge
  on public.player_activity(player_id, challenge_id);
create index if not exists idx_player_activity_awarded_by
  on public.player_activity(awarded_by);

-- ============================================================
-- 5. RLS for player_activity
-- ============================================================
alter table public.player_activity enable row level security;

create policy "staff_admin_can_select_activity" on public.player_activity
  for select to authenticated
  using (public.has_app_role(array['staff', 'admin']));

create policy "staff_admin_can_insert_activity" on public.player_activity
  for insert to authenticated
  with check (public.has_app_role(array['staff', 'admin']));

create policy "admin_can_delete_activity" on public.player_activity
  for delete to authenticated
  using (public.has_app_role(array['admin']));
