import { describe, expect, it } from "vitest";
import { extractDocuments } from "./documents";

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
