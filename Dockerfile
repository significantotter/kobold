ARG NODE_VERSION=21

# Alpine image
FROM node:${NODE_VERSION}-alpine3.19 AS alpine
RUN apk update
RUN apk add --no-cache libc6-compat

# Setup pnpm and turbo on the alpine base
FROM alpine as base
RUN npm install pnpm turbo --global
RUN pnpm config set store-dir ~/.pnpm-store

# Prune projects
FROM base AS pruner
ARG PROJECT

WORKDIR /app
COPY . .
RUN turbo prune --scope=kobold-client --docker

# Build the project
FROM base AS builder
ARG PROJECT

WORKDIR /app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/tsconfig.base.json ./tsconfig.base.json
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ .

# First install the dependencies (as they change less often)
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store  apk add --no-cache --virtual .build-deps alpine-sdk python3 \
&& pnpm install --frozen-lockfile \
&& apk del .build-deps alpine-sdk

# Copy source code of isolated subworkspace
COPY --from=pruner /app/out/full/ .

RUN turbo build --filter=kobold-client
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm prune --prod --no-optional
RUN rm -rf ./**/*/src

# Final image
FROM alpine AS runner
ARG PROJECT

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

WORKDIR /app

COPY --from=builder --chown=nodejs:nodejs /app .

WORKDIR /app/apps/kobold-client

ENV NODE_ENV=production NODE_OPTIONS=--max-old-space-size=4096
CMD ["node", "./dist/start-manager.js"]
 