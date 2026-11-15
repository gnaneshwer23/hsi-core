/** Canonical public research story. All existing tools and secondary resources retain their routes. */
export const PRIMARY_NAV_LINKS = [
 {to:"/",label:"Home"},{to:"/how-it-works",label:"How it works"},{to:"/knowledge-graph",label:"Knowledge graph"},
 {to:"/trust",label:"Trust"},{to:"/about",label:"About"}
] as const;
/** Pages that are part of the research app, not the public site. They stay reachable but are not in the public navigation. */
export const RESEARCH_NAV_LINKS=[
 {to:"/evidence-intelligence",label:"Evidence intelligence"},
 {to:"/context-conflict-audit",label:"Context-Conflict Audit"}
] as const;
/** The only public (indexed) pages. */
export const PUBLIC_MARKETING_PATHS=[
 "/","/how-it-works","/knowledge-graph","/trust","/about","/contact"
] as const;
/** Destination explains browser-only drafting; this CTA does not claim that a request was delivered. */
export const PRIMARY_NAV_CTA={ to: "/sign-up", label: "Sign up"} as const;
export function isPublicMarketingPath(pathname:string){return (PUBLIC_MARKETING_PATHS as readonly string[]).includes(pathname)}
export function isAccountPath(pathname:string){return ["/sign-in","/sign-up","/forgot-password","/reset-password","/research/account"].includes(pathname)}
