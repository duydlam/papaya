FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN pnpm install --frozen-lockfile
COPY . .
ARG APP=api
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN pnpm exec nx run ${APP}:build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
ARG APP=api
ENV APP=${APP}
EXPOSE 3000 3001
CMD ["sh", "-c", "if [ \"$APP\" = api ]; then node dist/apps/api/dist/main.js; else cd apps/web && NEXT_DIST_DIR=.next-production node node_modules/next/dist/bin/next start -H 0.0.0.0; fi"]
