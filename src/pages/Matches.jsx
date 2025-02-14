import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
function Matches() {
    return (
      <>
        <div className="w-dvw h-dvh">
          <Navbar/>
          <main className="pb-10">
              <h1 
                  style={{fontFamily: 'Bayon, sans-serif'}} 
                  className="py-10 text-7xl font-normal text-tech-gold xs:rounded-lg xs:text-4xl xs:backdrop-blur-lg sm:text-5xl md:text-6xl lg:text-7xl text-center">
                  TEAM A VS. TEAM B
              </h1>
              
              <div className="relative flex flex-col bg-linear-to-b from-[#08004E]/[0.76] to-[#101010]/[0.28] px-4 w-8/9 items-center justify-center mx-auto rounded-lg">
                  {/* Match */}
                  <div className="flex flex-row items-stretch justify-between h-auto min-w-7/8 py-10">
                    <div className="flex flex-col h-auto min-w-2/7">
                      <h1 
                          style={{fontFamily: 'Bayon, sans-serif'}} 
                          className="p-4 text-2xl text-center">
                          TEAM A
                      </h1>
                      <div className="bg-[#90CDFF]/[0.12] rounded-lg h-full p-auto drop-shadow-2xl">
                        <h1 
                            style={{fontFamily: 'Bayon, sans-serif'}} 
                            className="p-8 text-2xl text-center align-middle">
                            TEAM ROSTER
                        </h1>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center bg-linear-to-b from-[#607D95]/[0.76] to-[#66717A]/[0.28] p-10 rounded-lg h-auto min-w-2/7 px-10 items-center drop-shadow-2xl">
                      <img 
                        src="" 
                        alt="Game Logo"
                        className="bg-gray size-fit rounded-lg" />
                      <h1 
                          style={{fontFamily: 'Bayon, sans-serif'}} 
                          className="p-4 text-2xl text-center">
                          GAME: XYZ
                      </h1>
                      <h1 
                          style={{fontFamily: 'Bayon, sans-serif'}} 
                          className="p-4 text-2xl text-center"> 
                          ROUND: XX
                      </h1>
                      <h1 
                          style={{fontFamily: 'Bayon, sans-serif'}} 
                          className="p-4 text-2xl text-center">
                          DATE: XX / XX / XXXX
                      </h1>
                    </div>
                    <div className="flex flex-col h-auto min-w-2/7">
                      <h1 
                          style={{fontFamily: 'Bayon, sans-serif'}} 
                          className="p-4 text-2xl text-center">
                          TEAM B
                      </h1>
                      <div className="bg-[#90CDFF]/[0.12] rounded-lg h-full p-auto align-middle drop-shadow-2xl">
                        <h1 
                            style={{fontFamily: 'Bayon, sans-serif'}} 
                            className="p-8 text-2xl text-center">
                            TEAM ROSTER
                        </h1>
                      </div>
                    </div>
                  </div>

                  {/* Live score */}
                  <div className="flex flex-col items-stretch justify-stretch h-auto min-w-full py-10">
                  <h1 
                      style={{fontFamily: 'Bayon, sans-serif'}} 
                      className="py-10 text-5xl font-normal xs:rounded-lg xs:text-xl xs:backdrop-blur-lg sm:text-2xl md:text-3xl lg:text-5xl text-center">
                      LIVE SCORE
                  </h1>
                  <div className="flex bg-linear-to-b from-[#F1CCFF]/[0.17] to-[#101010]/[0.28] px-30 w-full h-20 items-center justify-center mx-auto rounded-lg">
                  </div>
                  
                  </div>

                  {/* Livestream */}
                  <div className="flex justify-center h-auto min-w-full py-10">
                      <h1 
                          style={{fontFamily: 'Bayon, sans-serif'}} 
                          className="py-10 text-5xl font-norma xs:rounded-lg xs:text-2xl bg-black  w-[1024px] h-[480px] sm:text-3xl md:text-4xl lg:text-5xl text-center align-middle">
                          LIVESTREAM
                      </h1>
                  </div>
              </div>

              
          </main>
          {/* <Footer /> */}
        </div>
      </>
    );
  }
  
  export default Matches;