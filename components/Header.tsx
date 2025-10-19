import React from 'react';
import { useGameState } from '../services/useGameState';

export const Header: React.FC = () => {
  const credits = useGameState((state) => state.credits);

  return (
    <div className="border border-green-500 p-2 mb-4">
      <p>Credits: <span className="text-green-400">{credits}c</span></p>
    </div>
  );
};
