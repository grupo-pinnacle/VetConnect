# =====================================================================
# Stage 1: Builder Stage (Compilation & Prisma Client Generation)
# =====================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY web/package*.json ./web/
COPY mobile/package*.json ./mobile/

# Install all dependencies for workspace build
RUN npm ci

# Copy backend source and prisma schema
COPY backend/ ./backend/

WORKDIR /app/backend

# Generate Prisma Client & Compile TypeScript
RUN npx prisma generate
RUN npm run build

# =====================================================================
# Stage 2: Production Runner Stage (Non-Root Security Hardening)
# =====================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Create uploads directories with node user ownership
RUN mkdir -p /app/uploads/tmp && chown -R node:node /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Copy compiled backend output, prisma schema, and node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

WORKDIR /app/backend

# Security Hardening: Operate under unprivileged 'node' user (ADR-021)
USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "dist/server.js"]
