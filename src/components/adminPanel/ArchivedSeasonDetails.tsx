import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import type { Season } from "../../hooks/useSeasons";

type ArchiveSummary = {
  registrations: number;
  players: number;
  games: number;
  challenges: number;
  leaders: Array<{
    id: string;
    points: number | null;
    users: { username: string | null; fname: string | null; lname: string | null } |
      Array<{ username: string | null; fname: string | null; lname: string | null }> | null;
  }>;
};

const displayName = (player: ArchiveSummary["leaders"][number]): string => {
  const user = Array.isArray(player.users) ? player.users[0] : player.users;
  return [user?.fname, user?.lname].filter(Boolean).join(" ") || user?.username || "Unknown";
};

export default function ArchivedSeasonDetails({ season }: { season: Season }) {
  const [summary, setSummary] = useState<ArchiveSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [registrations, players, games, challenges, leaders] = await Promise.all([
        supabase.from("registrations").select("id", { count: "exact", head: true }).eq("season_id", season.id),
        supabase.from("players").select("id", { count: "exact", head: true }).eq("season_id", season.id),
        supabase.from("games").select("id", { count: "exact", head: true }).eq("season_id", season.id),
        supabase.from("challenges").select("id", { count: "exact", head: true }).eq("season_id", season.id),
        supabase.from("players").select("id, points, users(username, fname, lname)")
          .eq("season_id", season.id).order("points", { ascending: false }).limit(10),
      ]);
      const failure = [registrations, players, games, challenges, leaders].find((result) => result.error);
      if (failure?.error) throw failure.error;
      if (!cancelled) {
        setSummary({
          registrations: registrations.count ?? 0,
          players: players.count ?? 0,
          games: games.count ?? 0,
          challenges: challenges.count ?? 0,
          leaders: (leaders.data ?? []) as ArchiveSummary["leaders"],
        });
      }
    };
    void load().catch((cause: unknown) => {
      if (!cancelled) setError(cause instanceof Error ? cause.message : "Could not load archived season");
    });
    return () => { cancelled = true; };
  }, [season.id]);

  return (
    <div className="mt-4 border border-blue-accent/20 bg-dark-bg/50 p-4 text-sm text-gray-300">
      <h5 className="font-bayon text-lg text-white">{season.name}</h5>
      <p className="mt-1">{season.slug}</p>
      {season.tournament_slug && (
        <a className="mt-2 inline-block text-blue-bright underline" target="_blank" rel="noopener noreferrer"
          href={`https://www.start.gg/tournament/${season.tournament_slug}/details`}>
          View past tournament on start.gg
        </a>
      )}
      {error && <p role="alert" className="mt-3 text-red-300">{error}</p>}
      {!summary && !error && <p className="mt-3">Loading archived results...</p>}
      {summary && (
        <>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div><dt>Registrations</dt><dd className="text-xl text-white">{summary.registrations}</dd></div>
            <div><dt>Players</dt><dd className="text-xl text-white">{summary.players}</dd></div>
            <div><dt>Games</dt><dd className="text-xl text-white">{summary.games}</dd></div>
            <div><dt>Challenges</dt><dd className="text-xl text-white">{summary.challenges}</dd></div>
          </dl>
          <section className="mt-5">
            <h6 className="font-bayon text-base text-blue-bright">Top players</h6>
            {summary.leaders.length === 0 ? <p>No players recorded.</p> : (
              <ol className="mt-2 space-y-1">
                {summary.leaders.map((player) => (
                  <li key={player.id} className="flex justify-between gap-3">
                    <span>{displayName(player)}</span><span>{player.points ?? 0} pts</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </div>
  );
}
