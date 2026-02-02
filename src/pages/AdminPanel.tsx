import React from "react";

import RootAdminPanel from "../components/adminPanel/RootAdminPanel";
import { useUserRoles } from "../hooks/useUserRoles";

const AdminPanel: React.FC = () => {
  const { isStaff, isAdmin, loading } = useUserRoles();

  return (
    <div className="mt-24 flex w-full flex-col bg-white p-4">
      <h1 className="mb-4 text-center text-2xl font-bold">Admin Panel</h1>
      {loading && <p className="text-center text-gray-600">Loading permissions...</p>}
      {!loading && !isStaff && (
        <p className="text-center text-red-600">You are not authorized to access this panel.</p>
      )}
      {!loading && isStaff && <RootAdminPanel isAdmin={isAdmin} />}
    </div>
  );
};

export default AdminPanel;
