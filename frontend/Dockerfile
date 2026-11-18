FROM node:24-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

# Development: Vite dev server with hot reload (the source folder is mounted by docker-compose).
CMD ["npm", "run", "dev"]
