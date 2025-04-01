import { Bracket, IRoundProps } from 'react-brackets';
import { useState, useMemo, useEffect } from 'react';
import Dropdown from '../components/Dropdown';
import { useNavigate } from "react-router-dom";

function Brac({ game, user }: { game: string, user: { role: string } }) {
  const router = useNavigate();
  const [selectedGame, setSelectedGame] = useState('Game 1');
  const [winners, setWinners] = useState<{ [matchId: number]: string }>({});

  const games: string[] = Array.from({ length: 16 }, (_, i) => `Game ${i + 1}`);
  const teamNames = [
    'Team A', 'Team B', 'Team C', 'Team D',
    'Team E', 'Team F', 'Team G', 'Team H',
    'Team I', 'Team J', 'Team K', 'Team L',
    'Team M', 'Team N', 'Team O', 'Team P'
  ];

  useEffect(() => {
    if (user && user.role !== 'Staff') {
      router('/');
    }
  }, [user]);
  

  function generateBracketRounds(teams: string[]): IRoundProps[] {
    const rounds: IRoundProps[] = [];
    let currentRoundTeams = teams.map(name => ({ name }));
    let roundNumber = 1;
    let matchId = 1;

    while (currentRoundTeams.length > 1) {
      const seeds = [];

      for (let i = 0; i < currentRoundTeams.length; i += 2) {
        const team1 = currentRoundTeams[i];
        const team2 = currentRoundTeams[i + 1];

        const id = matchId++;
        const seed = {
          id,
          date: new Date().toDateString(),
          teams: team2 ? [team1, team2] : [team1, { name: 'BYE' }],
          winner: winners[id] ?? null,
          onClick: () => {
            if (!team2) return;
            const newWinner = winners[id] === team1.name ? team2.name : team1.name;
            setWinners(prev => ({ ...prev, [id]: newWinner }));
          }
        };
        seeds.push(seed);
      }

      rounds.push({
        title: `Round ${roundNumber}`,
        seeds
      });

      currentRoundTeams = seeds.map(seed => ({
        name: winners[seed.id] ?? `TBD`
      }));

      roundNumber++;
    }

    return rounds;
  }

  const rounds = useMemo(() => generateBracketRounds(teamNames), [winners]);

  function getFinalPlacements(): { team: string, place: number }[] {
    const places: { team: string, place: number }[] = [];
    if (Object.keys(winners).length === 0) return places;

    const finalRound = rounds[rounds.length - 1];
    const finalMatch = finalRound?.seeds[0];
    const lastMatchId = finalMatch?.id;
    const firstPlace = typeof lastMatchId === "number" ? winners[lastMatchId] : null;

    if (firstPlace) {
      const secondPlace = finalMatch?.teams.find(t => t.name !== firstPlace)?.name;
      places.push({ team: firstPlace, place: 1 });
      if (secondPlace) places.push({ team: secondPlace, place: 2 });
    }
  
    return places;
  }
  
  const placements = getFinalPlacements();
  console.log('placements:', placements);
  console.log("Rounds:", rounds);
  console.log("Winners:", winners);
  console.log("Placements:", placements);


  return (
    <div className="flex justify-center items-center min-h-screen w-full">
      <div
        style={{
          width: 'min(90%, 1400px)',
          height: 'auto',
          backgroundColor: 'rgba(60, 60, 78, 0.6)',
          padding: '40px',
          borderRadius: '15px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div className="p-4 rounded text-white w-full flex flex-col justify-center items-center">
          <div className="text-lg mb-4">Bracket for {selectedGame}</div>
          <div className="w-full flex justify-center">
            <div className="w-full flex justify-center">
              <Bracket rounds={rounds} />
            </div>
            <div className="">
              <Dropdown selectedGame={selectedGame} setSelectedGame={setSelectedGame} games={games} />
            </div>
          </div>

          {/*Final Placements */}
          {placements.length > 0 && (
            <div className="mt-6 text-center">
              <h2 className="text-white text-lg font-semibold mb-2">Final Placements</h2>
              {placements.map(p => (
                <div key={p.team} className="text-white">
                  {p.place}. {p.team}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Brac;
