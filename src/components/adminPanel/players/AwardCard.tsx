import React from "react";
import { dangerBtnClass, primaryBtnClass } from "../shared/styles";

const QUICK_AMOUNTS = [1, 5, 10, 25];

type AwardCardProps = {
  staffAssignment: string;
  isAdmin: boolean;
  busy: boolean;
  pointsInput: string;
  onPointsInputChange: (v: string) => void;
  onAward: (amount: number) => void;
};

const AwardCard: React.FC<AwardCardProps> = ({
  staffAssignment,
  isAdmin,
  busy,
  pointsInput,
  onPointsInputChange,
  onAward,
}) => {
  const submitCustom = (sign: 1 | -1) => {
    const v = parseInt(pointsInput, 10);
    if (!Number.isNaN(v)) onAward(sign * Math.abs(v));
  };

  return (
    <div className="border border-blue-bright/30 bg-gradient-to-br from-navy-blue/80 to-card-bg/80 p-5 shadow-[0_0_30px_rgba(0,212,255,0.08)]">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="font-zuume text-2xl font-bold uppercase tracking-wider text-white">
          Award Points
        </h3>
        {!isAdmin && (
          <span className="text-xs font-semibold text-blue-bright/80">
            Assignment: <span className="text-blue-bright">{staffAssignment}</span>
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {QUICK_AMOUNTS.map((amt) => (
          <button
            key={amt}
            disabled={busy}
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
          onChange={(e) => onPointsInputChange(e.target.value)}
          className="w-28 border border-blue-accent/40 bg-dark-bg/60 px-3 py-3 text-center text-base font-semibold tabular-nums text-white placeholder-gray-500 focus:border-blue-bright focus:outline-none"
        />
        <button
          disabled={busy || pointsInput === ""}
          onClick={() => submitCustom(1)}
          className={primaryBtnClass}
        >
          Award
        </button>
        {isAdmin && (
          <button
            disabled={busy || pointsInput === ""}
            onClick={() => submitCustom(-1)}
            className={dangerBtnClass}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default AwardCard;
