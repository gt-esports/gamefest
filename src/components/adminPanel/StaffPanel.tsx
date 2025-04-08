import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchStaff = async () => {
      const token = await getToken();
      const res = await fetch("/api/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log(data); // Check what you're getting
      setStaffList(data); // Ensure the data is an array
    };
    fetchStaff();
  }, [getToken]);

  const updateRole = async (name: string, role: string) => {
    const token = await getToken();
    await fetch(`/api/staff/${name}`, {
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

  const addStaff = async () => {
    const token = await getToken();
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newStaff, role: newRole }),
    });
    const created = await res.json();
    setStaffList((prev) => [...prev, created]);
    setNewStaff("");
    setNewRole("");
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Manage Staff Roles</h2>
      <ul className="mb-4">
        {staffList.map((staff) => (
          <li key={staff.name} className="mb-2 flex items-center">
            <span className="w-40">{staff.name}</span>
            <input
              value={staff.role}
              onChange={(e) => updateRole(staff.name, e.target.value)}
              className="w-64 rounded border p-1"
            />
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-2">
        <h3 className="font-semibold">Add Staff Member</h3>
        <input
          type="text"
          placeholder="Name"
          value={newStaff}
          onChange={(e) => setNewStaff(e.target.value)}
          className="rounded border p-2"
        />
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
