import React from 'react';
import type { CheatCode } from '../types';

interface CheatsProps {
  cheats: CheatCode[];
  unlockedCheats: string[];
  onActivateCheat: (code: string) => void;
}

export const Cheats: React.FC<CheatsProps> = ({ cheats, unlockedCheats, onActivateCheat }) => {
  return (
    <div className="p-6 border border-yellow-400 bg-black/40 h-full overflow-y-auto">
      <h2 className="text-yellow-300 text-xl mb-4 tracking-wide">[ CHEAT SUBROUTINES ]</h2>
      <p className="text-gray-300 mb-4">
        High-risk overrides detected. CORE logs every activation. Use responsibly or risk triggering security countermeasures.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {cheats.map(cheat => {
          const unlocked = unlockedCheats.includes(cheat.code);
          return (
            <div key={cheat.code} className="border border-yellow-700/50 p-4 rounded bg-black/60">
              <h3 className="text-yellow-200 text-lg font-semibold">{cheat.name}</h3>
              <p className="text-yellow-400 text-xs uppercase mt-1">/{cheat.code}</p>
              <p className="text-gray-400 text-sm mt-2">{cheat.description}</p>
              <p className="text-gray-400 text-xs mt-2">Effect: <span className="text-yellow-300">{cheat.effectSummary}</span></p>
              <button
                className={`mt-4 px-3 py-1 border border-yellow-400 text-xs uppercase tracking-wide transition ${
                  unlocked ? 'opacity-60 cursor-not-allowed' : 'hover:bg-yellow-400 hover:text-black'
                }`}
                onClick={() => onActivateCheat(cheat.code)}
                disabled={unlocked}
              >
                {unlocked ? 'Activated' : 'Execute'}
              </button>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-yellow-200 italic">Terminal command hint: "cheat &lt;code&gt;".</p>
    </div>
  );
};
