import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import SearchBar from './SearchBar';
import DropDownList from './DropDownList';

const Team = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedGame, setSelectedGame] = useState<string>("");

  const teams = [
    {
      name: "Team A",
      players: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'],
      points: 100,
      game: "Game A",
    },
    {
      name: "Team B",
      players: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'],
      points: 90,
      game: "Game A",
    },
    {
      name: "Team C",
      players: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'],
      points: 80,
      game: "Game A",
    },
    {
      name: "Team D",
      players: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'],
      points: 70,
      game: "Game B",
    },
    {
      name: "Team E",
      players: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'],
      points: 60,
      game: "Game B",
    },
    {
      name: "Team F",
      players: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'],
      points: 50,
      game: "Game B",
    },
  ];

  const games = [
    "Select a game",
    "Game A",
    "Game B",
    "Game C",
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleTeamSearch = (teamName: string) => {
    const trimmedName = teamName.trim().toLowerCase();
    const index = teams.findIndex((t) => t.name.trim().toLowerCase() === trimmedName);

    if (index !== -1) {
      setOpenIndex(index);

      setTimeout(() => {
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

  const handleGameSelect = (gameName: string) => {
    setSelectedGame(gameName);
    setOpenIndex(null);
  };

  const filteredTeams = selectedGame && selectedGame !== "Select a game"
    ? teams.filter((team) => team.game.toLowerCase() === selectedGame.toLowerCase())
    : teams;

  return (
    <div className="mx-auto p-8 px-10 lg:px-20">
      <div className="flex flex-col lg:flex-row justify-between items-center">
        <SearchBar 
          onSearch={handleTeamSearch}
          items={teams.map((team) => team.name)}
        />
        <DropDownList 
          items={games}
          onSelect={handleGameSelect}
        />
      </div>
      <div className="space-y-4">
        {filteredTeams.map((tab, index) => (
          <div
            key={index}
            id={tab.name.replace(/\s+/g, "-").toLowerCase()}
            className={`rounded-lg border border-white/20 p-4 bg-opacity-25 bg-gradient-to-br ${
              openIndex === index ? 'from-[#2e1d1d] to-[#101c3b]' : 'from-[#241717] to-[#101c3b]'
            } transition-all duration-200 ease-in-out`}
          >
            <button
              onClick={() => handleToggle(index)}
              className="w-full flex justify-between items-center text-left font-semibold text-white hover:text-tech-gold focus:outline-none"
            >
              <span className="text-lg tracking-wider">{tab.name}</span>
              <FaChevronDown
                className={`transition-transform duration-200 ${ openIndex === index ? 'transform rotate-180' : '' }`}
              />
            </button>
            {openIndex === index && (
              <div className="mt-4 flex flex-col items-center">
                <div className="hidden lg:flex justify-between items-start space-x-8 w-full">
                  <div className="flex flex-col">
                    <h1 className='font-bayon text-9xl'>{tab.points}</h1>
                    <span className='font-quicksand text-xl'>points</span>
                  </div>
                  {/* Player Roster */}
                  <div className="w-full max-h-screen overflow-y-auto">
                    {tab.players.map((player, idx) => (
                      <div key={idx} className="flex items-start justify-between px-4 py-2 border rounded-lg mb-2 border-tech-gold/50 hover:border-tech-gold border-b-4 text-center">
                        <span className="text-lg font-bold">{player}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Mobile view */}
                <div className="lg:hidden flex flex-col overflow-y-auto w-full px-1">
                  <h1 className='font-bayon text-9xl'>{tab.points}<span className='font-quicksand text-lg'>pts</span></h1>
                  {tab.players.map((player, idx) => (
                    <div key={idx} className="flex items-start justify-between px-4 py-2 border rounded-lg mb-2 border-tech-gold/50 hover:border-tech-gold border-b-4 text-center">
                      <span className="text-lg font-bold">{player}</span>
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
