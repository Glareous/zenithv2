FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copiamos todo el código + el .env.production que creó GitHub Actions
COPY . .

# Next va a leer automáticamente .env.production en el build
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copiamos solo lo necesario para correr la app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
