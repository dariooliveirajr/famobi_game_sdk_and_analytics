# Development process

[← Back to README](../README.md)

I used this file to guide myself through the time I had for the task. Documentation is part of the task, so I wrote it during the whole process instead of leaving it to the end.

1. **The unknown first.** I researched the technologies I did not know yet, read the Famobi SDK integration docs and tried out the SDK.
2. **The big picture.** Before writing code, I planned how the whole application would work together (see the architecture diagram in the [README](../README.md#main-technical-decisions)).
3. **Game and SDK integration.** I added the game to the project and started the SDK integration, leaving the gameplay analytics for later. I noticed that the game exchanges information with two tools, the Famobi SDK and my own analytics. That is why both live in `game/src/integrations/` and follow the same pattern: they listen to the game's existing events, so the game code stays unchanged.
4. **Containers before the backend.** I containerized everything (game, backend and Firebase emulator), so the whole project runs with one command during the review, `docker compose up --build`, without installing anything except Docker. Details in [backend.md](backend.md#containers).
5. **Backend.** First a simple API with a health route and the Firebase setup. Then I decided which architecture the API should follow (feature-based) and created the events feature that saves the analytics data.
6. **Frontend.** I decided on the KPIs and the chart library and built the dashboard.
7. **Tests and CI.** I wrote unit tests and a simple CI pipeline.
8. **Review.** With the time left, I reviewed the documentation and rewrote it to make it clear.

---

[← Back to README](../README.md)
