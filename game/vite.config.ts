import { defineConfig, loadEnv } from 'vite';

// Read from the environment (docker-compose.yml) or a local .env file, see .env.example.
// Without the VITE_ prefix it stays in this config and never reaches the browser bundle.
const getAnalyticsApiUrl = (mode: string): string => {
  const analyticsApiUrl = loadEnv(mode, process.cwd(), '').ANALYTICS_API_URL;
  if (!analyticsApiUrl) throw new Error('ANALYTICS_API_URL is not set. See game/.env.example.');
  return analyticsApiUrl;
};

export default defineConfig(({ mode, isPreview }) => ({
  base: './',
  preview: isPreview
    ? {
        // Forwards the analytics requests to the backend, so game and API share one origin (no CORS).
        proxy: { '/api': getAnalyticsApiUrl(mode) }
      }
    : undefined,
  build: {
    rolldownOptions: {
      // index.html no longer has a <script src="/src/main.ts"> tag (the SDK loads game.js),
      // so the game entry is declared here explicitly.
      input: {
        index: 'index.html',
        game: 'src/main.ts'
      },
      output: {
        // Fixed names instead of content hashes (e.g. index-a8f3c1.js -> game.js)
        entryFileNames: '[name].js',
        assetFileNames: 'game[extname]'
      }
    }
  }
}));
