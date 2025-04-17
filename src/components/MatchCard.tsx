import React from 'react';
import '../styles/Matches.css';
import { gameCovers } from "../data/gamesData.ts";


interface MatchCardProps {
    game: string;
    round: string;
    date: number;
}

const MatchCard: React.FC<MatchCardProps> = ({ game, round, date }) => {
    const gameKey = game.toLowerCase().replace(/[\s\-]/g, "_");
    const coverImg = gameCovers[gameKey];
  
    return (
      <div className="matchcard">
        {coverImg && (
          <img
            src={coverImg}
            alt={`${game} cover`}
            className="bg-gray size-fit rounded-lg"
          />
        )}
      <h2>GAME: {game}</h2>
        {round && <h2>ROUND: {round}</h2>}
        <h2>DATE: {date}</h2>
      </div>
    );
  };

export default MatchCard;