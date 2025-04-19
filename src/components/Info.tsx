import MC from "../assets/game-icons/mc.png";
import FORTNITE from "../assets/game-icons/fortnite.png";
import CS from "../assets/game-icons/cs.png";
import RL from "../assets/game-icons/rl.png";
import R6S from "../assets/game-icons/r6s.png";
import OW2 from "../assets/game-icons/ow2.png";
import VAL from "../assets/game-icons/val2.png";
import RIVALS from "../assets/game-icons/rivals2.png";
import LOL from "../assets/game-icons/lol.png";
import APEX from "../assets/game-icons/apex.png";
import SMASH from "../assets/game-icons/smash.jpg";
import MARIOKART from "../assets/game-icons/mariokart.png";
import TFT from "../assets/game-icons/tft.png";
import OSU from "../assets/game-icons/osu.png";
import TETRIS from "../assets/game-icons/tetris.png";
import GEO from "../assets/game-icons/geoguessr.png";
import SUPERCELL from "../assets/game-icons/supercell.png";
import VGDEV from "../assets/game-icons/vgdev.png";
import MAP from "../assets/map.png";

export default function Info() {
    return (
        <div className="flex flex-col pt-10 w-[90%] gap-12">
            <div className='flex  flex-col lg:flex-row lg:space-x-8'>
                {/* Overview */}
                <div className="items-start flex flex-col lg:w-1/2">
                    <h3 className="text-3xl font-bayon tracking-wide text-tech-gold my-4">
                        OVERVIEW
                    </h3>
                    <p className="pt-3 text-white font-quicksand text-lg text-left">
                    GameFest is the Southeast's original collegiate LAN, uniting gamers at Georgia Tech since the early 2000s. 
                    After a COVID pause, it's back on April 19, 2025. Join players from across the region for a BYOC/Freeplay LAN you won't want to miss!
                    </p>
                </div>
                <div className="items-start flex flex-col lg:w-1/2">
                    <h3 className="text-3xl font-bayon tracking-wide text-tech-gold my-4">
                            EVENT FORMAT
                    </h3>
                    <p className="pt-3 text-white font-quicksand text-lg text-left">
                        Throughout the day, competitors will compete in different events in order to earn tokens.
                        At the end of the day, the tokens will be added up and the top competitiors will win prizes.
                    </p>
                </div>
            </div>

    
            {/* Event Format */}    
            <div className="items-start flex flex-col text-center">
                
                <div className='grid grid-cols-4 gap-2 w-full'>
                    <div className='col-span-4'>
                        <h3 className='text-4xl font-bayon tracking-wide m-8 text-white'>
                            4 GAME CATEGORIES
                        </h3>
                    </div>
                  
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-4 rounded-lg bg-gray-800/80 p-4 text-2xl text-tech-gold">
              <h3 className="font-bayon">HEADLINERS</h3>
              <p className="text-sm">Events for everyone to compete in</p>
            </div>
            <div className="flex flex-wrap justify-center">
              <img src={MC} className="m-2 h-[3rem] rounded-lg" />
              <img src={FORTNITE} className="m-2 h-[3rem] rounded-lg" />
            </div>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-4 rounded-lg bg-gray-800/80 p-4 text-2xl text-tech-gold">
              <h3 className="font-bayon">PC GAMES</h3>
              <p className="text-sm">Events split into Block A and Block B</p>
            </div>
            <div className="flex flex-wrap justify-center">
              <img src={CS} className="m-2 h-[3rem] rounded-lg" />
              <img src={OW2} className="m-2 h-[3rem] rounded-lg" />
              <img src={R6S} className="m-2 h-[3rem] rounded-lg" />
              <img src={RL} className="m-2 h-[3rem] rounded-lg" />
              <img src={VAL} className="m-2 h-[3rem] rounded-lg" />
              <img src={RIVALS} className="m-2 h-[3rem] rounded-lg" />
              <img src={LOL} className="m-2 h-[3rem] rounded-lg" />
              <img src={APEX} className="m-2 h-[3rem] rounded-lg" />
            </div>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-4 rounded-lg bg-gray-800/80 p-4 text-2xl text-tech-gold">
              <h3 className="font-bayon">CONSOLE GAMES</h3>
              <p className="text-sm">Tournaments running throughout the day</p>
            </div>
            <div className="flex flex-wrap justify-center">
              <img src={SMASH} className="m-2 h-[3rem] rounded-lg" />
              <img src={MARIOKART} className="m-2 h-[3rem] rounded-lg" />
            </div>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-4 rounded-lg bg-gray-800/80 p-4 text-2xl text-tech-gold">
              <h3 className="font-bayon">CHALLENGER</h3>
              <p className="text-sm">Booths running all day</p>
            </div>
            <div className="flex flex-wrap justify-center">
              <img src={TFT} className="m-2 h-[3rem] rounded-lg" />
              <img src={OSU} className="m-2 h-[3rem] rounded-lg" />
              <img src={TETRIS} className="m-2 h-[3rem] rounded-lg" />
              <img src={GEO} className="m-2 h-[3rem] rounded-lg" />
              <img src={SUPERCELL} className="m-2 h-[3rem] rounded-lg" />
              <img src={VGDEV} className="m-2 h-[3rem] rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Event Details and Streams*/}
      <div className="align-center flex flex-col justify-between px-8 py-8 lg:flex-row lg:space-x-8 ">
        <img
          src={MAP}
          className="mb-8 ml-28 w-full rounded-lg pl-20 lg:w-1/3"
        />

        <div className="m-4 flex flex-col items-start pl-20 lg:w-1/2">
          <h3 className="mb-4 font-bayon text-3xl tracking-wide text-tech-gold">
            EVENT DETAILS
          </h3>
          <p className="text-left font-quicksand text-lg text-white">
            <span className="font-bold">DATE: </span>
            April 19th, 2025
          </p>
          <p className="text-left font-quicksand text-lg text-white">
            <span className="font-bold">BYOC SETUP TIME: </span>
            8:30AM - 9:30AM
          </p>
          <p className="text-left font-quicksand text-lg text-white">
            <span className="font-bold">GENERAL GAMEPLAY TIME: </span>
            9:30AM - 7:30PM
          </p>
          <p className="text-left font-quicksand text-lg text-white">
            <span className="font-bold">LOCATION: </span>
            Georgia Tech Instructional Center 759 Ferst Dr, Atlanta, GA 30318
          </p>
          <p className="text-left font-quicksand text-lg text-white">
            <span className="font-bold">DISCORD: </span>
            <a
              href="https://discord.com/invite/trg88CR6Q3"
              className="hover:underline"
            >
              https://discord.com/invite/trg88CR6Q3
            </a>
          </p>
          <p className="text-left font-quicksand text-lg text-white">
            <span className="font-bold">START.GG: </span>
            <a
              href="https://www.start.gg/tournament/gamefest-2025-1/details"
              className="hover:underline"
            >
              https://www.start.gg/tournament/gamefest-2025-1/details
            </a>
          </p>

          <h3 className="my-4 pt-8 font-bayon text-3xl tracking-wide text-tech-gold">
            STREAMS
          </h3>
          <p className="text-left font-quicksand text-lg text-white">
            <span className="font-bold">MAIN STREAM: </span>
            <a
              href="https://www.twitch.tv/esportsgatech"
              className="hover:underline"
            >
              https://www.twitch.tv/esportsgatech
            </a>
          </p>
          <p className="text-left font-quicksand text-lg text-white">
            <span className="font-bold">PC GAMES STREAM: </span>
            <a
              href="https://www.twitch.tv/antonline"
              className="hover:underline"
            >
              https://www.twitch.tv/antonline
            </a>
          </p>
          <p className="text-left font-quicksand text-lg text-white">
            <span className="font-bold">CONSOLE GAMES STREAM: </span>
            <a
              href="https://www.twitch.tv/gt_esports"
              className="hover:underline"
            >
              https://www.twitch.tv/gt_esports
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
