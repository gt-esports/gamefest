import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import type { Challenge, CreateChallengeInput } from "../schemas/ChallengesSchema";

export const fetchChallenges = async (): Promise<Challenge[]> => {
  const { data, error } = await supabase
    .from("challenges")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
  }));
};

export const createChallenge = async (input: CreateChallengeInput): Promise<Challenge> => {
  const { data, error } = await supabase
    .from("challenges")
    .insert({ name: input.name.trim() })
    .select("id, name")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
  };
};

export const deleteChallengeByName = async (name: string): Promise<void> => {
  const { data, error } = await supabase
    .from("challenges")
    .delete()
    .eq("name", name)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Challenge not found");
};

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      setError(null);
      const rows = await fetchChallenges();
      setChallenges(rows);
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Failed to load challenges");
      setError(nextError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addChallenge = useCallback(
    async (input: CreateChallengeInput) => {
      const challenge = await createChallenge(input);
      await refresh();
      return challenge;
    },
    [refresh]
  );

  const removeChallengeByName = useCallback(
    async (name: string) => {
      await deleteChallengeByName(name);
      await refresh();
    },
    [refresh]
  );

  return {
    challenges,
    loading,
    error,
    refresh,
    addChallenge,
    removeChallengeByName,
  };
};
