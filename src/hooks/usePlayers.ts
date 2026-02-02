import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import type { TableInsert, TableRow, TableUpdate } from "../types/database.types";

export type TeamAssignment = {
  game: string;
  team: string;
};

export type Player = {
  id: string;
  name: string;
  points: number;
  participation: string[];
  log: string[];
  teamAssignments: TeamAssignment[];
  raffleWinner: boolean;
  rafflePlacing: number;
};

type AssignmentJoinRow = {
  player_id: string | null;
  teams:
    | {
        name: string | null;
        games:
          | {
              name: string | null;
            }
          | Array<{
              name: string | null;
            }>
          | null;
      }
    | Array<{
        name: string | null;
        games:
          | {
              name: string | null;
            }
          | Array<{
              name: string | null;
            }>
          | null;
      }>
    | null;
};

const unwrapRelation = <T>(value: T | T[] | null | undefined): T | null => {
  if (!value) return null;
  return Array.isArray(value) ? value[0] || null : value;
};

const normalizeStringArray = (value: string[] | null | undefined): string[] =>
  Array.isArray(value) ? value : [];

const toPlayer = (row: TableRow<"players">, teamAssignments: TeamAssignment[]): Player => ({
  id: row.id,
  name: row.name,
  points: row.points ?? 0,
  participation: normalizeStringArray(row.participation),
  log: normalizeStringArray(row.log),
  teamAssignments,
  raffleWinner: row.raffle_winner ?? false,
  rafflePlacing: row.raffle_placing ?? 0,
});

const mapPlayerAssignments = (assignments: AssignmentJoinRow[]): Map<string, TeamAssignment[]> => {
  const byPlayer = new Map<string, TeamAssignment[]>();

  for (const assignment of assignments) {
    const team = unwrapRelation(assignment.teams);
    const game = unwrapRelation(team?.games);

    if (!assignment.player_id || !team?.name || !game?.name) continue;

    const existing = byPlayer.get(assignment.player_id) || [];
    existing.push({ game: game.name, team: team.name });
    byPlayer.set(assignment.player_id, existing);
  }

  return byPlayer;
};

export const fetchPlayers = async (name?: string): Promise<Player[]> => {
  let playerQuery = supabase
    .from("players")
    .select("id, name, points, participation, log, raffle_winner, raffle_placing")
    .order("name", { ascending: true });

  if (name) {
    playerQuery = playerQuery.eq("name", name);
  }

  const { data: players, error: playerError } = await playerQuery;
  if (playerError) throw playerError;
  if (!players || players.length === 0) return [];

  const playerIds = players.map((player) => player.id);

  const { data: assignments, error: assignmentError } = await supabase
    .from("team_assignments")
    .select("player_id, teams(name, games(name))")
    .in("player_id", playerIds);

  if (assignmentError) throw assignmentError;

  const assignmentsByPlayer = mapPlayerAssignments((assignments || []) as AssignmentJoinRow[]);

  return players.map((player) => toPlayer(player, assignmentsByPlayer.get(player.id) || []));
};

export const getPlayerByName = async (name: string): Promise<Player | null> => {
  const players = await fetchPlayers(name);
  return players[0] || null;
};

const ensureGameId = async (gameName: string): Promise<string> => {
  const trimmed = gameName.trim();

  const { data: existing, error: existingError } = await supabase
    .from("games")
    .select("id")
    .eq("name", trimmed)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing?.id) return existing.id;

  const { data: inserted, error: insertError } = await supabase
    .from("games")
    .insert({ name: trimmed })
    .select("id")
    .single();

  if (insertError) throw insertError;
  return inserted.id;
};

const ensureTeamId = async (gameName: string, teamName: string): Promise<string> => {
  const gameId = await ensureGameId(gameName);
  const trimmedTeam = teamName.trim();

  const { data: existing, error: existingError } = await supabase
    .from("teams")
    .select("id")
    .eq("game_id", gameId)
    .eq("name", trimmedTeam)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing?.id) return existing.id;

  const { data: inserted, error: insertError } = await supabase
    .from("teams")
    .insert({ game_id: gameId, name: trimmedTeam })
    .select("id")
    .single();

  if (insertError) throw insertError;
  return inserted.id;
};

const replacePlayerAssignments = async (
  playerId: string,
  assignments: TeamAssignment[]
): Promise<void> => {
  const { error: deleteError } = await supabase
    .from("team_assignments")
    .delete()
    .eq("player_id", playerId);

  if (deleteError) throw deleteError;

  if (!Array.isArray(assignments) || assignments.length === 0) return;

  const deduped = new Map<string, TeamAssignment>();
  for (const assignment of assignments) {
    if (!assignment?.game || !assignment?.team) continue;
    deduped.set(`${assignment.game}::${assignment.team}`, assignment);
  }

  const rows: Array<{ player_id: string; team_id: string }> = [];

  for (const assignment of deduped.values()) {
    const teamId = await ensureTeamId(assignment.game, assignment.team);
    rows.push({ player_id: playerId, team_id: teamId });
  }

  if (rows.length === 0) return;

  const { error: insertError } = await supabase.from("team_assignments").insert(rows);
  if (insertError) throw insertError;
};

type CreatePlayerInput = {
  name: string;
  points?: number;
  participation?: string[];
  log?: string[];
  raffleWinner?: boolean;
  rafflePlacing?: number;
  teamAssignments?: TeamAssignment[];
};

export const createPlayer = async (input: CreatePlayerInput): Promise<Player> => {
  const payload: TableInsert<"players"> = {
    name: input.name.trim(),
    points: typeof input.points === "number" ? input.points : 0,
    participation: Array.isArray(input.participation) ? input.participation : [],
    log: Array.isArray(input.log) ? input.log : [],
    raffle_winner: Boolean(input.raffleWinner),
    raffle_placing: typeof input.rafflePlacing === "number" ? input.rafflePlacing : 0,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("players")
    .insert(payload)
    .select("id, name")
    .single();

  if (insertError) throw insertError;

  await replacePlayerAssignments(inserted.id, input.teamAssignments || []);
  const player = await getPlayerByName(inserted.name);
  if (!player) throw new Error("Failed to load created player");
  return player;
};

type UpdatePlayerInput = {
  name?: string;
  points?: number;
  participation?: string[];
  log?: string[];
  raffleWinner?: boolean;
  rafflePlacing?: number;
  teamAssignments?: TeamAssignment[];
};

export const updatePlayerByName = async (
  oldName: string,
  input: UpdatePlayerInput
): Promise<Player> => {
  const { data: existing, error: existingError } = await supabase
    .from("players")
    .select("id")
    .eq("name", oldName)
    .maybeSingle();

  if (existingError) throw existingError;
  if (!existing) throw new Error("Player not found");

  const updates: TableUpdate<"players"> = {};

  if (typeof input.name === "string" && input.name.trim()) updates.name = input.name.trim();
  if (typeof input.points === "number") updates.points = input.points;
  if (Array.isArray(input.participation)) updates.participation = input.participation;
  if (Array.isArray(input.log)) updates.log = input.log;
  if (typeof input.raffleWinner === "boolean") updates.raffle_winner = input.raffleWinner;
  if (typeof input.rafflePlacing === "number") updates.raffle_placing = input.rafflePlacing;

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from("players")
      .update(updates)
      .eq("id", existing.id);

    if (updateError) throw updateError;
  }

  if ("teamAssignments" in input) {
    await replacePlayerAssignments(existing.id, input.teamAssignments || []);
  }

  const targetName = typeof updates.name === "string" ? updates.name : oldName;
  const updated = await getPlayerByName(targetName);
  if (!updated) throw new Error("Failed to load updated player");

  return updated;
};

export const deletePlayerByName = async (name: string): Promise<void> => {
  const { data, error } = await supabase
    .from("players")
    .delete()
    .eq("name", name)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Player not found");
};

export const updateAllPlayersRaffleState = async (
  raffleWinner: boolean,
  rafflePlacing: number
): Promise<void> => {
  const { error } = await supabase
    .from("players")
    .update({ raffle_winner: raffleWinner, raffle_placing: rafflePlacing })
    .not("id", "is", null);

  if (error) throw error;
};

export const usePlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const rows = await fetchPlayers();
      setPlayers(rows);
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Failed to load players");
      setError(nextError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addPlayer = useCallback(
    async (input: CreatePlayerInput) => {
      const created = await createPlayer(input);
      await refresh();
      return created;
    },
    [refresh]
  );

  const patchPlayerByName = useCallback(
    async (oldName: string, input: UpdatePlayerInput) => {
      const updated = await updatePlayerByName(oldName, input);
      await refresh();
      return updated;
    },
    [refresh]
  );

  const removePlayerByName = useCallback(
    async (name: string) => {
      await deletePlayerByName(name);
      await refresh();
    },
    [refresh]
  );

  return {
    players,
    loading,
    error,
    refresh,
    addPlayer,
    patchPlayerByName,
    removePlayerByName,
  };
};

export const usePlayerByName = (name: string | null | undefined) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!name) {
      setPlayer(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      setError(null);
      const row = await getPlayerByName(name);
      setPlayer(row);
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Failed to load player");
      setError(nextError);
      setPlayer(null);
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    player,
    loading,
    error,
    refresh,
  };
};
