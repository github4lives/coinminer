import React, { useEffect, useState } from 'react';

interface StatusBarProps {
  activeView: string;
  credits: number;
  heat: number;
  rank: string;
}

const formatTimestamp = (date: Date) =>
  `${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;

export const StatusBar: React.FC<StatusBarProps> = ({ activeView, credits, heat, rank }) => {
  const [currentTime, setCurrentTime] = useState(formatTimestamp(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatTimestamp(new Date()));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-green-500 text-black flex flex-wrap gap-4 items-center p-2 mt-4 text-xs sm:text-sm uppercase tracking-wide">
      <span>CORE INTERFACE v2.0</span>
      <span>View: {activeView.toUpperCase()}</span>
      <span>Creds: {credits.toLocaleString()}</span>
      <span>Heat: {Math.min(heat, 100)}%</span>
      <span>Rank: {rank}</span>
      <span className="ml-auto">{currentTime}</span>
    </div>
  );
};
