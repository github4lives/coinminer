import React, { useMemo, useEffect, useState } from 'react';
import type { RefineryJobBlueprint, RefineryJobProgress } from '../types';

interface RefineryProps {
  availableJobs: RefineryJobBlueprint[];
  activeJob: RefineryJobProgress | null;
  completedJobs: RefineryJobProgress[];
  onStartJob: (jobId: string) => void;
}

const formatDuration = (ms: number) => {
  const seconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

export const Refinery: React.FC<RefineryProps> = ({ availableJobs, activeJob, completedJobs, onStartJob }) => {
  const [, forceTick] = useState(0);

  useEffect(() => {
    if (!activeJob) {
      return;
    }
    const interval = setInterval(() => forceTick(tick => tick + 1), 1000);
    return () => clearInterval(interval);
  }, [activeJob]);

  const activeRemaining = activeJob ? Math.max(activeJob.completesAt - Date.now(), 0) : 0;

  const sortedCompleted = useMemo(
    () =>
      [...completedJobs].sort(
        (a, b) => (b.completedAt ?? b.completesAt) - (a.completedAt ?? a.completesAt)
      ),
    [completedJobs]
  );

  return (
    <div className="p-6 border border-orange-400 bg-black/40 h-full overflow-y-auto">
      <h2 className="text-orange-300 text-xl mb-4 tracking-wide">[ DATA REFINERY ]</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-orange-700/50 p-4 rounded bg-black/60">
          <h3 className="text-orange-200 text-lg font-semibold">Active Process</h3>
          {activeJob ? (
            <div className="mt-3 text-sm text-gray-300 space-y-1">
              <p><span className="text-orange-300">Job:</span> {activeJob.name}</p>
              <p><span className="text-orange-300">Reward:</span> {activeJob.reward.toLocaleString()} creds</p>
              <p><span className="text-orange-300">Status:</span> {activeRemaining > 0 ? 'RUNNING' : 'COMPLETING'}</p>
              <p><span className="text-orange-300">Time Remaining:</span> {formatDuration(activeRemaining)}</p>
            </div>
          ) : (
            <p className="mt-3 text-gray-400 text-sm">No active jobs. Queue something from the right panel or via the terminal.</p>
          )}
        </section>

        <section className="border border-orange-700/50 p-4 rounded bg-black/60">
          <h3 className="text-orange-200 text-lg font-semibold">Available Contracts</h3>
          <div className="space-y-4 mt-3">
            {availableJobs.map(job => (
              <div key={job.id} className="text-sm text-gray-300 border border-orange-700/30 p-3 rounded">
                <div className="flex items-center justify-between">
                  <p className="text-orange-200 font-semibold">{job.name}</p>
                  <button
                    className={`px-3 py-1 border border-orange-400 text-xs uppercase tracking-wide transition ${
                      activeJob ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-400 hover:text-black'
                    }`}
                    onClick={() => onStartJob(job.id)}
                    disabled={Boolean(activeJob)}
                  >
                    Initiate
                  </button>
                </div>
                <p className="text-orange-400 text-[10px] uppercase tracking-wider mt-1">/{job.id}</p>
                <p className="mt-1">{job.description}</p>
                <p className="mt-1 text-orange-300 text-xs">Reward: {job.reward.toLocaleString()} creds</p>
                <p className="text-orange-300 text-xs">Duration: {formatDuration(job.durationMs)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="border border-orange-700/50 p-4 rounded bg-black/60 mt-6">
        <h3 className="text-orange-200 text-lg font-semibold">Completed Jobs</h3>
        {sortedCompleted.length ? (
          <ul className="mt-3 space-y-2 text-sm text-gray-300">
            {sortedCompleted.map(job => (
              <li
                key={`${job.id}-${job.completedAt ?? job.completesAt}`}
                className="flex justify-between border border-orange-700/30 p-2 rounded"
              >
                <span>{job.name}</span>
                <span className="text-orange-300">+{job.reward.toLocaleString()} creds</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-gray-400 text-sm">No completed jobs logged yet. Initiate one to begin the production line.</p>
        )}
      </section>

      <p className="mt-6 text-sm text-orange-200 italic">Terminal command hint: "refinery start &lt;job id&gt;" or "refinery status".</p>
    </div>
  );
};
