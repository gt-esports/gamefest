import React from 'react';

interface TournamentCardProps {
  title: string;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
  title
}) => {
  return (
    <div
        className="bg-[#d9d9d9] rounded-lg shadow-md mb-6 w-full h-36 text-center align-middle"
    >
      <h2>{title}</h2>
    </div>
  );
};

export default TournamentCard;
