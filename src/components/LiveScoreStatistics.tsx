import React from "react";

interface Stat {
  type: string;
  teamA: number;
  teamB: number;
}

interface LiveScoreStatisticsProps {
  stats: Stat[];
}

const LiveScoreStatistics: React.FC<LiveScoreStatisticsProps> = ({ stats = [] }) => {
    return (
      <div className="w-full bg-transparent flex flex-col items-center justify-center px-10">
        
        {/* Stats Table Wrapper - Matches Other Cards */}
        <div className="w-full max-w-4xl bg-black/30 p-6 rounded-lg shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-center w-full text-lg font-bold border-b border-gray-700 pb-2">
            <span>Team A</span>
            <span className="text-center">vs.<br/><span className="text-sm font-light">Statistic</span></span>
            <span>Team B</span>
          </div>
  
          {/* Stats Table */}
          <div className="w-full">
            {stats.length === 0 ? (
              <div className="text-center text-gray-400 py-4">No stats available</div>
            ) : (
              stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center bg-[rgba(255,255,255,0.08)] my-1 p-2 rounded-md shadow-lg">
                  <span className="w-1/3 text-center">{stat.teamA}</span>
                  <span className="w-1/3 text-center font-semibold">{stat.type}</span>
                  <span className="w-1/3 text-center">{stat.teamB}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };
  export default LiveScoreStatistics;
  
  
