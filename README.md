# kos

Kosmos CLI — local client for [kos-services](https://github.com/chevp/kos-services) and [koshub](https://github.com/chevp/koshub).

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
```

## Quick start

```bash
kos login --url http://localhost:8080
kos status
kos services
kos logs kaga
kos deploy kaga --env dev
```

Config is stored in `~/.kos/config.json`.

## Dev

```bash
npm install
npm run dev -- status
npm run build
```