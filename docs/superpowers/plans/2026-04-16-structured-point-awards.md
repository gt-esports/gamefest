# Structured Point Awards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the free-form staff point award system with a structured system where each staff member is assigned to a specific game/challenge and can only award that game/challenge's fixed point amount (up to a per-player cap), while admins retain full arbitrary add/remove capability.

**Architecture:** Add `points_per_award` and `max_points` to `games`/`challenges` tables; add `game_assignment_id`/`challenge_assignment_id` FKs to `user_roles`; introduce a `player_activity` table to track per-player per-game/challenge point accumulation for cap enforcement. Staff UI collapses to a single award button; admin UI retains the full dropdown+custom-amount panel.

**Tech Stack:** Supabase (PostgreSQL + RLS), TypeScript, React, Vite; `npx tsc --noEmit` for type-check verification throughout.

---

## File Map

| Status | File | Change |
|--------|------|--------|
| Create | `supabase_scripts/09_structured_point_awards.sql` | Migration: new columns on games/challenges/user_roles + player_activity table |
| Modify | `src/types/database.types.ts` | Add new columns + player_activity table types |
| Modify | `src/schemas/GamesSchema.ts` | Add `id`, `pointsPerAward`, `maxPoints` to `Game`; extend `UpdateGameInput` |
| Modify | `src/hooks/useGames.ts` | Fetch + map new columns; update create/update CRUD |
| Modify | `src/schemas/ChallengesSchema.ts` | Add `pointsPerAward`, `maxPoints`; add `UpdateChallengeInput` |
| Modify | `src/hooks/useChallenges.ts` | Fetch + map new columns; add `updateChallengeById` CRUD |
| Modify | `src/schemas/StaffSchema.ts` | Replace `assignment: string` with FK-based assignment fields |
| Modify | `src/hooks/useStaff.ts` | JOIN to games/challenges; update CRUD to use FK columns |
| Create | `src/hooks/usePlayerActivity.ts` | `recordActivity`, `getActivityTotal`, `deleteActivitiesBy` |
| Modify | `src/components/adminPanel/players/AwardCard.tsx` | Staff mode (fixed) vs admin mode (custom) bifurcated UI |
| Modify | `src/components/adminPanel/PlayersPanel.tsx` | New award/revoke logic using player_activity |
| Modify | `src/components/adminPanel/StaffPanel.tsx` | Game/challenge assignment picker (dropdown) |
| Modify | `src/components/adminPanel/GameEditorPanel.tsx` | Inline pts_per_award + max_points editing |

---

## Task 1: SQL Migration

**Files:**
- Create: `supabase_scripts/09_structured_point_awards.sql`

- [ ] **Step 1: Write the migration**

```sql
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
```

- [ ] **Step 2: Apply migration to Supabase**

Run the SQL against your Supabase project SQL editor or via CLI:
```bash
# Via Supabase CLI (if linked):
supabase db push

# Or paste the file contents into the Supabase Dashboard → SQL Editor
```

Expected: No errors. Verify in Supabase table editor:
- `games` has `points_per_award` and `max_points` columns (default 10, 50)
- `challenges` has same columns
- `user_roles` has `game_assignment_id` and `challenge_assignment_id` (nullable, null for existing rows)
- `player_activity` table exists

- [ ] **Step 3: Commit**

```bash
git add supabase_scripts/09_structured_point_awards.sql
git commit -m "feat: add structured point award schema (player_activity, FK staff assignments)"
```

---

## Task 2: Update database.types.ts

**Files:**
- Modify: `src/types/database.types.ts`

- [ ] **Step 1: Update the types**

Replace the full file content at `src/types/database.types.ts`:

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      challenges: {
        Row: {
          id: string;
          name: string;
          points_per_award: number;
          max_points: number;
        };
        Insert: {
          id?: string;
          name: string;
          points_per_award?: number;
          max_points?: number;
        };
        Update: {
          id?: string;
          name?: string;
          points_per_award?: number;
          max_points?: number;
        };
        Relationships: [];
      };
      games: {
        Row: {
          id: string;
          name: string;
          points_per_award: number;
          max_points: number;
        };
        Insert: {
          id?: string;
          name: string;
          points_per_award?: number;
          max_points?: number;
        };
        Update: {
          id?: string;
          name?: string;
          points_per_award?: number;
          max_points?: number;
        };
        Relationships: [];
      };
      player_activity: {
        Row: {
          id: string;
          player_id: string;
          game_id: string | null;
          challenge_id: string | null;
          points_awarded: number;
          awarded_by: string | null;
          awarded_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          game_id?: string | null;
          challenge_id?: string | null;
          points_awarded: number;
          awarded_by?: string | null;
          awarded_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          game_id?: string | null;
          challenge_id?: string | null;
          points_awarded?: number;
          awarded_by?: string | null;
          awarded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "player_activity_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_activity_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_activity_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "challenges";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          fname: string | null;
          id: string;
          lname: string | null;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          fname?: string | null;
          id: string;
          lname?: string | null;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          fname?: string | null;
          id?: string;
          lname?: string | null;
          username?: string | null;
        };
        Relationships: [];
      };
      players: {
        Row: {
          id: string;
          log: string[] | null;
          participation: string[] | null;
          points: number | null;
          raffle_placing: number | null;
          raffle_winner: boolean | null;
          user_id: string;
        };
        Insert: {
          id?: string;
          log?: string[] | null;
          participation?: string[] | null;
          points?: number | null;
          raffle_placing?: number | null;
          raffle_winner?: boolean | null;
          user_id: string;
        };
        Update: {
          id?: string;
          log?: string[];
          participation?: string[];
          points?: number | null;
          raffle_placing?: number | null;
          raffle_winner?: boolean | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "players_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      registrations: {
        Row: {
          id: string;
          user_id: string;
          first_name: string;
          last_name: string;
          email: string;
          admission_type: string;
          school: string | null;
          heard_from: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name: string;
          last_name: string;
          email: string;
          admission_type: string;
          school?: string | null;
          heard_from?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          admission_type?: string;
          school?: string | null;
          heard_from?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "registrations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_roles: {
        Row: {
          assignment: string | null;
          created_at: string;
          role: string;
          user_id: string;
          game_assignment_id: string | null;
          challenge_assignment_id: string | null;
        };
        Insert: {
          assignment?: string | null;
          created_at?: string;
          role: string;
          user_id: string;
          game_assignment_id?: string | null;
          challenge_assignment_id?: string | null;
        };
        Update: {
          assignment?: string | null;
          created_at?: string;
          role?: string;
          user_id?: string;
          game_assignment_id?: string | null;
          challenge_assignment_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_roles_game_assignment_id_fkey";
            columns: ["game_assignment_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_roles_challenge_assignment_id_fkey";
            columns: ["challenge_assignment_id"];
            isOneToOne: false;
            referencedRelation: "challenges";
            referencedColumns: ["id"];
          }
        ];
      };
      team_assignments: {
        Row: {
          id: string;
          player_id: string;
          team_id: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          team_id: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          team_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_assignments_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_assignments_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      teams: {
        Row: {
          game_id: string;
          id: string;
          name: string;
        };
        Insert: {
          game_id: string;
          id?: string;
          name: string;
        };
        Update: {
          game_id?: string;
          id?: string;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "teams_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          }
        ];
      };
      winners: {
        Row: {
          game: string;
          id: string;
          match_id: string;
          winner_name: string;
        };
        Insert: {
          game: string;
          id?: string;
          match_id: string;
          winner_name: string;
        };
        Update: {
          game?: string;
          id?: string;
          match_id?: string;
          winner_name?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      assign_app_role: {
        Args: {
          target_role: string;
          target_user_id: string;
        };
        Returns: undefined;
      };
      has_app_role: {
        Args: {
          allowed_roles: string[];
        };
        Returns: boolean;
      };
      revoke_app_role: {
        Args: {
          target_role: string;
          target_user_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type TableName = keyof Database["public"]["Tables"];

export type TableRow<T extends TableName> =
  Database["public"]["Tables"][T]["Row"];
export type TableInsert<T extends TableName> =
  Database["public"]["Tables"][T]["Insert"];
export type TableUpdate<T extends TableName> =
  Database["public"]["Tables"][T]["Update"];
```

- [ ] **Step 2: Verify types compile**

```bash
cd /Users/kevinhu/Programming/GTEsports/gamefest
npx tsc --noEmit 2>&1 | head -30
```

Expected: Errors about missing fields in `GamesSchema`, `ChallengesSchema`, `StaffSchema` — these are expected and will be fixed in subsequent tasks. No structural/syntax errors in the types file itself.

- [ ] **Step 3: Commit**

```bash
git add src/types/database.types.ts
git commit -m "feat: update DB types for structured point awards"
```

---

## Task 3: Update GamesSchema + useGames

**Files:**
- Modify: `src/schemas/GamesSchema.ts`
- Modify: `src/hooks/useGames.ts`

- [ ] **Step 1: Update GamesSchema.ts**

Replace `src/schemas/GamesSchema.ts` with:

```typescript
export type GameTeam = {
    name: string;
    players: string[];
};

export type Game = {
    id: string;
    name: string;
    pointsPerAward: number;
    maxPoints: number;
    teams: GameTeam[];
};

export type UpdateGameInput = {
    name?: string;
    teams?: Array<{ name: string }>;
    pointsPerAward?: number;
    maxPoints?: number;
};
```

- [ ] **Step 2: Update useGames.ts to fetch and map new fields**

In `src/hooks/useGames.ts`:

1. Update the `fetchGames` select query to include `id, name, points_per_award, max_points`:

```typescript
// Line ~23: change
let gameQuery = supabase.from("games").select("id, name").order("name");
// to:
let gameQuery = supabase.from("games").select("id, name, points_per_award, max_points").order("name");
```

2. Update the `gameMap` construction (line ~71) to include new fields:

```typescript
const gameMap = new Map(games.map((game) => [
  game.id,
  {
    id: game.id,
    name: game.name,
    pointsPerAward: game.points_per_award,
    maxPoints: game.max_points,
    teams: [] as GameTeam[],
  }
]));
```

3. Update `createGame` to accept and pass `pointsPerAward` and `maxPoints`:

```typescript
export const createGame = async (
  name: string,
  pointsPerAward = 10,
  maxPoints = 50
): Promise<Game> => {
  const trimmedName = name.trim();

  const { data: inserted, error: insertError } = await supabase
    .from("games")
    .insert({ name: trimmedName, points_per_award: pointsPerAward, max_points: maxPoints })
    .select("id")
    .single();

  if (insertError) throw insertError;

  const games = await fetchGames();
  const game = games.find((g) => g.id === inserted.id);
  if (!game) throw new Error("Failed to load created game");

  return game;
};
```

4. Update `updateGameByName` to handle `pointsPerAward` and `maxPoints`:

```typescript
export const updateGameByName = async (
  oldName: string,
  input: UpdateGameInput
): Promise<Game> => {
  const { data: existing, error: existingError } = await supabase
    .from("games")
    .select("id")
    .eq("name", oldName)
    .maybeSingle();

  if (existingError) throw existingError;
  if (!existing) throw new Error("Game not found");

  const updates: { name?: string; points_per_award?: number; max_points?: number } = {};
  if (typeof input.name === "string" && input.name.trim()) {
    updates.name = input.name.trim();
  }
  if (typeof input.pointsPerAward === "number") {
    updates.points_per_award = input.pointsPerAward;
  }
  if (typeof input.maxPoints === "number") {
    updates.max_points = input.maxPoints;
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from("games")
      .update(updates)
      .eq("id", existing.id);

    if (updateError) throw updateError;
  }

  if (Array.isArray(input.teams)) {
    const { error: deleteError } = await supabase
      .from("teams")
      .delete()
      .eq("game_id", existing.id);

    if (deleteError) throw deleteError;

    const rows = input.teams
      .filter((team) => typeof team?.name === "string" && team.name.trim())
      .map((team) => ({ game_id: existing.id, name: team.name.trim() }));

    if (rows.length > 0) {
      const { error: insertError } = await supabase.from("teams").insert(rows);
      if (insertError) throw insertError;
    }
  }

  const targetName = updates.name || oldName;
  const allGames = await fetchGames();
  const game = allGames.find((g) => g.name === targetName);
  if (!game) throw new Error("Failed to load updated game");
  return game;
};
```

5. Update `useGames` hook to expose `patchGameByName` with new signature (no changes needed — it already delegates to `updateGameByName`). Add `addGame` to accept pointsPerAward/maxPoints optionally:

```typescript
const addGame = useCallback(
  async (name: string, pointsPerAward?: number, maxPoints?: number) => {
    const game = await createGame(name, pointsPerAward, maxPoints);
    await refresh();
    return game;
  },
  [refresh]
);
```

- [ ] **Step 3: Verify type-check**

```bash
npx tsc --noEmit 2>&1 | grep -E "GamesSchema|useGames" | head -20
```

Expected: Fewer errors related to games. Errors may still exist in components that use `Game` until they're updated.

- [ ] **Step 4: Commit**

```bash
git add src/schemas/GamesSchema.ts src/hooks/useGames.ts
git commit -m "feat: add id, pointsPerAward, maxPoints to Game type and useGames"
```

---

## Task 4: Update ChallengesSchema + useChallenges

**Files:**
- Modify: `src/schemas/ChallengesSchema.ts`
- Modify: `src/hooks/useChallenges.ts`

- [ ] **Step 1: Update ChallengesSchema.ts**

Replace `src/schemas/ChallengesSchema.ts` with:

```typescript
export type Challenge = {
  id: string;
  name: string;
  pointsPerAward: number;
  maxPoints: number;
};

export type CreateChallengeInput = {
  name: string;
  pointsPerAward?: number;
  maxPoints?: number;
};

export type UpdateChallengeInput = {
  name?: string;
  pointsPerAward?: number;
  maxPoints?: number;
};
```

- [ ] **Step 2: Update useChallenges.ts**

Replace `src/hooks/useChallenges.ts` with:

```typescript
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import type { Challenge, CreateChallengeInput, UpdateChallengeInput } from "../schemas/ChallengesSchema";

export const fetchChallenges = async (): Promise<Challenge[]> => {
  const { data, error } = await supabase
    .from("challenges")
    .select("id, name, points_per_award, max_points")
    .order("name", { ascending: true });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    pointsPerAward: row.points_per_award,
    maxPoints: row.max_points,
  }));
};

export const createChallenge = async (input: CreateChallengeInput): Promise<Challenge> => {
  const { data, error } = await supabase
    .from("challenges")
    .insert({
      name: input.name.trim(),
      points_per_award: input.pointsPerAward ?? 10,
      max_points: input.maxPoints ?? 50,
    })
    .select("id, name, points_per_award, max_points")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    pointsPerAward: data.points_per_award,
    maxPoints: data.max_points,
  };
};

export const updateChallengeById = async (
  id: string,
  input: UpdateChallengeInput
): Promise<Challenge> => {
  const updates: { name?: string; points_per_award?: number; max_points?: number } = {};

  if (typeof input.name === "string" && input.name.trim()) {
    updates.name = input.name.trim();
  }
  if (typeof input.pointsPerAward === "number") {
    updates.points_per_award = input.pointsPerAward;
  }
  if (typeof input.maxPoints === "number") {
    updates.max_points = input.maxPoints;
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from("challenges")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
  }

  const { data, error: readError } = await supabase
    .from("challenges")
    .select("id, name, points_per_award, max_points")
    .eq("id", id)
    .single();

  if (readError) throw readError;

  return {
    id: data.id,
    name: data.name,
    pointsPerAward: data.points_per_award,
    maxPoints: data.max_points,
  };
};

export const deleteChallengeByName = async (name: string): Promise<void> => {
  const { data, error } = await supabase
    .from("challenges")
    .delete()
    .eq("name", name)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Challenge not found");
};

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      setError(null);
      const rows = await fetchChallenges();
      setChallenges(rows);
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Failed to load challenges");
      setError(nextError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addChallenge = useCallback(
    async (input: CreateChallengeInput) => {
      const challenge = await createChallenge(input);
      await refresh();
      return challenge;
    },
    [refresh]
  );

  const patchChallengeById = useCallback(
    async (id: string, input: UpdateChallengeInput) => {
      const challenge = await updateChallengeById(id, input);
      await refresh();
      return challenge;
    },
    [refresh]
  );

  const removeChallengeByName = useCallback(
    async (name: string) => {
      await deleteChallengeByName(name);
      await refresh();
    },
    [refresh]
  );

  return {
    challenges,
    loading,
    error,
    refresh,
    addChallenge,
    patchChallengeById,
    removeChallengeByName,
  };
};
```

- [ ] **Step 3: Verify type-check**

```bash
npx tsc --noEmit 2>&1 | grep -v "node_modules" | head -30
```

- [ ] **Step 4: Commit**

```bash
git add src/schemas/ChallengesSchema.ts src/hooks/useChallenges.ts
git commit -m "feat: add pointsPerAward, maxPoints to Challenge and update useChallenges CRUD"
```

---

## Task 5: Update StaffSchema + useStaff

**Files:**
- Modify: `src/schemas/StaffSchema.ts`
- Modify: `src/hooks/useStaff.ts`

- [ ] **Step 1: Update StaffSchema.ts**

Replace `src/schemas/StaffSchema.ts` with:

```typescript
// Staff assignment is now tied to a specific game or challenge via FK.
// assignmentType: which kind of entity they're assigned to (null = floater, no award privilege).
// assignmentId: the game/challenge UUID.
// assignmentName: display name of the game/challenge.
// pointsPerAward / maxPoints: inherited from the assigned game/challenge.
export type StaffMember = {
    userId: string;
    name: string;
    assignmentType: 'game' | 'challenge' | null;
    assignmentId: string | null;
    assignmentName: string | null;
    pointsPerAward: number | null;
    maxPoints: number | null;
};

export type CreateStaffMemberInput = {
    userId: string;
    gameAssignmentId?: string | null;
    challengeAssignmentId?: string | null;
};

export type UpdateStaffMemberInput = {
    gameAssignmentId?: string | null;
    challengeAssignmentId?: string | null;
};
```

- [ ] **Step 2: Replace useStaff.ts**

Replace `src/hooks/useStaff.ts` with:

```typescript
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import type {
  CreateStaffMemberInput,
  StaffMember,
  UpdateStaffMemberInput,
} from "../schemas/StaffSchema";

type AssignmentData = {
  id: string;
  name: string;
  points_per_award: number;
  max_points: number;
};

type StaffJoinRow = {
  user_id: string;
  game_assignment_id: string | null;
  challenge_assignment_id: string | null;
  users:
    | { username: string | null; fname: string | null; lname: string | null }
    | Array<{ username: string | null; fname: string | null; lname: string | null }>
    | null;
  games: AssignmentData | AssignmentData[] | null;
  challenges: AssignmentData | AssignmentData[] | null;
};

const unwrapRelation = <T>(value: T | T[] | null | undefined): T | null => {
  if (!value) return null;
  return Array.isArray(value) ? value[0] || null : value;
};

const STAFF_SELECT =
  "user_id, game_assignment_id, challenge_assignment_id, users(username, fname, lname), games(id, name, points_per_award, max_points), challenges(id, name, points_per_award, max_points)";

const toStaff = (row: StaffJoinRow): StaffMember => {
  const user = unwrapRelation(row.users);
  const full = [user?.fname, user?.lname].filter(Boolean).join(" ");
  const game = unwrapRelation(row.games);
  const challenge = unwrapRelation(row.challenges);

  return {
    userId: row.user_id,
    name: full || user?.username || "Unknown",
    assignmentType: game ? "game" : challenge ? "challenge" : null,
    assignmentId: game?.id ?? challenge?.id ?? null,
    assignmentName: game?.name ?? challenge?.name ?? null,
    pointsPerAward: game?.points_per_award ?? challenge?.points_per_award ?? null,
    maxPoints: game?.max_points ?? challenge?.max_points ?? null,
  };
};

export const fetchStaff = async (): Promise<StaffMember[]> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select(STAFF_SELECT)
    .eq("role", "staff");

  if (error) throw error;

  const rows = (data || []) as unknown as StaffJoinRow[];
  const staff = rows.map(toStaff);
  staff.sort((a, b) => a.name.localeCompare(b.name));
  return staff;
};

export const createStaffMember = async (
  input: CreateStaffMemberInput
): Promise<StaffMember> => {
  const { error } = await supabase.from("user_roles").insert({
    user_id: input.userId,
    role: "staff",
    game_assignment_id: input.gameAssignmentId ?? null,
    challenge_assignment_id: input.challengeAssignmentId ?? null,
  });

  if (error) throw error;

  const { data, error: readError } = await supabase
    .from("user_roles")
    .select(STAFF_SELECT)
    .eq("user_id", input.userId)
    .eq("role", "staff")
    .maybeSingle();

  if (readError) throw readError;
  if (!data) throw new Error("Staff member not found after insert");

  return toStaff(data as unknown as StaffJoinRow);
};

export const updateStaffByUserId = async (
  userId: string,
  input: UpdateStaffMemberInput
): Promise<StaffMember> => {
  const updates: {
    game_assignment_id?: string | null;
    challenge_assignment_id?: string | null;
  } = {};

  if ("gameAssignmentId" in input) {
    updates.game_assignment_id = input.gameAssignmentId ?? null;
    // Clearing the other FK prevents the DB constraint violation.
    if (input.gameAssignmentId) updates.challenge_assignment_id = null;
  }
  if ("challengeAssignmentId" in input) {
    updates.challenge_assignment_id = input.challengeAssignmentId ?? null;
    if (input.challengeAssignmentId) updates.game_assignment_id = null;
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from("user_roles")
      .update(updates)
      .eq("user_id", userId)
      .eq("role", "staff");

    if (error) throw error;
  }

  const { data, error: readError } = await supabase
    .from("user_roles")
    .select(STAFF_SELECT)
    .eq("user_id", userId)
    .eq("role", "staff")
    .maybeSingle();

  if (readError) throw readError;
  if (!data) throw new Error("Staff member not found");

  return toStaff(data as unknown as StaffJoinRow);
};

export const deleteStaffByUserId = async (userId: string): Promise<void> => {
  const { data, error } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role", "staff")
    .select("user_id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Staff member not found");
};

export const useStaff = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      setError(null);
      const rows = await fetchStaff();
      setStaff(rows);
    } catch (err) {
      const nextError =
        err instanceof Error ? err : new Error("Failed to load staff");
      setError(nextError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addStaffMember = useCallback(
    async (input: CreateStaffMemberInput) => {
      const member = await createStaffMember(input);
      await refresh();
      return member;
    },
    [refresh]
  );

  const patchStaffByUserId = useCallback(
    async (userId: string, input: UpdateStaffMemberInput) => {
      const member = await updateStaffByUserId(userId, input);
      await refresh();
      return member;
    },
    [refresh]
  );

  const removeStaffByUserId = useCallback(
    async (userId: string) => {
      await deleteStaffByUserId(userId);
      await refresh();
    },
    [refresh]
  );

  return {
    staff,
    loading,
    error,
    refresh,
    addStaffMember,
    patchStaffByUserId,
    removeStaffByUserId,
  };
};
```

- [ ] **Step 3: Verify type-check**

```bash
npx tsc --noEmit 2>&1 | grep -v "node_modules" | head -30
```

Expected: Errors about `assignment` being used in `PlayersPanel` / `StaffPanel` components — these will be fixed in later tasks.

- [ ] **Step 4: Commit**

```bash
git add src/schemas/StaffSchema.ts src/hooks/useStaff.ts
git commit -m "feat: refactor staff assignment to FK-based game/challenge reference"
```

---

## Task 6: Add usePlayerActivity hook

**Files:**
- Create: `src/hooks/usePlayerActivity.ts`

- [ ] **Step 1: Create the hook**

Create `src/hooks/usePlayerActivity.ts`:

```typescript
import { supabase } from "../utils/supabaseClient";

/**
 * Insert one point-award record for a player for a specific game or challenge.
 * Exactly one of gameId / challengeId must be non-null.
 */
export const recordActivity = async (
  playerId: string,
  gameId: string | null,
  challengeId: string | null,
  pointsAwarded: number,
  awardedByUserId: string
): Promise<void> => {
  const { error } = await supabase.from("player_activity").insert({
    player_id: playerId,
    game_id: gameId,
    challenge_id: challengeId,
    points_awarded: pointsAwarded,
    awarded_by: awardedByUserId,
  });
  if (error) throw error;
};

/**
 * Return the total points a player has received for a given game OR challenge.
 * Pass exactly one of gameId / challengeId as non-null.
 */
export const getActivityTotal = async (
  playerId: string,
  gameId: string | null,
  challengeId: string | null
): Promise<number> => {
  let query = supabase
    .from("player_activity")
    .select("points_awarded")
    .eq("player_id", playerId);

  if (gameId) {
    query = query.eq("game_id", gameId);
  } else if (challengeId) {
    query = query.eq("challenge_id", challengeId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).reduce((sum, row) => sum + row.points_awarded, 0);
};

/**
 * Delete all activity rows for a given player + staff user + game/challenge.
 * Returns the sum of points deleted (for subtracting from players.points).
 * Used by the revoke flow.
 */
export const deleteActivitiesBy = async (
  playerId: string,
  awardedByUserId: string,
  gameId: string | null,
  challengeId: string | null
): Promise<number> => {
  // First fetch the rows to compute the sum before deleting.
  let selectQuery = supabase
    .from("player_activity")
    .select("points_awarded")
    .eq("player_id", playerId)
    .eq("awarded_by", awardedByUserId);

  if (gameId) {
    selectQuery = selectQuery.eq("game_id", gameId);
  } else if (challengeId) {
    selectQuery = selectQuery.eq("challenge_id", challengeId);
  }

  const { data: toDelete, error: selectError } = await selectQuery;
  if (selectError) throw selectError;

  const total = (toDelete || []).reduce((sum, row) => sum + row.points_awarded, 0);
  if (total === 0) return 0;

  let deleteQuery = supabase
    .from("player_activity")
    .delete()
    .eq("player_id", playerId)
    .eq("awarded_by", awardedByUserId);

  if (gameId) {
    deleteQuery = deleteQuery.eq("game_id", gameId);
  } else if (challengeId) {
    deleteQuery = deleteQuery.eq("challenge_id", challengeId);
  }

  const { error: deleteError } = await deleteQuery;
  if (deleteError) throw deleteError;

  return total;
};
```

- [ ] **Step 2: Verify type-check**

```bash
npx tsc --noEmit 2>&1 | grep "usePlayerActivity" | head -10
```

Expected: No errors for this new file.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/usePlayerActivity.ts
git commit -m "feat: add usePlayerActivity hook (recordActivity, getActivityTotal, deleteActivitiesBy)"
```

---

## Task 7: Update AwardCard

**Files:**
- Modify: `src/components/adminPanel/players/AwardCard.tsx`

- [ ] **Step 1: Replace AwardCard.tsx**

The component now has two distinct modes:
- **Staff mode** (`isAdmin=false`): shows fixed assignment info and a single "Award N pts" button
- **Admin mode** (`isAdmin=true`): shows the full reason dropdown + quick buttons + custom input

Replace `src/components/adminPanel/players/AwardCard.tsx` with:

```typescript
import React from "react";
import { dangerBtnClass, primaryBtnClass } from "../shared/styles";

const QUICK_AMOUNTS = [1, 5, 10, 25];

type AwardCardProps = {
  isAdmin: boolean;
  busy: boolean;
  onAward: (amount?: number) => void;
  // Staff-mode props (used when isAdmin=false)
  assignmentName?: string | null;
  pointsPerAward?: number | null;
  maxPoints?: number | null;
  // Admin-mode props (used when isAdmin=true)
  games?: string[];
  challenges?: string[];
  selectedReason?: string;
  onSelectedReasonChange?: (v: string) => void;
  pointsInput?: string;
  onPointsInputChange?: (v: string) => void;
};

const AwardCard: React.FC<AwardCardProps> = ({
  isAdmin,
  busy,
  onAward,
  assignmentName,
  pointsPerAward,
  maxPoints,
  games = [],
  challenges = [],
  selectedReason = "",
  onSelectedReasonChange,
  pointsInput = "",
  onPointsInputChange,
}) => {
  if (!isAdmin) {
    // ── Staff mode ────────────────────────────────────────────
    const hasAssignment = !!assignmentName && pointsPerAward !== null && pointsPerAward !== undefined;

    return (
      <div className="border border-blue-bright/30 bg-gradient-to-br from-navy-blue/80 to-card-bg/80 p-5 shadow-[0_0_30px_rgba(0,212,255,0.08)]">
        <h3 className="mb-4 font-zuume text-2xl font-bold uppercase tracking-wider text-white">
          Award Points
        </h3>

        {!hasAssignment ? (
          <p className="rounded border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-300">
            You have no game or challenge assignment. Contact an admin to be assigned.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="border border-blue-accent/20 bg-dark-navy/40 px-4 py-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-bright/70">
                Your Assignment
              </p>
              <p className="text-lg font-bold text-white">{assignmentName}</p>
              <p className="mt-1 text-xs text-gray-400">
                <span className="font-semibold text-blue-bright">{pointsPerAward} pts</span> per award
                {" · "}cap: <span className="font-semibold text-blue-bright">{maxPoints} pts</span> per player
              </p>
            </div>
            <button
              disabled={busy}
              onClick={() => onAward()}
              className={`w-full py-4 font-zuume text-xl font-bold uppercase tracking-wider ${primaryBtnClass} disabled:opacity-50`}
            >
              {busy ? "Awarding…" : `Award ${pointsPerAward} pts`}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Admin mode ──────────────────────────────────────────────
  const noReason = selectedReason === "";

  const submitCustom = (sign: 1 | -1) => {
    const v = parseInt(pointsInput, 10);
    if (!Number.isNaN(v)) onAward(sign * Math.abs(v));
  };

  return (
    <div className="border border-blue-bright/30 bg-gradient-to-br from-navy-blue/80 to-card-bg/80 p-5 shadow-[0_0_30px_rgba(0,212,255,0.08)]">
      <h3 className="mb-4 font-zuume text-2xl font-bold uppercase tracking-wider text-white">
        Award Points
        <span className="ml-3 text-sm font-normal normal-case tracking-normal text-amber-300">Admin</span>
      </h3>

      <div className="mb-3">
        <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-bright/80">
          Reason — Game / Challenge
          <span className="font-bold text-red-400" aria-hidden="true">*</span>
          {noReason && (
            <span className="ml-auto font-semibold normal-case tracking-normal text-amber-400">
              Required
            </span>
          )}
        </label>
        <select
          value={selectedReason}
          onChange={(e) => onSelectedReasonChange?.(e.target.value)}
          className={`w-full border bg-dark-bg/60 px-3 py-2 text-base font-semibold text-white focus:outline-none ${
            noReason
              ? "border-amber-400/60 focus:border-amber-400"
              : "border-blue-accent/40 focus:border-blue-bright"
          }`}
        >
          <option value="">Select a Game or Challenge…</option>
          {games.length > 0 && (
            <optgroup label="Games">
              {games.map((g) => (
                <option key={`game-${g}`} value={`Game: ${g}`}>
                  {g}
                </option>
              ))}
            </optgroup>
          )}
          {challenges.length > 0 && (
            <optgroup label="Challenges">
              {challenges.map((c) => (
                <option key={`chal-${c}`} value={`Challenge: ${c}`}>
                  {c}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {QUICK_AMOUNTS.map((amt) => (
          <button
            key={amt}
            disabled={busy || noReason}
            onClick={() => onAward(amt)}
            className="min-w-[64px] border border-blue-bright/50 bg-blue-bright/10 py-3 text-lg font-bold text-blue-bright transition-all hover:border-blue-bright hover:bg-blue-bright/20 hover:shadow-[0_0_16px_rgba(0,212,255,0.5)] disabled:opacity-50"
          >
            +{amt}
          </button>
        ))}
        <div className="mx-2 h-10 w-px bg-blue-accent/30" />
        <input
          type="number"
          placeholder="Custom"
          value={pointsInput}
          onChange={(e) => onPointsInputChange?.(e.target.value)}
          className="w-28 border border-blue-accent/40 bg-dark-bg/60 px-3 py-3 text-center text-base font-semibold tabular-nums text-white placeholder-gray-500 focus:border-blue-bright focus:outline-none"
        />
        <button
          disabled={busy || pointsInput === "" || noReason}
          onClick={() => submitCustom(1)}
          className={primaryBtnClass}
        >
          Award
        </button>
        <button
          disabled={busy || pointsInput === "" || noReason}
          onClick={() => submitCustom(-1)}
          className={dangerBtnClass}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default AwardCard;
```

- [ ] **Step 2: Verify type-check**

```bash
npx tsc --noEmit 2>&1 | grep "AwardCard" | head -10
```

Expected: Errors in `PlayersPanel.tsx` about `onAward` signature mismatch — will be fixed in next task.

- [ ] **Step 3: Commit**

```bash
git add src/components/adminPanel/players/AwardCard.tsx
git commit -m "feat: bifurcate AwardCard into staff-mode (fixed) and admin-mode (custom)"
```

---

## Task 8: Update PlayersPanel award/revoke logic

**Files:**
- Modify: `src/components/adminPanel/PlayersPanel.tsx`

- [ ] **Step 1: Replace the relevant imports and functions in PlayersPanel.tsx**

Replace the full file `src/components/adminPanel/PlayersPanel.tsx` with:

```typescript
import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "../../hooks/useAuth";
import { useChallenges } from "../../hooks/useChallenges";
import { useGames } from "../../hooks/useGames";
import {
  getPlayerById,
  type Player,
  usePlayers,
} from "../../hooks/usePlayers";
import {
  deleteActivitiesBy,
  getActivityTotal,
  recordActivity,
} from "../../hooks/usePlayerActivity";
import { useStaff } from "../../hooks/useStaff";
import { useUserRoles } from "../../hooks/useUserRoles";
import { ToastStack } from "./shared/ui";
import { useToasts } from "./shared/useToasts";
import AddPlayerModal from "./players/AddPlayerModal";
import AwardCard from "./players/AwardCard";
import PlayerDetailCard, {
  type DetailSection,
} from "./players/PlayerDetailCard";
import RosterRail, { type SortMode } from "./players/RosterRail";
import SelectionChips from "./players/SelectionChips";

const PlayersPanel: React.FC = () => {
  const { user } = useUser();
  const {
    players,
    addPlayer,
    patchPlayerById,
    removePlayerById,
    refresh: refreshPlayers,
  } = usePlayers();
  const { staff } = useStaff();
  const { games } = useGames();
  const { challenges } = useChallenges();
  const { isAdmin, isStaff, loading: rolesLoading } = useUserRoles();
  const { toasts, push, dismiss } = useToasts();

  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("points");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Admin-only award state
  const [pointsInput, setPointsInput] = useState("");
  const [awardReason, setAwardReason] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [openSection, setOpenSection] = useState<DetailSection>(null);
  const [editedPlayer, setEditedPlayer] = useState<Player | null>(null);
  const [busyAward, setBusyAward] = useState(false);
  const [busySave, setBusySave] = useState(false);

  /* ---------------------------- Derived state ---------------------------- */

  const currentStaff = useMemo(
    () => staff.find((m) => m.userId === user?.id),
    [user?.id, staff]
  );
  const staffName =
    currentStaff?.name || user?.username || user?.fullName || "Unknown Staff";

  const filteredPlayers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base =
      q.length === 0
        ? players
        : players.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              (p.username?.toLowerCase().includes(q) ?? false)
          );
    const sorted = [...base];
    if (sortMode === "points") sorted.sort((a, b) => b.points - a.points);
    else sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [players, query, sortMode]);

  const selectedPlayers = useMemo(
    () => players.filter((p) => selectedIds.has(p.id)),
    [players, selectedIds]
  );
  const singleSelected =
    selectedPlayers.length === 1 ? selectedPlayers[0] : null;

  useEffect(() => {
    if (singleSelected) {
      setEditedPlayer(singleSelected);
      setOpenSection(null);
    } else {
      setEditedPlayer(null);
    }
  }, [singleSelected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ------------------------------ Actions ------------------------------ */

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  /**
   * Staff path: amount and game/challenge are fixed by the staff member's
   * assignment. Checks per-player cap via player_activity, then inserts an
   * activity row and updates the player's total points.
   *
   * Admin path: amount comes from the UI (quick button or custom input).
   * No cap is enforced — admins can add or remove any amount.
   */
  const awardPoints = async (adminAmount?: number) => {
    if (selectedPlayers.length === 0) return;
    setBusyAward(true);

    const timestamp = new Date().toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

    try {
      if (!isAdmin) {
        // ── Staff path ──────────────────────────────────────────────────────
        if (
          !currentStaff?.assignmentId ||
          currentStaff.pointsPerAward === null ||
          currentStaff.maxPoints === null
        ) {
          push(
            "error",
            "You have no game/challenge assignment. Contact an admin."
          );
          return;
        }

        const amount = currentStaff.pointsPerAward;
        const gameId =
          currentStaff.assignmentType === "game"
            ? currentStaff.assignmentId
            : null;
        const challengeId =
          currentStaff.assignmentType === "challenge"
            ? currentStaff.assignmentId
            : null;
        const maxPts = currentStaff.maxPoints;
        const tag = currentStaff.assignmentName!;

        let succeeded = 0;
        let capped = 0;

        await Promise.all(
          selectedPlayers.map(async (player) => {
            try {
              const currentTotal = await getActivityTotal(
                player.id,
                gameId,
                challengeId
              );
              if (currentTotal + amount > maxPts) {
                capped++;
                return;
              }
              if (!user?.id) return;
              await recordActivity(
                player.id,
                gameId,
                challengeId,
                amount,
                user.id
              );
              const fresh = await getPlayerById(player.id);
              if (!fresh) return;
              await patchPlayerById(player.id, {
                points: fresh.points + amount,
                log: [
                  ...fresh.log,
                  `${staffName}[${tag}] gave ${fresh.name} ${amount} pts on ${timestamp}`,
                ],
              });
              succeeded++;
            } catch (err) {
              push(
                "error",
                `Failed for ${player.name}: ${
                  err instanceof Error ? err.message : "error"
                }`
              );
            }
          })
        );

        const freshForEdit = singleSelected
          ? await getPlayerById(singleSelected.id)
          : null;
        await refreshPlayers();
        setBusyAward(false);
        if (freshForEdit) setEditedPlayer(freshForEdit);

        if (succeeded > 0) {
          push(
            "success",
            `${amount} pts awarded to ${succeeded} player${
              succeeded === 1 ? "" : "s"
            }`
          );
        }
        if (capped > 0) {
          push(
            "info",
            `Skipped ${capped} — already at or near the ${maxPts}-pt cap for ${tag}`
          );
        }
      } else {
        // ── Admin path ──────────────────────────────────────────────────────
        const amount = adminAmount ?? 0;
        if (amount === 0) return;

        if (!awardReason) {
          push("error", "Select a Game or Challenge first.");
          return;
        }
        if (amount < 0 && selectedPlayers.some((p) => p.points + amount < 0)) {
          push("error", "Cannot remove — some players would go below 0.");
          return;
        }

        let succeeded = 0;

        await Promise.all(
          selectedPlayers.map(async (player) => {
            try {
              const fresh = await getPlayerById(player.id);
              if (!fresh) return;
              const tag = "ADMIN";
              await patchPlayerById(player.id, {
                points: fresh.points + amount,
                log: [
                  ...fresh.log,
                  `${staffName}[${tag}] gave ${fresh.name} ${amount} pts on ${timestamp} for ${awardReason}`,
                ],
              });
              succeeded++;
            } catch (err) {
              push(
                "error",
                `Failed for ${player.name}: ${
                  err instanceof Error ? err.message : "error"
                }`
              );
            }
          })
        );

        const freshForEdit = singleSelected
          ? await getPlayerById(singleSelected.id)
          : null;
        await refreshPlayers();
        setPointsInput("");
        setBusyAward(false);
        if (freshForEdit) setEditedPlayer(freshForEdit);

        if (succeeded > 0) {
          const verb = amount > 0 ? "awarded to" : "removed from";
          push(
            "success",
            `${Math.abs(amount)} pts ${verb} ${succeeded} player${
              succeeded === 1 ? "" : "s"
            }`
          );
        }
      }
    } finally {
      setBusyAward(false);
    }
  };

  const revokeMyAssignment = async (player: Player) => {
    if (!currentStaff?.assignmentId || !user?.id) return;

    const gameId =
      currentStaff.assignmentType === "game"
        ? currentStaff.assignmentId
        : null;
    const challengeId =
      currentStaff.assignmentType === "challenge"
        ? currentStaff.assignmentId
        : null;

    try {
      const pointsToRevoke = await deleteActivitiesBy(
        player.id,
        user.id,
        gameId,
        challengeId
      );

      if (pointsToRevoke === 0) {
        push("info", "No awards to revoke for this player.");
        return;
      }

      const fresh = await getPlayerById(player.id);
      if (!fresh) return;

      const timestamp = new Date().toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
      const revoked = await patchPlayerById(player.id, {
        points: Math.max(0, fresh.points - pointsToRevoke),
        log: [
          ...fresh.log,
          `${staffName}[${currentStaff.assignmentName}] revoked ${pointsToRevoke} pts from ${fresh.name} on ${timestamp}`,
        ],
      });
      await refreshPlayers();
      setEditedPlayer(revoked);
      push("success", `Revoked ${pointsToRevoke} pts from ${player.name}`);
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Could not revoke.");
    }
  };

  const saveEdits = async () => {
    if (!editedPlayer || !singleSelected) return;
    setBusySave(true);
    const snapshot = editedPlayer;
    const timestamp = new Date().toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const editor = user?.username || user?.fullName || "Unknown User";
    const removedCount = singleSelected.log.filter(
      (e) => !snapshot.log.includes(e)
    ).length;
    const auditEntry =
      removedCount > 0
        ? `${editor} removed ${removedCount} log ${
            removedCount === 1 ? "entry" : "entries"
          } from ${singleSelected.name} on ${timestamp}`
        : `Player updated by ${editor} on ${timestamp}`;
    try {
      const updated = await patchPlayerById(singleSelected.id, {
        points: snapshot.points,
        log: [...snapshot.log, auditEntry],
        participation: snapshot.participation,
        teamAssignments: snapshot.teamAssignments,
      });
      await refreshPlayers();
      setEditedPlayer((current) =>
        current === snapshot ? updated : current
      );
      push("success", `Saved changes to ${updated.name}`);
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusySave(false);
    }
  };

  const handleRemovePlayer = async (player: Player) => {
    if (!isAdmin) return;
    if (!window.confirm(`Really remove ${player.name}? This is permanent.`))
      return;
    try {
      await removePlayerById(player.id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(player.id);
        return next;
      });
      push("success", `Removed ${player.name}`);
    } catch {
      push("error", "Could not remove player.");
    }
  };

  const handleRegister = async (
    userId: string,
    game: string,
    team: string
  ) => {
    try {
      await addPlayer({
        userId,
        teamAssignments: game && team ? [{ game, team }] : [],
      });
      push("success", `Registered player`);
      setShowAddModal(false);
    } catch (err) {
      push(
        "error",
        err instanceof Error ? err.message : "Failed to register player"
      );
    }
  };

  /* ------------------------------- Render ------------------------------- */

  if (rolesLoading)
    return <div className="p-4 text-gray-300">Loading permissions...</div>;
  if (!isStaff)
    return (
      <div className="p-4 font-semibold text-red-300">
        You are not authorized to access this panel.
      </div>
    );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px,1fr]">
      <RosterRail
        players={filteredPlayers}
        totalCount={players.length}
        selectedIds={selectedIds}
        query={query}
        onQueryChange={setQuery}
        sortMode={sortMode}
        onSortChange={setSortMode}
        onToggleSelect={toggleSelect}
        onAddClick={() => setShowAddModal(true)}
      />

      <section className="relative flex flex-col gap-4">
        <ToastStack
          toasts={toasts}
          onDismiss={dismiss}
          className="pointer-events-none absolute right-0 top-0 z-10 flex flex-col gap-2"
        />
        {selectedPlayers.length === 0 && (
          <div className="flex items-center justify-center border border-dashed border-blue-accent/25 bg-navy-blue/20 p-10 text-center">
            <div>
              <div className="font-zuume text-3xl font-bold uppercase tracking-wider text-gray-400">
                Select a Player
              </div>
              <p className="mt-2 text-sm text-gray-400">
                Click any name on the left to award points or edit details.
              </p>
            </div>
          </div>
        )}

        {selectedPlayers.length > 0 && (
          <>
            <SelectionChips
              selected={selectedPlayers}
              onToggle={toggleSelect}
              onClear={clearSelection}
            />
            <AwardCard
              isAdmin={isAdmin}
              busy={busyAward}
              onAward={awardPoints}
              // Staff-mode props
              assignmentName={currentStaff?.assignmentName}
              pointsPerAward={currentStaff?.pointsPerAward}
              maxPoints={currentStaff?.maxPoints}
              // Admin-mode props
              games={games.map((g) => g.name)}
              challenges={challenges.map((c) => c.name)}
              selectedReason={awardReason}
              onSelectedReasonChange={setAwardReason}
              pointsInput={pointsInput}
              onPointsInputChange={setPointsInput}
            />
          </>
        )}

        {singleSelected && editedPlayer && (
          <PlayerDetailCard
            player={singleSelected}
            edited={editedPlayer}
            onEdit={setEditedPlayer}
            openSection={openSection}
            onOpenSection={setOpenSection}
            isAdmin={isAdmin}
            staffAssignment={currentStaff?.assignmentName ?? "staff"}
            games={games}
            busySave={busySave}
            onSave={() => void saveEdits()}
            onRemove={() => void handleRemovePlayer(singleSelected)}
            onRevoke={() => void revokeMyAssignment(singleSelected)}
          />
        )}
      </section>

      {showAddModal && (
        <AddPlayerModal
          games={games.map((g) => g.name)}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleRegister}
        />
      )}
    </div>
  );
};

export default PlayersPanel;
```

- [ ] **Step 2: Verify type-check**

```bash
npx tsc --noEmit 2>&1 | grep -v "node_modules" | head -30
```

Expected: Errors should be limited to `StaffPanel.tsx` (uses `assignment` field that no longer exists) — fixed in Task 9.

- [ ] **Step 3: Commit**

```bash
git add src/components/adminPanel/PlayersPanel.tsx
git commit -m "feat: update PlayersPanel award/revoke to use structured player_activity system"
```

---

## Task 9: Update StaffPanel

**Files:**
- Modify: `src/components/adminPanel/StaffPanel.tsx`

- [ ] **Step 1: Replace StaffPanel.tsx**

The assignment column is now a dropdown of games + challenges (instead of a free-text input). Each row also shows the points-per-award and cap info.

Replace `src/components/adminPanel/StaffPanel.tsx` with:

```typescript
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useChallenges } from "../../hooks/useChallenges";
import { useGames } from "../../hooks/useGames";
import { useStaff } from "../../hooks/useStaff";
import { useUserRoles } from "../../hooks/useUserRoles";
import { Field, SectionTitle, ToastStack } from "./shared/ui";
import { useToasts } from "./shared/useToasts";
import {
  dangerBtnClass,
  ghostBtnClass,
  inputClass,
  primaryBtnClass,
} from "./shared/styles";

type UserOption = {
  id: string;
  name: string;
  username: string | null;
};

// Represents the value chosen in the assignment dropdown.
// "" = no assignment (floater), "game:<uuid>" or "challenge:<uuid>" otherwise.
type AssignmentValue = string;

const parseAssignmentValue = (
  value: AssignmentValue
): { gameId: string | null; challengeId: string | null } => {
  if (value.startsWith("game:"))
    return { gameId: value.slice(5), challengeId: null };
  if (value.startsWith("challenge:"))
    return { gameId: null, challengeId: value.slice(10) };
  return { gameId: null, challengeId: null };
};

const StaffPanel: React.FC = () => {
  const {
    staff,
    addStaffMember,
    patchStaffByUserId,
    removeStaffByUserId,
  } = useStaff();
  const { games } = useGames();
  const { challenges } = useChallenges();
  const { isAdmin } = useUserRoles();
  const { toasts, push, dismiss } = useToasts();

  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  // Maps userId → pending assignment dropdown value (if user is editing inline)
  const [editingBuffer, setEditingBuffer] = useState<Record<string, AssignmentValue>>({});

  // Add-modal state
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newAssignmentValue, setNewAssignmentValue] = useState<AssignmentValue>("");
  const [searching, setSearching] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.assignmentName || "").toLowerCase().includes(q)
    );
  }, [staff, query]);

  // Build a helper: staffMember.assignmentId → dropdown value string
  const staffAssignmentValue = (userId: string): AssignmentValue => {
    const member = staff.find((m) => m.userId === userId);
    if (!member?.assignmentId) return "";
    return member.assignmentType === "game"
      ? `game:${member.assignmentId}`
      : `challenge:${member.assignmentId}`;
  };

  useEffect(() => {
    if (!showAddModal) return;
    let cancelled = false;
    const q = userQuery.trim();
    if (q.length < 2) {
      setUserResults([]);
      return;
    }
    setSearching(true);
    const handle = setTimeout(async () => {
      const { data } = await supabase
        .from("users")
        .select("id, username, fname, lname")
        .or(`username.ilike.%${q}%,fname.ilike.%${q}%,lname.ilike.%${q}%`)
        .limit(20);
      if (cancelled) return;
      const claimed = new Set(staff.map((s) => s.userId));
      setUserResults(
        (data || [])
          .filter((u) => !claimed.has(u.id))
          .map((u) => ({
            id: u.id,
            name:
              [u.fname, u.lname].filter(Boolean).join(" ") ||
              u.username ||
              "Unknown",
            username: u.username,
          }))
      );
      setSearching(false);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [userQuery, showAddModal, staff]);

  const resetAddModal = () => {
    setShowAddModal(false);
    setUserQuery("");
    setUserResults([]);
    setSelectedUserId("");
    setNewAssignmentValue("");
  };

  const handleAdd = async () => {
    if (!selectedUserId) {
      push("error", "Please pick a user.");
      return;
    }
    const { gameId, challengeId } = parseAssignmentValue(newAssignmentValue);
    try {
      await addStaffMember({
        userId: selectedUserId,
        gameAssignmentId: gameId,
        challengeAssignmentId: challengeId,
      });
      push("success", "Added to staff");
      resetAddModal();
    } catch (err) {
      push(
        "error",
        err instanceof Error ? err.message : "Failed to add staff."
      );
    }
  };

  const handlePatchAssignment = async (userId: string) => {
    const nextValue = editingBuffer[userId];
    if (nextValue === undefined) return;
    const { gameId, challengeId } = parseAssignmentValue(nextValue);
    try {
      await patchStaffByUserId(userId, {
        gameAssignmentId: gameId,
        challengeAssignmentId: challengeId,
      });
      push("success", "Updated assignment");
      setEditingBuffer((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Failed to update.");
    }
  };

  const handleRemove = async (userId: string, name: string) => {
    if (!isAdmin) return;
    if (!window.confirm(`Remove ${name} from staff?`)) return;
    try {
      await removeStaffByUserId(userId);
      push("success", `Removed ${name}`);
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Failed to remove.");
    }
  };

  // Shared assignment dropdown used in both the list and the add-modal.
  const AssignmentSelect: React.FC<{
    value: AssignmentValue;
    onChange: (v: AssignmentValue) => void;
    className?: string;
  }> = ({ value, onChange, className = "" }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`border bg-dark-bg/60 px-3 py-2 text-sm font-semibold text-white focus:outline-none border-blue-accent/40 focus:border-blue-bright ${className}`}
    >
      <option value="">No assignment (floater)</option>
      {games.length > 0 && (
        <optgroup label="Games">
          {games.map((g) => (
            <option key={`game-${g.id}`} value={`game:${g.id}`}>
              {g.name} ({g.pointsPerAward} pts, cap {g.maxPoints})
            </option>
          ))}
        </optgroup>
      )}
      {challenges.length > 0 && (
        <optgroup label="Challenges">
          {challenges.map((c) => (
            <option key={`challenge-${c.id}`} value={`challenge:${c.id}`}>
              {c.name} ({c.pointsPerAward} pts, cap {c.maxPoints})
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );

  return (
    <div>
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <SectionTitle
        eyebrow="Personnel"
        right={
          <button
            onClick={() => setShowAddModal(true)}
            className={primaryBtnClass}
          >
            + Add Staff
          </button>
        }
      >
        Staff Roster
      </SectionTitle>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or assignment..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="border border-blue-accent/20 bg-navy-blue/40">
        <div className="grid grid-cols-[1fr,2fr,auto] items-center gap-4 border-b border-blue-accent/20 bg-dark-navy/40 px-5 py-3 font-bayon text-xs uppercase tracking-[0.25em] text-blue-bright/80">
          <span>Name</span>
          <span>Assignment</span>
          <span className="pr-2">Actions</span>
        </div>
        {filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-400">
            No staff match.
          </div>
        )}
        {filtered.map((member) => {
          const currentDropdownValue =
            editingBuffer[member.userId] !== undefined
              ? editingBuffer[member.userId]
              : staffAssignmentValue(member.userId);
          const savedDropdownValue = staffAssignmentValue(member.userId);
          const dirty =
            editingBuffer[member.userId] !== undefined &&
            editingBuffer[member.userId] !== savedDropdownValue;

          return (
            <div
              key={member.userId}
              className="grid grid-cols-[1fr,2fr,auto] items-center gap-4 border-b border-blue-accent/10 px-5 py-3 last:border-b-0 hover:bg-white/[0.03]"
            >
              <div className="truncate text-base font-medium text-white">
                {member.name}
              </div>
              <div className="flex items-center gap-2">
                <AssignmentSelect
                  value={currentDropdownValue}
                  onChange={(v) =>
                    setEditingBuffer((prev) => ({
                      ...prev,
                      [member.userId]: v,
                    }))
                  }
                  className={`flex-1 ${dirty ? "border-amber-400/60" : ""}`}
                />
                {dirty && (
                  <button
                    onClick={() => void handlePatchAssignment(member.userId)}
                    className={`${primaryBtnClass} text-xs`}
                  >
                    Save
                  </button>
                )}
              </div>
              {isAdmin && (
                <button
                  onClick={() => void handleRemove(member.userId, member.name)}
                  className={dangerBtnClass}
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={resetAddModal}
        >
          <div
            className="w-full max-w-md border border-blue-bright/40 bg-navy-blue shadow-[0_0_60px_rgba(0,212,255,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-blue-accent/20 bg-dark-navy/60 px-5 py-4">
              <h3 className="font-zuume text-2xl font-bold uppercase tracking-wider text-white">
                Add Staff Member
              </h3>
              <button
                onClick={resetAddModal}
                className="text-gray-300 hover:text-red-300"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 p-5">
              <Field label="Find User *">
                <input
                  autoFocus
                  type="text"
                  value={userQuery}
                  onChange={(e) => {
                    setUserQuery(e.target.value);
                    setSelectedUserId("");
                  }}
                  placeholder="Search by name or username…"
                  className={inputClass}
                />
              </Field>
              {userQuery.trim().length >= 2 && (
                <div className="max-h-48 overflow-y-auto border border-blue-accent/20 bg-dark-bg/40">
                  {searching && (
                    <div className="p-3 text-sm text-gray-400">
                      Searching…
                    </div>
                  )}
                  {!searching && userResults.length === 0 && (
                    <div className="p-3 text-sm text-gray-400">
                      No eligible users match.
                    </div>
                  )}
                  {!searching &&
                    userResults.map((u) => {
                      const active = u.id === selectedUserId;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setSelectedUserId(u.id)}
                          className={`flex w-full items-center justify-between gap-3 border-b border-blue-accent/10 px-3 py-2 text-left text-sm last:border-b-0 ${
                            active
                              ? "bg-blue-bright/10 text-blue-bright"
                              : "text-gray-100 hover:bg-white/[0.04]"
                          }`}
                        >
                          <span className="font-medium">{u.name}</span>
                          {u.username && u.username !== u.name && (
                            <span className="text-xs text-gray-400">
                              @{u.username}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              )}
              <Field label="Assignment (optional)">
                <AssignmentSelect
                  value={newAssignmentValue}
                  onChange={setNewAssignmentValue}
                  className="w-full"
                />
              </Field>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-blue-accent/20 bg-dark-navy/60 px-5 py-3">
              <button onClick={resetAddModal} className={ghostBtnClass}>
                Cancel
              </button>
              <button
                disabled={!selectedUserId}
                onClick={() => void handleAdd()}
                className={primaryBtnClass}
              >
                Add Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPanel;
```

- [ ] **Step 2: Verify type-check**

```bash
npx tsc --noEmit 2>&1 | grep -v "node_modules" | head -30
```

Expected: Zero or near-zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/adminPanel/StaffPanel.tsx
git commit -m "feat: replace free-text staff assignment with game/challenge dropdown picker"
```

---

## Task 10: Update GameEditorPanel — points config

**Files:**
- Modify: `src/components/adminPanel/GameEditorPanel.tsx`

- [ ] **Step 1: Replace GameEditorPanel.tsx**

The list now shows `points_per_award` and `max_points` with inline editing. The add form gains optional numeric inputs for these fields.

Replace `src/components/adminPanel/GameEditorPanel.tsx` with:

```typescript
import React, { useState } from "react";
import { useChallenges } from "../../hooks/useChallenges";
import { useGames } from "../../hooks/useGames";
import { SectionTitle, ToastStack } from "./shared/ui";
import { useToasts } from "./shared/useToasts";
import { dangerBtnClass, inputClass, primaryBtnClass } from "./shared/styles";

type EntityKind = "game" | "challenge";

// Buffer for inline point-config edits.
type PointConfigBuffer = {
  pointsPerAward: string;
  maxPoints: string;
};

const GameEditorPanel: React.FC = () => {
  const { games, loading: gamesLoading, addGame, patchGameByName, removeGameByName } = useGames();
  const {
    challenges,
    loading: challengesLoading,
    addChallenge,
    patchChallengeById,
    removeChallengeByName,
  } = useChallenges();
  const { toasts, push, dismiss } = useToasts();

  const [activeKind, setActiveKind] = useState<EntityKind>("game");
  const [newName, setNewName] = useState("");
  const [newPtsPerAward, setNewPtsPerAward] = useState("10");
  const [newMaxPts, setNewMaxPts] = useState("50");
  // Keyed by game/challenge id → pending edits
  const [editBuffer, setEditBuffer] = useState<Record<string, PointConfigBuffer>>({});

  const isGame = activeKind === "game";
  const list = isGame ? games : challenges;
  const loading = isGame ? gamesLoading : challengesLoading;
  const kindLabel = isGame ? "Game" : "Challenge";

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    const pts = parseInt(newPtsPerAward, 10) || 10;
    const cap = parseInt(newMaxPts, 10) || 50;
    try {
      if (isGame) await addGame(name, pts, cap);
      else await addChallenge({ name, pointsPerAward: pts, maxPoints: cap });
      push("success", `Added ${kindLabel.toLowerCase()}: ${name}`);
      setNewName("");
      setNewPtsPerAward("10");
      setNewMaxPts("50");
    } catch (err) {
      push(
        "error",
        err instanceof Error ? err.message : `Failed to add ${kindLabel.toLowerCase()}.`
      );
    }
  };

  const handleRemove = async (name: string) => {
    if (!window.confirm(`Delete ${kindLabel.toLowerCase()} '${name}'?`)) return;
    try {
      if (isGame) await removeGameByName(name);
      else await removeChallengeByName(name);
      push("success", `Removed ${name}`);
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Failed to remove.");
    }
  };

  const handleSavePointConfig = async (item: { id: string; name: string }) => {
    const buf = editBuffer[item.id];
    if (!buf) return;
    const pts = parseInt(buf.pointsPerAward, 10);
    const cap = parseInt(buf.maxPoints, 10);
    if (isNaN(pts) || isNaN(cap) || pts < 1 || cap < pts) {
      push("error", "Invalid config — pts must be ≥ 1 and cap must be ≥ pts per award.");
      return;
    }
    try {
      if (isGame) {
        await patchGameByName(item.name, { pointsPerAward: pts, maxPoints: cap });
      } else {
        await patchChallengeById(item.id, { pointsPerAward: pts, maxPoints: cap });
      }
      push("success", "Updated point config");
      setEditBuffer((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Failed to update.");
    }
  };

  return (
    <div>
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <SectionTitle eyebrow="Event Content">Games & Challenges</SectionTitle>

      {/* Kind switcher */}
      <div className="mb-5 inline-flex border border-blue-accent/30 bg-dark-navy/40">
        {(
          [
            ["game", `Games (${games.length})`],
            ["challenge", `Challenges (${challenges.length})`],
          ] as const
        ).map(([kind, label]) => (
          <button
            key={kind}
            onClick={() => {
              setActiveKind(kind);
              setNewName("");
            }}
            className={`px-5 py-2 font-bayon text-sm uppercase tracking-[0.25em] transition-colors ${
              activeKind === kind
                ? "bg-blue-bright/10 text-blue-bright"
                : "text-gray-300 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Add row */}
      <div className="mb-5 flex flex-wrap items-center gap-2 border border-blue-accent/20 bg-navy-blue/40 p-4">
        <input
          type="text"
          placeholder={`New ${kindLabel.toLowerCase()} name`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void handleAdd()}
          className={`flex-1 min-w-[160px] ${inputClass}`}
        />
        <label className="flex items-center gap-1 text-xs text-gray-400">
          Pts/award
          <input
            type="number"
            min={1}
            value={newPtsPerAward}
            onChange={(e) => setNewPtsPerAward(e.target.value)}
            className={`w-16 ${inputClass}`}
          />
        </label>
        <label className="flex items-center gap-1 text-xs text-gray-400">
          Cap
          <input
            type="number"
            min={1}
            value={newMaxPts}
            onChange={(e) => setNewMaxPts(e.target.value)}
            className={`w-16 ${inputClass}`}
          />
        </label>
        <button
          disabled={!newName.trim()}
          onClick={() => void handleAdd()}
          className={primaryBtnClass}
        >
          + Add {kindLabel}
        </button>
      </div>

      {/* List */}
      <div className="border border-blue-accent/20 bg-navy-blue/40">
        <div className="grid grid-cols-[auto,1fr,auto,auto,auto] items-center gap-3 border-b border-blue-accent/20 bg-dark-navy/40 px-5 py-3 font-bayon text-xs uppercase tracking-[0.25em] text-blue-bright/80">
          <span>#</span>
          <span>Name</span>
          <span>Pts/Award</span>
          <span>Cap</span>
          <span>Actions</span>
        </div>
        {loading && (
          <div className="p-6 text-center text-sm text-gray-400">Loading…</div>
        )}
        {!loading && list.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-400">
            No {kindLabel.toLowerCase()}s yet. Add one above.
          </div>
        )}
        {list.map((item, idx) => {
          const buf = editBuffer[item.id];
          const ptsValue = buf ? buf.pointsPerAward : String(item.pointsPerAward);
          const capValue = buf ? buf.maxPoints : String(item.maxPoints);
          const dirty = buf !== undefined;

          return (
            <div
              key={item.id}
              className="grid grid-cols-[auto,1fr,auto,auto,auto] items-center gap-3 border-b border-blue-accent/10 px-5 py-3 last:border-b-0 hover:bg-white/[0.03]"
            >
              <span className="w-6 font-bayon text-sm tabular-nums text-gray-500">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="truncate text-base font-medium text-white">
                {item.name}
              </span>
              <input
                type="number"
                min={1}
                value={ptsValue}
                onChange={(e) =>
                  setEditBuffer((prev) => ({
                    ...prev,
                    [item.id]: {
                      pointsPerAward: e.target.value,
                      maxPoints: prev[item.id]?.maxPoints ?? capValue,
                    },
                  }))
                }
                className={`w-16 ${inputClass} ${dirty ? "border-amber-400/60" : ""}`}
              />
              <input
                type="number"
                min={1}
                value={capValue}
                onChange={(e) =>
                  setEditBuffer((prev) => ({
                    ...prev,
                    [item.id]: {
                      pointsPerAward: prev[item.id]?.pointsPerAward ?? ptsValue,
                      maxPoints: e.target.value,
                    },
                  }))
                }
                className={`w-16 ${inputClass} ${dirty ? "border-amber-400/60" : ""}`}
              />
              <div className="flex items-center gap-2">
                {dirty && (
                  <button
                    onClick={() => void handleSavePointConfig(item)}
                    className={`${primaryBtnClass} text-xs`}
                  >
                    Save
                  </button>
                )}
                <button
                  onClick={() => void handleRemove(item.name)}
                  className={dangerBtnClass}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameEditorPanel;
```

- [ ] **Step 2: Verify clean type-check**

```bash
npx tsc --noEmit 2>&1 | grep -v "node_modules"
```

Expected: Zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/adminPanel/GameEditorPanel.tsx
git commit -m "feat: add inline points_per_award and max_points editing to GameEditorPanel"
```

---

## Task 11: Smoke-test the full flow

No automated test framework exists. Verify manually with `npm run dev`.

- [ ] **Step 1: Start dev server**

```bash
cd /Users/kevinhu/Programming/GTEsports/gamefest
npm run dev
```

- [ ] **Step 2: Verify GameEditorPanel**

1. Open admin panel → Games & Challenges tab.
2. Existing games should show `10` in Pts/Award and `50` in Cap (migration defaults).
3. Edit one game's pts to `15`, cap to `75` → click Save → values persist on refresh.
4. Add a new game with `name=TestGame`, pts=`5`, cap=`20` → appears in list with correct values.
5. Delete TestGame.

- [ ] **Step 3: Verify StaffPanel assignment picker**

1. Open admin panel → Staff tab.
2. Existing staff members should show "No assignment (floater)" in the dropdown.
3. Change a staff member's assignment to a game → click Save → row updates.
4. Add a new staff member → modal shows game/challenge dropdown instead of free-text input.

- [ ] **Step 4: Verify staff award flow (non-admin view)**

1. Sign in as a user with staff role (no admin).
2. Open Players panel → select a player.
3. AwardCard should show: "Your Assignment: [game name]", "10 pts per award · cap: 50 pts per player".
4. Click "Award 10 pts" → player gains 10 points. Toast says "10 pts awarded to 1 player".
5. Click again → player gains another 10 pts (now at 20/50 cap).
6. Award until cap → next attempt skips with "Skipped 1 — already at or near the 50-pt cap" toast.

- [ ] **Step 5: Verify admin award flow**

1. Sign in as admin.
2. AwardCard shows the full UI: reason dropdown + quick buttons + custom input + Remove button.
3. Award 25 pts for a game → player gains 25 pts. No cap enforced.
4. Remove 5 pts → player loses 5 pts.

- [ ] **Step 6: Verify revoke (staff)**

1. As staff, award a player 10 pts.
2. Open PlayerDetailCard → click Revoke.
3. Player loses 10 pts. Toast confirms revocation. A log entry is appended.

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: smoke-test verified — structured point awards feature complete"
```

---

## Spec Coverage Check

| Requirement | Covered by |
|-------------|-----------|
| Staff cannot enter custom point amounts | Task 7 (AwardCard staff mode hides custom input) |
| Admins can add/remove arbitrary points | Task 7 (AwardCard admin mode) + Task 8 (PlayersPanel admin path) |
| Staff assigned to one game/challenge (not arbitrary string) | Task 5 (StaffSchema FK columns) + Task 9 (StaffPanel picker) |
| Points per award fixed by game/challenge | Task 3+4 (pointsPerAward on Game/Challenge) + Task 8 (staff uses fixed amount) |
| Players can receive points multiple times | Task 8 (no participation-array block; only cap check) |
| Per-player per-game/challenge cap | Task 6 (getActivityTotal) + Task 8 (cap check before award) |
| Admin can configure pts/award and cap per game/challenge | Task 3+4 (CRUD) + Task 10 (GameEditorPanel UI) |
| Floater staff (no award privilege) | Task 7 (AwardCard shows "no assignment" message when assignmentId is null) |
| Audit log maintained | Task 8 (log entries appended on every award/revoke) |
