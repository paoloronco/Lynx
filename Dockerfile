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

# Copia l'entrypoint e assicurati che sia eseguibile e con LF
COPY docker-entrypoint.sh /app/server/docker-entrypoint.sh
RUN sed -i 's/\r$//' /app/server/docker-entrypoint.sh \
	&& chmod +x /app/server/docker-entrypoint.sh

# Avvia tramite entrypoint che verifica JWT_SECRET
WORKDIR /app/server
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node","server.js"]
