import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { eligibilitySchemesQuery } from "@/lib/queries";
import { matchScheme, type Profile } from "@/lib/eligibility";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  UserCheck,
  Building,
  AlertCircle,
  SlidersHorizontal,
  SearchCheck,
  Save,
  GraduationCap,
  Rocket,
  Factory,
  Landmark,
  ShieldCheck,
  BadgeCheck,
  Download,
  Lock,
  FileCheck2,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/eligibility")({
  head: () => ({
    meta: [
      { title: "Find Schemes For You — NAGSI Eligibility Finder" },
      {
        name: "description",
        content:
          "Enter your age, income, category, and occupation to see government yojanas and AI initiatives you may be eligible for.",
      },
      { property: "og:title", content: "Find Schemes For You — NAGSI" },
      {
        property: "og:description",
        content: "Discover government schemes matching your profile with transparent eligibility rules.",
      },
    ],
  }),
  component: Eligibility,
});

type FieldKey =
  | "fullName"
  | "age"
  | "gender"
  | "annualIncome"
  | "socialCategory"
  | "occupation"
  | "residence";

const PRESETS: { label: string; profile: Profile }[] = [
  {
    label: "Tech Startup Founder",
    profile: {
      age: 26,
      gender: "male",
      annualIncome: 600000,
      socialCategory: "general",
      occupation: "entrepreneur",
      residence: "urban",
      bpl: false,
      disability: false,
    },
  },
  {
    label: "College Student",
    profile: {
      age: 20,
      gender: "female",
      annualIncome: 180000,
      socialCategory: "obc",
      occupation: "student",
      residence: "urban",
      bpl: false,
      disability: false,
    },
  },
  {
    label: "Rural Farmer",
    profile: {
      age: 42,
      gender: "male",
      annualIncome: 120000,
      socialCategory: "general",
      occupation: "farmer",
      residence: "rural",
      bpl: true,
      disability: false,
    },
  },
  {
    label: "Artisan / MSME",
    profile: {
      age: 35,
      gender: "female",
      annualIncome: 250000,
      socialCategory: "sc",
      occupation: "worker",
      residence: "rural",
      bpl: false,
      disability: false,
    },
  },
];

const PERSONAS = [
  {
    id: "citizen",
    label: "Citizen / Individual",
    note: "Civic eligibility, welfare and local services",
    count: "12 central schemes",
    icon: Users,
    preset: "Rural Farmer",
  },
  {
    id: "student",
    label: "Student / Researcher",
    note: "Doctoral fellowships, GPU compute and research grants",
    count: "8 active matches",
    icon: GraduationCap,
    preset: "College Student",
  },
  {
    id: "startup",
    label: "Startup Innovator",
    note: "DPIIT seed funds, compute vouchers and cloud credits",
    count: "19 fast-track grants",
    icon: Rocket,
    preset: "Tech Startup Founder",
  },
  {
    id: "msme",
    label: "MSME / Industry",
    note: "Capital subsidy, adoption grants and procurement",
    count: "14 industrial incentives",
    icon: Factory,
    preset: "Artisan / MSME",
  },
  {
    id: "cio",
    label: "Gov CIO / Bureaucrat",
    note: "Department AI deployment, audits and procurement",
    count: "6 inter-ministry pacts",
    icon: Landmark,
    preset: null,
  },
] as const;

const BLANK_PROFILE: Profile = {
  age: null,
  gender: "",
  annualIncome: null,
  socialCategory: "",
  occupation: "",
  residence: "",
  bpl: false,
  disability: false,
};

type ProfileState = "guest" | "loading" | "saved";

function Eligibility() {
  // Load on the client so the page paints immediately instead of waiting for
  // all 3,540 scheme rows during SSR.
  const { data = [], isLoading, isError, refetch } = useQuery(eligibilitySchemesQuery);
  const [p, setP] = useState<Profile>(BLANK_PROFILE);
  const [persona, setPersona] = useState<string>("");

  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [profileState, setProfileState] = useState<ProfileState>("guest");
  const loadedUserIdRef = useRef<string | null | undefined>(undefined);
  const resultsRef = useRef<HTMLElement | null>(null);

  // "For You" is personal: a signed-in visitor sees only the profile saved to
  // their own account. Guests start blank, and every sign-in/sign-out resets
  // the form first so the previous user's details can never flash or persist.
  useEffect(() => {
    let active = true;

    const clearForm = () => {
      setP(BLANK_PROFILE);
      setFullName("");
      setErrors({});
      setAnalyzed(false);
      setSubmitted(false);
      setVisibleCount(24);
      setProfileState("guest");
    };

    const loadFor = async (userId: string | null, force = false) => {
      if (!active) return;
      if (userId === loadedUserIdRef.current && !force) return;
      loadedUserIdRef.current = userId;

      if (!userId) {
        clearForm();
        return;
      }

      setProfileState("loading");
      const { data, error } = await supabase
        .from("citizen_profiles")
        .select(
          "full_name,age,gender,annual_income,social_category,occupation,residence,bpl,disability",
        )
        .eq("user_id", userId)
        .maybeSingle();

      if (!active) return;

      if (error || !data) {
        clearForm();
        setProfileState("guest");
        return;
      }

      setFullName(data.full_name ?? "");
      setP({
        age: data.age ?? null,
        gender: (data.gender ?? "") as Profile["gender"],
        annualIncome: data.annual_income ?? null,
        socialCategory: (data.social_category ?? "") as Profile["socialCategory"],
        occupation: (data.occupation ?? "") as Profile["occupation"],
        residence: (data.residence ?? "") as Profile["residence"],
        bpl: Boolean(data.bpl),
        disability: Boolean(data.disability),
      });
      setErrors({});
      setVisibleCount(24);
      // Show matches for their own saved data immediately.
      setAnalyzed(true);
      setSubmitted(true);
      setProfileState("saved");
    };

    supabase.auth
      .getSession()
      .then(({ data }) => loadFor(data.session?.user.id ?? null, true))
      .catch(() => clearForm());

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;
      const userId = session?.user.id ?? null;
      if (event === "USER_UPDATED" && userId === loadedUserIdRef.current) return;
      // Reset before loading the new account's data.
      clearForm();
      loadedUserIdRef.current = undefined;
      void loadFor(userId, true);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP((x) => ({ ...x, [k]: v }));
  const num = (v: string) => (v === "" ? null : Number(v));

  const validateProfile = () => {
    const e: Partial<Record<FieldKey, string>> = {};
    if (p.age == null || Number.isNaN(p.age)) e.age = "Age is required.";
    else if (p.age < 0 || p.age > 120) e.age = "Age must be between 0 and 120.";
    if (!p.gender) e.gender = "Please select a gender.";
    if (p.annualIncome == null || Number.isNaN(p.annualIncome) || p.annualIncome < 0)
      e.annualIncome = "Enter your family annual income (₹).";
    if (!p.socialCategory) e.socialCategory = "Please select a social category.";
    if (!p.occupation) e.occupation = "Please select an occupation.";
    if (!p.residence) e.residence = "Please select your area of residence.";
    return e;
  };

  const validate = () => {
    const e = validateProfile();
    if (!fullName.trim()) e.fullName = "Please enter your full name.";
    else if (fullName.trim().length < 3) e.fullName = "Name must be at least 3 characters.";
    return e;
  };

  // Analyse the profile without saving it. This is the button users press to
  // apply their conditions and see matching schemes.
  const analyze = () => {
    if (isLoading) {
      toast.info("Scheme data is still loading. Please wait a moment.");
      return;
    }
    const errs = validateProfile();
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Fill in all profile fields so we can analyse your eligibility.");
      return;
    }
    setAnalyzed(true);
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    toast.success(`Analysis complete — ${matches.length} schemes match your conditions.`);
  };

  const saveProfile = async () => {
    const { error } = await supabase.rpc("register_citizen_profile", {
      p_full_name: fullName.trim(),
      p_age: p.age as number,
      p_gender: p.gender as string,
      p_annual_income: p.annualIncome as number,
      p_social_category: p.socialCategory as string,
      p_occupation: p.occupation as string,
      p_residence: p.residence as string,
      p_bpl: p.bpl,
      p_disability: p.disability,
    });
    if (error) throw new Error(error.message);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // prevent duplicate submissions
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Please correct the highlighted fields.");
      return;
    }
    setSubmitting(true);
    try {
      await saveProfile();
      setSubmitted(true);
      setAnalyzed(true);
      setProfileState("saved");
      toast.success(
        matches.length
          ? `Registration complete! We found ${matches.length} schemes for your profile.`
          : "Registration complete! Your profile has been saved.",
      );
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetProfile = () => {
    setP(BLANK_PROFILE);
    setFullName("");
    setPersona("");
    setErrors({});
    setAnalyzed(false);
    setSubmitted(false);
    setVisibleCount(24);
    setProfileState("guest");
    // Clearing the form must also stop the saved profile from being treated as
    // the current source, otherwise a later re-render could restore it.
    loadedUserIdRef.current = undefined;
  };

  const results = useMemo(() => data.map((s) => ({ s, ...matchScheme(s, p) })), [data, p]);
  const matches = results.filter((r) => r.match);
  const nonMatches = results.filter((r) => !r.match);
  const showRecommendations = analyzed || submitted;
  // Render results in small batches: 1,400+ cards at once is what made this
  // page slow and unresponsive.
  const visibleMatches = showRecommendations ? matches.slice(0, visibleCount) : [];
  const remainingMatches = Math.max(0, matches.length - visibleMatches.length);

  const filledCount = [
    p.age != null,
    p.gender !== "",
    p.annualIncome != null,
    p.socialCategory !== "",
    p.occupation !== "",
    p.residence !== "",
    p.bpl,
    p.disability,
  ].filter(Boolean).length;

  // The hero meter is an honest completeness/fit indicator, not a prediction:
  // it grows as the citizen provides the fields the matcher needs.
  const fitPercent = Math.min(100, Math.round((filledCount / 8) * 100));
  const guaranteedMatches = showRecommendations ? matches.length : 0;

  const profileChips = [
    p.age != null ? `Age ${p.age}` : null,
    p.gender ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1) : null,
    p.annualIncome != null ? `₹${p.annualIncome.toLocaleString("en-IN")} / year` : null,
    p.socialCategory ? p.socialCategory.toUpperCase() : null,
    p.occupation ? p.occupation.charAt(0).toUpperCase() + p.occupation.slice(1) : null,
    p.residence ? p.residence.charAt(0).toUpperCase() + p.residence.slice(1) : null,
    p.bpl ? "BPL / Ration Card" : null,
    p.disability ? "PwD" : null,
  ].filter((value): value is string => Boolean(value));

  return (
    <div className="bg-[#f8fafc] pb-14">
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="sov-hero">
        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:py-12">
          <div>
            <p className="sov-eyebrow sov-eyebrow-light">
              <UserCheck className="h-3 w-3" /> Statutory Citizen Matching Architecture
            </p>
            <h1 className="mt-2 max-w-2xl font-display text-3xl font-bold leading-tight text-white sm:text-[2.6rem]">
              Find AI Schemes &amp; Subsidies
              <br className="hidden sm:block" /> Specifically Tailored for You
            </h1>
            <p className="mt-3 max-w-xl text-xs leading-relaxed text-white/65 sm:text-sm">
              Deterministic, rule-based matching against every published central and state scheme.
              Your saved profile is used only for this account, and nothing is shared with private
              data brokers.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/55">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Written eligibility rules
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[#ffb59a]" /> Profile scoped to your account
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileCheck2 className="h-3.5 w-3.5 text-white/60" /> Official portals only
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-white/20 bg-white p-5 text-primary shadow-overlay">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Algorithmic fit
                </p>
                <p className="mt-1 text-[10px] text-slate-500">Profile completeness</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-forest">
                <span className="h-1.5 w-1.5 rounded-full bg-forest" /> Live sync
              </span>
            </div>

            <div className="mt-3 flex items-end gap-2">
              <p className="sov-num font-display text-5xl font-bold leading-none text-primary">
                {fitPercent}%
              </p>
              <p className="pb-1 text-[10px] text-slate-500">{filledCount} of 8 fields</p>
            </div>

            <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-forest">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {guaranteedMatches} guaranteed {guaranteedMatches === 1 ? "match" : "matches"}
            </p>

            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
              {persona
                ? <>Active persona calibrated to <strong className="text-primary">{PERSONAS.find((item) => item.id === persona)?.label}</strong>. Every additional field narrows the matching rules.</>
                : "No persona selected yet. Choose a persona to prefill a sample profile, or type your own details below."}
            </p>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-forest to-emerald-500 transition-all duration-300"
                style={{ width: `${fitPercent}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between border-t pt-2.5 text-[9px] text-slate-500">
              <span>Audit ref: #IND-AI-9941</span>
              <span>Updated just now</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Step 1 — persona                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="sov-eyebrow">Step 01 · Identity calibration</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-primary sm:text-3xl">
              Select Your Citizen Persona Profile
            </h2>
          </div>
          <p className="max-w-sm text-[11px] leading-relaxed text-slate-500 sm:text-right">
            Personas prefill a sample profile so you can see how matching works. Edit every field
            below — the results always follow your own inputs.
          </p>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {PERSONAS.map((item) => {
            const active = persona === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setPersona(item.id);
                  if (item.preset) {
                    const preset = PRESETS.find((entry) => entry.label === item.preset);
                    if (preset) setP(preset.profile);
                  }
                }}
                className={`relative flex flex-col rounded-lg border p-3.5 text-left transition-all ${
                  active
                    ? "border-saffron bg-[#fff7ed] shadow-card ring-2 ring-saffron/15"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-card"
                }`}
              >
                {active && (
                  <span className="absolute -top-2 left-3 rounded-sm bg-saffron px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-white">
                    Active profile
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-md ${
                      active ? "bg-saffron/10 text-saffron" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                  </span>
                  {active ? (
                    <CheckCircle2 className="h-4 w-4 text-saffron" />
                  ) : (
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                  )}
                </div>
                <p className="mt-2.5 text-xs font-bold text-primary">{item.label}</p>
                <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-slate-500">
                  {item.note}
                </p>
                <p className="mt-2 border-t pt-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  {item.count}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Step 2 — parameters + results                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="sov-eyebrow">Step 02 · Operational data</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-primary sm:text-3xl">
              Eligibility Parameters
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {profileState === "loading" && (
              <span className="text-[11px] font-medium text-slate-500">Loading your saved profile…</span>
            )}
            {profileState === "saved" && loadedUserIdRef.current && (
              <span className="sov-chip sov-chip-green">
                <CheckCircle2 className="h-3 w-3" /> Saved profile loaded
              </span>
            )}
            <button
              type="button"
              onClick={resetProfile}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 hover:border-slate-400 hover:text-primary"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-[370px_1fr] lg:items-start">
          {/* Form */}
          <form
            onSubmit={submit}
            className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card lg:sticky lg:top-32"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-primary">
                <SlidersHorizontal className="h-4 w-4 text-saffron" />
                Your Profile Parameters
              </h3>
              <span className="sov-num text-[10px] font-semibold text-slate-500">
                {filledCount} / 8 filled
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="sov-label">Full Name *</Label>
              <Input
                placeholder="e.g. Ananya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`h-10 rounded-md border-slate-300 bg-white text-xs ${
                  errors.fullName ? "border-destructive" : ""
                }`}
              />
              {errors.fullName && <p className="text-[10px] text-destructive">{errors.fullName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="sov-label">Age *</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 24"
                  value={p.age ?? ""}
                  onChange={(e) => set("age", num(e.target.value))}
                  className={`h-10 rounded-md border-slate-300 bg-white text-xs ${
                    errors.age ? "border-destructive" : ""
                  }`}
                />
                {errors.age && <p className="text-[10px] text-destructive">{errors.age}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="sov-label">Gender *</Label>
                <select
                  className={`sov-select text-xs ${errors.gender ? "border-destructive" : ""}`}
                  value={p.gender}
                  onChange={(e) => set("gender", e.target.value as Profile["gender"])}
                >
                  <option value="">Any gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="transgender">Transgender</option>
                </select>
                {errors.gender && <p className="text-[10px] text-destructive">{errors.gender}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="sov-label">Family Annual Income (₹) *</Label>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 300000"
                value={p.annualIncome ?? ""}
                onChange={(e) => set("annualIncome", num(e.target.value))}
                className={`h-10 rounded-md border-slate-300 bg-white text-xs ${
                  errors.annualIncome ? "border-destructive" : ""
                }`}
              />
              {errors.annualIncome && (
                <p className="text-[10px] text-destructive">{errors.annualIncome}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="sov-label">Social Category *</Label>
              <select
                className={`sov-select text-xs ${errors.socialCategory ? "border-destructive" : ""}`}
                value={p.socialCategory}
                onChange={(e) => set("socialCategory", e.target.value as Profile["socialCategory"])}
              >
                <option value="">Any category</option>
                <option value="general">General</option>
                <option value="sc">SC (Scheduled Caste)</option>
                <option value="st">ST (Scheduled Tribe)</option>
                <option value="obc">OBC (Other Backward Class)</option>
                <option value="minority">Minority</option>
              </select>
              {errors.socialCategory && (
                <p className="text-[10px] text-destructive">{errors.socialCategory}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="sov-label">Occupation / Profession *</Label>
              <select
                className={`sov-select text-xs ${errors.occupation ? "border-destructive" : ""}`}
                value={p.occupation}
                onChange={(e) => set("occupation", e.target.value as Profile["occupation"])}
              >
                <option value="">Any occupation</option>
                <option value="student">Student / Researcher</option>
                <option value="farmer">Farmer / Agri-worker</option>
                <option value="worker">Artisan / Vendor / Worker</option>
                <option value="entrepreneur">Startup / Business Owner</option>
                <option value="unemployed">Unemployed / Job Seeker</option>
                <option value="other">Other</option>
              </select>
              {errors.occupation && <p className="text-[10px] text-destructive">{errors.occupation}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="sov-label">Area of Residence *</Label>
              <select
                className={`sov-select text-xs ${errors.residence ? "border-destructive" : ""}`}
                value={p.residence}
                onChange={(e) => set("residence", e.target.value as Profile["residence"])}
              >
                <option value="">Rural & urban</option>
                <option value="rural">Rural (Village)</option>
                <option value="urban">Urban (City / Town)</option>
              </select>
              {errors.residence && <p className="text-[10px] text-destructive">{errors.residence}</p>}
            </div>

            <div className="space-y-2 border-t pt-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Verifiable assertions
              </p>
              <label className="flex cursor-pointer items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-[11px] font-medium text-slate-700">
                <span>BPL / Ration card household</span>
                <Switch checked={p.bpl} onCheckedChange={(v) => set("bpl", v)} />
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-[11px] font-medium text-slate-700">
                <span>Person with disability (PwD)</span>
                <Switch checked={p.disability} onCheckedChange={(v) => set("disability", v)} />
              </label>
            </div>

            <div className="space-y-2 pt-1">
              <Button
                type="button"
                onClick={analyze}
                disabled={isLoading}
                className="h-10 w-full gap-1.5 rounded-md bg-saffron text-xs font-bold text-white hover:bg-saffron-deep"
              >
                <SearchCheck className="h-4 w-4" />
                {isLoading ? "Loading schemes..." : "Recalculate Entitlement Scores"}
              </Button>
              <p className="text-center text-[10px] leading-relaxed text-slate-500">
                {isLoading
                  ? "Loading all published schemes so the matcher can run."
                  : isError
                    ? "Scheme data could not be loaded. Use Retry in the results panel."
                    : `${data.length.toLocaleString("en-IN")} schemes ready. Applies your conditions instantly and saves nothing until you register.`}
              </p>
              {!submitted && (
                <Button
                  type="submit"
                  variant="outline"
                  className="h-9 w-full gap-1.5 rounded-md border-slate-300 text-xs font-semibold"
                  disabled={submitting || isLoading}
                >
                  <Save className="h-3.5 w-3.5" />
                  {isLoading
                    ? "Loading schemes..."
                    : submitting
                      ? "Saving your profile..."
                      : "Save Profile & Register"}
                </Button>
              )}
            </div>

            {submitted && (
              <div className="space-y-2 rounded-md border border-emerald-200 bg-emerald-50 p-3.5">
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-forest">
                  <CheckCircle2 className="h-4 w-4" /> Registration complete
                </p>
                <p className="text-[10px] leading-relaxed text-slate-600">
                  Your profile is saved to this account only. We found{" "}
                  <span className="font-bold text-primary">{matches.length}</span> matching schemes.
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 w-full gap-1.5 bg-primary text-[10px] font-bold"
                  onClick={() =>
                    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                >
                  View recommended schemes <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            <div className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              <p className="text-[10px] leading-relaxed text-slate-500">
                No identity data is sold or shared with private vendors. Signed-in visitors see only
                their own saved profile; guests always start blank.
              </p>
            </div>
          </form>

          {/* Results */}
          <section ref={resultsRef} id="recommended-schemes" className="scroll-mt-28 space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2 border-b pb-3">
              <div>
                <p className="sov-eyebrow">Step 03 · Matched entitlements</p>
                <h2 className="mt-1 font-display text-2xl font-bold text-primary sm:text-3xl">
                  {showRecommendations ? (
                    <>
                      <span className="sov-num text-saffron">{matches.length}</span> High-Impact
                      Sovereign Entitlements
                    </>
                  ) : (
                    "Your Scheme Matches"
                  )}
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  {showRecommendations
                    ? `Showing ${visibleMatches.length} of ${matches.length} matching schemes out of ${data.length.toLocaleString("en-IN")} published.`
                    : isLoading
                      ? "Loading all published schemes so the matcher can run."
                      : `Fill in your profile and press “Recalculate” to check all ${data.length.toLocaleString("en-IN")} published schemes.`}
                </p>
              </div>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 rounded-md border-slate-300 text-[10px] font-bold"
              >
                <Link to="/assistant">
                  <Sparkles className="h-3 w-3 text-saffron" /> Ask Sahayak
                </Link>
              </Button>
            </div>

            {showRecommendations && profileChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Your profile
                </span>
                {profileChips.map((chip) => (
                  <span key={chip} className="sov-chip">
                    {chip}
                  </span>
                ))}
              </div>
            )}

            {showRecommendations && matches.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                <div className="flex items-start gap-2.5">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
                  <div>
                    <p className="text-[11px] font-bold text-forest">
                      Direct entitlement match found
                    </p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-slate-600">
                      {matches.length} schemes align with your profile. Apply on each scheme&apos;s
                      own official portal — NAGSI never collects applications or fees.
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="h-8 gap-1.5 rounded-md bg-primary text-[10px] font-bold"
                >
                  <Link to="/auth">
                    Apply to all via DigiLocker (Demo) <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            )}

            {isLoading ? (
              <div className="rounded-xl border border-dashed bg-white p-10 text-center">
                <p className="text-sm font-semibold text-primary">Loading all published schemes...</p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                  The eligibility matcher will be ready in a moment.
                </p>
              </div>
            ) : isError ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
                <h3 className="mt-3 text-base font-semibold">Could not load scheme data</h3>
                <p className="mx-auto mt-1 max-w-sm text-xs text-slate-600">
                  Check the Supabase connection and try again.
                </p>
                <Button type="button" variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
                  Retry
                </Button>
              </div>
            ) : !showRecommendations ? (
              <div className="rounded-xl border border-dashed bg-white p-10 text-center">
                <SearchCheck className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-3 text-base font-semibold">Your matches will appear here</h3>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                  Enter age, gender, income, category, occupation, residence, BPL and disability
                  status, then run the analysis. Nothing is saved unless you register.
                </p>
                <Button type="button" onClick={analyze} className="mt-3 h-9 gap-1.5 bg-saffron text-xs font-bold text-white hover:bg-saffron-deep">
                  <SearchCheck className="h-3.5 w-3.5" /> Analyze My Eligibility
                </Button>
              </div>
            ) : matches.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-white p-10 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-3 text-base font-semibold">No schemes matched your conditions</h3>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                  Try relaxing your income, category, occupation, or residence selections and
                  analyze again.
                </p>
                <Button type="button" variant="outline" size="sm" onClick={resetProfile} className="mt-3">
                  Reset profile
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-3">
                  {visibleMatches.map(({ s }) => (
                    <article key={s.id} className="sov-card overflow-hidden">
                      <div className="h-[3px] bg-forest" />
                      <div className="p-4 sm:p-5">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="sov-chip sov-chip-blue">
                              {s.level === "central" ? "Central Govt" : "State Govt"}
                            </span>
                            <span className="sov-chip">{s.sector}</span>
                            <span className="sov-chip sov-chip-green">
                              <BadgeCheck className="h-2.5 w-2.5" /> Matched
                            </span>
                            {s.is_demo && (
                              <span className="sov-chip sov-chip-red">Demo entry</span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-forest">Verified route</span>
                        </div>

                        <h3 className="mt-2.5 font-display text-xl font-bold leading-snug text-primary">
                          <Link to="/schemes/$slug" params={{ slug: s.slug }} className="hover:text-saffron">
                            {s.title}
                          </Link>
                        </h3>
                        <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-slate-600">
                          {s.summary}
                        </p>

                        <dl className="mt-3 grid gap-2 border-y py-2.5 text-[10px] sm:grid-cols-3">
                          <div>
                            <dt className="font-semibold uppercase tracking-[0.08em] text-slate-400">
                              Ministry
                            </dt>
                            <dd className="mt-0.5 line-clamp-1 font-semibold text-primary">
                              {s.sector === "Cross-sector" ? "Multiple departments" : s.sector}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-semibold uppercase tracking-[0.08em] text-slate-400">
                              Residence
                            </dt>
                            <dd className="mt-0.5 font-semibold capitalize text-primary">
                              {s.residence === "any" || !s.residence ? "Rural & urban" : s.residence}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-semibold uppercase tracking-[0.08em] text-slate-400">
                              Age / income rule
                            </dt>
                            <dd className="mt-0.5 font-semibold text-primary">
                              {s.min_age != null || s.max_age != null
                                ? `${s.min_age ?? 0}–${s.max_age ?? "any"} yrs`
                                : "No age limit"}
                              {s.max_annual_income != null
                                ? ` · ≤ ₹${s.max_annual_income.toLocaleString("en-IN")}`
                                : ""}
                            </dd>
                          </div>
                        </dl>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <Link
                            to="/schemes/$slug"
                            params={{ slug: s.slug }}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-primary"
                          >
                            <FileCheck2 className="h-3 w-3" /> View statutory criteria
                          </Link>
                          <Link
                            to="/schemes/$slug"
                            params={{ slug: s.slug }}
                            className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-[#17395f]"
                          >
                            Claim Entitlement <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {remainingMatches > 0 && (
                  <div className="flex flex-col items-center gap-1.5 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-md border-slate-300 text-xs"
                      onClick={() => setVisibleCount((count) => count + 24)}
                    >
                      Show 24 more schemes
                    </Button>
                    <p className="text-[10px] text-slate-500">
                      {remainingMatches.toLocaleString("en-IN")} more matching schemes
                    </p>
                  </div>
                )}

                {nonMatches.length > 0 && (
                  <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-slate-400" />
                      <h3 className="text-sm font-semibold text-primary">
                        Why {nonMatches.length.toLocaleString("en-IN")} schemes did not match
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      These schemes have specific criteria that did not align with your current
                      selections:
                    </p>
                    <div className="max-h-72 divide-y overflow-y-auto pr-2 text-[11px]">
                      {nonMatches.slice(0, 20).map(({ s, reasons }) => (
                        <div
                          key={s.id}
                          className="flex flex-col justify-between gap-1 py-2 sm:flex-row sm:items-center"
                        >
                          <span className="font-semibold text-primary">{s.title}</span>
                          <span className="italic text-slate-500 sm:text-right">
                            {reasons.join(" · ")}
                          </span>
                        </div>
                      ))}
                    </div>
                    {nonMatches.length > 20 && (
                      <p className="text-[10px] text-slate-500">
                        Showing the first 20 of {nonMatches.length.toLocaleString("en-IN")} schemes
                        that did not match.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {showRecommendations && (
              <p className="text-[10px] leading-relaxed text-slate-500">
                Income is compared only where a scheme stores a numeric cap. Always check the
                written eligibility and the official notification before applying.
              </p>
            )}
          </section>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Bottom CTA                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0a192f] via-[#0f2544] to-[#17395f] p-6 text-white shadow-overlay sm:p-8">
          <div className="relative grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
            <div>
              <p className="sov-eyebrow sov-eyebrow-light">Single-window statutory filing</p>
              <h2 className="mt-2 max-w-2xl font-display text-2xl font-bold sm:text-[2rem]">
                Ready to Claim Your Entitlements with Zero Document Duplication?
              </h2>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/60">
                Your profile parameters generate a preview application summary for this prototype.
                In a live deployment, Aadhaar-based DigiLocker consent would let you submit the same
                verified details to multiple departments.
              </p>
              <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-white/35">
                Demo only · no Aadhaar or identity data is collected by this prototype
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                asChild
                className="h-10 gap-1.5 rounded-md bg-saffron text-xs font-bold text-white hover:bg-saffron-deep"
              >
                <Link to="/auth">
                  Proceed with DigiLocker Auth <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.print()}
                className="h-10 gap-1.5 rounded-md border-white/25 bg-transparent text-xs font-bold text-white hover:bg-white/10 hover:text-white"
              >
                <Download className="h-3.5 w-3.5" /> Export Audit PDF
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
