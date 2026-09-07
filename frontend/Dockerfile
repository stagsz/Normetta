# Stage 1: Dependencies
# Install in an isolated context (no workspace root) so all packages land in
# one node_modules, preventing duplicate React instances during build.
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat git
WORKDIR /app

COPY frontend/package.json ./package.json
RUN npm install --no-fund --no-audit

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# node_modules at /app; build runs from /app/frontend → resolves up to /app/node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY shared ./shared/
COPY frontend ./frontend/

WORKDIR /app/frontend
RUN mkdir -p public
RUN npm run build

# Stage 3: Runtime
FROM node:20-alpine AS runtime

RUN apk add --no-cache wget

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/frontend/public ./public

RUN mkdir .next && chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# standalone output from /app/frontend puts server.js at the root of standalone/
CMD ["node", "server.js"]
