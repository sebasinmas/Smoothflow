FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate
WORKDIR /app

FROM base AS build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY apps/api/package.json apps/api/package.json
RUN echo "node-linker=hoisted" >> .npmrc && \
    pnpm install --frozen-lockfile --config.minimum-release-age=0
COPY apps/api apps/api
COPY tsconfig.base.json .
RUN cd apps/api && ../../node_modules/.bin/tsc --project tsconfig.build.json

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json .
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
