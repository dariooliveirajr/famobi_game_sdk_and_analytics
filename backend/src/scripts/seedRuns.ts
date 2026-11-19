import { randomUUID } from 'node:crypto';

import type { RunEndedEvent } from '../features/events/runEventSchema.js';
import { saveRunEnded, saveRunStarted } from '../features/events/runRepository.js';

// Writes realistic demo runs for the last 14 days, so the dashboard is not empty on a fresh start.
// Sessions are played like the real game: start at level 1, a completed level leads to the next one,
// a failed level is sometimes retried. Level targets and scoring match game/src/game/levels.ts.

const numberOfDays = 14;
const fruitTargetPerLevel: Record<number, number> = { 1: 5, 2: 7, 3: 9 };
const reasonChancesPerLevel: Record<number, { completed: number; failed: number }> = {
  1: { completed: 0.6, failed: 0.3 }, // the rest is "left"
  2: { completed: 0.4, failed: 0.45 },
  3: { completed: 0.25, failed: 0.55 }
};
const retryChanceAfterFailing = 0.6;
const unfinishedRunChance = 0.04; // browser killed before pagehide: runStarted without runEnded

// Fixed seed (mulberry32), so every reviewer gets the same data.
const createSeededRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let mixed = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
  return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
};
const random = createSeededRandom(20261118);
const randomInteger = (minimum: number, maximum: number): number => minimum + Math.floor(random() * (maximum - minimum + 1));

const pickReason = (level: number): RunEndedEvent['reason'] => {
  const chances = reasonChancesPerLevel[level];
  const roll = random();
  if (roll < chances.completed) return 'completed';
  if (roll < chances.completed + chances.failed) return 'failed';
  return 'left';
};

const seedSession = async (sessionStart: Date): Promise<number> => {
  const sessionId = randomUUID();
  let level = 1;
  let scoreAtLevelStart = 0;
  let runStartTime = sessionStart.getTime();
  let savedRuns = 0;

  while (true) {
    const runId = randomUUID();
    await saveRunStarted({ type: 'runStarted', sessionId, runId, level, occurredAt: new Date(runStartTime).toISOString() });
    savedRuns += 1;
    if (random() < unfinishedRunChance) return savedRuns;

    const reason = pickReason(level);
    const fruitTarget = fruitTargetPerLevel[level];
    const fruitEaten = reason === 'completed' ? fruitTarget : randomInteger(0, fruitTarget - 1);
    const durationMs = randomInteger(4, 12) * 1000 * (fruitEaten + 1);
    const score = scoreAtLevelStart + fruitEaten * level * 10;

    await saveRunEnded({
      type: 'runEnded',
      sessionId,
      runId,
      level,
      occurredAt: new Date(runStartTime + durationMs).toISOString(),
      reason,
      score,
      progress: fruitEaten / fruitTarget,
      durationMs
    });
    runStartTime += durationMs + randomInteger(2, 10) * 1000;

    if (reason === 'left') return savedRuns;
    if (reason === 'failed' && random() > retryChanceAfterFailing) return savedRuns;
    if (reason === 'completed') {
      if (level === 3) return savedRuns;
      level += 1;
      scoreAtLevelStart = score;
    }
  }
};

const seedRuns = async (): Promise<void> => {
  const today = new Date();
  let savedRuns = 0;

  for (let daysAgo = numberOfDays - 1; daysAgo >= 0; daysAgo -= 1) {
    // Activity slowly grows over the two weeks.
    const sessionsThisDay = randomInteger(8, 14) + Math.round((numberOfDays - daysAgo) * 0.8);
    const dayStart = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - daysAgo);
    // One session after another: the shared random sequence must be used in a fixed order.
    for (let session = 0; session < sessionsThisDay; session += 1) {
      savedRuns += await seedSession(new Date(dayStart + randomInteger(8, 22) * 3600_000));
    }
  }

  console.info(`Seeded ${savedRuns} runs over the last ${numberOfDays} days.`);
};

await seedRuns();
