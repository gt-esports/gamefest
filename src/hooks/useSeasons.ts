import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import type { Database } from "../types/database.types";

export type Season = Database["public"]["Tables"]["seasons"]["Row"];

export type SeasonDetails = {
  startsOn: string | null;
  endsOn: string | null;
  tournamentSlug: string | null;
};

export const fetchSeasons = async (): Promise<Season[]> => {
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const useSeasons = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setSeasons(await fetchSeasons());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load seasons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const saveActive = async (seasonId: string, details: SeasonDetails) => {
    const { error: saveError } = await supabase.rpc("update_active_season", {
      p_season_id: seasonId,
      p_starts_on: details.startsOn,
      p_ends_on: details.endsOn,
      p_tournament_slug: details.tournamentSlug ?? "",
    });
    if (saveError) throw saveError;
    await refresh();
  };

  return { seasons, loading, error, refresh, saveActive };
};
