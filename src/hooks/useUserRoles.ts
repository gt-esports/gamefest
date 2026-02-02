import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useUser } from "./useAuth";

export type AppRole = "staff" | "admin";

export const fetchRolesForUser = async (userId: string): Promise<AppRole[]> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) throw error;

  return (data || [])
    .map((row) => row.role)
    .filter((role): role is AppRole => role === "staff" || role === "admin");
};

export const useUserRoles = () => {
  const { user, isLoaded } = useUser();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setRoles([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      setError(null);
      const nextRoles = await fetchRolesForUser(user.id);
      setRoles(nextRoles);
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Failed to load user roles");
      setError(nextError);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isLoaded) return;
    void refresh();
  }, [isLoaded, refresh]);

  const roleSet = useMemo(() => new Set(roles), [roles]);

  return {
    roles,
    loading,
    error,
    refresh,
    isAdmin: roleSet.has("admin"),
    isStaff: roleSet.has("staff") || roleSet.has("admin"),
    hasRole: (role: AppRole) => roleSet.has(role),
  };
};
