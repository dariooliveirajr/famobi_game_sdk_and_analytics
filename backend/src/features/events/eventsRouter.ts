import { Router } from 'express';

import { runEventSchema } from './runEventSchema.js';
import { saveRunEnded, saveRunStarted } from './runRepository.js';

export const eventsRouter = Router();

eventsRouter.post('/', async (request, response) => {
  const validation = runEventSchema.safeParse(request.body);
  if (!validation.success) {
    response.status(400).json({
      error: 'Invalid event',
      issues: validation.error.issues.map(({ path, message }) => ({ field: path.join('.'), message }))
    });
    return;
  }

  const runEvent = validation.data;
  if (runEvent.type === 'runStarted') await saveRunStarted(runEvent);
  else await saveRunEnded(runEvent);

  response.status(202).end();
});
