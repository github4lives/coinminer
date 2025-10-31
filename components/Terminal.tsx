import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { HistoryEntry } from '../types';

interface TerminalProps {
  history: HistoryEntry[];
  onCommand: (command: string) => void;
  isLoading: boolean;
  commandHistory: string[];
}

interface TerminalInputProps {
  onCommand: (command: string) => void;
  isLoading: boolean;
  commandHistory: string[];
}

const TerminalInput: React.FC<TerminalInputProps> = ({ onCommand, isLoading, commandHistory }) => {
  const [inputValue, setInputValue] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) {
      return;
    }
    onCommand(trimmed);
    setInputValue('');
    setHistoryIndex(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(inputValue);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!commandHistory.length) {
        return;
      }
      setHistoryIndex(prevIndex => {
        const newIndex = prevIndex === null ? commandHistory.length - 1 : Math.max(prevIndex - 1, 0);
        setInputValue(commandHistory[newIndex] ?? '');
        return newIndex;
      });
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!commandHistory.length) {
        return;
      }
      setHistoryIndex(prevIndex => {
        if (prevIndex === null) {
          return null;
        }
        if (prevIndex >= commandHistory.length - 1) {
          setInputValue('');
          return null;
        }
        const newIndex = prevIndex + 1;
        setInputValue(commandHistory[newIndex] ?? '');
        return newIndex;
      });
    }
  };

  useEffect(() => {
    const focusInput = () => inputRef.current?.focus();
    focusInput();
    document.addEventListener('click', focusInput);
    return () => {
      document.removeEventListener('click', focusInput);
    };
  }, []);

  useEffect(() => {
    setHistoryIndex(null);
  }, [commandHistory]);

  return (
    <div className="flex items-center border-t border-green-700 pt-3 mt-3">
      <span className="text-green-400 mr-2">{'>'}</span>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="bg-transparent border-none text-white focus:outline-none w-full placeholder:text-green-700"
        disabled={isLoading}
        autoFocus
        autoComplete="off"
        spellCheck="false"
        placeholder={isLoading ? 'Processing…' : 'Type a command (try "help")'}
      />
      {isLoading && <span className="text-gray-400 ml-2 caret-blink">_</span>}
    </div>
  );
};

export const Terminal: React.FC<TerminalProps> = ({ history, onCommand, isLoading, commandHistory }) => {
  const endOfHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const renderEntry = useMemo(() => {
    return (entry: HistoryEntry) => {
      const timestamp = entry.timestamp ? (
        <span className="text-green-700 mr-2">[{entry.timestamp}]</span>
      ) : null;

      if (entry.type === 'input') {
        return (
          <div className="flex items-start gap-2">
            {timestamp}
            <span className="text-green-400">{'>'}</span>
            <span className="text-white whitespace-pre-wrap flex-1">{entry.text}</span>
          </div>
        );
      }

      const typeClass =
        entry.type === 'error'
          ? 'text-red-400'
          : entry.type === 'system'
          ? 'text-cyan-300 italic'
          : entry.type === 'event'
          ? 'text-purple-300'
          : 'text-gray-300';

      return (
        <div className="flex items-start gap-2">
          {timestamp}
          <p className={`${typeClass} whitespace-pre-wrap flex-1`} dangerouslySetInnerHTML={{ __html: entry.text }} />
        </div>
      );
    };
  }, []);

  return (
    <div className="flex-grow flex flex-col justify-end" onClick={() => document.querySelector('input')?.focus()}>
      <div className="overflow-y-auto pr-2">
        <div className="text-green-500 text-xs tracking-wide uppercase mb-3">CORE TERMINAL // ACCESS LEVEL: OPERATIVE</div>
        {history.map(entry => (
          <div key={entry.id} className="mb-2">
            {renderEntry(entry)}
          </div>
        ))}
        <div ref={endOfHistoryRef} />
      </div>
      <TerminalInput onCommand={onCommand} isLoading={isLoading} commandHistory={commandHistory} />
    </div>
  );
};
