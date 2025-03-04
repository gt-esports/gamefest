import { useState } from 'react';
import { FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import tft from "../assets/game-covers/teamfight-tactics-cover.jpg";
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, EffectCoverflow, Navigation, Pagination } from 'swiper/modules';

const Team = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [c_index, setIndex] = useState(0);

  const schoolTeam = [
    {
      school: "School A",
      logo: tft,
      games: ["Fortnite", "Marvel Rival", "Overwatch", "Brawl Stars", "Mineeeeeeeeeeeeeeeeecraft", "Minecraft", "Minecraft", "Minecraft"],
      teams: ["Aaaaaaaaaaaaaaaaaaaaaa", "Bbbbbbb", "C", "D", "E"],
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

  return (
    <div className="mx-auto p-8 px-20">
      <div className="space-y-8">
        {schoolTeam.map((tab, index) => (
          <div
            key={index}
            className={`rounded-lg border border-white/20 p-4 bg-opacity-25 bg-gradient-to-br ${
              openIndex === index ? 'from-[#2e1d1d] to-[#101c3b]' : 'from-[#241717] to-[#101c3b]'
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
                <div className="hidden lg:flex justify-between space-x-8 w-full">
                  
                  <div>
                    {/* School Logo here*/}
                    <img src={tft} className={`w-48 rounded-lg`} alt="" />
                  </div>

                  <div className="flex space-x-8 w-full">
                    
                    {/* Participating Games */}
                    <div className="w-full max-h-[400px] bg-gradient-to-br from-[#101010]/80 to-[#472b2b]/80 rounded-lg flex flex-col text-white p-4">
                      <span className="font-bayon text-2xl text-center">
                        Participating Games
                      </span>
                      <div className="w-full max-h-screen overflow-y-auto mt-4 p-4">
                        {tab.games.map((game, idx) => (
                          <div key={idx} className="items-center px-4 py-2 border rounded-lg mt-4 border-tech-gold/50 border-b-4 text-center">
                            <span className="text-lg font-bold">{game}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Participating Teams */}
                    <div className="w-full max-h-[400px] bg-gradient-to-tl from-[#101010] to-[#233a6d] rounded-lg flex flex-col text-white p-4">
                      <span className="font-bayon text-2xl text-center">
                        Participating Teams
                      </span>
                      <div className="w-full max-h-[400px] overflow-y-auto mt-4 p-4">
                        {tab.teams.map((team, idx) => (
                          <div key={idx} className="flex items-center px-4 py-2 border rounded-lg mt-4 border-tech-gold/50 border-b-4 truncate">
                            <span className="font-bold text-lg w-full">{team}</span>
                            <a href="/matches">
                              <button className="relative font-bayon bg-gradient-to-br from-tech-gold to-tech-gold/30 text-gray-200 
                                                text-sm px-2 py-1 rounded-md hover:from-tech-gold/40 ml-2">
                                View Team
                              </button>
                            </a>

                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* One card carousel format */}
                <Swiper
                    modules={[Pagination, Navigation]}
                    pagination={{ 
                      clickable: true,
                      type: "bullets",
                    }}
                    navigation
                    spaceBetween={50}
                    slidesPerView={1}
                    loop={true}
                    className="w-full max-w-[400px] h-screen max-h-[400px] flex flex-col lg:hidden justify-center items-center pb-2"
                  >
                    <SwiperSlide className="flex justify-center items-center transition-transform duration-1000 ease-in-out">
                      <img src={tab.logo} alt={tab.school} className="w-auto h-auto max-w-[400px] max-h-[300px] rounded-lg" />
                    </SwiperSlide>
                    <SwiperSlide className='transition-transform duration-1000 ease-in-out'>
                    <div className="w-full h-full text-center bg-gradient-to-br from-[#101010]/80 to-[#472b2b]/80 rounded-lg flex flex-col px-14 py-4 my-2">
                      <span className="mt-4 text-2xl font-bayon text-gray-200">Participating Games</span>
                      <div className="w-full h-screen overflow-y-auto mt-4 p-4">
                        {tab.games.map((game, idx) => (
                          <div key={idx} className="flex flex-wrap overflow-hidden text-center items-center justify-center py-2 
                          border border-tech-gold/50 border-b-4 rounded-lg mt-4 p-4">{game}</div>
                        ))}
                      </div>
                    </div>

                    </SwiperSlide>
                    <SwiperSlide className='transition-transform duration-1000 ease-in-out'>
                      <div className="w-full h-full text-center bg-gradient-to-br from-[#233a6d] to-[#101010] 
                      rounded-lg flex flex-col text-white px-14 py-4 my-2">
                        <span className="mt-4 text-2xl font-bayon text-gray-200">Participating Teams</span>
                        <div className="w-full h-screen overflow-y-auto overflow-x-hidden mt-4 p-4">
                        {tab.teams.map((team, idx) => (
                          <a href={`/matches`} key={idx}>
                            <div className="flex flex-wrap overflow-hidden text-center items-center justify-center py-2
                             border border-tech-gold/50 border-b-4 rounded-lg mt-4 p-4 hover:border-tech-gold">{team}</div>
                          </a>
                        ))}
                        </div>
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
