import React from 'react';
import '../styles/Matches.css';

interface MatchCardProps {
    game: string;
    round: string;
    date: number;
}

const MatchCard: React.FC<MatchCardProps> = ({ game, round, date }) => {
    return (
        <div className="matchcard">
            <img 
                src="" 
                alt="Game Logo"
                className="bg-gray size-fit rounded-lg" />
            <h2>
                GAME: {game}
            </h2>
            <h2> 
                ROUND: {round}
            </h2>
            <h2>
                DATE: {date}
            </h2>
        </div>
    );
}

export default MatchCard;