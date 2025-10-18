import React, { useState, useRef, useEffect } from 'react';
import type { HistoryEntry } from '../types';

interface TerminalProps {
  history: HistoryEntry[];
  onCommand: (command: string) => void;
  isLoading: boolean;
  isMinigameActive: boolean; // Kept for prop compatibility, but unused
}

interface TerminalInputProps {
    onCommand: (command: string) => void;
    isLoading: boolean;
}

const TerminalInput: React.FC<TerminalInputProps> = ({ onCommand, isLoading }) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim() && !isLoading) {
            onCommand(inputValue.trim());
            setInputValue('');
        }
    };
    
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div className="flex items-center">
            <span className="text-green-400 mr-2">{'>'}</span>
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none text-white focus:outline-none w-full"
                disabled={isLoading}
                autoFocus
                autoComplete="off"
                spellCheck="false"
            />
            {isLoading && <span className="text-gray-400 ml-2 caret-blink">_</span>}
        </div>
    );
}

export const Terminal: React.FC<TerminalProps> = ({ history, onCommand, isLoading }) => {
  const endOfHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const renderEntry = (entry: HistoryEntry) => {
    switch (entry.type) {
      case 'input':
        return <p className="text-white"><span className="text-green-400 mr-2">{'>'}</span>{entry.text}</p>;
      case 'output':
        return <p className="text-gray-300">{entry.text}</p>;
      case 'error':
        return <p className="text-red-500">{entry.text}</p>;
      case 'system':
        return <p className="text-cyan-400 italic">{entry.text}</p>;
      default:
        return <p>{entry.text}</p>;
    }
  };

  return (
    <div className="flex-grow flex flex-col justify-end" onClick={() => document.querySelector('input')?.focus()}>
        <div className="overflow-y-auto max-h-[calc(100vh-100px)]">
            {history.map(entry => (
                <div key={entry.id} className="mb-1">
                    {renderEntry(entry)}
                </div>
            ))}
             <div ref={endOfHistoryRef} />
        </div>
        <TerminalInput onCommand={onCommand} isLoading={isLoading} />
    </div>
  );
};
