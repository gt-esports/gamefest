import React from "react";

import RootAdminPanel from "../components/adminPanel/RootAdminPanel";
import { useUserRoles } from "../hooks/useUserRoles";

const AdminPanel: React.FC = () => {
  const { isStaff, isAdmin, loading } = useUserRoles();

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-dark-bg pt-24">
      {/* ambient HUD background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 10%, rgba(0,153,187,0.18), transparent 45%), radial-gradient(circle at 85% 90%, rgba(0,212,255,0.12), transparent 45%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 100% 100%, 28px 28px, 28px 28px",
        }}
      />
      <div className="relative z-10 px-6 pb-16">
        <div className="mb-6 flex items-baseline gap-4">
          <h1 className="font-zuume text-5xl font-extrabold uppercase tracking-[0.08em] text-white">
            Command Deck
          </h1>
          <span className="h-px flex-1 bg-gradient-to-r from-blue-accent/60 via-blue-accent/20 to-transparent" />
          <span className="font-bayon text-xs uppercase tracking-[0.3em] text-blue-bright/80">
            {isAdmin ? "Admin" : isStaff ? "Staff" : "Guest"}
          </span>
        </div>
        {loading && <p className="text-gray-400">Loading permissions...</p>}
        {!loading && !isStaff && (
          <div className="rounded border border-red-500/40 bg-red-500/10 p-6 text-red-300">
            You are not authorized to access this panel.
          </div>
        )}
        {!loading && isStaff && <RootAdminPanel isAdmin={isAdmin} />}
      </div>
    </div>
  );
};

export default AdminPanel;
