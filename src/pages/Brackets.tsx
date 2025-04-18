import Brac from "../components/Brac";
import Footer from "../components/Footer";

function Brackets() {
  return (
    <div className="flex min-h-screen flex-col bg-streak bg-cover">
      <div className="flex-grow">
        <div className="flex flex-col items-center justify-center py-20 text-white">
          <div className="mt-4 text-center text-lg font-semibold text-white">
            Select a game to view bracket
          </div>
          <Brac />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Brackets;
