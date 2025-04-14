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

      const [playerRes, staffRes] = await Promise.all([
        fetch("/api/players", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/staff", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const playersData = await playerRes.json();
      setPlayers(playersData);

      const staffData: Staff[] = await staffRes.json();

      // Check with priority: Discord username > Clerk username > First Name
      const discordName = user?.externalAccounts?.find(
        (acc) => acc.provider === "discord"
      )?.username;
      const fallbackName = user?.username || user?.firstName || "";
      const nameToCheck = discordName || fallbackName;

      const current = staffData.find((s) => s.name === nameToCheck);

      if (!current) {
        alert("You're not authorized to assign points.");
        return;
      }

      setStaffRole(current.role);
      setStaffName(discordName || current.name);
    };

    fetchData();
  }, [getToken, user]);

  const updatePoints = async (player: Player, amount: number) => {
    const token = await getToken();
    const now = new Date();
    const timestamp = now.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const logEntry = `${staffName}[${staffRole}] gave ${player.name} ${amount} points on ${timestamp}`;

    const updated = {
      points: player.points + amount,
      log: [...player.log, logEntry],
      participation: Array.from(new Set([...player.participation, staffRole])),
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

  if (!staffName) {
    return (
      <div className="p-4 font-semibold text-red-600">
        ⚠️ You are not authorized to access this panel.
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Award or Remove Points</h2>

      <div className="mb-4 overflow-x-auto whitespace-nowrap border-b py-2">
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
              className={`mr-2 inline-block rounded px-4 py-2 shadow-sm ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
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
        className="mb-2 w-full rounded border p-2"
      />

      {suggestions.map((player) => (
        <li
          key={player.name}
          onClick={() => {
            setSelectedPlayers((prev) => new Set([...prev, player.name]));
            setQuery("");
            setSuggestions([]);
          }}
          className="cursor-pointer p-2 hover:bg-gray-100"
        >
          {player.name}
        </li>
      ))}

      {players
        .filter((player) => selectedPlayers.has(player.name))
        .map((player) => (
          <div key={player.name} className="mt-4 border-t pt-4">
            <h3 className="text-lg font-bold">{player.name}</h3>
            <p className="mb-2">Points: {player.points}</p>

            <div>
              <h4 className="font-medium">Logs</h4>
              {player.log.map((entry, idx) => (
                <div
                  key={idx}
                  className="mb-2 flex items-center justify-between text-sm"
                >
                  <span>{entry}</span>
                  <button
                    onClick={() => {
                      const updatedLog = player.log.filter((_, i) => i !== idx);
                      const updated = { ...player, log: updatedLog };

                      // update players list with new log
                      setPlayers((prev) =>
                        prev.map((p) => (p.name === player.name ? updated : p))
                      );
                    }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
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
