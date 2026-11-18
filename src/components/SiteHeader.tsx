import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Compass,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Building2,
  Menu,
  X,
  LogOut,
  LogIn,
  Search,
  Landmark,
  ChevronDown,
  Volume2,
  Settings2,
} from "lucide-react";

const navClass =
  "border-b-2 border-transparent px-2.5 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-600 transition-colors hover:text-primary";
const navActive =
  "border-b-2 border-saffron px-2.5 py-4 text-[11px] font-bold uppercase tracking-[0.1em] text-primary";

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<"EN" | "HI">("EN");
  const [textScale, setTextScale] = useState(100);
  const navigate = useNavigate();

  useEffect(() => {
    // Real text resizing for the accessibility strip, not a decorative control.
    document.documentElement.style.fontSize = `${textScale}%`;
  }, [textScale]);

  useEffect(() => {
    document.documentElement.lang = language === "HI" ? "hi" : "en";
  }, [language]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <div className="sticky top-0 z-50">
      {/* Government utility strip */}
      <div className="bg-[#0a192f] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1.5 text-[10px] sm:px-6">
          <div className="flex items-center gap-2">
            <Landmark className="h-3 w-3 text-saffron" />
            <span className="font-semibold tracking-wide">Government of India (Demo)</span>
            <span className="hidden text-white/30 sm:inline">|</span>
            <span className="hidden text-white/55 md:inline">
              Ministry of Electronics & IT · AI Governance Collaboration
            </span>
          </div>
          <div className="flex items-center gap-3 text-white/55">
            <span className="hidden items-center gap-1 sm:inline-flex" title="Screen reader support">
              <Volume2 className="h-3 w-3" />
              <span className="sr-only">Screen reader</span>
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <button
                type="button"
                onClick={() => setTextScale((value) => Math.max(85, value - 10))}
                className="hover:text-white"
                aria-label="Decrease text size"
              >
                A−
              </button>
              <button
                type="button"
                onClick={() => setTextScale(100)}
                className={`font-bold ${textScale === 100 ? "text-white" : "text-white/70"} hover:text-white`}
                aria-label="Normal text size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setTextScale((value) => Math.min(130, value + 10))}
                className="hover:text-white"
                aria-label="Increase text size"
              >
                A+
              </button>
            </span>
            <button
              type="button"
              onClick={() => setLanguage((value) => (value === "EN" ? "HI" : "EN"))}
              className="inline-flex items-center gap-1 hover:text-white"
              aria-label="Switch language label"
            >
              {language === "EN" ? "English" : "हिन्दी"}
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <header className="border-b bg-white/95 shadow-[0_1px_2px_rgba(10,25,47,0.04)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          {/* Brand */}
          <Link to="/" className="group flex shrink-0 items-center gap-3 py-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-saffron to-[#bf360c] font-display text-xl font-bold text-white shadow-sm transition-transform group-hover:scale-105">
              स
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-xl font-bold leading-none tracking-tight text-primary">
                  NAGSI
                </span>
                <span className="text-[10px] font-semibold text-slate-500">राष्ट्रीय</span>
              </div>
              <span className="mt-0.5 hidden text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:block">
                National AI Governance & Schemes Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-stretch lg:flex" aria-label="Main navigation">
            <Link to="/" className={navClass} activeProps={{ className: navActive }} activeOptions={{ exact: true }}>
              Home
            </Link>
            <Link to="/schemes" className={navClass} activeProps={{ className: navActive }} preload="intent">
              Schemes
            </Link>
            <Link to="/eligibility" className={navClass} activeProps={{ className: navActive }}>
              For You
            </Link>
            <Link to="/frameworks" className={navClass} activeProps={{ className: navActive }}>
              Frameworks
            </Link>
            <Link to="/assistant" className={navClass} activeProps={{ className: navActive }}>
              Assistant AI
            </Link>
            <Link to="/gov" className={navClass} activeProps={{ className: navActive }}>
              Gov Portal
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <Link
              to="/schemes"
              aria-label="Search schemes"
              className="hidden h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary sm:flex"
            >
              <Search className="h-4 w-4" />
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/gov"
                  className="hidden items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-slate-50 sm:flex"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-forest" />
                  Officer Area
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 border-slate-200 text-[11px] font-semibold"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate({ to: "/" });
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                asChild
                className="h-8 gap-1.5 bg-saffron px-3 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm hover:bg-saffron-deep"
              >
                <Link to="/auth">
                  <LogIn className="h-3.5 w-3.5" />
                  Officer Login
                </Link>
              </Button>
            )}

            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="border-t bg-white px-4 py-3 lg:hidden">
            <nav className="grid gap-1" aria-label="Mobile navigation">
              {[
                { to: "/" as const, label: "Home", icon: Compass },
                { to: "/schemes" as const, label: "Schemes Directory", icon: Compass },
                { to: "/eligibility" as const, label: "For You — Eligibility", icon: UserCheck },
                { to: "/frameworks" as const, label: "Governance Frameworks", icon: ShieldCheck },
                { to: "/assistant" as const, label: "Sahayak AI Assistant", icon: Sparkles },
                { to: "/gov" as const, label: "Gov Governance Portal", icon: Building2 },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary"
                >
                  <item.icon className="h-4 w-4 text-slate-400" />
                  {item.label}
                </Link>
              ))}
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-2 text-sm font-semibold text-primary hover:bg-slate-50"
              >
                <Settings2 className="h-4 w-4 text-slate-400" />
                Officer Settings & Login
              </Link>
            </nav>
          </div>
        )}

        <div className="tricolor-rule" />
      </header>
    </div>
  );
}
