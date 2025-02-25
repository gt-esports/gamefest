import React from 'react';
import '../styles/Matches.css';

interface TeamCardProps {
    player1?: string;
    player2?: string;
    player3?: string;
    player4?: string;
    player5?: string;
}

const TeamCard: React.FC<TeamCardProps> = ({ player1, player2, player3, player4, player5 }) => {
    return (
        <div className="teamcard">
            <h2>
                TEAM ROSTER
            </h2>
            <div className="text-center items-center justify-center h-full">
                <h3>
                    {player1}
                </h3>
                <h3>
                    {player2}
                </h3>
                <h3>
                    {player3}
                </h3>
                <h3>
                    {player4}
                </h3>
                <h3>
                    {player5}
                </h3>
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
}

export default TeamCard;