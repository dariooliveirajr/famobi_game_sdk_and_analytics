import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
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
});
