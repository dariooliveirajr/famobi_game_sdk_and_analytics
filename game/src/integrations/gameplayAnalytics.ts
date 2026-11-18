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

// TODO: Placeholder until the backend exists (part 3): the events are only logged.
const sendGameplayEvent = (gameplayEvent: GameplayEvent): void => {
  console.info(`[analytics] ${gameplayEvent.type}`, gameplayEvent);
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
