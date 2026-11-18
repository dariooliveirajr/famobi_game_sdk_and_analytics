SDK Integration

Sections are divided by the docs: https://docs.famobi.com/start

### 1. Start
1- Copied game from Famobi-GmbH/neon-snake@75584c3

2- Added the SDK to the project. First catch: the game cannot load with script="module" and npm dev. It should build first and be passed to the SDK.init.  
    TODO/Drawback: dev doesn't works anymore. game.js is loaded globally.

3- Created sdk types.ts

4- Start-04 Games must report loading progress. After implementation I noticed that the SDK loads a localTester for local environments. 

> **Verified:** I can confirm that it was called because of the logging from GameInterface in the browser console.

5- Start-05 famobi.json. Added because the docs require it. The game code never reads this file: the SDK fetches it during `GameInterface.init(...)` and uses it as platform configuration (number of levels, ad placements, in-app products).
    - It lives in `game/public/famobi.json`, because Vite only copies files from `public/` into `dist/`, which is where it ends up next to the built `index.html`.
    - It only contains `"maxLevels": 3`, matching the 3 levels in `levels.ts`. The docs example (1400 levels, ads, IAP product) was not used, because Neon Snake has no ads or shop, and the Famobi Tester checks that every ad event ID listed in `famobi.json` is actually triggered by the game.
    - No TypeScript interfaces were created for it: `FamobiJson` / `ProductData` in the docs describe the file format, not code the game uses.

### 2. Game TODO: verify each step

Identification and map of functionalities that should be integrated, so that AI can generate the boilerplate code. Loading progress (`sendPreloadProgress`) is covered in Start-04 above.

**Game → SDK (events the game reports)**

| Moment | Where it happens in the game | SDK call |
|---|---|---|
| Ready (menu visible) | [SnakeScene.ts:39](../game/src/game/scenes/SnakeScene.ts#L39) calls `controller.markReady()`, which emits `ready` | `gameReady()` |
| Level starts | `startNewGame` / `startAtLevel` / `goToNextLevel` / `restartLevel`, which emit `runStarted { level }` | `gameStart(level)` |
| Level won | `runEnded { reason: 'complete' }` | `gameEnd('complete')` |
| Died | `runEnded { reason: 'fail' }` | `gameEnd('fail')` |
| Exit to menu | `quitToMenu()`, which emits `runEnded { reason: 'quit' }` | `gameEnd('quit')` |
| All 3 levels done | `gameFinished` event | `gameFinished()` (after the last `gameEnd('complete')`) |
| Score | `scoreChanged { score, level }` | `sendScore(score, { type: 'live', level })` |
| Progress | `progressChanged { progress }` (0–1) | `sendProgress(...)` |
| Player pauses / resumes | `togglePlayerPause()` (P key, pause button), which emits `pauseChanged { source: 'player' }` | `gamePause()` / `gameResume()` |

**Implementation:** Game-01 to Game-11 are implemented in [famobiSDK.ts](../game/src/integrations/famobiSDK.ts), keeping the original game code unchanged.

**Drawbacks / trade-offs**

To keep the original game code unchanged, the integration only listens to the game's existing events and reuses its built-in platform ("system") pause to wait for the SDK. With more time, I would make the `GameController` await the SDK *before* each transition instead. Consequences:

- `gameStart` / `gameResume`: the run starts or resumes and is frozen immediately (before the next game tick) until the SDK resolves. While the SDK call is pending, the "Please wait" overlay may flash briefly.
- `gameEnd('quit')` is reported right after the player is back on the menu, not before leaving.
- `gamePause` is reported after the game is already paused. Nothing visible changes.
- The hold uses the system pause, which the platform's external pause also uses. Both are combined so they never unpause each other (see 3. Pause).
- Game-10 (stages) does not apply: Neon Snake has levels, not stages.

> **Verified:** I can confirm that it was called because of the logging from GameInterface in the browser console.

### 3. Pause

| Docs requirement | Implementation |
|---|---|
| Games must support external (master) pause | `onPauseStateChange` → the game's existing system pause (`setSystemPaused`), which shows the built-in "Please wait" overlay. Also applied at startup from `isPaused()`. |
| Games must verify external pause status before (un)pause actions | Before the game unpauses its system pause, it checks `isPaused()`. A player resume never overrides the platform pause, because the game keeps player and system pauses apart. |

**Implementation:** `followFamobiPauseRequests` and `createSystemPauseCoordinator` in [famobiSDK.ts](../game/src/integrations/famobiSDK.ts). The game has a single system pause, now used for two reasons: holding gameplay while an SDK call is pending (2. Game) and the platform's external pause. The coordinator counts pending SDK calls and reads `isPaused()`, and only unpauses when no SDK call is pending **and** the platform is not paused. This also prevents an older hold from ending a newer one, e.g. when the player switches level while a `gameStart` is still pending.

**Drawbacks / special cases**

- If the platform pauses the game while the player is in the menu, nothing changes visually (the menu is not gameplay). When the player then starts a run, it is paused immediately until the platform unpauses.
- If the player presses pause *during* a platform pause, `gamePause()` is only reported once the platform pause ends, because that is when the game shows its own pause screen. If the player pauses and resumes during the same platform pause, neither `gamePause` nor `gameResume` is reported.

**Verified:** against a fake `GameInterface`: a platform pause freezes a running game and unpauses it afterwards; a player pause and resume during a platform pause keeps the game paused until the platform unpauses; a platform pause from the menu holds the next run; two overlapping pending `gameStart` calls keep the game held until both resolved.

### 4. Not in scope

I am aware of these Famobi docs sections and decided not to implement them, because the task scope covers the gameplay moments (loading, start/end, score, progress and pause).

- **Requests:** the platform can ask the game to go to the home screen, restart, go to the next or a specific level, quit, or trigger game over.
- **Audio:** the platform can mute or unmute the game, and the game reports when the player mutes it.
- **Storage:** the docs require replacing `localStorage` with `GameInterface.storage` (cloud saves, reliable storage inside portal iframes). The player profile (best score, unlocked levels, mute choice) stays in `localStorage`.
