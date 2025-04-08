import Footer from "../components/Footer.tsx";
import TeamCard from "../components/TeamCard.tsx";
import MatchCard from "../components/MatchCard.tsx";
import { fakeRoster } from "../data/fakeRoster.ts";
import { fakeMatches } from "../data/fakeMatch.ts";
import { fakeStats } from "../data/fakeStats.ts";
import '../styles/Matches.css';
import LiveScoreStatistics from "../components/LiveScoreStatistics"; // Adjust path as needed


function Matches() {
  return (
    <div className="bg-streak bg-cover">
        <div className="matchpage flex flex-col min-h-screen w-full pt-20 text-white">
          {/* Match Title */}
          <h1 className="text-5xl text-center py-6" style={{ fontFamily: 'Bayon, sans-serif' }}>TEAM A VS. TEAM B</h1>
          
          <div className="backdrop">
            {/* Match Details & Rosters */}
            <div className="match-container flex justify-center items-center w-full py-10">
              <div className="flex flex-row justify-between items-stretch w-11/12 max-w-7xl bg-black/30 p-8 rounded-lg">
                
                {/* Team A */}
                <div className="team-card w-1/4 flex flex-col items-center flex-grow">
                  <h2 className="text-5xl text-center py-6" style={{ fontFamily: 'Bayon, sans-serif' }}>TEAM A</h2>
                  {fakeRoster.map((player, index) => (
                    <TeamCard
                      key={index}
                      player1={player.player1}
                      player2={player.player2}
                      player3={player.player3}
                      player4={player.player4}
                      player5={player.player5}
                    />
                  ))}
                </div>

                {/* Match Card */}
                <div className="match-card w-1/3 flex flex-col items-center p-5 flex-grow">
                  {fakeMatches.map((match, index) => (
                    <MatchCard
                      key={index}
                      game={match.game}
                      round={match.round}
                      date={match.date}
                    />
                  ))}
                </div>

                {/* Team B */}
                <div className="team-card w-1/4 flex flex-col items-center flex-grow">
                  <h2 className="text-5xl text-center py-6" style={{ fontFamily: 'Bayon, sans-serif' }}>TEAM B</h2>
                  {fakeRoster.map((player, index) => (
                    <TeamCard
                      key={index}
                      player1={player.player1}
                      player2={player.player2}
                      player3={player.player3}
                      player4={player.player4}
                      player5={player.player5}
                    />
                  ))}
                </div>

              </div>
            </div>
          {/* Live Score Statistics */}
            {/* Twitch Live Stream Embed 1 */}
            <h2 className="text-5xl text-center py-6" style={{ fontFamily: 'Bayon, sans-serif' }}>LIVESTREAM 1</h2>
            <div className="twitch-container mb-40">
              <iframe
                src="https://player.twitch.tv/?channel=mooda&parent=localhost"
                allowFullScreen
                allow="autoplay *; encrypted-media *;"
              ></iframe>
            </div>

            {/* Twitch Live Stream Embed 2*/}
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