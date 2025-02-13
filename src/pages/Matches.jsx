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
                  className="px-3 py-3 text-9xl font-normal text-tech-gold xs:rounded-lg xs:text-5xl xs:backdrop-blur-lg sm:text-7xl md:text-8xl lg:text-9xl text-center">
                  TEAM A VS. TEAM B
              </h1>
          </main>
          <Footer />
        </div>
      </>
    );
  }
  
  export default Matches;