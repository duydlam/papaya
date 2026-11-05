# Papaya

Nx monorepo starter with a NestJS API, Next.js UI, PostgreSQL, Redis, and Docker Compose. Use Node.js 22.14+ with Corepack; the workspace pins pnpm 11.28.4.

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

Open http://localhost:3000 and sign in with the local demo credentials `papaya` / `papaya`. The web app keeps the JWT in `localStorage`; CRUD requests send it as a Bearer token.

Docker Compose starts PostgreSQL and Redis only; the API and web run through Nx as shown above. If local ports 5432 or 6379 are occupied, set `POSTGRES_HOST_PORT` or `REDIS_HOST_PORT`. TypeORM schema synchronization is enabled in the API development environment; disable `DB_SYNC` and use migrations before production deployments. Replace demo credentials and `JWT_SECRET` outside local development.

## Deploy to a VPS

Pushes to `master` run lint, tests, format check, and builds. On success, GitHub Actions publishes the API and web images to GHCR, copies `k8s/papaya.yml` to the Waterbase VPS, applies it to K3s, and waits for both rollouts. The workflow can also be started manually with **Actions → CI → Run workflow** on `master`. The regular `docker-compose.yml` remains for local PostgreSQL/Redis only.

### Production setup

The Waterbase cluster already has namespace `prod`, Traefik, and the `ghcr-pull` image pull secret. The API Deployment reads `secret/prod/papaya` through Vault Agent using the `papaya` Kubernetes auth role; migrations run at API startup with `DB_SYNC=false`. The Ingress routes `/auth` and `/helloworld` to the API and all other paths to Next.js on `papaya.waterbase.io.vn`.

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

Each app reads its own `.env` file (`apps/api/.env` and `apps/web/.env`); copy the matching `.env.example` first. Docker Compose only starts PostgreSQL and Redis. The API applies a global exception filter and validation pipe. HelloWorld CRUD endpoints are `GET/POST /helloworld`, `GET/PATCH/DELETE /helloworld/:id`; login is `POST /auth/login`.

## Papaya production provision

The Waterbase VPS uses Vault KV v2 path `secret/prod/papaya`. It contains the API environment, `NEXT_PUBLIC_API_URL=https://papaya.waterbase.io.vn`, database `papaya` with schema `public`, and Redis DB index `1`. The Redis DB index is configurable through `REDIS_DB` (local default `0`); credentials stay in Vault. The PostgreSQL app role is `papaya_app` and has access limited to this database/schema.

Cloudflare Tunnel `waterbase-k3s` routes `papaya.waterbase.io.vn` through Traefik, and the tunnel manages its CNAME. The API/web Deployments, Services, and Ingress are already provisioned in K3s; Deployments start at zero replicas until the first successful workflow run publishes images and applies the commit-specific tags. Until then, the hostname returns HTTP 503 because the Services have no ready pods.
