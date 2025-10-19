import React, { useState, useEffect, useCallback } from 'react';
import { useGameState } from '../services/useGameState';

const REFINERY_RATE = 100; // Credits per hour
const REFINERY_COOLDOWN = 60 * 60 * 1000; // 1 hour in ms

export const Refinery: React.FC = () => {
  const { addCredits, lastRefineryClaim, setLastRefineryClaim } = useGameState();
  const [claimableCredits, setClaimableCredits] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const calculateCredits = useCallback(() => {
    const now = Date.now();
    const elapsedTime = now - lastRefineryClaim;
    const creditsPerHour = REFINERY_RATE;
    const creditsPerMs = creditsPerHour / 3600000;

    if (elapsedTime > REFINERY_COOLDOWN) {
        setClaimableCredits(creditsPerHour);
        setTimeRemaining(0);
    } else {
        const generated = Math.floor(elapsedTime * creditsPerMs);
        setClaimableCredits(generated);
        setTimeRemaining(REFINERY_COOLDOWN - elapsedTime);
    }
  }, [lastRefineryClaim]);

  useEffect(() => {
    calculateCredits();
    const interval = setInterval(calculateCredits, 1000);
    return () => clearInterval(interval);
  }, [calculateCredits]);

  const handleClaim = () => {
    addCredits(claimableCredits);
    setLastRefineryClaim(Date.now());
    setClaimableCredits(0);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 border border-orange-400">
      <h2 className="text-orange-400 text-lg mb-2">[ DATA REFINERY ]</h2>
      <p>Refinery generates credits from raw data streams.</p>
      <div className="mt-2">
        <p>Status: <span className={claimableCredits > 0 ? "text-green-400" : "text-gray-400"}>{claimableCredits > 0 ? 'ACTIVE' : 'IDLE'}</span></p>
        <p>Accumulated Credits: <span className="text-green-400">{claimableCredits}c</span></p>
        <p>Time until full: <span className="text-gray-400">{formatTime(timeRemaining)}</span></p>
      </div>
      <button
        onClick={handleClaim}
        className="mt-4 p-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50"
        disabled={claimableCredits === 0}
      >
        Claim Credits
      </button>
      <p className="mt-4 italic">Use 'view terminal' to return to CORE.</p>
    </div>
  );
};
