import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "../../hooks/useAuth";
import { useGames } from "../../hooks/useGames";
import {
  getPlayerById,
  type Player,
  usePlayers,
} from "../../hooks/usePlayers";
import {
  deleteActivitiesBy,
  deleteActivitiesByIds,
  getActivityTotal,
  recordActivity,
} from "../../hooks/usePlayerActivity";
import { useCheckInRoster } from "../../hooks/useCheckIn";
import { useStaff } from "../../hooks/useStaff";
import { useUserRoles } from "../../hooks/useUserRoles";
import { ToastStack } from "./shared/ui";
import { useToasts } from "./shared/useToasts";
import AddPlayerModal from "./players/AddPlayerModal";
import AwardCard, { type LastAwardSummary } from "./players/AwardCard";
import PlayerDetailCard, {
  type DetailSection,
} from "./players/PlayerDetailCard";
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
  const { isAdmin, isStaff, loading: rolesLoading } = useUserRoles();
  const { checkIns, checkIn, checkOut } = useCheckInRoster();
  const { toasts, push, dismiss } = useToasts();

  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("points");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // When true, checkboxes reflect selection (user clicked a checkbox).
  // Row clicks switch to single-select mode (batchMode=false) so checkboxes
  // don't appear checked from a row click.
  const [batchMode, setBatchMode] = useState(false);
  // Shared custom-award input state for staff/admin.
  const [pointsInput, setPointsInput] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [openSection, setOpenSection] = useState<DetailSection>(null);
  const [editedPlayer, setEditedPlayer] = useState<Player | null>(null);
  const [busyAward, setBusyAward] = useState(false);
  const [busySave, setBusySave] = useState(false);
  const [busyUndo, setBusyUndo] = useState(false);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);

  // Tracks the most recent assignment-backed award batch so staff can
  // intuitively undo it. Cleared on a new award, selection change, or undo.
  type LastAwardBatch = {
    activities: {
      activityId: string;
      playerId: string;
      playerName: string;
      points: number;
    }[];
    summary: LastAwardSummary;
  };
  const [lastAward, setLastAward] = useState<LastAwardBatch | null>(null);

  /* ---------------------------- Derived state ---------------------------- */

  const currentStaff = useMemo(
    () => staff.find((m) => m.userId === user?.id),
    [user?.id, staff]
  );

  const activeAssignment = useMemo(() => {
    const list = currentStaff?.assignments ?? [];
    if (list.length === 0) return null;
    return list.find((a) => a.id === activeAssignmentId) ?? list[0];
  }, [currentStaff?.assignments, activeAssignmentId]);

  const staffName =
    currentStaff?.name || user?.username || user?.fullName || "Unknown Staff";

  const filteredPlayers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base =
      q.length === 0
        ? players
        : players.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              (p.username?.toLowerCase().includes(q) ?? false)
          );
    const sorted = [...base];
    if (sortMode === "points") sorted.sort((a, b) => b.points - a.points);
    else sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [players, query, sortMode]);

  const selectedPlayers = useMemo(
    () => players.filter((p) => selectedIds.has(p.id)),
    [players, selectedIds]
  );
  const singleSelected =
    selectedPlayers.length === 1 ? selectedPlayers[0] : null;

  useEffect(() => {
    if (singleSelected) {
      setEditedPlayer(singleSelected);
      setOpenSection(null);
    } else {
      setEditedPlayer(null);
    }
  }, [singleSelected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear the "undo last award" affordance whenever the roster selection
  // changes — undo only makes sense in the context of the current batch.
  useEffect(() => {
    setLastAward(null);
  }, [selectedIds]);

  useEffect(() => {
    setPointsInput("");
  }, [activeAssignment?.id]);

  /* ------------------------------ Actions ------------------------------ */

  const toggleSelect = (id: string) => {
    // First checkbox click on an already row-selected player: enter batch mode
    // without deselecting them — they should appear checked immediately.
    if (!batchMode && selectedIds.has(id)) {
      setBatchMode(true);
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setBatchMode(next.size > 0);
      return next;
    });
  };
  const selectOnly = (id: string) => {
    setBatchMode(false);
    setSelectedIds((prev) =>
      prev.size === 1 && prev.has(id) ? new Set() : new Set([id])
    );
  };
  const clearSelection = () => { setSelectedIds(new Set()); setBatchMode(false); };

  /**
   * Staff path: custom award amount is recorded against the staff member's
   * assignment. Per-player cap is still enforced through player_activity.
   *
   * Admin path: custom amount comes from the UI. No structured game/challenge
   * picker or cap enforcement applies, and admins can add or remove points.
   */
  const awardPoints = async (amountInput: number) => {
    if (selectedPlayers.length === 0) return;
    setBusyAward(true);

    const timestamp = new Date().toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

    try {
      if (!isAdmin) {
        // ── Staff path ──────────────────────────────────────────────────────
        if (!activeAssignment) {
          push(
            "error",
            "You have no game/challenge assignment. Contact an admin."
          );
          return;
        }

        const amount = Math.abs(amountInput);
        if (amount === 0) {
          push("error", "Enter a point amount greater than 0.");
          return;
        }

        const gameId =
          activeAssignment.type === "game" ? activeAssignment.assignmentId : null;
        const challengeId =
          activeAssignment.type === "challenge" ? activeAssignment.assignmentId : null;
        const maxPts = activeAssignment.maxPoints;
        const tag = activeAssignment.assignmentName;

        let capped = 0;
        let notCheckedIn = 0;
        const batch: LastAwardBatch["activities"] = [];

        await Promise.all(
          selectedPlayers.map(async (player) => {
            try {
              if (!checkIns.get(player.userId)?.checkedIn) {
                notCheckedIn++;
                return;
              }
              const currentTotal = await getActivityTotal(
                player.id,
                gameId,
                challengeId
              );
              if (currentTotal + amount > maxPts) {
                capped++;
                return;
              }
              if (!user?.id) return;
              const activityId = await recordActivity(
                player.id,
                gameId,
                challengeId,
                amount,
                user.id
              );
              const fresh = await getPlayerById(player.id);
              if (!fresh) return;
              await patchPlayerById(player.id, {
                points: fresh.points + amount,
                log: [
                  ...fresh.log,
                  `${staffName}[${tag}] gave ${fresh.name} ${amount} pts on ${timestamp}`,
                ],
              });
              batch.push({
                activityId,
                playerId: player.id,
                playerName: fresh.name,
                points: amount,
              });
            } catch (err) {
              push(
                "error",
                `Failed for ${player.name}: ${
                  err instanceof Error ? err.message : "error"
                }`
              );
            }
          })
        );

        const freshForEdit = singleSelected
          ? await getPlayerById(singleSelected.id)
          : null;
        await refreshPlayers();
        setPointsInput("");
        if (freshForEdit) setEditedPlayer(freshForEdit);

        if (batch.length > 0) {
          push(
            "success",
            `${amount} pts awarded to ${batch.length} player${
              batch.length === 1 ? "" : "s"
            }`
          );
          setLastAward({
            activities: batch,
            summary: {
              amount,
              tag,
              playerCount: batch.length,
              playerNamePreview: batch[0].playerName,
            },
          });
        }
        if (notCheckedIn > 0) {
          push(
            "info",
            `Skipped ${notCheckedIn} player${notCheckedIn === 1 ? "" : "s"} — not checked in`
          );
        }
        if (capped > 0) {
          push(
            "info",
            `Skipped ${capped} player${capped === 1 ? "" : "s"} — would exceed the ${maxPts}-pt cap for ${tag}`
          );
        }
      } else {
        // ── Admin path ──────────────────────────────────────────────────────
        // Custom points aren't tracked in player_activity, so clear any stale
        // "undo last award" banner from a prior assignment-backed award.
        setLastAward(null);
        const amount = amountInput ?? 0;
        if (amount === 0) {
          push("error", "Enter a point amount greater than 0.");
          return;
        }

        if (
          amount < 0 &&
          selectedPlayers.some((p) => p.points + amount < 0)
        ) {
          push("error", "Cannot remove — some players would go below 0.");
          return;
        }

        let succeeded = 0;
        let notCheckedIn = 0;

        await Promise.all(
          selectedPlayers.map(async (player) => {
            try {
              if (!checkIns.get(player.userId)?.checkedIn) {
                notCheckedIn++;
                return;
              }
              const fresh = await getPlayerById(player.id);
              if (!fresh) return;

              const logEntry =
                amount > 0
                  ? `${staffName}[ADMIN] gave ${fresh.name} ${amount} pts on ${timestamp}`
                  : `${staffName}[ADMIN] removed ${Math.abs(amount)} pts from ${fresh.name} on ${timestamp}`;

              await patchPlayerById(player.id, {
                points: fresh.points + amount,
                log: [...fresh.log, logEntry],
              });
              succeeded++;
            } catch (err) {
              push(
                "error",
                `Failed for ${player.name}: ${
                  err instanceof Error ? err.message : "error"
                }`
              );
            }
          })
        );

        const freshForEdit = singleSelected
          ? await getPlayerById(singleSelected.id)
          : null;
        await refreshPlayers();
        setPointsInput("");
        if (freshForEdit) setEditedPlayer(freshForEdit);

        if (notCheckedIn > 0) {
          push(
            "info",
            `Skipped ${notCheckedIn} player${notCheckedIn === 1 ? "" : "s"} — not checked in`
          );
        }
        if (succeeded > 0) {
          const verb = amount > 0 ? "awarded to" : "removed from";
          push(
            "success",
            `${Math.abs(amount)} pts ${verb} ${succeeded} player${
              succeeded === 1 ? "" : "s"
            }`
          );
        }
      }
    } finally {
      setBusyAward(false);
    }
  };

  const revokeMyAssignment = async (player: Player) => {
    if (!activeAssignment || !user?.id) return;

    const gameId =
      activeAssignment.type === "game" ? activeAssignment.assignmentId : null;
    const challengeId =
      activeAssignment.type === "challenge" ? activeAssignment.assignmentId : null;

    try {
      const pointsToRevoke = await deleteActivitiesBy(
        player.id,
        user.id,
        gameId,
        challengeId
      );

      if (pointsToRevoke === 0) {
        push("info", "No awards to revoke for this player.");
        return;
      }

      const fresh = await getPlayerById(player.id);
      if (!fresh) return;

      const timestamp = new Date().toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
      const revoked = await patchPlayerById(player.id, {
        points: Math.max(0, fresh.points - pointsToRevoke),
        log: [
          ...fresh.log,
          `${staffName}[${activeAssignment.assignmentName}] revoked ${pointsToRevoke} pts from ${fresh.name} on ${timestamp}`,
        ],
      });
      await refreshPlayers();
      setEditedPlayer(revoked);
      push("success", `Revoked ${pointsToRevoke} pts from ${player.name}`);
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Could not revoke.");
    }
  };

  const undoLastAward = async () => {
    if (!lastAward || lastAward.activities.length === 0) return;
    setBusyUndo(true);
    const batch = lastAward;
    const timestamp = new Date().toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const tagLabel = isAdmin ? "ADMIN" : batch.summary.tag;
    try {
      await deleteActivitiesByIds(
        batch.activities.map((a) => a.activityId)
      );

      let undone = 0;
      await Promise.all(
        batch.activities.map(async (entry) => {
          try {
            const fresh = await getPlayerById(entry.playerId);
            if (!fresh) return;
            await patchPlayerById(entry.playerId, {
              points: Math.max(0, fresh.points - entry.points),
              log: [
                ...fresh.log,
                `${staffName}[${tagLabel}] undid ${entry.points} pts from ${fresh.name} on ${timestamp}`,
              ],
            });
            undone++;
          } catch (err) {
            push(
              "error",
              `Failed to undo for ${entry.playerName}: ${
                err instanceof Error ? err.message : "error"
              }`
            );
          }
        })
      );

      const freshForEdit = singleSelected
        ? await getPlayerById(singleSelected.id)
        : null;
      await refreshPlayers();
      if (freshForEdit) setEditedPlayer(freshForEdit);
      setLastAward(null);

      if (undone > 0) {
        push(
          "success",
          `Undid last award for ${undone} player${undone === 1 ? "" : "s"}`
        );
      }
    } catch (err) {
      push(
        "error",
        err instanceof Error ? err.message : "Could not undo last award."
      );
    } finally {
      setBusyUndo(false);
    }
  };

  const saveEdits = async () => {
    if (!editedPlayer || !singleSelected) return;
    setBusySave(true);
    const snapshot = editedPlayer;
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
        ? `${editor} removed ${removedCount} log ${
            removedCount === 1 ? "entry" : "entries"
          } from ${singleSelected.name} on ${timestamp}`
        : `Player updated by ${editor} on ${timestamp}`;
    try {
      const updated = await patchPlayerById(singleSelected.id, {
        points: snapshot.points,
        log: [...snapshot.log, auditEntry],
        participation: snapshot.participation,
        teamAssignments: snapshot.teamAssignments,
      });
      await refreshPlayers();
      setEditedPlayer((current) =>
        current === snapshot ? updated : current
      );
      push("success", `Saved changes to ${updated.name}`);
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusySave(false);
    }
  };

  const handleRemovePlayer = async (player: Player) => {
    if (!isAdmin) return;
    if (!window.confirm(`Really remove ${player.name}? This is permanent.`))
      return;
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

  const handleRegister = async (
    userId: string,
    game: string,
    team: string
  ) => {
    try {
      await addPlayer({
        userId,
        teamAssignments: game && team ? [{ game, team }] : [],
      });
      push("success", `Registered player`);
      setShowAddModal(false);
    } catch (err) {
      push(
        "error",
        err instanceof Error ? err.message : "Failed to register player"
      );
    }
  };

  const handleCheckIn = async (player: Player) => {
    if (!user?.id) return;
    try {
      await checkIn(player.userId, user.id);
      push("success", `${player.name} checked in`);
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Check-in failed");
    }
  };

  const handleCheckOut = async (player: Player) => {
    try {
      await checkOut(player.userId);
      push("success", `${player.name} checked out`);
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Check-out failed");
    }
  };

  /* ------------------------------- Render ------------------------------- */

  if (rolesLoading)
    return <div className="p-4 text-gray-300">Loading permissions...</div>;
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
        checkedInCount={
          players.filter((player) => checkIns.get(player.userId)?.checkedIn)
            .length
        }
        pendingCheckInCount={
          players.filter((player) => !checkIns.get(player.userId)?.checkedIn)
            .length
        }
        selectedIds={selectedIds}
        checkIns={checkIns}
        query={query}
        onQueryChange={setQuery}
        sortMode={sortMode}
        onSortChange={setSortMode}
        batchMode={batchMode}
        onToggleSelect={toggleSelect}
        onSelectOnly={selectOnly}
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
              isAdmin={isAdmin}
              busy={busyAward}
              onAward={awardPoints}
              checkedInCount={selectedPlayers.filter((p) => checkIns.get(p.userId)?.checkedIn).length}
              selectedCount={selectedPlayers.length}
              lastAward={lastAward?.summary ?? null}
              onUndoLast={() => void undoLastAward()}
              busyUndo={busyUndo}
              assignments={currentStaff?.assignments ?? []}
              activeAssignmentId={activeAssignmentId}
              onSelectAssignment={setActiveAssignmentId}
              pointsInput={pointsInput}
              onPointsInputChange={setPointsInput}
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
            staffAssignment={activeAssignment?.assignmentName ?? "staff"}
            games={games}
            busySave={busySave}
            checkInRecord={checkIns.get(singleSelected.userId) ?? null}
            onSave={() => void saveEdits()}
            onRemove={() => void handleRemovePlayer(singleSelected)}
            onRevoke={() => void revokeMyAssignment(singleSelected)}
            onCheckIn={() => void handleCheckIn(singleSelected)}
            onCheckOut={() => void handleCheckOut(singleSelected)}
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
