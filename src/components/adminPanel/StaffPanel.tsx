import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useChallenges } from "../../hooks/useChallenges";
import { useGames } from "../../hooks/useGames";
import { useStaff } from "../../hooks/useStaff";
import { useUserRoles } from "../../hooks/useUserRoles";
import { Field, SectionTitle, ToastStack } from "./shared/ui";
import { useToasts } from "./shared/useToasts";
import {
  dangerBtnClass,
  ghostBtnClass,
  inputClass,
  primaryBtnClass,
} from "./shared/styles";

type UserOption = {
  id: string;
  name: string;
  username: string | null;
};

// "" = no assignment (floater), "game:<uuid>" or "challenge:<uuid>" otherwise.
type AssignmentValue = string;

const parseAssignmentValue = (
  value: AssignmentValue
): { gameId: string | null; challengeId: string | null } => {
  if (value.startsWith("game:"))
    return { gameId: value.slice(5), challengeId: null };
  if (value.startsWith("challenge:"))
    return { gameId: null, challengeId: value.slice(10) };
  return { gameId: null, challengeId: null };
};

const StaffPanel: React.FC = () => {
  const {
    staff,
    addStaffMember,
    patchStaffByUserId,
    removeStaffByUserId,
  } = useStaff();
  const { games } = useGames();
  const { challenges } = useChallenges();
  const { isAdmin } = useUserRoles();
  const { toasts, push, dismiss } = useToasts();

  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  // Maps userId → pending assignment dropdown value (if user is editing inline)
  const [editingBuffer, setEditingBuffer] = useState<Record<string, AssignmentValue>>({});

  // Add-modal state
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newAssignmentValue, setNewAssignmentValue] = useState<AssignmentValue>("");
  const [searching, setSearching] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.assignmentName || "").toLowerCase().includes(q)
    );
  }, [staff, query]);

  // Build a helper: staffMember → current dropdown value string
  const staffAssignmentValue = (userId: string): AssignmentValue => {
    const member = staff.find((m) => m.userId === userId);
    if (!member?.assignmentId) return "";
    return member.assignmentType === "game"
      ? `game:${member.assignmentId}`
      : `challenge:${member.assignmentId}`;
  };

  useEffect(() => {
    if (!showAddModal) return;
    let cancelled = false;
    const q = userQuery.trim();
    if (q.length < 2) {
      setUserResults([]);
      return;
    }
    setSearching(true);
    const handle = setTimeout(async () => {
      const { data } = await supabase
        .from("users")
        .select("id, username, fname, lname")
        .or(`username.ilike.%${q}%,fname.ilike.%${q}%,lname.ilike.%${q}%`)
        .limit(20);
      if (cancelled) return;
      const claimed = new Set(staff.map((s) => s.userId));
      setUserResults(
        (data || [])
          .filter((u) => !claimed.has(u.id))
          .map((u) => ({
            id: u.id,
            name:
              [u.fname, u.lname].filter(Boolean).join(" ") ||
              u.username ||
              "Unknown",
            username: u.username,
          }))
      );
      setSearching(false);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [userQuery, showAddModal, staff]);

  const resetAddModal = () => {
    setShowAddModal(false);
    setUserQuery("");
    setUserResults([]);
    setSelectedUserId("");
    setNewAssignmentValue("");
  };

  const handleAdd = async () => {
    if (!selectedUserId) {
      push("error", "Please pick a user.");
      return;
    }
    const { gameId, challengeId } = parseAssignmentValue(newAssignmentValue);
    try {
      await addStaffMember({
        userId: selectedUserId,
        gameAssignmentId: gameId,
        challengeAssignmentId: challengeId,
      });
      push("success", "Added to staff");
      resetAddModal();
    } catch (err) {
      push(
        "error",
        err instanceof Error ? err.message : "Failed to add staff."
      );
    }
  };

  const handlePatchAssignment = async (userId: string) => {
    const nextValue = editingBuffer[userId];
    if (nextValue === undefined) return;
    const { gameId, challengeId } = parseAssignmentValue(nextValue);
    try {
      await patchStaffByUserId(userId, {
        gameAssignmentId: gameId,
        challengeAssignmentId: challengeId,
      });
      push("success", "Updated assignment");
      setEditingBuffer((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Failed to update.");
    }
  };

  const handleRemove = async (userId: string, name: string) => {
    if (!isAdmin) return;
    if (!window.confirm(`Remove ${name} from staff?`)) return;
    try {
      await removeStaffByUserId(userId);
      push("success", `Removed ${name}`);
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Failed to remove.");
    }
  };

  // Shared assignment dropdown rendered in both the list rows and the add-modal.
  const AssignmentSelect: React.FC<{
    value: AssignmentValue;
    onChange: (v: AssignmentValue) => void;
    className?: string;
  }> = ({ value, onChange, className = "" }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`border bg-dark-bg/60 px-3 py-2 text-sm font-semibold text-white focus:outline-none border-blue-accent/40 focus:border-blue-bright ${className}`}
    >
      <option value="">No assignment (floater)</option>
      {games.length > 0 && (
        <optgroup label="Games">
          {games.map((g) => (
            <option key={`game-${g.id}`} value={`game:${g.id}`}>
              {g.name} ({g.pointsPerAward} pts, cap {g.maxPoints})
            </option>
          ))}
        </optgroup>
      )}
      {challenges.length > 0 && (
        <optgroup label="Challenges">
          {challenges.map((c) => (
            <option key={`challenge-${c.id}`} value={`challenge:${c.id}`}>
              {c.name} ({c.pointsPerAward} pts, cap {c.maxPoints})
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );

  return (
    <div>
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <SectionTitle
        eyebrow="Personnel"
        right={
          <button
            onClick={() => setShowAddModal(true)}
            className={primaryBtnClass}
          >
            + Add Staff
          </button>
        }
      >
        Staff Roster
      </SectionTitle>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or assignment..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="border border-blue-accent/20 bg-navy-blue/40">
        <div className="grid grid-cols-[1fr,2fr,auto] items-center gap-4 border-b border-blue-accent/20 bg-dark-navy/40 px-5 py-3 font-bayon text-xs uppercase tracking-[0.25em] text-blue-bright/80">
          <span>Name</span>
          <span>Assignment</span>
          <span className="pr-2">Actions</span>
        </div>
        {filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-400">
            No staff match.
          </div>
        )}
        {filtered.map((member) => {
          const currentDropdownValue =
            editingBuffer[member.userId] !== undefined
              ? editingBuffer[member.userId]
              : staffAssignmentValue(member.userId);
          const savedDropdownValue = staffAssignmentValue(member.userId);
          const dirty =
            editingBuffer[member.userId] !== undefined &&
            editingBuffer[member.userId] !== savedDropdownValue;

          return (
            <div
              key={member.userId}
              className="grid grid-cols-[1fr,2fr,auto] items-center gap-4 border-b border-blue-accent/10 px-5 py-3 last:border-b-0 hover:bg-white/[0.03]"
            >
              <div className="truncate text-base font-medium text-white">
                {member.name}
              </div>
              <div className="flex items-center gap-2">
                <AssignmentSelect
                  value={currentDropdownValue}
                  onChange={(v) =>
                    setEditingBuffer((prev) => ({
                      ...prev,
                      [member.userId]: v,
                    }))
                  }
                  className={`flex-1 ${dirty ? "border-amber-400/60" : ""}`}
                />
                {dirty && (
                  <button
                    onClick={() => void handlePatchAssignment(member.userId)}
                    className={`${primaryBtnClass} text-xs`}
                  >
                    Save
                  </button>
                )}
              </div>
              {isAdmin && (
                <button
                  onClick={() => void handleRemove(member.userId, member.name)}
                  className={dangerBtnClass}
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={resetAddModal}
        >
          <div
            className="w-full max-w-md border border-blue-bright/40 bg-navy-blue shadow-[0_0_60px_rgba(0,212,255,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-blue-accent/20 bg-dark-navy/60 px-5 py-4">
              <h3 className="font-zuume text-2xl font-bold uppercase tracking-wider text-white">
                Add Staff Member
              </h3>
              <button
                onClick={resetAddModal}
                className="text-gray-300 hover:text-red-300"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 p-5">
              <Field label="Find User *">
                <input
                  autoFocus
                  type="text"
                  value={userQuery}
                  onChange={(e) => {
                    setUserQuery(e.target.value);
                    setSelectedUserId("");
                  }}
                  placeholder="Search by name or username…"
                  className={inputClass}
                />
              </Field>
              {userQuery.trim().length >= 2 && (
                <div className="max-h-48 overflow-y-auto border border-blue-accent/20 bg-dark-bg/40">
                  {searching && (
                    <div className="p-3 text-sm text-gray-400">
                      Searching…
                    </div>
                  )}
                  {!searching && userResults.length === 0 && (
                    <div className="p-3 text-sm text-gray-400">
                      No eligible users match.
                    </div>
                  )}
                  {!searching &&
                    userResults.map((u) => {
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
                            <span className="text-xs text-gray-400">
                              @{u.username}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              )}
              <Field label="Assignment (optional)">
                <AssignmentSelect
                  value={newAssignmentValue}
                  onChange={setNewAssignmentValue}
                  className="w-full"
                />
              </Field>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-blue-accent/20 bg-dark-navy/60 px-5 py-3">
              <button onClick={resetAddModal} className={ghostBtnClass}>
                Cancel
              </button>
              <button
                disabled={!selectedUserId}
                onClick={() => void handleAdd()}
                className={primaryBtnClass}
              >
                Add Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPanel;
