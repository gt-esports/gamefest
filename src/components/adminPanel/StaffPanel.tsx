import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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

// "" = no assignment selected; "game:<uuid>" or "challenge:<uuid>" otherwise.
type AssignmentValue = string;

const parseAssignmentValue = (
  value: AssignmentValue
): { gameId: string } | { challengeId: string } | null => {
  if (value.startsWith("game:")) return { gameId: value.slice(5) };
  if (value.startsWith("challenge:")) return { challengeId: value.slice(10) };
  return null;
};

const StaffPanel: React.FC = () => {
  const {
    staff,
    addStaffMember,
    addAssignment,
    removeAssignment,
    removeStaffByUserId,
  } = useStaff();
  const { games } = useGames();
  const { challenges } = useChallenges();
  const { isAdmin } = useUserRoles();
  const { toasts, push, dismiss } = useToasts();

  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // userId currently showing inline "add assignment" dropdown
  const [addingForUser, setAddingForUser] = useState<string | null>(null);
  const [pendingAddValue, setPendingAddValue] = useState<AssignmentValue>("");

  // Add-modal state
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [searching, setSearching] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.assignments.some((a) =>
          a.assignmentName.toLowerCase().includes(q)
        )
    );
  }, [staff, query]);

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
  };

  const handleAdd = async () => {
    if (!selectedUserId) {
      push("error", "Please pick a user.");
      return;
    }
    try {
      await addStaffMember(selectedUserId);
      push("success", "Added to staff");
      resetAddModal();
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Failed to add staff.");
    }
  };

  const handleAddAssignment = async (userId: string) => {
    const parsed = parseAssignmentValue(pendingAddValue);
    if (!parsed) {
      push("error", "Pick a game or challenge first.");
      return;
    }
    try {
      await addAssignment(userId, parsed);
      push("success", "Assignment added");
      setAddingForUser(null);
      setPendingAddValue("");
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Failed to add assignment.");
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!isAdmin) return;
    try {
      await removeAssignment(assignmentId);
      push("success", "Assignment removed");
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Failed to remove assignment.");
    }
  };

  const handleRemoveStaff = async (userId: string, name: string) => {
    if (!isAdmin) return;
    if (!window.confirm(`Remove ${name} from staff?`)) return;
    try {
      await removeStaffByUserId(userId);
      push("success", `Removed ${name}`);
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Failed to remove.");
    }
  };

  // Build set of already-assigned game/challenge IDs for a user to prevent duplicates
  const getAssignedIds = (userId: string) => {
    const member = staff.find((m) => m.userId === userId);
    if (!member) return { gameIds: new Set<string>(), challengeIds: new Set<string>() };
    const gameIds = new Set(
      member.assignments.filter((a) => a.type === "game").map((a) => a.assignmentId)
    );
    const challengeIds = new Set(
      member.assignments.filter((a) => a.type === "challenge").map((a) => a.assignmentId)
    );
    return { gameIds, challengeIds };
  };

  const AssignmentAddSelect: React.FC<{
    userId: string;
    value: AssignmentValue;
    onChange: (v: AssignmentValue) => void;
    className?: string;
  }> = ({ userId, value, onChange, className = "" }) => {
    const { gameIds, challengeIds } = getAssignedIds(userId);
    const availableGames = games.filter((g) => !gameIds.has(g.id));
    const availableChallenges = challenges.filter((c) => !challengeIds.has(c.id));

    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`border bg-dark-bg/60 px-3 py-2 text-sm font-semibold text-white focus:outline-none border-blue-accent/40 focus:border-blue-bright ${className}`}
      >
        <option value="">Pick game or challenge…</option>
        {availableGames.length > 0 && (
          <optgroup label="Games">
            {availableGames.map((g) => (
              <option key={`game-${g.id}`} value={`game:${g.id}`}>
                {g.name} ({g.pointsPerAward} pts, cap {g.maxPoints})
              </option>
            ))}
          </optgroup>
        )}
        {availableChallenges.length > 0 && (
          <optgroup label="Challenges">
            {availableChallenges.map((c) => (
              <option key={`challenge-${c.id}`} value={`challenge:${c.id}`}>
                {c.name} ({c.pointsPerAward} pts, cap {c.maxPoints})
              </option>
            ))}
          </optgroup>
        )}
      </select>
    );
  };

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
          <span>Assignments</span>
          <span className="pr-2">Actions</span>
        </div>
        {filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-400">
            No staff match.
          </div>
        )}
        {filtered.map((member) => {
          const isAddingHere = addingForUser === member.userId;

          return (
            <div
              key={member.userId}
              className="grid grid-cols-[1fr,2fr,auto] items-start gap-4 border-b border-blue-accent/10 px-5 py-3 last:border-b-0 hover:bg-white/[0.03]"
            >
              {/* Name column */}
              <div className="flex items-center gap-2 min-w-0 pt-0.5">
                <span className="truncate text-base font-medium text-white">
                  {member.name}
                </span>
                {member.role === "admin" && (
                  <span className="shrink-0 rounded-sm bg-blue-bright/20 px-1.5 py-0.5 font-bayon text-[10px] uppercase tracking-widest text-blue-bright border border-blue-bright/40">
                    Admin
                  </span>
                )}
              </div>

              {/* Assignments column */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {member.assignments.length === 0 && (
                    <span className="text-xs text-gray-500 italic">No assignments</span>
                  )}
                  {member.assignments.map((a) => (
                    <span
                      key={a.id}
                      className="inline-flex items-center gap-1 border border-blue-accent/30 bg-blue-accent/10 px-2 py-0.5 text-xs font-semibold text-blue-bright"
                    >
                      {a.assignmentName}
                      {isAdmin && (
                        <button
                          onClick={() => void handleRemoveAssignment(a.id)}
                          className="ml-0.5 text-blue-bright/50 hover:text-red-300 leading-none"
                          title={`Remove ${a.assignmentName}`}
                        >
                          ✕
                        </button>
                      )}
                    </span>
                  ))}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (isAddingHere) {
                          setAddingForUser(null);
                          setPendingAddValue("");
                        } else {
                          setAddingForUser(member.userId);
                          setPendingAddValue("");
                        }
                      }}
                      className="inline-flex items-center gap-1 border border-dashed border-blue-accent/40 px-2 py-0.5 text-xs text-blue-bright/60 hover:border-blue-bright/60 hover:text-blue-bright"
                    >
                      {isAddingHere ? "Cancel" : "+ Add"}
                    </button>
                  )}
                </div>

                {isAddingHere && (
                  <div className="flex items-center gap-2">
                    <AssignmentAddSelect
                      userId={member.userId}
                      value={pendingAddValue}
                      onChange={setPendingAddValue}
                      className="flex-1"
                    />
                    <button
                      disabled={!pendingAddValue}
                      onClick={() => void handleAddAssignment(member.userId)}
                      className={`${primaryBtnClass} text-xs`}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Actions column */}
              {isAdmin && member.role !== "admin" && (
                <button
                  onClick={() => void handleRemoveStaff(member.userId, member.name)}
                  className={dangerBtnClass}
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>

      {showAddModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            onClick={resetAddModal}
          >
            <div
              className="flex w-full max-w-md flex-col overflow-hidden border border-blue-bright/40 bg-navy-blue shadow-[0_0_60px_rgba(0,212,255,0.25)]"
              style={{ maxHeight: "calc(100dvh - 2rem)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-blue-accent/20 bg-dark-navy/60 px-5 py-4">
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
              <div className="flex-1 space-y-4 overflow-y-auto p-5">
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
                      <div className="p-3 text-sm text-gray-400">Searching…</div>
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
                <p className="text-xs text-gray-500">
                  Assignments can be added from the staff roster after adding.
                </p>
              </div>
              <div className="flex shrink-0 items-center justify-end gap-2 border-t border-blue-accent/20 bg-dark-navy/60 px-5 py-3">
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
          </div>,
          document.body
        )}
    </div>
  );
};

export default StaffPanel;
