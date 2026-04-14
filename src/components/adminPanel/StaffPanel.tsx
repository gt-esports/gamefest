import React, { useMemo, useState } from "react";
import { useStaff } from "../../hooks/useStaff";
import { Field, SectionTitle, ToastStack } from "./shared/ui";
import { useToasts } from "./shared/useToasts";
import {
  dangerBtnClass,
  ghostBtnClass,
  inputClass,
  primaryBtnClass,
} from "./shared/styles";

const StaffPanel: React.FC = () => {
  const { staff, addStaffMember, patchStaffByName, removeStaffByName } = useStaff();
  const { toasts, push, dismiss } = useToasts();

  const [newStaff, setNewStaff] = useState("");
  const [newAssignment, setNewAssignment] = useState("");
  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBuffer, setEditingBuffer] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.assignment || "").toLowerCase().includes(q)
    );
  }, [staff, query]);

  const handleAdd = async () => {
    if (!newStaff.trim()) {
      push("error", "Please provide a name.");
      return;
    }
    try {
      await addStaffMember({ name: newStaff.trim(), assignment: newAssignment.trim() });
      push("success", `Added ${newStaff.trim()} to staff`);
      setNewStaff("");
      setNewAssignment("");
      setShowAddModal(false);
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Failed to add staff.");
    }
  };

  const handlePatchAssignment = async (name: string) => {
    const nextValue = editingBuffer[name];
    if (nextValue === undefined) return;
    try {
      await patchStaffByName(name, { assignment: nextValue });
      push("success", `Updated ${name}`);
      setEditingBuffer((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Failed to update.");
    }
  };

  const handleRemove = async (name: string) => {
    if (!window.confirm(`Remove ${name} from staff?`)) return;
    try {
      await removeStaffByName(name);
      push("success", `Removed ${name}`);
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Failed to remove.");
    }
  };

  return (
    <div>
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <SectionTitle
        eyebrow="Personnel"
        right={
          <button onClick={() => setShowAddModal(true)} className={primaryBtnClass}>
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
        <div className="grid grid-cols-[1fr,1.5fr,auto] items-center gap-4 border-b border-blue-accent/20 bg-dark-navy/40 px-5 py-3 font-bayon text-xs uppercase tracking-[0.25em] text-blue-bright/80">
          <span>Name</span>
          <span>Assignment</span>
          <span className="pr-2">Actions</span>
        </div>
        {filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-400">No staff match.</div>
        )}
        {filtered.map((member) => {
          const currentValue =
            editingBuffer[member.name] !== undefined
              ? editingBuffer[member.name]
              : member.assignment || "";
          const dirty =
            editingBuffer[member.name] !== undefined &&
            editingBuffer[member.name] !== (member.assignment || "");
          return (
            <div
              key={member.id}
              className="grid grid-cols-[1fr,1.5fr,auto] items-center gap-4 border-b border-blue-accent/10 px-5 py-3 last:border-b-0 hover:bg-white/[0.03]"
            >
              <div className="truncate text-base font-medium text-white">{member.name}</div>
              <div className="flex items-center gap-2">
                <input
                  value={currentValue}
                  placeholder="No assignment"
                  onChange={(e) =>
                    setEditingBuffer((prev) => ({ ...prev, [member.name]: e.target.value }))
                  }
                  onBlur={() => dirty && void handlePatchAssignment(member.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handlePatchAssignment(member.name);
                  }}
                  className={`flex-1 ${inputClass} ${dirty ? "border-amber-400/60" : ""}`}
                />
                {dirty && (
                  <span className="text-xs font-semibold text-amber-300">unsaved</span>
                )}
              </div>
              <button
                onClick={() => void handleRemove(member.name)}
                className={dangerBtnClass}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}
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
                onClick={() => setShowAddModal(false)}
                className="text-gray-300 hover:text-red-300"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 p-5">
              <Field label="Name *">
                <input
                  autoFocus
                  type="text"
                  value={newStaff}
                  onChange={(e) => setNewStaff(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void handleAdd()}
                  placeholder="Discord username"
                  className={inputClass}
                />
              </Field>
              <Field label="Assignment (optional)">
                <input
                  type="text"
                  value={newAssignment}
                  onChange={(e) => setNewAssignment(e.target.value)}
                  placeholder="e.g. photobooth, check-in"
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-blue-accent/20 bg-dark-navy/60 px-5 py-3">
              <button onClick={() => setShowAddModal(false)} className={ghostBtnClass}>
                Cancel
              </button>
              <button
                disabled={!newStaff.trim()}
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
