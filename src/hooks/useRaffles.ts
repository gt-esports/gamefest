import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { updateAllPlayersRaffleState } from "./usePlayers";
import type { PickRaffleWinnersInput, RaffleParticipant, RaffleWinner } from "../schemas/RafflesSchema";

const toPlaceLabel = (place: number): string => {
  if (place === 1) return "1st";
  if (place === 2) return "2nd";
  if (place === 3) return "3rd";
  return "Participant";
};

const pickWinnersWithWeightedChance = (
  participants: RaffleParticipant[],
  count: number
): RaffleParticipant[] => {
  const pool = [...participants];
  const winners: RaffleParticipant[] = [];

  if (pool.length <= count) return participants;

  for (let i = 0; i < count; i += 1) {
    const totalPoints = pool.reduce((sum, participant) => sum + Math.max(1, participant.points), 0);
    const randVal = Math.random() * totalPoints;

    let cumulative = 0;
    let winnerIndex = 0;

    for (let j = 0; j < pool.length; j += 1) {
      cumulative += Math.max(1, pool[j].points);
      if (cumulative >= randVal) {
        winnerIndex = j;
        break;
      }
    }

    winners.push(pool[winnerIndex]);
    pool.splice(winnerIndex, 1);
  }

  return winners;
};

type PlayerWithUserRow = {
  id: string;
  points: number | null;
  raffle_placing?: number | null;
  users:
    | { username: string | null; fname: string | null; lname: string | null }
    | Array<{ username: string | null; fname: string | null; lname: string | null }>
    | null;
};

const unwrapRel = <T>(v: T | T[] | null | undefined): T | null =>
  !v ? null : Array.isArray(v) ? v[0] || null : v;

const displayName = (row: PlayerWithUserRow): string => {
  const u = unwrapRel(row.users);
  const full = [u?.fname, u?.lname].filter(Boolean).join(" ");
  return full || u?.username || "Unknown";
};

export const fetchRaffleWinners = async (): Promise<RaffleWinner[]> => {
  const { data, error } = await supabase
    .from("players")
    .select("id, points, raffle_placing, users ( username, fname, lname )")
    .eq("raffle_winner", true)
    .order("raffle_placing", { ascending: true });

  if (error) throw error;

  const rows = (data || []) as unknown as PlayerWithUserRow[];
  return rows.map((row) => ({
    userId: row.id,
    name: displayName(row),
    points: row.points ?? 0,
    place: toPlaceLabel(row.raffle_placing ?? 0),
  }));
};

export const resetRaffleWinners = async (): Promise<void> => {
  await updateAllPlayersRaffleState(false, 0);
};

export const pickRaffleWinners = async (
  { count }: PickRaffleWinnersInput = { count: 3 }
): Promise<RaffleWinner[]> => {
  if (count < 1) {
    throw new Error("Count must be at least 1");
  }

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("id, points, users ( username, fname, lname )")
    .order("points", { ascending: false });

  if (playersError) throw playersError;

  const playerRows = (players || []) as unknown as PlayerWithUserRow[];
  const participants: RaffleParticipant[] = playerRows
    .slice(3)
    .filter((participant) => (participant.points ?? 0) > 0)
    .map((participant) => ({
      userId: participant.id,
      name: displayName(participant),
      points: participant.points ?? 0,
    }));

  if (participants.length === 0) {
    throw new Error("No eligible participants found");
  }

  if (participants.length < count) {
    throw new Error(
      `Not enough participants. Requested ${count} winners, but only ${participants.length} participants available.`
    );
  }

  await resetRaffleWinners();

  const winners = pickWinnersWithWeightedChance(participants, count);

  for (let i = 0; i < winners.length; i += 1) {
    const { error } = await supabase
      .from("players")
      .update({ raffle_winner: true, raffle_placing: i + 1 })
      .eq("id", winners[i].userId);

    if (error) throw error;
  }

  return winners.map((winner, index) => ({
    ...winner,
    place: toPlaceLabel(index + 1),
  }));
};

export const useRaffles = () => {
  const [winners, setWinners] = useState<RaffleWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      setError(null);
      const rows = await fetchRaffleWinners();
      setWinners(rows);
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Failed to load raffle winners");
      setError(nextError);
      setWinners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const reset = useCallback(async () => {
    setMutating(true);

    try {
      setError(null);
      await resetRaffleWinners();
      await refresh();
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Failed to reset raffle winners");
      setError(nextError);
      throw nextError;
    } finally {
      setMutating(false);
    }
  }, [refresh]);

  const pick = useCallback(
    async (count = 3) => {
      setMutating(true);

      try {
        setError(null);
        const picked = await pickRaffleWinners({ count });
        await refresh();
        return picked;
      } catch (err) {
        const nextError = err instanceof Error ? err : new Error("Failed to pick raffle winners");
        setError(nextError);
        throw nextError;
      } finally {
        setMutating(false);
      }
    },
    [refresh]
  );

  return {
    winners,
    loading,
    mutating,
    error,
    refresh,
    reset,
    pick,
  };
};
