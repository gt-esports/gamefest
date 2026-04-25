import { supabase } from "../utils/supabaseClient";

export class AwardCapExceededError extends Error {
  constructor() {
    super("Award would exceed the per-game or per-challenge cap.");
    this.name = "AwardCapExceededError";
  }
}

// Atomic point award. Inserts the player_activity audit row, increments
// players.points, and appends the log entry inside a single DB transaction.
// The RPC also enforces the per-(player, game/challenge) cap and binds
// awarded_by to auth.uid() server-side, so the client cannot forge an
// awarder or race past the cap. Exactly one of gameId / challengeId must
// be non-null. Returns the new player_activity.id.
export const awardPointsAtomic = async (
  playerId: string,
  gameId: string | null,
  challengeId: string | null,
  pointsAwarded: number,
  logEntry: string
): Promise<string> => {
  const { data, error } = await supabase.rpc("award_points", {
    p_player_id: playerId,
    p_game_id: gameId,
    p_challenge_id: challengeId,
    p_amount: pointsAwarded,
    p_log_entry: logEntry,
  });
  if (error) {
    if (error.message?.includes("CAP_EXCEEDED")) {
      throw new AwardCapExceededError();
    }
    throw error;
  }
  return data as string;
};

/**
 * Delete specific activity rows by ID. Used by the "undo last award" flow
 * to reverse a single batch of awards without touching earlier history.
 */
export const deleteActivitiesByIds = async (
  ids: string[]
): Promise<void> => {
  if (ids.length === 0) return;
  const { error } = await supabase
    .from("player_activity")
    .delete()
    .in("id", ids);
  if (error) throw error;
};

/**
 * Return the total points a player has received for a given game OR challenge.
 * Pass exactly one of gameId / challengeId as non-null.
 */
export const getActivityTotal = async (
  playerId: string,
  gameId: string | null,
  challengeId: string | null
): Promise<number> => {
  let query = supabase
    .from("player_activity")
    .select("points_awarded")
    .eq("player_id", playerId);

  if (gameId) {
    query = query.eq("game_id", gameId);
  } else if (challengeId) {
    query = query.eq("challenge_id", challengeId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).reduce((sum, row) => sum + row.points_awarded, 0);
};

/**
 * Delete all activity rows for a given player + staff user + game/challenge.
 * Returns the sum of points deleted (for subtracting from players.points).
 * Used by the revoke flow.
 */
export const deleteActivitiesBy = async (
  playerId: string,
  awardedByUserId: string,
  gameId: string | null,
  challengeId: string | null
): Promise<number> => {
  // First fetch the rows to compute the sum before deleting.
  let selectQuery = supabase
    .from("player_activity")
    .select("points_awarded")
    .eq("player_id", playerId)
    .eq("awarded_by", awardedByUserId);

  if (gameId) {
    selectQuery = selectQuery.eq("game_id", gameId);
  } else if (challengeId) {
    selectQuery = selectQuery.eq("challenge_id", challengeId);
  }

  const { data: toDelete, error: selectError } = await selectQuery;
  if (selectError) throw selectError;

  const total = (toDelete || []).reduce((sum, row) => sum + row.points_awarded, 0);
  if (total === 0) return 0;

  let deleteQuery = supabase
    .from("player_activity")
    .delete()
    .eq("player_id", playerId)
    .eq("awarded_by", awardedByUserId);

  if (gameId) {
    deleteQuery = deleteQuery.eq("game_id", gameId);
  } else if (challengeId) {
    deleteQuery = deleteQuery.eq("challenge_id", challengeId);
  }

  const { error: deleteError } = await deleteQuery;
  if (deleteError) throw deleteError;

  return total;
};
