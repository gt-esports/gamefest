import React from "react";
import type { StaffAssignment } from "../../../schemas/StaffSchema";
import { dangerBtnClass, primaryBtnClass } from "../shared/styles";

export type LastAwardSummary = {
  amount: number;
  tag: string;
  playerCount: number;
  playerNamePreview: string;
};

type AwardCardProps = {
  isAdmin: boolean;
  busy: boolean;
  onAward: (amount: number) => void;
  checkedInCount: number;
  selectedCount: number;
  lastAward?: LastAwardSummary | null;
  onUndoLast?: () => void;
  busyUndo?: boolean;
  // Staff-only: list of assignments + which one is active
  assignments?: StaffAssignment[];
  activeAssignmentId?: string | null;
  onSelectAssignment?: (id: string) => void;
  pointsInput?: string;
  onPointsInputChange?: (v: string) => void;
};

const UndoLastBanner: React.FC<{
  last: LastAwardSummary;
  busyUndo: boolean;
  onUndoLast: () => void;
}> = ({ last, busyUndo, onUndoLast }) => (
  <div className="mt-3 flex items-center justify-between gap-3 border border-amber-400/40 bg-amber-400/10 px-3 py-2">
    <div className="min-w-0 text-xs text-amber-200">
      <span className="font-semibold">Last award:</span>{" "}
      <span className="font-bold text-amber-100">{last.amount} pts</span>
      {" to "}
      <span className="truncate">{last.playerNamePreview}</span>
      {last.playerCount > 1 && <span> +{last.playerCount - 1} more</span>}
      {last.tag && <span className="text-amber-300/80"> · {last.tag}</span>}
    </div>
    <button
      disabled={busyUndo}
      onClick={onUndoLast}
      className="shrink-0 border border-amber-300/60 bg-amber-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-200 transition-colors hover:bg-amber-300/20 disabled:opacity-50"
    >
      {busyUndo ? "Undoing…" : "Undo"}
    </button>
  </div>
);

const AwardCard: React.FC<AwardCardProps> = ({
  isAdmin,
  busy,
  onAward,
  checkedInCount,
  selectedCount,
  lastAward = null,
  onUndoLast,
  busyUndo = false,
  assignments = [],
  activeAssignmentId = null,
  onSelectAssignment,
  pointsInput = "",
  onPointsInputChange,
}) => {
  const canUndo = !!lastAward && !!onUndoLast;
  const noneCheckedIn = checkedInCount === 0;
  const someNotCheckedIn = checkedInCount < selectedCount;
  const parsedInput = parseInt(pointsInput, 10);
  const hasCustomAmount = !Number.isNaN(parsedInput) && parsedInput !== 0;
  const customAmount = hasCustomAmount ? Math.abs(parsedInput) : 0;

  const activeAssignment =
    assignments.find((a) => a.id === activeAssignmentId) ?? assignments[0] ?? null;

  const checkInWarning = noneCheckedIn ? (
    <div className="mb-4 rounded border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-300">
      {selectedCount === 1
        ? "This player is not checked in. Check them in before awarding points."
        : "None of the selected players are checked in. Check them in before awarding points."}
    </div>
  ) : someNotCheckedIn ? (
    <div className="mb-4 rounded border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
      <span className="font-semibold">
        {selectedCount - checkedInCount} player
        {selectedCount - checkedInCount !== 1 ? "s" : ""}
      </span>{" "}
      not checked in — they will be skipped.
    </div>
  ) : null;

  const renderCustomControls = (allowRemove: boolean) => (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        placeholder={allowRemove ? "Custom amount" : "Award amount"}
        value={pointsInput}
        onChange={(e) => onPointsInputChange?.(e.target.value)}
        className="w-32 border border-blue-accent/40 bg-dark-bg/60 px-3 py-3 text-center text-base font-semibold tabular-nums text-white placeholder-gray-500 focus:border-blue-bright focus:outline-none"
      />
      <button
        disabled={busy || noneCheckedIn || !hasCustomAmount}
        onClick={() => onAward(customAmount)}
        className={primaryBtnClass}
      >
        Award
      </button>
      {allowRemove && (
        <button
          disabled={busy || noneCheckedIn || !hasCustomAmount}
          onClick={() => onAward(-customAmount)}
          className={dangerBtnClass}
        >
          Remove
        </button>
      )}
    </div>
  );

  const renderStaffCustomControls = () => (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        min={1}
        placeholder="Enter points"
        value={pointsInput}
        onChange={(e) => onPointsInputChange?.(e.target.value)}
        className="w-36 border border-blue-accent/40 bg-dark-bg/60 px-3 py-3 text-center text-base font-semibold tabular-nums text-white placeholder-gray-500 focus:border-blue-bright focus:outline-none"
      />
      <button
        disabled={busy || noneCheckedIn || !hasCustomAmount}
        onClick={() => onAward(customAmount)}
        className={primaryBtnClass}
      >
        Award Custom Points
      </button>
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="border border-blue-bright/30 bg-gradient-to-br from-navy-blue/80 to-card-bg/80 p-5 shadow-[0_0_30px_rgba(0,212,255,0.08)]">
        <h3 className="mb-4 font-zuume text-2xl font-bold uppercase tracking-wider text-white">
          Award Points
        </h3>

        {assignments.length === 0 ? (
          <p className="rounded border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-300">
            You have no game or challenge assignment. Contact an admin to be
            assigned.
          </p>
        ) : (
          <div className="space-y-4">
            {checkInWarning}

            {/* Assignment selector — only shown when 2+ assignments */}
            {assignments.length > 1 && (
              <div className="border border-blue-accent/20 bg-dark-navy/40 px-4 py-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-bright/70">
                  Award Points For
                </p>
                <div className="flex flex-wrap gap-2">
                  {assignments.map((a) => {
                    const isActive = a.id === (activeAssignment?.id ?? null);
                    return (
                      <button
                        key={a.id}
                        onClick={() => onSelectAssignment?.(a.id)}
                        className={`border px-3 py-1.5 text-sm font-semibold transition-colors ${
                          isActive
                            ? "border-blue-bright bg-blue-bright/20 text-blue-bright"
                            : "border-blue-accent/30 bg-transparent text-gray-300 hover:border-blue-bright/60 hover:text-white"
                        }`}
                      >
                        {a.assignmentName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeAssignment && (
              <div className="border border-blue-accent/20 bg-dark-navy/40 px-4 py-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-bright/70">
                  {assignments.length === 1 ? "Your Assignment" : "Selected Assignment"}
                </p>
                <p className="text-lg font-bold text-white">
                  {activeAssignment.assignmentName}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Custom awards are tracked against this assignment and capped at{" "}
                  <span className="font-semibold text-blue-bright">
                    {activeAssignment.maxPoints} pts
                  </span>{" "}
                  per player.
                </p>
              </div>
            )}

            <div className="border border-blue-accent/20 bg-dark-navy/40 px-4 py-4">
              <div className="mb-3">
                <p className="font-bayon text-xs uppercase tracking-[0.25em] text-blue-bright/80">
                  Custom Award Amount
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Enter any positive amount to award points against your assigned
                  game or challenge.
                </p>
              </div>
              {renderStaffCustomControls()}
            </div>
            {canUndo && lastAward && onUndoLast && (
              <UndoLastBanner
                last={lastAward}
                busyUndo={busyUndo}
                onUndoLast={onUndoLast}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border border-blue-bright/30 bg-gradient-to-br from-navy-blue/80 to-card-bg/80 p-5 shadow-[0_0_30px_rgba(0,212,255,0.08)]">
      <h3 className="mb-4 font-zuume text-2xl font-bold uppercase tracking-wider text-white">
        Award Points
        <span className="ml-3 text-sm font-normal normal-case tracking-normal text-amber-300">
          Admin
        </span>
      </h3>

      {checkInWarning}
      {renderCustomControls(true)}
    </div>
  );
};

export default AwardCard;
