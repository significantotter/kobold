ARG NODE_VERSION=24

# Alpine image
FROM node:${NODE_VERSION}-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Prune projects
FROM base AS pruner
ARG PROJECT

COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=@kobold/client --prod /prod/client

# Final image
FROM base AS runner

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

COPY --from=build --chown=nodejs:nodejs /prod/client /prod/client
WORKDIR /prod/client
EXPOSE 8001

WORKDIR /prod/client

ENV NODE_ENV=production NODE_OPTIONS=--max-old-space-size=4096
CMD ["node", "./dist/start-manager.js"]
 