import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import type {
  CreateStaffMemberInput,
  StaffMember,
  UpdateStaffMemberInput,
} from "../schemas/StaffSchema";

type StaffJoinRow = {
  user_id: string;
  assignment: string | null;
  users:
    | {
        username: string | null;
        display_name: string | null;
      }
    | Array<{
        username: string | null;
        display_name: string | null;
      }>
    | null;
};

const unwrapRelation = <T>(value: T | T[] | null | undefined): T | null => {
  if (!value) return null;
  return Array.isArray(value) ? value[0] || null : value;
};

const toStaff = (row: StaffJoinRow): StaffMember => {
  const user = unwrapRelation(row.users);
  return {
    userId: row.user_id,
    name: user?.display_name || user?.username || "Unknown",
    assignment: row.assignment,
  };
};

export const fetchStaff = async (): Promise<StaffMember[]> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("user_id, assignment, users ( username, display_name )")
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
  const trimmedAssignment =
    typeof input.assignment === "string" ? input.assignment.trim() : "";

  const { error } = await supabase.from("user_roles").insert({
    user_id: input.userId,
    role: "staff",
    assignment: trimmedAssignment ? trimmedAssignment : null,
  });

  if (error) throw error;

  const { data, error: readError } = await supabase
    .from("user_roles")
    .select("user_id, assignment, users ( username, display_name )")
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
  const updates: { assignment?: string | null } = {};

  if ("assignment" in input) {
    const trimmedAssignment =
      typeof input.assignment === "string" ? input.assignment.trim() : "";
    updates.assignment = trimmedAssignment ? trimmedAssignment : null;
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
    .select("user_id, assignment, users ( username, display_name )")
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
