import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Terminal } from './components/Terminal';
import { StatusBar } from './components/StatusBar';
import { Refinery } from './components/Refinery';
import { Cheats } from './components/Cheats';
import { generateMiningResult } from './services/geminiService';
import type { GameState, HistoryEntry, MiningResult, Upgrade } from './types';

const INITIAL_GAME_STATE: GameState = {
  coins: 20,
  energy: 100,
  maxEnergy: 100,
  pickaxe: 'stone',
  inventory: {},
};

const WELCOME_MESSAGES: HistoryEntry[] = [
  { id: 1, type: 'system', text: 'welcome to coinminer v2' },
  { id: 2, type: 'output', text: 'mine for materials, sell them at the refinery, and buy upgrades.' },
  { id: 3, type: 'output', text: 'type `help` to see a list of available commands.' },
];

export const MATERIALS: Record<string, { baseValue: number }> = {
    'coal': { baseValue: 2 },
    'iron': { baseValue: 5 },
    'gold': { baseValue: 15 },
    'diamond': { baseValue: 50 },
};

export const UPGRADES: Record<string, Omit<Upgrade, 'currentLevel'>> = {
    'pickaxe': {
        id: 'pickaxe',
        name: 'pickaxe upgrade',
        description: 'improves the chance of finding rarer materials.',
        cost: (level) => [100, 500, 2000][level], // stone -> iron -> steel -> diamond
        maxLevel: 3,
    },
    'energy_capacity': {
        id: 'energy_capacity',
        name: 'energy capacity',
        description: 'increases your maximum energy by 25.',
        cost: (level) => 50 + (level * 75),
    },
    'energy_regen': {
        id: 'energy_regen',
        name: 'energy regeneration',
        description: 'increases energy regeneration by 1 per tick.',
        cost: (level) => 100 + (level * 150),
    },
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [history, setHistory] = useState<HistoryEntry[]>(WELCOME_MESSAGES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefineryOpen, setIsRefineryOpen] = useState<boolean>(false);
  const [isCheatsOpen, setIsCheatsOpen] = useState<boolean>(false);
  const [upgrades, setUpgrades] = useState<Record<string, Upgrade>>({
      'pickaxe': { ...UPGRADES['pickaxe'], currentLevel: 0 },
      'energy_capacity': { ...UPGRADES['energy_capacity'], currentLevel: 0 },
      'energy_regen': { ...UPGRADES['energy_regen'], currentLevel: 0 },
  });

  const addHistoryEntry = (type: HistoryEntry['type'], text: string) => {
    setHistory(prev => [...prev, { id: Date.now() + Math.random(), type, text }]);
  };

  // energy regeneration
  useEffect(() => {
    const regenRate = 1 + upgrades.energy_regen.currentLevel;
    const interval = setInterval(() => {
        setGameState(prev => {
            if (prev.energy < prev.maxEnergy) {
                return { ...prev, energy: Math.min(prev.maxEnergy, prev.energy + regenRate) };
            }
            return prev;
        });
    }, 2000); // regenerates every 2 seconds
    return () => clearInterval(interval);
  }, [upgrades.energy_regen.currentLevel]);
  

  const processCommand = useCallback(async (command: string) => {
    const [action, ...args] = command.toLowerCase().split(' ').filter(Boolean);
    const MINE_COST = 5;

    switch (action) {
      case 'help':
        addHistoryEntry('output', 'available commands:');
        addHistoryEntry('output', '  `help`      - show this help message.');
        addHistoryEntry('output', '  `mine`      - use energy to mine for materials.');
        addHistoryEntry('output', '  `inventory` - view your stored materials.');
        addHistoryEntry('output', '  `status`    - view your current stats.');
        addHistoryEntry('output', '  `refinery`  - enter the refinery to sell and upgrade.');
        addHistoryEntry('output', '  `cheats`    - open the cheats menu.');
        addHistoryEntry('output', '  `clear`     - clear the terminal screen.');
        break;
      case 'inventory':
        const items = Object.entries(gameState.inventory);
        if (items.length === 0) {
            addHistoryEntry('output', 'your inventory is empty.');
        } else {
            addHistoryEntry('output', 'your materials:');
            items.forEach(([name, amount]) => addHistoryEntry('output', `  - ${name}: ${amount}`));
        }
        break;
      case 'status':
        addHistoryEntry('output', `coins: ${gameState.coins}`);
        addHistoryEntry('output', `energy: ${gameState.energy}/${gameState.maxEnergy}`);
        addHistoryEntry('output', `pickaxe: ${gameState.pickaxe}`);
        break;
      case 'mine':
        if (gameState.energy < MINE_COST) {
            addHistoryEntry('error', 'not enough energy to mine. wait for it to regenerate.');
            return;
        }
        setIsLoading(true);
        setGameState(prev => ({...prev, energy: prev.energy - MINE_COST}));
        try {
            const result = await generateMiningResult(gameState.pickaxe);
            addHistoryEntry('system', result.description);
            if (result.foundMaterial && result.quantity > 0) {
                addHistoryEntry('output', `you found ${result.quantity} ${result.foundMaterial}.`);
                setGameState(prev => ({
                    ...prev,
                    inventory: {
                        ...prev.inventory,
                        [result.foundMaterial!]: (prev.inventory[result.foundMaterial!] || 0) + result.quantity,
                    }
                }));
            }
        } catch (error) {
            addHistoryEntry('error', 'your pickaxe strikes something unyielding. try again.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
        break;
       case 'refinery':
        setIsRefineryOpen(true);
        break;
       case 'cheats':
        setIsCheatsOpen(true);
        addHistoryEntry('system', 'developer cheats enabled.');
        break;
      case 'clear':
        setHistory([]);
        break;
      default:
        addHistoryEntry('error', `command not found: ${command}. type 'help' for a list of commands.`);
        break;
    }
  }, [gameState, upgrades]);
  
  const handleCommand = (command: string) => {
    if (isLoading) return;
    addHistoryEntry('input', command);
    processCommand(command);
  };
  
  const handleRefineryAction = (type: 'sell' | 'buy', target: string, amountStr?: string): string => {
      if (type === 'sell') {
          const materialName = target.toLowerCase();
          if (!MATERIALS[materialName]) {
              return `unknown material: ${materialName}`;
          }
          if (!gameState.inventory[materialName] || gameState.inventory[materialName] === 0) {
              return `you have no ${materialName} to sell.`;
          }
          
          let amountToSell = gameState.inventory[materialName];
          if (amountStr && amountStr !== 'all') {
              const parsedAmount = parseInt(amountStr, 10);
              if (isNaN(parsedAmount) || parsedAmount <= 0) return 'invalid amount.';
              if (parsedAmount > amountToSell) return `you only have ${amountToSell} ${materialName}.`;
              amountToSell = parsedAmount;
          }
          
          const value = Math.round(MATERIALS[materialName].baseValue * amountToSell);
          setGameState(prev => ({
              ...prev,
              coins: prev.coins + value,
              inventory: { ...prev.inventory, [materialName]: prev.inventory[materialName] - amountToSell }
          }));
          return `sold ${amountToSell} ${materialName} for ${value} coins.`;
      }

      if (type === 'buy') {
        const upgradeId = target.toLowerCase();
        const upgrade = upgrades[upgradeId];
        if (!upgrade) return `unknown upgrade: ${upgradeId}`;
        
        if (upgrade.maxLevel && upgrade.currentLevel >= upgrade.maxLevel) {
            return `${upgrade.name} is already max level.`;
        }

        const cost = upgrade.cost(upgrade.currentLevel);
        if (gameState.coins < cost) {
            return `not enough coins. need ${cost}.`;
        }

        setGameState(prev => ({ ...prev, coins: prev.coins - cost }));
        setUpgrades(prev => ({ ...prev, [upgradeId]: {...prev[upgradeId], currentLevel: prev[upgradeId].currentLevel + 1}}));

        // apply immediate stat changes
        if (upgradeId === 'pickaxe') {
            const newPickaxe: GameState['pickaxe'] = ['iron', 'steel', 'diamond'][upgrade.currentLevel] as GameState['pickaxe'];
            setGameState(prev => ({...prev, pickaxe: newPickaxe}));
            return `upgraded to ${newPickaxe} pickaxe for ${cost} coins!`;
        }
        if (upgradeId === 'energy_capacity') {
            setGameState(prev => ({...prev, maxEnergy: prev.maxEnergy + 25}));
            return `upgraded energy capacity for ${cost} coins!`;
        }
        
        return `purchased ${upgrade.name} for ${cost} coins.`;
      }
      return 'invalid action.';
  };
  
  const closeRefinery = () => {
      setIsRefineryOpen(false);
      addHistoryEntry('system', 'you have left the refinery.');
  };

  const handleCheatCommand = (command: string): string => {
    const [action, ...args] = command.toLowerCase().split(' ').filter(Boolean);
    switch (action) {
        case 'addcoins':
            const amount = parseInt(args[0], 10);
            if (isNaN(amount)) return 'invalid amount.';
            setGameState(prev => ({ ...prev, coins: prev.coins + amount }));
            return `${amount} coins added.`;
        case 'addmaterial':
            const name = args[0];
            const quantity = parseInt(args[1], 10);
            if (!name || !MATERIALS[name]) return 'unknown material.';
            if (isNaN(quantity)) return 'invalid quantity.';
            setGameState(prev => ({...prev, inventory: {...prev.inventory, [name]: (prev.inventory[name] || 0) + quantity}}));
            return `added ${quantity} ${name}.`;
        case 'setenergy':
            const energy = parseInt(args[0], 10);
            if (isNaN(energy)) return 'invalid amount.';
            setGameState(prev => ({...prev, energy: Math.min(prev.maxEnergy, energy)}));
            return `energy set to ${energy}.`;
        default:
            return `unknown cheat command: ${action}.`;
    }
  };

  const closeCheats = () => {
      setIsCheatsOpen(false);
      addHistoryEntry('system', 'exited cheat menu.');
  }

  const renderContent = () => {
    if (isCheatsOpen) {
        return <Cheats onCommand={handleCheatCommand} onExit={closeCheats} />;
    }
    if (isRefineryOpen) {
        return <Refinery 
            upgrades={upgrades}
            gameState={gameState}
            onAction={handleRefineryAction}
            onExit={closeRefinery}
        />;
    }
    return <Terminal 
        history={history} 
        onCommand={handleCommand}
        isLoading={isLoading} 
        isMinigameActive={false}
    />;
  };

  return (
    <div className="bg-black min-h-screen p-4 flex flex-col lowercase">
       <StatusBar 
        coins={gameState.coins} 
        energy={gameState.energy} 
        maxEnergy={gameState.maxEnergy}
        pickaxe={gameState.pickaxe} 
        />
       {renderContent()}
    </div>
  );
};

export default App;
