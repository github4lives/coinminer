import React from 'react';

export const Refinery: React.FC = () => {
  return (
    <div className="p-4 border border-orange-400">
      <h2 className="text-orange-400 text-lg mb-2">[ DATA REFINERY ]</h2>
      <p>Processing raw data into valuable intel...</p>
      <div className="mt-2">
        <p>Current Job: <span className="text-gray-400">NONE</span></p>
        <p>Queue: <span className="text-gray-400">EMPTY</span></p>
        <p>Refinery Status: <span className="text-green-400">IDLE</span></p>
      </div>
       <p className="mt-4 italic">Use 'view terminal' to return to CORE.</p>
    </div>
  );
};
