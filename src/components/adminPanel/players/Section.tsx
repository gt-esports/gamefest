import React from "react";

type SectionProps = {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

const Section: React.FC<SectionProps> = ({ label, count, open, onToggle, children }) => (
  <div>
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-white/[0.03]"
    >
      <span className="flex items-baseline gap-3">
        <span className="font-bayon text-sm uppercase tracking-[0.25em] text-white">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-gray-400">{count}</span>
      </span>
      <span className={`text-blue-bright transition-transform ${open ? "rotate-90" : ""}`}>›</span>
    </button>
    {open && (
      <div className="border-t border-blue-accent/10 bg-dark-bg/40 px-5 py-4">{children}</div>
    )}
  </div>
);

export default Section;
