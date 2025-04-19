import { useEffect, useMemo, useState, ReactNode } from "react";
import {
  SingleEliminationBracket,
  SVGViewer,
} from "@g-loot/react-tournament-brackets";
import DropDownList from "../components/DropDownList";
import { useNavigate, useSearchParams } from "react-router-dom";
import eventMap from "../assets/event_map.png";
import { useAuth, useUser } from "@clerk/clerk-react";

function Brac() {
  const [gameData, setGameData] = useState<any[]>([]);
  const { getToken } = useAuth();
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialGame = searchParams.get("game");
  const [selectedGame, setSelectedGame] = useState<string | null>(initialGame);
  const [winners, setWinners] = useState<{ [matchId: string]: string }>({});

  useEffect(() => {
    const fetchPlayers = async () => {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/players`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const players = await res.json();

      const gameMap: { [game: string]: { [team: string]: string[] } } = {};

      for (const player of players) {
        for (const assignment of player.teamAssignments || []) {
          const { game, team } = assignment;
          if (!gameMap[game]) gameMap[game] = {};
          if (!gameMap[game][team]) gameMap[game][team] = [];
          gameMap[game][team].push(player.name);
        }
      }

      const gameData = Object.entries(gameMap).map(([name, teamMap]) => ({
        name,
        teams: Object.entries(teamMap).map(([teamName, players]) => ({
          name: teamName,
          players,
        })),
      }));

      setGameData(gameData);
    };

    fetchPlayers();
  }, [getToken]);

  useEffect(() => {
    const fetchWinners = async () => {
      if (!selectedGame) return;
      const token = await getToken();
      const res = await fetch(`/api/winner/${selectedGame}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const map: { [matchId: string]: string } = {};
      for (const entry of data) {
        map[entry.matchId] = entry.winner;
      }
      setWinners(map);
    };

    fetchWinners();
  }, [selectedGame]);

  const saveWinner = async (matchId: string, winner: string) => {
    const token = await getToken();
    await fetch("/api/winner", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ game: selectedGame, matchId, winner }),
    });
  };

  async function getPlayersForTeam(
    game: string,
    teamName: string
  ): Promise<string[]> {
    const selected = gameData.find((g) => g.name === game);
    const team = selected?.teams.find((t: any) => t.name === teamName);
    return team?.players || [];
  }

  const teamData = Array.isArray(gameData)
    ? gameData.find((g: any) => g.name === selectedGame)?.teams
    : [];
  const teamNames = teamData?.map((team: any) => team.name) || [];
  const isBracketGame = selectedGame && teamNames.length >= 2;
  const isBoothGame = selectedGame && !isBracketGame;

  const generateMatches = () => {
    type Team = { name: string };
    type Match = {
      id: string;
      name: string;
      nextMatchId: string | null;
      tournamentRoundText: string;
      startTime: string;
      state: "DONE" | "SCHEDULED";
      participants: {
        id: string;
        name: string;
        isWinner: boolean | undefined;
      }[];
      onClick?: () => void;
    };

    const matches: Match[] = [];
    let idCounter = 1;

    const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(teamNames.length)));
    const paddedTeams: Team[] = [
      ...teamNames.map((t: string) => ({ name: t })),
    ];
    while (paddedTeams.length < nextPowerOfTwo) {
      paddedTeams.push({ name: "BYE" });
    }

    let currentRoundTeams: Team[] = paddedTeams;
    let round = 1;
    const matchMap: { [round: number]: Match[] } = {};

    while (currentRoundTeams.length > 1) {
      const roundMatches: Match[] = [];
      const nextRoundTeams: Team[] = [];

      for (let i = 0; i < currentRoundTeams.length; i += 2) {
        const team1 = currentRoundTeams[i];
        const team2 = currentRoundTeams[i + 1] || { name: "BYE" };
        const id = `${idCounter++}`;

        const isBye = team2.name === "BYE";
        if (isBye && !winners[id]) {
          winners[id] = team1.name;
        }

        const winnerName = isBye ? team1.name : winners[id];

        const match: Match = {
          id,
          name: `Match ${id}`,
          nextMatchId: null,
          tournamentRoundText: `Round ${round}`,
          startTime: new Date().toISOString(),
          state: winnerName ? "DONE" : "SCHEDULED",
          participants: [
            {
              id: `${i}`,
              name: team1.name,
              isWinner: winnerName === team1.name,
            },
            {
              id: `${i + 1}`,
              name: team2.name,
              isWinner: winnerName === team2.name,
            },
          ],
          onClick: !isBye
            ? () => {
                const newWinner =
                  winnerName === team1.name ? team2.name : team1.name;
                setWinners((prev) => ({ ...prev, [id]: newWinner }));
                saveWinner(id, newWinner);
              }
            : undefined,
        };

        roundMatches.push(match);
        nextRoundTeams.push({ name: winnerName || "TBD" });
      }

      matchMap[round] = roundMatches;
      matches.push(...roundMatches);
      currentRoundTeams = nextRoundTeams;
      round++;
    }

    const roundKeys = Object.keys(matchMap).map(Number);
    for (let i = 0; i < roundKeys.length - 1; i++) {
      const current = matchMap[roundKeys[i]];
      const next = matchMap[roundKeys[i + 1]];
      for (let j = 0; j < current.length; j += 2) {
        const nextMatch = next[Math.floor(j / 2)];
        if (nextMatch && current[j] && current[j + 1]) {
          current[j].nextMatchId = nextMatch.id;
          current[j + 1].nextMatchId = nextMatch.id;
        }
      }
    }

    return matches;
  };

  const matches = useMemo(() => {
    if (!teamData) return [];
    return generateMatches();
  }, [winners, selectedGame, teamData]);

  const getFinalPlacements = () => {
    const finalMatch = matches[matches.length - 1];
    const winner = winners[finalMatch?.id];
    if (!winner) return [];
    const secondPlace = finalMatch.participants.find(
      (p: any) => p.name !== winner
    )?.name;
    return [
      { team: winner, place: 1 },
      ...(secondPlace ? [{ team: secondPlace, place: 2 }] : []),
    ];
  };

  const placements = getFinalPlacements();
  const allGameKeys = Array.isArray(gameData)
    ? gameData.map((game) => game.name)
    : [];

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div
        style={{
          width: "min(90%, 1400px)",
          backgroundColor: "rgba(60, 60, 78, 0.6)",
          padding: "40px",
          borderRadius: "15px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div className="mb-4 text-lg text-white">
          {selectedGame
            ? `Bracket for ${selectedGame}`
            : "Select a game to view bracket"}
        </div>
        <DropDownList
          items={allGameKeys}
          onSelect={(item) => {
            setSelectedGame(item);
            setWinners({});
            navigate(`/brackets?game=${item}`);
          }}
        />

        {isBoothGame && (
          <div className="mt-4 flex flex-col items-center gap-4 text-white">
            <p>This is a booth game — please find the booth.</p>
            <img
              src={eventMap}
              alt="Event Booth Map"
              className="h-[520px] max-w-full rounded-lg"
            />
          </div>
        )}

        {isBracketGame && matches.length > 0 && (
          <div className="mt-6 w-full">
            <SingleEliminationBracket
              matches={matches}
              options={{
                style: {
                  roundHeader: {
                    backgroundColor: "#0F172A",
                    fontColor: "#F8FAFC",
                  },
                  connectorColor: "#60a5fa",
                  connectorColorHighlight: "#3b82f6",
                },
              }}
              svgWrapper={({ children, ...props }: { children: ReactNode }) => {
                const isMobile =
                  typeof window !== "undefined" && window.innerWidth < 768;

                return (
                  <div
                    style={{
                      width: "100%",
                      overflowX: "auto",
                      padding: "0 1rem",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ minWidth: isMobile ? "1000px" : "1200px" }}>
                      <SVGViewer
                        background="transparent"
                        SVGBackground="transparent"
                        width={isMobile ? 1000 : 1200}
                        height={isMobile ? 700 : 800}
                        {...props}
                      >
                        {children}
                      </SVGViewer>
                    </div>
                  </div>
                );
              }}
              matchComponent={({
                match,
                topParty,
                bottomParty,
                topWon,
                bottomWon,
                teamNameFallback,
              }: any) => {
                const handleNavigate = async () => {
                  const team1 = match.participants[0]?.name;
                  const team2 = match.participants[1]?.name;

                  if (
                    !team1 ||
                    !team2 ||
                    team1 === "BYE" ||
                    team2 === "BYE" ||
                    team1 === "TBD" ||
                    team2 === "TBD"
                  )
                    return;

                  const players1 = await getPlayersForTeam(
                    selectedGame!,
                    team1
                  );
                  const players2 = await getPlayersForTeam(
                    selectedGame!,
                    team2
                  );

                  navigate(`/match/${match.id}`, {
                    state: {
                      round: match.tournamentRoundText,
                      game: selectedGame,
                      team1,
                      team2,
                      players1,
                      players2,
                    },
                  });
                };

                const handleToggle = (
                  e: React.MouseEvent<HTMLDivElement, MouseEvent>
                ) => {
                  e.stopPropagation();
                  if (user?.publicMetadata?.role === "admin") {
                    match.onClick?.();
                  }
                };

                return (
                  <div
                    onClick={handleNavigate}
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      border: "1px solid #ccc",
                      borderRadius: "10px",
                      backgroundColor: "rgba(232, 233, 244, 0.73)",
                      padding: "10px 14px",
                      margin: "4px 0",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
                      cursor: "pointer",
                      transition: "transform 0.15s ease, box-shadow 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        right: "18px",
                        top: "8px",
                        bottom: "8px",
                        width: "2px",
                        backgroundColor: "#3b82f6",
                        borderRadius: "1px",
                        opacity: 0.5,
                      }}
                    />
                    {[topParty, bottomParty].map((p: any, idx: number) => {
                      const isWinner = idx === 0 ? topWon : bottomWon;
                      const isBYE = p.name === "BYE";
                      return (
                        <div
                          key={p.id}
                          onClick={(e) => handleToggle(e)}
                          style={{
                            fontWeight: isWinner ? "700" : "400",
                            color: isWinner ? "#1e3a8a" : "#333",
                            opacity: isBYE ? 0.5 : 1,
                            fontSize: "0.9rem",
                            padding: "4px 0",
                            borderLeft: isWinner
                              ? "4px solid #1e3a8a"
                              : "4px solid transparent",
                            paddingLeft: "8px",
                            cursor: "pointer",
                          }}
                        >
                          {p.name || teamNameFallback}
                        </div>
                      );
                    })}
                  </div>
                );
              }}
            />
          </div>
        )}

        {placements.length > 0 && (
          <div className="mt-6 text-center">
            <h2 className="mb-2 text-lg font-semibold text-white">
              Final Placements
            </h2>
            {placements.map((p) => (
              <div key={p.team} className="text-white">
                {p.place}. {p.team}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Brac;
