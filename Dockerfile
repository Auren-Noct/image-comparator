FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable pnpm

RUN pnpm install

EXPOSE 5173

CMD ["pnpm", "run", "dev"]