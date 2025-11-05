FROM oven/bun:1.3.1 AS base

WORKDIR /usr/src/app

FROM base AS builder

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun build --compile --external pg --minify-whitespace --minify-syntax --target bun --outfile server src/http/server.ts

FROM gcr.io/distroless/base:nonroot AS release

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/server .

EXPOSE 3000

ENTRYPOINT ["/usr/src/app/server"]
