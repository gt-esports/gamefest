import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { getActiveSeasonId } from "../utils/activeSeason";
import type {
  CreateRegistrationInput,
  Registration,
} from "../schemas/RegistrationSchema";

export const fetchMyRegistration = async (
  userId: string
): Promise<Registration | null> => {
  const seasonId = await getActiveSeasonId();
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("user_id", userId)
    .eq("season_id", seasonId)
    .maybeSingle();

  if (error) throw error;
  return data as Registration | null;
};

export const createRegistration = async (
  userId: string,
  input: CreateRegistrationInput
): Promise<Registration> => {
  const school = input.school.trim();
  const heardFrom = input.heard_from.trim();

  if (!school || !heardFrom) {
    throw new Error("School and how you heard about us are required");
  }

  const seasonId = await getActiveSeasonId();
  const { data, error } = await supabase
    .from("registrations")
    .insert({
      user_id: userId,
      season_id: seasonId,
      first_name: input.first_name.trim(),
      last_name: input.last_name.trim(),
      email: input.email.trim(),
      admission_type: input.admission_type,
      school,
      heard_from: heardFrom,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Registration;
};

export const useRegistration = (userId: string | null) => {
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setRegistration(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      setError(null);
      const data = await fetchMyRegistration(userId);
      setRegistration(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load registration")
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const register = useCallback(
    async (input: CreateRegistrationInput) => {
      if (!userId) throw new Error("Must be signed in to register");
      const reg = await createRegistration(userId, input);
      await refresh();
      return reg;
    },
    [userId, refresh]
  );

  return { registration, loading, error, refresh, register };
};
