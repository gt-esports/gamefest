import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import { Field } from "../shared/ui";
import { ghostBtnClass, inputClass, primaryBtnClass } from "../shared/styles";

type UserOption = {
  id: string;
  name: string;
  username: string | null;
};

type AddPlayerModalProps = {
  games: string[];
  onClose: () => void;
  onSubmit: (userId: string, game: string, team: string) => Promise<void>;
};

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({ games, onClose, onSubmit }) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [game, setGame] = useState("");
  const [team, setTeam] = useState("");
  const [busy, setBusy] = useState(false);
  const [searching, setSearching] = useState(false);

  // Debounced user search — filters out users who already have a player row.
  useEffect(() => {
    let cancelled = false;
    const q = query.trim();
    if (q.length < 2) {
      setUsers([]);
      return;
    }
    setSearching(true);
    const handle = setTimeout(async () => {
      try {
        const [{ data: userRows }, { data: playerRows }] = await Promise.all([
          supabase
            .from("users")
            .select("id, username, fname, lname")
            .or(`username.ilike.%${q}%,fname.ilike.%${q}%,lname.ilike.%${q}%`)
            .limit(20),
          supabase.from("players").select("user_id"),
        ]);
        if (cancelled) return;
        const claimed = new Set((playerRows || []).map((r) => r.user_id));
        const options: UserOption[] = (userRows || [])
          .filter((u) => !claimed.has(u.id))
          .map((u) => ({
            id: u.id,
            name: [u.fname, u.lname].filter(Boolean).join(" ") || u.username || "Unknown",
            username: u.username,
          }));
        setUsers(options);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) || null,
    [users, selectedUserId]
  );

  const handleSubmit = async () => {
    if (!selectedUserId) return;
    setBusy(true);
    try {
      await onSubmit(selectedUserId, game, team);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border border-blue-bright/40 bg-navy-blue shadow-[0_0_60px_rgba(0,212,255,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-blue-accent/20 bg-dark-navy/60 px-5 py-4">
          <h3 className="font-zuume text-2xl font-bold uppercase tracking-wider text-white">
            Register Player
          </h3>
          <button onClick={onClose} className="text-gray-300 hover:text-red-300">
            ✕
          </button>
        </div>
        <div className="space-y-4 p-5">
          <Field label="Find User *">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedUserId("");
              }}
              placeholder="Search by name or username…"
              className={inputClass}
            />
          </Field>
          {query.trim().length >= 2 && (
            <div className="max-h-48 overflow-y-auto border border-blue-accent/20 bg-dark-bg/40">
              {searching && (
                <div className="p-3 text-sm text-gray-400">Searching…</div>
              )}
              {!searching && users.length === 0 && (
                <div className="p-3 text-sm text-gray-400">
                  No unregistered users match.
                </div>
              )}
              {!searching &&
                users.map((u) => {
                  const active = u.id === selectedUserId;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUserId(u.id)}
                      className={`flex w-full items-center justify-between gap-3 border-b border-blue-accent/10 px-3 py-2 text-left text-sm last:border-b-0 ${
                        active
                          ? "bg-blue-bright/10 text-blue-bright"
                          : "text-gray-100 hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="font-medium">{u.name}</span>
                      {u.username && u.username !== u.name && (
                        <span className="text-xs text-gray-400">@{u.username}</span>
                      )}
                    </button>
                  );
                })}
            </div>
          )}
          {selectedUser && (
            <div className="border border-blue-bright/40 bg-blue-bright/5 px-3 py-2 text-sm text-white">
              Selected: <span className="font-semibold">{selectedUser.name}</span>
            </div>
          )}
          <Field label="Game (optional)">
            <select
              value={game}
              onChange={(e) => setGame(e.target.value)}
              className={inputClass}
            >
              <option value="">— None —</option>
              {games.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Team (optional)">
            <input
              type="text"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="Team name"
              className={inputClass}
            />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-blue-accent/20 bg-dark-navy/60 px-5 py-3">
          <button onClick={onClose} className={ghostBtnClass}>
            Cancel
          </button>
          <button
            disabled={busy || !selectedUserId}
            onClick={() => void handleSubmit()}
            className={primaryBtnClass}
          >
            {busy ? "Registering…" : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPlayerModal;
