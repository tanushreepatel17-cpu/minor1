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
> - `/auth` — government officer sign-in. New officer accounts are created through the service-role Admin API with `email_confirm: true`, so **no confirmation email is sent** and sign-up signs you in immediately (this avoids Supabase's built-in email rate limit). Use **1-Click Demo Officer Login** for evaluation:
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
| `http://localhost:8080/schemes` | Page shell renders instantly, then shows the first **48** of **3,540** schemes in about 2–4 s (4 parallel requests). **Show more schemes** adds 48 at a time; search and filters run client-side |
| Scheme detail page | Shows all 8 structured requirements, written eligibility text, an **Official Links** block that opens the scheme's own department portal (or states clearly when no portal is stored), a **Documents Required** checklist, formatted **Key Support & Benefits**, and public **Feedback** |
| Scheme detail page → **Feedback** | Submit a star rating and optional comment; every visitor sees all reviews (the author's own is marked **you**) and the public average. NAGSI never shows email addresses or private account data |
| `/gov` after officer sign-in | Dashboard shows the live counts (4 AI systems, 2 open incidents) for every new officer account |
| `/eligibility` → fill profile → **Analyze My Eligibility** | Scrolls to **Recommended Schemes for You** and lists matches in batches of 24 |
| `/eligibility` → **Save Profile & Register** | Saves the profile and shows the registration success panel |
| `/auth` → **1-Click Demo Officer Login** | Signs in and opens `/gov` |
| `/auth` → **Register demo account** → submit | Account is created and signed in immediately; no confirmation email, no rate limit |
| `/assistant` → ask a question | Streaming starts immediately; the first words appear in about 1–3 s. Only the matching schemes are sent to the model, and if the provider is slow or rate-limited the grounded local engine answers instead |
