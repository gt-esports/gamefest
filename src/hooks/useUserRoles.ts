import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useUser } from "./useAuth";
import type { AppRole } from "../schemas/UserRoles";
import { getActiveSeasonId } from "../utils/activeSeason";

export const fetchRolesForUser = async (userId: string): Promise<AppRole[]> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) throw error;

  const roles = (data || [])
    .map((row) => row.role)
    .filter((role): role is AppRole => role === "staff" || role === "admin");

  if (roles.includes("admin") || !roles.includes("staff")) return roles;

  const seasonId = await getActiveSeasonId();
  const { data: membership, error: membershipError } = await supabase
    .from("season_staff")
    .select("user_id")
    .eq("season_id", seasonId)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError) throw membershipError;
  return membership ? roles : roles.filter((role) => role !== "staff");
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
