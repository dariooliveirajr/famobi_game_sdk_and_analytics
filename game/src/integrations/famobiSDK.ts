import type { GameController } from '../application/GameController';
import type { FamobiGameInterface } from './famobi.types';

/**
 * The only place in the game that reads `window.GameInterface`.
 */
export const getFamobiGameInterface = (): FamobiGameInterface | null => window.GameInterface ?? null;

/**
 * Must be called before the Phaser game boots, so no game event is missed.
 */
export const connectFamobiSdkToGameController = (gameController: GameController): void => {
  const gameInterface = getFamobiGameInterface();
  if (!gameInterface) return;

  reportLoadingProgressAndReadiness(gameInterface, gameController);
  reportGameplayLifecycle(gameInterface, gameController);
  reportScoreAndProgress(gameInterface, gameController);
};

/**
 * No asset files to preload (graphics and audio are generated in code), so Phaser booting the scene is the whole loading phase.
 */
const reportLoadingProgressAndReadiness = (famobiGameInterface: FamobiGameInterface, gameController: GameController): void => {
  famobiGameInterface.sendPreloadProgress(0);
  gameController.events.on('ready', () => {
    famobiGameInterface.sendPreloadProgress(100);
    famobiGameInterface.gameReady();
  });
};

/**
 * The SDK may show an ad before gameplay continues, so the game is frozen with
 * its own platform ("system") pause until the SDK call resolves.
 */
const holdGameplayUntilFamobiResolves = (gameController: GameController, famobiCall: () => Promise<void>): void => {
  queueMicrotask(async () => {
    gameController.setSystemPaused(true);
    await famobiCall().catch(() => undefined);
    gameController.setSystemPaused(false);
  });
};

const reportGameplayLifecycle = (famobiGameInterface: FamobiGameInterface, gameController: GameController): void => {
  // A new gameStart or gameFinished must wait until the previous gameEnd (and a possible ad) resolved.
  let latestRunEndReport: Promise<void> = Promise.resolve();

  gameController.events.on('runStarted', ({ level }) => {
    holdGameplayUntilFamobiResolves(gameController, async () => {
      await latestRunEndReport;
      await famobiGameInterface.gameStart(level);
    });
  });

  gameController.events.on('runEnded', ({ reason }) => {
    latestRunEndReport = famobiGameInterface.gameEnd(reason).catch(() => undefined);
  });

  gameController.events.on('gameFinished', () => {
    latestRunEndReport = latestRunEndReport.then(() => famobiGameInterface.gameFinished()).catch(() => undefined);
  });

  // pauseChanged does not say who resumed, so the previous pause source is remembered
  // to tell a player resume apart from the end of our own system hold.
  let previousPauseSource: 'player' | 'system' | null = null;
  gameController.events.on('pauseChanged', ({ paused, source }) => {
    const playerPaused = paused && source === 'player';
    const playerResumed = !paused && previousPauseSource === 'player';
    previousPauseSource = source;

    if (playerPaused) void famobiGameInterface.gamePause().catch(() => undefined);
    if (playerResumed) holdGameplayUntilFamobiResolves(gameController, () => famobiGameInterface.gameResume());
  });
};

/**
 * The game tracks progress as 0-1 per level; it is reported as an integer
 * percentage, the same scale the SDK uses for loading progress.
 */
const reportScoreAndProgress = (famobiGameInterface: FamobiGameInterface, gameController: GameController): void => {
  gameController.events.on('scoreChanged', ({ score, level }) => {
    famobiGameInterface.sendScore(score, { type: 'live', level });
  });

  let lastReportedProgressPercentage: number | null = null;
  gameController.events.on('progressChanged', ({ progress }) => {
    const progressPercentage = Math.round(Math.min(1, Math.max(0, progress)) * 100);
    if (progressPercentage === lastReportedProgressPercentage) return;
    lastReportedProgressPercentage = progressPercentage;
    famobiGameInterface.sendProgress(progressPercentage);
  });
};
