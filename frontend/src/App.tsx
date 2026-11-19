import { useCallback, useEffect, useState } from 'react';

import { fetchRunStatistics, type RunStatistics } from './api/fetchRunStatistics';
import { FailedRunsPerLevelChart } from './components/FailedRunsPerLevelChart';
import { LevelOverviewTable } from './components/LevelOverviewTable';
import { RunsPerDayChart } from './components/RunsPerDayChart';

type RunStatisticsState =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'loaded'; runStatistics: RunStatistics };

export const App = () => {
  const [runStatisticsState, setRunStatisticsState] = useState<RunStatisticsState>({ status: 'loading' });

  const loadRunStatistics = useCallback(() => {
    setRunStatisticsState({ status: 'loading' });
    fetchRunStatistics()
      .then((runStatistics) => setRunStatisticsState({ status: 'loaded', runStatistics }))
      .catch(() => setRunStatisticsState({ status: 'failed' }));
  }, []);

  useEffect(loadRunStatistics, [loadRunStatistics]);

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Neon Snake · Gameplay Analytics</h1>
          <p className="dashboard-subtitle">All runs stored so far · days in UTC</p>
        </div>
        <button type="button" onClick={loadRunStatistics} disabled={runStatisticsState.status === 'loading'}>
          Refresh
        </button>
      </header>

      {runStatisticsState.status === 'loading' && <p className="dashboard-message">Loading statistics…</p>}
      {runStatisticsState.status === 'failed' && (
        <p className="dashboard-message" role="alert">
          The statistics could not be loaded. Is the backend running?
        </p>
      )}
      {runStatisticsState.status === 'loaded' && runStatisticsState.runStatistics.overview.runsPlayed === 0 && (
        <p className="dashboard-message">
          No runs yet. Play the game or run <code>docker compose exec backend npm run seed</code>.
        </p>
      )}
      {runStatisticsState.status === 'loaded' && runStatisticsState.runStatistics.overview.runsPlayed > 0 && (
        <Dashboard runStatistics={runStatisticsState.runStatistics} />
      )}
    </main>
  );
};

const Dashboard = ({ runStatistics }: { runStatistics: RunStatistics }) => {
  const { overview, runsPerDay, failedRunsPerLevel } = runStatistics;

  return (
    <>
      <LevelOverviewTable runsPlayed={overview.runsPlayed} levelOverviews={overview.levels} />

      <div className="chart-grid">
        <section className="chart-card">
          <h2>Runs per day</h2>
          <p className="chart-question">How much is the game played? Last 14 days.</p>
          <RunsPerDayChart runsPerDay={runsPerDay} />
        </section>
        <section className="chart-card">
          <h2>Failed runs per level</h2>
          <p className="chart-question">In which level do players fail most?</p>
          <FailedRunsPerLevelChart failedRunsPerLevel={failedRunsPerLevel} />
        </section>
      </div>
    </>
  );
};
