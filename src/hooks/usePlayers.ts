import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import type {
  TableInsert,
  TableUpdate,
} from "../types/database.types";
import type {
  CreatePlayerInput,
  Player,
  TeamAssignment,
  UpdatePlayerInput,
} from "../schemas/PlayerSchema";

export type { Player, TeamAssignment, CreatePlayerInput, UpdatePlayerInput };

type PlayerRowWithUser = {
  id: string;
  log: string[] | null;
  participation: string[] | null;
  points: number | null;
  raffle_placing: number | null;
  raffle_winner: boolean | null;
  user_id: string;
  users:
    | {
        username: string | null;
        fname: string | null;
        lname: string | null;
      }
    | Array<{
        username: string | null;
        fname: string | null;
        lname: string | null;
      }>
    | null;
};

type AssignmentJoinRow = {
  player_id: string | null;
  teams:
    | {
        name: string | null;
        games:
          | { name: string | null }
          | Array<{ name: string | null }>
          | null;
      }
    | Array<{
        name: string | null;
        games:
          | { name: string | null }
          | Array<{ name: string | null }>
          | null;
      }>
    | null;
};

const PLAYER_SELECT =
  "id, points, participation, log, raffle_winner, raffle_placing, user_id, users ( username, fname, lname )";

const unwrapRelation = <T>(value: T | T[] | null | undefined): T | null => {
  if (!value) return null;
  return Array.isArray(value) ? value[0] || null : value;
};

const normalizeStringArray = (value: string[] | null | undefined): string[] =>
  Array.isArray(value) ? value : [];

const displayNameFor = (row: PlayerRowWithUser): string => {
  const user = unwrapRelation(row.users);
  const full = [user?.fname, user?.lname].filter(Boolean).join(" ");
  return full || user?.username || "Unknown";
};

const toPlayer = (
  row: PlayerRowWithUser,
  teamAssignments: TeamAssignment[]
): Player => {
  const user = unwrapRelation(row.users);
  return {
    id: row.id,
    userId: row.user_id,
    name: displayNameFor(row),
    username: user?.username ?? null,
    points: row.points ?? 0,
    participation: normalizeStringArray(row.participation),
    log: normalizeStringArray(row.log),
    teamAssignments,
    raffleWinner: row.raffle_winner ?? false,
    rafflePlacing: row.raffle_placing ?? 0,
  };
};

const mapPlayerAssignments = (
  assignments: AssignmentJoinRow[]
): Map<string, TeamAssignment[]> => {
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

export const fetchPlayers = async ({
  id,
  userId,
}: {
  id?: string;
  userId?: string;
} = {}): Promise<Player[]> => {
  let playerQuery = supabase.from("players").select(PLAYER_SELECT);

  if (id) {
    playerQuery = playerQuery.eq("id", id);
  } else if (userId) {
    playerQuery = playerQuery.eq("user_id", userId);
  }

  const { data: players, error: playerError } = await playerQuery;
  if (playerError) throw playerError;
  if (!players || players.length === 0) return [];

  const rows = players as unknown as PlayerRowWithUser[];
  const playerIds = rows.map((player) => player.id);

  const { data: assignments, error: assignmentError } = await supabase
    .from("team_assignments")
    .select("player_id, teams(name, games(name))")
    .in("player_id", playerIds);

  if (assignmentError) throw assignmentError;

  const assignmentsByPlayer = mapPlayerAssignments(
    (assignments || []) as AssignmentJoinRow[]
  );

  const result = rows.map((row) =>
    toPlayer(row, assignmentsByPlayer.get(row.id) || [])
  );

  // Sort by display name for stable UI ordering.
  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
};

export const getPlayerById = async (id: string): Promise<Player | null> => {
  const players = await fetchPlayers({ id });
  return players[0] || null;
};

export const getPlayerByUserId = async (
  userId: string
): Promise<Player | null> => {
  const players = await fetchPlayers({ userId });
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

const ensureTeamId = async (
  gameName: string,
  teamName: string
): Promise<string> => {
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

  const { error: insertError } = await supabase
    .from("team_assignments")
    .insert(rows);
  if (insertError) throw insertError;
};

export const createPlayer = async (
  input: CreatePlayerInput
): Promise<Player> => {
  const payload: TableInsert<"players"> = {
    user_id: input.userId,
    points: typeof input.points === "number" ? input.points : 0,
    participation: Array.isArray(input.participation)
      ? input.participation
      : [],
    log: Array.isArray(input.log) ? input.log : [],
    raffle_winner: Boolean(input.raffleWinner),
    raffle_placing:
      typeof input.rafflePlacing === "number" ? input.rafflePlacing : 0,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("players")
    .insert(payload)
    .select("id")
    .single();

  if (insertError) throw insertError;

  await replacePlayerAssignments(inserted.id, input.teamAssignments || []);
  const player = await getPlayerById(inserted.id);
  if (!player) throw new Error("Failed to load created player");
  return player;
};

export const updatePlayerById = async (
  id: string,
  input: UpdatePlayerInput
): Promise<Player> => {
  const updates: TableUpdate<"players"> = {};

  if (typeof input.points === "number") updates.points = input.points;
  if (Array.isArray(input.participation))
    updates.participation = input.participation;
  if (Array.isArray(input.log)) updates.log = input.log;
  if (typeof input.raffleWinner === "boolean")
    updates.raffle_winner = input.raffleWinner;
  if (typeof input.rafflePlacing === "number")
    updates.raffle_placing = input.rafflePlacing;

  if (Object.keys(updates).length > 0) {
    // .select() forces PostgREST to return affected rows so we can detect
    // silent RLS blocks (0 rows updated, no error otherwise).
    const { data: updatedRows, error: updateError } = await supabase
      .from("players")
      .update(updates)
      .eq("id", id)
      .select("id");

    if (updateError) throw updateError;
    if (!updatedRows || updatedRows.length === 0) {
      throw new Error(
        "Update blocked — likely insufficient permissions (RLS) or player not found."
      );
    }
  }

  if ("teamAssignments" in input) {
    await replacePlayerAssignments(id, input.teamAssignments || []);
  }

  const updated = await getPlayerById(id);
  if (!updated) throw new Error("Failed to load updated player");

  return updated;
};

export const deletePlayerById = async (id: string): Promise<void> => {
  const { data, error } = await supabase
    .from("players")
    .delete()
    .eq("id", id)
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
      const nextError =
        err instanceof Error ? err : new Error("Failed to load players");
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

  const patchPlayerById = useCallback(
    async (id: string, input: UpdatePlayerInput) => {
      const updated = await updatePlayerById(id, input);
      await refresh();
      return updated;
    },
    [refresh]
  );

  const removePlayerById = useCallback(
    async (id: string) => {
      await deletePlayerById(id);
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
    patchPlayerById,
    removePlayerById,
  };
};

export const useCurrentPlayer = (userId: string | null | undefined) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setPlayer(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      setError(null);
      const row = await getPlayerByUserId(userId);
      setPlayer(row);
    } catch (err) {
      const nextError =
        err instanceof Error
          ? err
          : new Error("Failed to load player for user");
      setError(nextError);
      setPlayer(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

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
