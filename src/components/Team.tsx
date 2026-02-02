import { useEffect, useMemo, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";
import DropDownList from "./DropDownList";
import { usePlayers } from "../hooks/usePlayers";

type TeamRow = {
  name: string;
  players: string[];
  game: string;
  points: number;
};

const Team = () => {
  const location = useLocation();
  const { players, loading } = usePlayers();

  const teamToOpen = location.state?.teamToOpen?.toLowerCase() ?? null;
  const gameToOpen = location.state?.gameToOpen?.toLowerCase() ?? null;

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedGame, setSelectedGame] = useState<string>("Select a game");

  const { teams, games } = useMemo(() => {
    const gameMap: Record<string, Record<string, string[]>> = {};

    for (const player of players) {
      for (const assignment of player.teamAssignments || []) {
        const { game, team } = assignment;
        if (!gameMap[game]) gameMap[game] = {};
        if (!gameMap[game][team]) gameMap[game][team] = [];
        gameMap[game][team].push(player.name);
      }
    }

    const allTeams: TeamRow[] = [];
    const allGamesSet = new Set<string>();

    for (const game of Object.keys(gameMap)) {
      allGamesSet.add(game);

      for (const team of Object.keys(gameMap[game])) {
        const teamPlayers = gameMap[game][team];
        const participationPoints = teamPlayers.reduce((sum, playerName) => {
          const player = players.find((entry) => entry.name === playerName);
          return sum + (player?.participation?.length || 0);
        }, 0);

        allTeams.push({
          name: team,
          game,
          players: teamPlayers,
          points: participationPoints,
        });
      }
    }

    const allGames = Array.from(allGamesSet).sort((a, b) => a.localeCompare(b));

    return {
      teams: allTeams,
      games: ["Select a game", ...allGames],
    };
  }, [players]);

  useEffect(() => {
    if (!gameToOpen) return;

    const matchedGame = games.find((g) => g.trim().toLowerCase() === gameToOpen);
    if (matchedGame) {
      setSelectedGame(matchedGame);
    }
  }, [gameToOpen, games]);

  useEffect(() => {
    if (!teamToOpen) return;

    const index = teams.findIndex((team) => team.name.trim().toLowerCase() === teamToOpen);
    if (index !== -1) {
      setOpenIndex(index);
    }
  }, [teamToOpen, teams]);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleTeamSearch = (teamName: string) => {
    const trimmed = teamName.trim().toLowerCase();
    const index = teams.findIndex((team) => team.name.trim().toLowerCase() === trimmed);

    if (index === -1) return;

    setOpenIndex(index);
    setTimeout(() => {
      const id = teams[index].name.trim().replace(/\s+/g, "-").toLowerCase();
      const element = document.getElementById(id);
      if (!element) return;

      const yOffset = -70;
      const y = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y + yOffset, behavior: "smooth" });
    }, 100);
  };

  const handleGameSelect = (gameName: string) => {
    setSelectedGame(gameName);
    setOpenIndex(null);
  };

  const filteredTeams =
    selectedGame && selectedGame !== "Select a game"
      ? teams.filter((team) => team.game.toLowerCase() === selectedGame.toLowerCase())
      : teams;

  return (
    <div className="mx-auto p-8 px-10 lg:px-20">
      <div className="flex flex-col items-center justify-between lg:flex-row">
        <SearchBar onSearch={handleTeamSearch} items={teams.map((team) => team.name)} />
        <DropDownList items={games} onSelect={handleGameSelect} />
      </div>

      {loading && (
        <p className="mb-4 text-sm text-gray-300">Loading teams...</p>
      )}

      <div className="space-y-4">
        {filteredTeams.map((tab, index) => (
          <div
            key={`${tab.game}-${tab.name}`}
            id={tab.name.replace(/\s+/g, "-").toLowerCase()}
            className={`rounded-lg border border-white/20 bg-opacity-25 bg-gradient-to-br p-4 ${
              openIndex === index ? "from-[#2e1d1d] to-[#101c3b]" : "from-[#241717] to-[#101c3b]"
            } transition-all duration-200 ease-in-out`}
          >
            <button
              onClick={() => handleToggle(index)}
              className="flex w-full items-center justify-between text-left font-semibold text-white hover:text-tech-gold focus:outline-none"
            >
              <span className="text-lg tracking-wider">{tab.name}</span>
              <FaChevronDown
                className={`transition-transform duration-200 ${
                  openIndex === index ? "rotate-180 transform" : ""
                }`}
              />
            </button>

            {openIndex === index && (
              <div className="mt-4 flex flex-col items-center">
                <div className="hidden w-full items-start justify-between space-x-8 lg:flex">
                  <div className="flex flex-col">
                    <h1 className="font-bayon text-9xl">{tab.points}</h1>
                    <span className="font-quicksand text-xl">points</span>
                  </div>
                  <div className="max-h-screen w-full overflow-y-auto">
                    {tab.players.map((playerName) => (
                      <div
                        key={playerName}
                        className="mb-2 flex items-start justify-between rounded-lg border border-b-4 border-tech-gold/50 px-4 py-2 text-center hover:border-tech-gold"
                      >
                        <span className="text-lg font-bold">{playerName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex w-full flex-col overflow-y-auto px-1 lg:hidden">
                  <h1 className="font-bayon text-9xl">
                    {tab.points}
                    <span className="font-quicksand text-lg">pts</span>
                  </h1>
                  {tab.players.map((playerName) => (
                    <div
                      key={playerName}
                      className="mb-2 flex items-start justify-between rounded-lg border border-b-4 border-tech-gold/50 px-4 py-2 text-center hover:border-tech-gold"
                    >
                      <span className="text-lg font-bold">{playerName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;
