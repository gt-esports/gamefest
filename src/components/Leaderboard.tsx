import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import { useAuth, useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";

const Team = () => {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [players, setPlayers] = useState<
    Array<{ name: string; points: number }>
  >([]);
  const [raffleWinners, setRaffleWinners] = useState<
    Array<{ name: string; points: number; place: string }>
  >([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("/api/players");
        if (!response.ok) {
          throw new Error("Failed to fetch players data");
        }
        const data = await response.json();
        setPlayers(data);
      } catch (err) {
        console.error("Error fetching teams:", err);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const playersResponse = await fetch("/api/players");
        if (!playersResponse.ok) {
          throw new Error("Failed to fetch players data");
        }
        const playersData = await playersResponse.json();
        setPlayers(playersData);

        const winnersResponse = await fetch("/api/raffles/getWinner");
        if (winnersResponse.ok) {
          const winnersData = await winnersResponse.json();
          setRaffleWinners(winnersData.data.winners);
        } else {
          // reset winners
          setRaffleWinners([]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (gameName: string) => {
    const trimmedGameName = gameName.trim().toLowerCase();
    const index = players.findIndex(
      (player) => player.name.trim().toLowerCase() === trimmedGameName
    );

    if (index !== -1) {
      setTimeout(() => {
        // timer delay to make scrollTo time to position correctly
        const id = players[index].name
          .trim()
          .replace(/\s+/g, "-")
          .toLowerCase();
        const teamsElement = document.getElementById(id);

        if (teamsElement) {
          const y = -70;
          const pos = teamsElement.getBoundingClientRect().top + window.scrollY;

          window.scrollTo({
            top: pos + y,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };

  return (
    <div className="mx-auto p-8 px-10 lg:px-20">
      <div className="flex flex-row items-center justify-between">
        <SearchBar
          onSearch={handleSearch}
          items={players.map((player) => player.name)}
        />

        {/* pick raffle winner - admin only */}
        {user?.publicMetadata?.role === "admin" && (
          <div className='space-x-4'>
            {/* reset winners */}
            <button
              className="rounded bg-tech-gold px-4 py-2 font-bayon text-xl text-white hover:bg-tech-gold/90"
              onClick={async () => {
                const token = await getToken();
                fetch("/api/raffles/reset", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                })
                  .then((response) => {
                    if (!response.ok)
                      throw new Error("Failed to reset raffle winners");
                    return response.json();
                  })
                  .then(() => {
                    alert("Raffle winners reset successfully");
                    setRaffleWinners([]);
                  })
                  .catch((err) => {
                    console.error("Error resetting raffle winners:", err);
                    alert("Failed to reset raffle winners");
                  });
              }}
            >
              Reset Raffle Winners
            </button>
            {/* pick raffle winner */}
            <button
              className="rounded bg-tech-gold px-4 py-2 font-bayon text-xl text-white hover:bg-tech-gold/90"
              onClick={async () => {
                const token = await getToken();
                fetch("/api/raffles/pick", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ count: 3 }),
                })
                  .then((response) => {
                    if (!response.ok)
                      throw new Error("Failed to pick raffle winner");
                    return response.json();
                  })
                  .then((data) => {
                    if (data.success && data.winners) {
                      setRaffleWinners(data.winners);
                      alert(
                        `Raffle winners: ${data.winners
                          .map((w: { name: string }) => w.name)
                          .join(", ")}`
                      );
                    }
                  })
                  .catch((err) => {
                    console.error("Error picking raffle winners:", err);
                    alert("Failed to pick raffle winners");
                  });
              }}
            >
              Pick Raffle Winners
            </button>
          </div>
        )}
      </div>

      {raffleWinners.length > 0 && (
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
          <h1 className="mb-4 text-center font-bayon text-3xl">
            🎉 Raffle Winners 🎉
          </h1>
          <div className="grid grid-cols-3 gap-4">
            {raffleWinners
              .sort((a, b) => {
                const placeOrder = { "1st": 1, "2nd": 2, "3rd": 3 };
                return (
                  placeOrder[a.place as keyof typeof placeOrder] -
                  placeOrder[b.place as keyof typeof placeOrder]
                );
              })
              .map((winner, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-4 ${
                    winner.place === "1st"
                      ? "border border-tech-gold bg-tech-gold/30"
                      : winner.place === "2nd"
                      ? "border border-[#C0C0C0] bg-[#C0C0C0]/20"
                      : "border border-[#CD7F32] bg-[#CD7F32]/20"
                  } text-center`}
                >
                  <div className="mb-2 font-bayon text-2xl">
                    {winner.place === "1st"
                      ? "🥇"
                      : winner.place === "2nd"
                      ? "🥈"
                      : "🥉"}
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
          <div>
            {[...players]
              .sort((a, b) => b.points - a.points)
              .map((player, index) => {
                // Find if this player is a winner
                const winnerEntry = raffleWinners.find(
                  (w) => w.name === player.name
                );
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
                          {place === "1st"
                            ? "🥇"
                            : place === "2nd"
                            ? "🥈"
                            : "🥉"}
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

console.log("Whit was here");
export default Team;
