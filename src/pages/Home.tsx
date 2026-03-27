import Carousel from "../components/Carousel";
import Footer from "../components/Footer";
import { sponsors } from "../data/sponsors";
import MCHEADLINER from "../assets/mc-headliner.jpg";
import FORTNITEHEADLINER from "../assets/fortnite-headliner.jpg";
import PCBLOCK1 from "../assets/pc_block_1.jpg";
import PCBLOCK2 from "../assets/pc_block_2.jpg";
import GameFestTitle from "../assets/GameFestTitle.png";
import iconRL from "../assets/game-icons/rl.png";
import iconRivals from "../assets/game-icons/rivals.png";
import iconLoL from "../assets/game-icons/lol.png";
import iconR6 from "../assets/game-icons/r6s.png";
import iconApex from "../assets/game-icons/apex.png";
import iconOW2 from "../assets/game-icons/ow2.png";
import iconVal from "../assets/game-icons/val.png";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useAuth";

type GameEntry = { icon: string; name: string };

const SAT_GAMES: GameEntry[] = [
  { icon: iconRL,     name: "Rocket League" },
  { icon: iconRivals, name: "Marvel Rivals" },
  { icon: iconLoL,    name: "League of Legends" },
];

const SUN_GAMES: GameEntry[] = [
  { icon: iconR6,   name: "Rainbow Six Siege" },
  { icon: iconApex, name: "Apex Legends" },
  { icon: iconOW2,  name: "Overwatch 2" },
  { icon: iconVal,  name: "Valorant" },
];

function DayCard({ day, date, games }: { day: string; date: string; games: GameEntry[] }) {
  return (
    <div className="flex flex-1 flex-col rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-5 border-b border-white/10 pb-4">
        <p className="font-bayon text-3xl text-[#00D4FF]">{day}</p>
        <p className="font-bayon text-lg text-gray-400">{date}</p>
      </div>
      <div className="flex flex-col gap-3">
        {games.map((g) => (
          <div key={g.name} className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
              <img src={g.icon} alt={g.name} className="h-7 w-7 object-contain" />
            </div>
            <span className="font-quicksand text-white">{g.name}</span>
          </div>
        ))}
        <p className="mt-1 font-quicksand text-sm text-gray-500">+ more</p>
      </div>
    </div>
  );
}

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

  const navigate = useNavigate();
  const { isLoaded, user } = useUser();
  console.log('home:', { isLoaded, user });

  return (
    <div className="flex w-full flex-col bg-streak bg-cover">
      <div className="relative flex min-h-screen items-center justify-center rounded-sm bg-home-1 bg-cover">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative flex flex-col items-center gap-4">
          <img
            src={GameFestTitle}
            alt="GameFest 2026"
            className="w-[90vw] max-w-5xl drop-shadow-2xl"
          />
          <button
            onClick={() => navigate("/register")}
            className="mt-8 rounded-md bg-gradient-to-r from-[#004466] to-[#0099BB] px-4 py-2 font-bayon text-2xl text-white hover:shadow-lg hover:shadow-[#0099BB]/50 sm:mt-12 sm:px-6 sm:py-3 sm:text-4xl"
          >
            REGISTER NOW
          </button>
        </div>
      </div>
      <div
        id="tournaments-section"
        className="mt-24 flex w-full flex-col items-center justify-center"
      >
        <div className="flex flex-row items-center justify-center pb-4 pt-24">
          <h2 className="text-center font-bayon text-5xl font-normal text-white">
            TOURNAMENT SCHEDULE
          </h2>
        </div>
        <div className="flex w-11/12 max-w-5xl flex-col gap-6 pb-4 sm:flex-row">
          <DayCard day="SATURDAY" date="APR 25" games={SAT_GAMES} />
          <DayCard day="SUNDAY"   date="APR 26" games={SUN_GAMES} />
        </div>
        <p className="pb-2 font-quicksand text-sm text-gray-500">Specific timings will be updated here soon.</p>
        <div className="mt-6 flex w-11/12 max-w-5xl items-center justify-between gap-6 rounded-2xl border border-[#0099BB]/30 bg-[#0099BB]/10 px-8 py-6">
          <div>
            <p className="font-bayon text-2xl text-white">Ready to compete?</p>
            <p className="mt-1 font-quicksand text-gray-300">
              Sign up for individual tournaments on our start.gg page to secure your spot in the brackets.
            </p>
          </div>
          <a
            href="https://www.start.gg/tournament/gamefest-2026/details"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 rounded-lg bg-gradient-to-r from-[#004466] to-[#0099BB] px-6 py-3 font-bayon text-xl text-white hover:shadow-lg hover:shadow-[#0099BB]/50"
          >
            SIGN UP ON START.GG
          </a>
        </div>
      </div>
      {/* <div id="sponsors-section">
        <div className="flex flex-col items-center justify-center p-16">
          <h2 className="text-center font-bayon text-5xl font-normal text-white">
            A MESSAGE FROM OUR SPONSORS
          </h2>
          <p className="m-8 pt-12 text-center font-bayon text-2xl text-blue-accent">
            TODO - Do we need this?
          </p>
        </div>

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
      </div> */}

      <Footer />
    </div>
  );
}

export default Home;
