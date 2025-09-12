# ---------- STAGE 1: build ----------
FROM node:18-slim AS builder
WORKDIR /app

# Dev deps incluse per poter fare vite build
COPY package*.json ./
RUN npm ci

# Copia sorgenti e builda il frontend (Vite)
COPY . .
RUN npm run build

# Installa solo le prod deps del server
WORKDIR /app/server
RUN npm ci --omit=dev

# ---------- STAGE 2: runtime ----------
FROM node:18-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# porta solo ciò che serve
COPY --from=builder /app/dist    /app/dist
COPY --from=builder /app/server  /app/server

# Il server ha già le sue dipendenze in /app/server/node_modules
EXPOSE 8080

# Avvia direttamente il server (che ascolta su 8080)
WORKDIR /app/server
CMD ["npm","start"]
