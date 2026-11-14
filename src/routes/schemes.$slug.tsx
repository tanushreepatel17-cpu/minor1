import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { schemeQuery } from "@/lib/queries";
import { documentsForScheme } from "@/lib/documents";
import { officialLinksForScheme } from "@/lib/official-links";
import { SchemeFeedback } from "@/components/SchemeFeedback";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Calendar,
  Users,
  Wallet,
  Scale,
  Cpu,
  AlertTriangle,
  ArrowRight,
  Info,
  FileText,
  ClipboardList,
} from "lucide-react";

export const Route = createFileRoute("/schemes/$slug")({
  loader: async ({ context, params }) => {
    const s = await context.queryClient.ensureQueryData(schemeQuery(params.slug));
    if (!s) throw notFound();
    return { title: s.title, summary: s.summary };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — NAGSI Government Scheme` },
          { name: "description", content: loaderData.summary },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.summary },
        ]
      : [{ title: "Scheme unavailable — NAGSI" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center space-y-4">
      <h2 className="text-2xl font-bold">Scheme Not Found</h2>
      <p className="text-muted-foreground text-sm">The scheme you are looking for does not exist in the NAGSI directory.</p>
      <Button asChild variant="outline">
        <Link to="/schemes">Return to Scheme Directory</Link>
      </Button>
    </div>
  ),
  component: SchemePage,
});

function SchemePage() {
  const { slug } = Route.useParams();
  const { data: s } = useSuspenseQuery(schemeQuery(slug));
  if (!s) return null;

  const isAi =
    s.title.toLowerCase().includes("ai") ||
    s.slug.toLowerCase().includes("ai") ||
    s.sector === "Cross-sector";

  const documents = documentsForScheme(s);
  const officialLinks = officialLinksForScheme(s);
  const primaryOfficialLink = officialLinks[0];

  const host = (() => {
    const url = primaryOfficialLink?.url;
    if (!url) return "";
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  // Benefits are stored as free text with "- " bullets and line breaks. Split
  // them so the section renders as a readable checklist instead of one wall of
  // text.
  const benefitLines = (s.benefits ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);

  const requirements = [
    {
      label: "Age",
      value:
        s.min_age != null || s.max_age != null
          ? `${s.min_age ?? 0} to ${s.max_age ?? "any"} years`
          : "No specific age limit",
    },
    {
      label: "Gender",
      value: s.genders?.length ? s.genders.join(", ") : "All genders",
    },
    {
      label: "Family annual income",
      value: s.max_annual_income
        ? `Up to ₹${s.max_annual_income.toLocaleString("en-IN")} per year`
        : "No numeric income cap stored — see written eligibility below",
    },
    {
      label: "Social category",
      value: s.social_categories?.length
        ? s.social_categories.map((c) => c.toUpperCase()).join(", ")
        : "All categories",
    },
    {
      label: "Occupation",
      value: s.occupations?.length ? s.occupations.join(", ") : "All occupations",
    },
    {
      label: "Area of residence",
      value:
        s.residence && s.residence !== "any"
          ? `${s.residence.charAt(0).toUpperCase() + s.residence.slice(1)} only`
          : "Rural or urban",
    },
    {
      label: "BPL / Ration card",
      value: s.requires_bpl ? "Required" : "Not required",
    },
    {
      label: "Person with disability",
      value: s.requires_disability ? "Required (PwD)" : "Not required",
    },
  ];

  return (
    <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between border-b pb-4">
        <Link
          to="/schemes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to all schemes
        </Link>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs h-8">
            <Link to="/eligibility">Check your eligibility</Link>
          </Button>
          <Button asChild size="sm" className="gap-1.5 text-xs h-8 bg-saffron text-saffron-foreground hover:bg-saffron/90">
            <Link to="/assistant">
              <Sparkles className="h-3.5 w-3.5" />
              Ask Sahayak AI
            </Link>
          </Button>
        </div>
      </div>

      {/* Demo Warning if applicable */}
      {s.is_demo && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-medium text-destructive">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold uppercase tracking-wider">Demo Academic Prototype Entry</p>
            <p className="mt-0.5 text-destructive/90">
              This is a demonstration entry created for college project evaluation and does not represent an active government funding call.
            </p>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary capitalize">
            {s.level} Government
          </span>
          <span className="rounded-md bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {s.sector}
          </span>
          {isAi && (
            <span className="rounded-md bg-saffron/20 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
              <Cpu className="h-3 w-3" /> AI & Compute Initiative
            </span>
          )}
          {s.last_verified && (
            <span className="rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1 ml-auto">
              <CheckCircle2 className="h-3 w-3" /> Verified: {s.last_verified}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          {s.title}
        </h1>

        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Building className="h-4 w-4" />
          <span>{s.ministry || "Government Department"}</span>
          {s.state_name ? ` · State of ${s.state_name}` : ""}
        </p>

        {/* Target Beneficiary badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          {s.beneficiary_types?.map((b) => (
            <span
              key={b}
              className="rounded-full border bg-card px-3 py-1 text-xs font-semibold text-foreground capitalize shadow-xs"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5 text-primary" /> Authority
          </span>
          <p className="font-semibold text-sm text-foreground truncate">{s.ministry || s.level}</p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary" /> Target Group
          </span>
          <p className="font-semibold text-sm text-foreground truncate capitalize">
            {s.beneficiary_types?.join(", ") || "Citizens"}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5 text-primary" /> Income Limit
          </span>
          <p className="font-semibold text-sm text-foreground">
            {s.max_annual_income ? `Up to ₹${s.max_annual_income.toLocaleString("en-IN")}` : "No ceiling stated"}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" /> Age Eligibility
          </span>
          <p className="font-semibold text-sm text-foreground">
            {s.min_age || s.max_age
              ? `${s.min_age ?? 0} to ${s.max_age ?? "Any"} years`
              : "No specific age limit"}
          </p>
        </div>
      </div>

      {/* Detailed Content Sections */}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {/* Overview */}
          <section className="rounded-2xl border bg-card p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Programme Overview
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
          </section>

          {/* Benefits */}
          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Key Support & Benefits
            </h2>
            {benefitLines.length > 1 ? (
              <ul className="space-y-2 text-sm leading-relaxed text-foreground/90">
                {benefitLines.map((line, index) => (
                  <li key={`${index}-${line.slice(0, 24)}`} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                {benefitLines[0] ?? s.benefits ?? "Benefit details are not available for this scheme."}
              </p>
            )}
          </section>

          {/* Eligibility Requirements */}
          <section id="requirements" className="rounded-2xl border bg-card p-6 shadow-sm space-y-4 scroll-mt-24">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Eligibility Requirements
              </h2>
              <a
                href="https://github.com/tanushreepatel17-cpu/minor1/blob/main/docs/scheme-requirements.md"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
              >
                Full requirements guide <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 text-xs">
              {requirements.map((req) => (
                <div key={req.label} className="rounded-lg border bg-muted/40 p-3 space-y-1">
                  <p className="font-semibold text-foreground">{req.label}</p>
                  <p className="capitalize text-muted-foreground">{req.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 space-y-1.5">
              <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Scale className="h-3.5 w-3.5" />
                Written eligibility details
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {s.eligibility || "Not provided in the scheme record."}
              </p>
            </div>

            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Structured rules above are used by the eligibility matcher. Conditions such as
              documents, landholding, family size, or income limits may appear only in the written
              details, which are the authoritative scheme wording.
            </p>
          </section>

          {/* Official Links */}
          <section
            id="official-links"
            className="rounded-2xl border bg-card p-6 shadow-sm space-y-4 scroll-mt-24"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-primary" />
                Official Links
              </h2>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
                Government sources
              </span>
            </div>

            {officialLinks.length > 0 ? (
              <ul className="grid gap-2 sm:grid-cols-2">
                {officialLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-full items-start gap-2.5 rounded-xl border bg-muted/40 p-3.5 transition-colors hover:border-primary hover:bg-primary/5"
                    >
                      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="space-y-1">
                        <span className="block text-xs font-semibold text-foreground">
                          {link.label}
                        </span>
                        <span className="block text-[11px] leading-relaxed text-muted-foreground">
                          {link.description}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-lg border border-dashed bg-muted/30 p-3.5 text-[11px] leading-relaxed text-muted-foreground">
                No direct official portal is stored for this scheme yet. NAGSI does not invent
                links — check the official notification or the concerned department&apos;s website.
              </p>
            )}
          </section>

          {/* Documents Required */}
          <section id="documents" className="rounded-2xl border bg-card p-6 shadow-sm space-y-4 scroll-mt-24">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Documents Required
              </h2>
              {s.official_url && (
                <a
                  href={s.official_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                >
                  Official portal <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {documents.length > 0 ? (
              <ul className="grid gap-2 sm:grid-cols-2 text-xs">
                {documents.map((doc) => (
                  <li
                    key={doc.label}
                    className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3"
                  >
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-foreground">{doc.label}</span>
                        <span
                          className={
                            doc.source === "text"
                              ? "rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700 dark:text-emerald-400"
                              : "rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary"
                          }
                        >
                          {doc.source === "text" ? "In scheme text" : "Eligibility rule"}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        {doc.reason}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/30 p-4 space-y-1">
                <p className="text-sm font-medium text-foreground">
                  No specific documents could be derived for this scheme.
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Check the written eligibility details above and the official portal for the exact
                  documents needed.
                </p>
              </div>
            )}

            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Built from this scheme&apos;s written text and its structured eligibility rules
              (category, BPL, disability, age, residence, occupation and benefit type). The official
              notification and portal are the authoritative source.
            </p>
          </section>

          <SchemeFeedback schemeId={s.id} schemeTitle={s.title} />
        </div>

        {/* Sidebar Action Card */}
        <aside className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-card space-y-5 lg:sticky lg:top-24">
            <h3 className="font-bold text-base border-b pb-3">Official Application</h3>

            {primaryOfficialLink ? (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Applications must be filed directly on the concerned department&apos;s official
                  portal. NAGSI does not process or accept applications or fees.
                </p>

                <Button asChild size="lg" className="w-full gap-2 shadow-sm font-semibold">
                  <a href={primaryOfficialLink.url} target="_blank" rel="noreferrer">
                    Apply on Official Portal
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>

                <div className="text-[11px] text-muted-foreground space-y-1 pt-1">
                  <p>
                    <strong>Portal:</strong> {host}
                  </p>
                  <p>
                    <strong>Verified:</strong>{" "}
                    {s.last_verified || "Verified via official notification"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed bg-muted/30 p-3.5 text-[11px] leading-relaxed text-muted-foreground">
                No direct official portal is stored for this scheme yet. NAGSI does not invent
                links — check the official notification or the concerned department&apos;s website.
              </p>
            )}

            <div className="pt-4 border-t space-y-3">
              <div className="rounded-xl border border-saffron/30 bg-saffron/10 p-3.5 space-y-2">
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-saffron" />
                  Have Questions?
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Ask Sahayak about documents needed, eligibility guidelines, or similar alternative schemes.
                </p>
                <Button asChild size="sm" variant="outline" className="w-full text-xs h-8 bg-card">
                  <Link to="/assistant">Chat with Sahayak</Link>
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
