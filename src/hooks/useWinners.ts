import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import type { SaveWinnerInput, WinnerRecord } from "../schemas/WinnerSchema";

export const fetchWinners = async (game?: string): Promise<WinnerRecord[]> => {
  let query = supabase
    .from("winners")
    .select("id, game, match_id, winner_name")
    .order(game ? "match_id" : "game", { ascending: true });

  if (game) {
    query = query.eq("game", game);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    game: row.game,
    matchId: row.match_id,
    winner: row.winner_name,
  }));
};

export const saveWinner = async (input: SaveWinnerInput): Promise<WinnerRecord> => {
  const { data: existing, error: existingError } = await supabase
    .from("winners")
    .select("id")
    .eq("game", input.game)
    .eq("match_id", input.matchId)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    const { data, error } = await supabase
      .from("winners")
      .update({ winner_name: input.winner })
      .eq("id", existing.id)
      .select("id, game, match_id, winner_name")
      .single();

    if (error) throw error;

    return {
      id: data.id,
      game: data.game,
      matchId: data.match_id,
      winner: data.winner_name,
    };
  }

  const { data, error } = await supabase
    .from("winners")
    .insert({
      game: input.game,
      match_id: input.matchId,
      winner_name: input.winner,
    })
    .select("id, game, match_id, winner_name")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    game: data.game,
    matchId: data.match_id,
    winner: data.winner_name,
  };
};

export const deleteWinner = async (game: string, matchId: string): Promise<void> => {
  const { data, error } = await supabase
    .from("winners")
    .delete()
    .eq("game", game)
    .eq("match_id", matchId)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Winner not found");
};

export const useWinners = (game: string | null | undefined) => {
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!game) {
      setWinners([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    try {
      setError(null);
      const rows = await fetchWinners(game);
      setWinners(rows);
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Failed to load winners");
      setError(nextError);
    } finally {
      setLoading(false);
    }
  }, [game]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const upsertWinner = useCallback(
    async (input: SaveWinnerInput) => {
      const winnerRecord = await saveWinner(input);
      await refresh();
      return winnerRecord;
    },
    [refresh]
  );

  return {
    winners,
    loading,
    error,
    refresh,
    upsertWinner,
  };
};
