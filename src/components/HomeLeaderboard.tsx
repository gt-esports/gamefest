import { useMemo } from "react";
import { usePlayers } from "../hooks/usePlayers";
import type { Player } from "../schemas/PlayerSchema";

const RANK_STYLES: Record<
  number,
  { medal: string; ring: string; glow: string }
> = {
  1: {
    medal: "from-yellow-300 to-amber-500 text-black",
    ring: "ring-yellow-300/60",
    glow: "shadow-[0_0_30px_rgba(253,224,71,0.25)]",
  },
  2: {
    medal: "from-slate-200 to-slate-400 text-black",
    ring: "ring-slate-200/50",
    glow: "shadow-[0_0_25px_rgba(226,232,240,0.18)]",
  },
  3: {
    medal: "from-orange-300 to-amber-700 text-black",
    ring: "ring-orange-300/50",
    glow: "shadow-[0_0_25px_rgba(251,146,60,0.18)]",
  },
};

function PodiumCard({ player, rank }: { player: Player; rank: 1 | 2 | 3 }) {
  const style = RANK_STYLES[rank];
  const heightClass = rank === 1 ? "sm:pt-10 sm:pb-8" : "sm:pt-8 sm:pb-6";

  return (
    <div
      className={`relative flex flex-1 flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-6 backdrop-blur-sm ${heightClass} ${style.glow}`}
    >
      <div
        className={`absolute -top-5 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br font-bayon text-lg ring-2 ring-offset-2 ring-offset-[#0d1f2e] ${style.medal} ${style.ring}`}
      >
        {rank}
      </div>
      <p className="mt-3 truncate text-center font-bayon text-2xl text-white sm:text-3xl">
        {player.name}
      </p>
      {player.username && (
        <p className="truncate text-center font-quicksand text-xs text-gray-400 sm:text-sm">
          @{player.username}
        </p>
      )}
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-bayon text-3xl text-[#00D4FF] sm:text-4xl">
          {player.points.toLocaleString()}
        </span>
        <span className="font-quicksand text-xs uppercase tracking-wider text-gray-400">
          pts
        </span>
      </div>
    </div>
  );
}

function LeaderboardRow({ player, rank }: { player: Player; rank: number }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.06]">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 font-bayon text-base text-gray-300">
        {rank}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bayon text-lg text-white">{player.name}</p>
        {player.username && (
          <p className="truncate font-quicksand text-xs text-gray-400">
            @{player.username}
          </p>
        )}
      </div>
      <div className="flex flex-shrink-0 items-baseline gap-1">
        <span className="font-bayon text-xl text-[#00D4FF]">
          {player.points.toLocaleString()}
        </span>
        <span className="font-quicksand text-xs uppercase tracking-wider text-gray-400">
          pts
        </span>
      </div>
    </div>
  );
}

function HomeLeaderboard() {
  const { players, loading, error } = usePlayers();

  const topPlayers = useMemo(
    () =>
      [...players]
        .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
        .slice(0, 10),
    [players]
  );

  const podium = topPlayers.slice(0, 3);
  const rest = topPlayers.slice(3);

  return (
    <div
      id="leaderboard-section"
      className="mt-24 flex w-full flex-col items-center justify-center"
    >
      <div className="flex flex-row items-center justify-center pb-4 pt-24">
        <h2 className="text-center font-bayon text-5xl font-normal text-white">
          LEADERBOARD
        </h2>
      </div>
      <p className="mb-8 px-4 text-center font-quicksand text-sm text-gray-400">
        Top 10 players ranked by points earned at GameFest.
      </p>

      <div className="w-11/12 max-w-5xl">
        {loading && (
          <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-16">
            <p className="font-quicksand text-gray-400">Loading leaderboard…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 py-12">
            <p className="font-quicksand text-red-300">
              Could not load the leaderboard right now.
            </p>
          </div>
        )}

        {!loading && !error && topPlayers.length === 0 && (
          <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-12">
            <p className="font-quicksand text-gray-400">
              No players on the board yet — check back soon!
            </p>
          </div>
        )}

        {!loading && !error && topPlayers.length > 0 && (
          <div className="flex flex-col gap-4">
            {podium.length > 0 && (
              <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-3">
                {/* Reorder for visual podium on desktop: 2nd, 1st, 3rd */}
                {podium[1] && (
                  <div className="order-2 sm:order-1">
                    <PodiumCard player={podium[1]} rank={2} />
                  </div>
                )}
                {podium[0] && (
                  <div className="order-1 sm:order-2">
                    <PodiumCard player={podium[0]} rank={1} />
                  </div>
                )}
                {podium[2] && (
                  <div className="order-3">
                    <PodiumCard player={podium[2]} rank={3} />
                  </div>
                )}
              </div>
            )}

            {rest.length > 0 && (
              <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                {rest.map((player, idx) => (
                  <LeaderboardRow
                    key={player.id}
                    player={player}
                    rank={idx + 4}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeLeaderboard;
