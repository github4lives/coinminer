import React from 'react';

export const Cheats: React.FC = () => {
  return (
    <div className="p-4 border border-yellow-400">
      <h2 className="text-yellow-400 text-lg mb-2">[ CHEAT CODES ]</h2>
      <p>Unauthorized access detected. This module is for high-level operatives only.</p>
      <ul className="list-disc list-inside mt-2">
        <li>`god_mode`: Invincibility</li>
        <li>`noclip`: Phase through walls</li>
        <li>`credits_add_9999`: Add credits</li>
      </ul>
       <p className="mt-4 italic">Use 'view terminal' to return to CORE.</p>
    </div>
  );
};
