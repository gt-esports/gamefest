import Brac from "../components/Brac";
import Footer from "../components/Footer";
import { useState } from "react";
const games: string[] = Array.from({ length: 16 }, (_, i) => `Game ${i + 1}`);
function Brackets() {
  const user = { role: "Staff" }; //get from user data later
  const [selectedGame, setSelectedGame] = useState("Game 1");
  return (
    <div className="h-screen w-full relative flex flex-col">
      <div className="flex flex-row flex-grow h-full"></div>
      <div className="mt-4 text-lg font-semibold text-center">Selected: {selectedGame}</div>
      <div className="flex h-full w-full justify-center items-center bg-streak bg-cover pt-20 text-white">
        <Brac game={selectedGame} user={user} />
      </div>
      <div className="pt-8">
        <Footer />
      </div>
    </div>
  );
}

export default Brackets;