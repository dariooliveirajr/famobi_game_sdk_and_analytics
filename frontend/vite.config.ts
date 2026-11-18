import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// Read from the environment (docker-compose.yml) or a local .env file, see .env.example.
// Without the VITE_ prefix it stays in this config and never reaches the browser bundle.
const getAnalyticsApiUrl = (mode: string): string => {
  const analyticsApiUrl = loadEnv(mode, process.cwd(), '').ANALYTICS_API_URL;
  if (!analyticsApiUrl) throw new Error('ANALYTICS_API_URL is not set. See frontend/.env.example.');
  return analyticsApiUrl;
};

export default defineConfig(({ mode, command }) => ({
  plugins: [react()],
  server:
    command === 'serve'
      ? {
          // Forwards the API requests to the backend, so dashboard and API share one origin (no CORS).
          proxy: { '/api': getAnalyticsApiUrl(mode) }
        }
      : undefined
}));
