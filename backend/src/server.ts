import { createApp } from './app.js';
import { backendEnvironment } from './backendEnvironment.js';

createApp().listen(backendEnvironment.PORT, () => {
  console.info(`Gameplay analytics API listening on port ${backendEnvironment.PORT}`);
});
