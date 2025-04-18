import Footer from "../components/Footer.tsx";
import TeamCard from "../components/TeamCard.tsx";
import MatchCard from "../components/MatchCard.tsx";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Matches.css";

function Matches() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    round,
    game,
    team1,
    team2,
    players1 = [],
    players2 = [],
  } = location.state || {};

  const handleBackClick = () => {
    navigate(`/brackets?game=${game}`);
  };

  return (
    <div className="bg-streak bg-cover">
      <div className="matchpage flex min-h-screen w-full flex-col pt-20 text-white">
      <div style={{ margin: "20px", cursor: "pointer" }} onClick={handleBackClick}>
        ← Back to Bracket
      </div>
        {/* Match Title */}
        <h1
          className="py-6 text-center text-5xl"
          style={{ fontFamily: "Bayon, sans-serif" }}
        >
          {team1} VS. {team2}
        </h1>

        <div className="backdrop">
          {/* Match Details & Rosters */}
          <div className="match-container flex w-full items-center justify-center py-10">
            <div className="flex w-11/12 max-w-7xl flex-row items-stretch justify-between rounded-lg bg-black/30 p-8">
              {/* Team 1 */}
              <div className="team-card flex w-1/4 flex-grow flex-col items-center">
                <h2
                  className="py-6 text-center text-5xl"
                  style={{ fontFamily: "Bayon, sans-serif" }}
                >
                  {team1}
                </h2>
                <TeamCard players={players1} teamName={team1} gameName={game} />
              </div>

              {/* Match Card */}
              <div className="match-card flex w-1/3 flex-grow flex-col items-center p-5">
                <MatchCard
                  game={game}
                  round={round}
                  date={new Date().toLocaleDateString()}
                />
              </div>

              {/* Team 2 */}
              <div className="team-card flex w-1/4 flex-grow flex-col items-center">
                <h2
                  className="py-6 text-center text-5xl"
                  style={{ fontFamily: "Bayon, sans-serif" }}
                >
                  {team2}
                </h2>
                <TeamCard players={players2} teamName={team2} gameName={game} />
              </div>
            </div>
          </div>

          {/* Twitch Live Stream Embed 1 */}
          <h2
            className="py-6 text-center text-5xl"
            style={{ fontFamily: "Bayon, sans-serif" }}
          >
            MAIN STREAM
          </h2>
          <div className="twitch-container mb-40">
            <iframe
              src="https://player.twitch.tv/?channel=esportsgatech&parent=localhost"
              allowFullScreen
              allow="autoplay *; encrypted-media *;"
            ></iframe>
          </div>

          {/* Twitch Live Stream Embed 2 */}
          <h2
            className="py-6 text-center text-5xl"
            style={{ fontFamily: "Bayon, sans-serif" }}
          >
            PC GAMES STREAM
          </h2>
          <div className="twitch-container mb-40">
            <iframe
              src="https://player.twitch.tv/?channel=antonline&parent=localhost"
              allowFullScreen
              allow="autoplay *; encrypted-media *;"
            ></iframe>
          </div>
          {/* Twitch Live Stream Embed 3 */}
          <h2
            className="py-6 text-center text-5xl"
            style={{ fontFamily: "Bayon, sans-serif" }}
          >
            CONSOLE GAMES STREAM
          </h2>
          <div className="twitch-container mb-40">
            <iframe
              src="https://player.twitch.tv/?channel=gt_esports&parent=localhost"
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
