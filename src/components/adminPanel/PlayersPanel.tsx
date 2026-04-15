import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "../../hooks/useAuth";
import { useChallenges } from "../../hooks/useChallenges";
import { useGames } from "../../hooks/useGames";
import { getPlayerById, type Player, usePlayers } from "../../hooks/usePlayers";
import { useStaff } from "../../hooks/useStaff";
import { useUserRoles } from "../../hooks/useUserRoles";
import { ToastStack } from "./shared/ui";
import { useToasts } from "./shared/useToasts";
import AddPlayerModal from "./players/AddPlayerModal";
import AwardCard from "./players/AwardCard";
import PlayerDetailCard, { type DetailSection } from "./players/PlayerDetailCard";
import RosterRail, { type SortMode } from "./players/RosterRail";
import SelectionChips from "./players/SelectionChips";

const PlayersPanel: React.FC = () => {
  const { user } = useUser();
  const {
    players,
    addPlayer,
    patchPlayerById,
    removePlayerById,
    refresh: refreshPlayers,
  } = usePlayers();
  const { staff } = useStaff();
  const { games } = useGames();
  const { challenges } = useChallenges();
  const { isAdmin, isStaff, loading: rolesLoading } = useUserRoles();
  const { toasts, push, dismiss } = useToasts();

  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("points");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pointsInput, setPointsInput] = useState("");
  const [awardReason, setAwardReason] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [openSection, setOpenSection] = useState<DetailSection>(null);
  const [editedPlayer, setEditedPlayer] = useState<Player | null>(null);
  const [busyAward, setBusyAward] = useState(false);
  const [busySave, setBusySave] = useState(false);

  /* ---------------------------- Derived state ---------------------------- */

  const currentStaff = useMemo(
    () => staff.find((m) => m.userId === user?.id),
    [user?.id, staff]
  );
  const staffAssignment = currentStaff?.assignment || "staff";
  const staffName =
    currentStaff?.name || user?.username || user?.fullName || "Unknown Staff";

  const filteredPlayers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base =
      q.length === 0
        ? players
        : players.filter((p) => p.name.toLowerCase().includes(q));
    const sorted = [...base];
    if (sortMode === "points") sorted.sort((a, b) => b.points - a.points);
    else sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [players, query, sortMode]);

  const selectedPlayers = useMemo(
    () => players.filter((p) => selectedIds.has(p.id)),
    [players, selectedIds]
  );
  const singleSelected = selectedPlayers.length === 1 ? selectedPlayers[0] : null;

  // Reset the edit buffer when the single-selection identity changes.
  useEffect(() => {
    if (singleSelected) {
      setEditedPlayer(singleSelected);
      setOpenSection(null);
    } else {
      setEditedPlayer(null);
    }
  }, [singleSelected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ------------------------------ Actions ------------------------------ */

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  const awardPoints = async (amount: number) => {
    if (amount === 0 || selectedPlayers.length === 0) return;
    if (!awardReason) {
      push("error", "Select a Game or Challenge first.");
      return;
    }
    if (amount < 0 && !isAdmin) {
      push("error", "Only admins can remove points.");
      return;
    }
    if (amount < 0 && selectedPlayers.some((p) => p.points + amount < 0)) {
      push("error", "Cannot remove — some players would go below 0.");
      return;
    }

    setBusyAward(true);
    const timestamp = new Date().toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const tag = isAdmin ? "ADMIN" : staffAssignment;
    let succeeded = 0;
    let blocked = 0;

    await Promise.all(
      selectedPlayers.map(async (player) => {
        try {
          const fresh = await getPlayerById(player.id);
          if (!fresh) return;
          if (!isAdmin && fresh.participation.includes(staffAssignment)) {
            blocked++;
            return;
          }
          const newParticipation = isAdmin
            ? fresh.participation
            : Array.from(new Set([...fresh.participation, staffAssignment]));
          await patchPlayerById(player.id, {
            points: fresh.points + amount,
            log: [
              ...fresh.log,
              `${staffName}[${tag}] gave ${fresh.name} ${amount} points on ${timestamp} for ${awardReason}`,
            ],
            participation: newParticipation,
          });
          succeeded++;
        } catch (err) {
          push(
            "error",
            `Failed for ${player.name}: ${err instanceof Error ? err.message : "error"}`
          );
        }
      })
    );

    // Fetch fresh data while still busy so the UI unlocks with correct data atomically
    const freshForEdit = singleSelected ? await getPlayerById(singleSelected.id) : null;

    await refreshPlayers();

    // Batch — UI becomes interactive only after editedPlayer is already synced
    setPointsInput("");
    setBusyAward(false);
    if (freshForEdit) setEditedPlayer(freshForEdit);

    if (succeeded > 0) {
      const verb = amount > 0 ? "awarded to" : "removed from";
      push(
        "success",
        `${Math.abs(amount)} pts ${verb} ${succeeded} player${succeeded === 1 ? "" : "s"}`
      );
    }
    if (blocked > 0) {
      push("info", `Skipped ${blocked} — already received '${staffAssignment}' points`);
    }
  };

  const revokeMyAssignment = async (player: Player) => {
    const logsFromRole = player.log.filter((log) =>
      log.includes(`[${staffAssignment}] gave ${player.name}`)
    );
    const pointsToRevoke = logsFromRole.reduce((sum, log) => {
      const match = log.match(/gave .*? (-?\d+) points/);
      return match ? sum + parseInt(match[1], 10) : sum;
    }, 0);
    if (pointsToRevoke === 0) return;
    try {
      const revoked = await patchPlayerById(player.id, {
        points: player.points - pointsToRevoke,
        log: player.log.filter((log) => !logsFromRole.includes(log)),
        participation: player.participation.filter((role) => role !== staffAssignment),
      });
      await refreshPlayers();
      setEditedPlayer(revoked);
      push("success", `Revoked ${pointsToRevoke} pts from ${player.name}`);
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Could not revoke.");
    }
  };

  const saveEdits = async () => {
    if (!editedPlayer || !singleSelected) return;
    setBusySave(true);
    const snapshot = editedPlayer; // capture before any async gap
    const timestamp = new Date().toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const editor = user?.username || user?.fullName || "Unknown User";
    const removedCount = singleSelected.log.filter(
      (e) => !snapshot.log.includes(e)
    ).length;
    const auditEntry =
      removedCount > 0
        ? `${editor} removed ${removedCount} log ${removedCount === 1 ? "entry" : "entries"} from ${singleSelected.name} on ${timestamp}`
        : `Player updated by ${editor} on ${timestamp}`;
    try {
      const updated = await patchPlayerById(singleSelected.id, {
        points: snapshot.points,
        log: [...snapshot.log, auditEntry],
        participation: snapshot.participation,
        teamAssignments: snapshot.teamAssignments,
      });
      await refreshPlayers();
      // Only sync editedPlayer back from server if the admin hasn't made further
      // edits while the save was in flight (e.g. deleted another log entry).
      setEditedPlayer((current) => (current === snapshot ? updated : current));
      push("success", `Saved changes to ${updated.name}`);
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusySave(false);
    }
  };

  const handleRemovePlayer = async (player: Player) => {
    if (!window.confirm(`Really remove ${player.name}? This is permanent.`)) return;
    try {
      await removePlayerById(player.id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(player.id);
        return next;
      });
      push("success", `Removed ${player.name}`);
    } catch {
      push("error", "Could not remove player.");
    }
  };

  const handleRegister = async (userId: string, game: string, team: string) => {
    try {
      await addPlayer({
        userId,
        teamAssignments: game && team ? [{ game, team }] : [],
      });
      push("success", `Registered player`);
      setShowAddModal(false);
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Failed to register player");
    }
  };

  /* ------------------------------- Render ------------------------------- */

  if (rolesLoading) return <div className="p-4 text-gray-300">Loading permissions...</div>;
  if (!isStaff)
    return (
      <div className="p-4 font-semibold text-red-300">
        You are not authorized to access this panel.
      </div>
    );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px,1fr]">
      <RosterRail
        players={filteredPlayers}
        totalCount={players.length}
        selectedIds={selectedIds}
        query={query}
        onQueryChange={setQuery}
        sortMode={sortMode}
        onSortChange={setSortMode}
        onToggleSelect={toggleSelect}
        onAddClick={() => setShowAddModal(true)}
      />

      <section className="relative flex flex-col gap-4">
        <ToastStack
          toasts={toasts}
          onDismiss={dismiss}
          className="pointer-events-none absolute right-0 top-0 z-10 flex flex-col gap-2"
        />
        {selectedPlayers.length === 0 && (
          <div className="flex items-center justify-center border border-dashed border-blue-accent/25 bg-navy-blue/20 p-10 text-center">
            <div>
              <div className="font-zuume text-3xl font-bold uppercase tracking-wider text-gray-400">
                Select a Player
              </div>
              <p className="mt-2 text-sm text-gray-400">
                Click any name on the left to award points or edit details.
              </p>
            </div>
          </div>
        )}

        {selectedPlayers.length > 0 && (
          <>
            <SelectionChips
              selected={selectedPlayers}
              onToggle={toggleSelect}
              onClear={clearSelection}
            />
            <AwardCard
              staffAssignment={staffAssignment}
              isAdmin={isAdmin}
              busy={busyAward}
              pointsInput={pointsInput}
              onPointsInputChange={setPointsInput}
              onAward={(amount) => void awardPoints(amount)}
              games={games.map((g) => g.name)}
              challenges={challenges.map((c) => c.name)}
              selectedReason={awardReason}
              onSelectedReasonChange={setAwardReason}
            />
          </>
        )}

        {singleSelected && editedPlayer && (
          <PlayerDetailCard
            player={singleSelected}
            edited={editedPlayer}
            onEdit={setEditedPlayer}
            openSection={openSection}
            onOpenSection={setOpenSection}
            isAdmin={isAdmin}
            staffAssignment={staffAssignment}
            games={games}
            busySave={busySave}
            onSave={() => void saveEdits()}
            onRemove={() => void handleRemovePlayer(singleSelected)}
            onRevoke={() => void revokeMyAssignment(singleSelected)}
          />
        )}
      </section>

      {showAddModal && (
        <AddPlayerModal
          games={games.map((g) => g.name)}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleRegister}
        />
      )}
    </div>
  );
};

export default PlayersPanel;
