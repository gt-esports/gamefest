import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import SearchBar from './SearchBar';
import DropDownList from './DropDownList';

const Team = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const teams = [
    {
      name: "Team A",
      players: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'],
      points: 100,
    },
    {
      name: "Team B",
      players: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'],
      points: 90,
    },
    {
      name: "Team C",
      players: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'],
      points: 80,
    },
    {
      name: "Team D",
      players: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'],
      points: 70,
    },
    {
      name: "Team E",
      players: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'],
      points: 60,
    },
    {
      name: "Team F",
      players: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'],
      points: 50,
    },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  const handleSearch = (gameName: string) => {
    const trimmedGameName = gameName.trim().toLowerCase();
    const index = teams.findIndex((t) => t.name.trim().toLowerCase() === trimmedGameName);
    
    if (index !== -1) {
      setOpenIndex(index); // expand game tab when found

      setTimeout(() => { // timer delay to make scrollTo time to position correctly
        const id = teams[index].name.trim().replace(/\s+/g, "-").toLowerCase();
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
      <div className="flex flex-col lg:flex-row justify-between items-center">
        <SearchBar 
          onSearch={handleSearch}
          items={teams.map((teams) => teams.name)}
        />
        <DropDownList 
          items={teams.map((teams) => teams.name)}
          onSelect={handleSearch}
        />
      </div>
      <div className="space-y-4">
        <div className='rounded-lg border border-white/20 p-4 bg-opacity-25 bg-gradient-to-br from-[#2e1d1d] to-[#101c3b] overflow-auto'>
            <div className="grid grid-cols-4 gap-4 font-quicksand text-center text-white uppercase text-lg">
                <p className="py-3">Rank</p>
                <p className="py-3">Team</p>
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
                            <p className="py-4">{team.name}</p>
                            <p className="py-4">{team.points}</p>
                            <p className="py-4 flex justify-center">
                                <FaChevronDown className={`transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`} />
                            </p>

                            {/* team details */}
                            {openIndex !== null && openIndex === index && (
                            <div className="col-span-4 w-full">
                                <ul className="grid grid-cols-1 lg:grid-cols-5 gap-2">
                                    {teams[openIndex].players.map((player, idx) => (
                                        <li key={idx} className="flex items-center px-4 py-2 border rounded-lg text-white border-tech-gold/50 hover:border-tech-gold border-b-4 overflow-auto">
                                            {player}
                                        </li>
                                    ))}
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

export default Team;
