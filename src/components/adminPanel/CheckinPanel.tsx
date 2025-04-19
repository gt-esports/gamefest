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
  const [originalName, setOriginalName] = useState("");
  // const [assignments, setAssignments] = useState<
  //   { game: string; team: string }[]
  // >([]);
  const [newPlayerTeam, setNewPlayerTeam] = useState("");
  const [newPlayerGame, setNewPlayerGame] = useState("");
  const [query, setQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [suggestions, setSuggestions] = useState<Player[]>([]);
  const [games, setGames] = useState<string[]>([]);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();

      const [playerRes, gamesRes, staffRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/players`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/games`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/staff`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const playersData = await playerRes.json();
      const gamesData = await gamesRes.json(); // should be an array of game names
      const staffData = await staffRes.json(); // must include your `isAdmin` field

      setPlayers(playersData);
      setGames(gamesData.map((g: { name: string }) => g.name)); // adapt this based on your Game model

      const discordName = user?.externalAccounts?.find(
        (a) => a.provider === "discord"
      )?.username;
      const currentUser =
        discordName || user?.username || user?.firstName || "";
      const me = staffData.find((s: any) => s.name === currentUser);

      setIsAdmin(me.isAdmin || false);
    };

    fetchData();
  }, [getToken]);

  const addPlayer = async () => {
    const token = await getToken();

    const teamAssignments =
      newPlayerGame && newPlayerTeam
        ? [{ game: newPlayerGame, team: newPlayerTeam }]
        : [];
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/players`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: newPlayer,
        teamAssignments: teamAssignments,
      }),
    });
    const data = await res.json();
    setPlayers((prev) => [...prev, data]);
    setNewPlayer("");
    setNewPlayerTeam("");
    setNewPlayerGame("");
    // setAssignments([]);
  };

  // inside PlayerCheckinPanel, alongside addPlayer/updatePlayer…
  const removePlayer = async (playerName: string) => {
    if (!window.confirm(`Really remove ${playerName}? This is permanent.`)) return;

    const token = await getToken();
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/players/${encodeURIComponent(playerName)}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Delete failed");
      // remove from UI
      setPlayers((prev) => prev.filter((p) => p.name !== playerName));
      setSelectedPlayer(null);
      alert(`${playerName} removed.`);
    } catch (err) {
      console.error(err);
      alert("Could not remove player. Try again.");
    }
  };

  // before: const updatePlayer = async (player: Player) => { … }
  const updatePlayer = async (player: Player, oldName: string) => {
    setSaveStatus("saving");
    const token = await getToken();

    // build the updated log, participation, etc.
    const now = new Date();
    const formattedTime = now.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const editor = user?.username || user?.fullName || "Unknown User";

    const updatedPlayer: Player = {
      ...player,
      log: [
        ...(player.log || []),
        `Player renamed/updated by ${editor} on ${formattedTime}`,
      ],
      // participation & teamAssignments untouched
    };

    try {
      // use oldName in the URL, but send the payload with player.name = newName
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/players/${encodeURIComponent(oldName)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedPlayer),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.name) throw new Error(data?.message || "Update failed");

      // success: swap it into both selectedPlayer and players[]
      setSelectedPlayer(data);
      setPlayers(ps =>
        ps.map(p => (p.name === oldName ? data : p))
      );
      setOriginalName(data.name);     // now our “oldName” for future edits
      setSaveStatus("saved");
    } catch (err) {
      console.error(err);
      alert("Could not save changes.");
      setSaveStatus("idle");
    }

    // reset status after a moment
    setTimeout(() => setSaveStatus("idle"), 3000);
  };


  return (
    <div>
      <div className="my-6 pb-2">
        <h3 className="pb-4 text-xl font-semibold">Add New Player</h3>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Player Name"
            value={newPlayer}
            onChange={(e) => setNewPlayer(e.target.value)}
            className=" rounded border p-2"
          />

          <select
            value={newPlayerGame}
            onChange={(e) => setNewPlayerGame(e.target.value)}
            className="rounded border p-2"
          >
            <option value="">Select Game (optional)</option>
            {games.map((game) => (
              <option key={game} value={game}>
                {game}
              </option>
            ))}
          </select>

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

      <h2 className="mb-4 text-xl font-bold">Modify Players</h2>

      <input
        type="text"
        placeholder="Search player..."
        value={query}
        onFocus={() => {
          const top = players
            .filter((p) => !selectedPlayer || p.name !== selectedPlayer.name)
            .sort((a, b) => b.points - a.points)
            .slice(0, 1000);

          setSuggestions(top);
        }}
        onChange={(e) => {
          const val = e.target.value;
          setQuery(val);

          const filtered =
            val.length > 0
              ? players.filter(
                  (p) =>
                    p.name.toLowerCase().includes(val.toLowerCase()) &&
                    (!selectedPlayer || p.name !== selectedPlayer.name)
                )
              : players
                  .filter(
                    (p) => !selectedPlayer || p.name !== selectedPlayer.name
                  )
                  .sort((a, b) => b.points - a.points)
                  .slice(0, 5);

          setSuggestions(filtered);
        }}
        className="mb-2 w-full rounded border p-2"
      />

      {suggestions.length > 0 && (
        <div className="max-h-64 overflow-y-auto rounded border bg-white shadow-md">
          <ul>
            {suggestions.map((player) => (
              <li
                key={player.name}
                onClick={() => {
                  setSelectedPlayer(player);
                  setOriginalName(player.name);
                  setQuery("");
                  setSuggestions([]);
                }}
                className="cursor-pointer p-2 hover:bg-gray-100"
              >
                {player.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedPlayer && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-lg font-semibold">{selectedPlayer.name}</h3>

          <h3 className="text-lg font-semibold">
            <input
              type="text"
              value={selectedPlayer.name}
              onChange={(e) => {
                setSelectedPlayer({
                  ...selectedPlayer,
                  name: e.target.value,
                });
              }}
              className="w-full rounded border p-2"
              placeholder="Player Name"
            />
          </h3>

          <button
            onClick={() => removePlayer(selectedPlayer.name)}
            className="mt-4 mr-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Remove Player
          </button>
          
          <button
            onClick={() => setSelectedPlayer(null)}
            className="mt-1 text-sm text-blue-600 underline"
          >
            ← Back to Search
          </button>

          <p className="mt-2">
            <strong>Points:</strong> {selectedPlayer.points}
          </p>

          <div className="mt-3">
            <h4 className="font-medium">Logs</h4>
            {selectedPlayer.log.length === 0 && (
              <p className="text-sm text-gray-500">No logs</p>
            )}
            {selectedPlayer.log.map((entry, idx) => (
              <div key={idx} className="mb-2 flex items-center justify-between">
                <span className="text-sm">{entry}</span>
                {isAdmin && (
                  <button
                    onClick={() => {
                      const newLogs = selectedPlayer.log.filter(
                        (_, i) => i !== idx
                      );
                      setSelectedPlayer({ ...selectedPlayer, log: newLogs });
                    }}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3">
            <h4 className="font-medium">Participation</h4>

            {selectedPlayer.participation.length === 0 && (
              <p className="text-sm text-gray-500">No participation entries</p>
            )}

            {selectedPlayer.participation.map((entry, idx) => (
              <div key={idx} className="mb-2 flex items-center gap-2">
                {isAdmin ? (
                  <input
                    type="text"
                    value={entry}
                    onChange={(e) => {
                      const updated = [...selectedPlayer.participation];
                      updated[idx] = e.target.value;
                      setSelectedPlayer({
                        ...selectedPlayer,
                        participation: updated,
                      });
                    }}
                    placeholder="Enter participation role"
                    className="flex-1 rounded border p-1"
                  />
                ) : (
                  <span className="flex-1 text-sm">{entry}</span>
                )}

                {isAdmin && (
                  <button
                    onClick={() => {
                      const filtered = selectedPlayer.participation.filter(
                        (_, i) => i !== idx
                      );
                      setSelectedPlayer({
                        ...selectedPlayer,
                        participation: filtered,
                      });
                    }}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            {isAdmin && (
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
            )}
          </div>

          <div className="mt-3">
            <h4 className="font-medium">Team Assignments</h4>
            {selectedPlayer.teamAssignments.map((ta, idx) => (
              <div key={idx} className="mb-2 flex items-center gap-2">
                <select
                  value={ta.game}
                  onChange={(e) => {
                    const updated = [...selectedPlayer.teamAssignments];
                    updated[idx].game = e.target.value;
                    setSelectedPlayer({
                      ...selectedPlayer,
                      teamAssignments: updated,
                    });
                  }}
                  className="w-full flex-1 rounded border p-1"
                >
                  <option value="">Select Game</option>
                  {games.map((game) => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  ))}
                </select>

                <input
                  value={ta.team}
                  onChange={(e) => {
                    const updated = [...selectedPlayer.teamAssignments];
                    updated[idx].team = e.target.value;
                    setSelectedPlayer({
                      ...selectedPlayer,
                      teamAssignments: updated,
                    });
                  }}
                  placeholder="Team (e.g., Red)"
                  className="w-full flex-1 rounded border p-1"
                />

                <button
                  onClick={() => {
                    const newTeams = selectedPlayer.teamAssignments.filter(
                      (_, i) => i !== idx
                    );
                    setSelectedPlayer({
                      ...selectedPlayer,
                      teamAssignments: newTeams,
                    });
                  }}
                  className="text-sm text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                setSelectedPlayer({
                  ...selectedPlayer,
                  teamAssignments: [
                    ...selectedPlayer.teamAssignments,
                    { game: "", team: "" },
                  ],
                })
              }
              className="text-sm text-blue-500 underline"
            >
              + Add Team
            </button>
          </div>

          <button
            onClick={() => updatePlayer(selectedPlayer, originalName)}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
    </div>
  );
};

export default PlayerCheckinPanel;
