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

  reportLoadingProgress(gameInterface, gameController);
};

/**
 * No asset files to preload (graphics and audio are generated in code), so Phaser booting the scene is the whole loading phase.
 */
const reportLoadingProgress = (famobiGameInterface: FamobiGameInterface, gameController: GameController): void => {
  famobiGameInterface.sendPreloadProgress(0);
  gameController.events.on('ready', () => famobiGameInterface.sendPreloadProgress(100));
};
