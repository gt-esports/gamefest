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
    };

    fetchData();
  }, [getToken, user]);

  const updatePoints = async (player: Player, amount: number) => {
    const token = await getToken();
    const logEntry = `${staffName}[${staffRole}] gave ${player.name} ${amount} tokens`;
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
  };

  const applyPointsToSelected = () => {
    const value = parseInt(pointsToAdd);
    if (!value || selectedPlayers.size === 0) return;
    players.forEach((p) => {
      if (selectedPlayers.has(p.name)) {
        updatePoints(p, value);
      }
    });
    setPointsToAdd("");
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Award or Remove Points</h2>

      <ul className="mb-4">
        {players.map((player) => (
          <li key={player.name} className="mb-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedPlayers.has(player.name)}
                onChange={(e) => {
                  const updated = new Set(selectedPlayers);
                  if (e.target.checked) updated.add(player.name);
                  else updated.delete(player.name);
                  setSelectedPlayers(updated);
                }}
                className="mr-2"
              />
              <strong>{player.name}</strong> — {player.points} pts
            </label>
          </li>
        ))}
      </ul>

      <div className="mb-4 flex items-center gap-2">
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
