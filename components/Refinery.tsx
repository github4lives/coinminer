import React, { useState, useRef, useEffect } from 'react';
import type { GameState, Upgrade } from '../types';
import { MATERIALS } from '../App';

interface RefineryProps {
    upgrades: Record<string, Upgrade>;
    gameState: GameState;
    onAction: (type: 'sell' | 'buy', target: string, amount?: string) => string;
    onExit: () => void;
}

export const Refinery: React.FC<RefineryProps> = ({ upgrades, gameState, onAction, onExit }) => {
    const [inputValue, setInputValue] = useState('');
    const [message, setMessage] = useState<string | null>("commands: `sell <item> [amount]`, `buy <upgrade>`, `exit`.");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleCommand = (command: string) => {
        const [action, target, amount] = command.toLowerCase().split(' ').filter(Boolean);
        
        if (action === 'exit' || action === 'leave') {
            onExit();
            return;
        }

        if (action === 'buy' || action === 'sell') {
            if (!target) {
                setMessage(`usage: \`${action} <item_name>\``);
                return;
            }
            const resultMessage = onAction(action, target, amount);
            setMessage(resultMessage);
        } else {
            setMessage(`unknown command: ${action}. use 'buy', 'sell', or 'exit'.`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            handleCommand(inputValue.trim());
            setInputValue('');
        }
    };
    
    return (
        <div className="flex-grow flex flex-col border-2 border-yellow-400 p-4 mt-12" onClick={() => inputRef.current?.focus()}>
            <div className="text-center mb-4">
                <h1 className="text-2xl text-yellow-400">-- the refinery --</h1>
            </div>
            
            <div className="flex-grow flex space-x-4 overflow-y-auto">
                {/* Sell Section */}
                <div className="w-1/2 border-r border-gray-600 pr-2">
                    <h2 className="text-lg text-cyan-300 mb-2">sell materials</h2>
                    {Object.keys(MATERIALS).map(matName => (
                         <div key={matName} className="flex justify-between text-gray-400">
                             <span>{matName} (you have {gameState.inventory[matName] || 0})</span>
                             <span>{MATERIALS[matName].baseValue}c each</span>
                         </div>
                     ))}
                     {Object.keys(gameState.inventory).length === 0 && <p className="text-gray-500 italic">you have no materials to sell.</p>}
                </div>

                {/* Buy Section */}
                <div className="w-1/2 pl-2">
                    <h2 className="text-lg text-cyan-300 mb-2">purchase upgrades</h2>
                     {Object.values(upgrades).map(upgrade => {
                         const isMaxLevel = upgrade.maxLevel && upgrade.currentLevel >= upgrade.maxLevel;
                         const cost = isMaxLevel ? 'max' : upgrade.cost(upgrade.currentLevel);
                         return (
                            <div key={upgrade.id} className="mb-2">
                                <p className="font-bold text-white">{upgrade.name} (lvl {upgrade.currentLevel})</p>
                                <div className="flex justify-between text-sm">
                                    <p className="text-gray-400 w-2/3">{upgrade.description}</p>
                                    <p className={`w-1/3 text-right ${isMaxLevel ? 'text-green-500' : 'text-yellow-400'}`}>
                                        {isMaxLevel ? 'max level' : `cost: ${cost}c`}
                                    </p>
                                </div>
                            </div>
                         )
                     })}
                </div>
            </div>

            <div className="mt-4 pt-2 border-t border-dashed border-gray-600">
                {message && <p className="text-green-300 italic mb-2 text-center">{message}</p>}
                <div className="flex items-center">
                    <span className="text-green-400 mr-2">{'>'}</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent border-none text-white focus:outline-none w-full"
                        autoFocus
                        autoComplete="off"
                        spellCheck="false"
                    />
                </div>
            </div>
        </div>
    );
};
