import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchPastWinners } from "./gamefestApi";

const season = {
  id: "bc9fbe12-3e62-4ffb-8c44-0599dfe034e2",
  name: "GameFest 2026",
  slug: "gamefest-2026",
  winners: [{ rank: 1, display_name: "Buzz", points: 1200 }],
};

const fetchMock = vi.fn<typeof fetch>();
const loadArchive = () => fetchPastWinners(new AbortController().signal);

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("VITE_ESPORTS_API_URL", "https://esports.example.com/");
});

afterEach(() => vi.useRealTimers());

describe("GameFest archive client", () => {
  it("fetches the public contract without credentials and strips extra upstream fields", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ seasons: [{ ...season, users: "ignored" }] })));
    const seasons = await loadArchive();
    expect(seasons).toEqual([season]);
    expect(fetchMock).toHaveBeenCalledWith("https://esports.example.com/v1/gamefest/past-winners", {
      method: "GET", headers: { Accept: "application/json" }, credentials: "omit", signal: expect.any(AbortSignal) as AbortSignal,
    });
  });

  it("preserves a configured base path", async () => {
    vi.stubEnv("VITE_ESPORTS_API_URL", "https://esports.example.com/api///");
    fetchMock.mockResolvedValue(new Response('{"seasons":[]}'));
    expect(await loadArchive()).toEqual([]);
    expect(fetchMock.mock.calls[0][0]).toBe("https://esports.example.com/api/v1/gamefest/past-winners");
  });

  it.each([undefined, "", "/api", "ftp://esports.example.com", "https://user:pass@example.com", "https://example.com?key=secret", "https://example.com#fragment"])(
    "rejects invalid configuration without a network request: %s", async (url) => {
      vi.stubEnv("VITE_ESPORTS_API_URL", url);
      await expect(loadArchive()).rejects.toMatchObject({ kind: "configuration" });
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it.each([
    {}, { seasons: null }, { seasons: [{}] },
    { seasons: [{ ...season, id: "invalid" }] },
    { seasons: [{ ...season, name: " " }] },
    { seasons: [{ ...season, winners: [{ rank: 1, display_name: "Buzz", points: -1 }] }] },
    { seasons: [{ ...season, winners: [{ rank: 2, display_name: "Buzz", points: 4 }] }] },
    { seasons: [{ ...season, winners: [{ rank: 1, display_name: "Buzz", points: "4" }] }] },
    { seasons: [{ ...season, winners: [{ rank: 1, display_name: "", points: 4 }] }] },
    { seasons: [{ ...season, winners: [{ rank: 1, display_name: "Buzz", points: 4 }, { rank: 2, display_name: "Bee", points: 5 }] }] },
    { seasons: [season, season] },
    { seasons: Array.from({ length: 21 }, () => season) },
  ])("rejects malformed archives instead of showing partial results: %j", async (body) => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(body)));
    await expect(loadArchive()).rejects.toMatchObject({ kind: "unavailable" });
  });

  it("accepts tied points, zero points and seasons without winners", async () => {
    const tiedSeason = { ...season, winners: [{ rank: 1, display_name: "Buzz", points: 0 }, { rank: 2, display_name: "Bee", points: 0 }] };
    const emptySeason = { ...season, id: "89e6f2bb-00b3-4f62-9946-73ae1b9a3055", winners: [] };
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ seasons: [tiedSeason, emptySeason] })));
    expect(await loadArchive()).toEqual([tiedSeason, emptySeason]);
  });

  it("handles HTTP and JSON failures", async () => {
    fetchMock.mockResolvedValueOnce(new Response("service unavailable", { status: 503 }));
    await expect(loadArchive()).rejects.toMatchObject({ kind: "unavailable" });
    fetchMock.mockResolvedValueOnce(new Response("not JSON"));
    await expect(loadArchive()).rejects.toMatchObject({ kind: "unavailable" });
  });

  it("aborts a hanging request after ten seconds", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation((_url, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    }));
    const result = expect(loadArchive()).rejects.toMatchObject({ kind: "unavailable" });
    await vi.advanceTimersByTimeAsync(10_000);
    await result;
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("propagates cancellation and clears the timeout", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation((_url, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    }));
    const controller = new AbortController();
    const result = expect(fetchPastWinners(controller.signal)).rejects.toMatchObject({ name: "AbortError" });
    controller.abort();
    await result;
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});
