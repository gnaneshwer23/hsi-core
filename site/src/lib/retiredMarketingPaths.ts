/**
 * Retired public marketing paths kept as permanent redirects.
 * Live CTAs must use the destination, not the retired slug.
 */
export const RETIRED_MARKETING_REDIRECTS = {
  "/platform": "/how-it-works",
  "/science": "/knowledge-graph",
  "/science/body": "/knowledge-graph",
  "/technology": "/how-it-works",
  "/solutions": "/how-it-works",
  "/applications": "/how-it-works",
  "/research": "/how-it-works",
  "/connected-intelligence": "/how-it-works",
  "/intelligence": "/how-it-works",
  "/departments": "/knowledge-graph",
  "/evidence-safety": "/trust",
  "/pricing": "/contact",
  "/validation": "/trust#validation",
  "/demo": "/research/journey",
  "/community": "/research/home",
} as const;

export type RetiredMarketingPath = keyof typeof RETIRED_MARKETING_REDIRECTS;

/** Map a public path through the retired-marketing table; leave live paths unchanged. */
export function resolvePublicPath(path: string): string {
  const bare = path.split("?")[0] ?? path;
  if (bare in RETIRED_MARKETING_REDIRECTS) {
    return RETIRED_MARKETING_REDIRECTS[bare as RetiredMarketingPath];
  }
  return path;
}

export function isRetiredMarketingPath(path: string): boolean {
  const bare = path.split("?")[0] ?? path;
  return bare in RETIRED_MARKETING_REDIRECTS;
}
