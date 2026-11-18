import { Router } from 'express';

import { firestore } from '../firestore.js';

export const healthRouter = Router();

healthRouter.get('/', async (_request, response) => {
  await firestore.listCollections();
  response.json({ status: 'ok', firestore: 'connected' });
});
