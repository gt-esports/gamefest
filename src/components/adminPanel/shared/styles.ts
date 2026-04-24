/**
 * Shared Tailwind class strings for the admin panel's "Command Deck" theme.
 * Kept in a plain .ts module so consuming .tsx files don't trip the
 * react-refresh/only-export-components rule.
 */

export const inputClass =
  "w-full border border-blue-accent/40 bg-dark-bg/60 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-bright focus:outline-none";

export const labelClass =
  "mb-1 block font-bayon text-xs uppercase tracking-[0.25em] text-blue-bright/80";

export const primaryBtnClass =
  "border border-blue-bright bg-blue-bright/20 px-5 py-2 font-bayon text-xs uppercase tracking-[0.25em] text-blue-bright transition-all hover:bg-blue-bright hover:text-dark-bg disabled:opacity-40";

export const ghostBtnClass =
  "border border-blue-accent/40 bg-transparent px-4 py-2 font-bayon text-xs uppercase tracking-[0.25em] text-gray-200 transition-colors hover:border-blue-bright hover:text-blue-bright";

export const dangerBtnClass =
  "border border-red-400/50 bg-red-400/5 px-4 py-2 font-bayon text-xs uppercase tracking-[0.25em] text-red-300 transition-all hover:bg-red-400/15";
