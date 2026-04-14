import React from "react";
import type { Player } from "../../../hooks/usePlayers";

export type SortMode = "points" | "name";

type RosterRailProps = {
  players: Player[];
  totalCount: number;
  selectedNames: Set<string>;
  query: string;
  onQueryChange: (q: string) => void;
  sortMode: SortMode;
  onSortChange: (m: SortMode) => void;
  onToggleSelect: (name: string) => void;
  onAddClick: () => void;
};

const RosterRail: React.FC<RosterRailProps> = ({
  players,
  totalCount,
  selectedNames,
  query,
  onQueryChange,
  sortMode,
  onSortChange,
  onToggleSelect,
  onAddClick,
}) => (
  <aside className="flex flex-col border border-blue-accent/20 bg-navy-blue/40">
    <div className="border-b border-blue-accent/20 bg-dark-navy/40 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-zuume text-2xl font-bold uppercase tracking-wider text-white">
          Roster
        </h2>
        <span className="text-xs font-semibold text-gray-400">{totalCount} players</span>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search by name..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full border border-blue-accent/30 bg-dark-bg/80 px-3 py-2 pl-9 text-sm text-white placeholder-gray-500 focus:border-blue-bright focus:outline-none"
        />
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-bright">
          ⌕
        </span>
      </div>

      <div className="mt-3 flex gap-1">
        {(
          [
            ["points", "By Points"],
            ["name", "A–Z"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            onClick={() => onSortChange(m)}
            className={`flex-1 border py-1.5 text-xs font-semibold transition-colors ${
              sortMode === m
                ? "border-blue-bright bg-blue-bright/10 text-blue-bright"
                : "border-blue-accent/20 text-gray-300 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>

    <div className="max-h-[560px] flex-1 overflow-y-auto">
      {players.length === 0 && (
        <div className="p-6 text-center text-sm text-gray-400">No players match</div>
      )}
      {players.map((p, idx) => {
        const selected = selectedNames.has(p.name);
        return (
          <button
            key={p.id}
            onClick={() => onToggleSelect(p.name)}
            className={`group flex w-full items-center gap-3 border-l-2 px-4 py-2.5 text-left transition-colors ${
              selected
                ? "border-blue-bright bg-blue-bright/10"
                : "border-transparent hover:border-blue-accent/60 hover:bg-white/[0.04]"
            }`}
          >
            <span
              className={`w-6 font-bayon text-xs tabular-nums ${
                selected ? "text-blue-bright" : "text-gray-500"
              }`}
            >
              {sortMode === "points" ? String(idx + 1).padStart(2, "0") : ""}
            </span>
            <span
              className={`flex-1 truncate text-base font-medium ${
                selected ? "text-white" : "text-gray-100 group-hover:text-white"
              }`}
            >
              {p.name}
            </span>
            <span
              className={`text-sm font-semibold tabular-nums ${
                selected ? "text-blue-bright" : "text-gray-300"
              }`}
            >
              {p.points.toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>

    <div className="border-t border-blue-accent/20 bg-dark-navy/40 p-3">
      <button
        onClick={onAddClick}
        className="w-full border border-blue-bright/60 bg-blue-bright/10 py-2.5 font-bayon text-sm uppercase tracking-[0.25em] text-blue-bright transition-all hover:bg-blue-bright/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]"
      >
        + Register Player
      </button>
    </div>
  </aside>
);

export default RosterRail;
