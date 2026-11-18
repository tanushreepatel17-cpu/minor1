import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { schemeDirectoryQuery } from "@/lib/queries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Bookmark,
  Building,
  Tag,
  X,
  Cpu,
  Layers,
  ArrowRight,
  FileText,
  ArrowUpDown,
  ShieldCheck,
  BadgeCheck,
  Phone,
  Mail,
  Globe,
  Landmark,
  SlidersHorizontal,
} from "lucide-react";

export const Route = createFileRoute("/schemes/")({
  validateSearch: (search: Record<string, unknown>): { q?: string | undefined } => ({
    q: typeof search["q"] === "string" && search["q"] ? (search["q"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "National AI Government Schemes & Subsidies Directory — NAGSI" },
      {
        name: "description",
        content:
          "Search verified Indian central and state government schemes, compute grants, fellowships and subsidies with official application routes.",
      },
      { property: "og:title", content: "National AI Government Schemes & Subsidies Directory — NAGSI" },
      {
        property: "og:description",
        content:
          "Search verified Indian government schemes with official sources, eligibility criteria and benefits.",
      },
    ],
  }),
  loader: ({ context }) => {
    if (typeof window === "undefined") return;
    void context.queryClient.prefetchQuery(schemeDirectoryQuery).catch(() => {});
  },
  component: Schemes,
});

const AUDIENCES = [
  { id: "all", label: "All Beneficiaries" },
  { id: "startups", label: "Startups" },
  { id: "students", label: "Students" },
  { id: "researchers", label: "Researchers" },
  { id: "msmes", label: "MSMEs" },
  { id: "farmers", label: "Farmers" },
  { id: "women", label: "Women" },
  { id: "citizens", label: "Citizens" },
];

const SECTORS = [
  "All Sectors",
  "Cross-sector",
  "Education",
  "Agriculture",
  "Health",
  "Startups",
  "Manufacturing",
  "Energy",
  "Finance",
  "Employment",
];

const PAGE_SIZE = 48;

type SortKey = "recommended" | "title" | "sector";

function hostOf(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function accentForSector(sector: string) {
  switch (sector) {
    case "Education":
      return "bg-azure";
    case "Agriculture":
      return "bg-forest";
    case "Health":
      return "bg-[#0e7490]";
    case "Startups":
    case "Manufacturing":
      return "bg-saffron";
    case "Energy":
      return "bg-gold";
    default:
      return "bg-primary";
  }
}

function Schemes() {
  const { q: urlQ } = Route.useSearch();
  const { data = [], isLoading, isError, refetch } = useQuery(schemeDirectoryQuery);
  const [q, setQ] = useState(urlQ ?? "");
  const [level, setLevel] = useState<"all" | "central" | "state">("all");
  const [selectedAud, setSelectedAud] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("All Sectors");
  const [onlyAi, setOnlyAi] = useState(false);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sort, setSort] = useState<SortKey>("recommended");

  // A search typed on the landing page arrives as ?q=… — adopt it, and adopt it
  // again if the user searches from the header while this page is mounted.
  useEffect(() => {
    setQ(urlQ ?? "");
  }, [urlQ]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [q, level, selectedAud, selectedSector, onlyAi, sort]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const hasActiveFilters =
    q !== "" ||
    level !== "all" ||
    selectedAud !== "all" ||
    selectedSector !== "All Sectors" ||
    onlyAi;

  const resetFilters = () => {
    setQ("");
    setLevel("all");
    setSelectedAud("all");
    setSelectedSector("All Sectors");
    setOnlyAi(false);
  };

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return data.filter((s) => {
      if (level !== "all" && s.level !== level) return false;
      if (selectedAud !== "all" && !s.beneficiary_types.includes(selectedAud)) return false;
      if (selectedSector !== "All Sectors" && s.sector !== selectedSector) return false;

      if (onlyAi) {
        const isAi =
          s.title.toLowerCase().includes("ai") ||
          s.slug.toLowerCase().includes("ai") ||
          s.summary.toLowerCase().includes("ai") ||
          s.summary.toLowerCase().includes("compute") ||
          s.summary.toLowerCase().includes("gpu") ||
          s.sector === "Cross-sector";
        if (!isAi) return false;
      }

      if (needle !== "") {
        const hay = `${s.title} ${s.summary} ${s.sector} ${s.ministry} ${s.benefits}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }

      return true;
    });
  }, [data, q, level, selectedAud, selectedSector, onlyAi]);

  const sorted = useMemo(() => {
    if (sort === "recommended") return list;
    const copy = [...list];
    if (sort === "title") copy.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "sector")
      copy.sort((a, b) => a.sector.localeCompare(b.sector) || a.title.localeCompare(b.title));
    return copy;
  }, [list, sort]);

  const total = data.length;
  const centralCount = data.filter((s) => s.level === "central").length;
  const stateCount = data.filter((s) => s.level === "state").length;
  const portalCount = data.filter((s) => Boolean(s.official_url)).length;
  const visible = sorted.slice(0, visibleCount);
  const compareRows = visible.slice(0, 3);

  return (
    <div className="bg-[#f8fafc] pb-14">
      {/* ---------------------------------------------------------------- */}
      {/* Directory masthead                                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-b bg-gradient-to-b from-white to-[#f0f4ff]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
          <div>
            <p className="sov-eyebrow">
              <Landmark className="h-3 w-3" /> नागरिक सेवा · Citizen Services
            </p>
            <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold leading-tight text-primary sm:text-[2.6rem]">
              National AI Government Schemes &amp; Subsidies Directory
            </h1>
            <p className="mt-1.5 text-sm font-semibold text-saffron">
              राष्ट्रीय एआई योजनाएं एवं सब्सिडी निर्देशिका
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
              Search, filter and compare{" "}
              <strong className="text-primary">
                {isLoading ? "3,540" : total.toLocaleString("en-IN")}
              </strong>{" "}
              verified central and state government schemes. Every page links to the scheme&apos;s
              own official department portal.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="sov-chip sov-chip-green">
                <ShieldCheck className="h-3 w-3" /> Official sources verified
              </span>
              <span className="sov-chip sov-chip-blue">
                <BadgeCheck className="h-3 w-3" /> {isLoading ? "1,898" : portalCount.toLocaleString("en-IN")} direct portals
              </span>
              <span className="sov-chip">Updated 2026</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-card sm:grid-cols-3">
            <div className="col-span-3 grid grid-cols-3 divide-x divide-slate-100">
              <div className="px-2.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
                  Total schemes
                </p>
                <p className="sov-num mt-1 font-display text-xl font-bold text-primary">
                  {isLoading ? "3,540" : total.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="px-2.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
                  Central
                </p>
                <p className="sov-num mt-1 font-display text-xl font-bold text-primary">
                  {isLoading ? "—" : centralCount.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="px-2.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
                  State
                </p>
                <p className="sov-num mt-1 font-display text-xl font-bold text-primary">
                  {isLoading ? "—" : stateCount.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <div className="col-span-3 flex items-center justify-between rounded-lg bg-saffron px-3 py-2.5 text-white">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/80">
                  Digital coverage
                </p>
                <p className="sov-num font-display text-lg font-bold">100% Digital</p>
              </div>
              <BadgeCheck className="h-6 w-6 text-white/80" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Search and filters                                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-card">
          <div className="flex flex-col gap-2 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search schemes, ministries, subsidies, fellowships, compute, DPDP…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-11 rounded-md border-slate-300 bg-white pl-10 pr-16 text-sm shadow-none focus-visible:ring-primary"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 sm:flex">
                <span className="sov-kbd">⌘</span>
                <span className="sov-kbd">K</span>
              </span>
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-16 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-primary sm:right-3"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-md border border-slate-300 px-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Sort
                </span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="h-8 border-0 bg-transparent pr-1 text-xs font-semibold text-primary focus:outline-none"
                  aria-label="Sort schemes"
                >
                  <option value="recommended">Recommended</option>
                  <option value="title">Title A–Z</option>
                  <option value="sector">Sector</option>
                </select>
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-9 gap-1.5 rounded-md border-slate-300 px-3 text-xs font-semibold"
                onClick={resetFilters}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Reset filters
              </Button>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 border-t pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
                <Filter className="h-3 w-3" /> Level
              </span>
              <div className="flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
                {(["all", "central", "state"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                      level === l
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-500 hover:text-primary"
                    }`}
                  >
                    {l === "all" ? "All levels" : `${l} govt`}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setOnlyAi(!onlyAi)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                  onlyAi
                    ? "border-saffron/40 bg-[#fff7ed] text-saffron"
                    : "border-slate-200 bg-white text-slate-500 hover:border-saffron/40 hover:text-saffron"
                }`}
              >
                <Cpu className="h-3 w-3" />
                AI initiatives only
              </button>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-destructive hover:underline"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
                Audience
              </span>
              {AUDIENCES.map((aud) => (
                <button
                  key={aud.id}
                  onClick={() => setSelectedAud(aud.id)}
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                    selectedAud === aud.id
                      ? "border-primary bg-primary text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {aud.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
                <Tag className="h-3 w-3" /> Sector
              </span>
              {SECTORS.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSector(sec)}
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                    selectedSector === sec
                      ? "border-saffron bg-[#fff7ed] text-saffron"
                      : "border-slate-200 bg-white text-slate-600 hover:border-saffron/40 hover:text-saffron"
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Results                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b pb-3">
          <div>
            <p className="sov-eyebrow">Verified National AI Schemes</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-primary">
              {isLoading ? "Loading directory…" : `${list.length.toLocaleString("en-IN")} schemes found`}
            </h2>
            <p className="mt-1 text-[11px] text-slate-500">
              Showing {visible.length.toLocaleString("en-IN")} of{" "}
              {isLoading ? "3,540" : list.length.toLocaleString("en-IN")}
              {hasActiveFilters ? " matching your filters" : " published schemes"}.
            </p>
          </div>
          <span className="sov-chip sov-chip-green">
            <Sparkles className="h-3 w-3" /> AI matching active
          </span>
        </div>

        {isLoading && (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-white p-14 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
            <p className="text-sm font-semibold text-primary">Loading the scheme directory…</p>
            <p className="text-xs text-slate-500">
              Fetching all 3,540 verified schemes. This takes a moment the first time.
            </p>
          </div>
        )}

        {isError && (
          <div className="mt-8 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-12 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
            <h3 className="mt-3 text-base font-semibold">The scheme directory could not be loaded</h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-600">
              Check your connection and try again.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4 text-xs">
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {visible.map((s) => {
                const isBookmarked = !!bookmarks[s.id];
                const isAi =
                  s.title.toLowerCase().includes("ai") ||
                  s.slug.toLowerCase().includes("ai") ||
                  s.sector === "Cross-sector";
                const portalHost = hostOf(s.official_url);
                const applyHref = s.official_url || null;

                return (
                  <article
                    key={s.id}
                    className="sov-card sov-card-hover group flex flex-col overflow-hidden"
                  >
                    <div className={`h-[3px] ${accentForSector(s.sector)}`} />
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="sov-chip">
                            {s.level === "central" ? "Central Govt" : "State Govt"}
                          </span>
                          <span className="sov-chip sov-chip-blue">{s.sector}</span>
                          {isAi && (
                            <span className="sov-chip sov-chip-saffron">
                              <Cpu className="h-2.5 w-2.5" /> AI Initiative
                            </span>
                          )}
                          {!s.is_demo && (
                            <span className="sov-chip sov-chip-green">
                              <ShieldCheck className="h-2.5 w-2.5" /> Verified
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => toggleBookmark(s.id, e)}
                          className="rounded p-1 text-slate-400 transition-colors hover:text-saffron"
                          title={isBookmarked ? "Remove bookmark" : "Bookmark scheme"}
                          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark scheme"}
                        >
                          <Bookmark
                            className={`h-4 w-4 ${isBookmarked ? "fill-saffron text-saffron" : ""}`}
                          />
                        </button>
                      </div>

                      {s.is_demo && (
                        <p className="mt-2 rounded border border-destructive/20 bg-destructive/5 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-destructive">
                          Demo — academic prototype entry
                        </p>
                      )}

                      <h3 className="mt-2.5 font-display text-xl font-bold leading-snug text-primary">
                        <Link
                          to="/schemes/$slug"
                          params={{ slug: s.slug }}
                          className="hover:text-saffron"
                        >
                          {s.title}
                        </Link>
                      </h3>

                      <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                        <Building className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {s.ministry || s.level}
                          {s.state_name ? ` · ${s.state_name}` : ""}
                        </span>
                      </p>

                      <p className="mt-2.5 line-clamp-3 text-[11px] leading-relaxed text-slate-600">
                        {s.summary}
                      </p>

                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-y py-2.5 text-[10px]">
                        <div>
                          <dt className="font-semibold uppercase tracking-[0.08em] text-slate-400">
                            Support
                          </dt>
                          <dd className="mt-0.5 line-clamp-1 font-semibold text-primary">
                            {s.benefits?.replace(/<[^>]+>/g, " ").trim().slice(0, 60) ||
                              "See scheme details"}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold uppercase tracking-[0.08em] text-slate-400">
                            Beneficiaries
                          </dt>
                          <dd className="mt-0.5 line-clamp-1 font-semibold capitalize text-primary">
                            {s.beneficiary_types.slice(0, 2).join(", ") || "All citizens"}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold uppercase tracking-[0.08em] text-slate-400">
                            Official portal
                          </dt>
                          <dd className="mt-0.5 truncate font-semibold text-primary">
                            {portalHost ?? "Not stored"}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold uppercase tracking-[0.08em] text-slate-400">
                            Coverage
                          </dt>
                          <dd className="mt-0.5 font-semibold text-primary">
                            {s.level === "central" ? "All India" : s.state_name || "State"}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {s.beneficiary_types.slice(0, 4).map((b) => (
                          <span
                            key={b}
                            className="rounded-sm bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold capitalize text-slate-600"
                          >
                            {b}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                        <Link
                          to="/schemes/$slug"
                          params={{ slug: s.slug }}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-primary"
                        >
                          View eligibility criteria <ArrowRight className="h-3 w-3" />
                        </Link>

                        {applyHref ? (
                          <a
                            href={applyHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-md bg-saffron px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-saffron-deep"
                          >
                            Apply Now <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <Link
                            to="/schemes/$slug"
                            params={{ slug: s.slug }}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-[10px] font-bold text-primary hover:bg-slate-50"
                          >
                            View details <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {list.length === 0 && (
              <div className="mt-8 rounded-xl border border-dashed bg-white p-12 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-3 text-base font-semibold">No schemes match your criteria</h3>
                <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                  Try adjusting your search terms or clearing one of the filters above.
                </p>
                <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4 text-xs">
                  Reset all filters
                </Button>
              </div>
            )}

            {visible.length < list.length && (
              <div className="mt-7 flex flex-col items-center gap-1.5">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  className="h-9 rounded-md border-slate-300 text-xs font-semibold"
                >
                  Show more schemes
                </Button>
                <p className="text-[10px] text-slate-500">
                  {(list.length - visible.length).toLocaleString("en-IN")} more available
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Comparison                                                       */}
      {/* ---------------------------------------------------------------- */}
      {!isLoading && !isError && compareRows.length > 0 && (
        <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="sov-eyebrow">Side-by-side comparison</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-primary">
                Compare Selected Schemes
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                Derived from the first three results matching your current filters.
              </p>
            </div>
            <span className="sov-chip">Up to 3 schemes</span>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
            <table className="sov-table min-w-[720px]">
              <thead>
                <tr>
                  <th className="w-[18%]">Comparison attribute</th>
                  {compareRows.map((s) => (
                    <th key={s.id} className="w-[27%]">
                      <span className="block text-[11px] font-bold normal-case tracking-normal text-primary">
                        {s.title}
                      </span>
                      <span className="mt-0.5 block text-[9px] font-medium normal-case tracking-normal text-slate-500">
                        {s.level === "central" ? "Central Government" : "State Government"}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Ministry / department", (s: (typeof compareRows)[number]) => s.ministry || "—"],
                  ["Sector", (s: (typeof compareRows)[number]) => s.sector],
                  [
                    "Primary beneficiaries",
                    (s: (typeof compareRows)[number]) =>
                      s.beneficiary_types.slice(0, 3).join(", ") || "All citizens",
                  ],
                  [
                    "Support / benefit",
                    (s: (typeof compareRows)[number]) =>
                      s.benefits?.replace(/<[^>]+>/g, " ").trim().slice(0, 90) || "See scheme page",
                  ],
                  [
                    "Official portal",
                    (s: (typeof compareRows)[number]) => hostOf(s.official_url) ?? "Not stored",
                  ],
                  [
                    "Verification",
                    (s: (typeof compareRows)[number]) => (s.is_demo ? "Demo entry" : "Published official source"),
                  ],
                ].map(([label, read]) => (
                  <tr key={label as string}>
                    <td className="font-semibold text-slate-500">{label as string}</td>
                    {compareRows.map((s) => (
                      <td key={s.id} className="text-slate-700">
                        {(read as (row: typeof s) => string)(s)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* How to apply                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <p className="sov-eyebrow">Single-window guidance</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-primary">
              How to Apply via Verified Government Portals
            </h2>
            <p className="mt-1.5 text-xs text-slate-600">
              NAGSI never collects applications or fees. Every route below opens the concerned
              department&apos;s own website.
            </p>

            <ol className="mt-5 space-y-4">
              {[
                {
                  title: "Open the scheme page and read the criteria",
                  text: "Check the written eligibility, age and income limits, residence and required documents before starting an application.",
                },
                {
                  title: "Use the scheme's own official portal",
                  text: "The Official Links block opens the department portal, application form or official notification — never a third-party aggregator.",
                },
                {
                  title: "Keep your documents ready",
                  text: "Aadhaar or identity proof, income certificate, category certificate, bank details and any scheme-specific documents are commonly required.",
                },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-primary">{step.title}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
              <Button
                asChild
                className="h-9 gap-1.5 rounded-md bg-saffron px-3 text-[11px] font-bold text-white hover:bg-saffron-deep"
              >
                <Link to="/eligibility">
                  Check your eligibility <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-9 gap-1.5 rounded-md border-slate-300 px-3 text-[11px] font-bold text-primary"
              >
                <Link to="/assistant">
                  <Sparkles className="h-3.5 w-3.5 text-saffron" /> Ask Sahayak
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-[#0a192f] to-[#17395f] p-5 text-white shadow-card">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#ffb59a]">
                <Phone className="h-3 w-3" /> Citizen support
              </span>
              <h3 className="mt-3 font-display text-lg font-bold">
                Certified Schemes Helpdesk
              </h3>
              <p className="mt-1 text-[10px] text-white/50">Demo numbers for this academic prototype</p>
              <p className="sov-num mt-2 font-display text-xl font-bold">1800-111-AI-GOV</p>
              <p className="mt-0.5 text-[10px] text-white/55">Monday–Saturday · 9:00 AM – 6:00 PM IST</p>
              <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3 text-[10px] text-white/65">
                <p className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-[#ffb59a]" /> support@nagsi.demo
                </p>
                <p className="flex items-center gap-1.5">
                  <Globe className="h-3 w-3 text-[#ffb59a]" /> Official portals only · no agents
                </p>
              </div>
              <Button
                asChild
                className="mt-4 h-8 w-full gap-1.5 rounded-md bg-saffron text-[10px] font-bold text-white hover:bg-saffron-deep"
              >
                <Link to="/assistant">
                  Open support ticket <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-forest" />
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  STQC Certified Portal
                </p>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                GIGW 3.0 and WCAG 2.1 AA aligned. Official links are checked against the
                scheme&apos;s published notification and department website.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <span className="sov-chip sov-chip-green">STQC security</span>
                <span className="sov-chip sov-chip-blue">GIGW 3.0</span>
                <span className="sov-chip">WCAG 2.1 AA</span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 flex items-start gap-1.5 text-[10px] leading-relaxed text-slate-500">
          <FileText className="mt-0.5 h-3 w-3 shrink-0" />
          Eligibility on NAGSI is a starting point, not a legal determination. Always confirm the
          final criteria and application process on the scheme&apos;s official notification.
        </p>
      </section>
    </div>
  );
}
