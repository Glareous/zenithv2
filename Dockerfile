# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

# =====================
# deps: instalamos node_modules
# =====================
FROM base AS deps
# libc6-compat es lo que recomienda Node/Next en alpine
RUN apk add --no-cache libc6-compat
RUN corepack enable

WORKDIR /app

# Copiamos lockfiles del proyecto
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

# Elegimos el gestor según el lockfile
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# =====================
# builder: build de Next
# =====================
FROM base AS builder
RUN corepack enable
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
# 👇 Acá se va a copiar también el .env.production que generamos en GitHub Actions
COPY . .

# Si querés, podés desactivar la telemetría de Next en el build:
# ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# =====================
# runner: imagen de producción standalone
# =====================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED=1

# Creamos usuario no root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Public estático
COPY --from=builder /app/public ./public

# Archivos standalone generados por Next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# server.js lo genera Next con output: 'standalone'
CMD ["node", "server.js"]
