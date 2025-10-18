import React from 'react';

export const Shop: React.FC = () => {
  return (
    <div className="p-4 border border-cyan-400">
      <h2 className="text-cyan-400 text-lg mb-2">[ SHOP TERMINAL ]</h2>
      <p>Welcome to the underground market.</p>
      <p>Available wares:</p>
      <ul className="list-disc list-inside mt-2">
        <li>ICE Breaker v2.1 - 5000 credits</li>
        <li>Stealth Cloak Module - 12000 credits</li>
        <li>Data Spike - 2500 credits</li>
      </ul>
      <p className="mt-4 italic">Use 'view terminal' to return to CORE.</p>
    </div>
  );
};
