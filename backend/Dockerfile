# Stage 1: Builder
# Install dependencies, generate Prisma client, and compile TypeScript
FROM node:20-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files for dependency installation
COPY backend/package*.json ./backend/
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
WORKDIR /app/backend
RUN npm install

# Copy Prisma schema and generate client
COPY backend/prisma ./prisma/
RUN npx prisma generate

# Copy shared types (required by backend)
COPY shared ../shared/

# Copy TypeScript configuration and source code
COPY backend/tsconfig.json ./
COPY backend/src ./src/

# Build TypeScript to JavaScript
RUN npm run build

# Stage 2: Runtime
# Minimal production image with only necessary files
FROM node:20-alpine AS runtime

# Install OpenSSL for Prisma runtime and wget for health checks
RUN apk add --no-cache openssl wget

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy Prisma schema (needed for migrations in production)
COPY backend/prisma ./prisma/

# Generate Prisma client for production
RUN npx prisma generate

# Copy compiled JavaScript from builder
COPY --from=builder /app/backend/dist ./dist/

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && chown -R appuser:nodejs /app/uploads

# Set ownership of app directory
RUN chown -R appuser:nodejs /app

# Switch to non-root user
USER appuser

# Expose API port
EXPOSE 3001

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=3001

# Start the application
CMD ["node", "dist/index.js"]
