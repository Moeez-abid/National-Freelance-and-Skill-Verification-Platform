FROM node:24-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI="true"
RUN corepack enable

FROM base AS build
WORKDIR /app
COPY . .
# Install dependencies and build all packages
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base AS runner
WORKDIR /app
# Copy built artifacts and necessary files
COPY --from=build /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=build /app/artifacts/api-server/package.json ./artifacts/api-server/
COPY --from=build /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=build /app/artifacts/module-4/package.json ./artifacts/module-4/
COPY --from=build /app/artifacts/module-4/dist ./artifacts/module-4/dist
COPY --from=build /app/lib/db/package.json ./lib/db/
COPY --from=build /app/lib/db/src ./lib/db/src
COPY --from=build /app/lib/api-zod/package.json ./lib/api-zod/
COPY --from=build /app/lib/api-client-react/package.json ./lib/api-client-react/
COPY --from=build /app/lib/api-spec/package.json ./lib/api-spec/
COPY --from=build /app/scripts/package.json ./scripts/
COPY --from=build /app/artifacts/mockup-sandbox/package.json ./artifacts/mockup-sandbox/

# Only install production dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

EXPOSE 5004
CMD ["pnpm", "--filter", "@workspace/api-server", "run", "start:docker"]
