import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Officer Portal Sign In — NAGSI" },
      {
        name: "description",
        content: "Sign in to the NAGSI government AI governance and risk triage workspace.",
      },
      { property: "og:title", content: "Officer Portal Sign In — NAGSI" },
      {
        property: "og:description",
        content: "Secure role-gated access for authorized departmental officers.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "in") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error || !data.session) {
        toast.error(
          error?.message === "Invalid login credentials"
            ? "Invalid email or password. Use the 1-Click Demo Officer Login, or register and confirm your email first."
            : (error?.message ?? "Sign in failed. Please try again."),
        );
        return;
      }
      toast.success("Welcome back, Officer!");
      navigate({ to: "/gov" });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName.trim() || undefined } },
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.user && !data.session) {
        toast.success("Account created! Check your email to confirm, then sign in.");
        setMode("in");
        return;
      }
      // Session exists (email confirmation disabled): trigger already granted roles.
      toast.success("Account created! You have been granted demo officer permissions.");
      navigate({ to: "/gov" });
    }
  };

  const demoLogin = async () => {
    setLoading(true);
    const demoEmail = "demo.officer@nagsi.gov.in";
    const demoPassword = "DemoOfficer@2026";

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (error || !data.session) {
        // Never navigate without a session: email confirmation is required on this project.
        setEmail(demoEmail);
        setPassword(demoPassword);
        toast.error(
          error?.message ??
            "Demo officer account is unavailable. Credentials have been filled in; contact the administrator.",
        );
        return;
      }

      toast.success("Signed in as Demo Governance Officer");
      navigate({ to: "/gov" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border bg-card p-8 shadow-card space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {mode === "in" ? "Government Officer Sign In" : "Register Officer Account"}
          </h1>
          <p className="text-xs text-muted-foreground">
            Internal National AI Governance & Schemes Intelligence Workspace
          </p>
        </div>

        {/* Quick Demo Login Button */}
        <div className="rounded-xl border border-saffron/30 bg-saffron/10 p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
            <ShieldCheck className="h-4 w-4 text-saffron" />
            <span>Academic Evaluation Quick Access</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Instant 1-click access to test the AI System Registry, Risk Triage, and Incident workflows.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={demoLogin}
            disabled={loading}
            className="w-full text-xs font-semibold bg-card h-8"
          >
            {loading ? "Authenticating..." : "1-Click Demo Officer Login →"}
          </Button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t w-full" />
          <span className="bg-card px-2 text-[10px] uppercase font-semibold text-muted-foreground">
            Or With Email
          </span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={submit} className="space-y-4">
          {mode === "up" && (
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  required
                  minLength={3}
                  placeholder="Officer full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-9 h-10 text-xs bg-background"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">Official Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="email"
                required
                placeholder="officer@department.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 h-10 text-xs bg-background"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 h-10 text-xs bg-background"
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-10 text-xs font-semibold" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "in"
                ? "Sign In to Gov Portal"
                : "Submit Registration"}
          </Button>

          {mode === "up" && (
            <p className="rounded-lg border bg-muted/40 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
              New officer accounts must confirm their email before the first sign-in. For instant
              evaluation access, use the 1-Click Demo Officer Login above.
            </p>
          )}
        </form>

        <div className="text-center pt-2 border-t">
          <button
            type="button"
            className="text-xs text-accent hover:underline font-medium"
            onClick={() => setMode(mode === "in" ? "up" : "in")}
          >
            {mode === "in"
              ? "New departmental user? Register demo account"
              : "Already have credentials? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
