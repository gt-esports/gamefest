import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import type {
  CreateRegistrationInput,
  Registration,
} from "../schemas/RegistrationSchema";

export const fetchMyRegistration = async (
  userId: string
): Promise<Registration | null> => {
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as Registration | null;
};

export const createRegistration = async (
  userId: string,
  input: CreateRegistrationInput
): Promise<Registration> => {
  const { data, error } = await supabase
    .from("registrations")
    .insert({
      user_id: userId,
      first_name: input.first_name.trim(),
      last_name: input.last_name.trim(),
      email: input.email.trim(),
      admission_type: input.admission_type,
      school: input.school?.trim() || null,
      heard_from: input.heard_from?.trim() || null,
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
