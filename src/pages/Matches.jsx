import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import TeamCard from "../components/TeamCard";
import MatchCard from "../components/MatchCard";
import { fakeRoster } from "../data/fakeRoster";
import { fakeMatches } from "../data/fakeMatch";
import '../styles/Matches.css';

function Matches() {
    return (
      <>
        <div className="w-dvw h-dvh">
          <Navbar/>
          <main className="pb-10">
              <h1>
                  TEAM A VS. TEAM B
              </h1>
              
              <div className="backdrop">
                  {/* Match */}
                  <div className="flex flex-row items-stretch justify-between h-auto min-w-7/8 py-10">
                    <div className="flex flex-col h-auto min-w-2/7">
                      <h2>
                          TEAM A
                      </h2>
                      {
                        fakeRoster.map((player) => (
                          <TeamCard 
                            player1={player.player1}
                            player2={player.player2}
                            player3={player.player3}
                            player4={player.player4}
                            player5={player.player5}
                          />
                        ))
                      }
                    </div>
                    { 
                      fakeMatches.map((match) => (
                        <MatchCard 
                          match={match.match}
                          time={match.time}
                          date={match.date}
                        />
                      ))
                    }
                    <div className="flex flex-col h-auto min-w-2/7">
                      <h2>
                          TEAM B
                      </h2>
                      {
                        fakeRoster.map((player) => (
                          <TeamCard 
                            player1={player.player1}
                            player2={player.player2}
                            player3={player.player3}
                            player4={player.player4}
                            player5={player.player5}
                          />
                        ))
                      }
                    </div>
                  </div>

                  {/* Live score placeholder */}
                  <div className="flex flex-col items-stretch justify-stretch h-auto min-w-full py-10">
                      <h2 
                          style={{fontFamily: 'Bayon, sans-serif'}} 
                          className="py-10 text-5xl text-center">
                          LIVE SCORE
                      </h2>
                      <div className="flex bg-linear-to-b from-[#F1CCFF]/[0.17] to-[#101010]/[0.28] px-30 w-full h-20 items-center justify-center mx-auto rounded-lg">
                      </div>
                  </div>

                  {/* Livestream  placeholder */}
                  <div className="flex justify-center h-auto min-w-full py-10">
                      <h2 
                          style={{fontFamily: 'Bayon, sans-serif'}} 
                          className="py-10 text-5xl xs:rounded-lg xs:text-2xl bg-black w-[1024px] h-[480px] text-center align-middle"> 
                          LIVESTREAM
                      </h2>
                  </div>
              </div>

              
          </main>
          <Footer />
        </div>
      </>
    );
  }
  
  export default Matches;