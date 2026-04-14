import React, { useEffect, useState } from "react";
import StaffPanel from "./StaffPanel";
import PlayersPanel from "./PlayersPanel";
import GameEditorPanel from "./GameEditorPanel";

type RootAdminPanelProps = {
  isAdmin: boolean;
};

type TabKey = "players" | "staff" | "games";

const RootAdminPanel: React.FC<RootAdminPanelProps> = ({ isAdmin }) => {
  const [activeTab, setActiveTab] = useState<TabKey>("players");

  useEffect(() => {
    if (!isAdmin && (activeTab === "staff" || activeTab === "games")) {
      setActiveTab("players");
    }
  }, [activeTab, isAdmin]);

  const tabs: { key: TabKey; label: string; adminOnly?: boolean }[] = [
    { key: "players", label: "Players / Points" },
    { key: "staff", label: "Staff Roster", adminOnly: true },
    { key: "games", label: "Games & Challenges", adminOnly: true },
  ];

  return (
    <div className="relative overflow-hidden rounded-lg border border-blue-accent/20 bg-card-bg/60 shadow-[0_0_40px_rgba(0,153,187,0.08)] backdrop-blur">
      {/* Tab strip */}
      <div className="flex items-stretch border-b border-blue-accent/20 bg-navy-blue/50">
        {tabs
          .filter((t) => !t.adminOnly || isAdmin)
          .map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`group relative px-6 py-4 font-bayon text-sm uppercase tracking-[0.25em] transition-colors ${
                  active
                    ? "text-blue-bright"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
                <span
                  className={`absolute inset-x-3 bottom-0 h-[2px] transition-all ${
                    active
                      ? "bg-blue-bright shadow-[0_0_12px_rgba(0,212,255,0.9)]"
                      : "bg-transparent group-hover:bg-white/20"
                  }`}
                />
              </button>
            );
          })}
      </div>

      <div className="p-6">
        {activeTab === "players" && <PlayersPanel />}
        {isAdmin && activeTab === "staff" && <StaffPanel />}
        {isAdmin && activeTab === "games" && <GameEditorPanel />}
      </div>
    </div>
  );
};

export default RootAdminPanel;
