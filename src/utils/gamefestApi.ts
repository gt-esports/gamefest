export type PastWinner = {
  rank: number;
  display_name: string;
  points: number;
};

export type ArchivedSeason = {
  id: string;
  name: string;
  slug: string;
  winners: PastWinner[];
};

export class GamefestApiError extends Error {
  constructor(readonly kind: "configuration" | "unavailable") {
    super(kind);
    this.name = "GamefestApiError";
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isText = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseArchive(value: unknown): ArchivedSeason[] {
  if (!isRecord(value) || !Array.isArray(value.seasons) || value.seasons.length > 20) {
    throw new GamefestApiError("unavailable");
  }

  const seenIds = new Set<string>();
  return value.seasons.map((season: unknown) => {
    if (!isRecord(season) || !isText(season.id) || !UUID.test(season.id) ||
        seenIds.has(season.id) || !isText(season.name) || !isText(season.slug) ||
        !Array.isArray(season.winners) || season.winners.length > 3) {
      throw new GamefestApiError("unavailable");
    }
    seenIds.add(season.id);

    let previousPoints = Infinity;
    const winners = season.winners.map((winner: unknown, index: number): PastWinner => {
      if (!isRecord(winner) || winner.rank !== index + 1 || !isText(winner.display_name) ||
          typeof winner.points !== "number" || !Number.isSafeInteger(winner.points) ||
          winner.points < 0 || winner.points > previousPoints) {
        throw new GamefestApiError("unavailable");
      }
      previousPoints = winner.points;
      return { rank: index + 1, display_name: winner.display_name, points: winner.points };
    });

    return { id: season.id, name: season.name, slug: season.slug, winners };
  });
}

function archiveUrl(): string {
  const configuredUrl: unknown = import.meta.env.VITE_ESPORTS_API_URL;
  if (!isText(configuredUrl)) throw new GamefestApiError("configuration");

  try {
    const base = new URL(configuredUrl);
    if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) {
      throw new Error("Invalid API URL");
    }
    base.pathname = `${base.pathname.replace(/\/+$/, "")}/v1/gamefest/past-winners`;
    return base.toString();
  } catch {
    throw new GamefestApiError("configuration");
  }
}

export async function fetchPastWinners(signal: AbortSignal): Promise<ArchivedSeason[]> {
  const url = archiveUrl();
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener("abort", abort, { once: true });
  if (signal.aborted) controller.abort();
  const timeout = setTimeout(abort, 10_000);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "omit",
      signal: controller.signal,
    });
    if (!response.ok) throw new GamefestApiError("unavailable");
    const data: unknown = await response.json();
    return parseArchive(data);
  } catch {
    if (signal.aborted) throw new DOMException("Request cancelled", "AbortError");
    throw new GamefestApiError("unavailable");
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener("abort", abort);
  }
}
