import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { StoredRun } from '../events/runRepository.js';
import { calculateRunStatistics } from './runStatistics.js';

const today = new Date('2026-11-19T12:00:00.000Z');
let nextRunNumber = 1;

const createStoredRun = (storedFields: Partial<StoredRun> & { level: number }): StoredRun => ({
  runId: `run-${nextRunNumber++}`,
  sessionId: 'session-1',
  startedAt: new Date('2026-11-19T10:00:00.000Z'),
  ...storedFields
});

const createEndedRun = (level: number, reason: NonNullable<StoredRun['reason']>, progress: number, durationMs: number): StoredRun =>
  createStoredRun({ level, reason, progress, durationMs, score: 0, endedAt: new Date('2026-11-19T10:01:00.000Z') });

describe('calculateRunStatistics', () => {
  it('returns zeros and nulls when no run is stored', () => {
    const runStatistics = calculateRunStatistics([], today, 14);

    assert.equal(runStatistics.overview.runsPlayed, 0);
    assert.deepEqual(runStatistics.overview.levels[0], {
      level: 1,
      runsPlayed: 0,
      averageTimeSpentPerRunMs: null,
      completedRate: null,
      leftRate: null,
      averageProgressAtEnd: null
    });
    assert.deepEqual(runStatistics.failedRunsPerLevel[2], { level: 3, failedRuns: 0, failedRate: null });
  });

  it('calculates the overview of a level from its ended runs', () => {
    const runs = [
      createEndedRun(1, 'completed', 1, 30_000),
      createEndedRun(1, 'failed', 0.5, 20_000),
      createEndedRun(1, 'left', 0.25, 10_000),
      createEndedRun(1, 'completed', 1, 40_000)
    ];

    const [levelOneOverview] = calculateRunStatistics(runs, today, 14).overview.levels;

    assert.deepEqual(levelOneOverview, {
      level: 1,
      runsPlayed: 4,
      averageTimeSpentPerRunMs: 25_000,
      completedRate: 0.5,
      leftRate: 0.25,
      averageProgressAtEnd: 0.6875
    });
  });

  it('counts runs that have not ended in runs played, but not in rates and averages', () => {
    const runs = [createEndedRun(2, 'completed', 1, 30_000), createStoredRun({ level: 2 })];

    const runStatistics = calculateRunStatistics(runs, today, 14);
    const levelTwoOverview = runStatistics.overview.levels[1];

    assert.equal(runStatistics.overview.runsPlayed, 2);
    assert.equal(levelTwoOverview.runsPlayed, 2);
    assert.equal(levelTwoOverview.completedRate, 1);
    assert.equal(levelTwoOverview.averageTimeSpentPerRunMs, 30_000);
  });

  it('keeps the levels apart', () => {
    const runs = [createEndedRun(1, 'completed', 1, 30_000), createEndedRun(3, 'failed', 0.5, 50_000)];

    const levelOverviews = calculateRunStatistics(runs, today, 14).overview.levels;

    assert.deepEqual(
      levelOverviews.map(({ level, runsPlayed, completedRate }) => ({ level, runsPlayed, completedRate })),
      [
        { level: 1, runsPlayed: 1, completedRate: 1 },
        { level: 2, runsPlayed: 0, completedRate: null },
        { level: 3, runsPlayed: 1, completedRate: 0 }
      ]
    );
  });

  it('counts failed runs per level with their share of ended runs', () => {
    const runs = [
      createEndedRun(2, 'failed', 0.3, 20_000),
      createEndedRun(2, 'failed', 0.6, 25_000),
      createEndedRun(2, 'completed', 1, 40_000),
      createEndedRun(2, 'left', 0.1, 5_000),
      createStoredRun({ level: 2 })
    ];

    const levelTwoFailedRuns = calculateRunStatistics(runs, today, 14).failedRunsPerLevel[1];

    assert.deepEqual(levelTwoFailedRuns, { level: 2, failedRuns: 2, failedRate: 0.5 });
  });

  it('returns every day of the period in UTC, oldest first, including days without runs', () => {
    const runs = [
      createStoredRun({ level: 1, startedAt: new Date('2026-11-17T23:30:00.000Z') }),
      createStoredRun({ level: 1, startedAt: new Date('2026-11-19T00:10:00.000Z') }),
      createStoredRun({ level: 2, startedAt: new Date('2026-11-19T08:00:00.000Z') }),
      createStoredRun({ level: 1, startedAt: new Date('2026-11-01T08:00:00.000Z') })
    ];

    const runsPerDay = calculateRunStatistics(runs, today, 3).runsPerDay;

    assert.deepEqual(runsPerDay, [
      { day: '2026-11-17', runs: 1 },
      { day: '2026-11-18', runs: 0 },
      { day: '2026-11-19', runs: 2 }
    ]);
  });

  it('uses the end date for a run whose start event never arrived', () => {
    const runWithoutStart = createStoredRun({ level: 1, startedAt: undefined, endedAt: new Date('2026-11-18T09:00:00.000Z') });

    const runsPerDay = calculateRunStatistics([runWithoutStart], today, 2).runsPerDay;

    assert.deepEqual(runsPerDay, [
      { day: '2026-11-18', runs: 1 },
      { day: '2026-11-19', runs: 0 }
    ]);
  });
});
