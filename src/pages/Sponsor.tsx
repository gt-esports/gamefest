import Footer from "../components/Footer";
import Avatar from "../components/Avatar";
import { sponsors } from "../data/sponsors";
import '../styles/Matches.css';
import '../styles/Sponsor.css';

function Sponsor() {
  return (
    <div className="bg-streak bg-cover">
      <div className="sponsor flex flex-col min-h-screen w-full pt-20 text-white">
        <h1 className="text-5xl text-center py-6" style={{ fontFamily: 'Bayon, sans-serif' }}>SPONSORS</h1>

        <div className="teamcard w-4/5 flex flex-row items-center flex-grow mx-auto">
          {sponsors.map((sponsor, index: number): JSX.Element => (
            <Avatar
              key={index}
              src={sponsor.src}
              alt={sponsor.alt}
              link={sponsor.link}
            />
          ))}
        </div>
      </div>
      <div className="pt-8">
          <Footer />
      </div>
    </div>
  );
}
export default Sponsor;
