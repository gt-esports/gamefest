import React, { useState } from "react";
import { useChallenges } from "../../hooks/useChallenges";
import { useGames } from "../../hooks/useGames";
import { SectionTitle, ToastStack } from "./shared/ui";
import { useToasts } from "./shared/useToasts";
import { dangerBtnClass, inputClass, primaryBtnClass } from "./shared/styles";

type EntityKind = "game" | "challenge";

type PointConfigBuffer = {
  pointsPerAward: string;
  maxPoints: string;
};

const GameEditorPanel: React.FC = () => {
  const { games, loading: gamesLoading, addGame, patchGameByName, removeGameByName } = useGames();
  const {
    challenges,
    loading: challengesLoading,
    addChallenge,
    patchChallengeById,
    removeChallengeByName,
  } = useChallenges();
  const { toasts, push, dismiss } = useToasts();

  const [activeKind, setActiveKind] = useState<EntityKind>("game");
  const [newName, setNewName] = useState("");
  const [newPtsPerAward, setNewPtsPerAward] = useState("10");
  const [newMaxPts, setNewMaxPts] = useState("50");
  // Keyed by game/challenge id → pending edits
  const [editBuffer, setEditBuffer] = useState<Record<string, PointConfigBuffer>>({});

  const isGame = activeKind === "game";
  const list = isGame ? games : challenges;
  const loading = isGame ? gamesLoading : challengesLoading;
  const kindLabel = isGame ? "Game" : "Challenge";

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    const pts = parseInt(newPtsPerAward, 10) || 10;
    const cap = parseInt(newMaxPts, 10) || 50;
    try {
      if (isGame) await addGame(name, pts, cap);
      else await addChallenge({ name, pointsPerAward: pts, maxPoints: cap });
      push("success", `Added ${kindLabel.toLowerCase()}: ${name}`);
      setNewName("");
      setNewPtsPerAward("10");
      setNewMaxPts("50");
    } catch (err) {
      push(
        "error",
        err instanceof Error ? err.message : `Failed to add ${kindLabel.toLowerCase()}.`
      );
    }
  };

  const handleRemove = async (name: string) => {
    if (!window.confirm(`Delete ${kindLabel.toLowerCase()} '${name}'?`)) return;
    try {
      if (isGame) await removeGameByName(name);
      else await removeChallengeByName(name);
      push("success", `Removed ${name}`);
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Failed to remove.");
    }
  };

  const handleSavePointConfig = async (item: { id: string; name: string }) => {
    const buf = editBuffer[item.id];
    if (!buf) return;
    const pts = parseInt(buf.pointsPerAward, 10);
    const cap = parseInt(buf.maxPoints, 10);
    if (isNaN(pts) || isNaN(cap) || pts < 1 || cap < pts) {
      push("error", "Invalid config — pts must be ≥ 1 and cap must be ≥ pts per award.");
      return;
    }
    try {
      if (isGame) {
        await patchGameByName(item.name, { pointsPerAward: pts, maxPoints: cap });
      } else {
        await patchChallengeById(item.id, { pointsPerAward: pts, maxPoints: cap });
      }
      push("success", "Updated point config");
      setEditBuffer((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Failed to update.");
    }
  };

  return (
    <div>
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <SectionTitle eyebrow="Event Content">Games & Challenges</SectionTitle>

      {/* Kind switcher */}
      <div className="mb-5 inline-flex border border-blue-accent/30 bg-dark-navy/40">
        {(
          [
            ["game", `Games (${games.length})`],
            ["challenge", `Challenges (${challenges.length})`],
          ] as const
        ).map(([kind, label]) => (
          <button
            key={kind}
            onClick={() => {
              setActiveKind(kind);
              setNewName("");
            }}
            className={`px-5 py-2 font-bayon text-sm uppercase tracking-[0.25em] transition-colors ${
              activeKind === kind
                ? "bg-blue-bright/10 text-blue-bright"
                : "text-gray-300 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Add row */}
      <div className="mb-5 flex flex-wrap items-center gap-2 border border-blue-accent/20 bg-navy-blue/40 p-4">
        <input
          type="text"
          placeholder={`New ${kindLabel.toLowerCase()} name`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void handleAdd()}
          className={`flex-1 min-w-[160px] ${inputClass}`}
        />
        <label className="flex items-center gap-1 text-xs text-gray-400">
          Pts/award
          <input
            type="number"
            min={1}
            value={newPtsPerAward}
            onChange={(e) => setNewPtsPerAward(e.target.value)}
            className={`w-16 ${inputClass}`}
          />
        </label>
        <label className="flex items-center gap-1 text-xs text-gray-400">
          Cap
          <input
            type="number"
            min={1}
            value={newMaxPts}
            onChange={(e) => setNewMaxPts(e.target.value)}
            className={`w-16 ${inputClass}`}
          />
        </label>
        <button
          disabled={!newName.trim()}
          onClick={() => void handleAdd()}
          className={primaryBtnClass}
        >
          + Add {kindLabel}
        </button>
      </div>

      {/* List */}
      <div className="border border-blue-accent/20 bg-navy-blue/40">
        <div className="grid grid-cols-[auto,1fr,auto,auto,auto] items-center gap-3 border-b border-blue-accent/20 bg-dark-navy/40 px-5 py-3 font-bayon text-xs uppercase tracking-[0.25em] text-blue-bright/80">
          <span>#</span>
          <span>Name</span>
          <span>Pts/Award</span>
          <span>Cap</span>
          <span>Actions</span>
        </div>
        {loading && (
          <div className="p-6 text-center text-sm text-gray-400">Loading…</div>
        )}
        {!loading && list.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-400">
            No {kindLabel.toLowerCase()}s yet. Add one above.
          </div>
        )}
        {list.map((item, idx) => {
          const buf = editBuffer[item.id];
          const ptsValue = buf ? buf.pointsPerAward : String(item.pointsPerAward);
          const capValue = buf ? buf.maxPoints : String(item.maxPoints);
          const dirty = buf !== undefined;

          return (
            <div
              key={item.id}
              className="grid grid-cols-[auto,1fr,auto,auto,auto] items-center gap-3 border-b border-blue-accent/10 px-5 py-3 last:border-b-0 hover:bg-white/[0.03]"
            >
              <span className="w-6 font-bayon text-sm tabular-nums text-gray-500">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="truncate text-base font-medium text-white">
                {item.name}
              </span>
              <input
                type="number"
                min={1}
                value={ptsValue}
                onChange={(e) =>
                  setEditBuffer((prev) => ({
                    ...prev,
                    [item.id]: {
                      pointsPerAward: e.target.value,
                      maxPoints: prev[item.id]?.maxPoints ?? capValue,
                    },
                  }))
                }
                className={`w-16 ${inputClass} ${dirty ? "border-amber-400/60" : ""}`}
              />
              <input
                type="number"
                min={1}
                value={capValue}
                onChange={(e) =>
                  setEditBuffer((prev) => ({
                    ...prev,
                    [item.id]: {
                      pointsPerAward: prev[item.id]?.pointsPerAward ?? ptsValue,
                      maxPoints: e.target.value,
                    },
                  }))
                }
                className={`w-16 ${inputClass} ${dirty ? "border-amber-400/60" : ""}`}
              />
              <div className="flex items-center gap-2">
                {dirty && (
                  <button
                    onClick={() => void handleSavePointConfig(item)}
                    className={`${primaryBtnClass} text-xs`}
                  >
                    Save
                  </button>
                )}
                <button
                  onClick={() => void handleRemove(item.name)}
                  className={dangerBtnClass}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameEditorPanel;
