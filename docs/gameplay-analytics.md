# Gameplay Analytics

[← Back to README](../README.md)

## Task

> Add analytics to the game so that relevant gameplay activity can be recorded.
>
> The collected information should make it possible to understand at least:
>
> - when gameplay starts and ends;
> - which level was played;
> - whether the player completed, failed, or left the gameplay;
> - the player's score or progress;
> - when the activity happened.
>
> You may decide which events and data model best represent this information.

## Data model

Two events, `runStarted` and `runEnded`, linked by a shared `runId`. The event names match the game's own events.

Full types: [gameplayAnalytics.types.ts](../game/src/integrations/gameplayAnalytics.types.ts)

## Where the data comes from

| The task asks for… | Field | Source |
|---|---|---|
| when gameplay starts and ends | `runStarted` / `runEnded` | game events `runStarted` / `runEnded` |
| which level was played | `level` | `runStarted` / `runEnded` |
| completed, failed or left | `reason` | `runEnded.reason`: `complete` → `completed`, `fail` → `failed`, `quit` → `left`; tab closed during gameplay (`pagehide`) → `left` |
| score or progress | `score`, `progress` | `runEnded`, or the current game state on `pagehide` |
| when the activity happened | `occurredAt` | `occurredAt` of the game event |

## Decisions

1. The reason `left` covers every way of leaving. The game reports two different ways of leaving gameplay: "Exit to menu" (or switching level during gameplay) and closing the tab. Both are sent as `left`, because the task only asks whether the player left, not how.

2. Times are sent as ISO strings
The game sends `occurredAt` as an ISO 8601 string in UTC (e.g. `2026-11-18T13:53:51.056Z`) instead of a number of milliseconds in order to be readable in the browser console and in request logs;

3. Events are sent with `fetch` and `keepalive`
Every event is sent the same way: `fetch` with `keepalive: true`. A normal `fetch` started while the page is closing is cancelled by the browser, so the `left` event on `pagehide` would be lost. `keepalive` lets the request finish in the background. This replaces `navigator.sendBeacon`, which would have been a second way of sending events only for the closing page.

4. Events go to the game's own origin
The game posts to `/api/events` on its own address, and the Vite preview server forwards `/api` to the backend container ([vite.config.ts](../game/vite.config.ts)). Game and API share one origin locally, so no CORS setup is needed. Sending errors are ignored on purpose: analytics must never break the game.

---

[← Back to README](../README.md)
