import Footer from "../components/Footer";
import PastWinners from "../components/PastWinners";
import GameFestTitle from "../assets/GameFestTitle.png";
import iconRL from "../assets/game-icons/rl.png";
import iconRivals from "../assets/game-icons/rivals.png";
import iconLoL from "../assets/game-icons/lol.png";
import iconR6 from "../assets/game-icons/r6s.png";
import iconApex from "../assets/game-icons/apex.png";
import iconOW2 from "../assets/game-icons/ow2.png";
import iconVal from "../assets/game-icons/val.png";
import iconCS from "../assets/game-icons/cs.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type GameEntry = { icon: string; name: string };

const PAST_GAMES: GameEntry[] = [
  { icon: iconRL,     name: "Rocket League" },
  { icon: iconRivals, name: "Marvel Rivals" },
  { icon: iconLoL,    name: "League of Legends" },
  { icon: iconCS,    name: "Counter-Strike 2" },
  { icon: iconR6,   name: "Rainbow Six Siege" },
  { icon: iconApex, name: "Apex Legends" },
  { icon: iconOW2,  name: "Overwatch 2" },
  { icon: iconVal,  name: "Valorant" },
];

function PastGamesCarousel() {
  const carouselGames = [...PAST_GAMES, ...PAST_GAMES];

  return (
    <div className="game-carousel-container w-full" aria-label="Past games featured at GameFest">
      <div className="animate-scroll-games w-max">
        {carouselGames.map((game, index) => (
          <div
            key={`${game.name}-${index}`}
            className="mx-3 flex w-40 flex-shrink-0 flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-5 sm:w-48"
            aria-hidden={index >= PAST_GAMES.length}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-black/30 ring-1 ring-[#00D4FF]/20">
              <img src={game.icon} alt={index < PAST_GAMES.length ? game.name : ""} className="h-14 w-14 object-contain" />
            </div>
            <span className="text-center font-quicksand text-sm font-semibold text-white">
              {game.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const { isLoaded, user, signInWithDiscord } = useAuth();
  console.log('home:', { isLoaded, user });

  const handleRegister = () => {
    if (user) {
      void navigate('/profile');
    } else {
      void signInWithDiscord();
    }
  };

  return (
    <div className="flex w-full flex-col bg-streak bg-cover">
      <div className="relative flex min-h-screen items-center justify-center rounded-sm bg-home-1 bg-cover">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative flex flex-col items-center gap-4">
          <img
            src={GameFestTitle}
            alt="GameFest 2027"
            className="w-[90vw] max-w-5xl drop-shadow-2xl"
          />
          <button
            onClick={handleRegister}
            className="mt-8 rounded-md bg-gradient-to-r from-[#004466] to-[#0099BB] px-8 py-4 font-bayon text-4xl text-white hover:shadow-lg hover:shadow-[#0099BB]/50 sm:mt-12 sm:px-12 sm:py-5 sm:text-6xl"
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
        <div className="mb-10 w-11/12 max-w-3xl overflow-hidden rounded-2xl border border-[#00D4FF]/30 bg-gradient-to-br from-[#004466]/40 to-black/30 px-8 py-10 text-center shadow-lg shadow-[#0099BB]/10">
          <p className="font-quicksand text-xs uppercase tracking-[0.35em] text-[#7dd3f0]">GameFest 2027</p>
          <p className="mt-3 font-bayon text-6xl tracking-wider text-white sm:text-8xl">TBA</p>
          <p className="mt-2 font-quicksand text-sm text-gray-300">Dates, games, and bracket times are still loading.</p>
        </div>

        <div className="mt-10 flex w-full flex-col items-center">
          <h3 className="font-bayon text-3xl tracking-wide text-white">PAST GAMES FEATURED</h3>
          <p className="mb-6 mt-1 px-6 text-center font-quicksand text-sm text-gray-400">
            A look at games from previous GameFest lineups—not the confirmed 2027 roster.
          </p>
          <PastGamesCarousel />
        </div>
        <div className="mt-6 flex w-11/12 max-w-5xl items-center justify-between gap-6 rounded-2xl border border-[#0099BB]/30 bg-[#0099BB]/10 px-8 py-6">
          <div>
            <p className="font-bayon text-2xl text-white">Brackets are powering up</p>
            <p className="mt-1 font-quicksand text-gray-300">
              Tournament registration details will be announced with the full schedule.
            </p>
          </div>
          <span
            className="flex-shrink-0 rounded-lg border border-[#00D4FF]/30 bg-black/20 px-6 py-3 font-bayon text-xl tracking-wider text-[#7dd3f0]"
          >
            DETAILS TBA
          </span>
        </div>
      </div>
      <PastWinners />
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
