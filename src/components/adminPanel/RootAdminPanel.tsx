import React, { useState } from "react";
import StaffPanel from "./StaffPanel";
import PlayerCheckinPanel from "./CheckinPanel";
import PointsPanel from "./PointsPanel";
import GameEditorPanel from "./GameEditorPanel";

const RootAdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState("staff");

  return (
    <div className="w-full rounded bg-white p-6 shadow">
      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => setActiveTab("staff")}
          className={`btn ${
            activeTab === "staff" ? "text-2xl font-bold text-tech-gold" : ""
          }`}
        >
          Manage Staff
        </button>
        <button
          onClick={() => setActiveTab("checkin")}
          className={`btn ${
            activeTab === "checkin" ? "text-2xl font-bold text-tech-gold" : ""
          }`}
        >
          Player Check-in & Settings
        </button>
        <button
          onClick={() => setActiveTab("points")}
          className={`btn ${
            activeTab === "points" ? "text-2xl font-bold text-tech-gold" : ""
          }`}
        >
          Tokens
        </button>
        <button
          onClick={() => setActiveTab("games")}
          className={`btn ${
            activeTab === "games" ? "text-2xl font-bold text-tech-gold" : ""
          }`}
        >
          Games & Challenges
        </button>
      </div>

      {activeTab === "staff" && <StaffPanel />}
      {activeTab === "checkin" && <PlayerCheckinPanel />}
      {activeTab === "points" && <PointsPanel />}
      {activeTab === "games" && <GameEditorPanel />}
    </div>
  );
};

export default RootAdminPanel;
