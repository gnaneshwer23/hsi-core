/**
 * Single source of truth for founder public IA.
 * Research / ISI entry via Products + contextual CTAs (not header clutter).
 * Status / Roadmap / Docs stay footer-only. Technology is a thin operating-model
 * overview; Platform holds architecture depth. Internal tools are not public navigation.
 */
export const PRIMARY_NAV_LINKS = [
  { to: "/platform", label: "Platform" },
  { to: "/technology", label: "Technology" },
  { to: "/products", label: "Products" },
  { to: "/science", label: "Science" },
  { to: "/how-it-works", label: "How It Works" },
] as const;

/**
 * Routes that use the cream editorial masthead (`.public-site-v2`).
 * Primary IA pages + product landings / research entry users reach from
 * Products / Platform / Science / How It Works CTAs. Status, Roadmap, Docs,
 * demos and engineering surfaces stay on glass (see DESIGN_NOTES).
 */
export const PUBLIC_MARKETING_PATHS = [
  "/",
  "/platform",
  "/technology",
  "/products",
  "/science",
  "/how-it-works",
  "/for-isi",
  "/for-aksh",
  "/for-trials",
  "/discovery",
] as const;

export const PRIMARY_NAV_CTA = {
  to: "/products",
  label: "Explore products",
} as const;

export function isPublicMarketingPath(pathname: string): boolean {
  return (PUBLIC_MARKETING_PATHS as readonly string[]).includes(pathname);
}

/** Account entry shares the editorial shell without becoming a marketing destination. */
export function isAccountPath(pathname: string): boolean {
  return ["/sign-in", "/sign-up", "/research/account"].includes(pathname);
}
