import React, { useEffect, useState } from "react";
import {
  resetAllCheckInStatuses,
  useCheckInRoster,
} from "../../hooks/useCheckIn";
import { dangerBtnClass } from "./shared/styles";
import { inputClass, labelClass, primaryBtnClass } from "./shared/styles";
import { SectionTitle, ToastStack } from "./shared/ui";
import { useToasts } from "./shared/useToasts";
import { useSeasons } from "../../hooks/useSeasons";
import ArchivedSeasonDetails from "./ArchivedSeasonDetails";

const SettingsPanel: React.FC = () => {
  const { checkIns, refresh } = useCheckInRoster();
  const { toasts, push, dismiss } = useToasts();
  const [busyReset, setBusyReset] = useState(false);
  const { seasons, loading: seasonsLoading, error: seasonsError, saveActive } = useSeasons();
  const [tournamentSlug, setTournamentSlug] = useState("");
  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(null);
  const [busySeason, setBusySeason] = useState(false);
  const activeSeason = seasons.find((season) => season.is_active);
  const archivedSeasons = seasons.filter((season) => !season.is_active);
  const selectedArchive = archivedSeasons.find((season) => season.id === selectedArchiveId);

  useEffect(() => {
    if (activeSeason) {
      setTournamentSlug(activeSeason.tournament_slug ?? "");
    }
  }, [activeSeason]);

  const handleSaveSeason = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusySeason(true);
    try {
      if (!activeSeason) throw new Error("No active season is configured.");
      await saveActive(activeSeason.id, tournamentSlug);
      push("success", "Active season updated.");
    } catch (cause) {
      push("error", cause instanceof Error ? cause.message : "Could not update season.");
    } finally {
      setBusySeason(false);
    }
  };

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

      <div className="mb-6 border border-blue-accent/20 bg-navy-blue/40 p-5">
        <h3 className="font-zuume text-2xl font-bold uppercase tracking-wider text-white">Seasons</h3>
        <p className="mt-2 text-sm text-gray-300">Update the active season's start.gg tournament. Season names and new seasons are managed outside this panel. Past seasons are view-only.</p>
        {seasonsLoading && <p className="mt-4 text-gray-300">Loading seasons...</p>}
        {seasonsError && <p role="alert" className="mt-4 text-red-300">{seasonsError}</p>}
        {!seasonsLoading && activeSeason && (
          <form className="mt-5 space-y-4" onSubmit={(event) => void handleSaveSeason(event)}>
            <h4 className="font-bayon text-lg text-blue-bright">Active: {activeSeason.name}</h4>
            <p className="text-xs text-gray-400">Season slug: {activeSeason.slug}</p>
            <label className={labelClass}>Start.gg tournament slug
              <input className={inputClass} value={tournamentSlug} placeholder="gamefest-2027"
                onChange={(event) => setTournamentSlug(event.target.value)} />
            </label>
            <button className={primaryBtnClass} disabled={busySeason} type="submit">Save Active Season</button>
          </form>
        )}
        {archivedSeasons.length > 0 && (
          <div className="mt-6 border-t border-blue-accent/20 pt-4">
            <h4 className="font-bayon text-lg text-white">Past seasons · read only</h4>
            <ul className="mt-2 flex flex-wrap gap-2">
              {archivedSeasons.map((season) => (
                <li key={season.id}>
                  <button type="button" aria-expanded={selectedArchiveId === season.id}
                    onClick={() => setSelectedArchiveId(selectedArchiveId === season.id ? null : season.id)}
                    className={`${primaryBtnClass} ${selectedArchiveId === season.id ? "bg-blue-bright/20" : ""}`}>
                    {season.name}
                  </button>
                </li>
              ))}
            </ul>
            {selectedArchive && <ArchivedSeasonDetails key={selectedArchive.id} season={selectedArchive} />}
          </div>
        )}
      </div>

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
