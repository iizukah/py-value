# INFRA-01: Cloud Run で Next.js を動かし、Firebase Hosting から転送する構成
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.mjs ./
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "run", "start"]
