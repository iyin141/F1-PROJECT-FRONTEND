# F1 Control Room frontend. Multi-stage, non-root, runs `node server.js` from .next/standalone.
# node:22-alpine is multi-arch (amd64 and arm64); nothing here compiles native code.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are inlined at build time: pass them as build args.
ARG NEXT_PUBLIC_API_MODE=live
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_API_DOCS_URL
ENV NEXT_PUBLIC_API_MODE=$NEXT_PUBLIC_API_MODE \
    NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_API_DOCS_URL=$NEXT_PUBLIC_API_DOCS_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/public ./public
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
USER app
EXPOSE 3000
# Server-only runtime settings are never baked into the image: BACKEND_URL, INTERNAL_API_KEY.
CMD ["node", "server.js"]
