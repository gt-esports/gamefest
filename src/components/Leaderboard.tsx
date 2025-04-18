import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import { useAuth, useUser } from "@clerk/clerk-react";
import {motion } from 'framer-motion';

const Team = () => {
  const { getToken, isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  const [players, setPlayers] = useState<Array<{ name: string; points: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [raffleWinner, setRaffleWinner] = useState<{name: string; points: number} | null>(null);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const playersResponse = await fetch('/api/players');
        if (!playersResponse.ok) {
          throw new Error('Failed to fetch players data');
        }
        const playersData = await playersResponse.json();
        setPlayers(playersData);

        const winnersResponse = await fetch('/api/raffles/raffles');
        if (winnersResponse.ok) {
          const winnersData = await winnersResponse.json();
          
          if (winnersData.success && winnersData.data?.winners?.length > 0) {
            // if the raffle is run more than once,
            // there might be more than one winner
            // so we take the first one in the list
            const winner = winnersData.data.winners[0];
            setRaffleWinner({
              name: winner.name,
              points: winner.points
            });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (gameName: string) => {
    const trimmedGameName = gameName.trim().toLowerCase();
    const index = teams.findIndex((t) => t.player.trim().toLowerCase() === trimmedGameName);
    
    if (index !== -1) {
      setOpenIndex(index); // expand game tab when found

      setTimeout(() => { // timer delay to make scrollTo time to position correctly
        const id = teams[index].player.trim().replace(/\s+/g, "-").toLowerCase();
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

        {authLoaded && isSignedIn && userLoaded && user?.publicMetadata?.role === 'admin' && (
          <button
            className="bg-tech-gold hover:bg-tech-gold/90 font-bayon text-xl text-white py-2 px-4 rounded"
            onClick={async () => {
              const token = await getToken();
              fetch('/api/raffles/pick', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ count: 1 }) 
              })
              .then(response => {
                if (!response.ok) throw new Error('Failed to pick raffle winner');
                return response.json();
              })
              .then(data => {
                const winner = data.winner;
                setRaffleWinner(winner);
                alert(`Raffle winner selected: ${winner.name}`);
              })
              .catch(err => {
                console.error('Error picking raffle winner:', err);
                alert('Failed to pick raffle winner');
              });
            }}
          >
            Pick Raffle Winner
          </button>
        )}
      </div>

      {raffleWinner && (
        <motion.div 
          className="my-4 p-4 bg-tech-gold/20 border border-tech-gold rounded-lg text-white text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
        >
          <h1 className="text-3xl font-bayon">🎉 Raffle Winner 🎉</h1>
          <p className="text-xl mt-2">{raffleWinner.name} - {raffleWinner.points} Tokens</p>
        </motion.div>
      )}

      <div className="space-y-4">
        <div className='rounded-lg border border-white/20 p-4 bg-opacity-25 bg-gradient-to-br from-[#2e1d1d] to-[#101c3b] overflow-auto'>
            <div className="grid grid-cols-4 gap-4 font-quicksand text-center text-white uppercase text-lg">
                <p className="py-3">Rank</p>
                <p className="py-3">Player</p>
                <p className="py-3">Points</p>
                <p className="py-3">Details</p>
            </div>
            <hr className="border-white/20" />
            <div>
              {[...teams]
                .sort((a, b) => b.points - a.points)
                .map((team, index) => (
                    <button 
                        onClick={() => handleToggle(index)}
                        className='w-full'
                    >
                        <div className='grid grid-cols-4 text-white hover:text-tech-gold text-center text-md'>
                            <p className="py-4">{index + 1}</p>
                            <p className="py-4">{team.player}</p>
                            <p className="py-4">{team.points}</p>
                            <p className="py-4 flex justify-center">
                                <FaChevronDown className={`transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`} />
                            </p>

                            {/* team details */}
                            {openIndex !== null && openIndex === index && (
                            <div className="col-span-4 w-full">
                                <ul className="grid grid-cols-1 lg:grid-cols-5 gap-2">
                                    {/* {teams[openIndex].player.map((idx) => (
                                        <li key={idx} className="flex items-center px-4 py-2 border rounded-lg text-white border-tech-gold/50 hover:border-tech-gold border-b-4 overflow-auto">
                                            {player}
                                        </li>
                                    ))} */}
                                </ul>
                            </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>        
      </div>
    </div>
  );
};

console.log("Whit was here");
export default Team;
