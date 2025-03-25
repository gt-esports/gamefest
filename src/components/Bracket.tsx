import { Bracket, IRoundProps } from 'react-brackets';
import { useState } from 'react';
import Dropdown from "../components/Dropdown";
function Brac({ game }: { game: string }) {
  const [selectedGame, setSelectedGame] = useState("Game 1");
  const games: string[] = Array.from({ length: 16 }, (_, i) => `Game ${i + 1}`);
  const teamNames = [
    'Team A', 'Team B', 'Team C', 'Team D',
    'Team E', 'Team F', 'Team G', 'Team H',
    'Team I', 'Team J', 'Team K', 'Team L',
    'Team M', 'Team N', 'Team O', 'Team P'
  ];
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
  
        const seed = {
          id: matchId++,
          date: new Date().toDateString(),
          teams: team2 ? [team1, team2] : [team1, { name: "BYE" }],
        };
        seeds.push(seed);
      }
  
      rounds.push({
        title: `Round ${roundNumber}`,
        seeds,
      });
  
      // Promote winners (replace this later with actual results)
      currentRoundTeams = seeds.map((_, idx) => ({
        name: `Winner ${matchId - seeds.length + idx}`,
      }));
  
      roundNumber++;
    }
    return rounds;
  }
  const rounds: IRoundProps[] = generateBracketRounds(teamNames);

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
          alignItems: 'center',
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
        </div>
      </div>
    </div>
  );
}

export default Brac;
