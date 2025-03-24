import Footer from "../components/Footer";
import Avatar from "../components/Avatar";
import { sponsors } from "../data/sponsors";
import '../styles/Sponsor.css';

function Sponsor() {
  return (
    <div className="bg-streak bg-cover">
      <div className="sponsorpage flex flex-col w-full pt-36 text-white">
        <h1 className="justify-center font-bayon text-6xl text-center text-white">SPONSORS</h1>

        <div className="sponsorcard flex-grow mx-auto">
          <h2 className="text-center text-3xl font-bayon py-6 mb-6">A SPECIAL THANKS TO OUR SPONSORS . . . .</h2>

          <div className="sponsorgrid grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 place-items-center">
            {[...sponsors, ...sponsors].map((sponsor, index) => (
              <div key={index} className="mx-8 flex items-center justify-center">
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

        <p className="m-8 pt-12 text-center font-bayon text-2xl text-tech-gold">
            "Fueling the next generation of gamers. Play hard, compete harder.
            Proud sponsors of Georgia Tech Esports" - antonline
        </p>
      </div>

      <Footer />
    </div>
  );
}
export default Sponsor;
