FROM oven/bun:1.3.1 AS base

WORKDIR /usr/src/app

FROM base AS builder

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun build --compile --external pg --minify-whitespace --minify-syntax --target bun --outfile server src/http/server.ts

RUN bun build --compile --external pg --minify-whitespace --minify-syntax --target bun --outfile worker src/worker/subscriber.ts

RUN bun install --production --no-save

FROM gcr.io/distroless/base:nonroot AS release-api

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/server .

COPY --from=builder /usr/src/app/node_modules ./node_modules

EXPOSE 3333

ENTRYPOINT ["/usr/src/app/server"]

FROM gcr.io/distroless/base:nonroot AS release-worker

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/worker .

COPY --from=builder /usr/src/app/node_modules ./node_modules

ENTRYPOINT ["/usr/src/app/worker"]
