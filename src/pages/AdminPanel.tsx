import React from "react";

import RootAdminPanel from "../components/adminPanel/RootAdminPanel";

const AdminPanel: React.FC = () => {
  return (
    <div className="mt-24 flex w-full flex-col bg-white p-4">
      <h1 className="mb-4 text-center text-2xl font-bold">Admin Panel</h1>
      <RootAdminPanel />
    </div>
  );
};

export default AdminPanel;
