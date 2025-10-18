import React from 'react';
import { GameState } from '../types';

interface StatusBarProps {
  gameState: GameState;
  isAutofarmOn: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ gameState, isAutofarmOn }) => {
  const { coins, energy, pickaxe, isInfiniteEnergy } = gameState;
  const maxEnergy = 100;
  const energyPercentage = maxEnergy > 0 ? (energy / maxEnergy) * 100 : 0;

  const getEnergyColor = () => {
    if (isInfiniteEnergy) return 'text-purple-400';
    if (energyPercentage < 20) return 'text-red-500';
    if (energyPercentage < 50) return 'text-yellow-500';
    return 'text-green-500';
  }

  return (
    <div className="fixed top-0 left-0 right-0 p-2 bg-black flex justify-between items-center border-b border-gray-700 z-10">
      <p className="text-yellow-400">
        <span className="font-bold">coins:</span> {coins}
      </p>
       <div className="flex items-center space-x-4">
        {isAutofarmOn && <p className="text-green-400 animate-pulse">[auto]</p>}
        <p className={getEnergyColor()}>
          <span className="font-bold">energy:</span> {isInfiniteEnergy ? '∞' : `${energy}/${maxEnergy}`}
        </p>
       </div>
      <p className="text-cyan-400">
         <span className="font-bold">pickaxe:</span> {pickaxe}
      </p>
    </div>
  );
};
