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

## Stack

- TanStack Start + React + Vite
- Supabase (Postgres + Auth + RLS)
- Sahayak scheme assistant (`src/lib/chat.server.ts` + `/api/chat`)
