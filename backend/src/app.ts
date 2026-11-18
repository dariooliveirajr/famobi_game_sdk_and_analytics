import express, { type ErrorRequestHandler } from 'express';

import { healthRouter } from './routes/healthRouter.js';

const handleUnexpectedError: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: 'Internal server error' });
};

export const createApp = () => {
  const app = express();

  app.use(express.json({ limit: '10kb' }));

  app.use('/api/health', healthRouter);

  app.use(handleUnexpectedError);
  return app;
};
