/** Canonical public research story. All existing tools and secondary resources retain their routes. */
export const PRIMARY_NAV_LINKS = [
 {to:"/how-it-works",label:"How it works"},
 {to:"/research",label:"Research"},{to:"/evidence-intelligence",label:"Evidence intelligence"}
] as const;
export const RESEARCH_NAV_LINKS=[
 {to:"/context-conflict-audit",label:"Context-Conflict Audit"},
 {to:"/evidence-intelligence",label:"Evidence Intelligence"},
 {to:"/research",label:"Research Workflow"},
 {to:"/research-briefs",label:"Research Briefs"}
] as const;
export const SECONDARY_NAV_LINKS=[
 { to: "/solutions", label: "Solutions"},{ to: "/technology", label: "Technology"},{ to: "/evidence-safety", label: "Evidence & safety"},
 { to: "/pricing", label: "Access options"},{ to: "/demo", label: "Illustrative walkthrough"},{ to: "/contact", label: "Research access"},
{ to: "/intelligence", label: "Intelligence Collective"},{ to: "/how-it-works", label: "How it works"}
] as const;
export const PUBLIC_MARKETING_PATHS=[
 "/","/platform","/technology","/solutions","/research","/evidence-safety","/pricing","/contact",
 "/science","/intelligence","/how-it-works",
 "/context-conflict-audit","/evidence-intelligence","/research-briefs","/applications","/trust","/about"
] as const;
/** Destination explains browser-only drafting; this CTA does not claim that a request was delivered. */
export const PRIMARY_NAV_CTA={ to: "/sign-up", label: "Sign up"} as const;
export function isPublicMarketingPath(pathname:string){return pathname.startsWith("/intelligence/") || (PUBLIC_MARKETING_PATHS as readonly string[]).includes(pathname)}
export function isAccountPath(pathname:string){return ["/sign-in","/sign-up","/forgot-password","/reset-password","/research/account"].includes(pathname)}
