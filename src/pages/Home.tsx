import Carousel from "../components/Carousel";
import Footer from "../components/Footer";
import TournamentCard from "../components/TournamentCard";
import { sponsors } from "../data/sponsors";
import Avatar from "../components/Avatar";
import CS from '../assets/game-icons/cs.png'
import RL from '../assets/game-icons/rl.png'
import R6S from '../assets/game-icons/r6s.png'
import OW2 from '../assets/game-icons/ow2.png'
import VAL from '../assets/game-icons/val.png'
import RIVALS from '../assets/game-icons/rivals.png'
import LOL from '../assets/game-icons/lol.png'
import APEX from '../assets/game-icons/apex.png'

const tournaments = [
  {
    title: "Tournament 1",
  },
  {
    title: "Tournament 2",
  },
  {
    title: "Tournament 3",
  },
];

function Home() {
  const scrollToSection = (sectionId: string, offset: number = 0) => {
    const targetElement = document.getElementById(sectionId);
    if (!targetElement) return;

    const startPosition = window.scrollY;
    const targetPosition =
      targetElement.getBoundingClientRect().top + window.scrollY + offset;
    const distance = targetPosition - startPosition;
    const duration = 1500;
    let start: number | null = null;

    function animation(currentTime: number) {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);

      const easeInOutCubic = (progress: number) => {
        return progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      };

      window.scrollTo({
        top: startPosition + distance * easeInOutCubic(progress),
      });

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }

    requestAnimationFrame(animation);
  };

  return (
    <div className="flex w-full flex-col bg-streak bg-cover">
      <div className="flex min-h-screen items-center justify-center rounded-sm bg-home-1 bg-cover">
        <div className="flex flex-col items-center gap-4">
          <h1 className="px-3 py-3 font-bayon text-9xl font-normal text-tech-gold xs:rounded-lg xs:text-5xl xs:backdrop-blur-lg sm:text-7xl md:text-8xl lg:text-9xl">
            G<span className="text-white">eorgi</span>a Tech{" "}
            <span className="text-white">Esports</span>
          </h1>
          <button
            onClick={() => scrollToSection("tournaments-section", -80)}
            className="mt-8 rounded-md bg-tech-gold px-4 py-2 font-bayon text-2xl text-white hover:bg-tech-gold/90 sm:mt-12 sm:px-6 sm:py-3 sm:text-4xl"
          >
            ENTER NOW
          </button>
        </div>
      </div>
      <div
        id="tournaments-section"
        className="mt-24 flex w-full flex-col items-center justify-center"
      >
        <div className="flex flex-row items-center justify-center pb-4 pt-24">
          <h2
            style={{ fontFamily: "Bayon, sans-serif" }}
            className="font-bayon text-5xl font-normal text-white text-center"
          >
            TOURNAMENT SCHEDULE
          </h2>
        </div>

        <div className='grid grid-cols-4 gap-2 w-4/5'>
          <div className='col-span-4 lg:col-span-1 mb-12'>
            <div className='bg-gray-800/80 rounded-lg pt-4 my-4 text-2xl h-full'>
              <h3 className='font-bayon text-tech-gold text-center'>HEADLINER</h3>
            </div>
            <p className='text-white text-lg text-center'>9:30AM - 10:00AM</p>
          </div>
          <div className='col-span-4 lg:col-span-1 mb-12'>
            <div className='bg-gray-800/80 rounded-lg pt-4 my-4 text-2xl h-full'>
              <h3 className='font-bayon text-tech-gold text-center'>PC BLOCK 1</h3>
              <div className='flex flex-col items-center mt-6'>
                <img src={CS} className='w-[6rem] my-2'/>
                <img src={RL} className='w-[6rem] my-2'/>
                <img src={R6S} className='w-[6rem] my-2'/>
                <img src={OW2} className='w-[6rem] my-2'/>
              </div>
            </div>
                <p className='text-white text-lg text-center'>10:00AM - 2:30PM</p>
          </div>
          <div className='col-span-4 lg:col-span-1 mb-12'>
            <div className='bg-gray-800/80 rounded-lg pt-4 my-4 text-2xl h-full'>
              <h3 className='font-bayon text-tech-gold text-center'>HEADLINER</h3>
            </div>
              <p className='text-white text-lg text-center'>2:30PM - 3:00PM</p>
          </div>
          <div className='col-span-4 lg:col-span-1 mb-12'>
              <div className='bg-gray-800/80 rounded-lg pt-4 my-4 text-2xl h-full'>
                <h3 className='font-bayon text-tech-gold text-center'>PC BLOCK 2</h3>
                <div className='flex flex-col items-center mt-6'>
                  <img src={VAL} className='w-[6rem] my-2'/>
                  <img src={RIVALS} className='w-[6rem] my-2'/>
                  <img src={LOL} className='w-[6rem] my-2'/>
                  <img src={APEX} className='w-[6rem] my-2'/>
                </div>
              </div>
              <p className='text-white text-lg text-center'>3:00PM - 7:30PM</p>
          </div>
        </div>
        <button
          onClick={() => scrollToSection("games-section", -80)}
          className="my-8 flex h-8 w-8 items-center justify-center rounded-full bg-tech-gold hover:bg-tech-gold/90 sm:mb-12 sm:h-10 sm:w-10"
          aria-label="Scroll to games section"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="rotate-90 transform text-white"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div
        id="games-section"
        className="mt-24 flex min-h-screen snap-start flex-col items-center justify-center"
      >
        <h2 className="flex pt-8 text-center font-bayon text-5xl font-normal tracking-wide text-white">
          CURRENT GAMES
        </h2>
        <div className="flex w-3/4 max-w-screen-xl flex-col items-center pb-16">
          <Carousel />
          <button
            onClick={() => scrollToSection("sponsors-section", -80)}
            className="mb-8 flex h-8 w-8 items-center justify-center rounded-full bg-tech-gold hover:bg-tech-gold/90 sm:mb-12 sm:h-10 sm:w-10"
            aria-label="Scroll to sponsors section"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="rotate-90 transform text-white"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <div id="sponsors-section">
        <div className="flex flex-col items-center justify-center p-16">
          <h2 className="text-center font-bayon text-5xl font-normal text-white">
            A MESSAGE FROM OUR SPONSORS
          </h2>
          <p className="m-8 pt-12 text-center font-bayon text-2xl text-[#b3a369]">
            "Fueling the next generation of gamers. Play hard, compete harder.
            Proud sponsors of Georgia Tech Esports" - antonline
          </p>
        </div>

        {/* Sponsor Carousel with Fading Edges */}
        <div className="sponsor-carousel-container">
          <div className="flex w-max animate-scroll-sponsors">
            {[...sponsors, ...sponsors].map((sponsor, index) => (
              <div key={index} className="mx-8">
                <a
                  href={sponsor.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={sponsor.src}
                    alt={sponsor.alt}
                    className="h-32 w-32 object-contain"
                  />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;
