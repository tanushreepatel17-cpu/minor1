/**
 * Extract likely required documents from a scheme's written text.
 *
 * The `schemes` table has no dedicated documents column, so this is a
 * best-effort checklist based on explicit mentions in the scheme record.
 * The written eligibility details and the official portal remain authoritative.
 */
const DOCUMENT_PATTERNS: { label: string; pattern: RegExp }[] = [
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

export function extractDocuments(...texts: (string | null | undefined)[]): string[] {
  const haystack = texts
    .filter((value): value is string => Boolean(value))
    .join("\n")
    .replace(/\s+/g, " ");

  if (!haystack) return [];

  return DOCUMENT_PATTERNS.filter(({ pattern }) => pattern.test(haystack)).map(
    ({ label }) => label,
  );
}
