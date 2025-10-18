import React from 'react';
import { PickaxeType } from '../types';

interface StatusBarProps {
  coins: number;
  energy: number;
  maxEnergy: number;
  pickaxe: PickaxeType;
}

export const StatusBar: React.FC<StatusBarProps> = ({ coins, energy, maxEnergy, pickaxe }) => {
  const energyPercentage = maxEnergy > 0 ? (energy / maxEnergy) * 100 : 0;

  const getEnergyColor = () => {
    if (energyPercentage < 20) return 'text-red-500';
    if (energyPercentage < 50) return 'text-yellow-500';
    return 'text-green-500';
  }

  return (
    <div className="fixed top-0 left-0 right-0 p-2 bg-black flex justify-between items-center border-b border-gray-700">
      <p className="text-yellow-400">
        <span className="font-bold">coins:</span> {coins}
      </p>
       <p className={getEnergyColor()}>
        <span className="font-bold">energy:</span> {energy}/{maxEnergy}
      </p>
      <p className="text-cyan-400">
         <span className="font-bold">pickaxe:</span> {pickaxe}
      </p>
    </div>
  );
};
