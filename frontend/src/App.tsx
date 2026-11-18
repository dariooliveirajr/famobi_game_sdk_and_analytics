import { useEffect, useState } from 'react';

type ApiConnectionState = 'checking' | 'connected' | 'unreachable';

export const App = () => {
  const [apiConnectionState, setApiConnectionState] = useState<ApiConnectionState>('checking');

  useEffect(() => {
    fetch('/api/health')
      .then((response) => setApiConnectionState(response.ok ? 'connected' : 'unreachable'))
      .catch(() => setApiConnectionState('unreachable'));
  }, []);

  return (
    <main>
      <h1>Neon Snake · Gameplay Analytics</h1>
      <p>API: {apiConnectionState}</p>
    </main>
  );
};
