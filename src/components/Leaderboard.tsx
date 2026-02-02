import { useMemo } from "react";
import SearchBar from "./SearchBar";
import { usePlayers } from "../hooks/usePlayers";
import { useRaffles } from "../hooks/useRaffles";
import { useUserRoles } from "../hooks/useUserRoles";
import { motion } from "framer-motion";

const placeOrder = { "1st": 1, "2nd": 2, "3rd": 3 };

const Team = () => {
  const { isAdmin } = useUserRoles();
  const { players, loading: playersLoading, refresh: refreshPlayers } = usePlayers();
  const { winners: raffleWinners, loading: winnersLoading, mutating, pick, reset } = useRaffles();

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => b.points - a.points),
    [players]
  );

  const sortedRaffleWinners = useMemo(
    () =>
      [...raffleWinners].sort(
        (a, b) =>
          placeOrder[a.place as keyof typeof placeOrder] -
          placeOrder[b.place as keyof typeof placeOrder]
      ),
    [raffleWinners]
  );

  const handleSearch = (playerName: string) => {
    const trimmedPlayerName = playerName.trim().toLowerCase();
    const index = sortedPlayers.findIndex(
      (player) => player.name.trim().toLowerCase() === trimmedPlayerName
    );

    if (index === -1) return;

    setTimeout(() => {
      const id = sortedPlayers[index].name.trim().replace(/\s+/g, "-").toLowerCase();
      const playerElement = document.getElementById(id);

      if (!playerElement) return;

      const y = -70;
      const pos = playerElement.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: pos + y,
        behavior: "smooth",
      });
    }, 100);
  };

  return (
    <div className="mx-auto p-8 px-10 lg:px-20">
      <div className="flex flex-row items-center justify-between">
        <SearchBar
          onSearch={handleSearch}
          items={sortedPlayers.map((player) => player.name)}
        />

        {isAdmin && (
          <div className="space-x-4">
            <button
              className="rounded bg-tech-gold px-4 py-2 font-bayon text-xl text-white hover:bg-tech-gold/90"
              onClick={async () => {
                try {
                  await reset();
                  await refreshPlayers();
                  alert("Raffle winners reset successfully");
                } catch (err) {
                  console.error("Error resetting raffle winners:", err);
                  alert("Failed to reset raffle winners");
                }
              }}
              disabled={mutating}
            >
              Reset Raffle Winners
            </button>
            <button
              className="rounded bg-tech-gold px-4 py-2 font-bayon text-xl text-white hover:bg-tech-gold/90"
              onClick={async () => {
                try {
                  const picked = await pick(3);
                  await refreshPlayers();
                  alert(`Raffle winners: ${picked.map((winner) => winner.name).join(", ")}`);
                } catch (err) {
                  console.error("Error picking raffle winners:", err);
                  alert(err instanceof Error ? err.message : "Failed to pick raffle winners");
                }
              }}
              disabled={mutating}
            >
              Pick Raffle Winners
            </button>
          </div>
        )}
      </div>

      {sortedRaffleWinners.length > 0 && (
        <motion.div
          className="my-4 rounded-lg border border-tech-gold bg-tech-gold/20 p-4 text-center text-white"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          <h1 className="mb-4 text-center font-bayon text-3xl">🎉 Raffle Winners 🎉</h1>
          <div className="grid grid-cols-3 gap-4">
            {sortedRaffleWinners.map((winner) => (
              <div
                key={`${winner.name}-${winner.place}`}
                className={`rounded-lg p-4 ${
                  winner.place === "1st"
                    ? "border border-tech-gold bg-tech-gold/30"
                    : winner.place === "2nd"
                    ? "border border-[#C0C0C0] bg-[#C0C0C0]/20"
                    : "border border-[#CD7F32] bg-[#CD7F32]/20"
                } text-center`}
              >
                <div className="mb-2 font-bayon text-2xl">
                  {winner.place === "1st" ? "🥇" : winner.place === "2nd" ? "🥈" : "🥉"}
                </div>
                <div className="text-xl">{winner.name}</div>
                <div className="text-md">{winner.points} Tokens</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        <div className="overflow-auto rounded-lg border border-white/20 bg-opacity-25 bg-gradient-to-br from-[#2e1d1d] to-[#101c3b] p-4">
          <div className="grid grid-cols-3 gap-4 text-center font-quicksand text-lg uppercase text-white">
            <p className="py-3">Rank</p>
            <p className="py-3">Player</p>
            <p className="py-3">Tokens</p>
          </div>
          <hr className="border-white/20" />
          {(playersLoading || winnersLoading) && (
            <p className="py-4 text-center text-sm text-gray-300">Loading leaderboard...</p>
          )}
          <div>
            {sortedPlayers.map((player, index) => {
              const winnerEntry = sortedRaffleWinners.find((winner) => winner.name === player.name);
              const isWinner = winnerEntry !== undefined;
              const place = winnerEntry?.place || "";

              return (
                <div
                  className={`text-md grid grid-cols-3 text-center ${
                    isWinner
                      ? place === "1st"
                        ? "bg-tech-gold/10 font-bold text-tech-gold"
                        : place === "2nd"
                        ? "bg-[#C0C0C0]/10 font-bold text-[#C0C0C0]"
                        : "bg-[#CD7F32]/10 font-bold text-[#CD7F32]"
                      : "text-white hover:text-tech-gold"
                  }`}
                  key={player.name}
                  id={player.name.trim().replace(/\s+/g, "-").toLowerCase()}
                >
                  <p className="py-4">
                    {index + 1}{" "}
                    {isWinner && (
                      <span className="ml-1">
                        {place === "1st" ? "🥇" : place === "2nd" ? "🥈" : "🥉"}
                      </span>
                    )}
                  </p>
                  <p className="py-4">{player.name}</p>
                  <p className="py-4">{player.points}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
