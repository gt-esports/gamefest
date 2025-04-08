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
        <button onClick={() => setActiveTab("staff")} className="btn">
          Staff
        </button>
        <button onClick={() => setActiveTab("checkin")} className="btn">
          Player Check-In
        </button>
        <button onClick={() => setActiveTab("points")} className="btn">
          Points
        </button>
        <button onClick={() => setActiveTab("games")} className="btn">
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
