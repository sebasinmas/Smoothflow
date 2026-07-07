FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate
WORKDIR /app

FROM base AS build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN echo "node-linker=hoisted" >> .npmrc && \
    pnpm install --frozen-lockfile --config.minimum-release-age=0
COPY apps/api apps/api
COPY packages/shared packages/shared
COPY tsconfig.base.json .
RUN pnpm --filter @smoothflow/shared build
RUN pnpm --filter @smoothflow/api build
RUN cp -r apps/api/src/infrastructure/db/migrations apps/api/dist/infrastructure/db/migrations
RUN pnpm --filter @smoothflow/api deploy --prod --legacy /deploy

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /deploy .
EXPOSE 3000
CMD ["node", "dist/index.js"]
