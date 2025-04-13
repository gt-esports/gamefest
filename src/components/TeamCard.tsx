import React from 'react';
import '../styles/Matches.css';

interface TeamCardProps {
  players: string[];
}

const TeamCard: React.FC<TeamCardProps> = ({ players }) => {
  return (
    <div className="teamcard">
      <h2>TEAM ROSTER</h2>
      <div className="text-center items-center justify-center h-full space-y-2">
        {players.map((player, index) => (
          <h3 key={index}>{player}</h3>
        ))}
      </div>
      <a href="/teams" className="right-align">
        <button>
          <svg
            width="24"
            height="24"
            fill="#FFFFFF"
            viewBox="0 0 24 24"
            style={{ display: 'block' }}
          >
            <path d="M13 5l7 7-7 7M5 12h14" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          </svg>
        </button>
      </a>
    </div>
  );
};

export default TeamCard;
