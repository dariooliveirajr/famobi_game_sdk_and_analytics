FROM node:24-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000

# Development: restarts on file changes (the source folder is mounted by docker-compose).
CMD ["npm", "run", "dev"]
