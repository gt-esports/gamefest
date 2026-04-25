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
      "id, user_id, game_id, challenge_id, games(id, name, max_points), challenges(id, name, max_points)"
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
      username: user?.username ?? null,
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
