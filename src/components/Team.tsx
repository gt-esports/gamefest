import { useRef, useState } from 'react';
import { FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import tft from "../assets/game-covers/teamfight-tactics-cover.jpg";
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import SearchBar from './SearchBar';
import DropDownList from './DropDownList';

const Team = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const leaderboard = [
    {
      game: " Counter Strike",
      image: tft,
      teams: [
        {
          name: "Team A",
          points: 100,
        },
        {
          name: "Team B",
          points: 90,
        },
        {
          name: "Team C",
          points: 80,
        },
      ],
    },
    {
      game: "League of Legends",
      image: tft,
      teams: [
        {
          name: "Team A",
          points: 100,
        },
        {
          name: "Team B",
          points: 90,
        },
        {
          name: "Team C",
          points: 80,
        },
      ],
    },
    {
      game: "Valorant",
      image: tft,
      teams: [
        {
          name: "Team A",
          points: 100,
        },
        {
          name: "Team B",
          points: 90,
        },
        {
          name: "Team C",
          points: 80,
        },
      ],
    },
    {
      game: "Dota 2",
      image: tft,
      teams: [
        {
          name: "Team A",
          points: 100,
        },
        {
          name: "Team B",
          points: 90,
        },
        {
          name: "Team C",
          points: 80,
        },
      ],
    },
    {
      game: "Fortnite",
      image: tft,
      teams: [
        {
          name: "Team A",
          points: 100,
        },
        {
          name: "Team B",
          points: 90,
        },
        {
          name: "Team C",
          points: 80,
        },
      ],
    },
    {
      game: "Overwatch",
      image: tft,
      teams: [
        {
          name: "Team A",
          points: 100,
        },
        {
          name: "Team B",
          points: 90,
        },
        {
          name: "Team C",
          points: 80,
        },
      ],
    },
    {
      game: "Brawl Stars",
      image: tft,
      teams: [
        {
          name: "Team A",
          points: 100,
        },
        {
          name: "Team B",
          points: 90,
        },
        {
          name: "Team C",
          points: 80,
        },
        {
          name: "Team D",
          points: 70,
        },
        {
          name: "Team E",
          points: 60,
        },
        {
          name: "Team F",
          points: 50,
        },
        {
          name: "Team G",
          points: 40,
        },
        {
          name: "Team H",
          points: 30,
        },
        {
          name: "Team I",
          points: 20,
        },
        {
          name: "Team J",
          points: 10,
        },
      ],
    },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  const handleSearch = (gameName: string) => {
    const trimmedGameName = gameName.trim().toLowerCase();
    const index = leaderboard.findIndex((l) => l.game.trim().toLowerCase() === trimmedGameName);
    
    if (index !== -1) {
      setOpenIndex(index); // expand game tab when found

      setTimeout(() => { // timer delay to make scrollTo time to position correctly
        const id = leaderboard[index].game.trim().replace(/\s+/g, "-").toLowerCase();
        const leaderBoardElement = document.getElementById(id);
  
        if (leaderBoardElement) {
          const y = -70;
          const pos = leaderBoardElement.getBoundingClientRect().top + window.scrollY;
  
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
        />
        <DropDownList 
          items={leaderboard.map((leaderboard) => leaderboard.game)}
          onSelect={handleSearch}
        />
      </div>
      <div className="space-y-4">
        {leaderboard.map((tab, index) => (
          <div
            key={index}
            id={tab.game.replace(/\s+/g, "-").toLowerCase()}
            className={`rounded-lg border border-white/20 p-4 bg-opacity-25 bg-gradient-to-br ${
              openIndex === index ? 'from-[#2e1d1d] to-[#101c3b]' : 'from-[#241717] to-[#101c3b]'
            } transition-all duration-200 ease-in-out`}
          >
            <button
              onClick={() => handleToggle(index)}
              className="w-full flex justify-between items-center text-left font-semibold text-white hover:text-tech-gold focus:outline-none"
            >
              <span className="text-lg tracking-wider">{tab.game}</span>
              <FaChevronDown
                className={`transition-transform duration-200 ${
                  openIndex === index ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === index && (
              <div className="mt-4 flex flex-col items-center">
                <div className="hidden lg:flex justify-between space-x-8 w-full">
                  
                  <div>
                    <img src={tft} className={`w-48 rounded-lg`} alt="" />
                  </div>

                  {/* Leaderboard */}
                  <div className="w-full max-h-screen overflow-y-auto">
                      {tab.teams.map((team, idx) => (
                        <div key={idx} className="flex items-start justify-between px-4 py-2 border rounded-lg mb-2 border-tech-gold/50 border-b-4 text-center">
                        <span className="text-lg font-bold">{team.name}</span>
                        <span className="text-lg">{team.points}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* One card carousel format */}
                <Swiper
                    modules={[Pagination]}
                    pagination={{ 
                      clickable: true,
                      type: "bullets",
                    }}
                    spaceBetween={50}
                    slidesPerView={1}
                    className="w-full max-w-[400px] h-screen max-h-[400px] flex flex-col lg:hidden justify-center items-center py-6"
                  >
                    <SwiperSlide className="flex justify-center items-center transition-transform duration-1000 ease-in-out">
                      <img src={tab.image} alt="Leaderboard" className="w-auto h-auto max-w-[400px] max-h-[300px] rounded-lg" />
                    </SwiperSlide>
                    <SwiperSlide className='transition-transform duration-1000 ease-in-out'>
                      <div className="w-full max-h-screen overflow-y-auto">
                        {tab.teams.map((team, idx) => (
                          <div key={idx} className="flex items-start justify-between px-4 py-2 border rounded-lg mb-4 border-tech-gold/50 border-b-4 text-center">
                          <span className="text-lg font-bold">{team.name}</span>
                          <span className="text-lg">{team.points}</span>
                          </div>
                        ))}
                      </div>
                    </SwiperSlide>
                  </Swiper>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;
