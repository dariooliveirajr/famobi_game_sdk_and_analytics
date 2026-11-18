FROM node:24-slim

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 4173

# The Famobi SDK loads the built game.js, so the game is always served as a build:
# "vite build --watch" rebuilds on every change, "vite preview" serves dist/.
CMD ["sh", "-c", "pnpm exec vite build --watch & pnpm exec vite preview --host 0.0.0.0 --port 4173"]
