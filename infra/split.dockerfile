FROM node:20.10-alpine AS base

# Build stage
FROM base AS builder
RUN apk add curl

# Create app directory
WORKDIR /app

COPY ../.tool-versions ./
RUN PNPM_VERSION=$(cat .tool-versions | grep 'pnpm' | cut -d ' ' -f 2) && \
    ARCH=$(uname -m) && \
    if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then \
        curl -fsSL "https://github.com/pnpm/pnpm/releases/download/v${PNPM_VERSION}/pnpm-linuxstatic-arm64" -o /bin/pnpm; \
    else \
        curl -fsSL "https://github.com/pnpm/pnpm/releases/download/v${PNPM_VERSION}/pnpm-linuxstatic-x64" -o /bin/pnpm; \
    fi && \
    chmod +x /bin/pnpm;

# Copy package files and install dependencies
COPY ../.npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY ../apps/api/package.json ./apps/api/
COPY ../apps/gateway/package.json ./apps/gateway/
COPY ../apps/ui/package.json ./apps/ui/
COPY ../apps/docs/package.json ./apps/docs/
COPY ../packages/auth/package.json ./packages/auth/
COPY ../packages/db/package.json ./packages/db/
COPY ../packages/models/package.json ./packages/models/

RUN pnpm install --frozen-lockfile

# Copy source code
COPY .. .

# Create Turbo cache directories before building (todo temp figure out a better solution)
RUN mkdir -p /app/packages/db/.turbo \
    /app/packages/auth/.turbo \
    /app/packages/models/.turbo \
    /app/apps/api/.turbo \
    /app/apps/gateway/.turbo \
    /app/apps/ui/.turbo \
    /app/apps/docs/.turbo \
    /app/.turbo

# Build all apps
RUN pnpm build


FROM base AS init
RUN apk add --no-cache tini && \
    /sbin/tini --version && \
    cp /sbin/tini /tini

FROM base AS runtime
ARG APP_VERSION
ENV APP_VERSION=$APP_VERSION
COPY --from=init /tini /tini
ENTRYPOINT ["/tini", "--"]
COPY --from=builder /bin/pnpm /bin/pnpm

FROM runtime AS api
WORKDIR /app/temp
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/.npmrc /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
RUN pnpm --filter=api --prod deploy ../dist/api
RUN rm -rf /app/temp
WORKDIR /app/dist/api
# copy migrations files for API service to run migrations at runtime
COPY --from=builder /app/packages/db/migrations ./migrations
EXPOSE 80
ENV PORT=80
ENV NODE_ENV=production
CMD ["pnpm", "start"]

FROM runtime AS gateway
WORKDIR /app/temp
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/.npmrc /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
RUN pnpm --filter=gateway --prod deploy ../dist/gateway
RUN rm -rf /app/temp
WORKDIR /app/dist/gateway
EXPOSE 80
ENV PORT=80
ENV NODE_ENV=production
CMD ["pnpm", "start"]

FROM runtime AS ui
WORKDIR /app/temp
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/.npmrc /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
RUN pnpm --filter=ui --prod deploy ../dist/ui
RUN rm -rf /app/temp
WORKDIR /app/dist/ui
EXPOSE 80
ENV PORT=80
ENV NODE_ENV=production
CMD ["pnpm", "start"]

FROM runtime AS docs
WORKDIR /app/temp
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/.npmrc /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
RUN pnpm --filter=docs --prod deploy ../dist/docs
RUN rm -rf /app/temp
WORKDIR /app/dist/docs
EXPOSE 80
ENV PORT=80
ENV NODE_ENV=production
CMD ["pnpm", "start"]
