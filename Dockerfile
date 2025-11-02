# ---------- STAGE 1: build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install build tools for sqlite3 and native modules
RUN apk add --no-cache python3 make g++ sqlite

# Dev deps for building frontend
COPY package*.json ./
RUN npm ci

# Copy source and build frontend
COPY . .
RUN npm run build

# Install production deps for server
WORKDIR /app/server
# Prefer reproducible installs; fall back to npm install when lockfile changes
RUN npm ci --omit=dev || npm install --omit=dev

# ---------- STAGE 2: runtime ----------
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy built frontend and server
COPY --from=builder /app/dist    /app/dist
COPY --from=builder /app/server  /app/server

EXPOSE 8080 8443

# Copy and enable entrypoint
COPY docker-entrypoint.sh /app/server/docker-entrypoint.sh
RUN sed -i 's/\r$//' /app/server/docker-entrypoint.sh \
  && chmod +x /app/server/docker-entrypoint.sh

WORKDIR /app/server
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
