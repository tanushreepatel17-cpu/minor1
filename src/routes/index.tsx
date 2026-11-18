import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SovereignChakra } from "@/components/SovereignChakra";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  CheckCircle2,
  Cpu,
  Database,
  Factory,
  GraduationCap,
  Landmark,
  Layers,
  Lock,
  Network,
  Rocket,
  Scale,
  ShieldCheck,
  Sparkles,
  Sprout,
  Users,
  Wallet,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NAGSI — National AI Governance & Schemes Intelligence" },
      {
        name: "description",
        content:
          "A sovereign Indian digital platform for responsible AI governance, statutory compliance and verified citizen entitlement discovery.",
      },
      { property: "og:title", content: "NAGSI — National AI Governance & Schemes Intelligence" },
      {
        property: "og:description",
        content:
          "AI system registry, explainable risk assessment, and verified Indian AI schemes for citizens, students, startups and MSMEs.",
      },
    ],
  }),
  component: Index,
});

const TRUST_ITEMS = [
  { icon: Scale, title: "Sovereign Governance", note: "Statutory oversight" },
  { icon: GraduationCap, title: "IndiaAI Fellowship", note: "Research & higher study" },
  { icon: Factory, title: "MSME & Industry", note: "Adoption capital subsidy" },
  { icon: Sprout, title: "Research & Innovation", note: "Labs and grants" },
  { icon: Landmark, title: "Culture & Welfare", note: "Citizen entitlements" },
  { icon: Rocket, title: "Startup India", note: "Seed to scale support" },
];

const FLAGSHIP_SCHEMES = [
  {
    slug: "indiaai-mission",
    tag: "Flagship Central Scheme",
    accent: "bg-saffron",
    title: "IndiaAI Mission",
    summary:
      "National programme building India's AI ecosystem across subsidised GPU compute, datasets, foundation models, skilling and startup financing.",
    rows: [
      ["Support", "Subsidised GPU compute"],
      ["Coverage", "National · Cross-sector"],
    ],
    tags: ["Compute", "Foundation Models", "Fellowships"],
  },
  {
    slug: "aikosh",
    tag: "Datasets & DPI",
    accent: "bg-forest",
    title: "AIKosh Datasets Platform",
    summary:
      "A unified public platform providing curated non-personal datasets, models and tooling so innovators can build without data barriers.",
    rows: [
      ["Support", "Free datasets & models"],
      ["Coverage", "Open national platform"],
    ],
    tags: ["Open Data", "Models", "Research"],
  },
  {
    slug: "indiaai-fellowship",
    tag: "Fellowship",
    accent: "bg-azure",
    title: "IndiaAI FutureSkills Fellowships",
    summary:
      "Fellowships that support AI study and research at undergraduate, postgraduate and doctoral levels across recognised institutions.",
    rows: [
      ["Support", "Stipend & research grant"],
      ["Coverage", "UG · PG · PhD"],
    ],
    tags: ["Students", "Research", "Stipend"],
  },
  {
    slug: "futureskills-prime-incentive-program",
    tag: "Skilling Incentive",
    accent: "bg-gold",
    title: "FutureSkills Prime Incentive",
    summary:
      "Reimburses eligible AI and emerging-tech courses, with incentives up to the programme cap on verified certifications.",
    rows: [
      ["Support", "Up to ₹12,000 incentive"],
      ["Coverage", "Accredited courses"],
    ],
    tags: ["Skilling", "Certification", "Citizens"],
  },
];

const PILLARS = [
  {
    step: "01",
    title: "Sovereign Compute & Data",
    text: "National GPU capacity and curated public datasets under a single sovereign access layer.",
  },
  {
    step: "02",
    title: "Certified Model Registry",
    text: "Every public-sector model registered with provenance, purpose and accountable ownership.",
  },
  {
    step: "03",
    title: "Explainable Risk Triage",
    text: "Eight transparent dimensions score rights impact, autonomy, personal data and scale.",
  },
  {
    step: "04",
    title: "Citizen Entitlement Delivery",
    text: "Schemes, subsidies and fellowships matched to the citizen's own verified profile.",
  },
];

const CERT_STEPS = [
  {
    icon: Database,
    title: "Model & Data Provenance",
    text: "Source, training data lineage and dataset consent status are recorded before evaluation.",
  },
  {
    icon: Scale,
    title: "Explainable Risk & Equity",
    text: "Eight-dimension risk triage with documented fairness and rights-impact review.",
  },
  {
    icon: ShieldCheck,
    title: "Bias Monitoring & Safety",
    text: "Continuous drift, bias and incident monitoring with human override requirements.",
  },
  {
    icon: BadgeCheck,
    title: "Sovereign Trust Seal",
    text: "A time-bound certification status that can be audited, suspended or renewed.",
  },
];

const AUDIT_ROWS = [
  {
    system: "Crop Advisory Assistant",
    dept: "Ministry of Agriculture",
    risk: "Moderate",
    status: "Certified",
    statusClass: "sov-chip sov-chip-green",
  },
  {
    system: "Student Welfare Triage",
    dept: "Dept. of School Education",
    risk: "High",
    status: "Review Pending",
    statusClass: "sov-chip sov-chip-amber",
  },
  {
    system: "MSME Credit Scoring",
    dept: "Ministry of MSME",
    risk: "High",
    status: "Certified",
    statusClass: "sov-chip sov-chip-green",
  },
  {
    system: "Public Health Chatbot",
    dept: "Dept. of Health & Family Welfare",
    risk: "Critical",
    status: "Flagged",
    statusClass: "sov-chip sov-chip-red",
  },
];

const LOCAL_SERVICES = [
  {
    title: "Service Delivery Simplification",
    category: "Citizen Services",
    note: "Discover schemes, documents and application routes in one place.",
    to: "/schemes" as const,
    gradient: "from-[#dfe8ff] via-[#eef3ff] to-white",
    icon: Layers,
  },
  {
    title: "Cyber Security & Data Protection",
    category: "Trust & Safety",
    note: "Read the statutory guardrails behind public-sector AI deployment.",
    to: "/frameworks" as const,
    gradient: "from-[#e6f4ec] via-[#f0faf4] to-white",
    icon: Lock,
  },
  {
    title: "Better Governance & Engagement",
    category: "Institutional",
    note: "Track registered systems, risks, incidents and audit actions.",
    to: "/gov" as const,
    gradient: "from-[#fff0e6] via-[#fff7f0] to-white",
    icon: Building2,
  },
];

function Index() {
  return (
    <div className="flex flex-col">
      {/* ---------------------------------------------------------------- */}
      {/* 1. HERO                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="sov-hero">
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_0.7fr] lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffb59a]">
              <span className="h-1.5 w-1.5 rounded-full bg-saffron" />
              सत्यमेव जयते · Government of India (Demo)
            </div>

            <h1 className="mt-5 max-w-3xl text-[2.1rem] font-bold leading-[1.1] text-white sm:text-5xl lg:text-[3.5rem]">
              National AI Governance &amp;
              <br className="hidden sm:block" /> Schemes Intelligence Portal
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/70">
              The country&apos;s single-window gateway uniting the IndiaAI Mission, the DPDP Act
              2023 compliance framework and direct benefit delivery — auditing responsible AI
              adoption across ministries while connecting citizens, students, startups and MSMEs to
              3,540 verified schemes.
            </p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              <Button
                asChild
                className="h-10 gap-1.5 rounded-md bg-saffron px-4 text-xs font-bold text-white shadow-md hover:bg-saffron-deep"
              >
                <Link to="/schemes">
                  Explore Schemes &amp; Subsidies
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button
                asChild
                className="h-10 gap-1.5 rounded-md bg-forest px-4 text-xs font-bold text-white shadow-md hover:bg-[#035a2f]"
              >
                <Link to="/frameworks">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Model Trust Seal Certification
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-10 gap-1.5 rounded-md border-white/25 bg-transparent px-4 text-xs font-bold text-white/85 hover:bg-white/10 hover:text-white"
              >
                <Link to="/assistant">
                  <Sparkles className="h-3.5 w-3.5 text-[#ffb59a]" />
                  Ask NAGSI Sahayak
                </Link>
              </Button>
            </div>
          </div>

          {/* National emblem */}
          <div className="relative hidden flex-col items-center justify-center lg:flex lg:px-6">
            <SovereignChakra className="absolute h-[420px] w-[420px] text-[#c8a24a]/15" />
            <div className="absolute h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(200,162,74,0.22),transparent_66%)] blur-2xl" />
            <img
              src="/brand/emblem-stone.png"
              alt="Lion Capital of Ashoka, the State Emblem of India"
              className="relative h-[310px] w-auto opacity-55 drop-shadow-[0_0_40px_rgba(200,162,74,0.22)] xl:h-[350px]"
            />
            <p
              lang="hi"
              className="relative mt-5 text-center text-2xl font-semibold tracking-wide text-white/75 sm:text-[1.7rem]"
            >
              सत्यमेव जयते
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 2. TRUST STRIP                                                   */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-y bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-100 px-4 sm:px-6 md:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="flex items-start gap-2.5 py-4 pl-3 first:pl-0 lg:px-3">
              <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
              <div>
                <p className="text-[11px] font-bold text-primary">{item.title}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 3. NOTICE TICKER                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-saffron text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-hidden px-4 py-2.5 sm:px-6">
          <span className="shrink-0 rounded-sm bg-white/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]">
            New
          </span>
          <p className="truncate text-[11px] font-medium text-white/95 sm:text-xs">
            IndiaAI GPU compute capacity applications are open for startups, researchers and
            institutions — verified official route available in the directory.
          </p>
          <Link
            to="/schemes"
            className="ml-auto hidden shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white hover:underline sm:flex"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 4. SOVEREIGN ARCHITECTURE                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-white py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="sov-eyebrow justify-center">Institutional</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-primary sm:text-[2.35rem]">
              India&apos;s Sovereign AI Architecture
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Two integrated systems under one national framework — statutory oversight for the
              government, and a verified entitlement layer for every citizen.
            </p>
          </div>

          <div className="mt-9 grid gap-5 lg:grid-cols-2">
            {/* Governance card */}
            <article className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
              <div className="h-[3px] bg-primary" />
              <div className="p-6 sm:p-7">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-blue text-primary">
                    <Scale className="h-5 w-5" />
                  </span>
                  <div>
                    <span className="sov-chip sov-chip-blue">Public Sector AI Governance</span>
                    <h3 className="mt-2.5 font-display text-xl font-bold text-primary sm:text-2xl">
                      AI Governance &amp; DPI Stack Model Trust
                    </h3>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-slate-600">
                  A statutory registry of every public-sector AI system, scored through eight
                  explainable risk dimensions and mapped to DPDP Act 2023 and India AI Governance
                  Guidelines 2025.
                </p>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {[
                    "AI system inventory by department",
                    "Explainable eight-dimension risk triage",
                    "DPDP, GIGW and NIST alignment",
                    "Incident logging with human override",
                  ].map((item) => (
                    <li key={item} className="sov-check">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t pt-4">
                  <Link to="/gov" className="sov-link inline-flex items-center gap-1 text-xs">
                    Open governance workspace <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link
                    to="/frameworks"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-primary"
                  >
                    View frameworks
                  </Link>
                </div>
              </div>
            </article>

            {/* Entitlement card */}
            <article className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
              <div className="h-[3px] bg-saffron" />
              <div className="p-6 sm:p-7">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#fff7ed] text-saffron">
                    <Wallet className="h-5 w-5" />
                  </span>
                  <div>
                    <span className="sov-chip sov-chip-saffron">Citizen Entitlement Intelligence</span>
                    <h3 className="mt-2.5 font-display text-xl font-bold text-primary sm:text-2xl">
                      AI Scheme Intelligence &amp; Direct Benefit Transfer
                    </h3>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-slate-600">
                  A single verified directory of 3,540 central and state schemes, with transparent
                  eligibility rules and a direct link to each scheme&apos;s own official portal.
                </p>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {[
                    "3,540 verified schemes",
                    "1,898 official department portals",
                    "Profile-based eligibility matching",
                    "Public, moderated scheme feedback",
                  ].map((item) => (
                    <li key={item} className="sov-check">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-saffron" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t pt-4">
                  <Link to="/schemes" className="sov-link inline-flex items-center gap-1 text-xs">
                    Explore schemes <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link
                    to="/eligibility"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-primary"
                  >
                    Check eligibility
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 5. FOUR PILLARS                                                  */}
      {/* ---------------------------------------------------------------- */}
      <section className="sov-cta-band py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="sov-eyebrow sov-eyebrow-light">Sovereign Infrastructure</p>
              <h2 className="mt-2 max-w-2xl font-display text-3xl font-bold text-white sm:text-[2.35rem]">
                From Citizen Need to Sovereign Deployment in 4 Pillars
              </h2>
            </div>
            <Link
              to="/frameworks"
              className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70 hover:text-white"
            >
              Read the governance framework <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-9 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((pillar) => (
              <div key={pillar.step} className="bg-[#0c1e37] p-5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ffb59a]/40 text-[11px] font-bold text-[#ffb59a]">
                  {pillar.step}
                </span>
                <h3 className="mt-3 text-sm font-bold text-white">{pillar.title}</h3>
                <p className="mt-2 text-[11px] leading-relaxed text-white/55">{pillar.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-[#ffb59a]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ffb59a]">
                  AI at Cost
                </p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-white/60">
                Sovereign compute is allocated on published, auditable criteria — not on commercial
                negotiation or opaque priority.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-emerald-300" />
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                  Ethics in Exception
                </p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-white/60">
                High-risk systems can proceed only through a documented exception with human
                accountability and a time-bound review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 6. FLAGSHIP SCHEMES                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-[#f8fafc] py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="sov-eyebrow">National Programmes</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-primary sm:text-[2.35rem]">
                Flagship National AI Schemes &amp; Subsidies
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Verified entitlements with direct links to each scheme&apos;s own official portal.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="h-9 gap-1.5 rounded-md border-slate-300 px-3 text-[11px] font-bold uppercase tracking-wide text-primary hover:bg-slate-50"
            >
              <Link to="/schemes">
                View all schemes <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {FLAGSHIP_SCHEMES.map((scheme) => (
              <article
                key={scheme.slug}
                className="sov-card sov-card-hover flex flex-col overflow-hidden"
              >
                <div className={`h-[3px] ${scheme.accent}`} />
                <div className="flex flex-1 flex-col p-4">
                  <span className="sov-chip sov-chip-saffron self-start">{scheme.tag}</span>
                  <h3 className="mt-2.5 font-display text-lg font-bold leading-snug text-primary">
                    <Link to="/schemes/$slug" params={{ slug: scheme.slug }}>
                      {scheme.title}
                    </Link>
                  </h3>
                  <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-slate-600">
                    {scheme.summary}
                  </p>

                  <dl className="mt-3 space-y-1.5 border-y py-2.5">
                    {scheme.rows.map(([label, value]) => (
                      <div key={label} className="flex items-start justify-between gap-2 text-[10px]">
                        <dt className="text-slate-500">{label}</dt>
                        <dd className="text-right font-semibold text-primary">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {scheme.tags.map((tag) => (
                      <span key={tag} className="rounded-sm bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                    <Link
                      to="/schemes/$slug"
                      params={{ slug: scheme.slug }}
                      className="text-[10px] font-semibold text-slate-500 hover:text-primary"
                    >
                      View eligibility
                    </Link>
                    <Link
                      to="/schemes/$slug"
                      params={{ slug: scheme.slug }}
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-[#17395f]"
                    >
                      Apply Now <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 7. CERTIFICATION PIPELINE                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-y bg-[#f0f4ff] py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="sov-eyebrow justify-center">Certification</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-primary sm:text-[2.35rem]">
              Sovereign AI Model Certification &amp; Trust Seal Pipeline
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Every public-sector model earns a documented trust status through four auditable
              stages, from data provenance to a renewable sovereign seal.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {CERT_STEPS.map((step, index) => (
              <article key={step.title} className="sov-card p-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <step.icon className="h-4 w-4 text-saffron" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-primary">{step.title}</h3>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-600">{step.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-slate-50 px-4 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                India AI System Audit Registry · Live extract
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-forest">
                <span className="h-1.5 w-1.5 rounded-full bg-forest" /> Registry online
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="sov-table min-w-[640px]">
                <thead>
                  <tr>
                    <th>System</th>
                    <th>Department</th>
                    <th>Risk tier</th>
                    <th>Certification</th>
                  </tr>
                </thead>
                <tbody>
                  {AUDIT_ROWS.map((row) => (
                    <tr key={row.system}>
                      <td className="font-semibold text-primary">{row.system}</td>
                      <td className="text-slate-600">{row.dept}</td>
                      <td className="text-slate-600">{row.risk}</td>
                      <td>
                        <span className={row.statusClass}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Button
              asChild
              variant="outline"
              className="h-9 gap-1.5 rounded-md border-slate-300 px-4 text-[11px] font-bold uppercase tracking-wide text-primary hover:bg-white"
            >
              <Link to="/gov">
                View full registry <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 8. LOCAL SERVICES                                                */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-white py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="sov-eyebrow">Civic Commons</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-primary">
                Let&apos;s explore local services, programs &amp; initiatives
              </h2>
            </div>
            <Link
              to="/schemes"
              className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 hover:text-primary"
            >
              Browse all services <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {LOCAL_SERVICES.map((service) => (
              <Link
                key={service.title}
                to={service.to}
                className={`sov-photo-card group flex min-h-[210px] flex-col justify-between bg-gradient-to-br ${service.gradient} p-5`}
              >
                <SovereignChakra className="sov-watermark -right-10 -top-10 h-44 w-44 text-primary" />
                <div className="relative">
                  <span className="sov-chip bg-white/80">{service.category}</span>
                  <service.icon className="mt-4 h-7 w-7 text-primary/70" />
                </div>
                <div className="relative">
                  <h3 className="max-w-[15rem] font-display text-lg font-bold leading-snug text-primary">
                    {service.title}
                  </h3>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">{service.note}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary group-hover:text-saffron">
                    Explore <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 9. ELIGIBILITY CTA                                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-[#f8fafc] pb-14 lg:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0a192f] via-[#0f2544] to-[#17395f] p-6 text-white shadow-overlay sm:p-9">
            <SovereignChakra className="sov-watermark -right-20 -top-24 h-[420px] w-[420px] text-white" />
            <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
              <div>
                <p className="sov-eyebrow sov-eyebrow-light">Direct Benefit Transfer Architecture</p>
                <h2 className="mt-2 max-w-2xl font-display text-2xl font-bold sm:text-[2rem]">
                  Find Exact AI Grants &amp; Subsidies Tailored to Your Profile
                </h2>
                <p className="mt-3 max-w-xl text-xs leading-relaxed text-white/65 sm:text-sm">
                  Tell us your age, income, category and occupation once. NAGSI compares your
                  profile against every published scheme using transparent, written eligibility
                  rules — never a black box.
                </p>
                <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
                  {[
                    ["Free Governance", "No fees, ever"],
                    ["Verified Schemes", "Official portals only"],
                    ["No Data Sale", "Privacy by design"],
                  ].map(([title, note]) => (
                    <div key={title} className="rounded-md border border-white/10 bg-white/[0.05] p-2.5">
                      <p className="text-[10px] font-bold text-white">{title}</p>
                      <p className="mt-0.5 text-[9px] text-white/45">{note}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  <Button
                    asChild
                    className="h-10 gap-1.5 rounded-md bg-saffron px-4 text-xs font-bold text-white hover:bg-saffron-deep"
                  >
                    <Link to="/eligibility">
                      Check Your Eligibility <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 rounded-md border-white/25 bg-transparent px-4 text-xs font-bold text-white hover:bg-white/10 hover:text-white"
                  >
                    <Link to="/assistant">
                      <Sparkles className="h-3.5 w-3.5 text-saffron" />
                      Talk to Sahayak
                    </Link>
                  </Button>
                </div>
                <p className="mt-3 text-[9px] text-white/35">
                  Aadhaar, income and DigiLocker integration are demonstrated with clearly labelled
                  sample data in this academic prototype.
                </p>
              </div>

              <div className="grid content-start gap-3">
                {[
                  { icon: BadgeCheck, value: "3,540", label: "Verified schemes" },
                  { icon: Network, value: "1,898", label: "Official portals" },
                  { icon: Users, value: "36", label: "States & union territories" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-3"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#ffb59a]/10 text-[#ffb59a]">
                      <stat.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="sov-num font-display text-xl font-bold text-white">{stat.value}</p>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-white/45">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 10. CONSTITUTIONAL FOUNDATION                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t bg-white py-14 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="sov-eyebrow">Civic Foundation</p>
            <h2 className="mt-2 max-w-xl font-display text-3xl font-bold text-primary">
              Meet the constitutional foundation for the next generation
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
              NAGSI is built as a learning prototype for transparent, accountable digital
              governance — connecting constitutional values with the practical delivery of citizen
              entitlements.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              {[
                ["3,540", "Schemes indexed"],
                ["1,898", "Official portals"],
                ["8", "Risk dimensions"],
                ["100%", "Digital route"],
              ].map(([value, label]) => (
                <div key={label} className="border-l-2 border-saffron pl-3">
                  <p className="sov-num font-display text-2xl font-bold text-primary">{value}</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-saffron" /> Constitution
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-forest" /> Fundamental rights
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-azure" /> Digital public goods
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0f2544] via-[#17395f] to-[#0a192f] p-6 text-white shadow-overlay">
            <SovereignChakra className="sov-watermark -right-14 -top-14 h-56 w-56 text-[#c8a24a]" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#f2d58a]">
                <Landmark className="h-3 w-3" /> National Constitutional Event
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold text-white">
                Youth Governance &amp; AI Literacy Assembly
              </h3>
              <p className="mt-2 text-[11px] leading-relaxed text-white/60">
                A demonstration convening on constitutional values, algorithmic accountability and
                citizen-centric digital service delivery.
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-[10px]">
                <div>
                  <dt className="uppercase tracking-[0.1em] text-white/40">Date</dt>
                  <dd className="mt-0.5 font-semibold text-white">26 November 2026</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.1em] text-white/40">Venue</dt>
                  <dd className="mt-0.5 font-semibold text-white">New Delhi (Demo)</dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  asChild
                  className="h-8 gap-1.5 rounded-md bg-saffron px-3 text-[10px] font-bold text-white hover:bg-saffron-deep"
                >
                  <Link to="/frameworks">
                    View programme <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-8 rounded-md border-white/25 bg-transparent px-3 text-[10px] font-bold text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to="/assistant">Ask Sahayak</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
