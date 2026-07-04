FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate
WORKDIR /app

FROM base AS build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY apps/web/package.json apps/web/package.json
RUN echo "node-linker=hoisted" >> .npmrc && \
    pnpm install --frozen-lockfile --config.minimum-release-age=0
COPY apps/web apps/web
COPY tsconfig.base.json .
RUN cd apps/web && ../../node_modules/.bin/vite build

FROM nginx:alpine AS runner
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
