import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export type CheckInRecord = {
  userId: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  checkedInBy: string | null;
};

export const checkInByUserId = async (
  userId: string,
  staffUserId: string
): Promise<void> => {
  const { data, error } = await supabase
    .from("registrations")
    .update({
      checked_in: true,
      checked_in_at: new Date().toISOString(),
      checked_in_by: staffUserId,
    })
    .eq("user_id", userId)
    .select("user_id");

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("This player hasn't completed event registration. Ask them to register before checking in.");
  }
};

export const checkOutByUserId = async (userId: string): Promise<void> => {
  const { data, error } = await supabase
    .from("registrations")
    .update({
      checked_in: false,
      checked_in_at: null,
      checked_in_by: null,
    })
    .eq("user_id", userId)
    .select("user_id");

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("Check-out failed — player may not be registered.");
  }
};

export const resetAllCheckInStatuses = async (): Promise<number> => {
  const { data, error } = await supabase
    .from("registrations")
    .update({
      checked_in: false,
      checked_in_at: null,
      checked_in_by: null,
    })
    .eq("checked_in", true)
    .select("user_id");

  if (error) throw error;

  return data?.length ?? 0;
};

// For staff/admin panels — fetches check-in status for all registered users.
// Players without a registrations row are included with checkedIn: false.
export const useCheckInRoster = () => {
  const [checkIns, setCheckIns] = useState<Map<string, CheckInRecord>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);

      // Fetch all player user_ids so we can include players without registrations
      const [{ data: playerRows, error: playerError }, { data: regRows, error: regError }] =
        await Promise.all([
          supabase.from("players").select("user_id"),
          supabase.from("registrations").select("user_id, checked_in, checked_in_at, checked_in_by"),
        ]);

      if (playerError) throw playerError;
      if (regError) throw regError;

      const map = new Map<string, CheckInRecord>();

      // Seed all players with a default "not checked in" record
      for (const row of playerRows || []) {
        map.set(row.user_id, {
          userId: row.user_id,
          checkedIn: false,
          checkedInAt: null,
          checkedInBy: null,
        });
      }

      // Overlay actual registration check-in data
      for (const row of regRows || []) {
        map.set(row.user_id, {
          userId: row.user_id,
          checkedIn: (row as { checked_in?: boolean }).checked_in ?? false,
          checkedInAt:
            (row as { checked_in_at?: string | null }).checked_in_at ?? null,
          checkedInBy:
            (row as { checked_in_by?: string | null }).checked_in_by ?? null,
        });
      }

      setCheckIns(map);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load check-ins")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const checkIn = useCallback(
    async (userId: string, staffUserId: string) => {
      await checkInByUserId(userId, staffUserId);
      await refresh();
    },
    [refresh]
  );

  const checkOut = useCallback(
    async (userId: string) => {
      await checkOutByUserId(userId);
      await refresh();
    },
    [refresh]
  );

  return { checkIns, loading, error, refresh, checkIn, checkOut };
};
