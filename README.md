# Papaya

Multi-tenant insurance configuration challenge built with Nx, NestJS, Next.js, PostgreSQL, and Redis. Use Node.js 22.14+ with Corepack; the workspace pins pnpm 11.28.4.

## Run locally

```sh
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
corepack enable
pnpm install
docker compose up -d postgres redis
pnpm nx serve api
# Run this in a second terminal.
pnpm nx serve web
```

Open http://localhost:3000. The API applies TypeORM migrations at startup and seeds the three fictional sample tenants. Docker Compose starts PostgreSQL and Redis only; the API and web run through Nx as shown above. If local ports 5432 or 6379 are occupied, set `POSTGRES_HOST_PORT` or `REDIS_HOST_PORT`.

## Deploy to a VPS

Pushes to `master` run lint, tests, format check, and builds. On success, GitHub Actions publishes the API and web images to GHCR, copies `k8s/papaya.yml` to the Waterbase VPS, applies it to K3s, and waits for both rollouts. The workflow can also be started manually with **Actions → CI → Run workflow** on `master`. The regular `docker-compose.yml` remains for local PostgreSQL/Redis only.

### Production setup

The Waterbase cluster already has namespace `prod`, Traefik, and the `ghcr-pull` image pull secret. The API Deployment reads database/Redis configuration from `secret/prod/papaya` through Vault Agent using the `papaya` Kubernetes auth role. Migrations run at API startup. The Ingress routes `/tenants` and `/claims` to the API and all other paths to Next.js on `papaya.waterbase.io.vn`.

### GitHub Actions values

Set these at **Repo Settings → Secrets and variables → Actions**:

| Name                  | Kind     | Value to enter                                                              |
| --------------------- | -------- | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Variable | `https://papaya.waterbase.io.vn` (optional; the workflow uses this default) |
| `VPS_HOST`            | Secret   | `169.58.149.36`                                                             |
| `VPS_USER`            | Secret   | `root` (needs access to `/etc/rancher/k3s/k3s.yaml` and `kubectl`)          |
| `VPS_SSH_KEY`         | Secret   | Private key whose public key is in root's `~/.ssh/authorized_keys`          |
| `VPS_KNOWN_HOSTS`     | Secret   | Verified output from `ssh-keyscan -H -p 22 169.58.149.36`                   |

Generate the Actions SSH key with `ssh-keygen -t ed25519 -f ./papaya-actions`; add `papaya-actions.pub` to root's `~/.ssh/authorized_keys`, then store the full private key in `VPS_SSH_KEY`. Verify the VPS host-key fingerprint before saving `VPS_KNOWN_HOSTS`. GHCR publishing uses the workflow's `GITHUB_TOKEN`; the existing `prod/ghcr-pull` secret is used by both Deployments.

## Nx targets

`pnpm lint`, `pnpm test`, and `pnpm format` run workspace checks/formatting. Per app: `pnpm nx <target> api` or `pnpm nx <target> web` (`build`, `serve`, `lint`, `test`).

Each app reads its own `.env` file (`apps/api/.env` and `apps/web/.env`); copy the matching `.env.example` first. Docker Compose only starts PostgreSQL and Redis. The API applies a global exception filter and validation pipe. Tenant configuration, claim preview, and mock processing endpoints are documented in `requirements/AI_Challenge_15.prd`.

## Papaya production provision

The Waterbase VPS uses Vault KV v2 path `secret/prod/papaya` for API runtime settings: `DB_HOST=postgres.prod-data.svc.cluster.local`, `DB_PORT=5432`, `DB_USER=papaya_app`, `DB_PASSWORD`, `DB_NAME=papaya`, `DB_SCHEMA=public`, `REDIS_HOST=redis.prod-data.svc.cluster.local`, `REDIS_PORT=6379`, `REDIS_PASSWORD`, `REDIS_DB=1`, `NODE_ENV=production`, `PORT=3001`, and `WEB_ORIGIN=https://papaya.waterbase.io.vn`. Keep database and Redis passwords in Vault. The existing API pod confirms this path is mounted and both passwords are present. `NEXT_PUBLIC_API_URL=https://papaya.waterbase.io.vn` is a GitHub Actions repository variable used at web image build time, not an API runtime Vault value. The PostgreSQL role `papaya_app` has CONNECT, schema USAGE, and CREATE privileges required by the startup migration.

Cloudflare Tunnel `waterbase-k3s` routes `papaya.waterbase.io.vn` through Traefik, and the tunnel manages its CNAME. The API/web Deployments, Services, and Ingress are already provisioned in K3s; Deployments start at zero replicas until the first successful workflow run publishes images and applies the commit-specific tags. Until then, the hostname returns HTTP 503 because the Services have no ready pods.
