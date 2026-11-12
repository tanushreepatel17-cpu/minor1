import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { FRAMEWORKS } from "./frameworks";
import { generateSahayakResponse, type SchemeRecord } from "./ai/sahayak-engine";
import { selectRelevantSchemes, toPromptScheme, tokenize } from "./scheme-retrieval";

const DIRECTORY_COLUMNS =
  "slug,title,ministry,level,state_name,sector,category,beneficiary_types,summary,eligibility,benefits,official_url,last_verified,is_demo,min_age,max_age,genders,max_annual_income,social_categories,occupations,residence,requires_bpl,requires_disability";

const HISTORY_LIMIT = 8;
const RETRIEVED_SCHEMES = 12;
const SEARCH_TERMS = 5;
const QUERY_TERMS = 3;
const RETRIEVAL_TTL_MS = 10 * 60 * 1000;
const RETRIEVAL_DEADLINE_MS = 3500;
const RETRIEVAL_WARM_DEADLINE_MS = 2000;
const AI_FIRST_TOKEN_TIMEOUT_MS = 5000;
// Hard ceiling for the first visible character: retrieval + model together.
const FIRST_TEXT_BUDGET_MS = 3500;
const AI_COOLDOWN_MS = 5 * 60 * 1000;

function directoryClient() {
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
  if (!key || !url) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

type RetrievalCacheEntry = { at: number; schemes: SchemeRecord[] };

const retrievalCache = new Map<string, RetrievalCacheEntry>();
const DEFAULT_RETRIEVAL_KEY = "__featured__";

// Last successful retrieval, used when Supabase is slower than the deadline.
// It keeps a chat answer bounded instead of letting a slow query stall the
// whole reply.
let lastKnownSchemes: SchemeRecord[] = [];

// Warm a small AI-scheme seed in the background so the first question still has
// grounded examples even if its own query is slow.
let seedStarted = false;
function ensureSeed(): void {
  if (seedStarted) return;
  seedStarted = true;
  void findSchemesForQuestion("AI")
    .then((schemes) => {
      if (schemes.length > 0 && lastKnownSchemes.length === 0) lastKnownSchemes = schemes;
    })
    .catch(() => undefined);
}

/**
 * Looks up only the schemes relevant to the question. The assistant used to
 * download the entire directory (~2 MB, ~25 s when Supabase is slow) before it
 * could answer; a filtered query returns 20–30 rows in about a second.
 * Repeated questions are served from a short-lived in-memory cache.
 */
async function findSchemesForQuestion(question: string): Promise<SchemeRecord[]> {
  const terms = tokenize(question).slice(0, SEARCH_TERMS);
  const key = terms.length > 0 ? [...terms].sort().join("|") : DEFAULT_RETRIEVAL_KEY;

  const cached = retrievalCache.get(key);
  if (cached && Date.now() - cached.at < RETRIEVAL_TTL_MS) return cached.schemes;

  const schemes = await querySchemes(terms);
  if (schemes.length > 0) {
    if (retrievalCache.size > 200) retrievalCache.clear();
    retrievalCache.set(key, { at: Date.now(), schemes });
  }
  return schemes;
}

type RetrievalResult = { schemes: SchemeRecord[]; timely: boolean };

/**
 * Caps how long a chat reply waits for the directory. The query keeps running
 * in the background to fill the cache, and the reply falls back to the last
 * good result (or the local engine with no schemes) rather than stalling.
 * `timely` is false when the deadline expired, in which case the caller skips
 * the model (which would otherwise add its own latency on top).
 */
function loadSchemesForChat(question: string): Promise<RetrievalResult> {
  const deadline =
    lastKnownSchemes.length > 0 ? RETRIEVAL_WARM_DEADLINE_MS : RETRIEVAL_DEADLINE_MS;

  ensureSeed();

  return new Promise<RetrievalResult>((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve({ schemes: lastKnownSchemes, timely: false });
    }, deadline);

    findSchemesForQuestion(question)
      .then((schemes) => {
        if (schemes.length > 0) lastKnownSchemes = schemes;
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({ schemes, timely: true });
      })
      .catch(() => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({ schemes: lastKnownSchemes, timely: false });
      });
  });
}

async function querySchemes(terms: string[]): Promise<SchemeRecord[]> {
  const sb = directoryClient();
  if (!sb) return [];

  // Start with the most specific (longest) term and only add more queries if
  // that one is thin. One round trip is much quicker than three in parallel,
  // and it keeps a common word from crowding out the specific one.
  const chosen = [...terms.slice(0, QUERY_TERMS)].sort((a, b) => b.length - a.length);
  if (chosen.length === 0) {
    return runSchemeQuery(sb, filtersForTerm("ai"), 6);
  }

  const seen = new Set<string>();
  const merged: SchemeRecord[] = [];

  for (const term of chosen) {
    const rows = await runSchemeQuery(sb, filtersForTerm(term), 12);
    for (const scheme of rows) {
      if (seen.has(scheme.slug)) continue;
      seen.add(scheme.slug);
      merged.push(scheme);
    }
    if (merged.length >= 10) break;
  }
  return merged;
}

// "ai", "gpu" and similar short terms match too many unrelated words with
// `ilike` (email, available, …), so they use a word-prefix regex instead.
const SHORT_TERMS = new Set(["ai", "gpu", "sme", "sc", "st", "obc", "ews", "bpl"]);

function filtersForTerm(term: string): string[] {
  if (SHORT_TERMS.has(term)) {
    const filters = [`title.imatch.\\y${term}`, `summary.imatch.\\y${term}`];
    if (term === "ai") {
      filters.push("title.ilike.%IndiaAI%", "summary.ilike.%IndiaAI%");
    }
    return filters;
  }
  return [
    `title.ilike.%${term}%`,
    `summary.ilike.%${term}%`,
    `sector.ilike.%${term}%`,
    `category.ilike.%${term}%`,
    `state_name.ilike.%${term}%`,
    `ministry.ilike.%${term}%`,
  ];
}

async function runSchemeQuery(
  sb: ReturnType<typeof directoryClient>,
  filters: string[],
  limit: number,
): Promise<SchemeRecord[]> {
  if (!sb) return [];
  try {
    const { data, error } = await sb
      .from("schemes")
      .select(DIRECTORY_COLUMNS)
      .eq("status", "published")
      .or(filters.join(","))
      .order("title", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data as SchemeRecord[] | null) ?? [];
  } catch (error) {
    console.warn("Sahayak directory query failed:", error);
    return [];
  }
}

function extractUserText(messages: UIMessage[]): string {
  if (!messages || messages.length === 0) return "";
  const last = messages[messages.length - 1];
  if (!last) return "";
  if (Array.isArray(last.parts)) {
    return last.parts
      .filter((p) => p.type === "text" && typeof (p as { text?: string }).text === "string")
      .map((p) => (p as { text: string }).text)
      .join(" ");
  }
  if (typeof (last as unknown as { content?: string }).content === "string") {
    return (last as unknown as { content: string }).content;
  }
  return "";
}

export async function handleChat(request: Request): Promise<Response> {
  const { messages } = (await request.json()) as { messages: UIMessage[] };
  const recent = Array.isArray(messages) ? messages.slice(-HISTORY_LIMIT) : [];
  const userText = extractUserText(recent);

  const apiKey = process.env["AI_API_KEY"] || process.env["OPENAI_API_KEY"];

  const rawBaseURL =
    process.env["AI_BASE_URL"] || process.env["OPENAI_BASE_URL"] || "https://apinex.bond/v1";

  // Normalize base URL (handles /vi typo -> /v1, and trailing slashes)
  const baseURL = rawBaseURL.replace(/\/+$/, "").replace(/\/vi$/, "/v1");

  const modelName = process.env["AI_MODEL"] || "free/qwen-3.8-max";

  // Everything happens inside the stream so the browser gets response headers
  // (and the typing indicator) immediately, instead of waiting on Supabase.
  const stream = createUIMessageStream({
    async execute({ writer }) {
      const startedAt = Date.now();
      const partId = `part-${Date.now()}`;
      writer.write({ type: "start" });
      writer.write({ type: "start-step" });
      writer.write({ type: "text-start", id: partId });

      let wroteText = false;
      let localText = "";

      const writeLocal = async () => {
        for (const chunk of responseChunks(localText)) {
          if (request.signal.aborted) return;
          writer.write({ type: "text-delta", id: partId, delta: chunk });
          await sleep(2);
        }
      };

      try {
        const { schemes, timely } = await loadSchemesForChat(userText);
        localText = generateSahayakResponse(userText, schemes);

        const remainingBudget = FIRST_TEXT_BUDGET_MS - (Date.now() - startedAt);

        if (
          apiKey &&
          timely &&
          schemes.length > 0 &&
          remainingBudget > 1200 &&
          Date.now() >= aiCooldownUntil
        ) {
          const relevant = selectRelevantSchemes(schemes, userText, RETRIEVED_SCHEMES).map(
            toPromptScheme,
          );
          const instructions = buildInstructions(relevant);

          const controller = new AbortController();
          const timer = setTimeout(
            () => controller.abort(new Error("AI first-token timeout")),
            Math.min(AI_FIRST_TOKEN_TIMEOUT_MS, remainingBudget),
          );

          try {
            const provider = createOpenAI({
              baseURL: baseURL.endsWith("/v1") ? baseURL : `${baseURL}/v1`,
              apiKey,
            });
            const modelMessages = await convertToModelMessages(recent);
            const result = streamText({
              model: provider(modelName),
              system: instructions,
              messages: modelMessages,
              temperature: 0.3,
              maxOutputTokens: 800,
              abortSignal: AbortSignal.any([request.signal, controller.signal]),
            });

            for await (const part of result.fullStream) {
              if (request.signal.aborted) break;
              if (part.type === "error") throw part.error ?? new Error("model stream error");
              if (part.type === "text-delta") {
                const delta = part.text ?? "";
                if (!delta) continue;
                if (!wroteText) {
                  wroteText = true;
                  clearTimeout(timer);
                }
                writer.write({ type: "text-delta", id: partId, delta });
              }
            }
          } catch (error) {
            // Provider down, rate-limited or too slow: answer locally and stop
            // calling it for a minute so the next question is instant.
            aiCooldownUntil = Date.now() + AI_COOLDOWN_MS;
            console.warn("Sahayak model stream failed; using local engine:", error);
          } finally {
            clearTimeout(timer);
          }
        }

        if (!wroteText) await writeLocal();

        writer.write({ type: "text-end", id: partId });
        writer.write({ type: "finish-step" });
        writer.write({ type: "finish" });
      } catch (error) {
        console.error("Sahayak chat failed:", error);
        try {
          if (!wroteText) await writeLocal();
        } catch {
          // The client is gone; nothing left to send.
        }
        writer.write({ type: "text-end", id: partId });
        writer.write({ type: "finish-step" });
        writer.write({ type: "finish" });
      }
    },
  });

  return createUIMessageStreamResponse({ stream });
}

function buildInstructions(relevant: ReturnType<typeof toPromptScheme>[]): string {
  return `You are Sahayak, the NAGSI AI scheme assistant (an academic prototype, NOT an official government service).
Help citizens, students, startups, MSMEs, researchers and institutions discover Indian government schemes (yojanas) — AI initiatives plus welfare, education, agriculture, business, health, pension and more.

The JSON below contains the schemes from the live 3,540-scheme directory that best match this question. Answer from it; if the user needs more, point them to /schemes or /eligibility.

Rules:
- Answer ONLY from the schemes and frameworks below. If unsure, say so and point to the official source.
- Matches are "potential matches", never confirmed eligibility. Applications happen on the official portal.
- Always label demo entries as "DEMO — NOT A REAL GOVERNMENT SCHEME".
- Cite the official URL and last verified date for real schemes. Link scheme pages as /schemes/<slug>.
- Be concise (under 350 words); use short markdown lists and headers. Reply in the user's language (English/Hindi etc).

AI governance sources (cite URLs): ${JSON.stringify(FRAMEWORKS)}

Relevant schemes (JSON): ${JSON.stringify(relevant)}`;
}

function responseChunks(text: string): string[] {
  if (!text) return [];
  const chunks: string[] = [];
  let current = "";
  for (const word of text.split(/(\s+)/)) {
    current += word;
    if (current.length >= 60) {
      chunks.push(current);
      current = "";
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// After a provider error or timeout, skip the model for a minute so users get
// the instant local answer instead of waiting on a dead/rate-limited provider.
let aiCooldownUntil = 0;
