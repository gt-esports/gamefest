import { useState } from 'react';
import { FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import tft from "../assets/game-covers/teamfight-tactics-cover.jpg";

const Team = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [c_index, setIndex] = useState(0);

  const schoolTeam = [
    {
      school: "School A",
      logo: tft,
      games: ["Fortnite", "Marvel Rival", "Overwatch", "Brawl Stars", "Minecraft"],
      teams: ["Aaaaaaaaaaaaaaa", "Bbbbbbb", "C", "D", "E"],
    },
    {
      school: "School B",
      logo: tft,
      games: ["1", "2"],
      teams: ["A", "B"],
    },
    {
      school: "School C",
      logo: tft,
      games: ["1", "2", "3", "4"],
      teams: ["A", "B", "C", "D"],
    },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % 3);
  };

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + 3) % 3);
  };

  return (
    <div className="mx-auto p-8 px-20">
      <div className="space-y-8">
        {schoolTeam.map((tab, index) => (
          <div
            key={index}
            className={`border border-gray-300 rounded-lg p-4 bg-transparent text-white ${
              openIndex === index ? 'bg-opacity-80' : 'bg-opacity-60'
            } transition-all duration-200 ease-in-out`}
          >
            <button
              onClick={() => handleToggle(index)}
              className="w-full flex justify-between items-center text-left font-semibold text-white hover:text-tech-gold focus:outline-none"
            >
              <span className="text-lg tracking-wider">{tab.school}</span>
              <FaChevronDown
                className={`transition-transform duration-200 ${
                  openIndex === index ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === index && (
              <div className="mt-4 flex flex-col items-center">
                <div className="hidden md:flex justify-between space-x-8 w-full">
                  
                  <div>
                    {/* School Logo here*/}
                    <img src={tft} className={`w-48 rounded-lg`} alt="" />
                  </div>

                  <div className="flex space-x-8 w-full">
                    
                    {/* Participating Games */}
                    <div className="w-full bg-purple-800 bg-opacity-40 rounded-lg flex flex-col text-white p-4">
                      <span className="font-bayon text-2xl text-center">
                        Participating Games
                      </span>
                      <div className="mt-4 w-full">
                        {tab.games.map((game, idx) => (
                          <div key={idx} className="items-center px-4 py-2 border rounded-lg mt-4 border-gray-300 text-center">
                            <span className="text-sm">{game}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Participating Teams */}
                    <div className="w-full bg-blue-500 bg-opacity-40 rounded-lg flex flex-col text-white p-4">
                      <span className="font-bayon text-2xl text-center">
                        Participating Teams
                      </span>
                      <div className="mt-4 w-full">
                        {tab.teams.map((team, idx) => (
                          <div key={idx} className="flex items-center px-4 py-2 border rounded-lg mt-4 border-gray=300">
                            <span className="text-sm flex-grow">{team}</span>
                            <button className="relative bg-tech-gold text-white text-xs px-2 py-1 rounded-md hover:bg-gray-600 ml-2">
                              View Team
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* One card carousel format */}
                <div className="flex flex-wrap">
                  <div className="flex md:hidden w-fit relative p-4">
                    <button onClick={handlePrev} className="relative -left-2 top-1/2 -translate-y-1/2">
                      <FaChevronLeft className="text-white text-xl hover:text-tech-gold" />
                    </button>

                  {c_index === 0 && (
                    <img src={tab.logo} alt={tab.school} className="h-48 w-36 rounded-lg bg-gray-400" />
                  )}
                  {c_index === 1 && (
                    <div className="text-center bg-purple-800 bg-opacity-50 rounded-lg flex flex-col px-8 py-4">
                      <span className="text-2xl font-bayon text-gray-200">Participating Games</span>
                      {tab.games.map((game, idx) => (
                        <div key={idx} className="py-2 border rounded-lg mt-4 p-4">{game}</div>
                      ))}
                    </div>
                  )}
                  {c_index === 2 && (
                    <div className="w-fit text-center bg-blue-500 bg-opacity-40 rounded-lg flex flex-col text-white px-8 py-4">
                      <span className="text-2xl font-bayon text-gray-200">Participating Teams</span>
                      {tab.teams.map((team, idx) => (
                        /* Add clickable team link */
                        <div key={idx} className="py-2 border rounded-lg mt-4 p-4">{team}</div>
                      ))}
                    </div>
                  )}

                  <button onClick={handleNext} className="relative -right-2 top-1/2 -translate-y-1/2">
                    <FaChevronRight className="text-white text-xl hover:text-tech-gold" />
                  </button>
                  </div>
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
