/** Public product-experience IA. Governed tools remain contextual workspace links. */
export const PRIMARY_NAV_LINKS = [
  { to: "/platform", label: "Platform" },
  { to: "/research", label: "Research Intelligence" },
  { to: "/biology", label: "Explore Biology" },
  { to: "/drug-discovery", label: "Drug Discovery" },
  { to: "/solutions", label: "Applications" },
  { to: "/science", label: "Science" },
] as const;

export const SECONDARY_NAV_LINKS = [
  { to: "/about", label: "About" },
  { to: "/contact", label: "Collaborate" },
] as const;

export const PUBLIC_MARKETING_PATHS = [
  "/",
  "/platform",
  "/technology",
  "/solutions",
  "/research",
  "/evidence-safety",
  "/pricing",
  "/contact",
  "/science",
  "/how-it-works",
  "/biology",
  "/drug-discovery",
  "/about",
] as const;

export const PRIMARY_NAV_CTA = { to: "/platform", label: "Explore the Platform" } as const;
export const AUTHENTICATED_NAV_CTA = { to: "/research/dashboard", label: "Open Research Workspace" } as const;

export function isPublicMarketingPath(pathname: string) {
  return (PUBLIC_MARKETING_PATHS as readonly string[]).includes(pathname);
}

export function isAccountPath(pathname: string) {
  return ["/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/research/account"].includes(pathname);
}
