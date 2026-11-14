/**
 * Official links for a scheme.
 *
 * NAGSI only links to the particular scheme's own official destination
 * (`official_url`) — the department portal, application form or official
 * notification. It never substitutes a third-party aggregator or a generic
 * search page.
 */

export type OfficialLink = {
  label: string;
  url: string;
  description: string;
  kind: "portal";
};

type LinkableScheme = {
  official_url?: string | null;
};

function safeHttpUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function officialLinksForScheme(scheme: LinkableScheme): OfficialLink[] {
  const portal = safeHttpUrl(scheme.official_url);
  if (!portal) return [];

  return [
    {
      label: "Official scheme portal",
      url: portal,
      description: "Apply or read the official notification on the department's own website.",
      kind: "portal",
    },
  ];
}
