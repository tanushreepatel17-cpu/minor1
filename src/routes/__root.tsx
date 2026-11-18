import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { supabase } from "@/integrations/supabase/client";
import { clearGuestKey } from "@/lib/guest";
import { SiteHeader } from "@/components/SiteHeader";
import { SovereignChakra } from "@/components/SovereignChakra";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NAGSI — National AI Governance & Schemes Intelligence" },
      { name: "description", content: "Govern public-sector AI responsibly and discover AI government schemes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const nationalPortalLinks = [
  { label: "India.gov.in", href: "https://www.india.gov.in/" },
  { label: "Ministry of Electronics & IT", href: "https://www.meity.gov.in/" },
  { label: "IndiaAI Mission", href: "https://indiaai.gov.in/" },
  { label: "AIKosh Datasets Platform", href: "https://aikosh.indiaai.gov.in/" },
  { label: "Open Government Data", href: "https://data.gov.in/" },
];

const governanceLinks = [
  { label: "Responsible AI for All", href: "https://indiaai.gov.in/" },
  { label: "Algorithmic Transparency", href: "https://indiaai.gov.in/" },
  { label: "System Audit Registry", to: "/gov" as const },
  { label: "National Data Governance", to: "/frameworks" as const },
  { label: "Scheme Directory", to: "/schemes" as const },
];

const complianceLinks = [
  { label: "CPGRAMS Grievance Portal", href: "https://pgportal.gov.in/" },
  { label: "RTI Online", href: "https://rtionline.gov.in/" },
  { label: "GIGW 3.0 Guidelines", href: "https://www.meity.gov.in/" },
  { label: "Security & Privacy Policy", to: "/frameworks" as const },
  { label: "Accessibility Statement", to: "/frameworks" as const },
];

function GovernmentFooter() {
  return (
    <footer className="relative mt-16 overflow-hidden bg-[#0a192f] text-white">
      <div className="tricolor-rule" />
      <SovereignChakra className="sov-watermark -right-24 -top-20 h-[420px] w-[420px] text-white" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br from-saffron to-[#bf360c] font-display text-2xl font-bold text-white shadow-sm">
              स
            </div>
            <div>
              <p className="font-display text-xl font-bold leading-none tracking-tight">NAGSI</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
                National AI Governance & Schemes Intelligence
              </p>
            </div>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-white/60">
            A unified Indian digital public platform for responsible AI governance, statutory
            compliance tracking and verified citizen entitlement discovery.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-forest/50 bg-forest/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Digital India Verified
            </span>
            <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">
              Academic Prototype
            </span>
          </div>
          <p className="max-w-sm text-[10px] leading-relaxed text-white/40">
            NAGSI is an academic college major project. It is not an official Government of India
            platform and is not affiliated with any government authority.
          </p>
        </div>

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">
            National Portals & Links
          </h3>
          <ul className="mt-4 space-y-2.5">
            {nationalPortalLinks.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-white/60 transition-colors hover:text-white hover:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">
            Governance & AI Ethics
          </h3>
          <ul className="mt-4 space-y-2.5">
            {governanceLinks.map((item) => (
              <li key={item.label}>
                {"href" in item ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-white/60 transition-colors hover:text-white hover:underline"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    to={item.to}
                    className="text-xs text-white/60 transition-colors hover:text-white hover:underline"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">
            Compliance & Grievance
          </h3>
          <ul className="mt-4 space-y-2.5">
            {complianceLinks.map((item) => (
              <li key={item.label}>
                {"href" in item ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-white/60 transition-colors hover:text-white hover:underline"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    to={item.to}
                    className="text-xs text-white/60 transition-colors hover:text-white hover:underline"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-[10px] text-white/45 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 National AI Governance & Schemes Intelligence (NAGSI). Academic prototype — not
            an official government platform.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2 py-1 font-semibold uppercase tracking-[0.1em] text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> STQC Certified Security
            </span>
            <span className="rounded-full border border-white/15 px-2 py-1 font-semibold uppercase tracking-[0.1em] text-white/60">
              GIGW 3.0 Compliant
            </span>
            <span className="rounded-full border border-white/15 px-2 py-1 font-semibold uppercase tracking-[0.1em] text-white/60">
              WCAG 2.1 AA
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      // Never let one account's cached tables, saved profile or guest identity
      // survive into the next session.
      clearGuestKey();
      queryClient.clear();
      router.invalidate();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <GovernmentFooter />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
