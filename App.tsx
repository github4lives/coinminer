import React, { useState, useCallback, useEffect } from 'react';
import { Terminal } from './components/Terminal';
import { StatusBar } from './components/StatusBar';
import { generateMiningResult } from './services/geminiService';
import type { GameState, HistoryEntry, Upgrade } from './types';

const INITIAL_GAME_STATE: GameState = {
  coins: 20,
  energy: 100,
  pickaxe: 'stone',
  inventory: {},
  isInfiniteEnergy: false,
};

const WELCOME_MESSAGES: HistoryEntry[] = [
  { id: 1, type: 'system', text: 'welcome to coinminer v2.1' },
  { id: 2, type: 'output', text: 'type `mine` to start. type `help` for all commands.' },
  { id: 3, type: 'output', text: 'type `changelog` to see what\'s new.' },
];

export const MATERIALS: Record<string, { baseValue: number }> = {
    'coal': { baseValue: 2 },
    'iron': { baseValue: 5 },
    'gold': { baseValue: 15 },
    'diamond': { baseValue: 50 },
    'geode': { baseValue: 100 },
    'ancient relic': { baseValue: 250 },
};

export const UPGRADES: Record<string, Omit<Upgrade, 'currentLevel'>> = {
    'pickaxe': {
        id: 'pickaxe',
        name: 'pickaxe upgrade',
        description: 'improves the chance of finding rarer materials & events.',
        cost: (level) => [100, 500, 2000][level], // stone -> iron -> steel -> diamond
        maxLevel: 3,
    },
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [history, setHistory] = useState<HistoryEntry[]>(WELCOME_MESSAGES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAutofarmOn, setIsAutofarmOn] = useState<boolean>(false);
  const [upgrades, setUpgrades] = useState<Record<string, Upgrade>>({
      'pickaxe': { ...UPGRADES['pickaxe'], currentLevel: 0 },
  });

  const addHistoryEntry = useCallback((type: HistoryEntry['type'], text: string) => {
    setHistory(prev => [...prev.slice(-100), { id: Date.now() + Math.random(), type, text }]);
  }, []);

  // energy regeneration
  useEffect(() => {
    const interval = setInterval(() => {
        setGameState(prev => {
            if (prev.energy < 100) {
                return { ...prev, energy: Math.min(100, prev.energy + 2) };
            }
            return prev;
        });
    }, 1500);
    return () => clearInterval(interval);
  }, []);
  
  const mineAction = useCallback(async () => {
    const MINE_COST = 5;
    if (gameState.energy < MINE_COST && !gameState.isInfiniteEnergy) {
        addHistoryEntry('error', 'not enough energy to mine.');
        if (isAutofarmOn) setIsAutofarmOn(false);
        return;
    }
    setIsLoading(true);
    if (!gameState.isInfiniteEnergy) {
       setGameState(prev => ({...prev, energy: prev.energy - MINE_COST}));
    }
    
    try {
        const result = await generateMiningResult(gameState.pickaxe);
        addHistoryEntry('system', result.description);

        switch (result.type) {
            case 'material':
                if (result.foundMaterial && result.quantity && result.quantity > 0) {
                    addHistoryEntry('output', `you found ${result.quantity} ${result.foundMaterial}.`);
                    setGameState(prev => ({
                        ...prev,
                        inventory: {
                            ...prev.inventory,
                            [result.foundMaterial!]: (prev.inventory[result.foundMaterial!] || 0) + result.quantity!,
                        }
                    }));
                }
                break;
            case 'event':
                if (result.eventName === 'treasure' && result.coinsFound) {
                    addHistoryEntry('output', `you found ${result.coinsFound} coins!`);
                    setGameState(prev => ({...prev, coins: prev.coins + result.coinsFound!}));
                }
                if ((result.eventName === 'spring' || result.eventName === 'cave_in') && result.energyChange) {
                    const changeText = result.energyChange > 0 ? 'restored' : 'lost';
                    addHistoryEntry('output', `you ${changeText} ${Math.abs(result.energyChange)} energy.`);
                    setGameState(prev => ({...prev, energy: Math.max(0, Math.min(100, prev.energy + result.energyChange!))}));
                }
                if ((result.eventName === 'relic' || result.eventName === 'geode') && result.foundItem) {
                    addHistoryEntry('output', `you got a ${result.foundItem}!`);
                     setGameState(prev => ({
                        ...prev,
                        inventory: {
                            ...prev.inventory,
                            [result.foundItem!]: (prev.inventory[result.foundItem!] || 0) + 1,
                        }
                    }));
                }
                break;
        }
    } catch (error) {
        addHistoryEntry('error', 'your pickaxe strikes something unyielding. try again.');
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  }, [gameState, addHistoryEntry, isAutofarmOn]);

  // autofarm
  useEffect(() => {
    if (!isAutofarmOn || isLoading) return;

    const farmInterval = setInterval(() => {
        mineAction();
    }, 2500);

    return () => clearInterval(farmInterval);
  }, [isAutofarmOn, isLoading, mineAction]);

  const processCommand = useCallback(async (command: string) => {
    const [action, ...args] = command.toLowerCase().split(' ').filter(Boolean);

    switch (action) {
      // CORE COMMANDS
      case 'help':
        addHistoryEntry('output', '--- commands ---');
        addHistoryEntry('output', '`mine`              - use energy to mine for materials.');
        addHistoryEntry('output', '`inventory`         - view your stored materials.');
        addHistoryEntry('output', '`status`            - view your current stats.');
        addHistoryEntry('output', '`sell <item> [all]` - sell materials. e.g. `sell coal all`.');
        addHistoryEntry('output', '`buy pickaxe`         - upgrade your pickaxe.');
        addHistoryEntry('output', '`changelog`         - see what\'s new in v2.1.');
        addHistoryEntry('output', '`clear`             - clear the terminal screen.');
        addHistoryEntry('output', '--- cheats ---');
        addHistoryEntry('output', '`addcoins <amt>`    `addmaterial <name> <amt>`');
        addHistoryEntry('output', '`autofarm <on|off>` `infenergy <on|off>`');
        addHistoryEntry('output', '`setpickaxe <type>` `maxpickaxe` `jackpot` `clearsave`');
        break;
      case 'changelog':
        addHistoryEntry('system', '--- changelog v2.1 ---');
        addHistoryEntry('output', '- unified interface: no more refinery/cheat menus! all commands are run in the terminal.');
        addHistoryEntry('output', '- new `changelog` command (you are here).');
        addHistoryEntry('output', '- updated `help` command with all commands.');
        addHistoryEntry('output', '- general cleanup for a smoother experience.');
        break;
      case 'inventory':
        const items = Object.entries(gameState.inventory).filter(([,amount]) => amount > 0);
        if (items.length === 0) {
            addHistoryEntry('output', 'your inventory is empty.');
        } else {
            addHistoryEntry('output', 'your materials:');
            items.forEach(([name, amount]) => addHistoryEntry('output', `  - ${name}: ${amount}`));
        }
        break;
      case 'status':
        addHistoryEntry('output', `coins: ${gameState.coins}`);
        addHistoryEntry('output', `energy: ${gameState.energy}/100`);
        addHistoryEntry('output', `pickaxe: ${gameState.pickaxe}`);
        break;
      case 'mine':
        mineAction();
        break;
      case 'clear':
        setHistory([]);
        break;

      // REFINERY COMMANDS
      case 'sell':
        const amountStr = args[args.length - 1];
        const materialName = (amountStr === 'all' ? args.slice(0, -1) : args).join(' ');

        if (!materialName) {
            addHistoryEntry('error', 'usage: sell <item> [all|amount]');
            return;
        }
        if (!MATERIALS[materialName]) {
            addHistoryEntry('error', `unknown material: ${materialName}`);
            return;
        }
        if (!gameState.inventory[materialName] || gameState.inventory[materialName] === 0) {
            addHistoryEntry('error', `you have no ${materialName} to sell.`);
            return;
        }
        
        const amountToSell = gameState.inventory[materialName]; // sell all by default
        const value = Math.round(MATERIALS[materialName].baseValue * amountToSell);
        setGameState(prev => ({
            ...prev,
            coins: prev.coins + value,
            inventory: { ...prev.inventory, [materialName]: 0 }
        }));
        addHistoryEntry('output', `sold ${amountToSell} ${materialName} for ${value} coins.`);
        break;

      case 'buy':
        const upgradeId = args[0];
        if (upgradeId !== 'pickaxe') {
            addHistoryEntry('error', `unknown upgrade: ${upgradeId}. you can only 'buy pickaxe'.`);
            return;
        }
        const upgrade = upgrades.pickaxe;
        if (upgrade.maxLevel && upgrade.currentLevel >= upgrade.maxLevel) {
            addHistoryEntry('error', `${upgrade.name} is already max level.`);
            return;
        }
        const cost = upgrade.cost(upgrade.currentLevel);
        if (gameState.coins < cost) {
            addHistoryEntry('error', `not enough coins. need ${cost}.`);
            return;
        }

        const newLevel = upgrades.pickaxe.currentLevel + 1;
        const newPickaxe: GameState['pickaxe'] = ['iron', 'steel', 'diamond'][upgrades.pickaxe.currentLevel] as GameState['pickaxe'];
        setGameState(prev => ({...prev, coins: prev.coins - cost, pickaxe: newPickaxe}));
        setUpgrades(prev => ({ ...prev, pickaxe: {...prev.pickaxe, currentLevel: newLevel}}));
        addHistoryEntry('output', `upgraded to ${newPickaxe} pickaxe for ${cost} coins!`);
        break;

      // CHEAT COMMANDS
      case 'addcoins':
        const amount = parseInt(args[0], 10);
        if (isNaN(amount)) { addHistoryEntry('error', 'invalid amount.'); return; }
        setGameState(prev => ({ ...prev, coins: prev.coins + amount }));
        addHistoryEntry('system', `${amount} coins added.`);
        break;
      case 'addmaterial':
        const name = args.slice(0, -1).join(' ');
        const quantity = parseInt(args[args.length - 1], 10);
        if (!name || !MATERIALS[name]) { addHistoryEntry('error', `unknown material: ${name}.`); return; }
        if (isNaN(quantity)) { addHistoryEntry('error', 'invalid quantity.'); return; }
        setGameState(prev => ({...prev, inventory: {...prev.inventory, [name]: (prev.inventory[name] || 0) + quantity}}));
        addHistoryEntry('system', `added ${quantity} ${name}.`);
        break;
      case 'autofarm':
        const farmState = args[0] === 'on';
        setIsAutofarmOn(farmState);
        addHistoryEntry('system', `autofarm turned ${farmState ? 'on' : 'off'}.`);
        break;
      case 'infenergy':
         const energyState = args[0] === 'on';
         setGameState(prev => ({...prev, isInfiniteEnergy: energyState}));
         addHistoryEntry('system', `infinite energy ${energyState ? 'enabled' : 'disabled'}.`);
         break;
      case 'setpickaxe':
        const type = args[0] as GameState['pickaxe'];
        const pickaxeLevels: GameState['pickaxe'][] = ['stone', 'iron', 'steel', 'diamond'];
        if (!pickaxeLevels.includes(type)) { addHistoryEntry('error', `invalid pickaxe. use: ${pickaxeLevels.join(', ')}`); return; }
        const level = pickaxeLevels.indexOf(type);
        setGameState(prev => ({ ...prev, pickaxe: type }));
        setUpgrades(prev => ({...prev, pickaxe: {...prev.pickaxe, currentLevel: level}}))
        addHistoryEntry('system', `pickaxe set to ${type}.`);
        break;
      case 'maxpickaxe':
        setGameState(prev => ({ ...prev, pickaxe: 'diamond' }));
        setUpgrades(prev => ({...prev, pickaxe: {...prev.pickaxe, currentLevel: 3}}));
        addHistoryEntry('system', 'pickaxe maxed out!');
        break;
      case 'jackpot':
        const jackpotAmount = Math.floor(Math.random() * 9000) + 1000;
        setGameState(prev => ({...prev, coins: prev.coins + jackpotAmount}));
        addHistoryEntry('system', `jackpot! you won ${jackpotAmount} coins!`);
        break;
      case 'clearsave':
        setGameState(INITIAL_GAME_STATE);
        setUpgrades({ 'pickaxe': { ...UPGRADES['pickaxe'], currentLevel: 0 } });
        setIsAutofarmOn(false);
        addHistoryEntry('system', 'game state has been reset.');
        break;

      default:
        addHistoryEntry('error', `command not found: ${command}. type 'help' for a list of commands.`);
        break;
    }
  }, [gameState, addHistoryEntry, mineAction, upgrades]);
  
  const handleCommand = (command: string) => {
    if (isLoading && !isAutofarmOn) return;
    addHistoryEntry('input', command);
    processCommand(command);
  };

  return (
    <div className="bg-black min-h-screen p-4 flex flex-col lowercase">
       <StatusBar 
        gameState={gameState}
        isAutofarmOn={isAutofarmOn}
        />
       <div className="pt-10 flex-grow flex flex-col">
          <Terminal 
              history={history} 
              onCommand={handleCommand}
              isLoading={isLoading} 
          />
       </div>
    </div>
  );
};

export default App;