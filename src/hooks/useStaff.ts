import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import type {
  CreateStaffMemberInput,
  StaffMember,
  UpdateStaffMemberInput,
} from "../schemas/StaffSchema";

export const fetchStaff = async (): Promise<StaffMember[]> => {
  const { data, error } = await supabase
    .from("staff")
    .select("id, name, assignment")
    .order("name", { ascending: true });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    assignment: row.assignment,
  }));
};

export const createStaffMember = async (input: CreateStaffMemberInput): Promise<StaffMember> => {
  const trimmedAssignment =
    typeof input.assignment === "string" ? input.assignment.trim() : "";

  const { data, error } = await supabase
    .from("staff")
    .insert({
      name: input.name.trim(),
      assignment: trimmedAssignment ? trimmedAssignment : null,
    })
    .select("id, name, assignment")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    assignment: data.assignment,
  };
};

export const updateStaffByName = async (
  name: string,
  input: UpdateStaffMemberInput
): Promise<StaffMember> => {
  const updates: { name?: string; assignment?: string | null } = {};

  if (typeof input.name === "string" && input.name.trim()) {
    updates.name = input.name.trim();
  }

  if ("assignment" in input) {
    const trimmedAssignment =
      typeof input.assignment === "string" ? input.assignment.trim() : "";
    updates.assignment = trimmedAssignment ? trimmedAssignment : null;
  }

  const { data, error } = await supabase
    .from("staff")
    .update(updates)
    .eq("name", name)
    .select("id, name, assignment")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Staff member not found");

  return {
    id: data.id,
    name: data.name,
    assignment: data.assignment,
  };
};

export const deleteStaffByName = async (name: string): Promise<void> => {
  const { data, error } = await supabase
    .from("staff")
    .delete()
    .eq("name", name)
    .select("id")
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
      const nextError = err instanceof Error ? err : new Error("Failed to load staff");
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

  const patchStaffByName = useCallback(
    async (name: string, input: UpdateStaffMemberInput) => {
      const member = await updateStaffByName(name, input);
      await refresh();
      return member;
    },
    [refresh]
  );

  const removeStaffByName = useCallback(
    async (name: string) => {
      await deleteStaffByName(name);
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
    patchStaffByName,
    removeStaffByName,
  };
};
