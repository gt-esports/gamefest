import React, { useRef, useState } from "react";
import { useStaff } from "../../hooks/useStaff";

const StaffPanel: React.FC = () => {
  const { staff, addStaffMember, patchStaffByName, removeStaffByName } = useStaff();
  const [newStaff, setNewStaff] = useState("");
  const [newAssignment, setNewAssignment] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  const addStaff = async () => {
    if (!newStaff.trim()) {
      alert("Please provide a name.");
      return;
    }

    try {
      await addStaffMember({ name: newStaff, assignment: newAssignment });
      setNewStaff("");
      setNewAssignment("");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to add staff.");
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Manage Staff Assignments</h2>

      <div className="relative flex items-center">
        <button
          onClick={scrollLeft}
          className="z-10 h-10 w-10 rounded-full bg-gray-200 hover:bg-gray-300"
        >
          ←
        </button>

        <div
          ref={scrollRef}
          className="scrollbar-hide flex w-full gap-4 overflow-x-auto px-4 py-2"
        >
          {staff.map((member) => (
            <div
              key={member.id}
              className="flex min-w-[400px] items-center gap-4 rounded border px-4 py-2 shadow"
            >
              <span className="w-22">{member.name}</span>
              <input
                value={member.assignment || ""}
                onChange={(event) => {
                  void patchStaffByName(member.name, { assignment: event.target.value });
                }}
                className="w-64 rounded border p-1"
              />
              <button
                onClick={() => {
                  void removeStaffByName(member.name);
                }}
                className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={scrollRight}
          className="z-10 h-10 w-10 rounded-full bg-gray-200 hover:bg-gray-300"
        >
          →
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <h3 className="font-semibold">Add Staff Member</h3>
        <input
          type="text"
          placeholder="Name"
          value={newStaff}
          onChange={(event) => setNewStaff(event.target.value)}
          className="rounded border p-2"
        />
        <input
          type="text"
          placeholder="Assignment (optional)"
          value={newAssignment}
          onChange={(event) => setNewAssignment(event.target.value)}
          className="rounded border p-2"
        />
        <button
          onClick={() => {
            void addStaff();
          }}
          className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
        >
          Add Staff
        </button>
      </div>
    </div>
  );
};

export default StaffPanel;
