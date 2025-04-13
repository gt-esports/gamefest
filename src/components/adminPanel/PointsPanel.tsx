import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";

interface Player {
  name: string;
  points: number;
  log: string[];
  participation: string[];
}

interface Staff {
  name: string;
  role: string;
}

const PointsPanel: React.FC = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [staffRole, setStaffRole] = useState<string>("");
  const [staffName, setStaffName] = useState<string>("");
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(
    new Set()
  );
  const [pointsToAdd, setPointsToAdd] = useState<string>("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Player[]>([]);
  

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();

      const playerRes = await fetch("/api/players", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const playersData = await playerRes.json();
      setPlayers(playersData);

      const staffRes = await fetch("/api/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const staffData: Staff[] = await staffRes.json();
      const currentUser = user?.username || user?.firstName || "";
      const current = staffData.find((s) => s.name === currentUser);
      setStaffRole(current?.role || "");
      setStaffName(current?.name || "");
      setIsAdmin(current?.role === "admin");
    };

    fetchData();
  }, [getToken, user]);

  const updatePoints = async (player: Player, amount: number, override: boolean = false) => {
    const token = await getToken();

    const res = await fetch(`/api/players/${player.name}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const freshPlayer: Player = await res.json();

    if (!override && freshPlayer.participation.includes(staffRole)) {
    alert(
      `This player has already received points from the '${staffRole}' role.`
    );
    return;
  }

    const now = new Date();
    const timestamp = now.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const logEntry = `${staffName}[${staffRole}] gave ${player.name} ${amount} points on ${timestamp}`;

    const updated = {
      points: player.points + amount,
      log: [...player.log, logEntry],
      participation: override
        ? player.participation.filter((r) => r !== staffRole) // remove if revoking
        : Array.from(new Set([...player.participation, staffRole])), // add if giving
    };
    

    await fetch(`/api/players/${player.name}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updated),
    });

    setPlayers((prev) =>
      prev.map((p) => (p.name === player.name ? { ...p, ...updated } : p))
    );
  };

  const applyPointsToSelected = async () => {
    const value = parseInt(pointsToAdd);
    if (isNaN(value) || selectedPlayers.size === 0) return;
    
    // find all selected player objects
    const toUpdate = players.filter((p) => selectedPlayers.has(p.name));

    // call updatePoints for each
    await Promise.all(toUpdate.map((p) => updatePoints(p, value)));

    setPointsToAdd("");

  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Award or Remove Points</h2>

      <div className="overflow-x-auto whitespace-nowrap py-2 border-b mb-4">
        {players.map((player) => {
          const isSelected = selectedPlayers.has(player.name);
          return (
            <button
              key={player.name}
              onClick={() => {
                setSelectedPlayers((prev) => {
                  const next = new Set(prev);
                  if (next.has(player.name)) {
                    next.delete(player.name);
                  } else {
                    next.add(player.name);
                  }
                  return next;
                });
              }}
              className={`inline-block px-4 py-2 mr-2 rounded shadow-sm ${
                isSelected ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {player.name}
            </button>
          );
        })}
      </div>

      <input
        type="text"
        placeholder="Search player..."
        value={query}
        onChange={(e) => {
          const val = e.target.value;
          setQuery(val);
          if (val.length > 0) {
            setSuggestions(
              players.filter(
                (p) =>
                  p.name.toLowerCase().includes(val.toLowerCase()) &&
                  !selectedPlayers.has(p.name)
              )
            );
          } else {
            setSuggestions([]);
          }
        }}
        className="rounded border p-2 mb-2 w-full"
      />

      {suggestions.map((player) => (
        <li
          key={player.name}
          onClick={() => {
            setSelectedPlayers((prev) => new Set([...prev, player.name]));
            setQuery("");
            setSuggestions([]);
          }}
          className="cursor-pointer hover:bg-gray-100 p-2"
        >
          {player.name}
        </li>
      ))}

      {players
        .filter((player) => selectedPlayers.has(player.name))
        .map((player) => (
          
          <div key={player.name} className="border-t pt-4 mt-4">
            <h3 className="text-lg font-bold">{player.name}</h3>
            <p className="mb-2">Points: {player.points}</p>


            <div>
              <h4 className="font-medium">Logs</h4>
              {player.log.map((entry, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm mb-2">
                  <span>{entry}</span>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        const updatedLog = player.log.filter((_, i) => i !== idx);
                        const updated = { ...player, log: updatedLog };

                        // update players list with new log
                        setPlayers((prev) =>
                          prev.map((p) => (p.name === player.name ? updated : p))
                        );
                      }}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {staffRole &&
              player.participation.includes(staffRole) && // must have role
              player.log.some((log) => log.includes(`[${staffRole}] gave ${player.name}`)) && (
                (() => {
                  // Gather logs from this staff role
                  const logsFromRole = player.log.filter((log) =>
                    log.includes(`[${staffRole}] gave ${player.name}`)
                  );

                  // Sum how many points were given in those logs
                  const pointsToRevoke = logsFromRole.reduce((sum, log) => {
                    const match = log.match(/gave .*? (\d+) points/);
                    return match ? sum + parseInt(match[1]) : sum;
                  }, 0);

                  return (
                    <button
                      onClick={async () => {
                        const updatedPlayer = {
                          ...player,
                          log: player.log.filter((log) => !logsFromRole.includes(log)),
                          participation: player.participation.filter((r) => r !== staffRole),
                        };

                        await updatePoints(updatedPlayer, -pointsToRevoke, true);

                        // Update local player state
                        setPlayers((prev) =>
                          prev.map((p) =>
                            p.name === player.name
                              ? {
                                  ...p,
                                  participation: updatedPlayer.participation,
                                  log: updatedPlayer.log,
                                  points: player.points - pointsToRevoke,
                                }
                              : p
                          )
                        );

                      }}
                      className="mt-2 text-sm text-red-600 underline"
                    >
                      🔁 Revoke {pointsToRevoke} pts from {staffRole}
                    </button>
                  );
                })()
            )}
          </div>
      ))}

      <div className="mb-4 mt-4 flex items-center gap-2">
        <input
          type="number"
          placeholder="Points to add/remove"
          value={pointsToAdd}
          onChange={(e) => setPointsToAdd(e.target.value)}
          className="rounded border p-2"
        />
        <button
          onClick={applyPointsToSelected}
          className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
        >
          Apply to Selected
        </button>
      </div>
    </div>
  );
};

export default PointsPanel;
