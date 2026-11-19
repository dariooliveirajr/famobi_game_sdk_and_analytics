// Same shape as the backend's RunStatistics 
export type LevelOverview = {
  level: number;
  runsPlayed: number;
  averageTimeSpentPerRunMs: number | null;
  completedRate: number | null;
  leftRate: number | null;
  averageProgressAtEnd: number | null;
};

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

export const fetchRunStatistics = async (): Promise<RunStatistics> => {
  const response = await fetch('/api/stats');
  if (!response.ok) throw new Error(`Statistics request failed with status ${response.status}`);
  return response.json();
};
