import { useEffect, useState } from "react";

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

const API_BASE = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? "";
const TOURNAMENT_SLUG = "gamefest-2026";
const SURFACE = "rgba(15, 31, 60, 0.9)";
const SURFACE_SOFT = "rgba(0, 68, 102, 0.16)";
const BORDER = "rgba(0, 153, 187, 0.35)";
const BORDER_STRONG = "rgba(0, 212, 255, 0.7)";
const TEXT = "#f8fbff";
const MUTED = "rgba(219, 234, 254, 0.72)";
const ACCENT = "#0099BB";
const ACCENT_BRIGHT = "#00D4FF";
const ERROR = "#f87171";

function hasOtherDQ(slots: PhaseGroupSetSlot[], currentSlot: PhaseGroupSetSlot): boolean {
  return slots.some((otherSlot) => otherSlot !== currentSlot && otherSlot.standing?.stats?.score?.value === -1);
}

function getScoreStyle(slots: PhaseGroupSetSlot[], currentSlot: PhaseGroupSetSlot): { color: string; fontWeight: 600 } | undefined {
  const score = currentSlot.standing?.stats?.score?.value ?? null;
  if (score === -1) return { color: "#dc2626", fontWeight: 600 };
  if (hasOtherDQ(slots, currentSlot)) return { color: "#16a34a", fontWeight: 600 };
  if (score == null) return undefined;

  const otherScores = slots
    .filter((otherSlot) => otherSlot !== currentSlot)
    .map((otherSlot) => otherSlot.standing?.stats?.score?.value ?? null)
    .filter((otherScore): otherScore is number => otherScore != null && otherScore !== -1);

  if (otherScores.length === 0) return undefined;

  const highestOtherScore = Math.max(...otherScores);
  const lowestOtherScore = Math.min(...otherScores);

  if (score > highestOtherScore) return { color: "#16a34a", fontWeight: 600 };
  if (score < lowestOtherScore) return { color: "#dc2626", fontWeight: 600 };
  return undefined;
}

function getOutcomeCharacterStyle(outcome: string): { color: string; fontWeight: 600 } | undefined {
  if (outcome === "W") return { color: "#16a34a", fontWeight: 600 };
  if (outcome === "L") return { color: "#dc2626", fontWeight: 600 };
  return undefined;
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

//

export default function Events() {
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
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchJson<{ events: TournamentEvent[] }>(
          `/api/startgg/tournaments/${encodeURIComponent(TOURNAMENT_SLUG)}/events`
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

    void load();
  }, []);

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
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(0)
          }, 500)
        })
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
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(0)
          }, 500)
        })
        setPhaseGroupSetsResults((prev) => ({ ...prev, [phaseGroupId]: result }));
        try {
          const grouped = await fetchJson<any>(
            `/api/startgg/phase-groups/${encodeURIComponent(phaseGroupId)}/sets/grouped?perPage=100`
          );
          setPhaseGroupGroupedResults((prev) => ({ ...prev, [phaseGroupId]: grouped }));
          // eslint-disable-next-line no-console
          console.log("phase-group grouped sets:", grouped);
        } catch (e) {
          // ignore grouped route errors but log for debugging
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

    const hasAnyScore = phaseGroup.nodes.some((setNode) =>
      setNode.slots.some((slot) => slot.standing?.stats?.score?.value != null)
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
  }, [
    selectedEventId,
    selectedPhaseGroupId,
    eventStandingsResults,
  ]);

  return (
    <div className="">
      <div style={{ width: "min(100%, 520px)", margin: "0 auto" }}>
        <h1 className="m-auto w-fit text-lg">GameFest 2026</h1>
        {loading && <p style={{ textAlign: "center", color: MUTED }}>Loading events + sets...</p>}
        {error && (
          <p style={{ color: ERROR, textAlign: "center" }}>
            Error: {error} {API_BASE ? `(VITE_BACKEND_URL=${API_BASE})` : "(same-origin /api)"}
          </p>
        )}

        {!loading && events.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", margin: "10px auto" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%", minWidth: 280 }}>
              <span style={{ fontSize: 12, opacity: 0.8, textAlign: "center" }}></span>
              <select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                }}
                style={{
                  width: "100%",
                  padding: 10,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 10,
                  background: SURFACE,
                  color: TEXT,
                  boxShadow: "0 10px 24px rgba(0, 0, 0, 0.22)",
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
        )}
      </div>

      {(() => {
        if (!selectedEventId) return null;

        const selectedEvent = events.find((e) => String(e.id) === selectedEventId);
        const phases = eventPhasesResults[selectedEventId];
        const phasePools = selectedPhaseId ? phasePoolsResults[selectedPhaseId] : undefined;
        const selectedPhaseGroup = selectedPhaseGroupId ? phaseGroupSetsResults[selectedPhaseGroupId] : undefined;
        const groupedForSelectedPhaseGroup = selectedPhaseGroupId ? phaseGroupGroupedResults[selectedPhaseGroupId] : undefined;
        const shouldDisplayDivUnderGroupedLayout = groupedForSelectedPhaseGroup ? !groupedForSelectedPhaseGroup.containsWinnersOrLosers : false;

        return (
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 16, padding: 14, margin: "10px 0" }}>
            <h3 style={{ margin: 0, textAlign: "center", color: ACCENT_BRIGHT }}>
              {selectedEvent?.name ?? "Event"} <span style={{ color: MUTED }}>({selectedEventId})</span>
            </h3>

            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, position: "relative" }}>
                <div style={{ fontSize: 12, color: MUTED, position: "absolute", left: "50%", transform: "translateX(-50%)" }}>Phases</div>
                {phasesOpen ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPhasesOpen(false);
                      setSelectedPhaseId("");
                      setSelectedPhaseGroupId("");
                    }}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                      background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_BRIGHT} 100%)`,
                      color: TEXT,
                      cursor: "pointer",
                      fontSize: 12,
                      marginLeft: "auto",
                      boxShadow: "0 10px 24px rgba(0, 153, 187, 0.28)",
                    }}
                  >
                    Close
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPhasesOpen(true)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                      background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_BRIGHT} 100%)`,
                      color: TEXT,
                      cursor: "pointer",
                      fontSize: 12,
                      marginLeft: "auto",
                      boxShadow: "0 10px 24px rgba(0, 153, 187, 0.28)",
                    }}
                  >
                    Open
                  </button>
                )}
              </div>

              {phasesOpen && (
                <>
                  {loadingPhases && !phases && <p style={{ marginTop: 8, color: MUTED }}>Loading phases...</p>}
                  {phasesError && <p style={{ marginTop: 8, color: ERROR }}>Phases error: {phasesError}</p>}
                  {phases && phases.phases.length === 0 && <p style={{ marginTop: 8, color: MUTED }}>No phases.</p>}
                  {phases && phases.phases.length > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6, justifyContent: "center" }}>
                        {phases.phases.map((p) => {
                          const id = String(p.id);
                          const active = id === selectedPhaseId;
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setSelectedPhaseId(id)}
                              style={{
                                padding: "8px 10px",
                                borderRadius: 8,
                                border: active ? `2px solid ${BORDER_STRONG}` : `1px solid ${BORDER}`,
                                background: active ? `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_BRIGHT} 100%)` : SURFACE_SOFT,
                                color: TEXT,
                                cursor: "pointer",
                                boxShadow: active ? "0 10px 24px rgba(0, 153, 187, 0.28)" : "none",
                              }}
                            >
                              {p.name}
                            </button>
                          );
                        })}
                      </div>

                      <div style={{ marginTop: 10 }}>
                        {!selectedPhaseId && <p style={{ marginTop: 8, color: MUTED, textAlign: "center" }}>Pick a phase to load pools.</p>}
                        {loadingPhasePools && selectedPhaseId && !phasePools && (
                          <p style={{ marginTop: 8, color: MUTED }}>Loading pools...</p>
                        )}
                        {phasePoolsError && (
                          <p style={{ marginTop: 8, color: ERROR }}>Pools error: {phasePoolsError}</p>
                        )}

                        {phasePools && (
                          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: 10, marginTop: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                              <div>
                                <strong>{phasePools.phaseName}</strong>{" "}
                                <span style={{ color: MUTED }}>({String(phasePools.phaseId)})</span>
                              </div>
                              <div style={{ fontSize: 12, color: MUTED }}>
                                pools: {phasePools.phaseGroups.length}
                              </div>
                            </div>

                            {phasePools.phaseGroups.length === 0 ? (
                              <p style={{ marginTop: 8, color: MUTED }}>No pools found for this phase.</p>
                            ) : phasePools.phaseGroups.length === 1 ? null : (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                                {phasePools.phaseGroups.map((g) => {
                                  const id = String(g.id);
                                  const active = id === selectedPhaseGroupId;
                                  const label = g.displayIdentifier ? `Pool ${g.displayIdentifier}` : `Pool ${id}`;
                                  return (
                                    <button
                                      key={id}
                                      type="button"
                                      onClick={() => setSelectedPhaseGroupId(id)}
                                      style={{
                                        padding: "8px 10px",
                                        borderRadius: 8,
                                        border: active ? `2px solid ${BORDER_STRONG}` : `1px solid ${BORDER}`,
                                        background: active ? `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_BRIGHT} 100%)` : SURFACE_SOFT,
                                        color: TEXT,
                                        cursor: "pointer",
                                        boxShadow: active ? "0 10px 24px rgba(0, 153, 187, 0.28)" : "none",
                                      }}
                                    >
                                      {label}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            <div style={{ marginTop: 10 }}>
                              {phasePools.phaseGroups.length > 1 && !selectedPhaseGroupId && (
                                <p style={{ marginTop: 8, color: MUTED }}>Pick a pool to load matches.</p>
                              )}
                              {loadingPhaseGroupSets && selectedPhaseGroupId && !selectedPhaseGroup && (
                                <p style={{ marginTop: 8, color: MUTED }}>Loading pool sets...</p>
                              )}
                              {phaseGroupSetsError && (
                                <p style={{ marginTop: 8, color: ERROR }}>
                                  Pool sets error: {phaseGroupSetsError}
                                </p>
                              )}

                              {selectedPhaseGroup && (
                                <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 10, paddingTop: 10 }}>
                                  {/* grouped winners/losers layout */}
                                  {(() => {
                                    const grouped = groupedForSelectedPhaseGroup;
                                    if (grouped && grouped.groups && grouped.containsWinnersOrLosers) {
                                      const winners = grouped.groups.filter((g: any) => /Winners/i.test(g.round));
                                      const losers = grouped.groups.filter((g: any) => /Losers/i.test(g.round));
                                      const roundKey = (name: string) => {
                                        if (!name) return 1e6;
                                        const m = String(name).match(/Round\s*(\d+)/i);
                                        if (m) return Number(m[1]);
                                        if (/Quarter/i.test(name)) return 1000;
                                        if (/Semi/i.test(name)) return 2000;
                                        if (/Final/i.test(name)) return 3000;
                                        return 1e6;
                                      };
                                      winners.sort((a: any, b: any) => roundKey(a.round) - roundKey(b.round));
                                      losers.sort((a: any, b: any) => roundKey(a.round) - roundKey(b.round));
                                      return (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 12 }}>
                                          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                            {winners.map((g: any) => (
                                              <div key={g.round} style={{ flex: "1 1 15vw", minWidth: 200, border: `1px solid ${BORDER}`, padding: 8, borderRadius: 10 }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{g.round}</div>
                                                {g.sets.map((s: any, i: number) => (
                                                  <div key={`${String(s.id)}-${i}`} style={{ padding: "6px 0", borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
                                                    <div style={{ fontSize: 12, color: MUTED }}>Set {i + 1}</div>
                                                    <div style={{ marginTop: 6 }}>
                                                      {(s.slots ?? []).map((slot: any, si: number) => {
                                                        const score = slot.standing?.stats?.score?.value ?? null;

                                                        const results = phaseGroupResultsResults[selectedPhaseGroupId];
                                                        const matching = results?.nodes.find((r) => String(r.id) === String(s.id));
                                                        const winnerId = matching?.winnerId ?? null;
                                                        const entrantId = slot.entrant?.id ?? null;
                                                        const otherDQ = hasOtherDQ(s.slots ?? [], slot);
                                                        const isDQ = score === -1;
                                                        const outcome =
                                                          isDQ
                                                            ? "DQ"
                                                            : otherDQ
                                                              ? "W"
                                                              : score != null
                                                                ? String(score)
                                                                : winnerId == null || entrantId == null
                                                                  ? "-"
                                                                  : String(winnerId) === String(entrantId)
                                                                    ? "W"
                                                                    : "L";
                                                        const outcomeStyle = outcome === "W" || outcome === "L"
                                                          ? getOutcomeCharacterStyle(outcome)
                                                          : getScoreStyle(s.slots ?? [], slot);
                                                        return (
                                                          <div key={si} style={{ display: "flex", gap: 8 }}>
                                                            <div style={{ minWidth: 18, opacity: 0.7 }}>#{si + 1}</div>
                                                            <div style={{ flex: 1 }}>{slot.entrant?.name ?? "TBD"}</div>
                                                            <div style={{ width: 40, textAlign: "right", ...outcomeStyle }}>{outcome}</div>
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            ))}
                                          </div>

                                          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                            {losers.map((g: any) => (
                                              <div key={g.round} style={{ flex: "1 1 15vw", minWidth: 260, border: `1px solid ${BORDER}`, padding: 8, borderRadius: 10 }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{g.round}</div>
                                                {g.sets.map((s: any, i: number) => (
                                                  <div key={`${String(s.id)}-${i}`} style={{ padding: "6px 0", borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
                                                    <div style={{ fontSize: 12, color: MUTED }}>Set {i + 1}</div>
                                                    <div style={{ marginTop: 6 }}>
                                                      {(s.slots ?? []).map((slot: any, si: number) => {
                                                        const score = slot.standing?.stats?.score?.value ?? null;
                                                        const results = phaseGroupResultsResults[selectedPhaseGroupId];
                                                        const matching = results?.nodes.find((r) => String(r.id) === String(s.id));
                                                        const winnerId = matching?.winnerId ?? null;
                                                        const entrantId = slot.entrant?.id ?? null;
                                                        const otherDQ = hasOtherDQ(s.slots ?? [], slot);
                                                        const isDQ = score === -1;
                                                        const outcome =
                                                          isDQ
                                                            ? "DQ"
                                                            : otherDQ
                                                              ? "W"
                                                              : score != null
                                                                ? String(score)
                                                                : winnerId == null || entrantId == null
                                                                  ? "-"
                                                                  : String(winnerId) === String(entrantId)
                                                                    ? "W"
                                                                    : "L";
                                                        const outcomeStyle = outcome === "W" || outcome === "L"
                                                          ? getOutcomeCharacterStyle(outcome)
                                                          : getScoreStyle(s.slots ?? [], slot);
                                                        return (
                                                          <div key={si} style={{ display: "flex", gap: 8 }}>
                                                            <div style={{ minWidth: 18, opacity: 0.7 }}>#{si + 1}</div>
                                                            <div style={{ flex: 1 }}>{slot.entrant?.name ?? "TBD"}</div>
                                                            <div style={{ width: 40, textAlign: "right", ...outcomeStyle }}>{outcome}</div>
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()}

                                  {shouldDisplayDivUnderGroupedLayout && <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                    <div style={{ flex: "2 1 420px", minWidth: 0 }}>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          gap: 8,
                                          marginBottom: 6,
                                        }}
                                      >
                                        <div>
                                          <strong>
                                            {selectedPhaseGroup.displayIdentifier
                                              ? `Pool ${selectedPhaseGroup.displayIdentifier}`
                                              : "Pool"}
                                          </strong>{" "}
                                          <span style={{ opacity: 0.7 }}>
                                            ({String(selectedPhaseGroup.phaseGroupId)})
                                          </span>
                                        </div>
                                        <div style={{ fontSize: 12, opacity: 0.7 }}>
                                          sets total: {selectedPhaseGroup.total}
                                        </div>
                                      </div>

                                      {(() => {
                                        const hasAnyScore = selectedPhaseGroup.nodes.some((setNode) =>
                                          setNode.slots.some((slot) => slot.standing?.stats?.score?.value != null)
                                        );

                                        if (hasAnyScore) {
                                          if (selectedPhaseGroup.nodes.length === 0) {
                                            return (
                                              <p style={{ marginTop: 8, opacity: 0.8 }}>
                                                No sets found for this pool.
                                              </p>
                                            );
                                          }

                                          return (
                                            <div style={{ marginTop: 10 }}>
                                              {selectedPhaseGroup.nodes.map((setNode, idx) => (
                                                <div
                                                  key={String(setNode.id ?? idx)}
                                                  style={{ padding: "6px 0", borderTop: `1px solid ${BORDER}` }}
                                                >
                                                  <div style={{ fontSize: 12, color: MUTED }}>Set {idx + 1}</div>
                                                  {setNode.slots.map((slot, slotIdx) => {
                                                    const name = slot.entrant?.name ?? "TBD";
                                                    const score = slot.standing?.stats?.score?.value;
                                                    const isDQ = score === -1;
                                                    const otherDQ = hasOtherDQ(setNode.slots, slot);
                                                    const displayScore = isDQ ? "DQ" : otherDQ ? "W" : score ?? "-";
                                                    const scoreStyle = getOutcomeCharacterStyle(String(displayScore))
                                                      ?? getScoreStyle(setNode.slots, slot);
                                                    return (
                                                      <div
                                                        key={String(slot.id ?? slotIdx)}
                                                        style={{ display: "flex", gap: 8 }}
                                                      >
                                                        <div style={{ minWidth: 18, opacity: 0.7 }}>#{slotIdx + 1}</div>
                                                        <div style={{ flex: 1 }}>{name}</div>
                                                        <div style={{ width: 40, textAlign: "right", ...scoreStyle }}>
                                                          {displayScore}
                                                        </div>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              ))}
                                            </div>
                                          );
                                        }

                                        const results = phaseGroupResultsResults[selectedPhaseGroupId];

                                        return (
                                          <div style={{ marginTop: 10 }}>
                                            <div style={{ fontSize: 12, color: MUTED }}>
                                              No matches found yet. Scores unavailable.`.
                                            </div>
                                            {loadingPhaseGroupResults && !results && (
                                              <p style={{ marginTop: 8, color: MUTED }}>Loading match results...</p>
                                            )}
                                            {phaseGroupResultsError && (
                                              <p style={{ marginTop: 8, color: ERROR }}>
                                                Results error: {phaseGroupResultsError}
                                              </p>
                                            )}
                                            {results && (
                                              <div style={{ marginTop: 10 }}>
                                                {results.nodes.length === 0 ? (
                                                  <p style={{ marginTop: 8, color: MUTED }}>No matches in phase found.</p>
                                                ) : (
                                                  <div>
                                                    {results.nodes.map((setNode, idx) => (
                                                      <div
                                                        key={String(setNode.id ?? idx)}
                                                        style={{ padding: "6px 0", borderTop: `1px solid ${BORDER}` }}
                                                      >
                                                        <div style={{ fontSize: 12, color: MUTED }}>
                                                          Set {idx + 1}
                                                        </div>
                                                        {setNode.slots.map((slot, slotIdx) => {
                                                          const name = slot.entrant?.name ?? "TBD";
                                                          const winnerId = setNode.winnerId;
                                                          const entrantId = slot.entrant?.id ?? null;
                                                          const outcome =
                                                            winnerId == null || entrantId == null
                                                              ? "-"
                                                              : String(winnerId) === String(entrantId)
                                                                ? "W"
                                                                : "L";
                                                          const outcomeStyle = getOutcomeCharacterStyle(outcome);
                                                          return (
                                                            <div
                                                              key={`${String(setNode.id)}-${slotIdx}`}
                                                              style={{ display: "flex", gap: 8 }}
                                                            >
                                                              <div style={{ minWidth: 18, opacity: 0.7 }}>
                                                                #{slotIdx + 1}
                                                              </div>
                                                              <div style={{ flex: 1 }}>{name}</div>
                                                              <div style={{ width: 24, textAlign: "right", ...outcomeStyle }}>
                                                                {outcome}
                                                              </div>
                                                            </div>
                                                          );
                                                        })}
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </div>

                                    <div style={{ flex: "1 1 240px", minWidth: 0, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 10 }}>
                                      <div style={{ fontSize: 12, color: MUTED }}>Standings</div>
                                      {(() => {
                                        const standings = eventStandingsResults[selectedEventId];

                                        if (loadingStandings && !standings) {
                                          return <p style={{ marginTop: 8, color: MUTED }}>Loading standings...</p>;
                                        }
                                        if (standingsError) {
                                          return (
                                            <p style={{ marginTop: 8, color: ERROR }}>
                                              Standings error: {standingsError}
                                            </p>
                                          );
                                        }
                                        if (!standings) {
                                          return <p style={{ marginTop: 8, color: MUTED }}>No standings loaded.</p>;
                                        }

                                        if (standings.nodes.length === 0) {
                                          return <p style={{ marginTop: 8, color: MUTED }}>No standings found.</p>;
                                        }

                                        return (
                                          <div style={{ marginTop: 8 }}>
                                            {standings.nodes.map((n) => (
                                              <div
                                                key={`${n.placement}-${n.entrant?.id ?? "unknown"}`}
                                                style={{
                                                  display: "flex",
                                                  gap: 10,
                                                  borderTop: `1px solid ${BORDER}`,
                                                  padding: "6px 0",
                                                }}
                                              >
                                                <div style={{ width: 40, opacity: 0.7 }}>#{n.placement}</div>
                                                <div style={{ flex: 1 }}>{n.entrant?.name ?? "Unknown"}</div>
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
