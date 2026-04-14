import React from "react";
import type { Player } from "../../../hooks/usePlayers";
import type { Game } from "../../../schemas/GamesSchema";
import { dangerBtnClass, primaryBtnClass } from "../shared/styles";
import Section from "./Section";

export type DetailSection = null | "logs" | "participation" | "teams";

type PlayerDetailCardProps = {
  player: Player;
  edited: Player;
  onEdit: (next: Player) => void;
  openSection: DetailSection;
  onOpenSection: (s: DetailSection) => void;
  isAdmin: boolean;
  staffAssignment: string;
  games: Game[];
  busySave: boolean;
  onSave: () => void;
  onRemove: () => void;
  onRevoke: () => void;
};

const PlayerDetailCard: React.FC<PlayerDetailCardProps> = ({
  player,
  edited,
  onEdit,
  openSection,
  onOpenSection,
  isAdmin,
  staffAssignment,
  games,
  busySave,
  onSave,
  onRemove,
  onRevoke,
}) => {
  const showRevoke =
    !isAdmin &&
    player.participation.includes(staffAssignment) &&
    player.log.some((log) => log.includes(`[${staffAssignment}] gave ${player.name}`));

  const toggle = (s: Exclude<DetailSection, null>) =>
    onOpenSection(openSection === s ? null : s);

  return (
    <div className="border border-blue-accent/20 bg-navy-blue/40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-accent/20 bg-dark-navy/40 px-5 py-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white">{player.name}</h3>
          <p className="mt-1 font-bayon text-xs uppercase tracking-[0.25em] text-gray-400">
            Player Profile
          </p>
        </div>
        <div className="text-right">
          <div className="font-zuume text-4xl font-extrabold tabular-nums text-blue-bright">
            {player.points.toLocaleString()}
          </div>
          <div className="font-bayon text-xs uppercase tracking-[0.3em] text-gray-400">
            Points
          </div>
        </div>
      </div>

      {showRevoke && (
        <div className="border-b border-blue-accent/20 bg-amber-400/5 px-5 py-2">
          <button
            onClick={onRevoke}
            className="text-xs font-semibold text-amber-300 hover:text-amber-200"
          >
            ⟲ Revoke my '{staffAssignment}' award
          </button>
        </div>
      )}

      <div className="divide-y divide-blue-accent/10">
        {/* Logs */}
        <Section
          label="Logs"
          count={edited.log.length}
          open={openSection === "logs"}
          onToggle={() => toggle("logs")}
        >
          {edited.log.length === 0 && (
            <p className="text-sm text-gray-400">No activity yet.</p>
          )}
          <ul className="space-y-1.5">
            {edited.log.map((entry, idx) => (
              <li
                key={`${entry}-${idx}`}
                className="flex items-start justify-between gap-3 border-l-2 border-blue-accent/40 bg-dark-bg/40 px-3 py-2 text-sm text-gray-100"
              >
                <span className="leading-relaxed">{entry}</span>
                {isAdmin && (
                  <button
                    onClick={() =>
                      onEdit({
                        ...edited,
                        log: edited.log.filter((_, i) => i !== idx),
                      })
                    }
                    className="shrink-0 text-xs font-semibold text-red-300 hover:text-red-200"
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Section>

        {/* Participation */}
        <Section
          label="Participation"
          count={edited.participation.length}
          open={openSection === "participation"}
          onToggle={() => toggle("participation")}
        >
          {edited.participation.length === 0 && (
            <p className="text-sm text-gray-400">None recorded.</p>
          )}
          <div className="flex flex-wrap gap-2">
            {edited.participation.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 border border-blue-accent/30 bg-dark-bg/40 px-3 py-1.5"
              >
                {isAdmin ? (
                  <input
                    type="text"
                    value={entry}
                    onChange={(e) => {
                      const updated = [...edited.participation];
                      updated[idx] = e.target.value;
                      onEdit({ ...edited, participation: updated });
                    }}
                    className="w-36 bg-transparent text-sm text-white focus:outline-none"
                  />
                ) : (
                  <span className="text-sm text-gray-100">{entry}</span>
                )}
                {isAdmin && (
                  <button
                    onClick={() =>
                      onEdit({
                        ...edited,
                        participation: edited.participation.filter((_, i) => i !== idx),
                      })
                    }
                    className="text-red-300 hover:text-red-200"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          {isAdmin && (
            <button
              onClick={() =>
                onEdit({ ...edited, participation: [...edited.participation, ""] })
              }
              className="mt-3 text-sm font-semibold text-blue-bright hover:text-white"
            >
              + Add entry
            </button>
          )}
        </Section>

        {/* Teams */}
        <Section
          label="Teams"
          count={edited.teamAssignments.length}
          open={openSection === "teams"}
          onToggle={() => toggle("teams")}
        >
          {edited.teamAssignments.length === 0 && (
            <p className="text-sm text-gray-400">No teams assigned.</p>
          )}
          <div className="space-y-2">
            {edited.teamAssignments.map((a, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select
                  value={a.game}
                  onChange={(e) => {
                    const updated = [...edited.teamAssignments];
                    updated[idx] = { ...updated[idx], game: e.target.value };
                    onEdit({ ...edited, teamAssignments: updated });
                  }}
                  className="flex-1 border border-blue-accent/40 bg-dark-bg/60 px-3 py-2 text-sm text-white focus:border-blue-bright focus:outline-none"
                >
                  <option value="">Select game</option>
                  {games.map((g) => (
                    <option key={g.name} value={g.name}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <input
                  value={a.team}
                  onChange={(e) => {
                    const updated = [...edited.teamAssignments];
                    updated[idx] = { ...updated[idx], team: e.target.value };
                    onEdit({ ...edited, teamAssignments: updated });
                  }}
                  placeholder="Team name"
                  className="flex-1 border border-blue-accent/40 bg-dark-bg/60 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-bright focus:outline-none"
                />
                <button
                  onClick={() =>
                    onEdit({
                      ...edited,
                      teamAssignments: edited.teamAssignments.filter((_, i) => i !== idx),
                    })
                  }
                  className="text-red-300 hover:text-red-200"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() =>
              onEdit({
                ...edited,
                teamAssignments: [...edited.teamAssignments, { game: "", team: "" }],
              })
            }
            className="mt-3 text-sm font-semibold text-blue-bright hover:text-white"
          >
            + Add team
          </button>
        </Section>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-blue-accent/20 bg-dark-navy/40 px-5 py-3">
        <button disabled={busySave} onClick={onSave} className={primaryBtnClass}>
          {busySave ? "Saving…" : "Save Changes"}
        </button>
        {isAdmin && (
          <button onClick={onRemove} className={dangerBtnClass}>
            Remove Player
          </button>
        )}
      </div>
    </div>
  );
};

export default PlayerDetailCard;
