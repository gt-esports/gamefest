import React, { useState } from "react";
import {
  resetAllCheckInStatuses,
  useCheckInRoster,
} from "../../hooks/useCheckIn";
import { dangerBtnClass } from "./shared/styles";
import { SectionTitle, ToastStack } from "./shared/ui";
import { useToasts } from "./shared/useToasts";

const SettingsPanel: React.FC = () => {
  const { checkIns, refresh } = useCheckInRoster();
  const { toasts, push, dismiss } = useToasts();
  const [busyReset, setBusyReset] = useState(false);

  const checkedInCount = Array.from(checkIns.values()).filter(
    (record) => record.checkedIn
  ).length;

  const handleResetCheckIns = async () => {
    const confirmed = window.confirm(
      "Reset check-in status for all registered players? This will clear every current check-in."
    );
    if (!confirmed) return;

    setBusyReset(true);
    try {
      const resetCount = await resetAllCheckInStatuses();
      await refresh();
      push(
        "success",
        resetCount > 0
          ? `Reset check-in status for ${resetCount} player${
              resetCount === 1 ? "" : "s"
            }`
          : "No checked-in players needed to be reset."
      );
    } catch (err) {
      push(
        "error",
        err instanceof Error ? err.message : "Failed to reset check-in statuses."
      );
    } finally {
      setBusyReset(false);
    }
  };

  return (
    <div>
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <SectionTitle eyebrow="Administration">Settings</SectionTitle>

      <div className="border border-blue-accent/20 bg-navy-blue/40">
        <div className="border-b border-blue-accent/20 bg-dark-navy/40 px-5 py-4">
          <h3 className="font-zuume text-2xl font-bold uppercase tracking-wider text-white">
            Check-In Controls
          </h3>
          <p className="mt-2 max-w-2xl text-sm text-gray-300">
            Reset event check-in status for registered players without changing
            player records, points, or registrations.
          </p>
        </div>

        <div className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="font-bayon text-xs uppercase tracking-[0.25em] text-blue-bright/80">
              Currently Checked In
            </div>
            <div className="mt-1 text-3xl font-semibold tabular-nums text-white">
              {checkedInCount}
            </div>
          </div>

          <button
            disabled={busyReset}
            onClick={() => void handleResetCheckIns()}
            className={dangerBtnClass}
          >
            {busyReset ? "Resetting..." : "Reset All Check-Ins"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
