import React from "react";
import { dangerBtnClass, primaryBtnClass } from "../shared/styles";

const QUICK_AMOUNTS = [1, 5, 10, 25];

type AwardCardProps = {
  isAdmin: boolean;
  busy: boolean;
  onAward: (amount?: number) => void;
  // Staff-mode props (used when isAdmin=false)
  assignmentName?: string | null;
  pointsPerAward?: number | null;
  maxPoints?: number | null;
  // Admin-mode props (used when isAdmin=true)
  games?: string[];
  challenges?: string[];
  selectedReason?: string;
  onSelectedReasonChange?: (v: string) => void;
  pointsInput?: string;
  onPointsInputChange?: (v: string) => void;
};

const AwardCard: React.FC<AwardCardProps> = ({
  isAdmin,
  busy,
  onAward,
  assignmentName,
  pointsPerAward,
  maxPoints,
  games = [],
  challenges = [],
  selectedReason = "",
  onSelectedReasonChange,
  pointsInput = "",
  onPointsInputChange,
}) => {
  if (!isAdmin) {
    // ── Staff mode ────────────────────────────────────────────
    const hasAssignment = !!assignmentName && pointsPerAward !== null && pointsPerAward !== undefined;

    return (
      <div className="border border-blue-bright/30 bg-gradient-to-br from-navy-blue/80 to-card-bg/80 p-5 shadow-[0_0_30px_rgba(0,212,255,0.08)]">
        <h3 className="mb-4 font-zuume text-2xl font-bold uppercase tracking-wider text-white">
          Award Points
        </h3>

        {!hasAssignment ? (
          <p className="rounded border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-300">
            You have no game or challenge assignment. Contact an admin to be assigned.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="border border-blue-accent/20 bg-dark-navy/40 px-4 py-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-bright/70">
                Your Assignment
              </p>
              <p className="text-lg font-bold text-white">{assignmentName}</p>
              <p className="mt-1 text-xs text-gray-400">
                <span className="font-semibold text-blue-bright">{pointsPerAward} pts</span> per award
                {" · "}cap: <span className="font-semibold text-blue-bright">{maxPoints} pts</span> per player
              </p>
            </div>
            <button
              disabled={busy}
              onClick={() => onAward()}
              className={`w-full py-4 font-zuume text-xl font-bold uppercase tracking-wider ${primaryBtnClass} disabled:opacity-50`}
            >
              {busy ? "Awarding…" : `Award ${pointsPerAward} pts`}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Admin mode ──────────────────────────────────────────────
  const noReason = selectedReason === "";

  const submitCustom = (sign: 1 | -1) => {
    const v = parseInt(pointsInput, 10);
    if (!Number.isNaN(v)) onAward(sign * Math.abs(v));
  };

  return (
    <div className="border border-blue-bright/30 bg-gradient-to-br from-navy-blue/80 to-card-bg/80 p-5 shadow-[0_0_30px_rgba(0,212,255,0.08)]">
      <h3 className="mb-4 font-zuume text-2xl font-bold uppercase tracking-wider text-white">
        Award Points
        <span className="ml-3 text-sm font-normal normal-case tracking-normal text-amber-300">Admin</span>
      </h3>

      <div className="mb-3">
        <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-bright/80">
          Reason — Game / Challenge
          <span className="font-bold text-red-400" aria-hidden="true">*</span>
          {noReason && (
            <span className="ml-auto font-semibold normal-case tracking-normal text-amber-400">
              Required
            </span>
          )}
        </label>
        <select
          value={selectedReason}
          onChange={(e) => onSelectedReasonChange?.(e.target.value)}
          className={`w-full border bg-dark-bg/60 px-3 py-2 text-base font-semibold text-white focus:outline-none ${
            noReason
              ? "border-amber-400/60 focus:border-amber-400"
              : "border-blue-accent/40 focus:border-blue-bright"
          }`}
        >
          <option value="">Select a Game or Challenge…</option>
          {games.length > 0 && (
            <optgroup label="Games">
              {games.map((g) => (
                <option key={`game-${g}`} value={`Game: ${g}`}>
                  {g}
                </option>
              ))}
            </optgroup>
          )}
          {challenges.length > 0 && (
            <optgroup label="Challenges">
              {challenges.map((c) => (
                <option key={`chal-${c}`} value={`Challenge: ${c}`}>
                  {c}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {QUICK_AMOUNTS.map((amt) => (
          <button
            key={amt}
            disabled={busy || noReason}
            onClick={() => onAward(amt)}
            className="min-w-[64px] border border-blue-bright/50 bg-blue-bright/10 py-3 text-lg font-bold text-blue-bright transition-all hover:border-blue-bright hover:bg-blue-bright/20 hover:shadow-[0_0_16px_rgba(0,212,255,0.5)] disabled:opacity-50"
          >
            +{amt}
          </button>
        ))}
        <div className="mx-2 h-10 w-px bg-blue-accent/30" />
        <input
          type="number"
          placeholder="Custom"
          value={pointsInput}
          onChange={(e) => onPointsInputChange?.(e.target.value)}
          className="w-28 border border-blue-accent/40 bg-dark-bg/60 px-3 py-3 text-center text-base font-semibold tabular-nums text-white placeholder-gray-500 focus:border-blue-bright focus:outline-none"
        />
        <button
          disabled={busy || pointsInput === "" || noReason}
          onClick={() => submitCustom(1)}
          className={primaryBtnClass}
        >
          Award
        </button>
        <button
          disabled={busy || pointsInput === "" || noReason}
          onClick={() => submitCustom(-1)}
          className={dangerBtnClass}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default AwardCard;
