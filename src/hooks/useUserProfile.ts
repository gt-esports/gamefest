import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import type { Database } from "../types/database.types";

export type UserProfile = Database["public"]["Tables"]["users"]["Row"];

export const useUserProfile = (userId: string | null | undefined) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    // On first sign-in, the `handle_new_user` trigger inserts this row
    // asynchronously. Retry briefly so we don't return null before it lands.
    const delays = [0, 250, 500, 1000, 2000];
    for (let i = 0; i < delays.length; i++) {
      if (delays[i] > 0) await new Promise((r) => setTimeout(r, delays[i]));
      const { data, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (fetchError) {
        setError(fetchError.message);
        setProfile(null);
        setLoading(false);
        return;
      }
      if (data) {
        setProfile(data);
        setLoading(false);
        return;
      }
    }
    setProfile(null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const updateName = useCallback(
    async (fname: string, lname: string) => {
      if (!userId) throw new Error("Not signed in");
      const { data, error: updateError } = await supabase
        .from("users")
        .update({ fname, lname, profile_completed: true })
        .eq("id", userId)
        .select("*")
        .single();
      if (updateError) throw new Error(updateError.message);
      setProfile(data);
      return data;
    },
    [userId]
  );

  return { profile, loading, error, refresh: fetchProfile, updateName };
};
