# EMART

Energy Meter Analysis and Reporting Technology, migrated from the original static application to Next.js App Router, TypeScript, Tailwind CSS v4 and shadcn/ui.

## Run locally

Tested with Node.js 24.18.0 and Yarn 4.17.1.

```sh
corepack enable
yarn install --immutable
yarn dev
```

Open http://localhost:3000. Debugging mode remains enabled by default. The demo login requires a username and password, sets the original `EMARTSESSIONID` cookie, and does not authenticate the password against a backend. No authentication service was added.

```sh
yarn lint
yarn typecheck
yarn test
yarn build
yarn start
```

## Browser regression checks

```sh
yarn exec playwright install chromium
yarn build
yarn test:e2e
```

Playwright starts a production instance on port 3000 and a separate device-mode development instance on port 3002. Device HTTP/WebSocket tests use intercepted fixtures; they do not operate physical switches. Stop unrelated servers on those ports before running tests.

With the production app running on port 3000:

```sh
node scripts/verify-pages.mjs final
node scripts/contrast.mjs
```

Reports and screenshots are written to ignored `.verification/`; Playwright results go to `playwright-report/`.

## Device integration

The repository contains no firmware/backend. As in the original, settings and dashboard edit/save controls request same-origin `*.json` firmware endpoints, including in debug mode. They report failures when those endpoints are absent; no fake success or persistent demo backend was added.

To use existing firmware, copy `.env.example` to `.env.local`, set `NEXT_PUBLIC_EMART_DEBUG=false`, and rebuild. The deployment must serve/proxy the original firmware endpoints at the same origin. Live readings retain `ws://hostname:81/dashboard`; actual device networking, cookies and deployment must be verified against that hardware. No backend, authentication or transport-security redesign was included.

Legacy HTML, CSS, JS, vendor files, duplicate images and reference screenshots were removed after migration verification. Assets are consolidated under `public/img/`. Old `.html` URLs still redirect to the corresponding Next.js routes. Calculation regression tests use recorded reference outputs and no longer depend on legacy source files.

Read [the static audit](docs/STATIC-AUDIT.md) and [the migration report](docs/MIGRATION-REPORT.md) for contracts, decisions, verification and limitations.
