import type { GameController } from '../application/GameController';
import type { RunEndReason } from '../application/gameEvents';
import type { GameplayEvent, GameplayEndReason } from './gameplayAnalytics.types';

type ActiveGameplay = {
  runId: string;
  level: number;
  startedAt: number;
};

const gameplayEndReasonByRunEndReason: Record<RunEndReason, GameplayEndReason> = {
  complete: 'completed',
  fail: 'failed',
  quit: 'left'
};

const toIsoDateString = (epochMs: number): string => new Date(epochMs).toISOString();

// Same origin as the game: the Vite preview server forwards /api to the backend.
const gameplayEventsEndpoint = '/api/events';

// keepalive: a request started while the page is closing (pagehide) is still delivered.
// Errors are ignored on purpose: analytics must never break the game.
const sendGameplayEvent = (gameplayEvent: GameplayEvent): void => {
  void fetch(gameplayEventsEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameplayEvent),
    keepalive: true
  }).catch(() => undefined);
};

export const connectGameplayAnalyticsToGameController = (gameController: GameController): void => {
  const sessionId = crypto.randomUUID();
  let activeGameplay: ActiveGameplay | null = null;

  gameController.events.on('runStarted', ({ level, occurredAt }) => {
    activeGameplay = { runId: crypto.randomUUID(), level, startedAt: occurredAt };
    sendGameplayEvent({
      type: 'runStarted',
      sessionId,
      runId: activeGameplay.runId,
      level,
      occurredAt: toIsoDateString(occurredAt)
    });
  });

  gameController.events.on('runEnded', ({ level, score, progress, reason, durationMs, occurredAt }) => {
    if (!activeGameplay) return;
    sendGameplayEvent({
      type: 'runEnded',
      sessionId,
      runId: activeGameplay.runId,
      level,
      occurredAt: toIsoDateString(occurredAt),
      reason: gameplayEndReasonByRunEndReason[reason],
      score,
      progress,
      durationMs
    });
    activeGameplay = null;
  });

  // Closing the tab during gameplay never triggers runEnded, so the current state is read here.
  window.addEventListener('pagehide', () => {
    if (!activeGameplay) return;
    const { score, progress } = gameController.getSnapshot();
    const endedAt = Date.now();
    
    sendGameplayEvent({
      type: 'runEnded',
      sessionId,
      runId: activeGameplay.runId,
      level: activeGameplay.level,
      occurredAt: toIsoDateString(endedAt),
      reason: 'left',
      score,
      progress,
      durationMs: endedAt - activeGameplay.startedAt
    });
    activeGameplay = null;
  });
};
