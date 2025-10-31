import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Terminal } from './components/Terminal';
import { StatusBar } from './components/StatusBar';
import { Shop } from './components/Shop';
import { Cheats } from './components/Cheats';
import { Refinery } from './components/Refinery';
import { sendMessageToAI, startChat } from './services/geminiService';
import type {
  CheatCode,
  HistoryEntry,
  PlayerState,
  RefineryJobBlueprint,
  RefineryJobProgress,
  ShopItem,
} from './types';

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'ice-breaker',
    name: 'ICE Breaker v3.7',
    price: 4800,
    description: 'Adaptive quantum intrusion suite designed to unravel corporate ICE lattices in seconds.',
    benefit: '+18% faster breach routines.',
  },
  {
    id: 'stealth-cloak',
    name: 'Stealth Cloak Module',
    price: 12500,
    description: 'Signal dampening layer masking heat signatures from trace hunters and drones.',
    benefit: 'Heat decay rate doubled while cloaked.',
  },
  {
    id: 'data-spike',
    name: 'Data Spike MK-II',
    price: 2600,
    description: 'One-use spike that pulverizes outdated firewall glyphs and siphons trace data.',
    benefit: 'Unlocks bonus rewards on refinery contracts.',
  },
  {
    id: 'ghost-proxy',
    name: 'Ghost Proxy Mesh',
    price: 7200,
    description: 'Distributed proxy mesh that fractures your presence across the net.',
    benefit: '-10% incoming heat on remote operations.',
  },
  {
    id: 'drone-swarm',
    name: 'Recon Drone Swarm',
    price: 9200,
    description: 'Semi-autonomous drones that scout datascapes and highlight vulnerabilities.',
    benefit: 'Reveals premium refinery contracts.',
  },
];

const REFINERY_JOBS: RefineryJobBlueprint[] = [
  {
    id: 'ghost-net',
    name: 'Ghost Net Sweep',
    durationMs: 180000,
    reward: 1800,
    description: 'Harvest stray data ghosts from abandoned netspace vaults.',
  },
  {
    id: 'hydra-crack',
    name: 'Hydra Crackdown',
    durationMs: 300000,
    reward: 4200,
    description: 'Decompile multi-headed encryption for corporate black budgets.',
  },
  {
    id: 'signal-distill',
    name: 'Signal Distillation',
    durationMs: 420000,
    reward: 6200,
    description: 'Refine intercepted chatter into actionable intel packages.',
  },
];

const CHEAT_CODES: CheatCode[] = [
  {
    code: 'god_mode',
    name: 'Prime Shield',
    description: 'Overrides thermal regulators and sets operatives to invulnerable mode.',
    effectSummary: 'Instantly purges heat buildup.',
  },
  {
    code: 'noclip',
    name: 'Phase Shift',
    description: 'Desynchronize from physical constraints to bypass security partitions.',
    effectSummary: 'Ensures next refinery job is risk-free.',
  },
  {
    code: 'credits_add_9999',
    name: 'Credit Injection',
    description: 'Drops a cache of laundered credits into your ledger.',
    effectSummary: '+9,999 credits wired immediately.',
  },
];

const determineRank = (credits: number, inventorySize: number) => {
  if (credits >= 50000 || inventorySize >= 6) {
    return 'Architect';
  }
  if (credits >= 20000 || inventorySize >= 4) {
    return 'Specialist';
  }
  if (credits >= 10000 || inventorySize >= 2) {
    return 'Operative';
  }
  return 'Runner';
};

const formatDuration = (ms: number) => {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes) {
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }
  return `${seconds}s`;
};

const createInitialPlayerState = (): PlayerState => ({
  credits: 3200,
  inventory: [],
  heat: 18,
  rank: 'Runner',
  activeJob: null,
  completedJobs: [],
  unlockedCheats: [],
});

const timestamp = () =>
  new Date().toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

const HELP_TEXT = [
  '<span class="text-green-400 font-semibold">[ AVAILABLE COMMANDS ]</span>',
  '<span class="text-green-300">help</span> — display this manual.',
  '<span class="text-green-300">status</span> — show operative diagnostics.',
  '<span class="text-green-300">inventory</span> — list acquired gear.',
  '<span class="text-green-300">shop list</span> — preview market inventory.',
  '<span class="text-green-300">buy &lt;item id&gt;</span> — purchase an item.',
  '<span class="text-green-300">refinery status</span> — inspect refinery operations.',
  '<span class="text-green-300">refinery start &lt;job id&gt;</span> — begin a refinery contract.',
  '<span class="text-green-300">cheat &lt;code&gt;</span> — execute a cheat routine (if you dare).',
  '<span class="text-green-300">view &lt;terminal|shop|refinery|cheats&gt;</span> — swap interface views.',
  '<span class="text-green-300">clear</span> — wipe terminal history.',
].join('<br/>');

const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('terminal');
  const [playerState, setPlayerState] = useState<PlayerState>(() => createInitialPlayerState());
  const jobTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addHistoryEntry = useCallback((type: HistoryEntry['type'], text: string) => {
    setHistory(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        type,
        text,
        timestamp: timestamp(),
      },
    ]);
  }, []);

  const applyCheatEffect = useCallback((code: string, state: PlayerState): PlayerState => {
    switch (code) {
      case 'god_mode':
        return { ...state, heat: 0 };
      case 'noclip':
        return state.activeJob
          ? {
              ...state,
              activeJob: {
                ...state.activeJob,
                reward: state.activeJob.reward + 500,
              },
            }
          : state;
      case 'credits_add_9999': {
        const credits = state.credits + 9999;
        return { ...state, credits, rank: determineRank(credits, state.inventory.length) };
      }
      default:
        return state;
    }
  }, []);

  const updateRank = useCallback((state: PlayerState): PlayerState => {
    const nextRank = determineRank(state.credits, state.inventory.length);
    if (nextRank === state.rank) {
      return state;
    }
    return { ...state, rank: nextRank };
  }, []);

  const handlePurchase = useCallback(
    (itemId: string) => {
      const item = SHOP_ITEMS.find(entry => entry.id === itemId);
      if (!item) {
        addHistoryEntry('error', `No market listing found for id '<span class="text-cyan-300">${itemId}</span>'.`);
        return false;
      }

      if (playerState.inventory.includes(itemId)) {
        addHistoryEntry('system', `Duplicate acquisition blocked: <span class="text-cyan-300">${item.name}</span> already in inventory.`);
        return false;
      }

      if (playerState.credits < item.price) {
        addHistoryEntry('error', `Insufficient credits. Required: ${item.price.toLocaleString()} creds.`);
        return false;
      }

      setPlayerState(prev => {
        const updatedCredits = prev.credits - item.price;
        return updateRank({
          ...prev,
          credits: updatedCredits,
          heat: Math.min(100, prev.heat + 3),
          inventory: [...prev.inventory, itemId],
        });
      });

      addHistoryEntry(
        'event',
        `Acquired <span class="text-cyan-300">${item.name}</span> for ${item.price.toLocaleString()} credits.`
      );
      return true;
    },
    [addHistoryEntry, playerState.credits, playerState.inventory, updateRank]
  );

  const handleStartJob = useCallback(
    (jobId: string) => {
      const blueprint = REFINERY_JOBS.find(job => job.id === jobId);
      if (!blueprint) {
        addHistoryEntry('error', `Unknown refinery contract '<span class="text-orange-300">${jobId}</span>'.`);
        return false;
      }

      if (playerState.activeJob) {
        addHistoryEntry('error', 'Refinery already processing a contract. Wait for completion before queueing another.');
        return false;
      }

      const now = Date.now();
      const job: RefineryJobProgress = {
        ...blueprint,
        startedAt: now,
        completesAt: now + blueprint.durationMs,
        status: 'running',
      };

      setPlayerState(prev => ({ ...prev, activeJob: job }));

      addHistoryEntry(
        'event',
        `Refinery job <span class="text-orange-300">${blueprint.name}</span> initiated. ETA ${formatDuration(
          blueprint.durationMs
        )}.`
      );
      return true;
    },
    [addHistoryEntry, playerState.activeJob]
  );

  const handleCheatActivation = useCallback(
    (code: string) => {
      const cheat = CHEAT_CODES.find(entry => entry.code === code);
      if (!cheat) {
        addHistoryEntry('error', `Cheat routine '<span class="text-yellow-300">${code}</span>' not recognized.`);
        return false;
      }

      if (playerState.unlockedCheats.includes(code)) {
        addHistoryEntry('system', `Cheat <span class="text-yellow-300">${cheat.name}</span> already active.`);
        return false;
      }

      setPlayerState(prev => {
        const updated = applyCheatEffect(code, prev);
        return {
          ...updateRank(updated),
          unlockedCheats: [...prev.unlockedCheats, code],
        };
      });

      addHistoryEntry(
        'event',
        `Cheat <span class="text-yellow-300">${cheat.name}</span> executed. CORE is monitoring for countermeasures.`
      );
      return true;
    },
    [addHistoryEntry, applyCheatEffect, playerState.unlockedCheats, updateRank]
  );

  useEffect(() => {
    if (jobTimerRef.current) {
      clearTimeout(jobTimerRef.current);
      jobTimerRef.current = null;
    }

    if (playerState.activeJob?.status === 'running') {
      const jobSnapshot = playerState.activeJob;
      const remaining = Math.max(jobSnapshot.completesAt - Date.now(), 0);

      jobTimerRef.current = setTimeout(() => {
        setPlayerState(prev => {
          if (!prev.activeJob || prev.activeJob.id !== jobSnapshot.id) {
            return prev;
          }

          const completedAt = Date.now();
          const completedJob: RefineryJobProgress = {
            ...prev.activeJob,
            status: 'completed',
            completedAt,
          };

          const updatedCredits = prev.credits + completedJob.reward;
          const updatedState: PlayerState = {
            ...prev,
            credits: updatedCredits,
            heat: Math.min(100, prev.heat + 8),
            activeJob: null,
            completedJobs: [completedJob, ...prev.completedJobs].slice(0, 10),
          };

          return updateRank(updatedState);
        });

        addHistoryEntry(
          'event',
          `Refinery job <span class="text-orange-300">${jobSnapshot.name}</span> completed. +${jobSnapshot.reward.toLocaleString()} credits.`
        );
        jobTimerRef.current = null;
      }, remaining);
    }

    return () => {
      if (jobTimerRef.current) {
        clearTimeout(jobTimerRef.current);
        jobTimerRef.current = null;
      }
    };
  }, [addHistoryEntry, playerState.activeJob, updateRank, setPlayerState]);

  useEffect(() => {
    startChat();
    addHistoryEntry('system', 'CORE online. Systems nominal. Welcome back, operative.');
    addHistoryEntry('output', 'Type <span class="text-green-300">help</span> to review upgraded CORE v2 capabilities.');
    setIsLoading(false);
  }, [addHistoryEntry]);

  const formatStatusReport = useCallback(() => {
    const activeJobLine = playerState.activeJob
      ? `Active Job: <span class="text-orange-300">${playerState.activeJob.name}</span> (${formatDuration(
          Math.max(playerState.activeJob.completesAt - Date.now(), 0)
        )} remaining)`
      : 'Active Job: <span class="text-gray-400">None</span>';

    const lines = [
      '<span class="text-green-400 font-semibold">[ CORE STATUS REPORT ]</span>',
      `Operative Rank: <span class="text-cyan-300">${playerState.rank}</span>`,
      `Ledger Balance: <span class="text-green-300">${playerState.credits.toLocaleString()} credits</span>`,
      `Heat Signature: <span class="text-yellow-300">${playerState.heat}%</span>`,
      activeJobLine,
      `Completed Contracts: <span class="text-orange-300">${playerState.completedJobs.length}</span>`,
      `Inventory Size: <span class="text-cyan-300">${playerState.inventory.length}</span>`,
    ];

    return lines.join('<br/>');
  }, [playerState]);

  const formatInventory = useCallback(() => {
    if (!playerState.inventory.length) {
      return 'Inventory is empty. Acquire gear via the <span class="text-cyan-300">shop</span>.';
    }

    const entries = playerState.inventory
      .map(itemId => SHOP_ITEMS.find(item => item.id === itemId))
      .filter((item): item is ShopItem => Boolean(item))
      .map(item => `• <span class="text-cyan-300">${item?.name}</span> — ${item?.benefit}`);

    return ['<span class="text-green-400 font-semibold">[ EQUIPMENT LOCKER ]</span>', ...entries].join('<br/>');
  }, [playerState.inventory]);

  const formatShopList = useMemo(
    () =>
      ['<span class="text-green-400 font-semibold">[ MARKET INVENTORY ]</span>',
      ...SHOP_ITEMS.map(item =>
        `<span class="text-cyan-300">${item.id}</span> — ${item.name} (${item.price.toLocaleString()} creds)`
      )].join('<br/>'),
    []
  );

  const formatRefineryStatus = useCallback(() => {
    const lines = ['<span class="text-green-400 font-semibold">[ REFINERY STATUS ]</span>'];
    if (playerState.activeJob) {
      lines.push(
        `Running: <span class="text-orange-300">${playerState.activeJob.name}</span> (eta ${formatDuration(
          Math.max(playerState.activeJob.completesAt - Date.now(), 0)
        )})`
      );
    } else {
      lines.push('Running: <span class="text-gray-400">Idle</span>');
    }
    if (playerState.completedJobs.length) {
      lines.push(`Completed: ${playerState.completedJobs
        .slice(0, 5)
        .map(job => `<span class="text-orange-300">${job.name}</span>`)
        .join(', ')}`);
    } else {
      lines.push('Completed: <span class="text-gray-400">None</span>');
    }
    return lines.join('<br/>');
  }, [playerState.activeJob, playerState.completedJobs]);

  const handleCommand = useCallback(
    async (rawCommand: string) => {
      const command = rawCommand.trim();
      if (!command) {
        return;
      }

      addHistoryEntry('input', command);
      setCommandHistory(prev => [...prev.slice(-49), command]);
      setIsLoading(true);

      const [keyword, ...rest] = command.toLowerCase().split(/\s+/);

      const finish = () => setIsLoading(false);

      if (keyword === 'view' && rest[0]) {
        const view = rest[0];
        const validViews = ['terminal', 'shop', 'refinery', 'cheats'];
        if (validViews.includes(view)) {
          setActiveView(view);
          addHistoryEntry('system', `Switched to <span class="text-green-300">${view}</span> view.`);
        } else {
          addHistoryEntry('error', `Unknown view '<span class="text-green-300">${view}</span>'.`);
        }
        finish();
        return;
      }

      if (keyword === 'help') {
        addHistoryEntry('system', HELP_TEXT);
        finish();
        return;
      }

      if (keyword === 'status') {
        addHistoryEntry('output', formatStatusReport());
        finish();
        return;
      }

      if (keyword === 'inventory') {
        addHistoryEntry('output', formatInventory());
        finish();
        return;
      }

      if (keyword === 'shop' && rest[0] === 'list') {
        addHistoryEntry('output', formatShopList);
        finish();
        return;
      }

      if (keyword === 'buy' && rest[0]) {
        handlePurchase(rest[0]);
        finish();
        return;
      }

      if (keyword === 'refinery') {
        const action = rest[0];
        if (!action || action === 'status') {
          addHistoryEntry('output', formatRefineryStatus());
          finish();
          return;
        }

        if (action === 'start' && rest[1]) {
          handleStartJob(rest[1]);
          finish();
          return;
        }

        addHistoryEntry('error', "Refinery command not recognized. Try 'refinery status' or 'refinery start <job id>'.");
        finish();
        return;
      }

      if (keyword === 'cheat' && rest[0]) {
        handleCheatActivation(rest[0]);
        finish();
        return;
      }

      if (keyword === 'clear') {
        setHistory([]);
        addHistoryEntry('system', 'Terminal buffer cleared.');
        finish();
        return;
      }

      try {
        const response = await sendMessageToAI(command);
        addHistoryEntry('output', response);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        addHistoryEntry('error', errorMessage);
      } finally {
        finish();
      }
    },
    [
      addHistoryEntry,
      formatInventory,
      formatRefineryStatus,
      formatShopList,
      formatStatusReport,
      handleCheatActivation,
      handlePurchase,
      handleStartJob,
    ]
  );

  const renderView = () => {
    switch (activeView) {
      case 'shop':
        return (
          <Shop
            items={SHOP_ITEMS}
            credits={playerState.credits}
            ownedItems={playerState.inventory}
            onPurchase={handlePurchase}
          />
        );
      case 'refinery':
        return (
          <Refinery
            availableJobs={REFINERY_JOBS}
            activeJob={playerState.activeJob}
            completedJobs={playerState.completedJobs}
            onStartJob={handleStartJob}
          />
        );
      case 'cheats':
        return (
          <Cheats
            cheats={CHEAT_CODES}
            unlockedCheats={playerState.unlockedCheats}
            onActivateCheat={handleCheatActivation}
          />
        );
      case 'terminal':
      default:
        return (
          <Terminal
            history={history}
            onCommand={handleCommand}
            isLoading={isLoading}
            commandHistory={commandHistory}
          />
        );
    }
  };

  return (
    <main className="bg-black text-white font-mono min-h-screen flex flex-col p-4 sm:p-6">
      <div className="border border-green-500/60 p-4 sm:p-6 flex-grow flex flex-col bg-black/60 shadow-[0_0_24px_rgba(0,255,180,0.08)]">
        {renderView()}
      </div>
      <StatusBar activeView={activeView} credits={playerState.credits} heat={playerState.heat} rank={playerState.rank} />
    </main>
  );
};

export default App;
