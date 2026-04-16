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
  role: string;
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
  "user_id, role, game_assignment_id, challenge_assignment_id, users(username, fname, lname), games(id, name, points_per_award, max_points), challenges(id, name, points_per_award, max_points)";

const toStaff = (row: StaffJoinRow): StaffMember => {
  const user = unwrapRelation(row.users);
  const full = [user?.fname, user?.lname].filter(Boolean).join(" ");
  const game = unwrapRelation(row.games);
  const challenge = unwrapRelation(row.challenges);

  return {
    userId: row.user_id,
    role: (row.role === "admin" ? "admin" : "staff") as "staff" | "admin",
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
    .in("role", ["staff", "admin"]);

  if (error) throw error;

  const rows = (data || []) as unknown as StaffJoinRow[];
  const staff = rows.map(toStaff);
  staff.sort((a, b) => a.name.localeCompare(b.name));
  return staff;
};

export const createStaffMember = async (
  input: CreateStaffMemberInput
): Promise<StaffMember> => {
  // Check whether this user already has a user_roles row (e.g. admin).
  // If so, update their assignment in place rather than inserting a duplicate row.
  const { data: existingRows } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("user_id", input.userId)
    .limit(1);

  if (existingRows && existingRows.length > 0) {
    const { error } = await supabase
      .from("user_roles")
      .update({
        game_assignment_id: input.gameAssignmentId ?? null,
        challenge_assignment_id: input.challengeAssignmentId ?? null,
      })
      .eq("user_id", input.userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("user_roles").insert({
      user_id: input.userId,
      role: "staff",
      game_assignment_id: input.gameAssignmentId ?? null,
      challenge_assignment_id: input.challengeAssignmentId ?? null,
    });
    if (error) throw error;
  }

  const { data, error: readError } = await supabase
    .from("user_roles")
    .select(STAFF_SELECT)
    .eq("user_id", input.userId)
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
      .eq("user_id", userId);

    if (error) throw error;
  }

  const { data, error: readError } = await supabase
    .from("user_roles")
    .select(STAFF_SELECT)
    .eq("user_id", userId)
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
