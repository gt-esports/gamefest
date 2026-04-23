# Multi-Assignment Staff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow staff members to be assigned to multiple games/challenges, with a per-assignment selector in the award UI.

**Architecture:** A new `staff_assignments` junction table replaces the two FK columns on `user_roles`. The `useStaff` hook fetches staff + assignments in two queries and merges them in JS. `StaffPanel` gets an inline multi-assignment manager per row; `PlayersPanel` tracks `activeAssignmentId` state and passes the active assignment down to `AwardCard`, which renders a pill selector when two or more assignments exist.

**Tech Stack:** React 18, TypeScript, Supabase (PostgreSQL + PostgREST), Tailwind CSS

---

## File Map

| File | Change |
|------|--------|
| Supabase SQL editor | Run migration once |
| `src/types/database.types.ts` | Add `staff_assignments` table type; drop FK columns from `user_roles` |
| `src/schemas/StaffSchema.ts` | Add `StaffAssignment` type; replace flat fields on `StaffMember` |
| `src/hooks/useStaff.ts` | Full rewrite — two-query fetch, new `addAssignment`/`removeAssignment` |
| `src/components/adminPanel/StaffPanel.tsx` | Replace single dropdown with badge list + inline add flow; simplify add modal |
| `src/components/adminPanel/PlayersPanel.tsx` | Add `activeAssignmentId` state; update `awardPoints`, `revokeMyAssignment`, prop passing |
| `src/components/adminPanel/players/AwardCard.tsx` | Replace `assignmentName`/`maxPoints` props with `assignments[]` + selector |

---

## Task 1: Run DB Migration in Supabase

**Files:**
- Run in Supabase SQL editor (Dashboard → SQL Editor → New query)

- [ ] **Step 1: Open Supabase SQL editor and run the migration**

```sql
-- 1. Create the new junction table
CREATE TABLE IF NOT EXISTS public.staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_roles(user_id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  CONSTRAINT exactly_one_assignment CHECK (
    (game_id IS NOT NULL)::int + (challenge_id IS NOT NULL)::int = 1
  )
);

-- 2. Copy existing single game assignments
INSERT INTO public.staff_assignments (user_id, game_id)
SELECT user_id, game_assignment_id
FROM public.user_roles
WHERE game_assignment_id IS NOT NULL;

-- 3. Copy existing single challenge assignments
INSERT INTO public.staff_assignments (user_id, challenge_id)
SELECT user_id, challenge_assignment_id
FROM public.user_roles
WHERE challenge_assignment_id IS NOT NULL;

-- 4. Drop the now-redundant FK columns
ALTER TABLE public.user_roles
  DROP COLUMN IF EXISTS game_assignment_id,
  DROP COLUMN IF EXISTS challenge_assignment_id;
```

- [ ] **Step 2: Verify migration succeeded**

Run in SQL editor:
```sql
SELECT * FROM public.staff_assignments LIMIT 10;
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_roles' AND column_name IN ('game_assignment_id', 'challenge_assignment_id');
-- Should return 0 rows (columns are gone)
```

---

## Task 2: Update `database.types.ts`

**Files:**
- Modify: `src/types/database.types.ts`

- [ ] **Step 1: Add `staff_assignments` table type**

After the closing `};` of the `registrations` table entry (around line 226, before `user_roles`), insert:

```typescript
      staff_assignments: {
        Row: {
          id: string;
          user_id: string;
          game_id: string | null;
          challenge_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id?: string | null;
          challenge_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_id?: string | null;
          challenge_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "staff_assignments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_roles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "staff_assignments_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_assignments_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "challenges";
            referencedColumns: ["id"];
          }
        ];
      };
```

- [ ] **Step 2: Remove dropped columns from `user_roles`**

Replace the `user_roles` table entry. Find this block (lines ~227–275):

```typescript
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
```

Replace with:

```typescript
      user_roles: {
        Row: {
          assignment: string | null;
          created_at: string;
          role: string;
          user_id: string;
        };
        Insert: {
          assignment?: string | null;
          created_at?: string;
          role: string;
          user_id: string;
        };
        Update: {
          assignment?: string | null;
          created_at?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
```

- [ ] **Step 3: Commit**

```bash
git add src/types/database.types.ts
git commit -m "chore: update DB types for staff_assignments migration"
```

---

## Task 3: Update `StaffSchema.ts`

**Files:**
- Modify: `src/schemas/StaffSchema.ts`

- [ ] **Step 1: Replace the entire file contents**

```typescript
export type StaffAssignment = {
  id: string;
  type: 'game' | 'challenge';
  assignmentId: string;
  assignmentName: string;
  pointsPerAward: number;
  maxPoints: number;
};

export type StaffMember = {
  userId: string;
  role: 'staff' | 'admin';
  name: string;
  assignments: StaffAssignment[];
};
```

- [ ] **Step 2: Commit**

```bash
git add src/schemas/StaffSchema.ts
git commit -m "feat: update StaffMember type to support multiple assignments"
```

---

## Task 4: Rewrite `useStaff.ts`

**Files:**
- Modify: `src/hooks/useStaff.ts`

- [ ] **Step 1: Replace the entire file contents**

```typescript
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import type { StaffAssignment, StaffMember } from "../schemas/StaffSchema";

type UserRoleRow = {
  user_id: string;
  role: string;
  users:
    | { username: string | null; fname: string | null; lname: string | null }
    | Array<{ username: string | null; fname: string | null; lname: string | null }>
    | null;
};

type GameOrChallengeData = {
  id: string;
  name: string;
  points_per_award: number;
  max_points: number;
} | null;

type StaffAssignmentRow = {
  id: string;
  user_id: string;
  game_id: string | null;
  challenge_id: string | null;
  games: GameOrChallengeData | GameOrChallengeData[];
  challenges: GameOrChallengeData | GameOrChallengeData[];
};

const unwrap = <T>(v: T | T[] | null | undefined): T | null => {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
};

export const fetchStaff = async (): Promise<StaffMember[]> => {
  const { data: rolesData, error: rolesError } = await supabase
    .from("user_roles")
    .select("user_id, role, users(username, fname, lname)")
    .in("role", ["staff", "admin"]);

  if (rolesError) throw rolesError;

  const roleRows = (rolesData || []) as unknown as UserRoleRow[];
  if (roleRows.length === 0) return [];

  const userIds = roleRows.map((r) => r.user_id);

  const { data: assignData, error: assignError } = await supabase
    .from("staff_assignments")
    .select(
      "id, user_id, game_id, challenge_id, games(id, name, points_per_award, max_points), challenges(id, name, points_per_award, max_points)"
    )
    .in("user_id", userIds);

  if (assignError) throw assignError;

  const assignRows = (assignData || []) as unknown as StaffAssignmentRow[];

  const assignmentsByUser = new Map<string, StaffAssignment[]>();
  for (const row of assignRows) {
    const game = unwrap(row.games);
    const challenge = unwrap(row.challenges);
    const entity = game ?? challenge;
    if (!entity) continue;

    const assignment: StaffAssignment = {
      id: row.id,
      type: game ? "game" : "challenge",
      assignmentId: entity.id,
      assignmentName: entity.name,
      pointsPerAward: entity.points_per_award,
      maxPoints: entity.max_points,
    };

    const list = assignmentsByUser.get(row.user_id) ?? [];
    list.push(assignment);
    assignmentsByUser.set(row.user_id, list);
  }

  const staff: StaffMember[] = roleRows.map((row) => {
    const user = unwrap(row.users);
    const full = [user?.fname, user?.lname].filter(Boolean).join(" ");
    return {
      userId: row.user_id,
      role: (row.role === "admin" ? "admin" : "staff") as "staff" | "admin",
      name: full || user?.username || "Unknown",
      assignments: assignmentsByUser.get(row.user_id) ?? [],
    };
  });

  staff.sort((a, b) => a.name.localeCompare(b.name));
  return staff;
};

export const createStaffMember = async (userId: string): Promise<StaffMember> => {
  const { data: existing } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("user_id", userId)
    .limit(1);

  if (!existing || existing.length === 0) {
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: "staff" });
    if (error) throw error;
  }

  const all = await fetchStaff();
  const member = all.find((m) => m.userId === userId);
  if (!member) throw new Error("Staff member not found after insert");
  return member;
};

export const addAssignmentToStaff = async (
  userId: string,
  input: { gameId: string } | { challengeId: string }
): Promise<void> => {
  const row =
    "gameId" in input
      ? { user_id: userId, game_id: input.gameId, challenge_id: null }
      : { user_id: userId, game_id: null, challenge_id: input.challengeId };

  const { error } = await supabase.from("staff_assignments").insert(row);
  if (error) throw error;
};

export const removeAssignmentFromStaff = async (
  assignmentRowId: string
): Promise<void> => {
  const { error } = await supabase
    .from("staff_assignments")
    .delete()
    .eq("id", assignmentRowId);
  if (error) throw error;
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
      setError(err instanceof Error ? err : new Error("Failed to load staff"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addStaffMember = useCallback(
    async (userId: string) => {
      const member = await createStaffMember(userId);
      await refresh();
      return member;
    },
    [refresh]
  );

  const addAssignment = useCallback(
    async (userId: string, input: { gameId: string } | { challengeId: string }) => {
      await addAssignmentToStaff(userId, input);
      await refresh();
    },
    [refresh]
  );

  const removeAssignment = useCallback(
    async (assignmentRowId: string) => {
      await removeAssignmentFromStaff(assignmentRowId);
      await refresh();
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
    addAssignment,
    removeAssignment,
    removeStaffByUserId,
  };
};
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useStaff.ts
git commit -m "feat: rewrite useStaff to support multiple assignments per staff member"
```

---

## Task 5: Update `StaffPanel.tsx`

**Files:**
- Modify: `src/components/adminPanel/StaffPanel.tsx`

- [ ] **Step 1: Replace the entire file contents**

```typescript
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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

// "" = no assignment selected; "game:<uuid>" or "challenge:<uuid>" otherwise.
type AssignmentValue = string;

const parseAssignmentValue = (
  value: AssignmentValue
): { gameId: string } | { challengeId: string } | null => {
  if (value.startsWith("game:")) return { gameId: value.slice(5) };
  if (value.startsWith("challenge:")) return { challengeId: value.slice(10) };
  return null;
};

const StaffPanel: React.FC = () => {
  const {
    staff,
    addStaffMember,
    addAssignment,
    removeAssignment,
    removeStaffByUserId,
  } = useStaff();
  const { games } = useGames();
  const { challenges } = useChallenges();
  const { isAdmin } = useUserRoles();
  const { toasts, push, dismiss } = useToasts();

  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // userId currently showing inline "add assignment" dropdown
  const [addingForUser, setAddingForUser] = useState<string | null>(null);
  const [pendingAddValue, setPendingAddValue] = useState<AssignmentValue>("");

  // Add-modal state
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [searching, setSearching] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.assignments.some((a) =>
          a.assignmentName.toLowerCase().includes(q)
        )
    );
  }, [staff, query]);

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
  };

  const handleAdd = async () => {
    if (!selectedUserId) {
      push("error", "Please pick a user.");
      return;
    }
    try {
      await addStaffMember(selectedUserId);
      push("success", "Added to staff");
      resetAddModal();
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Failed to add staff.");
    }
  };

  const handleAddAssignment = async (userId: string) => {
    const parsed = parseAssignmentValue(pendingAddValue);
    if (!parsed) {
      push("error", "Pick a game or challenge first.");
      return;
    }
    try {
      await addAssignment(userId, parsed);
      push("success", "Assignment added");
      setAddingForUser(null);
      setPendingAddValue("");
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Failed to add assignment.");
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      await removeAssignment(assignmentId);
      push("success", "Assignment removed");
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Failed to remove assignment.");
    }
  };

  const handleRemoveStaff = async (userId: string, name: string) => {
    if (!isAdmin) return;
    if (!window.confirm(`Remove ${name} from staff?`)) return;
    try {
      await removeStaffByUserId(userId);
      push("success", `Removed ${name}`);
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Failed to remove.");
    }
  };

  // Build set of already-assigned game/challenge IDs for a user to prevent duplicates
  const getAssignedIds = (userId: string) => {
    const member = staff.find((m) => m.userId === userId);
    if (!member) return { gameIds: new Set<string>(), challengeIds: new Set<string>() };
    const gameIds = new Set(
      member.assignments.filter((a) => a.type === "game").map((a) => a.assignmentId)
    );
    const challengeIds = new Set(
      member.assignments.filter((a) => a.type === "challenge").map((a) => a.assignmentId)
    );
    return { gameIds, challengeIds };
  };

  const AssignmentAddSelect: React.FC<{
    userId: string;
    value: AssignmentValue;
    onChange: (v: AssignmentValue) => void;
    className?: string;
  }> = ({ userId, value, onChange, className = "" }) => {
    const { gameIds, challengeIds } = getAssignedIds(userId);
    const availableGames = games.filter((g) => !gameIds.has(g.id));
    const availableChallenges = challenges.filter((c) => !challengeIds.has(c.id));

    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`border bg-dark-bg/60 px-3 py-2 text-sm font-semibold text-white focus:outline-none border-blue-accent/40 focus:border-blue-bright ${className}`}
      >
        <option value="">Pick game or challenge…</option>
        {availableGames.length > 0 && (
          <optgroup label="Games">
            {availableGames.map((g) => (
              <option key={`game-${g.id}`} value={`game:${g.id}`}>
                {g.name} ({g.pointsPerAward} pts, cap {g.maxPoints})
              </option>
            ))}
          </optgroup>
        )}
        {availableChallenges.length > 0 && (
          <optgroup label="Challenges">
            {availableChallenges.map((c) => (
              <option key={`challenge-${c.id}`} value={`challenge:${c.id}`}>
                {c.name} ({c.pointsPerAward} pts, cap {c.maxPoints})
              </option>
            ))}
          </optgroup>
        )}
      </select>
    );
  };

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
          <span>Assignments</span>
          <span className="pr-2">Actions</span>
        </div>
        {filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-400">
            No staff match.
          </div>
        )}
        {filtered.map((member) => {
          const isAddingHere = addingForUser === member.userId;

          return (
            <div
              key={member.userId}
              className="grid grid-cols-[1fr,2fr,auto] items-start gap-4 border-b border-blue-accent/10 px-5 py-3 last:border-b-0 hover:bg-white/[0.03]"
            >
              {/* Name column */}
              <div className="flex items-center gap-2 min-w-0 pt-0.5">
                <span className="truncate text-base font-medium text-white">
                  {member.name}
                </span>
                {member.role === "admin" && (
                  <span className="shrink-0 rounded-sm bg-blue-bright/20 px-1.5 py-0.5 font-bayon text-[10px] uppercase tracking-widest text-blue-bright border border-blue-bright/40">
                    Admin
                  </span>
                )}
              </div>

              {/* Assignments column */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {member.assignments.length === 0 && (
                    <span className="text-xs text-gray-500 italic">No assignments</span>
                  )}
                  {member.assignments.map((a) => (
                    <span
                      key={a.id}
                      className="inline-flex items-center gap-1 border border-blue-accent/30 bg-blue-accent/10 px-2 py-0.5 text-xs font-semibold text-blue-bright"
                    >
                      {a.assignmentName}
                      <button
                        onClick={() => void handleRemoveAssignment(a.id)}
                        className="ml-0.5 text-blue-bright/50 hover:text-red-300 leading-none"
                        title={`Remove ${a.assignmentName}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => {
                      if (isAddingHere) {
                        setAddingForUser(null);
                        setPendingAddValue("");
                      } else {
                        setAddingForUser(member.userId);
                        setPendingAddValue("");
                      }
                    }}
                    className="inline-flex items-center gap-1 border border-dashed border-blue-accent/40 px-2 py-0.5 text-xs text-blue-bright/60 hover:border-blue-bright/60 hover:text-blue-bright"
                  >
                    {isAddingHere ? "Cancel" : "+ Add"}
                  </button>
                </div>

                {isAddingHere && (
                  <div className="flex items-center gap-2">
                    <AssignmentAddSelect
                      userId={member.userId}
                      value={pendingAddValue}
                      onChange={setPendingAddValue}
                      className="flex-1"
                    />
                    <button
                      disabled={!pendingAddValue}
                      onClick={() => void handleAddAssignment(member.userId)}
                      className={`${primaryBtnClass} text-xs`}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Actions column */}
              {isAdmin && member.role !== "admin" && (
                <button
                  onClick={() => void handleRemoveStaff(member.userId, member.name)}
                  className={dangerBtnClass}
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>

      {showAddModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            onClick={resetAddModal}
          >
            <div
              className="flex w-full max-w-md flex-col overflow-hidden border border-blue-bright/40 bg-navy-blue shadow-[0_0_60px_rgba(0,212,255,0.25)]"
              style={{ maxHeight: "calc(100dvh - 2rem)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-blue-accent/20 bg-dark-navy/60 px-5 py-4">
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
              <div className="flex-1 space-y-4 overflow-y-auto p-5">
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
                      <div className="p-3 text-sm text-gray-400">Searching…</div>
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
                <p className="text-xs text-gray-500">
                  Assignments can be added from the staff roster after adding.
                </p>
              </div>
              <div className="flex shrink-0 items-center justify-end gap-2 border-t border-blue-accent/20 bg-dark-navy/60 px-5 py-3">
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
          </div>,
          document.body
        )}
    </div>
  );
};

export default StaffPanel;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/adminPanel/StaffPanel.tsx
git commit -m "feat: replace single assignment dropdown with multi-assignment manager in StaffPanel"
```

---

## Task 6: Update `AwardCard.tsx`

**Files:**
- Modify: `src/components/adminPanel/players/AwardCard.tsx`

- [ ] **Step 1: Replace the entire file contents**

```typescript
import React from "react";
import type { StaffAssignment } from "../../../schemas/StaffSchema";
import { dangerBtnClass, primaryBtnClass } from "../shared/styles";

export type LastAwardSummary = {
  amount: number;
  tag: string;
  playerCount: number;
  playerNamePreview: string;
};

type AwardCardProps = {
  isAdmin: boolean;
  busy: boolean;
  onAward: (amount: number) => void;
  checkedInCount: number;
  selectedCount: number;
  lastAward?: LastAwardSummary | null;
  onUndoLast?: () => void;
  busyUndo?: boolean;
  // Staff-only: list of assignments + which one is active
  assignments?: StaffAssignment[];
  activeAssignmentId?: string | null;
  onSelectAssignment?: (id: string) => void;
  pointsInput?: string;
  onPointsInputChange?: (v: string) => void;
};

const UndoLastBanner: React.FC<{
  last: LastAwardSummary;
  busyUndo: boolean;
  onUndoLast: () => void;
}> = ({ last, busyUndo, onUndoLast }) => (
  <div className="mt-3 flex items-center justify-between gap-3 border border-amber-400/40 bg-amber-400/10 px-3 py-2">
    <div className="min-w-0 text-xs text-amber-200">
      <span className="font-semibold">Last award:</span>{" "}
      <span className="font-bold text-amber-100">{last.amount} pts</span>
      {" to "}
      <span className="truncate">{last.playerNamePreview}</span>
      {last.playerCount > 1 && <span> +{last.playerCount - 1} more</span>}
      {last.tag && <span className="text-amber-300/80"> · {last.tag}</span>}
    </div>
    <button
      disabled={busyUndo}
      onClick={onUndoLast}
      className="shrink-0 border border-amber-300/60 bg-amber-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-200 transition-colors hover:bg-amber-300/20 disabled:opacity-50"
    >
      {busyUndo ? "Undoing…" : "Undo"}
    </button>
  </div>
);

const AwardCard: React.FC<AwardCardProps> = ({
  isAdmin,
  busy,
  onAward,
  checkedInCount,
  selectedCount,
  lastAward = null,
  onUndoLast,
  busyUndo = false,
  assignments = [],
  activeAssignmentId = null,
  onSelectAssignment,
  pointsInput = "",
  onPointsInputChange,
}) => {
  const canUndo = !!lastAward && !!onUndoLast;
  const noneCheckedIn = checkedInCount === 0;
  const someNotCheckedIn = checkedInCount < selectedCount;
  const parsedInput = parseInt(pointsInput, 10);
  const hasCustomAmount = !Number.isNaN(parsedInput) && parsedInput !== 0;
  const customAmount = hasCustomAmount ? Math.abs(parsedInput) : 0;

  const activeAssignment =
    assignments.find((a) => a.id === activeAssignmentId) ?? assignments[0] ?? null;

  const checkInWarning = noneCheckedIn ? (
    <div className="mb-4 rounded border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-300">
      {selectedCount === 1
        ? "This player is not checked in. Check them in before awarding points."
        : "None of the selected players are checked in. Check them in before awarding points."}
    </div>
  ) : someNotCheckedIn ? (
    <div className="mb-4 rounded border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
      <span className="font-semibold">
        {selectedCount - checkedInCount} player
        {selectedCount - checkedInCount !== 1 ? "s" : ""}
      </span>{" "}
      not checked in — they will be skipped.
    </div>
  ) : null;

  const renderCustomControls = (allowRemove: boolean) => (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        placeholder={allowRemove ? "Custom amount" : "Award amount"}
        value={pointsInput}
        onChange={(e) => onPointsInputChange?.(e.target.value)}
        className="w-32 border border-blue-accent/40 bg-dark-bg/60 px-3 py-3 text-center text-base font-semibold tabular-nums text-white placeholder-gray-500 focus:border-blue-bright focus:outline-none"
      />
      <button
        disabled={busy || noneCheckedIn || !hasCustomAmount}
        onClick={() => onAward(customAmount)}
        className={primaryBtnClass}
      >
        Award
      </button>
      {allowRemove && (
        <button
          disabled={busy || noneCheckedIn || !hasCustomAmount}
          onClick={() => onAward(-customAmount)}
          className={dangerBtnClass}
        >
          Remove
        </button>
      )}
    </div>
  );

  const renderStaffCustomControls = () => (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        min={1}
        placeholder="Enter points"
        value={pointsInput}
        onChange={(e) => onPointsInputChange?.(e.target.value)}
        className="w-36 border border-blue-accent/40 bg-dark-bg/60 px-3 py-3 text-center text-base font-semibold tabular-nums text-white placeholder-gray-500 focus:border-blue-bright focus:outline-none"
      />
      <button
        disabled={busy || noneCheckedIn || !hasCustomAmount}
        onClick={() => onAward(customAmount)}
        className={primaryBtnClass}
      >
        Award Custom Points
      </button>
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="border border-blue-bright/30 bg-gradient-to-br from-navy-blue/80 to-card-bg/80 p-5 shadow-[0_0_30px_rgba(0,212,255,0.08)]">
        <h3 className="mb-4 font-zuume text-2xl font-bold uppercase tracking-wider text-white">
          Award Points
        </h3>

        {assignments.length === 0 ? (
          <p className="rounded border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-300">
            You have no game or challenge assignment. Contact an admin to be
            assigned.
          </p>
        ) : (
          <div className="space-y-4">
            {checkInWarning}

            {/* Assignment selector — only shown when 2+ assignments */}
            {assignments.length > 1 && (
              <div className="border border-blue-accent/20 bg-dark-navy/40 px-4 py-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-bright/70">
                  Award Points For
                </p>
                <div className="flex flex-wrap gap-2">
                  {assignments.map((a) => {
                    const isActive = a.id === (activeAssignment?.id ?? null);
                    return (
                      <button
                        key={a.id}
                        onClick={() => onSelectAssignment?.(a.id)}
                        className={`border px-3 py-1.5 text-sm font-semibold transition-colors ${
                          isActive
                            ? "border-blue-bright bg-blue-bright/20 text-blue-bright"
                            : "border-blue-accent/30 bg-transparent text-gray-300 hover:border-blue-bright/60 hover:text-white"
                        }`}
                      >
                        {a.assignmentName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeAssignment && (
              <div className="border border-blue-accent/20 bg-dark-navy/40 px-4 py-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-bright/70">
                  {assignments.length === 1 ? "Your Assignment" : "Selected Assignment"}
                </p>
                <p className="text-lg font-bold text-white">
                  {activeAssignment.assignmentName}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Custom awards are tracked against this assignment and capped at{" "}
                  <span className="font-semibold text-blue-bright">
                    {activeAssignment.maxPoints} pts
                  </span>{" "}
                  per player.
                </p>
              </div>
            )}

            <div className="border border-blue-accent/20 bg-dark-navy/40 px-4 py-4">
              <div className="mb-3">
                <p className="font-bayon text-xs uppercase tracking-[0.25em] text-blue-bright/80">
                  Custom Award Amount
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Enter any positive amount to award points against your assigned
                  game or challenge.
                </p>
              </div>
              {renderStaffCustomControls()}
            </div>
            {canUndo && lastAward && onUndoLast && (
              <UndoLastBanner
                last={lastAward}
                busyUndo={busyUndo}
                onUndoLast={onUndoLast}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border border-blue-bright/30 bg-gradient-to-br from-navy-blue/80 to-card-bg/80 p-5 shadow-[0_0_30px_rgba(0,212,255,0.08)]">
      <h3 className="mb-4 font-zuume text-2xl font-bold uppercase tracking-wider text-white">
        Award Points
        <span className="ml-3 text-sm font-normal normal-case tracking-normal text-amber-300">
          Admin
        </span>
      </h3>

      {checkInWarning}
      {renderCustomControls(true)}
    </div>
  );
};

export default AwardCard;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/adminPanel/players/AwardCard.tsx
git commit -m "feat: add multi-assignment selector to AwardCard"
```

---

## Task 7: Update `PlayersPanel.tsx`

**Files:**
- Modify: `src/components/adminPanel/PlayersPanel.tsx`

- [ ] **Step 1: Add `activeAssignmentId` state and derive `activeAssignment`**

After the existing state declarations (around line 53, after `const [busyUndo, setBusyUndo] = useState(false);`), add:

```typescript
const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
```

After the `currentStaff` memo (around line 74), add:

```typescript
const activeAssignment = useMemo(() => {
  const list = currentStaff?.assignments ?? [];
  if (list.length === 0) return null;
  return list.find((a) => a.id === activeAssignmentId) ?? list[0];
}, [currentStaff?.assignments, activeAssignmentId]);
```

- [ ] **Step 2: Update the staff path in `awardPoints`**

Find and replace this block inside `awardPoints` (around lines 144–172):

```typescript
        if (
          !currentStaff?.assignmentId ||
          currentStaff.maxPoints === null
        ) {
          push(
            "error",
            "You have no game/challenge assignment. Contact an admin."
          );
          return;
        }

        const amount = Math.abs(amountInput);
        if (amount === 0) {
          push("error", "Enter a point amount greater than 0.");
          return;
        }

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
```

With:

```typescript
        if (!activeAssignment) {
          push(
            "error",
            "You have no game/challenge assignment. Contact an admin."
          );
          return;
        }

        const amount = Math.abs(amountInput);
        if (amount === 0) {
          push("error", "Enter a point amount greater than 0.");
          return;
        }

        const gameId =
          activeAssignment.type === "game" ? activeAssignment.assignmentId : null;
        const challengeId =
          activeAssignment.type === "challenge" ? activeAssignment.assignmentId : null;
        const maxPts = activeAssignment.maxPoints;
        const tag = activeAssignment.assignmentName;
```

- [ ] **Step 3: Update `revokeMyAssignment`**

Find and replace this block inside `revokeMyAssignment` (around lines 345–356):

```typescript
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
```

With:

```typescript
  const revokeMyAssignment = async (player: Player) => {
    if (!activeAssignment || !user?.id) return;

    const gameId =
      activeAssignment.type === "game" ? activeAssignment.assignmentId : null;
    const challengeId =
      activeAssignment.type === "challenge" ? activeAssignment.assignmentId : null;
```

Also update the log entry in `revokeMyAssignment` (around line 382):

```typescript
        `${staffName}[${currentStaff.assignmentName}] revoked ${pointsToRevoke} pts from ${fresh.name} on ${timestamp}`,
```

Replace with:

```typescript
        `${staffName}[${activeAssignment.assignmentName}] revoked ${pointsToRevoke} pts from ${fresh.name} on ${timestamp}`,
```

- [ ] **Step 4: Update `AwardCard` props in the render**

Find the `<AwardCard .../>` call (around lines 607–620):

```typescript
            <AwardCard
              isAdmin={isAdmin}
              busy={busyAward}
              onAward={awardPoints}
              checkedInCount={selectedPlayers.filter((p) => checkIns.get(p.userId)?.checkedIn).length}
              selectedCount={selectedPlayers.length}
              lastAward={lastAward?.summary ?? null}
              onUndoLast={() => void undoLastAward()}
              busyUndo={busyUndo}
              assignmentName={currentStaff?.assignmentName}
              maxPoints={currentStaff?.maxPoints}
              pointsInput={pointsInput}
              onPointsInputChange={setPointsInput}
            />
```

Replace with:

```typescript
            <AwardCard
              isAdmin={isAdmin}
              busy={busyAward}
              onAward={awardPoints}
              checkedInCount={selectedPlayers.filter((p) => checkIns.get(p.userId)?.checkedIn).length}
              selectedCount={selectedPlayers.length}
              lastAward={lastAward?.summary ?? null}
              onUndoLast={() => void undoLastAward()}
              busyUndo={busyUndo}
              assignments={currentStaff?.assignments ?? []}
              activeAssignmentId={activeAssignment?.id ?? null}
              onSelectAssignment={setActiveAssignmentId}
              pointsInput={pointsInput}
              onPointsInputChange={setPointsInput}
            />
```

- [ ] **Step 5: Update `staffAssignment` prop on `PlayerDetailCard`**

Find (around line 632):

```typescript
            staffAssignment={currentStaff?.assignmentName ?? "staff"}
```

Replace with:

```typescript
            staffAssignment={activeAssignment?.assignmentName ?? "staff"}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/adminPanel/PlayersPanel.tsx
git commit -m "feat: wire multi-assignment selector into PlayersPanel award flow"
```

---

## Task 8: TypeScript Build Check

**Files:** none (verification only)

- [ ] **Step 1: Run TypeScript compiler**

```bash
cd /Users/kevinhu/Programming/GTEsports/gamefest && npx tsc --noEmit
```

Expected: zero errors. If errors appear, they will be about removed properties (`assignmentType`, `assignmentId`, `assignmentName`, `pointsPerAward`, `maxPoints` on `StaffMember`) referenced somewhere not covered above — fix each by using `activeAssignment` or iterating `member.assignments`.

- [ ] **Step 2: Run dev server and smoke test**

```bash
npm run dev
```

Open the app and verify:
1. Admin panel → Staff Roster: badges shown, ✕ removes an assignment, "+ Add" opens dropdown, "Add Staff" modal no longer shows assignment dropdown
2. Admin panel → Players/Points as a staff user with 2+ assignments: pill selector appears above AwardCard; switching pills updates assignment name and cap; awarding points works; undo works
3. Admin panel → Players/Points as a staff user with 1 assignment: no pill selector, behavior identical to before

- [ ] **Step 3: Final commit if any last fixes were needed**

```bash
git add -p
git commit -m "fix: address TypeScript errors from multi-assignment refactor"
```
