/** Public CTA policy derived from docs/capability-status.json — never invent availability. */
export type PublicCta={label:string;to:string};
export const PUBLIC_PRIMARY_CTA:PublicCta={label:"Research access",to:"/contact"};
export const PUBLIC_SECONDARY_CTA:PublicCta={label:"See How It Works",to:"/how-it-works"};
/** Retired `/platform` marketing page redirects here — do not revive the slug in CTAs. */
export const PUBLIC_PLATFORM_CTA:PublicCta={label:"See how HSI works",to:"/how-it-works"};
/** Retired `/science` marketing page redirects to the public knowledge-graph entry. */
export const PUBLIC_SCIENCE_CTA:PublicCta={label:"Open knowledge graph",to:"/knowledge-graph"};
export const PUBLIC_GRAPH_CTA:PublicCta={label:"Open claim-linked graph",to:"/research/knowledge-graph"};
