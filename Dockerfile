# ---------- STAGE 1: build frontend ----------
FROM node:18-slim AS builder
WORKDIR /app

# devDeps incluse per poter eseguire "vite build"
COPY package*.json ./
RUN npm ci

COPY . .
# produce ./dist (come fai in locale con "npm run build")
RUN npm run build

# installa SOLO le prod deps del server
WORKDIR /app/server
RUN npm ci --omit=dev

# ---------- STAGE 2: runtime con socat ----------
FROM node:18-slim
WORKDIR /app

# util per proxy 8080 -> 3000
RUN apt-get update && apt-get install -y --no-install-recommends socat && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=8080
ENV APP_PORT=3000

# porta solo ciò che serve a runtime
COPY --from=builder /app/dist    /app/dist
COPY --from=builder /app/server  /app/server
COPY --from=builder /app/package*.json /app/

# (opzionale) se "npm start" vive nel package.json root
RUN npm ci --omit=dev

EXPOSE 8080

# Avvia il tuo server (che ascolta su 3000) + proxy su 8080
# Se "npm start" avvia il server, usa START_CMD="npm start"
ENV START_CMD="node server/index.js"
CMD bash -lc "$START_CMD & socat TCP-LISTEN:$PORT,fork,reuseaddr TCP:127.0.0.1:$APP_PORT"
