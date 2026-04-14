import React, { useState } from "react";
import { useChallenges } from "../../hooks/useChallenges";
import { useGames } from "../../hooks/useGames";
import { SectionTitle, ToastStack } from "./shared/ui";
import { useToasts } from "./shared/useToasts";
import { dangerBtnClass, inputClass, primaryBtnClass } from "./shared/styles";

type EntityKind = "game" | "challenge";

const GameEditorPanel: React.FC = () => {
  const { games, loading: gamesLoading, addGame, removeGameByName } = useGames();
  const {
    challenges,
    loading: challengesLoading,
    addChallenge,
    removeChallengeByName,
  } = useChallenges();
  const { toasts, push, dismiss } = useToasts();

  const [activeKind, setActiveKind] = useState<EntityKind>("game");
  const [newValue, setNewValue] = useState("");

  const isGame = activeKind === "game";
  const list = isGame ? games : challenges;
  const loading = isGame ? gamesLoading : challengesLoading;
  const kindLabel = isGame ? "Game" : "Challenge";

  const handleAdd = async () => {
    const name = newValue.trim();
    if (!name) return;
    try {
      if (isGame) await addGame(name);
      else await addChallenge({ name });
      push("success", `Added ${kindLabel.toLowerCase()}: ${name}`);
      setNewValue("");
    } catch (err) {
      push("error", err instanceof Error ? err.message : `Failed to add ${kindLabel.toLowerCase()}.`);
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
              setNewValue("");
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
      <div className="mb-5 flex items-center gap-2 border border-blue-accent/20 bg-navy-blue/40 p-4">
        <input
          type="text"
          placeholder={`New ${kindLabel.toLowerCase()} name`}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void handleAdd()}
          className={`flex-1 ${inputClass}`}
        />
        <button
          disabled={!newValue.trim()}
          onClick={() => void handleAdd()}
          className={primaryBtnClass}
        >
          + Add {kindLabel}
        </button>
      </div>

      {/* List */}
      <div className="border border-blue-accent/20 bg-navy-blue/40">
        <div className="grid grid-cols-[auto,1fr,auto] items-center gap-4 border-b border-blue-accent/20 bg-dark-navy/40 px-5 py-3 font-bayon text-xs uppercase tracking-[0.25em] text-blue-bright/80">
          <span>#</span>
          <span>Name</span>
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
        {list.map((item, idx) => (
          <div
            key={("id" in item && item.id) || item.name}
            className="grid grid-cols-[auto,1fr,auto] items-center gap-4 border-b border-blue-accent/10 px-5 py-3 last:border-b-0 hover:bg-white/[0.03]"
          >
            <span className="w-6 font-bayon text-sm tabular-nums text-gray-500">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <span className="truncate text-base font-medium text-white">{item.name}</span>
            <button
              onClick={() => void handleRemove(item.name)}
              className={dangerBtnClass}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameEditorPanel;
