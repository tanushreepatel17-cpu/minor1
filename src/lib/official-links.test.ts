import { describe, expect, it } from "vitest";
import { officialLinksForScheme } from "./official-links";

describe("officialLinksForScheme", () => {
  it("links only to the particular scheme's official portal", () => {
    const links = officialLinksForScheme({
      official_url: " https://pmkisan.gov.in/RegistrationFormnew.aspx ",
    });
    expect(links).toEqual([
      {
        label: "Official scheme portal",
        url: "https://pmkisan.gov.in/RegistrationFormnew.aspx",
        description: "Apply or read the official notification on the department's own website.",
        kind: "portal",
      },
    ]);
  });

  it("returns no link when a scheme has no official portal", () => {
    expect(officialLinksForScheme({})).toEqual([]);
    expect(officialLinksForScheme({ official_url: "   " })).toEqual([]);
  });

  it("rejects unsafe or non-http URLs", () => {
    expect(officialLinksForScheme({ official_url: "javascript:alert(1)" })).toEqual([]);
    expect(officialLinksForScheme({ official_url: "ftp://example.gov.in/scheme" })).toEqual([]);
    expect(officialLinksForScheme({ official_url: "not a url" })).toEqual([]);
  });
});
