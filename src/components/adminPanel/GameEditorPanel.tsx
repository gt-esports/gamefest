import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

interface Game {
  name: string;
  teams: { name: string; players: string[] }[];
}

interface Challenge {
  name: string;
}

const GameEditorPanel: React.FC = () => {
  const { getToken } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [newGame, setNewGame] = useState("");
  const [newChallenge, setNewChallenge] = useState("");
  const [showGames, setShowGames] = useState(true);
  const [showChallenges, setShowChallenges] = useState(true);

  const fetchData = async () => {
    const token = await getToken();

    const gameRes = await fetch(`${import.meta.env.VITE_API_URL}/api/games`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setGames(await gameRes.json());

    const challengeRes = await fetch(
      `${import.meta.env.VITE_API_URL}/api/challenges`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setChallenges(await challengeRes.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addGame = async () => {
    const token = await getToken();
    await fetch(`${import.meta.env.VITE_API_URL}/api/games`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newGame, teams: [] }),
    });
    setNewGame("");
    fetchData();
  };

  const addChallenge = async () => {
    const token = await getToken();
    await fetch(`${import.meta.env.VITE_API_URL}/api/challenges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newChallenge }),
    });
    setNewChallenge("");
    fetchData();
  };

  const deleteGame = async (name: string) => {
    const token = await getToken();
    await fetch(`${import.meta.env.VITE_API_URL}/api/games/${name}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  const deleteChallenge = async (name: string) => {
    const token = await getToken();
    await fetch(`${import.meta.env.VITE_API_URL}/api/challenges/${name}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
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
            <ul className="mb-4 mt-2">
              {games.map((game) => (
                <li key={game.name} className="mb-2">
                  {game.name}{" "}
                  <button
                    className="text-sm text-red-600"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Are you sure you want to delete the game '${game.name}'?`
                        )
                      ) {
                        deleteGame(game.name);
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
                onChange={(e) => setNewGame(e.target.value)}
                className="rounded border p-2"
              />
              <button
                onClick={() => {
                  if (newGame && window.confirm(`Add new game '${newGame}'?`)) {
                    addGame();
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
            <ul className="mb-4 mt-2">
              {challenges.map((c) => (
                <li key={c.name} className="mb-2">
                  {c.name}{" "}
                  <button
                    className="text-sm text-red-600"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Are you sure you want to delete the challenge '${c.name}'?`
                        )
                      ) {
                        deleteChallenge(c.name);
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
                onChange={(e) => setNewChallenge(e.target.value)}
                className="rounded border p-2"
              />
              <button
                onClick={() => {
                  if (
                    newChallenge &&
                    window.confirm(`Add new challenge '${newChallenge}'?`)
                  ) {
                    addChallenge();
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
