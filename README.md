# kos

Kosmos CLI — local client for [kos-services](https://github.com/chevp/kos-services) and [koshub](https://github.com/chevp/koshub),
plus local dev-stack orchestration (`up`/`down`) and deploy targets for GCP Cloud Run (kos-services) and
Firebase Hosting (frost-hub).

## Install

```bash
npm install -g @kosmos/kos
```

Or run locally with `npm run dev -- <command>`.

## Commands

```
kos login --url <url>       Connect to a kos-services instance
kos status                  Show connection status
kos services                List registered services
kos logs [service]          Fetch log output  (-n <lines>)
kos deploy <service>        Trigger a deployment (--env dev|prod)
                             "frost-hub"    → build + firebase deploy --only hosting
                             "kos-services" → scripts/gcp/build-and-push.sh + deploy.sh (gcloud run deploy)
                             anything else  → POST /api/deploy/:service on the configured kos-services

kos up [targets...]         Start the local dev stack: services (docker compose, scoped to
                             services/kos-services/docker-compose.yml only), frost-hub (build +
                             firebase hosting emulator). Default: both. --build forces a rebuild.
kos down [targets...]       Stop the local dev stack. Default: both.
kos doctor                  Check docker/pnpm/firebase/gcloud are on PATH

kos cloud status            List live Cloud Run services (production target, project/region
                             read from infrastructure/deploy/prod.cloudrun)
```

## Quick start

```bash
kos login --url http://localhost:8080
kos status
kos services
kos logs kaga
kos deploy kaga --env dev

# local dev stack
kos doctor
kos up                    # kos-services (docker compose) + frost-hub (firebase hosting emulator)
kos up --build            # same, but rebuild first
kos down

# production
kos cloud status           # gcloud run services list
kos deploy frost-hub       # firebase deploy --only hosting
kos deploy kos-services    # gcloud run deploy (requires GCP_PROJECT env var + gcloud auth login)
```

`kos up`/`kos down` accept explicit targets too: `kos up services`, `kos down frost-hub`.

`kos up services`/`kos down services` only touch `services/kos-services/docker-compose.yml`
(its own compose project, `-p kos-services`) — they never start the root `docker-compose.yml`'s
unrelated services (redis, nuna-*, koshub, prefab-registry, game-admin-console). Use the root
`docker compose up`/`scripts/start.sh` directly if you need the full stack.

On first `kos up frost-hub` / `kos deploy frost-hub`, a placeholder `firebase.json`/`.firebaserc`
is scaffolded under `apps/frost-hub/` — run `firebase use --add` there once to bind a real
Firebase project before deploying.

`kos deploy kos-services` deploys IAM-only (`--no-allow-unauthenticated`, same as kaga/nuna-*) to
a dedicated Cloud SQL instance (`kosmos-kos-services-db` by default, override via
`KOS_SERVICES_CLOUD_SQL_INSTANCE`). It expects `GCP_PROJECT` set and `gcloud auth login` already
done — run `scripts/gcp/preflight.sh` once first to provision the service account/Cloud SQL grants.

Config is stored in `~/.kos/config.json`.

## Dev

```bash
npm install
npm run dev -- status
npm run build
```