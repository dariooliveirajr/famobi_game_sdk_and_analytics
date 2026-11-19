import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { runEventSchema } from './runEventSchema.js';

const validRunStartedEvent = {
  type: 'runStarted',
  sessionId: '6f1c2a4e-8b3d-4c5e-9f60-1a2b3c4d5e6f',
  runId: '0a9b8c7d-6e5f-4a3b-8c2d-1e0f9a8b7c6d',
  level: 2,
  occurredAt: '2026-11-19T10:15:00.000Z'
};

const validRunEndedEvent = {
  ...validRunStartedEvent,
  type: 'runEnded',
  reason: 'failed',
  score: 140,
  progress: 0.6,
  durationMs: 42000
};

const getInvalidFieldNames = (event: unknown): string[] => {
  const parseResult = runEventSchema.safeParse(event);
  assert.equal(parseResult.success, false, 'expected the event to be rejected');
  return parseResult.error!.issues.map((issue) => issue.path.join('.') || issue.code);
};

describe('runEventSchema', () => {
  it('accepts a valid runStarted event', () => {
    assert.equal(runEventSchema.safeParse(validRunStartedEvent).success, true);
  });

  it('accepts a valid runEnded event', () => {
    assert.equal(runEventSchema.safeParse(validRunEndedEvent).success, true);
  });

  it('rejects an unknown event type', () => {
    assert.deepEqual(getInvalidFieldNames({ ...validRunStartedEvent, type: 'runPaused' }), ['type']);
  });

  it('rejects a level the game does not have', () => {
    assert.deepEqual(getInvalidFieldNames({ ...validRunStartedEvent, level: 4 }), ['level']);
    assert.deepEqual(getInvalidFieldNames({ ...validRunStartedEvent, level: 1.5 }), ['level']);
  });

  it('rejects ids that are not UUIDs', () => {
    assert.deepEqual(getInvalidFieldNames({ ...validRunStartedEvent, runId: 'run-1' }), ['runId']);
  });

  it('rejects a date that is not an ISO date-time', () => {
    assert.deepEqual(getInvalidFieldNames({ ...validRunStartedEvent, occurredAt: '19.11.2026' }), ['occurredAt']);
  });

  it('rejects a runEnded event without its end fields', () => {
    const { reason, score, progress, durationMs, ...runEndedEventWithoutEndFields } = validRunEndedEvent;
    assert.deepEqual(getInvalidFieldNames(runEndedEventWithoutEndFields).sort(), ['durationMs', 'progress', 'reason', 'score']);
  });

  it('rejects an unknown reason and a progress above 100 %', () => {
    assert.deepEqual(getInvalidFieldNames({ ...validRunEndedEvent, reason: 'quit', progress: 1.2 }).sort(), ['progress', 'reason']);
  });

  it('rejects unknown fields, so clients cannot store arbitrary data', () => {
    assert.deepEqual(getInvalidFieldNames({ ...validRunStartedEvent, playerEmail: 'someone@example.com' }), ['unrecognized_keys']);
  });
});
