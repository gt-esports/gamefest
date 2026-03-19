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
            WHAT IS GAMEFEST 2025?
          </h3>
          <p className="max-w-2xl pt-3 font-quicksand text-lg text-white">
            GameFest 2025 is Georgia Tech's legendary LAN-party turned ultimate
            esports showdown—back better than ever! Picture 100 players duking
            it out in marathon Minecraft Speedrun and Fortnite Solo LAN events,
            cashing in points toward the Director's Cup Grand Prize: a custom
            gaming PC you design yourself. 🎮🏆
          </p>
          <ul className="mt-4 list-inside list-disc space-y-2 font-quicksand text-white">
            <li>
              🕹️ <strong>100-person Minecraft Speedrun</strong> to kick off the
              day
            </li>
            <li>
              🎯 <strong>Fortnite Solo LAN</strong> at midday—be quick on your
              build!
            </li>
            <li>
              💥 <strong>Console bracket brawls:</strong> Mario Kart, Smash,
              Street Fighter, Guilty Gear…
            </li>
            <li>
              🖥️ <strong>PC bracket tournaments:</strong> Valorant, Rocket
              League, CS2, Overwatch, League of Legends, Rainbow 6 Siege, Apex,
              and Marvel Rivals!
            </li>
            <li>
              🎟️ Every BYOC player is auto-entered for an AMD Radeon RX6750XT!
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
            At GameFest 2025, we're all about community, competition, and
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
