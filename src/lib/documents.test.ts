import { describe, expect, it } from "vitest";
import { documentsForScheme, extractDocuments } from "./documents";

describe("extractDocuments", () => {
  it("finds documents mentioned in eligibility text", () => {
    const docs = extractDocuments(
      "The applicant must submit an Aadhaar card, a ration card and a caste certificate.",
    );
    expect(docs).toEqual(["Aadhaar card", "Ration card", "Caste / community certificate"]);
  });

  it("deduplicates repeated mentions", () => {
    expect(extractDocuments("Aadhaar is required. Aadhaar must be valid.")).toEqual([
      "Aadhaar card",
    ]);
  });

  it("returns an empty list when no documents are mentioned", () => {
    expect(extractDocuments("The applicant should be a resident of Assam.")).toEqual([]);
  });

  it("handles missing text", () => {
    expect(extractDocuments(null, undefined, "")).toEqual([]);
  });
});

describe("documentsForScheme", () => {
  it("derives documents from structured eligibility rules", () => {
    const docs = documentsForScheme({
      summary: "Financial assistance for students.",
      benefits: "A scholarship of ₹25,000 per year is paid to the bank account.",
      eligibility: "Open to students from low income families.",
      social_categories: ["sc", "obc"],
      occupations: ["student"],
      beneficiary_types: ["citizens", "students"],
      requires_bpl: true,
      requires_disability: true,
      residence: "rural",
      min_age: 18,
      max_age: 30,
    });

    const labels = docs.map((doc) => doc.label);
    expect(labels).toContain("Aadhaar card");
    expect(labels).toContain("BPL card / certificate");
    expect(labels).toContain("Disability / UDID certificate");
    expect(labels).toContain("Caste / community certificate");
    expect(labels).toContain("Age proof (birth certificate / Class 10 certificate)");
    expect(labels).toContain("Domicile / residence certificate");
    expect(labels).toContain("Bonafide / student certificate");
    expect(labels).toContain("Bank passbook / account details");
    expect(labels).toContain("Passport-size photograph");
  });

  it("marks documents found in the scheme text", () => {
    const docs = documentsForScheme({
      eligibility: "Submit a caste certificate and a ration card.",
      benefits: "Monthly pension.",
      beneficiary_types: ["citizens"],
      social_categories: ["sc"],
    });

    const caste = docs.find((doc) => doc.label === "Caste / community certificate");
    const ration = docs.find((doc) => doc.label === "Ration card");
    expect(ration?.source).toBe("text");
    expect(caste?.source).toBe("text");
    expect(docs.every((doc) => doc.reason.length > 0)).toBe(true);
  });

  it("does not duplicate a document derived and also mentioned", () => {
    const docs = documentsForScheme({
      eligibility: "Aadhaar card is mandatory.",
      benefits: "Scholarship paid by bank transfer.",
      beneficiary_types: ["students"],
    });
    expect(docs.filter((doc) => doc.label === "Aadhaar card")).toHaveLength(1);
  });

  it("returns an empty list for a scheme with no citizen requirements", () => {
    expect(
      documentsForScheme({
        summary: "An internal dataset platform.",
        benefits: "Access to open datasets.",
        eligibility: "For registered research teams.",
      }),
    ).toEqual([]);
  });
});
