import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
function Matches() {
    return (
      <>
        <div className="w-dvw h-dvh">
          <Navbar/>
          <main>
              <h1 
                  style={{fontFamily: 'Bayon, sans-serif'}} 
                  className="py-10 text-9xl font-normal text-tech-gold xs:rounded-lg xs:text-5xl xs:backdrop-blur-lg sm:text-7xl md:text-8xl lg:text-9xl text-center">
                  TEAM A VS. TEAM B
              </h1>
                <div className="relative bg-linear-to-b from-[#08004E] to-[#101010] px-20 pb-20 w-3/4 items-center justify-center mx-auto rounded-lg">
                  <div className="flex flex-row items-center justify-between h-96">
                    <div className="flex flex-col h-full">
                      <h1 
                          style={{fontFamily: 'Bayon, sans-serif'}} 
                          className="p-10 text-9xl font-normal text-tech-gold xs:rounded-lg xs:text-5xl xs:backdrop-blur-lg sm:text-7xl md:text-8xl lg:text-9xl text-center">
                          TEAM A
                      </h1>
                      <div className="bg-[#90CDFF12] rounded-lg h-full p-10">
                        <h1 
                            style={{fontFamily: 'Bayon, sans-serif'}} 
                            className="py-10 text-9xl font-normal text-tech-gold xs:rounded-lg xs:text-3xl xs:backdrop-blur-lg sm:text-5xl md:text-5xl lg:text-7xl text-center">
                            TEAM ROSTER
                        </h1>
                      </div>
                    </div>
                    <div className="bg-linear-to-b from-[#607D9576] to-[#66717A28] p-10 rounded-lg h-auto w-1/3 px-10 ">
                      <h1 
                          style={{fontFamily: 'Bayon, sans-serif'}} 
                          className="p-10 text-9xl font-normal text-tech-gold xs:rounded-lg xs:text-5xl xs:backdrop-blur-lg sm:text-7xl md:text-8xl lg:text-9xl text-center">
                          GAME: XYZ
                      </h1>
                      <h1 
                          style={{fontFamily: 'Bayon, sans-serif'}} 
                          className="p-10 text-9xl font-normal text-tech-gold xs:rounded-lg xs:text-5xl xs:backdrop-blur-lg sm:text-7xl md:text-8xl lg:text-9xl text-center">
                          ROUND: XX
                      </h1>
                      <h1 
                          style={{fontFamily: 'Bayon, sans-serif'}} 
                          className="p-10 text-9xl font-normal text-tech-gold xs:rounded-lg xs:text-md xs:backdrop-blur-lg sm:text-lg md:text-xl lg:text-2xl text-center">
                          DATE: XX / XX / XXXX
                      </h1>
                    </div>
                    <div className="flex flex-col h-full">
                      <h1 
                          style={{fontFamily: 'Bayon, sans-serif'}} 
                          className="p-10 text-9xl font-normal text-tech-gold xs:rounded-lg xs:text-5xl xs:backdrop-blur-lg sm:text-7xl md:text-8xl lg:text-9xl text-center">
                          TEAM B
                      </h1>
                      <div className="bg-[#90CDFF12] rounded-lg h-full p-10">
                        <h1 
                            style={{fontFamily: 'Bayon, sans-serif'}} 
                            className="py-10 text-9xl font-normal text-tech-gold xs:rounded-lg xs:text-3xl xs:backdrop-blur-lg sm:text-5xl md:text-5xl lg:text-7xl text-center">
                            TEAM ROSTER
                        </h1>
                      </div>
                    </div>
                  </div>

                </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }
  
  export default Matches;