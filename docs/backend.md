# Backend

## Task

> Create a Node.js backend that receives the gameplay analytics and stores them in Firebase.
>
> You are responsible for defining:
>
> - the API;
> - the Firebase data structure;
> - how incoming data is checked and handled;
> - how the stored data is prepared for the frontend.
>
> The solution only needs to run locally. Deployment is not required.

## Stack

Node.js 24, Express 5, TypeScript, firebase-admin (Firestore). Runs in Docker, see [Containers](#containers).

## Containers

Everything starts with one command from the repository root:

```bash
docker compose up --build
```

| Service | URL | What it is |
|---|---|---|
| `game` | http://localhost:4173 | Neon Snake with the Famobi SDK and the analytics client. Rebuilt automatically on code changes |
| `backend` | http://localhost:3000 | Express API. Restarts automatically on code changes |
| `firebase` | http://localhost:4000 | Firebase Emulator UI (Firestore runs on port 8080) |

- [docker-compose.yml](../docker-compose.yml) starts the emulator first and the backend once Firestore answers.
- The Firebase project is `demo-famobi-analytics`. Firebase treats `demo-*` projects as offline-only, so no real Firebase project and no credentials are needed.
- Files: [.docker/firebase/Dockerfile](../.docker/firebase/Dockerfile), [backend/Dockerfile](../backend/Dockerfile), [game/Dockerfile](../game/Dockerfile), [firebase.json](../firebase.json).

## API

| Route | Status | Purpose |
|---|---|---|
| `GET /api/health` | done | Returns `{ "status": "ok", "firestore": "connected" }` when the API can reach Firestore |
