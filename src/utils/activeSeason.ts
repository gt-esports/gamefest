import { supabase } from "./supabaseClient";

export const getActiveSeasonId = async (): Promise<string> => {
  const { data, error } = await supabase.rpc("get_active_season_id");
  if (error) throw error;
  if (!data) throw new Error("No active GameFest season is configured.");
  return data;
};
