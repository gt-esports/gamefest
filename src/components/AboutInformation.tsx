import logoImage from "../assets/gtesportsimage.png";
import FAQ from "./FAQ";
import Form from "./Form";

function AboutInformation() {
  return (
    <div className="flex w-[90%] flex-col items-center gap-12 pt-10">
      {/* GameFest Intro */}
      <div className="flex w-full flex-col items-center gap-8 lg:flex-row">
        {/* Text Section */}
        <div className="ml-20 flex flex-1 flex-col items-start">
          <h3 className="mb-4 font-bayon text-3xl tracking-wide text-blue-bright">
            WHAT IS GAMEFEST 2026?
          </h3>
          <p className="max-w-2xl pt-3 font-quicksand text-lg text-white">
            <strong>GameFest returns April 25th and 26th at the Campus Recreation Center!</strong>{" "}
            Georgia Tech's biggest in-person gaming event is almost here—two full days of
            brackets, LAN play, and competition. Don't forget to register for individual
            events on our{" "}
            <a
              href="https://www.start.gg/tournament/gamefest-2026/details"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0099BB] underline hover:text-white"
            >
              start.gg page
            </a>
            .
          </p>
          <ul className="mt-4 space-y-3 font-quicksand text-white">
            <li>
              🗓️ <strong>Saturday 4/25:</strong> Rocket League, Marvel Rivals, League of Legends, and more
            </li>
            <li>
              🗓️ <strong>Sunday 4/26:</strong> Rainbow Six Siege, Apex Legends, Overwatch, Valorant, and more
            </li>
            <li>
              🏆 <strong>Grand prizing</strong> reveal coming soon—stay tuned to find out how <strong>you</strong> can win big!
            </li>
          </ul>
        </div>

        {/* Image Section */}
        <div className="flex-shrink-0 rounded-lg">
          <img
            src={logoImage}
            alt="Holding Image"
            className="max-w-md rounded-lg object-contain backdrop-blur-2xl"
          />
        </div>
      </div>

      {/* Our Mission */}
      <div className="flex w-full flex-row items-start">
        <div className="ml-20 flex-1">
          <h3 className="mb-4 font-bayon text-3xl tracking-wide text-blue-bright">
            OUR MISSION
          </h3>
          <p className="max-w-2xl pt-3 font-quicksand text-lg text-white">
            At GameFest 2026, we're all about community, competition, and
            celebration. We believe in:
          </p>
          <ul className="mt-4 list-inside list-disc space-y-2 font-quicksand text-white">
            <li>
              🌐 <strong>Bringing gamers together</strong>—from casual
              couch-co-op champs to tournament-hardened veterans.
            </li>
            <li>
              🚀 <strong>Pushing the limits</strong> of collegiate esports with
              cutting-edge matchups and pro-level production.
            </li>
            <li>
              🎁 <strong>Rewarding your passion</strong>—epic prizes, surprise
              giveaways, and the coveted Director's Cup on the line.
            </li>
            <li>
              💡 <strong>Innovating the LAN experience</strong>—smooth setups,
              epic after-parties, and memories that last long after the power's
              out.
            </li>
          </ul>
        </div>
      </div>

      {/* 
      <div className="font-bayon text-normal font-normal tracking-wide text-white text-center mt-20 w-full">
      <h1 className="text-white text-3xl font-banyon mb-8">Staff Profiles</h1>
        <ProfileGrid />
      </div> */}

      <div className="text-normal mt-20 w-full text-center font-bayon font-normal tracking-wide text-white">
        <h1 className="mb-8 font-bayon text-3xl tracking-wide text-white">
          FREQUENTLY ASKED QUESTIONS
        </h1>
        <FAQ />
      </div>
      <div className="text-normal my-10 w-full font-bayon font-normal tracking-wide text-white">
        <h1 className="pb-10 text-center font-bayon text-3xl tracking-wide text-white">
          CONTACT US
        </h1>
        <Form />
      </div>
    </div>
  );
}

export default AboutInformation;
