import React, { useState } from "react";
import { useChallenges } from "../../hooks/useChallenges";
import { useGames } from "../../hooks/useGames";

const GameEditorPanel: React.FC = () => {
  const { games, loading: gamesLoading, addGame, removeGameByName } = useGames();
  const {
    challenges,
    loading: challengesLoading,
    addChallenge,
    removeChallengeByName,
  } = useChallenges();

  const [newGame, setNewGame] = useState("");
  const [newChallenge, setNewChallenge] = useState("");
  const [showGames, setShowGames] = useState(true);
  const [showChallenges, setShowChallenges] = useState(true);

  const handleAddGame = async () => {
    if (!newGame.trim()) return;
    await addGame(newGame);
    setNewGame("");
  };

  const handleAddChallenge = async () => {
    if (!newChallenge.trim()) return;
    await addChallenge({ name: newChallenge });
    setNewChallenge("");
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => setShowGames((prev) => !prev)}
          className="flex items-center gap-2 text-left text-xl font-bold"
        >
          Manage Games
          <span>{showGames ? "▲" : "▼"}</span>
        </button>

        {showGames && (
          <>
            {gamesLoading && <p className="mb-2 mt-2 text-sm text-gray-600">Loading games...</p>}
            <ul className="mb-4 mt-2">
              {games.map((game) => (
                <li key={game.name} className="mb-2">
                  {game.name}{" "}
                  <button
                    className="text-sm text-red-600"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete the game '${game.name}'?`)) {
                        void removeGameByName(game.name);
                      }
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="New Game Name"
                value={newGame}
                onChange={(event) => setNewGame(event.target.value)}
                className="rounded border p-2"
              />
              <button
                onClick={() => {
                  if (newGame && window.confirm(`Add new game '${newGame}'?`)) {
                    void handleAddGame();
                  }
                }}
                className="rounded bg-green-500 p-2 text-white hover:bg-green-600"
              >
                Add Game
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowChallenges((prev) => !prev)}
          className="flex items-center gap-2 text-left text-xl font-bold"
        >
          Manage Challenges
          <span>{showChallenges ? "▲" : "▼"}</span>
        </button>

        {showChallenges && (
          <>
            {challengesLoading && (
              <p className="mb-2 mt-2 text-sm text-gray-600">Loading challenges...</p>
            )}
            <ul className="mb-4 mt-2">
              {challenges.map((challenge) => (
                <li key={challenge.id} className="mb-2">
                  {challenge.name}{" "}
                  <button
                    className="text-sm text-red-600"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Are you sure you want to delete the challenge '${challenge.name}'?`
                        )
                      ) {
                        void removeChallengeByName(challenge.name);
                      }
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="New Challenge Name"
                value={newChallenge}
                onChange={(event) => setNewChallenge(event.target.value)}
                className="rounded border p-2"
              />
              <button
                onClick={() => {
                  if (newChallenge && window.confirm(`Add new challenge '${newChallenge}'?`)) {
                    void handleAddChallenge();
                  }
                }}
                className="rounded bg-green-500 p-2 text-white hover:bg-green-600"
              >
                Add Challenge
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GameEditorPanel;
