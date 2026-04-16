import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import type { Challenge, CreateChallengeInput, UpdateChallengeInput } from "../schemas/ChallengesSchema";

export const fetchChallenges = async (): Promise<Challenge[]> => {
  const { data, error } = await supabase
    .from("challenges")
    .select("id, name, points_per_award, max_points")
    .order("name", { ascending: true });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    pointsPerAward: row.points_per_award,
    maxPoints: row.max_points,
  }));
};

export const createChallenge = async (input: CreateChallengeInput): Promise<Challenge> => {
  const { data, error } = await supabase
    .from("challenges")
    .insert({
      name: input.name.trim(),
      points_per_award: input.pointsPerAward ?? 10,
      max_points: input.maxPoints ?? 50,
    })
    .select("id, name, points_per_award, max_points")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    pointsPerAward: data.points_per_award,
    maxPoints: data.max_points,
  };
};

export const updateChallengeById = async (
  id: string,
  input: UpdateChallengeInput
): Promise<Challenge> => {
  const updates: { name?: string; points_per_award?: number; max_points?: number } = {};

  if (typeof input.name === "string" && input.name.trim()) {
    updates.name = input.name.trim();
  }
  if (typeof input.pointsPerAward === "number") {
    updates.points_per_award = input.pointsPerAward;
  }
  if (typeof input.maxPoints === "number") {
    updates.max_points = input.maxPoints;
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from("challenges")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
  }

  const { data, error: readError } = await supabase
    .from("challenges")
    .select("id, name, points_per_award, max_points")
    .eq("id", id)
    .single();

  if (readError) throw readError;

  return {
    id: data.id,
    name: data.name,
    pointsPerAward: data.points_per_award,
    maxPoints: data.max_points,
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

  const patchChallengeById = useCallback(
    async (id: string, input: UpdateChallengeInput) => {
      const challenge = await updateChallengeById(id, input);
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
    patchChallengeById,
    removeChallengeByName,
  };
};
