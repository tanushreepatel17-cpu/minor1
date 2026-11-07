// Rule-based "potential match" check — never confirmed eligibility.
export type Profile = {
  age: number | null;
  gender: "male" | "female" | "transgender" | "";
  annualIncome: number | null;
  socialCategory: "general" | "sc" | "st" | "obc" | "minority" | "";
  occupation: "student" | "farmer" | "worker" | "entrepreneur" | "unemployed" | "other" | "";
  residence: "rural" | "urban" | "";
  bpl: boolean;
  disability: boolean;
};

export type SchemeRules = {
  min_age: number | null;
  max_age: number | null;
  genders: string[];
  max_annual_income: number | null;
  social_categories: string[];
  occupations: string[];
  residence: string;
  requires_bpl: boolean;
  requires_disability: boolean;
};

export function matchScheme(s: SchemeRules, p: Profile): { match: boolean; reasons: string[] } {
  const fails: string[] = [];
  // Defensive normalisation: the database currently stores empty arrays, but a
  // missing array or residence value should mean "no restriction", not a crash.
  const genders = (s.genders ?? []).map((g) => g.toLowerCase());
  const categories = (s.social_categories ?? []).map((c) => c.toLowerCase());
  const occupations = (s.occupations ?? []).map((o) => o.toLowerCase());
  const residence = (s.residence ?? "any").toLowerCase();

  if (p.age != null) {
    if (s.min_age != null && p.age < s.min_age) fails.push(`Minimum age ${s.min_age}`);
    if (s.max_age != null && p.age > s.max_age) fails.push(`Maximum age ${s.max_age}`);
  }
  if (genders.length && p.gender && !genders.includes(p.gender)) fails.push(`Only for ${genders.join("/")}`);
  if (s.max_annual_income != null && p.annualIncome != null && p.annualIncome > s.max_annual_income)
    fails.push(`Income up to ₹${s.max_annual_income.toLocaleString("en-IN")}`);
  if (categories.length && p.socialCategory && !categories.includes(p.socialCategory))
    fails.push(`Only for ${categories.map((c) => c.toUpperCase()).join("/")}`);
  if (occupations.length && p.occupation && !occupations.includes(p.occupation))
    fails.push(`For ${occupations.join("/")}`);
  if (residence !== "any" && p.residence && residence !== p.residence)
    fails.push(`${residence} areas only`);
  if (s.requires_bpl && !p.bpl) fails.push("BPL / poor household required");
  if (s.requires_disability && !p.disability) fails.push("For persons with disability");
  return { match: fails.length === 0, reasons: fails };
}
