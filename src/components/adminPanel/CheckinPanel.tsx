import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";

interface Player {
  name: string;
  points: number;
  participation: string[];
  teamAssignments: { game: string; team: string }[];
  log: string[];
}

const PlayerCheckinPanel: React.FC = () => {
  const { getToken } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState("");
  // const [assignments, setAssignments] = useState<
  //   { game: string; team: string }[]
  // >([]);  
  const [newPlayerTeam, setNewPlayerTeam] = useState("");
  const [newPlayerGame, setNewPlayerGame] = useState("");
  const [query, setQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [suggestions, setSuggestions] = useState<Player[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const { user } = useUser();

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

    const teamAssignments =
    newPlayerGame && newPlayerTeam
      ? [{ game: newPlayerGame, team: newPlayerTeam }]
      : [];

    const res = await fetch("/api/players", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newPlayer, teamAssignments: teamAssignments }),
    });
    const data = await res.json();
    setPlayers((prev) => [...prev, data]);
    setNewPlayer("");
    setNewPlayerTeam("");
    setNewPlayerGame("");
    // setAssignments([]);
  };

  const updatePlayer = async (player: Player) => {
    setSaveStatus("saving");
    const token = await getToken();
  
    // Clone player and update log
    const now = new Date();
    const formattedTime = now.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const editor = user?.username || user?.fullName || "Unknown User";

    const updatedPlayer = {
      ...player,
      log: [
        ...(player.log || []),
        `Player profile updated by ${editor} on ${formattedTime}`,
      ],
    };
  
    await fetch(`/api/players/${player.name}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedPlayer),
    });
  
    console.log("✅ Player updated:", updatedPlayer);
    setSelectedPlayer(updatedPlayer); // update UI with latest log
    setSaveStatus("saved");
  
    setTimeout(() => setSaveStatus("idle"), 3000);
  };
  

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Modify Players</h2>
      {/* <ul className="mb-4">
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
      </ul> */}
      <input
        type="text"
        placeholder="Search player..."
        value={query}
        onChange={(e) => {
          const val = e.target.value;
          setQuery(val);
          if (val.length > 0) {
            setSuggestions(players.filter((p) => p.name.toLowerCase().includes(val.toLowerCase())));
          } else {
            setSuggestions([]);
          }
        }}
        className="rounded border p-2 mb-2 w-full"
      />

      {suggestions.length > 0 && (
        <ul className="border rounded bg-white">
          {suggestions.map((player) => (
            <li
              key={player.name}
              onClick={() => {
                setSelectedPlayer(player);
                setQuery("");
                setSuggestions([]);
              }}
              className="cursor-pointer hover:bg-gray-100 p-2"
            >
              {player.name}
            </li>
          ))}
        </ul>
      )}

      {selectedPlayer && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-lg font-semibold">{selectedPlayer.name}</h3>

          <p className="mt-2"><strong>Points:</strong> {selectedPlayer.points}</p>

          <div className="mt-3">
            <h4 className="font-medium">Logs</h4>
            {selectedPlayer.log.length === 0 && (
              <p className="text-sm text-gray-500">No logs</p>
            )}
            {selectedPlayer.log.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between mb-2">
                <span className="text-sm">{entry}</span>
                <button
                  onClick={() => {
                    const newLogs = selectedPlayer.log.filter((_, i) => i !== idx);
                    setSelectedPlayer({ ...selectedPlayer, log: newLogs });
                  }}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>


          <div className="mt-3">
            <h4 className="font-medium">Participation</h4>
            {selectedPlayer.participation.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  value={entry}
                  onChange={(e) => {
                    const newPart = [...selectedPlayer.participation];
                    newPart[idx] = e.target.value;
                    setSelectedPlayer({ ...selectedPlayer, participation: newPart });
                  }}
                  className="flex-1 rounded border p-1"
                />
                <button
                  onClick={() => {
                    const newPart = selectedPlayer.participation.filter((_, i) => i !== idx);
                    setSelectedPlayer({ ...selectedPlayer, participation: newPart });
                  }}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                setSelectedPlayer({
                  ...selectedPlayer,
                  participation: [...selectedPlayer.participation, ""],
                })
              }
              className="text-sm text-blue-500 underline"
            >
              + Add Participation
            </button>
          </div>

          <div className="mt-3">
            <h4 className="font-medium">Team Assignments</h4>
            {selectedPlayer.teamAssignments.map((ta, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  value={ta.team}
                  onChange={(e) => {
                    const newTeams = [...selectedPlayer.teamAssignments];
                    newTeams[idx].team = e.target.value;
                    setSelectedPlayer({ ...selectedPlayer, teamAssignments: newTeams });
                  }}
                  className="flex-1 rounded border p-1"
                />
                <button
                  onClick={() => {
                    const newTeams = selectedPlayer.teamAssignments.filter((_, i) => i !== idx);
                    setSelectedPlayer({ ...selectedPlayer, teamAssignments: newTeams });
                  }}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                setSelectedPlayer({
                  ...selectedPlayer,
                  teamAssignments: [...selectedPlayer.teamAssignments, { game: "", team: "" }],
                })
              }
              className="text-sm text-blue-500 underline"
            >
              + Add Team
            </button>
          </div>


          <button
            onClick={() => updatePlayer(selectedPlayer)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
          {saveStatus === "saving" && (
            <p className="mt-2 text-sm text-gray-600">Saving...</p>
          )}
          {saveStatus === "saved" && (
            <p className="mt-2 text-sm text-green-600">Changes saved ✅</p>
          )}

        </div>
      )}
      
      <div className="mt-6">
        <h3 className="font-semibold">Add New Player</h3>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Player Name"
            value={newPlayer}
            onChange={(e) => setNewPlayer(e.target.value)}
            className=" rounded border p-2"
          />
          
          <input
            type="text"
            placeholder="Game (optional)"
            value={newPlayerGame}
            onChange={(e) => setNewPlayerGame(e.target.value)}
            className="rounded border p-2"
          />
          <input
            type="text"
            placeholder="Team Name (optional)"
            value={newPlayerTeam}
            onChange={(e) => setNewPlayerTeam(e.target.value)}
            className="rounded border p-2"
          />

          <button
            onClick={addPlayer}
            className="rounded bg-green-500 p-2 text-white hover:bg-green-600"
          >
            Add Player
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerCheckinPanel;
