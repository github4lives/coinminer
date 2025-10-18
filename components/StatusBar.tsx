import React from 'react';

interface StatusBarProps {
    activeView: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ activeView }) => {
    const currentDate = new Date().toISOString();

    return (
        <div className="bg-green-500 text-black flex justify-between items-center p-1 mt-4 text-sm">
            <span>CORE INTERFACE v2.5</span>
            <span>VIEW: {activeView.toUpperCase()}</span>
            <span>{currentDate}</span>
        </div>
    );
};
