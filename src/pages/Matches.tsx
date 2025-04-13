import Footer from "../components/Footer.tsx";
import TeamCard from "../components/TeamCard.tsx";
import MatchCard from "../components/MatchCard.tsx";
import { useParams, useLocation } from "react-router-dom";
import '../styles/Matches.css';



function Matches() {
  const { matchId } = useParams();
  const location = useLocation();
  const {
    round,
    game,
    team1,
    team2,
    players1 = [],
    players2 = [],
  } = location.state || {};

  return (
    <div className="bg-streak bg-cover">
      <div className="matchpage flex flex-col min-h-screen w-full pt-20 text-white">
        {/* Match Title */}
        <h1 className="text-5xl text-center py-6" style={{ fontFamily: 'Bayon, sans-serif' }}>{team1} VS. {team2}</h1>

        <div className="backdrop">
          {/* Match Details & Rosters */}
          <div className="match-container flex justify-center items-center w-full py-10">
            <div className="flex flex-row justify-between items-stretch w-11/12 max-w-7xl bg-black/30 p-8 rounded-lg">

              {/* Team 1 */}
              <div className="team-card w-1/4 flex flex-col items-center flex-grow">
                <h2 className="text-5xl text-center py-6" style={{ fontFamily: 'Bayon, sans-serif' }}>{team1}</h2>
                <TeamCard players={players1} />
              </div>

              {/* Match Card */}
              <div className="match-card w-1/3 flex flex-col items-center p-5 flex-grow">
                <MatchCard
                  game={game}
                  round={round}
                  date={new Date().toLocaleDateString()}
                />
              </div>

              {/* Team 2 */}
              <div className="team-card w-1/4 flex flex-col items-center flex-grow">
                <h2 className="text-5xl text-center py-6" style={{ fontFamily: 'Bayon, sans-serif' }}>{team2}</h2>
                <TeamCard players={players2} />
              </div>

            </div>
          </div>

          {/* Twitch Live Stream Embed 1 */}
          <h2 className="text-5xl text-center py-6" style={{ fontFamily: 'Bayon, sans-serif' }}>LIVESTREAM 1</h2>
          <div className="twitch-container mb-40">
            <iframe
              src="https://player.twitch.tv/?channel=mooda&parent=localhost"
              allowFullScreen
              allow="autoplay *; encrypted-media *;"
            ></iframe>
          </div>

          {/* Twitch Live Stream Embed 2 */}
          <h2 className="text-5xl text-center py-6" style={{ fontFamily: 'Bayon, sans-serif' }}>LIVESTREAM 2</h2>
          <div className="twitch-container mb-40">
            <iframe
              src="https://player.twitch.tv/?channel=mooda&parent=localhost"
              allowFullScreen
              allow="autoplay *; encrypted-media *;"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-8">
        <Footer />
      </div>
    </div>
  );
}
export default Matches;