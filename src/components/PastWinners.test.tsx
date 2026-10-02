import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PastWinners from "./PastWinners";

const archive = {
  seasons: [{
    id: "bc9fbe12-3e62-4ffb-8c44-0599dfe034e2", name: "GameFest 2026", slug: "gamefest-2026",
    winners: [{ rank: 1, display_name: "Buzz", points: 1200 }, { rank: 2, display_name: "Bee", points: 900 }],
  }],
};
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("VITE_ESPORTS_API_URL", "https://esports.example.com");
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("PastWinners", () => {
  it("shows loading then the API's season, rank, name and points", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(archive)));
    render(<PastWinners />);
    expect(screen.getByRole("status").textContent).toContain("Loading the Hall of Fame");
    expect(await screen.findByRole("heading", { name: "GameFest 2026" })).toBeTruthy();
    expect(screen.getByText("Buzz")).toBeTruthy();
    expect(screen.getByText("1,200 pts")).toBeTruthy();
    expect(screen.getByLabelText("1 place").textContent).toBe("🥇");
    expect(screen.getByLabelText("2 place").textContent).toBe("🥈");
    expect(screen.queryByRole("status")).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries a failed request without exposing the raw error", async () => {
    fetchMock.mockRejectedValueOnce(new Error("secret upstream connection details"));
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(archive)));
    render(<PastWinners />);
    expect((await screen.findByRole("alert")).textContent).toContain("Could not load previous winners right now");
    expect(screen.queryByText(/secret upstream/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Buzz")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("shows a public-friendly message when the API is not configured", async () => {
    vi.stubEnv("VITE_ESPORTS_API_URL", "");
    render(<PastWinners />);
    expect((await screen.findByRole("alert")).textContent).toContain("The Hall of Fame is not available yet");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByText(/VITE_|Supabase|configuration/)).toBeNull();
  });

  it("distinguishes an empty archive from a season without winners", async () => {
    fetchMock.mockResolvedValueOnce(new Response('{"seasons":[]}'));
    const page = render(<PastWinners />);
    expect(await screen.findByText("Previous GameFest results will appear here soon.")).toBeTruthy();
    page.unmount();
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ seasons: [{ ...archive.seasons[0], winners: [] }] })));
    render(<PastWinners />);
    expect(await screen.findByText("Results coming soon.")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "GameFest 2026" })).toBeTruthy();
    expect(screen.queryByText("Previous GameFest results will appear here soon.")).toBeNull();
  });

  it("treats malformed API data as an error rather than an empty archive", async () => {
    fetchMock.mockResolvedValue(new Response('{"seasons":[{"name":"Broken"}]}'));
    render(<PastWinners />);
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.queryByText("Previous GameFest results will appear here soon.")).toBeNull();
    expect(screen.queryByText("Broken")).toBeNull();
  });

  it("aborts the request on unmount", async () => {
    fetchMock.mockImplementation((_url, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    }));
    const page = render(<PastWinners />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const requestSignal = fetchMock.mock.calls[0][1]?.signal;
    expect(requestSignal?.aborted).toBe(false);
    page.unmount();
    expect(requestSignal?.aborted).toBe(true);
  });

  it("replaces endless loading with a retry when the request times out", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation((_url, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    }));
    render(<PastWinners />);
    expect(screen.getByRole("status")).toBeTruthy();
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByRole("alert").textContent).toContain("Could not load previous winners");
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  });
});
