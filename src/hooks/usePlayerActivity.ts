import { supabase } from "../utils/supabaseClient";

/**
 * Insert one point-award record for a player for a specific game or challenge.
 * Exactly one of gameId / challengeId must be non-null.
 */
export const recordActivity = async (
  playerId: string,
  gameId: string | null,
  challengeId: string | null,
  pointsAwarded: number,
  awardedByUserId: string
): Promise<void> => {
  const { error } = await supabase.from("player_activity").insert({
    player_id: playerId,
    game_id: gameId,
    challenge_id: challengeId,
    points_awarded: pointsAwarded,
    awarded_by: awardedByUserId,
  });
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
