import { useEffect, useState } from "react";

type TournamentEvent = { id: string | number; name: string };
type EventSetSlot = {
  entrant: { name: string } | null;
  standing: { stats: { score: { value: number | null } | null } | null } | null;
};
type EventSetNode = { id: string | number; slots: EventSetSlot[] };
type EventSetsResult = { eventId: string | number; eventName: string; nodes: EventSetNode[] };

const API_BASE = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? "";
const TOURNAMENT_SLUG = "gamefest-spring-2021";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.toLowerCase().includes("application/json");
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status} ${response.statusText}${text ? `: ${text}` : ""}`);
  }
  if (!isJson) {
    const text = await response.text().catch(() => "");
    const snippet = text.slice(0, 200).replace(/\s+/g, " ").trim();
    throw new Error(`Expected JSON but got "${contentType || "unknown"}"${snippet ? `: ${snippet}` : ""}`);
  }
  return (await response.json()) as T;
}

export default function Events() {
  const [events, setEvents] = useState<TournamentEvent[]>([]);
  const [eventSetsResults, setEventSetsResults] = useState<EventSetsResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchJson<{ events: TournamentEvent[] }>(
          `/api/startgg/tournaments/${encodeURIComponent(TOURNAMENT_SLUG)}/events`
        );
        setEvents(result.events ?? []);
        setEventSetsResults([]);

        const perPage = 50;
        const page = 1;

        // Simple batching to avoid slamming the API.
        const batchSize = 4;
        for (let i = 0; i < (result.events ?? []).length; i += batchSize) {
          const batch = (result.events ?? []).slice(i, i + batchSize);
          const batchResults = await Promise.all(
            batch.map((event) =>
              fetchJson<EventSetsResult>(
                `/api/startgg/events/${encodeURIComponent(String(event.id))}/sets?page=${page}&perPage=${perPage}`
              )
            )
          );
          setEventSetsResults((prev) => [...prev, ...batchResults]);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div>
      <h2>Events</h2>
      {loading && <p>Loading events + sets...</p>}
      {error && (
        <p style={{ color: "crimson" }}>
          Error: {error} {API_BASE ? `(VITE_BACKEND_URL=${API_BASE})` : "(same-origin /api)"}
        </p>
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "10px 0" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>Event</span>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            style={{
              padding: 8,
              border: "1px solid #ccc",
              borderRadius: 6,
              background: "#fff",
              color: "#000",
            }}
          >
            <option value="" disabled>
              Select an event...
            </option>
            {events.map((event) => (
              <option key={String(event.id)} value={String(event.id)}>
                {event.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedEventId &&
        !error &&
        !eventSetsResults.some((r) => String(r.eventId) === selectedEventId) && (
          <p style={{ opacity: 0.8 }}>Loading sets for selected event...</p>
        )}

      {(() => {
        if (!selectedEventId) return null;

        const data = eventSetsResults.find((r) => String(r.eventId) === selectedEventId);
        if (!data) return null;

        return (
          <div style={{ border: "1px solid #ddd", padding: 10, margin: "10px 0" }}>
            <h3 style={{ margin: 0 }}>
              {data.eventName} <span style={{ opacity: 0.7 }}>({String(data.eventId)})</span>
            </h3>

            {data.nodes.length === 0 ? (
              <p style={{ marginTop: 8, opacity: 0.8 }}>No sets found.</p>
            ) : (
              <div style={{ marginTop: 10 }}>
                {data.nodes.map((setNode, idx) => (
                  <div key={String(setNode.id ?? idx)} style={{ padding: "6px 0", borderTop: "1px solid #eee" }}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Set {idx + 1}</div>
                    {setNode.slots.map((slot, slotIdx) => {
                      const name = slot.entrant?.name ?? "TBD";
                      const score = slot.standing?.stats?.score?.value;
                      return (
                        <div key={slotIdx} style={{ display: "flex", gap: 8 }}>
                          <div style={{ minWidth: 18, opacity: 0.7 }}>#{slotIdx + 1}</div>
                          <div style={{ flex: 1 }}>{name}</div>
                          <div style={{ width: 40, textAlign: "right" }}>{score ?? "-"}</div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
