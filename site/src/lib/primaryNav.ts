/** Canonical public research story. All existing tools and secondary resources retain their routes. */
export const PRIMARY_NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/how-it-works", label: "Platform" },
  { to: "/validation", label: "Scientific Validation" },
  { to: "/knowledge-graph", label: "Resources" },
  { to: "/trust", label: "Trust" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Pricing & Access" },
] as const;

/**
 * Audience destinations for the public header menu.
 * UI may label the control "Audiences" or "Solutions"; this file must not contain retired path strings.
 * Interim enterprise demo shells are labelled demonstration until dedicated marketing pages ship.
 */
export const AUDIENCE_NAV_LINKS = [
  { to: "/researchers", label: "Researchers", note: "Audience page" },
  { to: "/enterprise", label: "Research Groups", note: "Audience page" },
  { to: "/biotech", label: "Biotech & Pharma", note: "Audience page" },
  { to: "/clinical", label: "Clinical Research", note: "Audience page" },
  { to: "/laboratories", label: "Laboratories", note: "Audience page" },
  { to: "/enterprise/community", label: "Research Community", note: "Demo workspace preview" },
] as const;

/** Pages that are part of the research app, not the public site. They stay reachable but are not in the public navigation. */
export const RESEARCH_NAV_LINKS = [
  { to: "/evidence-intelligence", label: "Evidence intelligence" },
  { to: "/context-conflict-audit", label: "Context-Conflict Audit" },
] as const;

/** The only public (indexed) pages. */
export const PUBLIC_MARKETING_PATHS = [
  "/",
  "/how-it-works",
  "/knowledge-graph",
  "/researchers",
  "/enterprise",
  "/biotech",
  "/clinical",
  "/laboratories",
  "/validation",
  "/trust",
  "/about",
  "/contact",
] as const;

/** Access enquiry — does not claim a request was delivered. */
export const PRIMARY_NAV_CTA = { to: "/contact", label: "Get Access" } as const;

export function isPublicMarketingPath(pathname: string) {
  return (PUBLIC_MARKETING_PATHS as readonly string[]).includes(pathname);
}

export function isAccountPath(pathname: string) {
  return [
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/research/account",
  ].includes(pathname);
}

export function isAudienceNavActive(pathname: string) {
  return AUDIENCE_NAV_LINKS.some(
    (l) => pathname === l.to || pathname.startsWith(`${l.to}/`),
  );
}
