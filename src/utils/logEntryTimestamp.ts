// Player point/audit log entries are stored as locale-formatted strings, e.g.
//   "Alice[ADMIN] gave Bob 100 pts on Apr 24, 2026, 3:13 PM"
// `Date.parse` of locale strings is implementation-defined per ECMA-262, so
// sorting by parsing those is unreliable across browsers (notably Safari).
//
// New entries get a trailing ISO marker `[t:<ISO>]` that's hidden from the user
// at render time but reliably parseable. Older entries lacking the marker fall
// back to parsing the trailing locale timestamp.

const MARKER_RE = /\s*\[t:([^\]]+)\]\s*$/;
const ON_RE = / on (.+?)(?:\s*\[t:[^\]]+\])?$/;

export const stampLogEntry = (entry: string): string =>
  `${entry} [t:${new Date().toISOString()}]`;

export const parseLogEntryTime = (entry: string): number | null => {
  const marker = entry.match(MARKER_RE);
  if (marker) {
    const t = Date.parse(marker[1]);
    if (!Number.isNaN(t)) return t;
  }
  const trailing = entry.match(ON_RE);
  if (trailing) {
    const t = Date.parse(trailing[1]);
    if (!Number.isNaN(t)) return t;
  }
  return null;
};

export const stripLogEntryMarker = (entry: string): string =>
  entry.replace(MARKER_RE, "");
