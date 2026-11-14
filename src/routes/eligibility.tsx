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
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  UserCheck,
  Building,
  Tag,
  AlertCircle,
  HelpCircle,
  SlidersHorizontal,
  SearchCheck,
  Save,
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

const sel = "h-9 w-full rounded-lg border bg-card px-3 text-xs focus:ring-1 focus:ring-primary";

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Title */}
      <div className="border-b pb-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
          <UserCheck className="h-3.5 w-3.5" />
          Interactive Eligibility Matcher
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Find Schemes For You
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your own details to get personalised scheme matches. Signed-in visitors see the profile
          saved to their account; guests start with a blank form.
        </p>
        {profileState === "loading" && (
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            Loading your saved profile…
          </p>
        )}
        {profileState === "saved" && loadedUserIdRef.current && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Showing the profile saved to your account — edit any field to refresh your matches.
          </p>
        )}

        {/* Quick Presets */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Try Demo Profile:</span>
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setP(preset.profile)}
              className="rounded-lg border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary hover:bg-primary/5 transition-all shadow-2xs"
            >
              {preset.label}
            </button>
          ))}
          {(filledCount > 0 || showRecommendations) && (
            <button
              onClick={resetProfile}
              className="ml-auto inline-flex items-center gap-1 text-xs text-destructive hover:underline font-medium"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        {/* Profile Controls Sidebar */}
        <form onSubmit={submit} className="h-fit space-y-5 rounded-2xl border bg-card p-5 shadow-card lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Your Profile Parameters
            </h2>
            <span className="text-[11px] font-semibold text-muted-foreground">
              {filledCount} of 8 filled
            </span>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Full Name *</Label>
            <Input
              placeholder="e.g. Ananya Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`h-9 text-xs bg-background ${errors.fullName ? "border-destructive" : ""}`}
            />
            {errors.fullName && <p className="text-[11px] text-destructive">{errors.fullName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <Label className="text-xs">Age *</Label>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 24"
                value={p.age ?? ""}
                onChange={(e) => set("age", num(e.target.value))}
                className={`h-9 text-xs bg-background ${errors.age ? "border-destructive" : ""}`}
              />
              {errors.age && <p className="text-[11px] text-destructive">{errors.age}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Gender *</Label>
              <select
                className={`${sel} ${errors.gender ? "border-destructive" : ""}`}
                value={p.gender}
                onChange={(e) => set("gender", e.target.value as Profile["gender"])}
              >
                <option value="">Any Gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="transgender">Transgender</option>
              </select>
              {errors.gender && <p className="text-[11px] text-destructive">{errors.gender}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Family Annual Income (₹) *</Label>
            <Input
              type="number"
              min={0}
              placeholder="e.g. 300000"
              value={p.annualIncome ?? ""}
              onChange={(e) => set("annualIncome", num(e.target.value))}
              className={`h-9 text-xs bg-background ${errors.annualIncome ? "border-destructive" : ""}`}
            />
            {errors.annualIncome && (
              <p className="text-[11px] text-destructive">{errors.annualIncome}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Social Category *</Label>
            <select
              className={`${sel} ${errors.socialCategory ? "border-destructive" : ""}`}
              value={p.socialCategory}
              onChange={(e) => set("socialCategory", e.target.value as Profile["socialCategory"])}
            >
              <option value="">Any Category</option>
              <option value="general">General</option>
              <option value="sc">SC (Scheduled Caste)</option>
              <option value="st">ST (Scheduled Tribe)</option>
              <option value="obc">OBC (Other Backward Class)</option>
              <option value="minority">Minority</option>
            </select>
            {errors.socialCategory && (
              <p className="text-[11px] text-destructive">{errors.socialCategory}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Occupation / Profession *</Label>
            <select
              className={`${sel} ${errors.occupation ? "border-destructive" : ""}`}
              value={p.occupation}
              onChange={(e) => set("occupation", e.target.value as Profile["occupation"])}
            >
              <option value="">Any Occupation</option>
              <option value="student">Student / Researcher</option>
              <option value="farmer">Farmer / Agri-worker</option>
              <option value="worker">Artisan / Vendor / Worker</option>
              <option value="entrepreneur">Startup / Business Owner</option>
              <option value="unemployed">Unemployed / Job Seeker</option>
              <option value="other">Other</option>
            </select>
            {errors.occupation && <p className="text-[11px] text-destructive">{errors.occupation}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Area of Residence *</Label>
            <select
              className={`${sel} ${errors.residence ? "border-destructive" : ""}`}
              value={p.residence}
              onChange={(e) => set("residence", e.target.value as Profile["residence"])}
            >
              <option value="">Rural & Urban</option>
              <option value="rural">Rural (Village)</option>
              <option value="urban">Urban (City / Town)</option>
            </select>
            {errors.residence && <p className="text-[11px] text-destructive">{errors.residence}</p>}
          </div>

          <div className="pt-2 border-t space-y-3">
            <label className="flex items-center justify-between text-xs font-medium cursor-pointer">
              <span>BPL / Ration card household</span>
              <Switch checked={p.bpl} onCheckedChange={(v) => set("bpl", v)} />
            </label>

            <label className="flex items-center justify-between text-xs font-medium cursor-pointer">
              <span>Person with disability (PwD)</span>
              <Switch checked={p.disability} onCheckedChange={(v) => set("disability", v)} />
            </label>
          </div>

          <div className="space-y-2 pt-1">
            <Button
              type="button"
              onClick={analyze}
              disabled={isLoading}
              className="w-full h-10 text-xs font-semibold gap-1.5"
            >
              <SearchCheck className="h-4 w-4" />
              {isLoading ? "Loading schemes..." : "Analyze My Eligibility"}
            </Button>
            <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
              {isLoading
                ? "Loading all published schemes so the matcher can run."
                : isError
                  ? "Scheme data could not be loaded. Use Retry in the results panel."
                  : `${data.length.toLocaleString("en-IN")} schemes ready. Applies your conditions instantly and saves nothing.`}
            </p>
            {!submitted && (
              <Button
                type="submit"
                variant="outline"
                className="w-full h-9 text-xs font-semibold gap-1.5"
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
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Registration Complete
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Your profile has been saved. We found{" "}
                <span className="font-bold text-foreground">{matches.length}</span> schemes that
                match your profile.
              </p>
              <div className="grid gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="w-full text-xs h-8 gap-1.5"
                  onClick={() =>
                    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                >
                  View Recommended Schemes <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Button asChild size="sm" variant="outline" className="w-full text-xs h-8 gap-1.5">
                  <Link to="/assistant">
                    Continue to Sahayak Assistant <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </form>

        {/* Results Stream */}
        <section ref={resultsRef} id="recommended-schemes" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
            <div>
              <p className="text-lg font-bold text-foreground">
                {showRecommendations ? (
                  <>
                    <span className="font-display text-3xl font-extrabold text-primary mr-2">
                      {matches.length}
                    </span>
                    Recommended Schemes for You
                  </>
                ) : (
                  "Your Scheme Matches"
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {showRecommendations
                  ? `Showing ${visibleMatches.length} of ${matches.length} matching schemes (out of ${data.length} published).`
                  : isLoading
                    ? "Loading all published schemes so the matcher can run."
                    : `Fill in your profile and press “Analyze My Eligibility” to check all ${data.length} published schemes.`}
              </p>
              {showRecommendations && profileChips.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    Your profile:
                  </span>
                  {profileChips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
              {showRecommendations && (
                <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
                  Income is compared only where a scheme stores a numeric cap. Always check the
                  written eligibility on each scheme page.
                </p>
              )}
            </div>

            <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs h-8">
              <Link to="/assistant">
                <Sparkles className="h-3.5 w-3.5 text-saffron" />
                Ask Sahayak to explain
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-dashed bg-card/40 p-10 text-center space-y-2">
              <p className="text-sm font-semibold text-foreground">Loading all published schemes...</p>
              <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground">
                The eligibility matcher will be ready in a moment.
              </p>
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center space-y-3">
              <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
              <h3 className="text-base font-semibold">Could not load scheme data</h3>
              <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground">
                Check the Supabase connection and try again.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : !showRecommendations ? (
            <div className="rounded-2xl border border-dashed bg-card/40 p-10 text-center space-y-3">
              <SearchCheck className="mx-auto h-8 w-8 text-primary" />
              <h3 className="text-base font-semibold">Your matches will appear here</h3>
              <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground">
                Enter age, gender, income, category, occupation, residence, BPL and disability
                status, then run the analysis. Nothing is saved unless you register.
              </p>
              <Button type="button" onClick={analyze} className="gap-1.5 text-xs">
                <SearchCheck className="h-3.5 w-3.5" />
                Analyze My Eligibility
              </Button>
            </div>
          ) : matches.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-12 text-center space-y-3 bg-card/40">
              <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="text-base font-semibold">No schemes matched your conditions</h3>
              <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground">
                Try relaxing your income, category, occupation, or residence selections and
                analyze again.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={resetProfile}>
                Reset profile
              </Button>
            </div>
          ) : (
            <>
              {/* Matches Grid — rendered in batches so the page stays responsive. */}
              <div className="grid gap-4 md:grid-cols-2">
                {visibleMatches.map(({ s }) => (
                  <div
                    key={s.id}
                    className="group flex flex-col justify-between rounded-xl border bg-card p-5 shadow-card hover:shadow-md transition-all duration-150 hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 capitalize">
                          {s.level} Govt · {s.sector}
                        </span>
                        {s.is_demo && (
                          <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-destructive">
                            Demo
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        <Link to="/schemes/$slug" params={{ slug: s.slug }}>
                          {s.title}
                        </Link>
                      </h3>

                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {s.summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {s.beneficiary_types?.slice(0, 2).map((b) => (
                          <span
                            key={b}
                            className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground capitalize"
                          >
                            {b}
                          </span>
                        ))}
                      </div>

                      <Link
                        to="/schemes/$slug"
                        params={{ slug: s.slug }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:text-accent transition-colors"
                      >
                        <span>View Scheme</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {remainingMatches > 0 && (
                <div className="flex flex-col items-center gap-1.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setVisibleCount((count) => count + 24)}
                  >
                    Show 24 more schemes
                  </Button>
                  <p className="text-[11px] text-muted-foreground">
                    {remainingMatches.toLocaleString("en-IN")} more matching schemes
                  </p>
                </div>
              )}

              {/* Non-matches are capped so they do not create thousands of DOM nodes. */}
              {nonMatches.length > 0 && (
                <div className="rounded-xl border bg-card/60 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">
                      Why {nonMatches.length.toLocaleString("en-IN")} schemes did not match
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    These schemes have specific criteria (such as income limits or required
                    categories) that did not align with your current selections:
                  </p>
                  <div className="divide-y max-h-72 overflow-y-auto pr-2 text-xs">
                    {nonMatches.slice(0, 20).map(({ s, reasons }) => (
                      <div
                        key={s.id}
                        className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                      >
                        <span className="font-semibold text-foreground">{s.title}</span>
                        <span className="text-muted-foreground italic sm:text-right">
                          {reasons.join(" · ")}
                        </span>
                      </div>
                    ))}
                  </div>
                  {nonMatches.length > 20 && (
                    <p className="text-[11px] text-muted-foreground">
                      Showing the first 20 of {nonMatches.length.toLocaleString("en-IN")} schemes
                      that did not match.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
