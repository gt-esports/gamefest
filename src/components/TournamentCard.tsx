import React from 'react';

interface TournamentCardProps {
  title: string;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
  title
}) => {
  return (
    <div
        className="bg-[#d9d9d9] p-4 rounded-lg shadow-md m-4 w-full items-center justify-center text-center"
    >
      <h2>{title}</h2>
    </div>
  );
};

export default TournamentCard;
