import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";

interface Staff {
  name: string;
  role: string;
}

const StaffPanel: React.FC = () => {
  const { getToken } = useAuth();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [newStaff, setNewStaff] = useState("");
  const [newRole, setNewRole] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      const token = await getToken();
      console.log("Token:", token);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Failed to fetch staff:", error);
        setStaffList([]);
        return;
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setStaffList(data);
      } else {
        console.error("Expected an array but got:", data);
        setStaffList([]);
      }
    };
    fetchStaff();
  }, [getToken]);

  const updateRole = async (name: string, role: string) => {
    const token = await getToken();
    await fetch(`${import.meta.env.VITE_API_URL}/api/staff/${name}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });
    setStaffList((prev) =>
      prev.map((s) => (s.name === name ? { ...s, role } : s))
    );
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  const addStaff = async () => {
    if (!newStaff.trim() || !newRole.trim()) {
      alert("Please fill in both name and role.");
      return;
    }
    const token = await getToken();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/staff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newStaff, role: newRole }),
    });

    if (!res.ok) {
      const error = await res.json();
      alert(error?.message || "Failed to add staff.");
      return;
    }

    const created = await res.json();
    setStaffList((prev) => [...prev, created]);
    setNewStaff("");
    setNewRole("");
  };
  const deleteStaff = async (name: string) => {
    const token = await getToken();
    await fetch(`${import.meta.env.VITE_API_URL}/api/staff/${name}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    setStaffList((prev) => prev.filter((s) => s.name !== name));
  };

  const [showSuggestions, setShowSuggestions] = useState(false);
  const filteredNames = staffList
    .map((s) => s.name)
    .filter(
      (name) =>
        name.toLowerCase().includes(newStaff.toLowerCase()) &&
        name.toLowerCase() !== newStaff.toLowerCase()
    )
    .slice(0, 5);

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Manage Staff Roles</h2>

      <div className="relative flex items-center">
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          className="z-10 h-10 w-10 rounded-full bg-gray-200 hover:bg-gray-300"
        >
          ←
        </button>

        {/* Scrollable Staff Cards */}
        <div
          ref={scrollRef}
          className="scrollbar-hide flex w-full gap-4 overflow-x-auto px-4 py-2"
        >
          {staffList.map((staff) => (
            <div
              key={staff.name}
              className="flex min-w-[400px] items-center gap-4 rounded border px-4 py-2 shadow"
            >
              <span className="w-22">{staff.name}</span>
              <input
                value={staff.role}
                onChange={(e) => updateRole(staff.name, e.target.value)}
                className="w-64 rounded border p-1"
              />
              <button
                onClick={() => deleteStaff(staff.name)}
                className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          className="z-10 h-10 w-10 rounded-full bg-gray-200 hover:bg-gray-300"
        >
          →
        </button>
      </div>

      {/* Add Staff Member */}
      <div className="mt-6 flex flex-col gap-2">
        <h3 className="font-semibold">Add Staff Member</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Name"
            value={newStaff}
            onChange={(e) => {
              setNewStaff(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)} // delay to allow click
            className="rounded border p-2 w-full"
          />
          {showSuggestions && filteredNames.length > 0 && (
            <ul className="absolute z-10 w-full rounded border bg-white shadow">
              {filteredNames.map((name) => (
                <li
                  key={name}
                  onClick={() => {
                    setNewStaff(name);
                    setShowSuggestions(false);
                  }}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <input
          type="text"
          placeholder="Role (e.g. valorant)"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          className="rounded border p-2"
        />
        <button
          onClick={addStaff}
          className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
        >
          Add Staff
        </button>
      </div>
    </div>
  );
};

export default StaffPanel;
