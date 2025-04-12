import MC from '../assets/game-icons/mc.png';
import FORTNITE from '../assets/game-icons/fortnite.png';
import CS from '../assets/game-icons/cs.png';
import RL from '../assets/game-icons/rl.png';
import R6S from '../assets/game-icons/r6s.png';
import OW2 from '../assets/game-icons/ow2.png';
import VAL from '../assets/game-icons/val2.png'
import RIVALS from '../assets/game-icons/rivals2.png';
import LOL from '../assets/game-icons/lol.png';
import APEX from '../assets/game-icons/apex.png';
import SMASH from '../assets/game-icons/smash.jpg';
import MARIOKART from '../assets/game-icons/mariokart.png';
import TFT from '../assets/game-icons/tft.png';
import OSU from '../assets/game-icons/osu.png';
import TETRIS from '../assets/game-icons/tetris.png';
import GEO from '../assets/game-icons/geoguessr.png';
import SUPERCELL from '../assets/game-icons/supercell.png';
import VGDEV from '../assets/game-icons/vgdev.png';

export default function Info() {
    return (
        <div className="flex flex-col pt-10 w-[90%] gap-12">
            {/* Overview */}
            <div className="items-start flex flex-col">
                <h3 className="text-3xl font-bayon tracking-wide text-tech-gold mb-4">
                    OVERVIEW
                </h3>
                <p className="pt-3 text-white font-quicksand text-lg text-left">
                    Founded in the early 2000's, GameFest has a long history as the first major Collegiate LAN in the Southeast.
                    GameFest unites collegiate gamers of all varieties and platforms to celebrate gaming together at the Georgia Institute of Technology in Atlanta, GA.
                    GameFest has been led over the years by various student groups on Georgia Tech's campus - many members from those groups have gone on to create or work for massive gaming and lifestyle festivals around the country.
                    After a short pause due to COVID and transitional phases in Georgia Tech's policies, GameFest is returning April 19th, 2025!
                    Unite with gamers from across the Southeast in this BYOC/Freeplay LAN event!
                </p>
            </div>

    
            {/* Event Format */}    
            <div className="items-start flex flex-col text-center">
                <h3 className="text-3xl font-bayon tracking-wide text-tech-gold mb-4">
                    EVENT FORMAT
                </h3>
                <p className="pt-3 text-white font-quicksand text-lg text-left">
                    Throughout the day, competitors will compete in different events in order to earn tokens.
                    At the end of the day, the tokens will be added up and the top competitiors will win prizes.
                </p>
                <div className='grid grid-cols-4 gap-2 w-full'>
                    <div className='col-span-4'>
                        <h3 className='text-4xl font-bayon tracking-wide m-8 text-white'>
                            4 GAME CATEGORIES
                        </h3>
                    </div>

                    <div className='col-span-2 lg:col-span-1'>
                        <div className='bg-gray-800/80 rounded-lg p-4 mb-4 text-2xl text-tech-gold'>
                            <h3 className='font-bayon'>HEADLINERS</h3>
                            <p className='text-sm'>Events for everyone to compete in</p>
                        </div>
                        <div className='flex flex-wrap justify-center'>
                            <img src={MC} className='h-[3rem] m-2 rounded-lg'/>
                            <img src={FORTNITE} className='h-[3rem] m-2 rounded-lg'/>
                        </div>
                    </div>
                    <div className='col-span-2 lg:col-span-1'>
                        <div className='bg-gray-800/80 rounded-lg p-4 mb-4 text-2xl text-tech-gold'>
                            <h3 className='font-bayon'>PC GAMES</h3>
                            <p className='text-sm'>Events split into Block A and Block B</p>
                        </div>
                        <div className='flex flex-wrap justify-center'>
                            <img src={CS} className='h-[3rem] m-2 rounded-lg'/>
                            <img src={OW2} className='h-[3rem] m-2 rounded-lg'/>
                            <img src={R6S} className='h-[3rem] m-2 rounded-lg'/>
                            <img src={RL} className='h-[3rem] m-2 rounded-lg'/>
                            <img src={VAL} className='h-[3rem] m-2 rounded-lg'/>
                            <img src={RIVALS} className='h-[3rem] m-2 rounded-lg'/>
                            <img src={LOL} className='h-[3rem] m-2 rounded-lg'/>
                            <img src={APEX} className='h-[3rem] m-2 rounded-lg'/>
                        </div>
                    </div>
                    <div className='col-span-2 lg:col-span-1'>
                        <div className='bg-gray-800/80 rounded-lg p-4 mb-4 text-2xl text-tech-gold'>
                            <h3 className='font-bayon'>CONSOLE GAMES</h3>
                            <p className='text-sm'>Tournaments running throughout the day</p>
                        </div>
                        <div className='flex flex-wrap justify-center'>
                            <img src={SMASH} className='h-[3rem] m-2 rounded-lg'/>
                            <img src={MARIOKART} className='h-[3rem] m-2 rounded-lg'/>
                        </div>
                    </div>
                    <div className='col-span-2 lg:col-span-1'>
                        <div className='bg-gray-800/80 rounded-lg p-4 mb-4 text-2xl text-tech-gold'>
                            <h3 className='font-bayon'>CHALLENGER</h3>
                            <p className='text-sm'>Booths running all day</p>
                        </div>
                        <div className='flex flex-wrap justify-center'>
                            <img src={TFT} className='h-[3rem] m-2 rounded-lg'/>
                            <img src={OSU} className='h-[3rem] m-2 rounded-lg'/>
                            <img src={TETRIS} className='h-[3rem] m-2 rounded-lg'/>
                            <img src={GEO} className='h-[3rem] m-2 rounded-lg'/>
                            <img src={SUPERCELL} className='h-[3rem] m-2 rounded-lg'/>
                            <img src={VGDEV} className='h-[3rem] m-2 rounded-lg'/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Details and Streams*/}
            <div className='flex flex-row justify-between'>
                <div className="items-start flex flex-col w-1/2">
                    <h3 className="text-3xl font-bayon tracking-wide text-tech-gold mb-4">
                        EVENT DETAILS
                    </h3>
                    <p className="text-white font-quicksand text-lg text-left">
                        <span className='font-bold'>DATE: </span>
                        April 19th, 2025
                    </p>
                    <p className="text-white font-quicksand text-lg text-left">
                        <span className='font-bold'>BYOC SETUP TIME: </span>
                        8:30AM - 9:30AM
                    </p>
                    <p className="text-white font-quicksand text-lg text-left">
                        <span className='font-bold'>GENERAL GAMEPLAY TIME: </span>
                        9:30AM - 7:30PM
                    </p>
                    <p className="text-white font-quicksand text-lg text-left">
                        <span className='font-bold'>LOCATION: </span>
                        Georgia Tech Instructional Center 
                        759 Ferst Dr, Atlanta, GA 30318
                    </p>
                </div>

                <div className="ml-20 items-start flex flex-col w-1/2">
                    <h3 className="text-3xl font-bayon tracking-wide text-tech-gold mb-4">
                        STREAMS
                    </h3>
                    <p className="text-white font-quicksand text-lg text-left">
                        <span className='font-bold'>MAIN STREAM: </span>
                        <a href='https://www.twitch.tv/esportsgatech' className='hover:underline'>https://www.twitch.tv/esportsgatech</a>
                    </p>
                    <p className="text-white font-quicksand text-lg text-left">
                        <span className='font-bold'>PC GAMES STREAM: </span>
                        <a href='https://www.twitch.tv/antonline' className='hover:underline'>https://www.twitch.tv/antonline</a>
                    </p>
                    <p className="text-white font-quicksand text-lg text-left">
                        <span className='font-bold'>CONSOLE GAMES STREAM: </span>
                        <a href='https://www.twitch.tv/gt_esports' className='hover:underline'>https://www.twitch.tv/gt_esports</a>
                    </p>
                </div>
            </div>
        </div>
    )
}