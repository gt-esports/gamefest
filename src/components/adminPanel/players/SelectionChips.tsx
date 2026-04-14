import React from "react";
import type { Player } from "../../../hooks/usePlayers";

type SelectionChipsProps = {
  selected: Player[];
  onToggle: (name: string) => void;
  onClear: () => void;
};

const SelectionChips: React.FC<SelectionChipsProps> = ({ selected, onToggle, onClear }) => (
  <div className="border border-blue-accent/30 bg-navy-blue/50">
    <div className="flex items-center justify-between border-b border-blue-accent/20 px-4 py-2">
      <span className="font-bayon text-xs uppercase tracking-[0.3em] text-blue-bright">
        Selected · {selected.length}
      </span>
      <button
        onClick={onClear}
        className="text-xs font-semibold text-gray-300 hover:text-red-300"
      >
        Clear all
      </button>
    </div>
    <div className="flex flex-wrap gap-2 p-3">
      {selected.map((p) => (
        <span
          key={p.id}
          className="inline-flex items-center gap-2 border border-blue-bright/40 bg-blue-bright/10 px-3 py-1 text-sm text-white"
        >
          <span className="font-medium">{p.name}</span>
          <span className="tabular-nums text-blue-bright/90">{p.points}</span>
          <button
            onClick={() => onToggle(p.name)}
            className="ml-1 text-blue-bright/60 hover:text-red-300"
            aria-label={`Unselect ${p.name}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  </div>
);

export default SelectionChips;
