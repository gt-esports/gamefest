import { useEffect, useState } from "react";
import { useSeasons } from "../hooks/useSeasons";

// ── Types ─────────────────────────────────────────────────────────────────────
type TournamentEvent = { id: string | number; name: string };
type EventPhasesResult = {
  eventId: string | number;
  phases: Array<{ id: string | number; name: string; phaseGroupIds: Array<string | number> }>;
};
type PhasePoolsResult = {
  phaseId: string | number;
  phaseName: string;
  phaseGroups: Array<{ id: string | number; displayIdentifier: string | null }>;
};
type PhaseGroupSetSlot = {
  id: string | number;
  entrant: { id: string | number; name: string } | null;
  standing: { stats: { score: { value: number | null } | null } | null } | null;
};
type PhaseGroupSetNode = { id: string | number; slots: PhaseGroupSetSlot[] };
type PhaseGroupSetsResult = {
  phaseGroupId: string | number;
  displayIdentifier: string | null;
  total: number;
  nodes: PhaseGroupSetNode[];
};
type EventStandingsResult = {
  eventId: string | number;
  eventName: string;
  nodes: Array<{ placement: number; entrant: { id: string | number; name: string } | null }>;
};
type PhaseGroupResultsResult = {
  phaseGroupId: string | number;
  nodes: Array<{
    id: string | number;
    winnerId: string | number | null;
    slots: Array<{ entrant: { id: string | number; name: string } | null }>;
  }>;
};

// ── Config ────────────────────────────────────────────────────────────────────
const API_BASE = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? "";

// ── Design tokens ─────────────────────────────────────────────────────────────
const SURFACE = "rgba(15, 31, 60, 0.88)";
const SURFACE_CARD = "rgba(6, 15, 38, 0.92)";
const SURFACE_SOFT = "rgba(0, 68, 102, 0.18)";
const BORDER = "rgba(0, 153, 187, 0.2)";
const BORDER_STRONG = "rgba(0, 212, 255, 0.55)";
const TEXT = "#eef5ff";
const MUTED = "rgba(160, 200, 230, 0.5)";
const ACCENT = "#0099BB";
const ACCENT_BRIGHT = "#00D4FF";
const ERROR = "#f87171";
const WIN_COLOR = "#4ade80";
const WIN_BG = "rgba(74, 222, 128, 0.07)";
const WINNERS_COLOR = "#f0b429";
const LOSERS_COLOR = "#fb923c";

// ── Utility helpers ───────────────────────────────────────────────────────────
function hasOtherDQ(slots: PhaseGroupSetSlot[], currentSlot: PhaseGroupSetSlot): boolean {
  return slots.some((s) => s !== currentSlot && s.standing?.stats?.score?.value === -1);
}

function getScoreStyle(slots: PhaseGroupSetSlot[], currentSlot: PhaseGroupSetSlot) {
  const score = currentSlot.standing?.stats?.score?.value ?? null;
  if (score === -1) return { color: ERROR, fontWeight: 600 as const };
  if (hasOtherDQ(slots, currentSlot)) return { color: WIN_COLOR, fontWeight: 600 as const };
  if (score == null) return undefined;
  const others = slots
    .filter((s) => s !== currentSlot)
    .map((s) => s.standing?.stats?.score?.value ?? null)
    .filter((v): v is number => v != null && v !== -1);
  if (others.length === 0) return undefined;
  const hi = Math.max(...others);
  const lo = Math.min(...others);
  if (score > hi) return { color: WIN_COLOR, fontWeight: 600 as const };
  if (score < lo) return { color: ERROR, fontWeight: 600 as const };
  return undefined;
}

function getOutcomeCharacterStyle(outcome: string) {
  if (outcome === "W") return { color: WIN_COLOR, fontWeight: 600 as const };
  if (outcome === "L") return { color: ERROR, fontWeight: 600 as const };
  return undefined;
}

function computeSlotOutcome(
  slot: PhaseGroupSetSlot,
  slots: PhaseGroupSetSlot[],
  results: PhaseGroupResultsResult | undefined,
  setId: string | number
) {
  const score = slot.standing?.stats?.score?.value ?? null;
  const matching = results?.nodes.find((r) => String(r.id) === String(setId));
  const winnerId = matching?.winnerId ?? null;
  const entrantId = slot.entrant?.id ?? null;
  const otherDQ = hasOtherDQ(slots, slot);
  const isDQ = score === -1;
  const outcome =
    isDQ ? "DQ"
    : otherDQ ? "W"
    : score != null ? String(score)
    : winnerId == null || entrantId == null ? "-"
    : String(winnerId) === String(entrantId) ? "W"
    : "L";
  const style = outcome === "W" || outcome === "L"
    ? getOutcomeCharacterStyle(outcome)
    : getScoreStyle(slots, slot);
  const isWinner = outcome === "W" || style?.color === WIN_COLOR;
  return { outcome, style, isWinner };
}

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

// ── Component ─────────────────────────────────────────────────────────────────
export default function Events() {
  const { seasons, loading: seasonsLoading, error: seasonsError } = useSeasons();
  const activeSeason = seasons.find((season) => season.is_active);
  const tournamentSlug = activeSeason?.tournament_slug;
  const [events, setEvents] = useState<TournamentEvent[]>([]);
  const [eventPhasesResults, setEventPhasesResults] = useState<Record<string, EventPhasesResult>>({});
  const [phasePoolsResults, setPhasePoolsResults] = useState<Record<string, PhasePoolsResult>>({});
  const [phaseGroupSetsResults, setPhaseGroupSetsResults] = useState<Record<string, PhaseGroupSetsResult>>({});
  const [phaseGroupResultsResults, setPhaseGroupResultsResults] = useState<Record<string, PhaseGroupResultsResult>>({});
  const [phaseGroupGroupedResults, setPhaseGroupGroupedResults] = useState<Record<string, any>>({});
  const [eventStandingsResults, setEventStandingsResults] = useState<Record<string, EventStandingsResult>>({});
  const [loadingPhases, setLoadingPhases] = useState(false);
  const [loadingPhasePools, setLoadingPhasePools] = useState(false);
  const [loadingPhaseGroupSets, setLoadingPhaseGroupSets] = useState(false);
  const [loadingPhaseGroupResults, setLoadingPhaseGroupResults] = useState(false);
  const [loadingStandings, setLoadingStandings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phasesError, setPhasesError] = useState<string | null>(null);
  const [phasePoolsError, setPhasePoolsError] = useState<string | null>(null);
  const [phaseGroupSetsError, setPhaseGroupSetsError] = useState<string | null>(null);
  const [phaseGroupResultsError, setPhaseGroupResultsError] = useState<string | null>(null);
  const [standingsError, setStandingsError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>("");
  const [selectedPhaseGroupId, setSelectedPhaseGroupId] = useState<string>("");
  const [phasesOpen, setPhasesOpen] = useState(true);

  useEffect(() => {
    if (seasonsLoading) return;
    const slug = tournamentSlug;
    if (!slug) {
      setEvents([]);
      setError(seasonsError ?? "The active season has no start.gg tournament configured yet.");
      return;
    }
    async function load(slugToLoad: string) {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchJson<{ events: TournamentEvent[] }>(
          `/api/startgg/tournaments/${encodeURIComponent(slugToLoad)}/events`
        );
        setEvents(result.events ?? []);
        setEventPhasesResults({});
        setPhasePoolsResults({});
        setPhaseGroupSetsResults({});
        setPhaseGroupResultsResults({});
        setEventStandingsResults({});
        setPhasesError(null);
        setPhasePoolsError(null);
        setPhaseGroupSetsError(null);
        setPhaseGroupResultsError(null);
        setStandingsError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    }
    void load(slug);
  }, [tournamentSlug, seasonsLoading, seasonsError]);

  useEffect(() => {
    setSelectedPhaseId("");
    setSelectedPhaseGroupId("");
    setPhasePoolsError(null);
    setPhaseGroupSetsError(null);
    setPhaseGroupResultsError(null);
    setStandingsError(null);
    setPhasesOpen(true);
  }, [selectedEventId]);

  useEffect(() => {
    setSelectedPhaseGroupId("");
    setPhasePoolsError(null);
    setPhaseGroupSetsError(null);
    setPhaseGroupResultsError(null);
    setStandingsError(null);
  }, [selectedPhaseId]);

  useEffect(() => {
    async function loadPhases(eventId: string) {
      setLoadingPhases(true);
      setPhasesError(null);
      try {
        const result = await fetchJson<EventPhasesResult>(
          `/api/startgg/events/${encodeURIComponent(eventId)}/phases?page=1&perPage=50`
        );
        setEventPhasesResults((prev) => ({ ...prev, [eventId]: result }));
      } catch (e) {
        setPhasesError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoadingPhases(false);
      }
    }
    if (!selectedEventId) return;
    if (eventPhasesResults[selectedEventId]) return;
    void loadPhases(selectedEventId);
  }, [selectedEventId, eventPhasesResults]);

  useEffect(() => {
    async function loadPhasePools(phaseId: string) {
      setLoadingPhasePools(true);
      setPhasePoolsError(null);
      try {
        const result = await fetchJson<PhasePoolsResult>(
          `/api/startgg/phases/${encodeURIComponent(phaseId)}/pools?page=1&perPage=50`
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        setPhasePoolsResults((prev) => ({ ...prev, [phaseId]: result }));
      } catch (e) {
        setPhasePoolsError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoadingPhasePools(false);
      }
    }
    if (!selectedPhaseId) return;
    if (phasePoolsResults[selectedPhaseId]) return;
    void loadPhasePools(selectedPhaseId);
  }, [selectedPhaseId, phasePoolsResults]);

  useEffect(() => {
    async function loadPhaseGroupSets(phaseGroupId: string) {
      setLoadingPhaseGroupSets(true);
      setPhaseGroupSetsError(null);
      try {
        const result = await fetchJson<PhaseGroupSetsResult>(
          `/api/startgg/phase-groups/${encodeURIComponent(phaseGroupId)}/sets?page=1&perPage=50`
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        setPhaseGroupSetsResults((prev) => ({ ...prev, [phaseGroupId]: result }));
        try {
          const grouped = await fetchJson<any>(
            `/api/startgg/phase-groups/${encodeURIComponent(phaseGroupId)}/sets/grouped?perPage=100`
          );
          setPhaseGroupGroupedResults((prev) => ({ ...prev, [phaseGroupId]: grouped }));
          // eslint-disable-next-line no-console
          console.log("phase-group grouped sets:", grouped);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("failed to fetch grouped sets:", e);
        }
      } catch (e) {
        setPhaseGroupSetsError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoadingPhaseGroupSets(false);
      }
    }
    if (!selectedPhaseGroupId) return;
    if (phaseGroupSetsResults[selectedPhaseGroupId]) return;
    void loadPhaseGroupSets(selectedPhaseGroupId);
  }, [selectedPhaseGroupId, phaseGroupSetsResults]);

  useEffect(() => {
    if (!selectedPhaseId) return;
    const pools = phasePoolsResults[selectedPhaseId];
    if (!pools) return;
    if (pools.phaseGroups.length !== 1) return;
    const onlyId = String(pools.phaseGroups[0]?.id ?? "");
    if (!onlyId) return;
    if (selectedPhaseGroupId === onlyId) return;
    setSelectedPhaseGroupId(onlyId);
  }, [selectedPhaseId, phasePoolsResults, selectedPhaseGroupId]);

  useEffect(() => {
    async function loadPhaseGroupResults(phaseGroupId: string) {
      setLoadingPhaseGroupResults(true);
      setPhaseGroupResultsError(null);
      try {
        const result = await fetchJson<PhaseGroupResultsResult>(
          `/api/startgg/phase-groups/${encodeURIComponent(phaseGroupId)}/results?perPage=100`
        );
        setPhaseGroupResultsResults((prev) => ({ ...prev, [phaseGroupId]: result }));
      } catch (e) {
        setPhaseGroupResultsError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoadingPhaseGroupResults(false);
      }
    }
    if (!selectedPhaseGroupId) return;
    const phaseGroup = phaseGroupSetsResults[selectedPhaseGroupId];
    if (!phaseGroup) return;
    const hasAnyScore = phaseGroup.nodes.some((n) =>
      n.slots.some((s) => s.standing?.stats?.score?.value != null)
    );
    if (hasAnyScore) return;
    if (phaseGroupResultsResults[selectedPhaseGroupId]) return;
    void loadPhaseGroupResults(selectedPhaseGroupId);
  }, [selectedPhaseGroupId, phaseGroupSetsResults, phaseGroupResultsResults]);

  useEffect(() => {
    async function loadStandings(eventId: string) {
      setLoadingStandings(true);
      setStandingsError(null);
      try {
        const result = await fetchJson<EventStandingsResult>(
          `/api/startgg/events/${encodeURIComponent(eventId)}/standings?page=1&perPage=50`
        );
        setEventStandingsResults((prev) => ({ ...prev, [eventId]: result }));
      } catch (e) {
        setStandingsError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoadingStandings(false);
      }
    }
    if (!selectedEventId) return;
    if (!selectedPhaseGroupId) return;
    if (eventStandingsResults[selectedEventId]) return;
    void loadStandings(selectedEventId);
  }, [selectedEventId, selectedPhaseGroupId, eventStandingsResults]);

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderMatchCard = (s: any, key: string) => {
    const slots: PhaseGroupSetSlot[] = s.slots ?? [];
    const results = phaseGroupResultsResults[selectedPhaseGroupId];
    return (
      <div
        key={key}
        style={{
          background: SURFACE_CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 2px 14px rgba(0,0,0,0.4)",
        }}
      >
        {slots.map((slot, si) => {
          const { outcome, style, isWinner } = computeSlotOutcome(slot, slots, results, s.id);
          const isLoser = outcome === "L" || outcome === "DQ";
          return (
            <div
              key={si}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "9px 12px",
                background: isWinner ? WIN_BG : "transparent",
                borderTop: si > 0 ? `1px solid ${BORDER}` : "none",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isWinner ? WIN_COLOR : "transparent",
                  border: !isWinner ? `1px solid rgba(0,153,187,0.3)` : "none",
                  marginRight: 10,
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: isWinner ? 600 : 400,
                  opacity: isLoser ? 0.45 : 1,
                  color: TEXT,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  minWidth: 0,
                }}
              >
                {slot.entrant?.name ?? "TBD"}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  marginLeft: 8,
                  minWidth: 28,
                  textAlign: "right",
                  ...style,
                }}
              >
                {outcome}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderResultsMatchCard = (
    setNode: PhaseGroupResultsResult["nodes"][number],
    idx: number
  ) => {
    return (
      <div
        key={String(setNode.id ?? idx)}
        style={{
          background: SURFACE_CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 2px 14px rgba(0,0,0,0.4)",
          marginBottom: 8,
        }}
      >
        {setNode.slots.map((slot, slotIdx) => {
          const winnerId = setNode.winnerId;
          const entrantId = slot.entrant?.id ?? null;
          const outcome =
            winnerId == null || entrantId == null ? "-"
            : String(winnerId) === String(entrantId) ? "W"
            : "L";
          const outcomeStyle = getOutcomeCharacterStyle(outcome);
          const isWinner = outcome === "W";
          const isLoser = outcome === "L";
          return (
            <div
              key={`${String(setNode.id)}-${slotIdx}`}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "9px 12px",
                background: isWinner ? WIN_BG : "transparent",
                borderTop: slotIdx > 0 ? `1px solid ${BORDER}` : "none",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isWinner ? WIN_COLOR : "transparent",
                  border: !isWinner ? `1px solid rgba(0,153,187,0.3)` : "none",
                  marginRight: 10,
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: isWinner ? 600 : 400,
                  opacity: isLoser ? 0.45 : 1,
                  color: TEXT,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  minWidth: 0,
                }}
              >
                {slot.entrant?.name ?? "TBD"}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  marginLeft: 8,
                  minWidth: 28,
                  textAlign: "right",
                  ...outcomeStyle,
                }}
              >
                {outcome}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStandings = (selectedEventId: string) => {
    const standings = eventStandingsResults[selectedEventId];
    if (!standings && !loadingStandings && !standingsError) return null;

    const rankColor = (p: number) =>
      p === 1 ? WINNERS_COLOR : p === 2 ? "#9ca3af" : p === 3 ? "#cd7c2f" : MUTED;
    const rankBg = (p: number) =>
      p === 1 ? "rgba(240,180,41,0.08)"
      : p === 2 ? "rgba(156,163,175,0.08)"
      : p === 3 ? "rgba(205,124,47,0.08)"
      : SURFACE_SOFT;
    const rankBorder = (p: number) =>
      p === 1 ? "rgba(240,180,41,0.3)"
      : p === 2 ? "rgba(156,163,175,0.25)"
      : p === 3 ? "rgba(205,124,47,0.28)"
      : BORDER;

    return (
      <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontFamily: "'Bayon', sans-serif",
              letterSpacing: 2.5,
              color: ACCENT_BRIGHT,
              textTransform: "uppercase",
            }}
          >
            Final Standings
          </div>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${ACCENT_BRIGHT}33, transparent)` }} />
        </div>

        {loadingStandings && !standings && (
          <div style={{ color: MUTED, fontSize: 13 }}>Loading standings...</div>
        )}
        {standingsError && (
          <div style={{ color: ERROR, fontSize: 13 }}>Standings error: {standingsError}</div>
        )}
        {standings && standings.nodes.length === 0 && (
          <div style={{ color: MUTED, fontSize: 13 }}>No standings available yet.</div>
        )}
        {standings && standings.nodes.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 8,
            }}
          >
            {standings.nodes.map((n) => (
              <div
                key={`${n.placement}-${n.entrant?.id ?? "unknown"}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  background: rankBg(n.placement),
                  border: `1px solid ${rankBorder(n.placement)}`,
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    fontSize: n.placement <= 3 ? 14 : 11,
                    fontWeight: n.placement <= 3 ? 800 : 500,
                    color: rankColor(n.placement),
                    width: 32,
                    textAlign: "center",
                    fontFamily: "'Bayon', sans-serif",
                    letterSpacing: 1,
                    flexShrink: 0,
                  }}
                >
                  #{n.placement}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: n.placement <= 3 ? 600 : 400,
                    color: n.placement <= 3 ? TEXT : MUTED,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {n.entrant?.name ?? "Unknown"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderBracketRounds = (groups: any[], accentColor: string) => {
    return (
      <div
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          paddingBottom: 12,
          paddingTop: 4,
        }}
      >
        {groups.map((g: any) => (
          <div key={g.round} style={{ flex: "0 0 210px" }}>
            <div
              style={{
                fontSize: 10,
                fontFamily: "'Bayon', sans-serif",
                letterSpacing: 2,
                color: accentColor,
                textTransform: "uppercase",
                marginBottom: 10,
                paddingBottom: 6,
                borderBottom: `1px solid ${accentColor}33`,
              }}
            >
              {g.round}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {g.sets.map((s: any, i: number) =>
                renderMatchCard(s, `${String(s.id)}-${i}`)
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        width: "min(calc(100vw - 32px), 1200px)",
        color: TEXT,
        fontFamily: "'Quicksand', sans-serif",
      }}
    >
      {/* Header */}
      <h1
        style={{
          textAlign: "center",
          fontFamily: "'Bayon', sans-serif",
          fontSize: 42,
          letterSpacing: 4,
          color: ACCENT_BRIGHT,
          textShadow: `0 0 40px ${ACCENT}66`,
          margin: "0 0 32px",
        }}
      >
        {activeSeason?.name ?? "GAMEFEST"}
      </h1>

      {/* Events loading / error */}
      {(loading || seasonsLoading) && (
        <div style={{ textAlign: "center", color: MUTED, padding: "20px 0", fontSize: 14 }}>
          Loading events...
        </div>
      )}
      {error && (
        <div
          style={{
            color: ERROR,
            background: "rgba(248,113,113,0.08)",
            border: `1px solid rgba(248,113,113,0.2)`,
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            fontSize: 13,
          }}
        >
          Error: {error}
          {API_BASE ? ` (VITE_BACKEND_URL=${API_BASE})` : " (same-origin /api)"}
        </div>
      )}

      {/* Event selector */}
      {!loading && events.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 2.5,
              fontFamily: "'Bayon', sans-serif",
              color: MUTED,
              textAlign: "center",
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            Select Event
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative", width: "min(100%, 420px)" }}>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 16px",
                  border: `1px solid ${BORDER_STRONG}`,
                  borderRadius: 10,
                  background: SURFACE,
                  color: TEXT,
                  fontSize: 14,
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: `0 0 28px rgba(0,153,187,0.12), 0 4px 20px rgba(0,0,0,0.35)`,
                  outline: "none",
                  appearance: "none",
                  WebkitAppearance: "none",
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
              <div
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: ACCENT_BRIGHT,
                  fontSize: 10,
                }}
              >
                ▼
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected event content */}
      {(() => {
        if (!selectedEventId) return null;

        const selectedEvent = events.find((e) => String(e.id) === selectedEventId);
        const phases = eventPhasesResults[selectedEventId];
        const phasePools = selectedPhaseId ? phasePoolsResults[selectedPhaseId] : undefined;
        const selectedPhaseGroup = selectedPhaseGroupId
          ? phaseGroupSetsResults[selectedPhaseGroupId]
          : undefined;
        const groupedForSelectedPhaseGroup = selectedPhaseGroupId
          ? phaseGroupGroupedResults[selectedPhaseGroupId]
          : undefined;
        const shouldDisplayDivUnderGroupedLayout = groupedForSelectedPhaseGroup
          ? !groupedForSelectedPhaseGroup.containsWinnersOrLosers
          : false;

        return (
          <div>
            {/* Event name */}
            <div
              style={{
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  textAlign: "center",
                  fontFamily: "'Bayon', sans-serif",
                  fontSize: 26,
                  letterSpacing: 1.5,
                  color: TEXT,
                }}
              >
                {selectedEvent?.name ?? "Event"}
              </h2>
            </div>

            {/* Phase navigation */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: 2.5,
                    color: MUTED,
                    textTransform: "uppercase",
                    fontFamily: "'Bayon', sans-serif",
                  }}
                >
                  Phase
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (phasesOpen) {
                      setPhasesOpen(false);
                      setSelectedPhaseId("");
                      setSelectedPhaseGroupId("");
                    } else {
                      setPhasesOpen(true);
                    }
                  }}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 6,
                    border: `1px solid ${phasesOpen ? BORDER : BORDER_STRONG}`,
                    background: phasesOpen ? "transparent" : SURFACE_SOFT,
                    color: phasesOpen ? MUTED : ACCENT_BRIGHT,
                    cursor: "pointer",
                    fontSize: 10,
                    letterSpacing: 1.5,
                    fontFamily: "'Bayon', sans-serif",
                    textTransform: "uppercase",
                  }}
                >
                  {phasesOpen ? "Collapse" : "Expand"}
                </button>
              </div>

              {phasesOpen && (
                <>
                  {loadingPhases && !phases && (
                    <div style={{ color: MUTED, fontSize: 13, padding: "8px 0" }}>
                      Loading phases...
                    </div>
                  )}
                  {phasesError && (
                    <div style={{ color: ERROR, fontSize: 13 }}>Phases error: {phasesError}</div>
                  )}
                  {phases && phases.phases.length === 0 && (
                    <div style={{ color: MUTED, fontSize: 13 }}>No phases found.</div>
                  )}
                  {phases && phases.phases.length > 0 && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {phases.phases.map((p) => {
                        const id = String(p.id);
                        const active = id === selectedPhaseId;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setSelectedPhaseId(id)}
                            style={{
                              padding: "8px 20px",
                              borderRadius: 20,
                              border: active ? `1px solid ${ACCENT_BRIGHT}` : `1px solid ${BORDER}`,
                              background: active
                                ? `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_BRIGHT} 100%)`
                                : SURFACE_SOFT,
                              color: active ? "#06101f" : TEXT,
                              cursor: "pointer",
                              fontFamily: "'Quicksand', sans-serif",
                              fontWeight: active ? 700 : 500,
                              fontSize: 13,
                              letterSpacing: 0.5,
                              boxShadow: active ? `0 0 18px ${ACCENT}55` : "none",
                            }}
                          >
                            {p.name}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Pool selector */}
                  {selectedPhaseId && (
                    <div style={{ marginTop: 14 }}>
                      {loadingPhasePools && !phasePools && (
                        <div style={{ color: MUTED, fontSize: 13 }}>Loading pools...</div>
                      )}
                      {phasePoolsError && (
                        <div style={{ color: ERROR, fontSize: 13 }}>
                          Pools error: {phasePoolsError}
                        </div>
                      )}
                      {phasePools && phasePools.phaseGroups.length > 1 && (
                        <>
                          <div
                            style={{
                              fontSize: 10,
                              letterSpacing: 2,
                              color: MUTED,
                              fontFamily: "'Bayon', sans-serif",
                              textTransform: "uppercase",
                              marginBottom: 8,
                            }}
                          >
                            Pool
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {phasePools.phaseGroups.map((g) => {
                              const id = String(g.id);
                              const active = id === selectedPhaseGroupId;
                              const label = g.displayIdentifier
                                ? `Pool ${g.displayIdentifier}`
                                : `Pool ${id}`;
                              return (
                                <button
                                  key={id}
                                  type="button"
                                  onClick={() => setSelectedPhaseGroupId(id)}
                                  style={{
                                    padding: "6px 16px",
                                    borderRadius: 16,
                                    border: active
                                      ? `1px solid ${ACCENT_BRIGHT}`
                                      : `1px solid ${BORDER}`,
                                    background: active ? SURFACE_SOFT : "transparent",
                                    color: active ? ACCENT_BRIGHT : MUTED,
                                    cursor: "pointer",
                                    fontFamily: "'Quicksand', sans-serif",
                                    fontWeight: active ? 700 : 500,
                                    fontSize: 12,
                                    letterSpacing: 0.5,
                                    boxShadow: active ? `0 0 12px ${ACCENT}33` : "none",
                                  }}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                          {!selectedPhaseGroupId && (
                            <div style={{ color: MUTED, fontSize: 13, marginTop: 10 }}>
                              Select a pool to view matches.
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Phase group loading states */}
            {loadingPhaseGroupSets && selectedPhaseGroupId && !selectedPhaseGroup && (
              <div style={{ color: MUTED, fontSize: 13, padding: "8px 0" }}>
                Loading bracket data...
              </div>
            )}
            {phaseGroupSetsError && (
              <div style={{ color: ERROR, fontSize: 13 }}>
                Error loading bracket: {phaseGroupSetsError}
              </div>
            )}

            {/* Bracket content */}
            {selectedPhaseGroup && (
              <div style={{ paddingTop: 8 }}>
                {/* ── Winners / Losers bracket layout ── */}
                {(() => {
                  const grouped = groupedForSelectedPhaseGroup;
                  if (!grouped || !grouped.groups || !grouped.containsWinnersOrLosers) return null;

                  const roundKey = (name: string) => {
                    if (!name) return 1e6;
                    const m = String(name).match(/Round\s*(\d+)/i);
                    if (m) return Number(m[1]);
                    if (/Quarter/i.test(name)) return 1000;
                    if (/Semi/i.test(name)) return 2000;
                    if (/Final/i.test(name)) return 3000;
                    return 1e6;
                  };

                  const winners = grouped.groups
                    .filter((g: any) => /Winners/i.test(g.round))
                    .sort((a: any, b: any) => roundKey(a.round) - roundKey(b.round));
                  const losers = grouped.groups
                    .filter((g: any) => /Losers/i.test(g.round))
                    .sort((a: any, b: any) => roundKey(a.round) - roundKey(b.round));

                  return (
                    <div style={{ marginBottom: 8 }}>
                      {winners.length > 0 && (
                        <div style={{ marginBottom: 32 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              marginBottom: 16,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                fontFamily: "'Bayon', sans-serif",
                                letterSpacing: 2.5,
                                color: WINNERS_COLOR,
                                textTransform: "uppercase",
                              }}
                            >
                              Winners Bracket
                            </div>
                            <div
                              style={{
                                flex: 1,
                                height: 1,
                                background: `linear-gradient(to right, ${WINNERS_COLOR}44, transparent)`,
                              }}
                            />
                          </div>
                          {renderBracketRounds(winners, WINNERS_COLOR)}
                        </div>
                      )}

                      {losers.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              marginBottom: 16,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                fontFamily: "'Bayon', sans-serif",
                                letterSpacing: 2.5,
                                color: LOSERS_COLOR,
                                textTransform: "uppercase",
                              }}
                            >
                              Losers Bracket
                            </div>
                            <div
                              style={{
                                flex: 1,
                                height: 1,
                                background: `linear-gradient(to right, ${LOSERS_COLOR}44, transparent)`,
                              }}
                            />
                          </div>
                          {renderBracketRounds(losers, LOSERS_COLOR)}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ── Pool matches layout ── */}
                {shouldDisplayDivUnderGroupedLayout && (() => {
                  const hasAnyScore = selectedPhaseGroup.nodes.some((n) =>
                    n.slots.some((s) => s.standing?.stats?.score?.value != null)
                  );
                  const results = phaseGroupResultsResults[selectedPhaseGroupId];

                  return (
                    <div>
                      {/* Pool label */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 16,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontFamily: "'Bayon', sans-serif",
                            letterSpacing: 2.5,
                            color: ACCENT_BRIGHT,
                            textTransform: "uppercase",
                          }}
                        >
                          {selectedPhaseGroup.displayIdentifier
                            ? `Pool ${selectedPhaseGroup.displayIdentifier}`
                            : "Pool"}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: MUTED,
                            letterSpacing: 0.5,
                          }}
                        >
                          {selectedPhaseGroup.total} sets
                        </div>
                        <div
                          style={{
                            flex: 1,
                            height: 1,
                            background: `linear-gradient(to right, ${ACCENT_BRIGHT}33, transparent)`,
                          }}
                        />
                      </div>

                      {hasAnyScore ? (
                        selectedPhaseGroup.nodes.length === 0 ? (
                          <div style={{ color: MUTED, fontSize: 13 }}>
                            No sets found for this pool.
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fill, minmax(280px, 1fr))",
                              gap: 8,
                            }}
                          >
                            {selectedPhaseGroup.nodes.map((setNode, idx) =>
                              renderMatchCard(setNode, String(setNode.id ?? idx))
                            )}
                          </div>
                        )
                      ) : (
                        <div>
                          {loadingPhaseGroupResults && !results && (
                            <div style={{ color: MUTED, fontSize: 13, marginBottom: 10 }}>
                              Loading match results...
                            </div>
                          )}
                          {phaseGroupResultsError && (
                            <div style={{ color: ERROR, fontSize: 13, marginBottom: 10 }}>
                              Results error: {phaseGroupResultsError}
                            </div>
                          )}
                          {results && results.nodes.length === 0 && (
                            <div style={{ color: MUTED, fontSize: 13 }}>
                              No matches recorded yet.
                            </div>
                          )}
                          {results && results.nodes.length > 0 && (
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fill, minmax(280px, 1fr))",
                                gap: 8,
                              }}
                            >
                              {results.nodes.map((setNode, idx) =>
                                renderResultsMatchCard(setNode, idx)
                              )}
                            </div>
                          )}
                          {!results && !loadingPhaseGroupResults && (
                            <div style={{ color: MUTED, fontSize: 13 }}>
                              No matches recorded yet.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Standings */}
                {renderStandings(selectedEventId)}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
