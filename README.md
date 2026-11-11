# Civic Benefits Compass (NAGSI)

Academic prototype for discovering Indian government schemes and exploring public-sector AI governance. This is **not** an official government platform.

## Scheme requirements document

Complete eligibility requirements for every published scheme (3,540 schemes: 492 central + 3,048 state) are documented in:

- [`docs/scheme-requirements.md`](docs/scheme-requirements.md) — readable guide, grouped by level, state, and sector.
- [`docs/scheme-requirements.csv`](docs/scheme-requirements.csv) — spreadsheet-friendly export with one row per scheme.

Each entry lists age, gender, income, social category, occupation, residence, BPL, and disability requirements, followed by the scheme's written eligibility details.

## Development

You need Node.js 22 and npm.

```sh
git clone https://github.com/tanushreepatel17-cpu/minor1.git
cd minor1
cp .env.example .env
npm i
npm run dev
```

The dev server is configured for **http://localhost:8080** (Vite `strictPort: true`).

## Demo officer login

Open `/auth` and use **1-Click Demo Officer Login**, or sign in with:

- **Email:** `demo.officer@nagsi.gov.in`
- **Password:** `DemoOfficer@2026`

Officer accounts created through the form are confirmed server-side and signed in immediately.

See [`PROMPT.md`](PROMPT.md) for a copy-paste run-and-demo brief.

## Stack

- TanStack Start + React + Vite (Nitro server output)
- Supabase (Postgres + Auth + RLS)
- Sahayak scheme assistant (`src/lib/chat.server.ts` + `/api/chat`)

## Deployment

The app ships as a normal Node server through Nitro, so one codebase runs on both platforms:

| Platform | Config file | Build preset | Output |
| --- | --- | --- | --- |
| Render | `render.yaml` | `node-server` | `.output/server/index.mjs` |
| Vercel | `vercel.json` | `vercel` | `.vercel/output` |

`GET /api/health` returns `{"status":"ok","service":"nagsi"}` without touching Supabase, so it is safe for platform health checks.

### Environment variables

Set these on both platforms. `VITE_*` values are inlined into the browser bundle, so they must be present **at build time**; the others are read at **runtime**.

| Variable | Build | Runtime | Notes |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | yes | — | Same project URL as `SUPABASE_URL` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | yes | — | Supabase publishable/anon key |
| `VITE_SUPABASE_PROJECT_ID` | yes | — | Optional project reference |
| `SUPABASE_URL` | — | yes | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | — | yes | Used by SSR and the auth middleware |
| `SUPABASE_SERVICE_ROLE_KEY` | — | yes | **Secret.** Officer signup and email confirmation |
| `AI_API_KEY` | — | optional | Without it Sahayak uses the built-in engine |
| `AI_BASE_URL` / `AI_MODEL` | — | optional | OpenAI-compatible provider overrides |
| `DATABASE_URL` | — | no | Only for running migrations locally |

### Render

1. Push the repository to GitHub.
2. In Render: **New → Blueprint**, pick the repo, and apply the detected `render.yaml`.
3. Fill in the `sync: false` environment variables when prompted.
4. Deploy. Render runs `npm ci && npm run build`, then starts `node .output/server/index.mjs` on `$PORT` and probes `/api/health`.

The free plan sleeps after inactivity, so the first request may take a few seconds.
`NODE_VERSION=22.19.0` is pinned in the blueprint.

### Vercel

1. Import the repository at <https://vercel.com/new>.
2. Framework preset: **Other** (the repo ships `vercel.json` with `"framework": null`).
3. Add the `VITE_*` and `SUPABASE_*` variables above for **Production** and **Preview**.
4. Deploy. Nitro builds with `NITRO_PRESET=vercel` and writes the Build Output API bundle to `.vercel/output`.

Do not set `NITRO_PRESET` to `node-server` on Vercel; `vercel.json` already forces the `vercel` preset.

### After the first deploy

- Add the deployed domains to Supabase **Authentication → URL Configuration** (Site URL and redirect allow list).
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only; it must never be prefixed with `VITE_`.
- Run new SQL migrations once with `node <migration runner> .env drizzle/migrations/<file>.sql` (or the Supabase SQL editor) before deploying schema-dependent code.

### Production checks

```sh
npm run build
PORT=8080 node .output/server/index.mjs   # local smoke test
```

Then verify `/`, `/schemes`, a scheme detail page, `/eligibility`, `/auth`, `/gov` after sign-in, and `/api/health`.
