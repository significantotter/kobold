FROM node:21-alpine3.19 AS base
RUN apk add --no-cache --virtual .build-deps alpine-sdk python3
RUN npm install turbo --global
RUN turbo telemetry disable

FROM base AS deps
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch --frozen-lockfile
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile --prod
 
FROM base AS build
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch --frozen-lockfile
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile
COPY . .
ENV NODE_OPTIONS --max-old-space-size=4096
RUN turbo prune kobold-client --docker
RUN turbo build --filter="kobold-client"
 
FROM base
WORKDIR /app
RUN apk del .build-deps
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=build /app/apps /app/apps
COPY --from=build /app/packages /app/packages
ENV NODE_ENV=production NODE_OPTIONS=--max-old-space-size=4096
WORKDIR /app/apps/client
CMD ["node", "./dist/start-manager.js"]
 