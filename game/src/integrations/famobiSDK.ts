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

  const systemPause = createSystemPauseCoordinator(gameInterface, gameController);

  reportLoadingProgressAndReadiness(gameInterface, gameController);
  reportGameplayLifecycle(gameInterface, gameController, systemPause);
  reportScoreAndProgress(gameInterface, gameController);
  followFamobiPauseRequests(gameInterface, systemPause);
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

type SystemPauseCoordinator = {
  holdGameplayUntilFamobiResolves(famobiCall: () => Promise<void>): void;
  applySystemPause(): void;
};

/**
 * The game has a single platform ("system") pause, used for two reasons:
 * holding gameplay while an SDK call is pending (the SDK may show an ad), and
 * the platform's external pause. The game only unpauses when neither applies,
 * so one can never cancel the other.
 * Holds are deferred to a microtask because changing the game state inside an
 * event listener would re-enter the controller mid-update; they still run
 * before the next game tick.
 */
const createSystemPauseCoordinator = (famobiGameInterface: FamobiGameInterface, gameController: GameController): SystemPauseCoordinator => {
  let pendingFamobiCalls = 0;

  const applySystemPause = (): void => {
    gameController.setSystemPaused(pendingFamobiCalls > 0 || famobiGameInterface.isPaused());
  };

  const holdGameplayUntilFamobiResolves = (famobiCall: () => Promise<void>): void => {
    queueMicrotask(async () => {
      pendingFamobiCalls += 1;
      applySystemPause();
      await famobiCall().catch(() => undefined);
      pendingFamobiCalls -= 1;
      applySystemPause();
    });
  };

  return { holdGameplayUntilFamobiResolves, applySystemPause };
};

const reportGameplayLifecycle = (
  famobiGameInterface: FamobiGameInterface,
  gameController: GameController,
  systemPause: SystemPauseCoordinator
): void => {
  // A new gameStart or gameFinished must wait until the previous gameEnd (and a possible ad) resolved.
  let latestRunEndReport: Promise<void> = Promise.resolve();

  gameController.events.on('runStarted', ({ level }) => {
    systemPause.holdGameplayUntilFamobiResolves(async () => {
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
    if (playerResumed) systemPause.holdGameplayUntilFamobiResolves(() => famobiGameInterface.gameResume());
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

const followFamobiPauseRequests = (famobiGameInterface: FamobiGameInterface, systemPause: SystemPauseCoordinator): void => {
  systemPause.applySystemPause();
  famobiGameInterface.onPauseStateChange(() => systemPause.applySystemPause());
};
