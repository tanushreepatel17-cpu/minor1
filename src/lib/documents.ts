/**
 * Work out the documents a scheme is likely to require.
 *
 * The `schemes` table has no dedicated documents column, so the checklist is
 * built from two sources:
 *   1. Documents explicitly mentioned in the scheme's written text.
 *   2. Documents implied by the structured eligibility rules (BPL, category,
 *      disability, age, residence, occupation, beneficiary type, monetary
 *      benefit).
 *
 * The official notification and the scheme portal always remain the
 * authoritative source; the UI labels each item with where it came from.
 */

export type DocumentSource = "text" | "criteria";

export type SchemeDocument = {
  label: string;
  source: DocumentSource;
  reason: string;
};

export type DocumentScheme = {
  eligibility?: string | null;
  benefits?: string | null;
  summary?: string | null;
  requires_bpl?: boolean | null;
  requires_disability?: boolean | null;
  social_categories?: string[] | null;
  occupations?: string[] | null;
  beneficiary_types?: string[] | null;
  residence?: string | null;
  min_age?: number | null;
  max_age?: number | null;
  max_annual_income?: number | null;
  level?: string | null;
  state_name?: string | null;
};

const TEXT_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: "Aadhaar card", pattern: /\baadha?ar\b/i },
  { label: "Voter ID card", pattern: /\bvoter\s*(id|card)\b/i },
  { label: "Ration card", pattern: /\bration\s*card\b/i },
  { label: "BPL card / certificate", pattern: /\bbpl\b/i },
  { label: "Income certificate", pattern: /\bincome\s*certificate\b/i },
  {
    label: "Caste / community certificate",
    pattern: /\b(caste|community)\s*certificate\b/i,
  },
  {
    label: "Domicile / residence certificate",
    pattern: /\b(domicile|residence|resident)\s*certificate\b/i,
  },
  { label: "Birth certificate", pattern: /\bbirth\s*certificate\b/i },
  {
    label: "Disability / UDID certificate",
    pattern: /\b(disability|udid)\b[^.\n]{0,30}\b(certificate|card)\b|\budid\b/i,
  },
  {
    label: "Bank passbook / account details",
    pattern: /\b(passbook|bank\s*account|account\s*(number|details)|ifsc)\b/i,
  },
  { label: "PAN card", pattern: /\bpan\s*(card|number)\b/i },
  {
    label: "Passport-size photograph",
    pattern: /\bpassport\s*(size)?\s*(photo|photograph)\b|\bphotograph\b/i,
  },
  {
    label: "Land records (khatauni / 7-12 / patta)",
    pattern: /\b(khatauni|khasra|7\s*[\/-]\s*12|patta|land\s*(record|document|ownership))\b/i,
  },
  {
    label: "Educational certificates / mark sheets",
    pattern: /\b(mark\s*sheet|marksheet|educational\s*certificate|degree\s*certificate|diploma\s*certificate)\b/i,
  },
  { label: "Bonafide / student certificate", pattern: /\bbonafide\b/i },
  {
    label: "Employment / registration card",
    pattern: /\b(employment\s*(card|exchange)|registration\s*(card|number))\b/i,
  },
  { label: "Self-declaration / affidavit", pattern: /\b(self[-\s]?declaration|affidavit)\b/i },
  {
    label: "Udyam / MSME registration",
    pattern: /\b(udyam|msme\s*registration|udyog\s*aadhaar)\b/i,
  },
  { label: "GST registration", pattern: /\bgst\b/i },
  {
    label: "Project report / business plan",
    pattern: /\b(project\s*report|business\s*plan|detailed\s*project)\b/i,
  },
  { label: "Quotation / invoice / estimate", pattern: /\b(quotation|invoice|estimate)\b/i },
  { label: "Loan sanction letter", pattern: /\b(sanction\s*letter|loan\s*sanction)\b/i },
  { label: "Death certificate", pattern: /\bdeath\s*certificate\b/i },
  { label: "Medical certificate", pattern: /\bmedical\s*certificate\b/i },
  { label: "Migration certificate", pattern: /\bmigration\s*certificate\b/i },
  { label: "No-dues certificate", pattern: /\bno[-\s]?dues\b/i },
  { label: "Consent letter", pattern: /\bconsent\s*letter\b/i },
];

const MONEY_RE =
  /₹|\brs\.?\s?\d|\bfinancial\b|\bsubsid|\bloan\b|\bscholarship\b|\bgrant\b|\bassistance\b|\bfund\b|\bamount\b|\bstipend\b|\bdisbur|\bcash\b|\bcompensation\b|\bhonorarium\b/i;

export function extractDocuments(...texts: (string | null | undefined)[]): string[] {
  const haystack = texts
    .filter((value): value is string => Boolean(value))
    .join("\n")
    .replace(/\s+/g, " ");

  if (!haystack) return [];

  return TEXT_PATTERNS.filter(({ pattern }) => pattern.test(haystack)).map(
    ({ label }) => label,
  );
}

function add(
  docs: SchemeDocument[],
  label: string,
  source: DocumentSource,
  reason: string,
) {
  if (docs.some((doc) => doc.label === label)) return;
  docs.push({ label, source, reason });
}

export function documentsForScheme(scheme: DocumentScheme): SchemeDocument[] {
  const docs: SchemeDocument[] = [];

  const categories = (scheme.social_categories ?? []).map((value) => value.toLowerCase());
  const occupations = (scheme.occupations ?? []).map((value) => value.toLowerCase());
  const beneficiaryTypes = (scheme.beneficiary_types ?? []).map((value) =>
    value.toLowerCase(),
  );

  const text = [scheme.eligibility, scheme.benefits, scheme.summary]
    .filter((value): value is string => Boolean(value))
    .join("\n");

  const hasPersonalCriteria =
    Boolean(scheme.requires_bpl) ||
    Boolean(scheme.requires_disability) ||
    categories.length > 0 ||
    scheme.min_age != null ||
    scheme.max_age != null ||
    scheme.max_annual_income != null ||
    (scheme.residence != null && scheme.residence !== "any");

  const isCitizenFacing =
    beneficiaryTypes.some((type) =>
      ["citizens", "students", "reserved_categories", "msmes", "startups"].includes(type),
    ) ||
    hasPersonalCriteria ||
    occupations.length > 0 ||
    MONEY_RE.test(text);

  // --- Documents implied by the structured eligibility rules ---

  if (isCitizenFacing) {
    add(docs, "Aadhaar card", "criteria", "Standard identity proof for the applicant");
  }

  if (scheme.requires_bpl) {
    add(
      docs,
      "BPL card / certificate",
      "criteria",
      "The scheme requires the applicant to hold a BPL card",
    );
  }

  if (scheme.requires_disability) {
    add(
      docs,
      "Disability / UDID certificate",
      "criteria",
      "The scheme is reserved for persons with disabilities",
    );
  }

  if (categories.some((value) => ["sc", "st", "obc"].includes(value))) {
    const labels = categories
      .filter((value) => ["sc", "st", "obc"].includes(value))
      .map((value) => value.toUpperCase())
      .join(" / ");
    add(
      docs,
      "Caste / community certificate",
      "criteria",
      `Restricted to ${labels} applicants`,
    );
  }

  if (categories.includes("minority")) {
    add(
      docs,
      "Minority certificate",
      "criteria",
      "Restricted to applicants from notified minority communities",
    );
  }

  if (scheme.max_annual_income != null) {
    add(
      docs,
      "Income certificate",
      "criteria",
      "The scheme applies a family income limit",
    );
  }

  if (scheme.min_age != null || scheme.max_age != null) {
    add(
      docs,
      "Age proof (birth certificate / Class 10 certificate)",
      "criteria",
      "The scheme has an age requirement",
    );
  }

  if (scheme.residence === "rural" || scheme.residence === "urban") {
    add(
      docs,
      "Domicile / residence certificate",
      "criteria",
      `Restricted to ${scheme.residence} residents`,
    );
  } else if (scheme.level === "state" && scheme.state_name) {
    add(
      docs,
      "Domicile / residence certificate",
      "criteria",
      `State scheme for residents of ${scheme.state_name}`,
    );
  }

  if (occupations.includes("farmer")) {
    add(
      docs,
      "Land records (khatauni / 7-12 / patta)",
      "criteria",
      "The applicant must be a farmer and may need to prove landholding",
    );
  }

  if (occupations.includes("student") || beneficiaryTypes.includes("students")) {
    add(
      docs,
      "Bonafide / student certificate",
      "criteria",
      "The applicant must be a student",
    );
  }

  if (
    occupations.includes("entrepreneur") ||
    beneficiaryTypes.includes("msmes") ||
    beneficiaryTypes.includes("startups")
  ) {
    add(
      docs,
      "Udyam / MSME registration",
      "criteria",
      "The applicant must be a registered enterprise, startup or MSME",
    );
  }

  if (occupations.includes("worker")) {
    add(
      docs,
      "Employment / worker registration card",
      "criteria",
      "The applicant must be a registered worker",
    );
  }

  if (beneficiaryTypes.includes("institutions") || beneficiaryTypes.includes("researchers")) {
    add(
      docs,
      "Institution registration / authorisation letter",
      "criteria",
      "The applicant must be a recognised institution or research body",
    );
  }

  if (MONEY_RE.test(text)) {
    add(
      docs,
      "Bank passbook / account details",
      "criteria",
      "Monetary benefits are paid into the applicant's bank account",
    );
  }

  if (isCitizenFacing) {
    add(
      docs,
      "Passport-size photograph",
      "criteria",
      "Standard attachment for scheme application forms",
    );
  }

  // --- Documents explicitly named in the scheme's written text ---

  for (const { label, pattern } of TEXT_PATTERNS) {
    if (!pattern.test(text)) continue;
    const existing = docs.find((doc) => doc.label === label);
    if (existing) {
      existing.source = "text";
      existing.reason = "Mentioned in the scheme's eligibility text";
      continue;
    }
    docs.push({
      label,
      source: "text",
      reason: "Mentioned in the scheme's eligibility text",
    });
  }

  return docs;
}
