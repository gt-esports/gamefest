import logoImage from "../assets/gtesportsimage.png";
import FAQ from "./FAQ";
import Form from "./Form"

function AboutInformation() {
  return (
    <div className="flex flex-col items-center pt-10 w-[90%] gap-12">
      {/* GameFest Intro */}
      <div className="w-full flex lg:flex-row gap-8 flex-col items-center">
        {/* Text Section */}
        <div className="flex-1 ml-20 flex flex-col items-start">
          <h3 className="text-3xl font-bayon tracking-wide text-tech-gold mb-4">
            WHAT IS GAMEFEST 2025?
          </h3>
          <p className="max-w-2xl pt-3 text-white font-quicksand text-lg">
            GameFest 2025 is Georgia Tech's legendary LAN-party turned ultimate  
            esports showdown—back better than ever! Picture 100 players  
            duking it out in marathon Minecraft Speedrun and Fortnite Solo LAN  
            events, cashing in points toward the Director's Cup Grand Prize:  
            a custom gaming PC you design yourself. 🎮🏆
          </p>
          <ul className="mt-4 list-disc list-inside text-white font-quicksand space-y-2">
            <li>
              🕹️ <strong>100-person Minecraft Speedrun</strong> to kick off the day
            </li>
            <li>
              🎯 <strong>Fortnite Solo LAN</strong> at midday—be quick on your build!
            </li>
            <li>
              💥 Console bracket brawls: Mario Kart, Smash, Street Fighter, Guilty Gear…
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
            className="object-contain max-w-md rounded-lg backdrop-blur-2xl"
          />
        </div>
      </div>

       {/* Our Mission */}
      <div className="w-full flex flex-row items-start">
        <div className="flex-1 ml-20">
          <h3 className="text-3xl font-bayon tracking-wide text-tech-gold mb-4">
            OUR MISSION
          </h3>
          <p className="max-w-2xl pt-3 text-white font-quicksand text-lg">
            At GameFest 2025, we're all about community, competition, and  
            celebration. We believe in:
          </p>
          <ul className="mt-4 list-disc list-inside text-white font-quicksand space-y-2">
            <li>
              🌐 <strong>Bringing gamers together</strong>—from casual couch-co-op  
              champs to tournament-hardened veterans.
            </li>
            <li>
              🚀 <strong>Pushing the limits</strong> of collegiate esports with  
              cutting-edge matchups and pro-level production.
            </li>
            <li>
              🎁 <strong>Rewarding your passion</strong>—epic prizes, surprise giveaways,  
              and the coveted Director's Cup on the line.
            </li>
            <li>
              💡 <strong>Innovating the LAN experience</strong>—smooth setups,  
              epic after-parties, and memories that last long after the power's out.
            </li>
          </ul>
        </div>
      </div>

{/* 
      <div className="font-bayon text-normal font-normal tracking-wide text-white text-center mt-20 w-full">
      <h1 className="text-white text-3xl font-banyon mb-8">Staff Profiles</h1>
        <ProfileGrid />
      </div> */}

      <div className="font-bayon text-normal font-normal tracking-wide text-white text-center mt-20 w-full">
          <h1 className="text-3xl font-bayon tracking-wide text-white mb-8">
          FREQUENTLY ASKED QUESTIONS
          </h1>
          <FAQ />
      </div>
      <div className="font-bayon text-normal font-normal tracking-wide text-white my-10 w-full">
        <h1 className="text-3xl font-bayon tracking-wide text-white text-center pb-10">
              CONTACT US
          </h1>
        <Form/>
      </div>
      
    </div>
  );
}

export default AboutInformation;
