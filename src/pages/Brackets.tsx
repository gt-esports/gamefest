import Brac from "../components/Brac";
import Footer from "../components/Footer";
import { useState } from "react";

const games: string[] = Array.from({ length: 16 }, (_, i) => `Game ${i + 1}`);

function Brackets() {
  const user = { role: "Staff" }; //get from user data later
  const [selectedGame, setSelectedGame] = useState("Game 1");

  return (
    <div className="flex min-h-screen flex-col bg-streak bg-cover">
      <div className="flex-grow">
        <div className="mt-4 text-center text-lg font-semibold">
          Selected: {selectedGame}
        </div>
        <div className="flex items-center justify-center py-20 text-white">
          <Brac game={selectedGame} user={user} />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Brackets;
