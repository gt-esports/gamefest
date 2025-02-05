import React, { useState } from "react";

const games = ["Valorant", "Rainbow Six Siege", "Rocket League", "Overwatch"];

const TourneyPreview = () => {
  const [selectedGame, setSelectedGame] = useState(null);

  const handleGameClick = (game) => {
    setSelectedGame(game);
  };

  return (
    <div>
      <h1>Tournament Schedule Preview</h1>
      <div className="flex flex-col">
        {games.map((game) => (
          <button
            key={game}
            onClick={() => handleGameClick(game)}
            className="m-2"
          >
            {game}
          </button>
        ))}
      </div>
      {selectedGame && (
        <div>
          <h2>{selectedGame} Schedule</h2>
          {/* Add schedule details for the selected game here */}
        </div>
      )}
    </div>
  );
};

export default TourneyPreview;
