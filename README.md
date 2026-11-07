# Civic Benefits Compass (NAGSI)

Academic prototype for discovering Indian government schemes and exploring public-sector AI governance. This is **not** an official government platform.

## Scheme requirements document

Complete eligibility requirements for every published scheme (3,540 schemes: 492 central + 3,048 state) are documented in:

- [`docs/scheme-requirements.md`](docs/scheme-requirements.md) — readable guide, grouped by level, state, and sector.
- [`docs/scheme-requirements.csv`](docs/scheme-requirements.csv) — spreadsheet-friendly export with one row per scheme.

Each entry lists age, gender, income, social category, occupation, residence, BPL, and disability requirements, followed by the scheme's written eligibility details.

## Development

You need Node.js and npm.

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

New officer accounts created through the form must confirm their email before signing in.

See [`PROMPT.md`](PROMPT.md) for a copy-paste run-and-demo brief.

## Stack

- TanStack Start + React + Vite
- Supabase (Postgres + Auth + RLS)
- Sahayak scheme assistant (`src/lib/chat.server.ts` + `/api/chat`)
