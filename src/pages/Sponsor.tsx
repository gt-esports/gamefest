import Footer from "../components/Footer";
import Avatar from "../components/Avatar";
import { sponsors } from "../data/sponsors";
import '../styles/Sponsor.css';

function Sponsor() {
  return (
    <div className="bg-streak bg-cover">
      <div className="sponsorpage flex flex-col w-full pt-20 text-white">
        <h1 className="py-6">SPONSORS</h1>

        <div className="sponsorcard flex-grow mx-auto">
          <h2 className="py-6 mb-6">A SPECIAL THANKS TO OUR SPONSORS . . . .</h2>

          <div className="sponsorgrid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
            {sponsors.map((sponsor, index: number): JSX.Element => (
              <Avatar
                key={index}
                src={sponsor.src}
                alt={sponsor.alt}
                link={sponsor.link || ""}
                className='size-40'
              />
            ))}
          </div>
        </div>

        <h2>
          "[sponsor quote here]"
        </h2>
      </div>
      <div className="pt-8">
          <Footer />
      </div>
    </div>
  );
}
export default Sponsor;
