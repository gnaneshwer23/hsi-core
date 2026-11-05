/** Public product-experience IA. Governed tools remain contextual workspace links. */
export const PRIMARY_NAV_LINKS = [
 { to: "/platform", label: "Platform"},{ to: "/solutions", label: "Solutions"},{ to: "/research", label: "Research"},
 { to: "/evidence-safety", label: "Evidence & safety"},{ to: "/community", label: "Community"}
] as const;
export const SECONDARY_NAV_LINKS=[
 { to: "/products", label: "Products"},{ to: "/technology", label: "Technology"},{ to: "/science", label: "Science"},
 { to: "/how-it-works", label: "How It Works"},{ to: "/pricing", label: "Access & pilots"},{ to: "/contact", label: "Contact"}
] as const;
export const PUBLIC_MARKETING_PATHS=[
 "/","/platform","/technology","/products","/solutions","/research","/evidence-safety","/community","/pricing","/contact",
 "/science","/how-it-works","/for-isi","/for-aksh","/for-trials","/discovery"
] as const;
export const PRIMARY_NAV_CTA={ to: "/contact", label: "Request access"} as const;
export function isPublicMarketingPath(pathname:string){return (PUBLIC_MARKETING_PATHS as readonly string[]).includes(pathname)}
export function isAccountPath(pathname:string){return ["/sign-in","/sign-up","/research/account"].includes(pathname)}
