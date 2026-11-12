import { describe, expect, it } from "vitest";
import type { SchemeRecord } from "./ai/sahayak-engine";
import { selectRelevantSchemes, toPromptScheme, tokenize } from "./scheme-retrieval";

const schemes: SchemeRecord[] = [
  {
    slug: "kerala-farmer-support",
    title: "Kerala Farmer Income Support",
    level: "state",
    state_name: "Kerala",
    sector: "Agriculture",
    beneficiary_types: ["farmers"],
    ministry: "Department of Agriculture",
    summary: "Income support for small and marginal farmers in Kerala.",
    eligibility: "Farmers with less than two hectares of land.",
    benefits: "Direct benefit transfer of ₹6,000 per year.",
  },
  {
    slug: "national-ai-fellowship",
    title: "IndiaAI FutureSkills Fellowship",
    level: "central",
    sector: "Education",
    beneficiary_types: ["students", "researchers"],
    ministry: "Ministry of Electronics and IT",
    summary: "Fellowship for students working on artificial intelligence research.",
    eligibility: "Students enrolled in a recognised university.",
    benefits: "Monthly stipend and GPU compute credits.",
  },
  {
    slug: "msme-adoption-grant",
    title: "MSME AI Adoption Grant",
    level: "central",
    sector: "Manufacturing",
    beneficiary_types: ["msmes"],
    ministry: "Ministry of MSME",
    summary: "Grant for manufacturing MSMEs adopting AI in quality inspection.",
    eligibility: "Registered MSMEs.",
    benefits: "Up to ₹15 lakh reimbursement.",
  },
];

describe("tokenize", () => {
  it("keeps domain short terms and drops filler words", () => {
    expect(tokenize("Show me AI schemes for students in Kerala")).toEqual(
      expect.arrayContaining(["ai", "students", "kerala"]),
    );
    expect(tokenize("Show me AI schemes for students in Kerala")).not.toContain("show");
    expect(tokenize("Show me AI schemes for students in Kerala")).not.toContain("for");
  });
});

describe("selectRelevantSchemes", () => {
  it("ranks the state-specific match first", () => {
    const result = selectRelevantSchemes(schemes, "I am a farmer in Kerala looking for income support");
    expect(result[0]?.slug).toBe("kerala-farmer-support");
  });

  it("finds fellowships for AI students", () => {
    const result = selectRelevantSchemes(schemes, "What AI fellowships can students apply for?");
    expect(result[0]?.slug).toBe("national-ai-fellowship");
  });

  it("returns a small AI-focused default set for greetings", () => {
    const result = selectRelevantSchemes(schemes, "hello", 2);
    expect(result).toHaveLength(2);
    expect(result.some((scheme) => scheme.slug === "national-ai-fellowship")).toBe(true);
  });

  it("never returns more than the requested limit", () => {
    expect(selectRelevantSchemes(schemes, "scheme", 1)).toHaveLength(1);
  });
});

describe("toPromptScheme", () => {
  it("clips long text so the model prompt stays small", () => {
    const long = "x".repeat(2000);
    const prompt = toPromptScheme({ ...schemes[0]!, summary: long, benefits: long });
    expect(prompt.summary?.length).toBeLessThanOrEqual(320);
    expect(prompt.benefits?.length).toBeLessThanOrEqual(360);
  });

  it("omits empty optional fields", () => {
    const prompt = toPromptScheme({ slug: "s", title: "Schemes", summary: "   " });
    expect(prompt.summary).toBeUndefined();
    expect(prompt.official_url).toBeUndefined();
    expect(prompt.demo).toBeUndefined();
  });

  it("keeps a full top-12 prompt well under 40 KB", () => {
    const fat = Array.from({ length: 12 }, (_, index) => ({
      ...schemes[0]!,
      slug: `scheme-${index}`,
      summary: "y".repeat(2000),
      benefits: "z".repeat(2000),
      eligibility: "w".repeat(2000),
    }));
    const payload = JSON.stringify(fat.map(toPromptScheme));
    expect(payload.length).toBeLessThan(40_000);
  });
});
