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
} from "lucide-react";

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  const link = "flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-150 py-1 px-2 rounded-md hover:bg-muted/50";
  const active = { className: "flex items-center gap-1.5 text-sm font-semibold text-primary bg-primary/10 py-1 px-2.5 rounded-md" };

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
      <div className="tricolor-rule" />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-saffron to-amber-600 font-display text-lg font-bold text-white shadow-sm transition-transform group-hover:scale-105">
            स
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xl font-bold tracking-tight text-primary">NAGSI</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <span className="hidden text-[11px] text-muted-foreground sm:inline font-sans">
              National AI Governance & Schemes Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/schemes" className={link} activeProps={active} preload="intent">
            <Compass className="h-4 w-4" />
            Schemes
          </Link>
          <Link to="/eligibility" className={link} activeProps={active}>
            <UserCheck className="h-4 w-4" />
            For You
          </Link>
          <Link to="/frameworks" className={link} activeProps={active}>
            <ShieldCheck className="h-4 w-4" />
            Frameworks
          </Link>
          <Link to="/assistant" className={link} activeProps={active}>
            <Sparkles className="h-4 w-4 text-saffron" />
            <span>Assistant</span>
            <span className="rounded-full bg-saffron/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 dark:text-amber-300">
              AI
            </span>
          </Link>
          <Link to="/gov" className={link} activeProps={active}>
            <Building2 className="h-4 w-4" />
            Gov Portal
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          {user ? (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs h-8"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
          ) : (
            <Button size="sm" asChild className="gap-1.5 text-xs h-8">
              <Link to="/auth">
                <LogIn className="h-3.5 w-3.5" />
                Officer Login
              </Link>
            </Button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t bg-card px-4 py-3 md:hidden space-y-1 animate-in slide-in-from-top-2 duration-150">
          <Link
            to="/schemes"
            className={link}
            activeProps={active}
            preload="intent"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Compass className="h-4 w-4" />
            Schemes Directory
          </Link>
          <Link
            to="/eligibility"
            className={link}
            activeProps={active}
            onClick={() => setMobileMenuOpen(false)}
          >
            <UserCheck className="h-4 w-4" />
            Eligibility Finder
          </Link>
          <Link
            to="/frameworks"
            className={link}
            activeProps={active}
            onClick={() => setMobileMenuOpen(false)}
          >
            <ShieldCheck className="h-4 w-4" />
            Governance Frameworks
          </Link>
          <Link
            to="/assistant"
            className={link}
            activeProps={active}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Sparkles className="h-4 w-4 text-saffron" />
            Sahayak AI Assistant
          </Link>
          <Link
            to="/gov"
            className={link}
            activeProps={active}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Building2 className="h-4 w-4" />
            Gov Governance Portal
          </Link>
        </div>
      )}
    </header>
  );
}
