import type { StoredRun } from '../events/runRepository.js';

const levels = [1, 2, 3] as const;
const millisecondsPerDay = 24 * 60 * 60 * 1000;

// Rates and averages are based on ended runs only; null while a level has no ended run.
export type LevelOverview = {
  level: number;
  runsPlayed: number;
  averageTimeSpentPerRunMs: number | null;
  completedRate: number | null;
  leftRate: number | null;
  averageProgressAtEnd: number | null;
};

// failedRate is failed ÷ ended runs of the level; null while the level has no ended run.
export type FailedRunsOfLevel = {
  level: number;
  failedRuns: number;
  failedRate: number | null;
};

export type RunStatistics = {
  overview: {
    runsPlayed: number;
    levels: LevelOverview[];
  };
  runsPerDay: { day: string; runs: number }[];
  failedRunsPerLevel: FailedRunsOfLevel[];
};

const toUtcDayString = (date: Date): string => date.toISOString().slice(0, 10);

const divideOrNull = (numerator: number, denominator: number): number | null =>
  denominator === 0 ? null : numerator / denominator;

const averageOrNull = (values: number[]): number | null =>
  divideOrNull(values.reduce((sum, value) => sum + value, 0), values.length);

const calculateLevelOverview = (runs: StoredRun[], level: number): LevelOverview => {
  const runsOfLevel = runs.filter((run) => run.level === level);
  const endedRunsOfLevel = runsOfLevel.filter((run) => run.reason !== undefined);
  const countEndedRuns = (reason: StoredRun['reason']): number =>
    endedRunsOfLevel.filter((run) => run.reason === reason).length;

  return {
    level,
    runsPlayed: runsOfLevel.length,
    averageTimeSpentPerRunMs: averageOrNull(endedRunsOfLevel.map((run) => run.durationMs ?? 0)),
    completedRate: divideOrNull(countEndedRuns('completed'), endedRunsOfLevel.length),
    leftRate: divideOrNull(countEndedRuns('left'), endedRunsOfLevel.length),
    averageProgressAtEnd: averageOrNull(endedRunsOfLevel.map((run) => run.progress ?? 0))
  };
};

const calculateRunsPerDay = (runs: StoredRun[], today: Date, numberOfDays: number): RunStatistics['runsPerDay'] => {
  // Days in UTC, oldest first, including days without runs.
  const days = Array.from({ length: numberOfDays }, (_, index) =>
    toUtcDayString(new Date(today.getTime() - (numberOfDays - 1 - index) * millisecondsPerDay))
  );
  const runsPerDayString = new Map<string, number>(days.map((day) => [day, 0]));
  for (const run of runs) {
    const runDate = run.startedAt ?? run.endedAt;
    if (!runDate) continue;
    const day = toUtcDayString(runDate);
    if (runsPerDayString.has(day)) runsPerDayString.set(day, runsPerDayString.get(day)! + 1);
  }
  return days.map((day) => ({ day, runs: runsPerDayString.get(day)! }));
};

const calculateFailedRunsOfLevel = (runs: StoredRun[], level: number): FailedRunsOfLevel => {
  const endedRunsOfLevel = runs.filter((run) => run.level === level && run.reason !== undefined);
  const failedRuns = endedRunsOfLevel.filter((run) => run.reason === 'failed').length;
  return { level, failedRuns, failedRate: divideOrNull(failedRuns, endedRunsOfLevel.length) };
};

export const calculateRunStatistics = (runs: StoredRun[], today: Date, numberOfDays: number): RunStatistics => ({
  overview: {
    runsPlayed: runs.length,
    levels: levels.map((level) => calculateLevelOverview(runs, level))
  },
  runsPerDay: calculateRunsPerDay(runs, today, numberOfDays),
  failedRunsPerLevel: levels.map((level) => calculateFailedRunsOfLevel(runs, level))
});
