# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY tsconfig.base.json ./

# Copy all packages (needed for workspace dependencies)
COPY packages ./packages
COPY apps/web ./apps/web

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the web app (client + server)
RUN pnpm --filter @kobold/web build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Install pnpm for running production
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files for production install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/config/package.json ./packages/config/
COPY packages/config/dist ./packages/config/dist
COPY packages/db/package.json ./packages/db/
COPY packages/db/dist ./packages/db/dist
COPY packages/documentation/package.json ./packages/documentation/
COPY packages/documentation/dist ./packages/documentation/dist
COPY apps/web/package.json ./apps/web/

# Copy built application
COPY --from=builder /app/apps/web/dist ./apps/web/dist

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app/apps/web

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server/index.js"]
