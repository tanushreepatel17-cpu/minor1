import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { schemeDirectoryQuery } from "@/lib/queries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  CheckCircle2,
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
} from "lucide-react";

export const Route = createFileRoute("/schemes/")({
  head: () => ({
    meta: [
      { title: "AI Government Schemes Directory — NAGSI" },
      {
        name: "description",
        content:
          "Search AI-specific and national central and state government schemes, compute grants, and student fellowships.",
      },
      { property: "og:title", content: "AI Government Schemes Directory — NAGSI" },
      {
        property: "og:description",
        content:
          "Search verified Indian government schemes with official sources, eligibility criteria, and benefits.",
      },
    ],
  }),
  // Warm the directory as soon as the user hovers the nav link (see
  // `preload="intent"` on the header links). Returns immediately so the route
  // transition is never blocked by the download.
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

function Schemes() {
  const { data = [], isLoading, isError, refetch } = useQuery(schemeDirectoryQuery);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<"all" | "central" | "state">("all");
  const [selectedAud, setSelectedAud] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("All Sectors");
  const [onlyAi, setOnlyAi] = useState(false);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Start each new result set from the first batch again.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [q, level, selectedAud, selectedSector, onlyAi]);

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

  // Filters run over 3,540 short rows (~30 ms), so they can run synchronously
  // on each keystroke; the expensive part was the payload, not the filtering.
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return data.filter((s) => {
      // Level
      if (level !== "all" && s.level !== level) return false;

      // Audience
      if (selectedAud !== "all" && !s.beneficiary_types.includes(selectedAud)) return false;

      // Sector
      if (selectedSector !== "All Sectors" && s.sector !== selectedSector) return false;

      // AI only
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

      // Keyword query
      if (needle !== "") {
        const hay = `${s.title} ${s.summary} ${s.sector} ${s.ministry} ${s.benefits}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }

      return true;
    });
  }, [data, q, level, selectedAud, selectedSector, onlyAi]);

  const total = data.length;
  const centralCount = data.filter((s) => s.level === "central").length;
  const stateCount = data.filter((s) => s.level === "state").length;
  const visible = list.slice(0, visibleCount);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-saffron/15 px-3 py-0.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
            <Cpu className="h-3.5 w-3.5 text-saffron" />
            Verified Government Directory
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Scheme Explorer
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Search all{" "}
            <strong className="text-foreground">
              {isLoading ? "3,540" : total.toLocaleString("en-IN")}
            </strong>{" "}
            verified schemes
            {!isLoading && (
              <>
                {" "}
                — {centralCount.toLocaleString("en-IN")} central and{" "}
                {stateCount.toLocaleString("en-IN")} state government schemes
              </>
            )}
            , with full eligibility requirements on every scheme page.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline" size="sm" className="gap-2 text-xs">
            <Link to="/eligibility">Personal Eligibility Quiz</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2 text-xs">
            <a
              href="https://github.com/tanushreepatel17-cpu/minor1/blob/main/docs/scheme-requirements.md"
              target="_blank"
              rel="noreferrer"
            >
              <FileText className="h-3.5 w-3.5" />
              Requirements Guide
            </a>
          </Button>
          <Button
            asChild
            size="sm"
            className="gap-2 text-xs bg-saffron text-saffron-foreground hover:bg-saffron/90"
          >
            <Link to="/assistant">
              <Sparkles className="h-3.5 w-3.5" />
              Ask Sahayak AI
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by scheme name, ministry, keyword (e.g. compute, fellowship, subsidy)..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10 h-11 bg-card shadow-sm text-sm rounded-xl"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Level Filter Buttons */}
          <div className="flex rounded-xl border bg-card p-1 shadow-sm">
            {(["all", "central", "state"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                  level === l
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l === "all" ? "All Levels" : `${l} Govt`}
              </button>
            ))}
          </div>

          {/* AI Only Toggle Pill */}
          <button
            onClick={() => setOnlyAi(!onlyAi)}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all shadow-sm ${
              onlyAi
                ? "border-saffron bg-saffron/15 text-amber-900 dark:text-amber-200 font-semibold"
                : "border-border bg-card text-muted-foreground hover:border-primary"
            }`}
          >
            <Sparkles
              className={`h-3.5 w-3.5 ${onlyAi ? "text-saffron" : "text-muted-foreground"}`}
            />
            <span>AI Initiatives Only</span>
          </button>
        </div>

        {/* Audience and Sector Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" /> Audience:
          </span>
          {AUDIENCES.map((aud) => (
            <button
              key={aud.id}
              onClick={() => setSelectedAud(aud.id)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                selectedAud === aud.id
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-foreground"
              }`}
            >
              {aud.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
            <Tag className="h-3 w-3" /> Sector:
          </span>
          {SECTORS.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                selectedSector === sec
                  ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:border-accent hover:text-foreground"
              }`}
            >
              {sec}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="ml-auto text-xs text-destructive hover:underline font-medium inline-flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Loading state — the directory is fetched on the client so the page
          shell paints immediately instead of waiting on 3,540 rows of HTML. */}
      {isLoading && (
        <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card/40 p-14 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
          <p className="text-sm font-medium text-foreground">Loading the scheme directory…</p>
          <p className="text-xs text-muted-foreground">
            Fetching all 3,540 verified schemes. This takes a moment the first time.
          </p>
        </div>
      )}

      {isError && (
        <div className="mt-10 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-12 text-center space-y-3">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <h3 className="text-base font-semibold">The scheme directory could not be loaded</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Check your connection and try again.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2 text-xs">
            Try again
          </Button>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* Results Header */}
          <div className="mt-8 flex items-center justify-between border-b pb-3">
            <p className="text-sm font-medium text-foreground">
              Showing{" "}
              <span className="font-bold text-primary">
                {visible.length.toLocaleString("en-IN")}
              </span>{" "}
              of {list.length.toLocaleString("en-IN")} schemes
              {hasActiveFilters ? " matching your filters" : ""}
            </p>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Official sources verified · Last updated 2026
            </span>
          </div>

          {/* Schemes Grid */}
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((s) => {
              const isBookmarked = !!bookmarks[s.id];
              const isAi =
                s.title.toLowerCase().includes("ai") ||
                s.slug.toLowerCase().includes("ai") ||
                s.sector === "Cross-sector";

              return (
                <div
                  key={s.id}
                  className="group relative flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-card hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary capitalize">
                          {s.level} Govt
                        </span>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {s.sector}
                        </span>
                        {isAi && (
                          <span className="rounded-md bg-saffron/20 px-2 py-0.5 text-[10px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                            <Cpu className="h-2.5 w-2.5" /> AI Initiative
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => toggleBookmark(s.id, e)}
                        className="text-muted-foreground hover:text-saffron p-1 transition-colors"
                        title={isBookmarked ? "Remove bookmark" : "Bookmark scheme"}
                      >
                        <Bookmark
                          className={`h-4 w-4 ${isBookmarked ? "fill-saffron text-saffron" : ""}`}
                        />
                      </button>
                    </div>

                    {s.is_demo && (
                      <div className="mb-2.5 rounded bg-destructive/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-destructive border border-destructive/20">
                        Demo — Academic Prototype Entry
                      </div>
                    )}

                    <h2 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      <Link to="/schemes/$slug" params={{ slug: s.slug }}>
                        {s.title}
                      </Link>
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                      <Building className="h-3 w-3 shrink-0" />
                      <span className="truncate">{s.ministry || s.level}</span>
                      {s.state_name ? ` · ${s.state_name}` : ""}
                    </p>

                    <p className="mt-3 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {s.summary}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-5 pt-3 border-t space-y-3">
                    {/* Beneficiary tags */}
                    <div className="flex flex-wrap gap-1">
                      {s.beneficiary_types?.slice(0, 3).map((b) => (
                        <span
                          key={b}
                          className="rounded-full bg-secondary/70 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground capitalize"
                        >
                          {b}
                        </span>
                      ))}
                      {(s.beneficiary_types?.length ?? 0) > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{(s.beneficiary_types?.length ?? 0) - 3} more
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <Link
                        to="/schemes/$slug"
                        params={{ slug: s.slug }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent transition-colors"
                      >
                        <span>Full Details</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>

                      <Link
                        to="/assistant"
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-saffron transition-colors"
                      >
                        <Sparkles className="h-3 w-3 text-saffron" />
                        <span>Ask AI</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {list.length === 0 && (
            <div className="mt-12 rounded-2xl border border-dashed p-12 text-center space-y-3 bg-card/40">
              <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="text-base font-semibold">No schemes match your criteria</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try adjusting your search terms or clearing one of the filters above to see more
                opportunities.
              </p>
              <Button variant="outline" size="sm" onClick={resetFilters} className="mt-2 text-xs">
                Reset all filters
              </Button>
            </div>
          )}

          {/* Only the first batch renders, so the initial paint stays cheap. */}
          {visible.length < list.length && (
            <div className="mt-8 flex flex-col items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="text-xs"
              >
                Show more schemes
              </Button>
              <p className="text-[11px] text-muted-foreground">
                {(list.length - visible.length).toLocaleString("en-IN")} more available
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
