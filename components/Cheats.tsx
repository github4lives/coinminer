import React, { useState, useRef, useEffect } from 'react';

interface CheatsProps {
    onCommand: (command: string) => string; // Returns a result message
    onExit: () => void;
}

const CHEAT_COMMANDS = [
    { cmd: 'addcoins <amount>', desc: 'give yourself coins.' },
    { cmd: 'addmaterial <name> <amount>', desc: 'give yourself materials (e.g., coal, iron).' },
    { cmd: 'setenergy <amount>', desc: 'set your current energy level.' },
    { cmd: 'exit', desc: 'close the cheats menu.' },
];

export const Cheats: React.FC<CheatsProps> = ({ onCommand, onExit }) => {
    const [inputValue, setInputValue] = useState('');
    const [message, setMessage] = useState<string | null>("enter a cheat command.");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleLocalCommand = (command: string) => {
        const [action] = command.toLowerCase().split(' ').filter(Boolean);
        
        if (action === 'exit' || action === 'leave') {
            onExit();
            return;
        }
        
        const resultMessage = onCommand(command);
        setMessage(resultMessage);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            handleLocalCommand(inputValue.trim());
            setInputValue('');
        }
    };
    
    return (
        <div className="flex-grow flex flex-col border-2 border-red-500 p-4 mt-12" onClick={() => inputRef.current?.focus()}>
            <div className="text-center mb-4">
                <h1 className="text-2xl text-red-500">-- cheats activated --</h1>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2">
                <p className="text-gray-300 mb-2">available commands:</p>
                 {CHEAT_COMMANDS.map(c => (
                     <div key={c.cmd} className="mb-2">
                        <p className="text-cyan-300 font-bold">{c.cmd}</p>
                        <p className="text-gray-400 text-sm pl-2">- {c.desc}</p>
                     </div>
                 ))}
            </div>

            <div className="mt-4 pt-2 border-t border-dashed border-gray-600">
                {message && <p className="text-green-300 italic mb-2 text-center">{message}</p>}
                <div className="flex items-center">
                    <span className="text-red-500 mr-2">#</span>
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
