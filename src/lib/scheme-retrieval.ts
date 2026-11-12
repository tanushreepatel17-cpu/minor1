import type { SchemeRecord } from "./ai/sahayak-engine";

/**
 * Retrieval for the Sahayak assistant.
 *
 * Sending the whole 3,540-scheme directory to the language model took ~2 MB
 * (~500k tokens) per request and made the first token take tens of seconds.
 * The assistant only needs the handful of schemes that match the question, so
 * this module scores the directory locally and hands the model a compact
 * top-N list instead.
 */

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "are",
  "but",
  "not",
  "you",
  "your",
  "with",
  "that",
  "this",
  "these",
  "those",
  "from",
  "have",
  "has",
  "had",
  "was",
  "were",
  "what",
  "which",
  "who",
  "whom",
  "how",
  "when",
  "where",
  "why",
  "can",
  "could",
  "should",
  "would",
  "will",
  "shall",
  "may",
  "might",
  "must",
  "about",
  "into",
  "over",
  "under",
  "near",
  "than",
  "then",
  "them",
  "they",
  "their",
  "there",
  "here",
  "also",
  "any",
  "all",
  "some",
  "more",
  "most",
  "other",
  "such",
  "only",
  "just",
  "very",
  "please",
  "tell",
  "show",
  "give",
  "list",
  "find",
  "need",
  "want",
  "help",
  "looking",
  "apply",
  "applying",
  "application",
  "adopt",
  "adopting",
  "looking",
  "wanting",
  "getting",
  "using",
  "working",
  "seeking",
  "interested",
  "related",
  "regarding",
  "based",
  "scheme",
  "schemes",
  "yojana",
  "yojanas",
  "government",
  "govt",
  "india",
  "indian",
  "eligible",
  "eligibility",
  "benefit",
  "benefits",
  "get",
  "best",
  "top",
  "new",
  "available",
  "information",
  "details",
  "detail",
  "know",
  "explain",
  "does",
  "did",
  "doing",
  "been",
  "being",
  "its",
  "it's",
]);

// Two-letter terms that carry meaning in this domain.
const SHORT_TERMS = new Set(["ai", "sc", "st", "obc", "ews", "bpl", "gpu", "sme"]);

const SYNONYMS: Record<string, string[]> = {
  student: ["scholarship", "fellowship", "education", "student"],
  students: ["scholarship", "fellowship", "education", "student"],
  scholarship: ["scholarship", "fellowship", "education"],
  fellowship: ["fellowship", "scholarship", "research"],
  college: ["education", "scholarship", "student"],
  school: ["education", "scholarship", "student"],
  farmer: ["agriculture", "farmer", "crop", "kisan"],
  farming: ["agriculture", "farmer", "crop"],
  agriculture: ["agriculture", "farmer", "crop"],
  woman: ["women", "female", "girl", "mahila"],
  women: ["women", "female", "girl", "mahila"],
  girl: ["women", "female", "girl"],
  startup: ["startup", "entrepreneur", "incubator", "innovation"],
  startups: ["startup", "entrepreneur", "incubator", "innovation"],
  entrepreneur: ["startup", "entrepreneur", "enterprise"],
  msme: ["msme", "sme", "industry", "enterprise", "manufacturing"],
  business: ["business", "enterprise", "industry", "msme"],
  health: ["health", "medical", "hospital", "insurance", "wellness"],
  medical: ["health", "medical", "hospital"],
  pension: ["pension", "retirement", "old age"],
  housing: ["housing", "shelter", "home", "awas"],
  house: ["housing", "shelter", "home", "awas"],
  loan: ["loan", "credit", "finance", "interest"],
  credit: ["loan", "credit", "finance"],
  subsidy: ["subsidy", "grant", "financial assistance", "funding"],
  grant: ["grant", "subsidy", "financial assistance", "funding"],
  funding: ["funding", "grant", "financial assistance"],
  skill: ["skill", "training", "employment", "vocational"],
  training: ["training", "skill", "employment"],
  job: ["employment", "job", "skill", "training"],
  employment: ["employment", "job", "skill", "training"],
  disability: ["disability", "divyang", "disabled"],
  disabled: ["disability", "divyang", "disabled"],
  ai: ["ai", "artificial intelligence", "machine learning", "compute", "gpu"],
  gpu: ["gpu", "compute", "ai"],
  compute: ["compute", "gpu", "ai"],
  research: ["research", "fellowship", "innovation"],
  innovation: ["innovation", "research", "startup"],
  kerala: ["kerala"],
  karnataka: ["karnataka"],
  maharashtra: ["maharashtra"],
  tamil: ["tamil nadu"],
  bengal: ["west bengal"],
  punjab: ["punjab"],
  gujarat: ["gujarat"],
  rajasthan: ["rajasthan"],
  bihar: ["bihar"],
  odisha: ["odisha", "orissa"],
  telangana: ["telangana"],
  andhra: ["andhra pradesh"],
  assam: ["assam"],
  haryana: ["haryana"],
  delhi: ["delhi"],
};

export function tokenize(text: string): string[] {
  const raw = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const tokens = new Set<string>();
  for (const token of raw) {
    if (STOP_WORDS.has(token)) continue;
    if (token.length < 3 && !SHORT_TERMS.has(token)) continue;
    tokens.add(token);
  }
  return [...tokens];
}

function expand(tokens: string[]): string[] {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    for (const synonym of SYNONYMS[token] ?? []) {
      if (!STOP_WORDS.has(synonym)) expanded.add(synonym);
    }
  }
  return [...expanded];
}

function text(value: string | null | undefined): string {
  return (value ?? "").toLowerCase();
}

function scoreScheme(scheme: SchemeRecord, terms: string[]): number {
  const title = text(scheme.title);
  const state = text(scheme.state_name);
  const beneficiaries = text((scheme.beneficiary_types ?? []).join(" "));
  const sector = `${text(scheme.sector)} ${text(scheme.category)}`;
  const ministry = text(scheme.ministry);
  const summary = text(scheme.summary);

  let score = 0;
  for (const term of terms) {
    if (state && state.includes(term)) score += 12;
    if (title.includes(term)) score += 8;
    if (beneficiaries.includes(term)) score += 5;
    if (sector.includes(term)) score += 4;
    if (ministry.includes(term)) score += 3;
    if (summary.includes(term)) score += 2;
  }
  return score;
}

/**
 * Picks the schemes worth putting in the prompt. Falls back to a small,
 * representative AI/cross-sector set for greetings and policy questions that do
 * not mention any scheme keyword.
 */
export function selectRelevantSchemes(
  schemes: SchemeRecord[],
  question: string,
  limit = 12,
): SchemeRecord[] {
  const terms = expand(tokenize(question));

  if (terms.length === 0) return defaultSchemes(schemes, Math.min(limit, 6));

  const scored = schemes
    .map((scheme) => ({ scheme, score: scoreScheme(scheme, terms) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.scheme.title.localeCompare(b.scheme.title))
    .slice(0, limit)
    .map((entry) => entry.scheme);

  if (scored.length >= Math.min(limit, 4)) return scored;

  // Top up thinly-matched questions so the model still has grounded examples.
  const seen = new Set(scored.map((scheme) => scheme.slug));
  for (const scheme of defaultSchemes(schemes, limit)) {
    if (seen.has(scheme.slug)) continue;
    scored.push(scheme);
    if (scored.length >= limit) break;
  }
  return scored;
}

function defaultSchemes(schemes: SchemeRecord[], limit: number): SchemeRecord[] {
  const aiLike = schemes.filter((scheme) => {
    const haystack = `${text(scheme.title)} ${text(scheme.summary)} ${text(scheme.sector)}`;
    return /(\bai\b|artificial intelligence|machine learning|compute|gpu)/.test(haystack);
  });
  const pool = aiLike.length >= limit ? aiLike : schemes;
  return pool.slice(0, limit);
}

function clip(value: string | null | undefined, max: number): string | undefined {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return undefined;
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export type PromptScheme = {
  slug: string;
  title: string;
  level?: string | undefined;
  state?: string | undefined;
  ministry?: string | undefined;
  sector?: string | undefined;
  category?: string | undefined;
  beneficiaries?: string[] | undefined;
  summary?: string | undefined;
  benefits?: string | undefined;
  eligibility?: string | undefined;
  official_url?: string | undefined;
  last_verified?: string | undefined;
  demo?: boolean | undefined;
};

/** Small, model-friendly projection of a scheme record. */
export function toPromptScheme(scheme: SchemeRecord): PromptScheme {
  return {
    slug: scheme.slug,
    title: scheme.title,
    level: scheme.level,
    state: scheme.state_name ?? undefined,
    ministry: scheme.ministry,
    sector: scheme.sector,
    category: scheme.category,
    beneficiaries: scheme.beneficiary_types?.length ? scheme.beneficiary_types.slice(0, 6) : undefined,
    summary: clip(scheme.summary, 320),
    benefits: clip(scheme.benefits, 360),
    eligibility: clip(scheme.eligibility, 300),
    official_url: scheme.official_url ?? undefined,
    last_verified: scheme.last_verified ?? undefined,
    demo: scheme.is_demo || undefined,
  };
}
