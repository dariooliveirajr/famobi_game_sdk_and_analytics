import express, { type ErrorRequestHandler } from 'express';

import { eventsRouter } from './features/events/eventsRouter.js';
import { healthRouter } from './features/health/healthRouter.js';

// Errors from express.json() (invalid JSON, body too large) carry a 4xx status;
// everything else is unexpected and answered with a generic 500.
const handleError: ErrorRequestHandler = (error, _request, response, _next) => {
  const status = typeof error?.status === 'number' && error.status >= 400 && error.status < 500 ? error.status : 500;
  if (status === 500) console.error(error);
  response.status(status).json({ error: status === 500 ? 'Internal server error' : error.message });
};

export const createApp = () => {
  const app = express();

  app.use(express.json({ limit: '10kb' }));

  app.use('/api/health', healthRouter);
  app.use('/api/events', eventsRouter);

  app.use(handleError);
  return app;
};
