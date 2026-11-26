/** Canonical public research story. All existing tools and secondary resources retain their routes. */
export const PRIMARY_NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/knowledge-graph", label: "Knowledge Graph" },
  { to: "/intelligence", label: "Scientific Intelligence" },
  { to: "/researchers", label: "For Researchers" },
  { to: "/research-community", label: "Community" },
] as const;

/**
 * Audience destinations stay in the footer. Keep their routes available without crowding the header.
 */
export const AUDIENCE_NAV_LINKS = [
  { to: "/researchers", label: "Researchers", note: "Audience page" },
  { to: "/enterprise", label: "Research Groups", note: "Audience page" },
  { to: "/biotech", label: "Biotech teams", note: "Audience page" },
  { to: "/clinical", label: "Clinical Research", note: "Audience page" },
  { to: "/laboratories", label: "Laboratories", note: "Audience page" },
  { to: "/research-community", label: "Research Community", note: "Audience page" },
] as const;

/** Pages that are part of the research app, not the public site. They stay reachable but are not in the public navigation. */
export const RESEARCH_NAV_LINKS = [
  { to: "/evidence-intelligence", label: "Evidence intelligence" },
  { to: "/context-conflict-audit", label: "Context-Conflict Audit" },
] as const;

/** The indexed pages that use the original site header and footer. The homepage, trust, how-it-works, about, contact and the landing platform pages use the landing header and footer instead (see landing-v2/indexed.ts). */
export const PUBLIC_MARKETING_PATHS = [
  "/",
  "/knowledge-graph",
  "/intelligence",
  "/research-gaps",
  "/scientific-companion",
  "/researchers",
  "/enterprise",
  "/biotech",
  "/clinical",
  "/laboratories",
  "/research-community",
  "/validation",
] as const;

/** Indexed pages that use the landing header and footer instead (they are not in PUBLIC_MARKETING_PATHS because the original chrome does not render them). */
export const LANDING_CHROME_PATHS = ["/how-it-works", "/trust", "/about", "/contact"] as const;

/** Account creation is distinct from provisioned research access. */
export const PRIMARY_NAV_CTA = { to: "/sign-up", label: "Create account" } as const;

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
