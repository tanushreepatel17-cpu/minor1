import { describe, expect, it } from "vitest";
import { officialLinksForScheme } from "./official-links";

describe("officialLinksForScheme", () => {
  it("always includes the official MyScheme search link", () => {
    const links = officialLinksForScheme({
      title: "Kerala Stressed MSMEs Revival & Rehabilitation Scheme",
    });
    expect(links).toHaveLength(1);
    expect(links[0]?.kind).toBe("search");
    expect(links[0]?.url).toBe(
      "https://www.myscheme.gov.in/search?q=Kerala%20Stressed%20MSMEs%20Revival%20%26%20Rehabilitation%20Scheme",
    );
  });

  it("puts the stored department portal first", () => {
    const links = officialLinksForScheme({
      title: "AIKosh Datasets Platform",
      official_url: " https://aikosh.indiaai.gov.in/ ",
    });
    expect(links).toHaveLength(2);
    expect(links[0]).toMatchObject({
      kind: "portal",
      url: "https://aikosh.indiaai.gov.in/",
    });
    expect(links[1]?.kind).toBe("search");
  });

  it("mentions the state for state schemes", () => {
    const links = officialLinksForScheme({
      title: "Some State Scheme",
      level: "state",
      state_name: "Kerala",
    });
    expect(links[0]?.description).toContain("Kerala");
  });

  it("ignores a blank official_url", () => {
    const links = officialLinksForScheme({ title: "Scheme", official_url: "   " });
    expect(links.map((link) => link.kind)).toEqual(["search"]);
  });
});
