# NAGSI — Run & Demo Prompt

Use this file as a copy-paste brief when handing the project to another developer or AI agent.

---

## Prompt

> You are working on **NAGSI (Civic Benefits Compass)**, a TanStack Start + React + Vite app backed by Supabase. It lists **3,540 published Indian government schemes** (492 central, 3,048 state) and matches citizens to schemes using structured eligibility rules.
>
> **Run it locally**
>
> ```sh
> cd civic-benefits-compass
> npm install
> npm run dev
> ```
>
> The app must run on **http://localhost:8080** (Vite is configured with `strictPort: true`). Do not change the port.
>
> **Environment**
>
> Copy `.env.example` to `.env` and fill in the Supabase project URL, publishable key, service-role key, and `DATABASE_URL`. Never commit `.env`.
>
> **Key routes**
>
> - `/` — landing page
> - `/schemes` — directory of all 3,540 schemes with search and filters
> - `/schemes/$slug` — scheme details, including a full **Eligibility Requirements** section and a link to `docs/scheme-requirements.md`
> - `/eligibility` — citizen registration and eligibility matcher. Users fill age, gender, income, category, occupation, residence, BPL, and PwD, then press **Analyze My Eligibility** to see matching schemes without saving. **Save Profile & Register** stores the profile through the `register_citizen_profile` RPC.
> - `/auth` — government officer sign-in. Email confirmation is enabled, so new accounts must confirm their email. Use **1-Click Demo Officer Login** for evaluation:
>   - Email: `demo.officer@nagsi.gov.in`
>   - Password: `DemoOfficer@2026`
> - `/gov` — officer dashboard (requires `gov_officer` role)
> - `/assistant` — Sahayak AI scheme assistant
>
> **Requirements documents**
>
> - `docs/scheme-requirements.md` — readable requirements for every published scheme
> - `docs/scheme-requirements.csv` — one row per scheme, 32 columns
>
> **Rules**
>
> - Do not collect email or password on the citizen registration form.
> - Keep all matching transparent and rule-based; results are "potential matches", not confirmed eligibility.
> - Keep the existing UI theme, layout, and scheme matching behaviour.
> - Run `npx tsc --noEmit`, `npm test`, and `npm run build` before committing.
>
> Your task: keep the app running on port 8080, verify the officer demo login, verify that `/eligibility` analyzes the entered conditions and shows matching schemes, and confirm that every scheme page displays its eligibility requirements.

---

## Demo checks

| Check | Expected |
| --- | --- |
| `http://localhost:8080/schemes` | Shows **3,540** schemes and the **Requirements Guide** button |
| Scheme detail page | Shows all 8 structured requirements plus written eligibility text |
| `/eligibility` → fill profile → **Analyze My Eligibility** | Scrolls to **Recommended Schemes for You** and lists matches |
| `/eligibility` → **Save Profile & Register** | Saves the profile and shows the registration success panel |
| `/auth` → **1-Click Demo Officer Login** | Signs in and opens `/gov` |
