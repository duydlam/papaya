# Papaya

Papaya is a multi-tenant insurance configuration demo. It lets users manage tenant rules, preview and process synthetic claims, compare tenant configurations, and inspect or restore configuration versions.

## Architecture

Papaya is an Nx monorepo managed with pnpm. The API and web app have separate Nx targets, environment files, and deployment images. Shared API contracts live in `packages/contracts`.

```text
Browser
  └─ Next.js App Router
      ├─ /                 Tenant directory
      ├─ /claims           Claim preview and mock processing
      ├─ /compare          Step-by-step tenant comparison
      └─ /tenants/...      Tenant editor and version history
             │
             └─ /api/* ─── NestJS
                            ├─ TenantModule
                            ├─ TenantConfig validation
                            ├─ ClaimProcessingModule
                            ├─ PostgreSQL (TypeORM)
                            └─ Redis (latest tenant config cache)
```

### Backend

- `TenantModule` owns tenant CRUD, configuration validation, comparison, archive, version history, and rollback. Its repository owns database queries; services apply business rules.
- `TenantConfig` owns config types and validation. Config versions are immutable JSONB snapshots in PostgreSQL; rollback creates a new version.
- `ClaimProcessingModule` evaluates claim preview/process requests using the tenant service. Processing uses a mock notification sender that logs payloads and does not send external notifications.
- `DatabaseModule` configures TypeORM migrations and sample tenant seeds. PostgreSQL is the source of truth.
- `RedisModule` provides Redis operations. `TenantLatestConfigCacheService` caches the latest tenant config for repeated reads.
- The request path is Nest validation pipe → controller → service → repository/cache. The global exception filter formats errors, and the response interceptor wraps successful responses.
- API routes are under `/api` to keep them separate from Next.js page routes. The FE and API share response contracts from `packages/contracts`.

### Frontend

The Next.js App Router provides the tenant directory (`/`), claim workbench (`/claims`), config comparison (`/compare`), tenant onboarding (`/tenants/new`), tenant editor (`/tenants/[tenantId]`), and version history (`/tenants/[tenantId]/history`). Feature code is grouped under `apps/web/src/modules/{tenants,claims,compare}` into API calls, hooks, and UI components. Claim evaluation rules stay in the API; the FE renders the returned result.

### Deployment

GitHub Actions runs formatting, lint, tests, and builds on pushes to `master` and pull requests. For pushes or manual runs on `master`, it publishes API and web Docker images to GHCR, applies `k8s/papaya.yml` to K3s over SSH, and waits for both deployments to roll out. Traefik routes `/api` to NestJS and other paths to Next.js at `https://papaya.waterbase.io.vn`.

## Run locally

Requirements: Node.js 22.14+ and Corepack. The workspace pins pnpm 11.28.4.

```sh
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
corepack enable
pnpm install
docker compose up -d postgres redis
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The API listens on port 3001. Its startup migrations create/update the schema and seed three fictional tenants. Docker Compose starts only PostgreSQL and Redis. If local ports 5432 or 6379 are occupied, set `POSTGRES_HOST_PORT` or `REDIS_HOST_PORT` before starting Compose.

Each app reads its own environment file: `apps/api/.env` and `apps/web/.env`. Copy the corresponding `.env.example` and set values for your local setup.

## Nx commands

Workspace scripts:

```sh
pnpm dev
pnpm lint
pnpm test
pnpm format
pnpm format:check
```

Run a target for one app with `pnpm nx <target> api` or `pnpm nx <target> web`. Supported app targets include `serve`, `build`, `lint`, and `test`.

## Production setup

The Waterbase K3s cluster has namespace `prod`, Traefik, and the `ghcr-pull` image pull secret. The API reads database and Redis runtime settings from Vault KV v2 path `secret/prod/papaya` through the `papaya` Kubernetes auth role. Expected keys include `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SCHEMA`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`, `NODE_ENV`, `PORT`, and `WEB_ORIGIN`. The production PostgreSQL schema is `public`; Redis uses database index `1`. Keep credentials in Vault.

Configure GitHub Actions at **Repo Settings → Secrets and variables → Actions**:

| Name                  | Kind     | Value                                                                  |
| --------------------- | -------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Variable | `https://papaya.waterbase.io.vn` (optional; workflow default)          |
| `VPS_HOST`            | Secret   | `169.58.149.36`                                                        |
| `VPS_USER`            | Secret   | `root` (needs access to K3s kubeconfig and `kubectl`)                  |
| `VPS_SSH_KEY`         | Secret   | Private SSH key whose public key is in root's `~/.ssh/authorized_keys` |
| `VPS_KNOWN_HOSTS`     | Secret   | Verified host-key entry for the VPS                                    |

Generate an Actions key with `ssh-keygen -t ed25519 -f ./papaya-actions`, add `papaya-actions.pub` to root's `~/.ssh/authorized_keys`, then save the private key in `VPS_SSH_KEY`. Verify the VPS host-key fingerprint before saving `VPS_KNOWN_HOSTS`. GitHub Actions uses `GITHUB_TOKEN` to publish to GHCR; K3s pulls the images with `prod/ghcr-pull`.

Cloudflare Tunnel `waterbase-k3s` routes `papaya.waterbase.io.vn` through Traefik. The API and web Deployments, Services, and Ingress are defined in `k8s/papaya.yml`.

## Requirements

Product scope and business rules are documented in [`requirements/AI_Challenge_15.prd`](requirements/AI_Challenge_15.prd). The implementation plan is in [`requirements/planning/AI_Challenge_15_plan.md`](requirements/planning/AI_Challenge_15_plan.md).
