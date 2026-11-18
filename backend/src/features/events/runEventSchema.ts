import { z } from 'zod';

// Mirrors the game's analytics model (game/src/integrations/gameplayAnalytics.types.ts).
// strictObject rejects unknown fields.

const runEventBaseShape = {
  sessionId: z.uuid(),
  runId: z.uuid(),
  level: z.number().int().min(1).max(3),
  occurredAt: z.iso.datetime()
};

export const runStartedEventSchema = z.strictObject({
  type: z.literal('runStarted'),
  ...runEventBaseShape
});

export const runEndedEventSchema = z.strictObject({
  type: z.literal('runEnded'),
  ...runEventBaseShape,
  reason: z.enum(['completed', 'failed', 'left']),
  score: z.number().int().min(0),
  progress: z.number().min(0).max(1),
  durationMs: z.number().int().min(0)
});

export const runEventSchema = z.discriminatedUnion('type', [runStartedEventSchema, runEndedEventSchema]);

export type RunStartedEvent = z.infer<typeof runStartedEventSchema>;
export type RunEndedEvent = z.infer<typeof runEndedEventSchema>;
export type RunEvent = z.infer<typeof runEventSchema>;
