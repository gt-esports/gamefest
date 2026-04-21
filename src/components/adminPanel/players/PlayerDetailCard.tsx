import React from "react";
import type { CheckInRecord } from "../../../hooks/useCheckIn";
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
  checkInRecord: CheckInRecord | null;
  onSave: () => void;
  onRemove: () => void;
  onRevoke: () => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
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
  checkInRecord,
  onSave,
  onRemove,
  onRevoke,
  onCheckIn,
  onCheckOut,
}) => {
  const showRevoke =
    !isAdmin &&
    player.participation.includes(staffAssignment) &&
    player.log.some((log) => log.includes(`[${staffAssignment}] gave ${player.name}`));
  const checkedInAtLabel = checkInRecord?.checkedInAt
    ? new Date(checkInRecord.checkedInAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  const toggle = (s: Exclude<DetailSection, null>) =>
    onOpenSection(openSection === s ? null : s);

  return (
    <div className="border border-blue-accent/20 bg-navy-blue/40">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-blue-accent/20 bg-dark-navy/40 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white">{player.name}</h3>
          <p className="mt-1 font-bayon text-xs uppercase tracking-[0.25em] text-gray-400">
            Player Profile
          </p>

          {checkInRecord?.checkedIn ? (
            <div className="mt-4 inline-flex max-w-xl flex-col gap-3 border border-green-400/30 bg-green-400/10 px-4 py-3 shadow-[0_0_24px_rgba(74,222,128,0.14)]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                <span className="font-bayon text-xs uppercase tracking-[0.22em] text-green-300">
                  Checked In
                </span>
              </div>
              <p className="text-sm text-green-50/90">
                {checkedInAtLabel
                  ? `Checked in on ${checkedInAtLabel}.`
                  : "Player has already been checked in."}
              </p>
              <button
                onClick={onCheckOut}
                className="w-fit text-xs font-semibold text-green-200 underline decoration-green-300/40 underline-offset-4 transition-colors hover:text-white"
              >
                Undo Check-In
              </button>
            </div>
          ) : (
            <div className="mt-4 flex max-w-xl flex-col gap-3 border border-amber-300/40 bg-amber-300/10 px-4 py-4 shadow-[0_0_30px_rgba(252,211,77,0.12)]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                <span className="font-bayon text-xs uppercase tracking-[0.22em] text-amber-200">
                  Awaiting Event Check-In
                </span>
              </div>
              <p className="text-sm text-amber-50/90">
                This player still needs to be checked in before staff can award
                points.
              </p>
              <button
                onClick={onCheckIn}
                className="inline-flex w-full items-center justify-center border border-amber-300 bg-amber-300 px-4 py-3 font-bayon text-sm uppercase tracking-[0.28em] text-dark-bg transition-all hover:shadow-[0_0_24px_rgba(252,211,77,0.35)] sm:w-auto sm:min-w-[220px]"
              >
                Check In Player
              </button>
            </div>
          )}
        </div>
        <div className="text-left sm:text-right">
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
