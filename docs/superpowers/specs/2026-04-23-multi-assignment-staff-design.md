# Multi-Assignment Staff Design

**Date:** 2026-04-23  
**Status:** Approved

## Overview

Allow staff members to be assigned to multiple games/challenges. In the admin panel, admins can add or remove multiple assignments per staff member. In the staff player panel, staff with multiple assignments see a selector to choose which game/challenge to award points toward.

---

## Database Migration

### New Table: `staff_assignments`

```sql
CREATE TABLE staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  CONSTRAINT exactly_one_assignment CHECK (
    (game_id IS NOT NULL)::int + (challenge_id IS NOT NULL)::int = 1
  )
);
```

### Migration Steps

1. Create `staff_assignments` table as above.
2. For each row in `user_roles` where `game_assignment_id IS NOT NULL`, insert a row into `staff_assignments` with `game_id = game_assignment_id`.
3. For each row in `user_roles` where `challenge_assignment_id IS NOT NULL`, insert a row into `staff_assignments` with `challenge_id = challenge_assignment_id`.
4. Drop columns `game_assignment_id` and `challenge_assignment_id` from `user_roles`.

---

## TypeScript Types

### New: `StaffAssignment`

```typescript
type StaffAssignment = {
  id: string;
  type: 'game' | 'challenge';
  assignmentId: string;
  assignmentName: string;
  pointsPerAward: number;
  maxPoints: number;
};
```

### Updated: `StaffMember`

Remove the five flat assignment fields (`assignmentType`, `assignmentId`, `assignmentName`, `pointsPerAward`, `maxPoints`) and replace with:

```typescript
assignments: StaffAssignment[];
```

---

## useStaff Hook

The Supabase query fetches `staff_assignments` joined with `games` and `challenges`, then groups rows by `user_id` so each `StaffMember` arrives with its `assignments[]` already populated.

Mutations:
- `addStaffMember(userId, role)` — creates the `user_roles` row; assignments are added separately.
- `addAssignment(userId, { gameId } | { challengeId })` — inserts into `staff_assignments`.
- `removeAssignment(assignmentId)` — deletes one row from `staff_assignments` by its `id`.
- `removeStaffByUserId(userId)` — deletes from `user_roles`; cascade removes all `staff_assignments` rows.

---

## Admin Panel — Staff Panel

The add/edit staff modal replaces the single assignment dropdown with a multi-assignment manager:

- Shows current assignments as a list, each with a remove (✕) button.
- Below the list: an "Add Assignment" dropdown listing all games and challenges, excluding any already assigned to this staff member.
- Staff with zero assignments can be saved (they simply cannot award points until assigned).
- The staff roster table shows assignment names as small badge tags instead of a single text field.

---

## Staff Player Panel — Assignment Selector

**One assignment:** No UI change. The single assignment is auto-selected and behavior is identical to today.

**Two or more assignments:** A pill/tab selector appears above the AwardCard:

```
Award points for:
  [Valorant]  [Speed Run]  [Puzzle Challenge]
```

- Defaults to the first assignment on page load.
- Switching tabs updates the AwardCard to reflect the selected assignment's `pointsPerAward` and `maxPoints` cap.
- The selected assignment's `game_id` or `challenge_id` is passed to `recordActivity()`.
- Undo functionality is unchanged — it undoes the last awarded batch regardless of active assignment.

---

## Affected Files

| File | Change |
|------|--------|
| `src/schemas/StaffSchema.ts` | Replace flat assignment fields with `assignments: StaffAssignment[]`; add `StaffAssignment` type |
| `src/hooks/useStaff.ts` | Update query to join `staff_assignments`; add `addAssignment` / `removeAssignment` mutations |
| `src/components/adminPanel/StaffPanel.tsx` | Replace single dropdown with multi-assignment manager in modal; update roster display |
| `src/components/adminPanel/PlayersPanel.tsx` | Pass selected assignment to AwardCard; add assignment selector when staff has 2+ assignments |
| `src/components/adminPanel/players/AwardCard.tsx` | Accept active assignment as prop instead of reading directly from staff object |
| `src/types/database.types.ts` | Add `staff_assignments` table type; remove dropped columns from `user_roles` |
