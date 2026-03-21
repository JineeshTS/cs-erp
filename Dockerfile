# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Stage 2: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm rebuild bcrypt

# Build-time env (no secrets — dummy DATABASE_URL for standalone build)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
ENV REDIS_URL=redis://localhost:6379

RUN rm -rf .next node_modules/.cache /tmp/.next-* /tmp/turbopack-* && \
    find node_modules -name ".cache" -type d -exec rm -rf {} + 2>/dev/null; \
    find node_modules -name "*.tsbuildinfo" -delete 2>/dev/null; \
    npm run build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3100
ENV NODE_OPTIONS="--max-old-space-size=1536"
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3100

HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=30s \
  CMD wget --spider -q -T 5 http://127.0.0.1:3100/api/health || exit 1

CMD ["node", "server.js"]
