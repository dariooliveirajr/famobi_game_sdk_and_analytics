export type GameplayEndReason = 'completed' | 'failed' | 'left';

export type GameplayStartedEvent = {
  type: 'runStarted';
  sessionId: string;
  runId: string;
  level: number;
  occurredAt: string;
};

export type GameplayEndedEvent = {
  type: 'runEnded';
  sessionId: string;
  runId: string;
  level: number;
  occurredAt: string;
  reason: GameplayEndReason;
  score: number;
  progress: number;
  durationMs: number;
};

export type GameplayEvent = GameplayStartedEvent | GameplayEndedEvent;
