import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import type { Game, GameTeam, UpdateGameInput } from "../schemas/GamesSchema";

type PlayerUserJoin = {
  users:
    | { username: string | null; fname: string | null; lname: string | null }
    | Array<{ username: string | null; fname: string | null; lname: string | null }>
    | null;
};

type TeamAssignmentJoinRow = {
  team_id: string | null;
  players: PlayerUserJoin | PlayerUserJoin[] | null;
};

const unwrapRelation = <T>(value: T | T[] | null | undefined): T | null => {
  if (!value) return null;
  return Array.isArray(value) ? value[0] || null : value;
};

export const fetchGames = async (name?: string): Promise<Game[]> => {
  let gameQuery = supabase.from("games").select("id, name, max_points").order("name");

  if (name) {
    gameQuery = gameQuery.eq("name", name);
  }

  const { data: games, error: gameError } = await gameQuery;
  if (gameError) throw gameError;
  if (!games || games.length === 0) return [];

  const gameIds = games.map((game) => game.id);

  const { data: teams, error: teamError } = await supabase
    .from("teams")
    .select("id, name, game_id")
    .in("game_id", gameIds)
    .order("name", { ascending: true });

  if (teamError) throw teamError;

  const teamIds = (teams || []).map((team) => team.id);

  let assignments: TeamAssignmentJoinRow[] = [];

  if (teamIds.length > 0) {
    const { data, error } = await supabase
      .from("team_assignments")
      .select("team_id, players ( users ( username, fname, lname ) )")
      .in("team_id", teamIds);

    if (error) throw error;
    assignments = (data || []) as unknown as TeamAssignmentJoinRow[];
  }

  const teamPlayers = new Map<string, string[]>();

  for (const assignment of assignments) {
    const player = unwrapRelation(assignment.players);
    const user = unwrapRelation(player?.users);
    const full = [user?.fname, user?.lname].filter(Boolean).join(" ");
    const displayName = full || user?.username || null;
    if (!assignment.team_id || !displayName) continue;

    const existing = teamPlayers.get(assignment.team_id) || [];
    existing.push(displayName);
    teamPlayers.set(assignment.team_id, existing);
  }

  const gameMap = new Map(games.map((game) => [
    game.id,
    {
      id: game.id,
      name: game.name,
      maxPoints: game.max_points,
      teams: [] as GameTeam[],
    }
  ]));

  for (const team of teams || []) {
    if (!team.game_id) continue;

    const gameEntry = gameMap.get(team.game_id);
    if (!gameEntry) continue;

    gameEntry.teams.push({
      name: team.name,
      players: (teamPlayers.get(team.id) || []).sort((a, b) => a.localeCompare(b)),
    });
  }

  return games
    .map((game) => gameMap.get(game.id))
    .filter((game): game is Game => Boolean(game));
};

export const getGameByName = async (name: string): Promise<Game | null> => {
  const games = await fetchGames(name);
  return games[0] || null;
};

export const createGame = async (
  name: string,
  maxPoints = 50
): Promise<Game> => {
  const trimmedName = name.trim();

  const { data: inserted, error: insertError } = await supabase
    .from("games")
    .insert({ name: trimmedName, max_points: maxPoints })
    .select("id")
    .single();

  if (insertError) throw insertError;

  const allGames = await fetchGames();
  const game = allGames.find((g) => g.id === inserted.id);
  if (!game) throw new Error("Failed to load created game");

  return game;
};

export const updateGameByName = async (
  oldName: string,
  input: UpdateGameInput
): Promise<Game> => {
  const { data: existing, error: existingError } = await supabase
    .from("games")
    .select("id")
    .eq("name", oldName)
    .maybeSingle();

  if (existingError) throw existingError;
  if (!existing) throw new Error("Game not found");

  const updates: { name?: string; max_points?: number } = {};
  if (typeof input.name === "string" && input.name.trim()) {
    updates.name = input.name.trim();
  }
  if (typeof input.maxPoints === "number") {
    updates.max_points = input.maxPoints;
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from("games")
      .update(updates)
      .eq("id", existing.id);

    if (updateError) throw updateError;
  }

  if (Array.isArray(input.teams)) {
    const { error: deleteError } = await supabase
      .from("teams")
      .delete()
      .eq("game_id", existing.id);

    if (deleteError) throw deleteError;

    const rows = input.teams
      .filter((team) => typeof team?.name === "string" && team.name.trim())
      .map((team) => ({ game_id: existing.id, name: team.name.trim() }));

    if (rows.length > 0) {
      const { error: insertError } = await supabase.from("teams").insert(rows);
      if (insertError) throw insertError;
    }
  }

  const targetName = updates.name || oldName;
  const allGames = await fetchGames();
  const game = allGames.find((g) => g.name === targetName);
  if (!game) throw new Error("Failed to load updated game");
  return game;
};

export const deleteGameByName = async (name: string): Promise<void> => {
  const { data, error } = await supabase
    .from("games")
    .delete()
    .eq("name", name)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Game not found");
};

export const useGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      setError(null);
      const rows = await fetchGames();
      setGames(rows);
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Failed to load games");
      setError(nextError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addGame = useCallback(
    async (name: string, maxPoints?: number) => {
      const game = await createGame(name, maxPoints);
      await refresh();
      return game;
    },
    [refresh]
  );

  const patchGameByName = useCallback(
    async (oldName: string, input: UpdateGameInput) => {
      const game = await updateGameByName(oldName, input);
      await refresh();
      return game;
    },
    [refresh]
  );

  const removeGameByName = useCallback(
    async (name: string) => {
      await deleteGameByName(name);
      await refresh();
    },
    [refresh]
  );

  return {
    games,
    loading,
    error,
    refresh,
    addGame,
    patchGameByName,
    removeGameByName,
  };
};
