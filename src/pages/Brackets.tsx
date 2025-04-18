import Brac from "../components/Brac";
import Footer from "../components/Footer";

function Brackets() {
  return (
    <div className="flex min-h-screen flex-col bg-streak bg-cover">
      <div className="flex-grow">
        <div className="flex items-center justify-center py-20 text-white">
          <Brac />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Brackets;
