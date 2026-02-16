# Stage 1: Build
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/database/package.json packages/database/
COPY packages/types/package.json packages/types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/types/ packages/types/
COPY packages/database/ packages/database/
COPY apps/api/ apps/api/

# Build packages in order (types -> database -> api)
WORKDIR /app/packages/types
RUN pnpm run build

WORKDIR /app/packages/database
RUN pnpm run build

WORKDIR /app/apps/api
RUN pnpm run build

# Stage 2: Production
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/database/package.json packages/database/
COPY packages/types/package.json packages/types/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files from builder stage
COPY --from=builder /app/apps/api/dist/ apps/api/dist/
COPY --from=builder /app/packages/database/dist/ packages/database/dist/
COPY --from=builder /app/packages/database/generated/ packages/database/generated/
COPY --from=builder /app/packages/database/prisma/ packages/database/prisma/
COPY --from=builder /app/packages/types/dist/ packages/types/dist/

EXPOSE 4000

ENV NODE_ENV=production

CMD ["node", "apps/api/dist/main.js"]
