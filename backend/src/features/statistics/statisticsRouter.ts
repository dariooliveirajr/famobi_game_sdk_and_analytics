import { Router } from 'express';

import { findAllRuns } from '../events/runRepository.js';
import { calculateRunStatistics } from './runStatistics.js';

const numberOfDaysShown = 14;

export const statisticsRouter = Router();

// Everything the dashboard shows, in one response.
statisticsRouter.get('/', async (_request, response) => {
  const runs = await findAllRuns();
  response.json(calculateRunStatistics(runs, new Date(), numberOfDaysShown));
});
