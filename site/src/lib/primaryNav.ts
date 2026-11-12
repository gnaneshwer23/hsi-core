/** Canonical public research story. All existing tools and secondary resources retain their routes. */
export const PRIMARY_NAV_LINKS = [
 { to: "/platform", label: "Platform"}, { to: "/research", label: "Research"},
 { to: "/science", label: "Science"}, { to: "/applications", label: "Applications"},
 { to: "/trust", label: "Trust"}, { to: "/about", label: "About"}
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
 { to: "/modules", label: "Modules"},{ to: "/how-it-works", label: "How it works"}
] as const;
export const PUBLIC_MARKETING_PATHS=[
 "/","/platform","/technology","/modules","/solutions","/research","/evidence-safety","/pricing","/contact",
 "/science","/how-it-works","/modules/aksh-health","/modules/clinical","/modules/isi","/modules/trials",
 "/context-conflict-audit","/evidence-intelligence","/research-briefs","/applications","/trust","/about"
] as const;
/** Destination explains browser-only drafting; this CTA does not claim that a request was delivered. */
export const PRIMARY_NAV_CTA={ to: "/contact", label: "Request access"} as const;
export function isPublicMarketingPath(pathname:string){return (PUBLIC_MARKETING_PATHS as readonly string[]).includes(pathname)}
export function isAccountPath(pathname:string){return ["/sign-in","/sign-up","/forgot-password","/reset-password","/research/account"].includes(pathname)}
