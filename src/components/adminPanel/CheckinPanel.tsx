import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

interface Player {
  name: string;
  points: number;
  participation: string[];
  teamAssignments: { game: string; team: string }[];
}

const PlayerCheckinPanel: React.FC = () => {
  const { getToken } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [assignments, setAssignments] = useState<
    { game: string; team: string }[]
  >([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      const token = await getToken();
      console.log("token: ", token);
      const res = await fetch("/api/players", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log(data);
      setPlayers(data);
    };
    fetchPlayers();
  }, [getToken]);

  const addPlayer = async () => {
    const token = await getToken();
    const res = await fetch("/api/players", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newPlayer, teamAssignments: assignments }),
    });
    const data = await res.json();
    setPlayers((prev) => [...prev, data]);
    setNewPlayer("");
    setAssignments([]);
  };

  const updatePlayer = async (player: Player) => {
    const token = await getToken();
    await fetch(`/api/players/${player.name}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(player),
    });
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Check-in Players</h2>
      <ul className="mb-4">
        {players.map((player) => (
          <li key={player.name} className="mb-3">
            <strong>{player.name}</strong> — Points: {player.points}
            <br />
            Teams:
            {player.teamAssignments.map((ta, idx) => (
              <div key={idx}>
                {ta.game}:{" "}
                <input
                  value={ta.team}
                  onChange={(e) => {
                    const newTeam = e.target.value;
                    setPlayers((prev) =>
                      prev.map((p) =>
                        p.name === player.name
                          ? {
                              ...p,
                              teamAssignments: p.teamAssignments.map((t, i) =>
                                i === idx ? { ...t, team: newTeam } : t
                              ),
                            }
                          : p
                      )
                    );
                  }}
                  className="rounded border p-1"
                />
              </div>
            ))}
            <button
              onClick={() => updatePlayer(player)}
              className="mt-1 text-sm text-blue-600 underline"
            >
              Save
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <h3 className="font-semibold">Add New Player</h3>
        <input
          type="text"
          placeholder="Player Name"
          value={newPlayer}
          onChange={(e) => setNewPlayer(e.target.value)}
          className="mr-2 rounded border p-2"
        />
        <button
          onClick={addPlayer}
          className="rounded bg-green-500 p-2 text-white hover:bg-green-600"
        >
          Add Player
        </button>
      </div>
    </div>
  );
};

export default PlayerCheckinPanel;
