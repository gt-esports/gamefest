import React, { useEffect, useState } from "react";
import {
  resetAllCheckInStatuses,
  useCheckInRoster,
} from "../../hooks/useCheckIn";
import { dangerBtnClass } from "./shared/styles";
import { inputClass, labelClass, primaryBtnClass } from "./shared/styles";
import { SectionTitle, ToastStack } from "./shared/ui";
import { useToasts } from "./shared/useToasts";
import { useSeasons, type SeasonDetails } from "../../hooks/useSeasons";

const emptyDetails: SeasonDetails = { name: "", startsOn: null, endsOn: null, tournamentSlug: null };

const SeasonFields = ({ details, onChange }: {
  details: SeasonDetails;
  onChange: (details: SeasonDetails) => void;
}) => (
  <div className="grid gap-4 sm:grid-cols-2">
    <label className={labelClass}>Name
      <input className={inputClass} required value={details.name}
        onChange={(event) => onChange({ ...details, name: event.target.value })} />
    </label>
    <label className={labelClass}>Start.gg tournament slug
      <input className={inputClass} value={details.tournamentSlug ?? ""}
        placeholder="gamefest-2027"
        onChange={(event) => onChange({ ...details, tournamentSlug: event.target.value })} />
    </label>
    <label className={labelClass}>Start date
      <input className={inputClass} type="date" value={details.startsOn ?? ""}
        onChange={(event) => onChange({ ...details, startsOn: event.target.value || null })} />
    </label>
    <label className={labelClass}>End date
      <input className={inputClass} type="date" min={details.startsOn ?? undefined}
        value={details.endsOn ?? ""}
        onChange={(event) => onChange({ ...details, endsOn: event.target.value || null })} />
    </label>
  </div>
);

const SettingsPanel: React.FC = () => {
  const { checkIns, refresh } = useCheckInRoster();
  const { toasts, push, dismiss } = useToasts();
  const [busyReset, setBusyReset] = useState(false);
  const { seasons, loading: seasonsLoading, error: seasonsError, saveActive, startNew } = useSeasons();
  const [activeDetails, setActiveDetails] = useState<SeasonDetails>(emptyDetails);
  const [newDetails, setNewDetails] = useState<SeasonDetails>(emptyDetails);
  const [newSlug, setNewSlug] = useState("");
  const [busySeason, setBusySeason] = useState(false);
  const activeSeason = seasons.find((season) => season.is_active);

  useEffect(() => {
    if (activeSeason) {
      setActiveDetails({
        name: activeSeason.name,
        startsOn: activeSeason.starts_on,
        endsOn: activeSeason.ends_on,
        tournamentSlug: activeSeason.tournament_slug,
      });
    }
  }, [activeSeason]);

  const handleSaveSeason = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusySeason(true);
    try {
      if (!activeSeason) throw new Error("No active season is configured.");
      await saveActive(activeSeason.id, activeDetails);
      push("success", "Active season updated.");
    } catch (cause) {
      push("error", cause instanceof Error ? cause.message : "Could not update season.");
    } finally {
      setBusySeason(false);
    }
  };

  const handleStartSeason = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!window.confirm(`Start ${newDetails.name}? The current season will become read-only.`)) return;
    setBusySeason(true);
    try {
      await startNew(newSlug, newDetails);
      setNewSlug("");
      setNewDetails(emptyDetails);
      push("success", "New season started. Reloading current season data.");
      window.location.reload();
    } catch (cause) {
      push("error", cause instanceof Error ? cause.message : "Could not start season.");
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
        <p className="mt-2 text-sm text-gray-300">Only the active season can be edited. Starting a new season archives the current one and switches registrations, points, and brackets to the new season.</p>
        {seasonsLoading && <p className="mt-4 text-gray-300">Loading seasons...</p>}
        {seasonsError && <p role="alert" className="mt-4 text-red-300">{seasonsError}</p>}
        {!seasonsLoading && activeSeason && (
          <form className="mt-5 space-y-4" onSubmit={(event) => void handleSaveSeason(event)}>
            <h4 className="font-bayon text-lg text-blue-bright">Active: {activeSeason.name}</h4>
            <p className="text-xs text-gray-400">Season slug: {activeSeason.slug}</p>
            <SeasonFields details={activeDetails} onChange={setActiveDetails} />
            <button className={primaryBtnClass} disabled={busySeason} type="submit">Save Active Season</button>
          </form>
        )}
        {seasons.filter((season) => !season.is_active).length > 0 && (
          <div className="mt-6 border-t border-blue-accent/20 pt-4">
            <h4 className="font-bayon text-lg text-white">Inactive seasons · read only</h4>
            <ul className="mt-2 space-y-2 text-sm text-gray-300">
              {seasons.filter((season) => !season.is_active).map((season) => (
                <li key={season.id}>{season.name} ({season.slug})</li>
              ))}
            </ul>
          </div>
        )}
        <form className="mt-6 space-y-4 border-t border-blue-accent/20 pt-4" onSubmit={(event) => void handleStartSeason(event)}>
          <h4 className="font-bayon text-lg text-white">Start a new season</h4>
          <label className={labelClass}>Season slug
            <input className={inputClass} required pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder="gamefest-2028" value={newSlug}
              onChange={(event) => setNewSlug(event.target.value)} />
          </label>
          <SeasonFields details={newDetails} onChange={setNewDetails} />
          <button className={dangerBtnClass} disabled={busySeason} type="submit">Start New Season</button>
        </form>
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
