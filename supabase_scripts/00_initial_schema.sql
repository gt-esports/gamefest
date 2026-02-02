-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Challenges
create table public.challenges (
    id uuid primary key default uuid_generate_v4(),
    name text unique not null check (btrim(name) <> '')
);

-- 2. Games
create table public.games (
    id uuid primary key default uuid_generate_v4(),
    name text unique not null check (btrim(name) <> '')
);

-- 3. Teams
create table public.teams (
    id uuid primary key default uuid_generate_v4(),
    game_id uuid not null references public.games(id) on delete cascade,
    name text not null check (btrim(name) <> ''),
    unique (game_id, name)
);

-- 4. Players
create table public.players (
    id uuid primary key default uuid_generate_v4(),
    name text unique not null check (btrim(name) <> ''),
    points int not null default 0 check (points >= 0),
    participation text[] not null default '{}'::text[],
    log text[] not null default '{}'::text[],
    raffle_winner boolean not null default false,
    raffle_placing int not null default 0 check (raffle_placing >= 0),
    constraint players_raffle_consistency check (
      (raffle_winner = true and raffle_placing > 0) or
      (raffle_winner = false and raffle_placing = 0)
    )
);

-- 5. Team Assignments (Junction)
create table public.team_assignments (
    id uuid primary key default uuid_generate_v4(),
    player_id uuid not null references public.players(id) on delete cascade,
    team_id uuid not null references public.teams(id) on delete cascade,
    unique (player_id, team_id)
);

-- 6. Staff
create table public.staff (
    id uuid primary key default uuid_generate_v4(),
    name text unique not null check (btrim(name) <> ''),
    assignment text check (assignment is null or btrim(assignment) <> '')
);

-- 7. App Roles (AuthZ source of truth for RLS)
create table public.user_roles (
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null check (role in ('staff', 'admin')),
    created_at timestamptz not null default timezone('utc', now()),
    primary key (user_id, role)
);

-- 8. Winners
create table public.winners (
    id uuid primary key default uuid_generate_v4(),
    game text not null check (btrim(game) <> ''),
    match_id text not null check (btrim(match_id) <> ''),
    winner_name text not null check (btrim(winner_name) <> ''),
    unique (game, match_id)
);

-- Row Level Security (RLS) Setup
alter table public.challenges enable row level security;
alter table public.games enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.team_assignments enable row level security;
alter table public.staff enable row level security;
alter table public.user_roles enable row level security;
alter table public.winners enable row level security;

-- Enforce RLS for all roles except roles with BYPASSRLS (e.g. service_role).
alter table public.challenges force row level security;
alter table public.games force row level security;
alter table public.teams force row level security;
alter table public.players force row level security;
alter table public.team_assignments force row level security;
alter table public.staff force row level security;
alter table public.user_roles force row level security;
alter table public.winners force row level security;

-- Read Policies
drop policy if exists "Public read access for challenges" on public.challenges;
create policy "Public read access for challenges" on public.challenges for select using (true);

drop policy if exists "Public read access for games" on public.games;
create policy "Public read access for games" on public.games for select using (true);

drop policy if exists "Public read access for teams" on public.teams;
create policy "Public read access for teams" on public.teams for select using (true);

drop policy if exists "Public read access for players" on public.players;
create policy "Public read access for players" on public.players for select using (true);

drop policy if exists "Public read access for team_assignments" on public.team_assignments;
create policy "Public read access for team_assignments" on public.team_assignments for select using (true);

-- Staff list is sensitive; keep readable only to signed-in users.
drop policy if exists "Public read access for staff" on public.staff;
drop policy if exists "Authenticated read access for staff" on public.staff;
create policy "Authenticated read access for staff"
on public.staff
for select
using (auth.role() = 'authenticated');

drop policy if exists "Public read access for winners" on public.winners;
create policy "Public read access for winners" on public.winners for select using (true);

-- Role mapping should never be public.
drop policy if exists "Users can read own roles" on public.user_roles;
create policy "Users can read own roles"
on public.user_roles
for select
using (auth.uid() = user_id);
