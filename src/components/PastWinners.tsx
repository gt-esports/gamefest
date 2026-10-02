import { useEffect, useState } from "react";
import { fetchPastWinners, GamefestApiError, type ArchivedSeason } from "../utils/gamefestApi";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function PastWinners() {
  const [results, setResults] = useState<ArchivedSeason[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    void fetchPastWinners(controller.signal)
      .then((seasons) => {
        if (!controller.signal.aborted) setResults(seasons);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof GamefestApiError && cause.kind === "configuration"
            ? "The Hall of Fame is not available yet. Please check back soon."
            : "Could not load previous winners right now. Please try again.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);

  return (
    <section id="leaderboard-section" className="mt-28 flex w-full flex-col items-center justify-center px-4">
      <p className="font-quicksand text-xs uppercase tracking-[0.35em] text-[#7dd3f0]">Hall of Fame</p>
      <h2 className="mt-2 text-center font-bayon text-5xl font-normal text-white">PREVIOUS YEARS' WINNERS</h2>
      <p className="mb-8 mt-2 max-w-2xl text-center font-quicksand text-sm text-gray-400">
        Celebrating the players who finished at the top of past GameFest leaderboards.
      </p>

      <div className="w-full max-w-5xl">
        {loading && (
          <div role="status" className="rounded-2xl border border-white/10 bg-white/5 py-14 text-center font-quicksand text-gray-400">Loading the Hall of Fame…</div>
        )}
        {!loading && error && (
          <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 py-12 text-center font-quicksand text-red-300">
            <p>{error}</p>
            <button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-4 rounded-lg border border-red-300/40 px-4 py-2 text-sm text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Try again</button>
          </div>
        )}
        {!loading && !error && results.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 py-12 text-center font-quicksand text-gray-400">Previous GameFest results will appear here soon.</div>
        )}
        {!loading && !error && results.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6">
            {results.map((season) => (
              <article key={season.id} className="w-full overflow-hidden rounded-2xl border border-[#00D4FF]/20 bg-white/5 shadow-lg shadow-black/20 md:w-[calc(50%-0.75rem)]">
                <header className="border-b border-white/10 bg-gradient-to-r from-[#004466]/70 to-[#0099BB]/20 px-6 py-5">
                  <p className="font-quicksand text-xs uppercase tracking-[0.3em] text-[#7dd3f0]">Final standings</p>
                  <h3 className="mt-1 font-bayon text-3xl text-white">{season.name}</h3>
                </header>
                <ol className="space-y-3 p-5">
                  {season.winners.length === 0 ? (
                    <li className="py-5 text-center font-quicksand text-sm text-gray-400">Results coming soon.</li>
                  ) : season.winners.map((winner) => (
                    <li key={winner.rank} className="flex items-center gap-4 rounded-xl border border-white/5 bg-black/20 px-4 py-3">
                      <span className="text-2xl" aria-label={`${winner.rank} place`}>{MEDALS[winner.rank - 1]}</span>
                      <span className="min-w-0 flex-1 truncate font-bayon text-xl text-white">{winner.display_name}</span>
                      <span className="font-bayon text-xl text-[#00D4FF]">{winner.points.toLocaleString()} pts</span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
