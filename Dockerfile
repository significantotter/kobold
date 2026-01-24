ARG NODE_VERSION=24

# Alpine image
FROM node:${NODE_VERSION}-alpine AS alpine
RUN apk update
RUN apk add --no-cache libc6-compat

# Setup pnpm and turbo on the alpine base
FROM alpine AS base
RUN corepack enable && corepack prepare pnpm@10.16.1 --activate
RUN pnpm config set store-dir /root/.pnpm-store

# Prune projects
FROM base AS pruner
ARG PROJECT

WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo prune @kobold/client --docker

# Build the project
FROM base AS builder
ARG PROJECT

WORKDIR /app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/tsconfig.base.json ./tsconfig.base.json
COPY --from=pruner /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ .
# Copy ORIGINAL lockfile AFTER out/json to overwrite the incomplete pruned lockfile
COPY --from=pruner /app/pnpm-lock.yaml ./pnpm-lock.yaml

# First install the dependencies (as they change less often)
RUN --mount=type=cache,id=pnpm,target=/root/.pnpm-store apk add --no-cache --virtual .build-deps alpine-sdk python3 \
&& pnpm install --frozen-lockfile \
&& apk del .build-deps alpine-sdk

# Copy source code of isolated subworkspace
COPY --from=pruner /app/out/full/ .

RUN pnpm exec turbo build --filter=@kobold/client
RUN rm -rf ./**/*/src

# Final image
FROM alpine AS runner

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

WORKDIR /app

COPY --from=builder --chown=nodejs:nodejs /app .

WORKDIR /app/apps/client

ENV NODE_ENV=production NODE_OPTIONS=--max-old-space-size=4096
CMD ["node", "./dist/start-manager.js"]
 