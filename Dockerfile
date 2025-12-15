# ---------- STAGE 1: build frontend + install server deps ----------
FROM node:20-alpine AS builder

# Se usi sqlite3 (native), servono tool di build in builder
RUN apk add --no-cache python3 make g++ sqlite

# --- Frontend (in /LYNX) ---
WORKDIR /app/LYNX
COPY LYNX/package*.json ./
RUN npm ci
COPY LYNX/ ./
RUN npm run build

# --- Server (in /LYNX/server) ---
WORKDIR /app/LYNX/server
COPY LYNX/server/package*.json ./
RUN npm ci --omit=dev
COPY LYNX/server/ ./

# ---------- STAGE 2: runtime ----------
FROM node:20-alpine

# runtime deps (sqlite client lib)
RUN apk add --no-cache sqlite

# Copio build frontend + server (con node_modules già pronti)
WORKDIR /app
COPY --from=builder /app/LYNX/dist /app/dist
COPY --from=builder /app/LYNX/server /app/server

# entrypoint (quello che controlla JWT_SECRET)
COPY docker-entrypoint.sh /app/server/docker-entrypoint.sh
RUN sed -i 's/\r$//' /app/server/docker-entrypoint.sh && chmod +x /app/server/docker-entrypoint.sh

EXPOSE 8080 8443

WORKDIR /app/server
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
