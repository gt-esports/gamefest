import { useEffect, useMemo, useState } from "react";
import { SingleEliminationBracket, Match, SVGViewer } from "@g-loot/react-tournament-brackets";
import DropDownList from "../components/DropDownList";
import { useNavigate } from "react-router-dom";
import data from "../data/bracketData.json"; // change to databose fetch later

function Brac({ game, user }: { game: string; user: { role: string } }) {
  const router = useNavigate();
  const [selectedGame, setSelectedGame] = useState(game);
  const [winners, setWinners] = useState<{ [matchId: string]: string }>({});
  const isBoothGame = data.GAMES.booths.includes(selectedGame);
  const teamData = data.GAMES.pc_block[selectedGame as keyof typeof data.GAMES.pc_block]; //selectedGame is a key in pc_block
  const teamNames = teamData ? Object.keys(teamData) : [];
  const isBracketGame = teamNames.length >= 2;

  useEffect(() => { //for user role check
    if (user && user.role !== "Staff") {
      router("/");
    }
  }, [user]);

  const generateMatches = () => {
    type Team = { name: string };
    type Participant = { id: string; name: string; isWinner: boolean | undefined };
    type Match = {
      id: string;
      name: string;
      nextMatchId: string | null;
      tournamentRoundText: string;
      startTime: string;
      state: "DONE" | "SCHEDULED";
      participants: Participant[];
      onClick?: () => void;
    };
  
    const localWinners: { [matchId: string]: string } = {};
    const matches: Match[] = [];
    let idCounter = 1;
  
    // Pad to the next power of two with BYEs in round 1
    const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(teamNames.length)));
    const paddedTeams: Team[] = [...teamNames.map((t) => ({ name: t }))];
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
  
        if (isBye) {
          localWinners[id] = team1.name;
        }
  
        const winnerName = isBye ? team1.name : winners[id];
  
        const participants = [
          { id: `${i}`, name: team1.name, isWinner: winnerName === team1.name },
          { id: `${i + 1}`, name: team2.name, isWinner: winnerName === team2.name }
        ];
  
        const match: Match = {
          id,
          name: `Match ${id}`,
          nextMatchId: null,
          tournamentRoundText: `Round ${round}`,
          startTime: new Date().toISOString(),
          state: winnerName ? "DONE" : "SCHEDULED",
          participants,
          onClick: !isBye
            ? () => {
                const newWinner = winnerName === team1.name ? team2.name : team1.name;
                setWinners((prev) => ({ ...prev, [id]: newWinner }));
              }
            : undefined
        };
  
        roundMatches.push(match);
        nextRoundTeams.push({ name: winnerName || "TBD" });
      }
  
      matchMap[round] = roundMatches;
      matches.push(...roundMatches);
      currentRoundTeams = nextRoundTeams;
      round++;
    }
  
    // Wire up nextMatchId
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

  const matches = useMemo(() => generateMatches(), [winners, selectedGame]);

  const getFinalPlacements = () => {
    const finalMatch = matches[matches.length - 1];
    const winner = winners[finalMatch?.id];
    if (!winner) return [];

    const secondPlace = finalMatch.participants.find((p: any) => p.name !== winner)?.name;
    return [
      { team: winner, place: 1 },
      ...(secondPlace ? [{ team: secondPlace, place: 2 }] : [])
    ];
  };

  const placements = getFinalPlacements();

  const allGameKeys = [
    ...Object.keys(data.GAMES.pc_block),
    ...data.GAMES.booths
  ];

  return (
    <div className="flex justify-center items-center min-h-screen w-full">
      <div
        style={{
          width: "min(90%, 1400px)",
          backgroundColor: "rgba(60, 60, 78, 0.6)",
          padding: "40px",
          borderRadius: "15px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <div className="text-white text-lg mb-4">Bracket for {selectedGame}</div>
        <DropDownList
          items={allGameKeys}
          onSelect={(item) => {
            setSelectedGame(item);
            setWinners({});
          }}
        />

        {isBoothGame && (
          <div className="text-white mt-4">This is a booth game — not a tournament bracket.</div>
        )}

        {isBracketGame && matches.length > 0 && (
          <div className="w-full mt-6">
            <SingleEliminationBracket
              matches={matches}
              matchComponent={(props) => <Match {...props} />}
              svgWrapper={({ children, ...props }) => (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SVGViewer width={1200} height={800} {...props}>
                        {children}
                    </SVGViewer>
                </div>
              )}
            />
          </div>
        )}
        {placements.length > 0 && (
          <div className="mt-6 text-center">
            <h2 className="text-white text-lg font-semibold mb-2">Final Placements</h2>
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
