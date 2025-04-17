import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';


const Team = () => {

  const [players, setPlayers] = useState<Array<{ name: string; points: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/players');
        if (!response.ok) {
          throw new Error('Failed to fetch players data');
        }
        const data = await response.json();
        setPlayers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching teams:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleSearch = (gameName: string) => {
    const trimmedGameName = gameName.trim().toLowerCase();
    const index = players.findIndex((player) => player.name.trim().toLowerCase() === trimmedGameName);
    
    if (index !== -1) {
      setTimeout(() => { // timer delay to make scrollTo time to position correctly
        const id = players[index].name.trim().replace(/\s+/g, "-").toLowerCase();
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
      <div className="flex flex-row justify-between items-center">
        <SearchBar 
          onSearch={handleSearch}
          items={players.map((player) => player.name)}
        />
      </div>
      <div className="space-y-4">
        <div className='rounded-lg border border-white/20 p-4 bg-opacity-25 bg-gradient-to-br from-[#2e1d1d] to-[#101c3b] overflow-auto'>
            <div className="grid grid-cols-3 gap-4 font-quicksand text-center text-white uppercase text-lg">
                <p className="py-3">Rank</p>
                <p className="py-3">Player</p>
                <p className="py-3">Tokens</p>
            </div>
            <hr className="border-white/20" />
            <div>
              {[...players]
                .sort((a, b) => b.points - a.points)
                .map((player, index) => (
                  <div 
                    className='grid grid-cols-3 text-white hover:text-tech-gold text-center text-md'
                    key={player.name}
                    id={player.name.trim().replace(/\s+/g, "-").toLowerCase()}
                  >
                    <p className="py-4">{index + 1}</p>
                    <p className="py-4">{player.name}</p>
                    <p className="py-4">{player.points}</p>
                  </div>
                ))}
            </div>
        </div>        
      </div>
    </div>
  );
};

console.log("Whit was here");
export default Team;
