import { z } from 'zod';

// Read once at startup; a missing or invalid value stops the backend with a clear error.
// Values come from docker-compose.yml, or a local .env file (see .env.example).
const backendEnvironmentSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  // "demo-" projects can only run against the emulator, never a real Firebase project.
  GCLOUD_PROJECT: z.string().startsWith('demo-'),
  FIRESTORE_EMULATOR_HOST: z.string().min(1)
});

const parsedBackendEnvironment = backendEnvironmentSchema.safeParse(process.env);

if (!parsedBackendEnvironment.success) {
  const invalidVariables = parsedBackendEnvironment.error.issues.map(({ path, message }) => `${path.join('.')}: ${message}`);
  throw new Error(`Invalid backend environment. See backend/.env.example.\n${invalidVariables.join('\n')}`);
}

export const backendEnvironment = parsedBackendEnvironment.data;
