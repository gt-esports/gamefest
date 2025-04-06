import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import SearchBar from './SearchBar';
import DropDownList from './DropDownList';

const Team = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const teams = [
    { player: "Player  A", points: 100 },
    { player: "Player B", points: 90 },
    { player: "Player C", points: 80 },
    { player: "Player D", points: 70 },
    { player: "Player E", points: 60 },
    { player: "Player F", points: 50 },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
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
      <div className="flex flex-row justify-between items-center">
        <SearchBar 
          onSearch={handleSearch}
          items={teams.map((teams) => teams.player)}
        />
      </div>
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
