import { FieldValue, Timestamp } from 'firebase-admin/firestore';

import { firestore } from '../../firestore.js';
import type { RunEndedEvent, RunStartedEvent } from './runEventSchema.js';

// One document per run: runs/{runId}.
// Both events merge into the same document, so their arrival order does not matter
// and a duplicated event only writes the same values again.
// A run without "endedAt" has not ended (yet).
const runsCollection = firestore.collection('runs');

const toFirestoreTimestamp = (isoDateString: string): Timestamp => Timestamp.fromDate(new Date(isoDateString));

export const saveRunStarted = async (runStartedEvent: RunStartedEvent): Promise<void> => {
  await runsCollection.doc(runStartedEvent.runId).set(
    {
      sessionId: runStartedEvent.sessionId,
      level: runStartedEvent.level,
      startedAt: toFirestoreTimestamp(runStartedEvent.occurredAt),
      receivedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );
};

export const saveRunEnded = async (runEndedEvent: RunEndedEvent): Promise<void> => {
  await runsCollection.doc(runEndedEvent.runId).set(
    {
      sessionId: runEndedEvent.sessionId,
      level: runEndedEvent.level,
      endedAt: toFirestoreTimestamp(runEndedEvent.occurredAt),
      reason: runEndedEvent.reason,
      score: runEndedEvent.score,
      progress: runEndedEvent.progress,
      durationMs: runEndedEvent.durationMs,
      receivedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );
};
