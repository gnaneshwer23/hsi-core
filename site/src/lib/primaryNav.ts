/** Public product-experience IA. Governed tools remain contextual workspace links. */
export const PRIMARY_NAV_LINKS = [
 { to: "/platform", label: "Platform"},{ to: "/research", label: "Research"},{ to: "/products", label: "Products"},
 { to: "/science", label: "Science"},{ to: "/how-it-works", label: "How it works"}
] as const;
export const SECONDARY_NAV_LINKS=[
 { to: "/solutions", label: "Solutions"},{ to: "/technology", label: "Technology"},{ to: "/evidence-safety", label: "Evidence & safety"},
 { to: "/pricing", label: "Access options"},{ to: "/contact", label: "Research access"}
] as const;
export const PUBLIC_MARKETING_PATHS=[
 "/","/platform","/technology","/products","/solutions","/research","/evidence-safety","/pricing","/contact",
 "/science","/how-it-works","/for-isi","/for-aksh","/for-trials"
] as const;
export const PRIMARY_NAV_CTA={ to: "/contact", label: "Request access"} as const;
export function isPublicMarketingPath(pathname:string){return (PUBLIC_MARKETING_PATHS as readonly string[]).includes(pathname)}
export function isAccountPath(pathname:string){return ["/sign-in","/sign-up","/forgot-password","/reset-password","/research/account"].includes(pathname)}
