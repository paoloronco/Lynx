# Dockerfile
FROM node:18-slim

WORKDIR /app

# dipendenze (se ci sono)
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# codice
COPY . .

# port-forward tool
RUN apt-get update && apt-get install -y --no-install-recommends socat && rm -rf /var/lib/apt/lists/*

# Cloud Run vuole 8080; la tua app magari usa 3000/5000
ENV PORT=8080
ENV APP_PORT=3000
ENV START_CMD="npm start"

EXPOSE 8080

# avvia app e inoltra 8080 -> APP_PORT
CMD bash -lc "$START_CMD & socat TCP-LISTEN:$PORT,fork,reuseaddr TCP:127.0.0.1:$APP_PORT"
