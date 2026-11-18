/**
 * Type description of the Famobi GameInterface SDK.
 *
 * The SDK is not an npm package: it is loaded at runtime from
 * https://api.games.famobi.com/init.js and exposes `window.GameInterface`.
 * Famobi ships no TypeScript declarations, so the signatures below are taken
 * from the official docs (https://docs.famobi.com) and only cover the parts
 * this game uses.
 */

export type ScoreType = 'live' | 'total' | 'level' | 'stage';

export type GameEndReason = 'complete' | 'fail' | 'quit';

export type EventParams = {
  metrics?: Record<string, number | string | boolean | null>;
};

export interface FamobiGameInterface {
  // Start & loading
  sendPreloadProgress(progress: number): void;
  gameReady(isPlayerReady?: boolean): void;

  // Game flow (Promises may resolve only after an ad, so they must be awaited)
  gameStart(level?: number, params?: EventParams): Promise<void>;
  gameEnd(reason: GameEndReason, params?: EventParams): Promise<void>;
  gamePause(params?: EventParams): Promise<void>;
  gameResume(params?: EventParams): Promise<void>;
  gameFinished(params?: EventParams): Promise<void>;
  sendScore(score: number, params?: { type?: ScoreType; level?: number; stage?: number }): void;
  sendProgress(progress: number): void;

  // External (platform) pause
  isPaused(): boolean;
  onPauseStateChange(callback: (isPaused: boolean) => void): void;
}

declare global {
  interface Window {
    /** Created by Famobi's init.js. Missing when the game runs without the SDK (e.g. `pnpm dev`). */
    GameInterface?: FamobiGameInterface;
  }
}
