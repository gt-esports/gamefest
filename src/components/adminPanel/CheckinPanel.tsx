import React, { useMemo, useState } from "react";
import { useUser } from "../../hooks/useAuth";
import { useGames } from "../../hooks/useGames";
import { type Player, usePlayers } from "../../hooks/usePlayers";
import { useUserRoles } from "../../hooks/useUserRoles";

const PlayerCheckinPanel: React.FC = () => {
  const { user } = useUser();
  const { players, addPlayer, patchPlayerByName, removePlayerByName } = usePlayers();
  const { games } = useGames();
  const { isAdmin } = useUserRoles();

  const [newPlayer, setNewPlayer] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [newPlayerTeam, setNewPlayerTeam] = useState("");
  const [newPlayerGame, setNewPlayerGame] = useState("");
  const [query, setQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [suggestions, setSuggestions] = useState<Player[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const gameNames = useMemo(() => games.map((game) => game.name), [games]);

  const addNewPlayer = async () => {
    if (!newPlayer.trim()) return;

    const teamAssignments =
      newPlayerGame && newPlayerTeam ? [{ game: newPlayerGame, team: newPlayerTeam }] : [];

    try {
      await addPlayer({
        name: newPlayer,
        teamAssignments,
      });

      setNewPlayer("");
      setNewPlayerTeam("");
      setNewPlayerGame("");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to add player");
    }
  };

  const removePlayer = async (playerName: string) => {
    if (!window.confirm(`Really remove ${playerName}? This is permanent.`)) return;

    try {
      await removePlayerByName(playerName);
      setSelectedPlayer(null);
      alert(`${playerName} removed.`);
    } catch (err) {
      console.error(err);
      alert("Could not remove player. Try again.");
    }
  };

  const updatePlayer = async (player: Player, oldName: string) => {
    setSaveStatus("saving");

    const now = new Date();
    const formattedTime = now.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const editor = user?.username || user?.fullName || "Unknown User";

    const updatedPlayer = {
      ...player,
      log: [...(player.log || []), `Player renamed/updated by ${editor} on ${formattedTime}`],
    };

    try {
      const updated = await patchPlayerByName(oldName, {
        name: updatedPlayer.name,
        points: updatedPlayer.points,
        log: updatedPlayer.log,
        participation: updatedPlayer.participation,
        teamAssignments: updatedPlayer.teamAssignments,
      });

      setSelectedPlayer(updated);
      setOriginalName(updated.name);
      setSaveStatus("saved");
    } catch (err) {
      console.error(err);
      alert("Could not save changes.");
      setSaveStatus("idle");
    }

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
            onChange={(event) => setNewPlayer(event.target.value)}
            className=" rounded border p-2"
          />

          <select
            value={newPlayerGame}
            onChange={(event) => setNewPlayerGame(event.target.value)}
            className="rounded border p-2"
          >
            <option value="">Select Game (optional)</option>
            {gameNames.map((game) => (
              <option key={game} value={game}>
                {game}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Team Name (optional)"
            value={newPlayerTeam}
            onChange={(event) => setNewPlayerTeam(event.target.value)}
            className="rounded border p-2"
          />

          <button
            onClick={() => {
              void addNewPlayer();
            }}
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
            .filter((player) => !selectedPlayer || player.name !== selectedPlayer.name)
            .sort((a, b) => b.points - a.points)
            .slice(0, 1000);

          setSuggestions(top);
        }}
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);

          const filtered =
            value.length > 0
              ? players.filter(
                  (player) =>
                    player.name.toLowerCase().includes(value.toLowerCase()) &&
                    (!selectedPlayer || player.name !== selectedPlayer.name)
                )
              : players
                  .filter((player) => !selectedPlayer || player.name !== selectedPlayer.name)
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
                key={player.id}
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
          <h3 className="text-lg font-semibold">
            <input
              type="text"
              value={selectedPlayer.name}
              onChange={(event) => {
                setSelectedPlayer({
                  ...selectedPlayer,
                  name: event.target.value,
                });
              }}
              className="w-full rounded border p-2"
              placeholder="Player Name"
            />
          </h3>

          <button
            onClick={() => {
              void removePlayer(originalName || selectedPlayer.name);
            }}
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
            {selectedPlayer.log.length === 0 && <p className="text-sm text-gray-500">No logs</p>}
            {selectedPlayer.log.map((entry, idx) => (
              <div key={`${entry}-${idx}`} className="mb-2 flex items-center justify-between">
                <span className="text-sm">{entry}</span>
                {isAdmin && (
                  <button
                    onClick={() => {
                      const newLogs = selectedPlayer.log.filter((_, index) => index !== idx);
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
              <div key={`${entry}-${idx}`} className="mb-2 flex items-center gap-2">
                {isAdmin ? (
                  <input
                    type="text"
                    value={entry}
                    onChange={(event) => {
                      const updated = [...selectedPlayer.participation];
                      updated[idx] = event.target.value;
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
                      const filtered = selectedPlayer.participation.filter((_, index) => index !== idx);
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
            {selectedPlayer.teamAssignments.map((assignment, idx) => (
              <div key={`${assignment.game}-${assignment.team}-${idx}`} className="mb-2 flex items-center gap-2">
                <select
                  value={assignment.game}
                  onChange={(event) => {
                    const updated = [...selectedPlayer.teamAssignments];
                    updated[idx].game = event.target.value;
                    setSelectedPlayer({
                      ...selectedPlayer,
                      teamAssignments: updated,
                    });
                  }}
                  className="w-full flex-1 rounded border p-1"
                >
                  <option value="">Select Game</option>
                  {gameNames.map((game) => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  ))}
                </select>

                <input
                  value={assignment.team}
                  onChange={(event) => {
                    const updated = [...selectedPlayer.teamAssignments];
                    updated[idx].team = event.target.value;
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
                      (_, index) => index !== idx
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
                  teamAssignments: [...selectedPlayer.teamAssignments, { game: "", team: "" }],
                })
              }
              className="text-sm text-blue-500 underline"
            >
              + Add Team
            </button>
          </div>

          <button
            onClick={() => {
              void updatePlayer(selectedPlayer, originalName);
            }}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Save Changes
          </button>
          {saveStatus === "saving" && <p className="mt-2 text-sm text-gray-600">Saving...</p>}
          {saveStatus === "saved" && <p className="mt-2 text-sm text-green-600">Changes saved ✅</p>}
        </div>
      )}
    </div>
  );
};

export default PlayerCheckinPanel;
