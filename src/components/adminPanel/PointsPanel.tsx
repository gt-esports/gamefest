import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "../../hooks/useAuth";
import { getPlayerByName, type Player, usePlayers } from "../../hooks/usePlayers";
import { useStaff } from "../../hooks/useStaff";
import { useUserRoles } from "../../hooks/useUserRoles";

const PointsPanel: React.FC = () => {
  const { user } = useUser();
  const { players: dbPlayers, patchPlayerByName, refresh: refreshPlayers } = usePlayers();
  const { staff } = useStaff();
  const { isAdmin, isStaff, loading: rolesLoading } = useUserRoles();

  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [pointsToAdd, setPointsToAdd] = useState<string>("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Player[]>([]);

  useEffect(() => {
    setPlayers(dbPlayers);
  }, [dbPlayers]);

  const currentUser =
    user?.externalAccounts?.find((account) => account.provider === "discord")?.username ||
    user?.username ||
    user?.firstName ||
    "";

  const currentStaff = useMemo(
    () => staff.find((member) => member.name === currentUser),
    [currentUser, staff]
  );

  const staffAssignment = currentStaff?.assignment || "staff";
  const staffName = currentStaff?.name || currentUser || "Unknown Staff";

  const updatePoints = async (player: Player, amount: number, override = false) => {
    const freshPlayer = await getPlayerByName(player.name);
    if (!freshPlayer) throw new Error("Player not found");

    if (!override && !isAdmin && freshPlayer.participation.includes(staffAssignment)) {
      alert(`This player has already received points from the '${staffAssignment}' assignment.`);
      return;
    }

    const now = new Date();
    const timestamp = now.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const tag = isAdmin ? "ADMIN" : staffAssignment;
    const logEntry = `${staffName}[${tag}] gave ${player.name} ${amount} points on ${timestamp}`;

    const newParticipation = isAdmin
      ? player.participation
      : override
      ? player.participation.filter((role) => role !== staffAssignment)
      : Array.from(new Set([...player.participation, staffAssignment]));

    const updated = {
      points: player.points + amount,
      log: [...player.log, logEntry],
      participation: newParticipation,
    };

    await patchPlayerByName(player.name, updated);

    setPlayers((prev) =>
      prev.map((entry) => (entry.name === player.name ? { ...entry, ...updated } : entry))
    );
  };

  const applyPointsToSelected = async () => {
    const value = parseInt(pointsToAdd, 10);
    if (Number.isNaN(value) || selectedPlayers.size === 0) return;

    if (value === 0) {
      alert("Please enter a non-zero value.");
      return;
    }

    if (value < 0 && !isAdmin) {
      alert("Only admins can remove points.");
      return;
    }

    if (value < 0) {
      const wouldGoNegative = players.some(
        (player) => selectedPlayers.has(player.name) && player.points + value < 0
      );
      if (wouldGoNegative) {
        alert("Cannot remove that many points-some players would end up below 0.");
        return;
      }
    }

    const toUpdate = players.filter((player) => selectedPlayers.has(player.name));
    await Promise.all(toUpdate.map((player) => updatePoints(player, value)));

    await refreshPlayers();
    setPointsToAdd("");
  };

  if (rolesLoading) {
    return <div className="p-4 text-gray-600">Loading permissions...</div>;
  }

  if (!isStaff) {
    return (
      <div className="p-4 font-semibold text-red-600">
        You are not authorized to access this panel.
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Award or Remove Points</h2>
      <div className="mb-4 flex overflow-x-auto whitespace-nowrap border-b py-2">
        {players.map((player) => {
          const isSelected = selectedPlayers.has(player.name);

          return (
            <button
              key={player.id}
              onClick={() =>
                setSelectedPlayers((prev) => {
                  const next = new Set(prev);
                  if (next.has(player.name)) next.delete(player.name);
                  else next.add(player.name);
                  return next;
                })
              }
              style={{ order: isSelected ? -1 : 0 }}
              className={`mr-2 inline-block rounded px-4 py-2 shadow-sm ${
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
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          if (value.length > 0) {
            setSuggestions(
              players.filter(
                (player) =>
                  player.name.toLowerCase().includes(value.toLowerCase()) &&
                  !selectedPlayers.has(player.name)
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
          key={player.id}
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
          <div key={player.id} className="mt-4 border-t pt-4">
            <h3 className="text-lg font-bold">{player.name}</h3>
            <p className="mb-2">Points: {player.points}</p>

            <div>
              <h4 className="font-medium">Logs</h4>
              {player.log.map((entry, idx) => (
                <div key={`${entry}-${idx}`} className="mb-2 flex items-center justify-between text-sm">
                  <span>{entry}</span>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        const updatedLog = player.log.filter((_, index) => index !== idx);
                        const updated = { ...player, log: updatedLog };
                        setPlayers((prev) =>
                          prev.map((entryPlayer) =>
                            entryPlayer.name === player.name ? updated : entryPlayer
                          )
                        );
                      }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {staffAssignment &&
              player.participation.includes(staffAssignment) &&
              player.log.some((log) => log.includes(`[${staffAssignment}] gave ${player.name}`)) &&
              (() => {
                const logsFromRole = player.log.filter((log) =>
                  log.includes(`[${staffAssignment}] gave ${player.name}`)
                );

                const pointsToRevoke = logsFromRole.reduce((sum, log) => {
                  const match = log.match(/gave .*? (\d+) points/);
                  return match ? sum + parseInt(match[1], 10) : sum;
                }, 0);

                return (
                  <button
                    onClick={async () => {
                      const updatedPlayer = {
                        ...player,
                        log: player.log.filter((log) => !logsFromRole.includes(log)),
                        participation: player.participation.filter((role) => role !== staffAssignment),
                      };

                      await updatePoints(updatedPlayer, -pointsToRevoke, true);

                      setPlayers((prev) =>
                        prev.map((entryPlayer) =>
                          entryPlayer.name === player.name
                            ? {
                                ...entryPlayer,
                                participation: updatedPlayer.participation,
                                log: updatedPlayer.log,
                                points: player.points - pointsToRevoke,
                              }
                            : entryPlayer
                        )
                      );
                    }}
                    className="mt-2 text-sm text-red-600 underline"
                  >
                    Revoke {pointsToRevoke} pts from {staffAssignment}
                  </button>
                );
              })()}
          </div>
        ))}

      <div className="mb-4 mt-4 flex items-center gap-2">
        <input
          type="number"
          placeholder="Points to add/remove"
          value={pointsToAdd}
          onChange={(event) => setPointsToAdd(event.target.value)}
          className="rounded border p-2"
        />
        <button
          onClick={() => {
            void applyPointsToSelected();
          }}
          className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
        >
          Apply to Selected
        </button>
      </div>
    </div>
  );
};

export default PointsPanel;
