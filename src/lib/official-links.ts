/**
 * Official links for a scheme.
 *
 * Only a handful of records store a direct `official_url`, so every scheme
 * also gets a link to the Government of India's official MyScheme finder,
 * pre-filled with the scheme title. That keeps a working official destination
 * on every page without inventing URLs.
 */

export type OfficialLink = {
  label: string;
  url: string;
  description: string;
  kind: "portal" | "search";
};

type LinkableScheme = {
  title: string;
  official_url?: string | null;
  level?: string | null;
  state_name?: string | null;
};

export function officialLinksForScheme(scheme: LinkableScheme): OfficialLink[] {
  const links: OfficialLink[] = [];

  const portal = scheme.official_url?.trim();
  if (portal) {
    links.push({
      label: "Official scheme portal",
      url: portal,
      description: "Apply or read the official notification on the department's own website.",
      kind: "portal",
    });
  }

  const where = scheme.level === "state" && scheme.state_name ? ` in ${scheme.state_name}` : "";
  links.push({
    label: "Search this scheme on MyScheme",
    url: `https://www.myscheme.gov.in/search?q=${encodeURIComponent(scheme.title)}`,
    description: `Official Government of India scheme finder${where} — application forms and notifications.`,
    kind: "search",
  });

  return links;
}
