import { useEffect, useMemo, useState } from "react";
import { SingleEliminationBracket, SVGViewer, createTheme} from "@g-loot/react-tournament-brackets";
import DropDownList from "../components/DropDownList";
import { useNavigate } from "react-router-dom";
import eventMap from "../assets/event_map.png";
import data from "../data/bracketData.json"; // change to databose fetch later
function getPlayersForTeam(
  game: string,
  teamName: string
): string[] {
  const teams = data.GAMES.pc_block[game as keyof typeof data.GAMES.pc_block];
  return teams?.[teamName as keyof typeof teams] || [];
}

function Brac({ game, user }: { game: string; user: { role: string } }) {
  const [selectedGame, setSelectedGame] = useState(game);
  const [winners, setWinners] = useState<{ [matchId: string]: string }>({});
  const isBoothGame = data.GAMES.booths.includes(selectedGame);
  const teamData = data.GAMES.pc_block[selectedGame as keyof typeof data.GAMES.pc_block]; //selectedGame is a key in pc_block
  const teamNames = teamData ? Object.keys(teamData) : [];
  const isBracketGame = teamNames.length >= 2;
  const router = useNavigate();
  
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
          <div className="text-white mt-4 flex flex-col items-center gap-4">
            <p>This is a booth game — please find the booth.</p>
            <img
              src={eventMap}
              alt="Event Booth Map"
              className="rounded-lg max-w-full h-[520px]"
            />
          </div>
        )}

        {isBracketGame && matches.length > 0 && (
          <div className="w-full mt-6">
            <SingleEliminationBracket
              matches={matches}
              options={{
                style: {
                  roundHeader: { backgroundColor: '#0F172A', fontColor: '#F8FAFC' },
                  connectorColor: '#60a5fa',
                  connectorColorHighlight: '#3b82f6'
                },
              }}              
              svgWrapper={({ children, ...props }) => (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <SVGViewer background="transparent" SVGBackground="transparent" width={1200} height={800} {...props}>
                    {children}
                  </SVGViewer>
                </div>
              )}
              matchComponent={({ match, topParty, bottomParty, topWon, bottomWon, teamNameFallback }) => {
                const handleNavigate = () => {
                  console.log('Navigating to match:', match.id);
                  router(`/match/${match.id}`, {
                    state: {
                      round: match.tournamentRoundText,
                      game: selectedGame,
                      team1: match.participants[0].name,
                      team2: match.participants[1].name,
                      players1: getPlayersForTeam(selectedGame, match.participants[0].name),
                      players2: getPlayersForTeam(selectedGame, match.participants[1].name),
                    }
                  });                  
                };
              
                const handleToggle = (e, partyName) => {
                  e.stopPropagation();
                  match.onClick?.();
                };
              
                return (
                  <div
                    onClick={handleNavigate}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      border: '1px solid #ccc',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(232, 233, 244, 0.73)',
                      padding: '10px 14px',
                      margin: '4px 0',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)';
                      const hint = e.currentTarget.querySelector('.hover-hint');
                      if (hint) hint.setAttribute('style', 'opacity:1; transform: translateY(0);');
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.08)';
                      const hint = e.currentTarget.querySelector('.hover-hint');
                      if (hint) hint.setAttribute('style', 'opacity:0; transform: translateY(4px);');
                    }}
                  >
                    {/* divide line */}
                    <div
                      style={{
                        position: 'absolute',
                        right: '18px',
                        top: '8px',
                        bottom: '8px',
                        width: '2px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '1px',
                        opacity: 0.5,
                      }}
                    />
              
                    {[topParty, bottomParty].map((p, idx) => {
                      const isWinner = idx === 0 ? topWon : bottomWon;
                      const isBYE = p.name === 'BYE';
                      return (
                        <div
                          key={p.id}
                          onClick={(e) => handleToggle(e, p.name)}
                          style={{
                            fontWeight: isWinner ? '700' : '400',
                            color: isWinner ? '#1e3a8a' : '#333',
                            opacity: isBYE ? 0.5 : 1,
                            fontSize: '0.9rem',
                            padding: '4px 0',
                            borderLeft: isWinner ? '4px solid #1e3a8a' : '4px solid transparent',
                            paddingLeft: '8px',
                            cursor: 'pointer',
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