import React, { useState } from "react";
import { Field } from "../shared/ui";
import { ghostBtnClass, inputClass, primaryBtnClass } from "../shared/styles";

type AddPlayerModalProps = {
  games: string[];
  onClose: () => void;
  onSubmit: (name: string, game: string, team: string) => Promise<void>;
};

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({ games, onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [game, setGame] = useState("");
  const [team, setTeam] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setBusy(true);
    await onSubmit(name.trim(), game, team);
    setBusy(false);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border border-blue-bright/40 bg-navy-blue shadow-[0_0_60px_rgba(0,212,255,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-blue-accent/20 bg-dark-navy/60 px-5 py-4">
          <h3 className="font-zuume text-2xl font-bold uppercase tracking-wider text-white">
            Register Player
          </h3>
          <button onClick={onClose} className="text-gray-300 hover:text-red-300">
            ✕
          </button>
        </div>
        <div className="space-y-4 p-5">
          <Field label="Player Name *">
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleSubmit()}
              placeholder="e.g. ShadowStrike"
              className={inputClass}
            />
          </Field>
          <Field label="Game (optional)">
            <select
              value={game}
              onChange={(e) => setGame(e.target.value)}
              className={inputClass}
            >
              <option value="">— None —</option>
              {games.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Team (optional)">
            <input
              type="text"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="Team name"
              className={inputClass}
            />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-blue-accent/20 bg-dark-navy/60 px-5 py-3">
          <button onClick={onClose} className={ghostBtnClass}>
            Cancel
          </button>
          <button
            disabled={busy || !name.trim()}
            onClick={() => void handleSubmit()}
            className={primaryBtnClass}
          >
            {busy ? "Registering…" : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPlayerModal;
