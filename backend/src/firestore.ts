import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import { backendEnvironment } from './backendEnvironment.js';

// No credentials needed: FIRESTORE_EMULATOR_HOST makes the Admin SDK talk to the
// local emulator, and the "demo-" project id can never reach a real Firebase project.
const firebaseApp = initializeApp({ projectId: backendEnvironment.GCLOUD_PROJECT });

export const firestore = getFirestore(firebaseApp);
