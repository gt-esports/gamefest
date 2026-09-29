import { useEffect, useState } from "react";
import { useSeasons, type Season } from "../hooks/useSeasons";
import { supabase } from "../utils/supabaseClient";

type WinnerRow = {
  id: string;
  points: number | null;
  users:
    | { username: string | null; fname: string | null; lname: string | null }
    | Array<{ username: string | null; fname: string | null; lname: string | null }>
    | null;
};

type SeasonWinners = { season: Season; winners: WinnerRow[] };
const MEDALS = ["🥇", "🥈", "🥉"];

const displayName = (winner: WinnerRow): string => {
  const user = Array.isArray(winner.users) ? winner.users[0] : winner.users;
  return [user?.fname, user?.lname].filter(Boolean).join(" ") || user?.username || "GameFest Player";
};

export default function PastWinners() {
  const { seasons, loading: seasonsLoading, error: seasonsError } = useSeasons();
  const [results, setResults] = useState<SeasonWinners[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const archivedSeasons = seasons.filter((season) => !season.is_active);
    if (seasonsLoading) return;
    if (archivedSeasons.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const loadWinners = async () => {
      setLoading(true);
      const seasonResults = await Promise.all(
        archivedSeasons.map(async (season) => {
          const { data, error: winnersError } = await supabase
            .from("players")
            .select("id, points, users(username, fname, lname)")
            .eq("season_id", season.id)
            .order("points", { ascending: false })
            .limit(3);
          if (winnersError) throw winnersError;
          return { season, winners: (data ?? []) as WinnerRow[] };
        })
      );

      if (!cancelled) {
        setResults(seasonResults);
        setError(null);
        setLoading(false);
      }
    };

    void loadWinners().catch((cause: unknown) => {
      if (!cancelled) {
        setError(cause instanceof Error ? cause.message : "Could not load past winners");
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [seasons, seasonsLoading]);

  const visibleError = seasonsError || error;

  return (
    <section id="leaderboard-section" className="mt-28 flex w-full flex-col items-center justify-center px-4">
      <p className="font-quicksand text-xs uppercase tracking-[0.35em] text-[#7dd3f0]">Hall of Fame</p>
      <h2 className="mt-2 text-center font-bayon text-5xl font-normal text-white">PREVIOUS YEARS' WINNERS</h2>
      <p className="mb-8 mt-2 max-w-2xl text-center font-quicksand text-sm text-gray-400">
        Celebrating the players who finished at the top of past GameFest leaderboards.
      </p>

      <div className="w-full max-w-5xl">
        {(loading || seasonsLoading) && (
          <div className="rounded-2xl border border-white/10 bg-white/5 py-14 text-center font-quicksand text-gray-400">Loading the Hall of Fame…</div>
        )}
        {!loading && !seasonsLoading && visibleError && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 py-12 text-center font-quicksand text-red-300">Could not load previous winners right now.</div>
        )}
        {!loading && !seasonsLoading && !visibleError && results.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 py-12 text-center font-quicksand text-gray-400">Previous GameFest results will appear here soon.</div>
        )}
        {!loading && !seasonsLoading && !visibleError && results.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6">
            {results.map(({ season, winners }) => (
              <article key={season.id} className="w-full overflow-hidden rounded-2xl border border-[#00D4FF]/20 bg-white/5 shadow-lg shadow-black/20 md:w-[calc(50%-0.75rem)]">
                <header className="border-b border-white/10 bg-gradient-to-r from-[#004466]/70 to-[#0099BB]/20 px-6 py-5">
                  <p className="font-quicksand text-xs uppercase tracking-[0.3em] text-[#7dd3f0]">Final standings</p>
                  <h3 className="mt-1 font-bayon text-3xl text-white">{season.name}</h3>
                </header>
                <ol className="space-y-3 p-5">
                  {winners.length === 0 ? (
                    <li className="py-5 text-center font-quicksand text-sm text-gray-400">Results coming soon.</li>
                  ) : winners.map((winner, index) => (
                    <li key={winner.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-black/20 px-4 py-3">
                      <span className="text-2xl" aria-label={`${index + 1} place`}>{MEDALS[index]}</span>
                      <span className="min-w-0 flex-1 truncate font-bayon text-xl text-white">{displayName(winner)}</span>
                      <span className="font-bayon text-xl text-[#00D4FF]">{(winner.points ?? 0).toLocaleString()} pts</span>
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
