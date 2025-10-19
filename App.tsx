import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Terminal } from './components/Terminal';
import { StatusBar } from './components/StatusBar';
import { Shop } from './components/Shop';
import { Cheats } from './components/Cheats';
import { Refinery } from './components/Refinery';
import { sendMessageToAI, startChat } from './services/geminiService';
import { useGameState } from './services/useGameState';
import type { HistoryEntry } from './types';

const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('terminal');
  const addCredits = useGameState((state) => state.addCredits);

  const addHistoryEntry = (type: HistoryEntry['type'], text: string) => {
    setHistory(prev => [...prev, { id: Date.now(), type, text }]);
  };

  const handleCommand = useCallback(async (command: string) => {
    addHistoryEntry('input', command);
    setIsLoading(true);

    const lowerCaseCommand = command.toLowerCase();

    if (lowerCaseCommand.startsWith('view ')) {
      const view = lowerCaseCommand.split(' ')[1];
      const validViews = ['terminal', 'shop', 'refinery', 'cheats'];
      if (validViews.includes(view)) {
        setActiveView(view);
        addHistoryEntry('system', `Switched to ${view} view.`);
      } else {
        addHistoryEntry('error', `Error: Unknown view '${view}'. Available views: terminal, shop, refinery, cheats.`);
      }
      setIsLoading(false);
      return;
    }

    if (lowerCaseCommand === 'credits_add_9999') {
      addCredits(9999);
      addHistoryEntry('system', 'Cheat activated: 9999 credits added.');
      setIsLoading(false);
      return;
    }

    if (lowerCaseCommand === 'god_mode' || lowerCaseCommand === 'noclip') {
      addHistoryEntry('system', `Cheat code '${lowerCaseCommand}' is not implemented yet.`);
      setIsLoading(false);
      return;
    }

    try {
      const response = await sendMessageToAI(command);
      addHistoryEntry('output', response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      addHistoryEntry('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      startChat();
      // Initial message from AI
      addHistoryEntry('system', "CORE online. Systems nominal. Welcome, operative. How may I assist you?");
      setIsLoading(false);
    };
    initialize();
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'shop':
        return <Shop />;
      case 'refinery':
        return <Refinery />;
      case 'cheats':
        return <Cheats />;
      case 'terminal':
      default:
        return <Terminal history={history} onCommand={handleCommand} isLoading={isLoading} />;
    }
  }

  return (
    <main className="bg-black text-white font-mono h-screen flex flex-col p-4">
      <Header />
      <div className="border border-green-500 p-4 flex-grow flex flex-col">
        {renderView()}
      </div>
      <StatusBar activeView={activeView} />
    </main>
  );
};

export default App;
