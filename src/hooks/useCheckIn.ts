import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export type CheckInRecord = {
  userId: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  checkedInBy: string | null;
};

export type CheckInEvent = {
  id: string;
  eventType: "check_in" | "check_out";
  occurredAt: string;
  performedBy: string | null;
  performedByName: string | null;
};

// Mutations go through SECURITY INVOKER plpgsql RPCs so the registration
// update and the check_in_events audit insert commit atomically. The DB
// binds performed_by to auth.uid(); the client cannot forge a performer.

export const checkInByUserId = async (userId: string): Promise<void> => {
  const { error } = await supabase.rpc("check_in_user", { p_user_id: userId });
  if (error) throw error;
};

export const checkOutByUserId = async (userId: string): Promise<void> => {
  const { error } = await supabase.rpc("check_out_user", { p_user_id: userId });
  if (error) throw error;
};

export const resetAllCheckInStatuses = async (): Promise<number> => {
  const { data, error } = await supabase.rpc("reset_all_check_ins");
  if (error) throw error;
  return data ?? 0;
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
    async (userId: string) => {
      await checkInByUserId(userId);
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

// Fetches the append-only check-in/check-out log for a single user,
// newest first, with the performer's name joined for display.
export const useCheckInEvents = (userId: string | null) => {
  const [events, setEvents] = useState<CheckInEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setEvents([]);
      return;
    }
    setLoading(true);
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("check_in_events")
        .select(
          "id, event_type, occurred_at, performed_by, performer:users!check_in_events_performed_by_fkey(fname, lname, username)"
        )
        .eq("user_id", userId)
        .order("occurred_at", { ascending: false });

      if (fetchError) throw fetchError;

      type Row = {
        id: string;
        event_type: "check_in" | "check_out";
        occurred_at: string;
        performed_by: string | null;
        performer:
          | { fname: string | null; lname: string | null; username: string | null }
          | null;
      };

      setEvents(
        ((data ?? []) as unknown as Row[]).map((r) => {
          const p = r.performer;
          const name = p
            ? [p.fname, p.lname].filter(Boolean).join(" ").trim() ||
              p.username ||
              null
            : null;
          return {
            id: r.id,
            eventType: r.event_type,
            occurredAt: r.occurred_at,
            performedBy: r.performed_by,
            performedByName: name,
          };
        })
      );
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load check-in events")
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { events, loading, error, refresh };
};
