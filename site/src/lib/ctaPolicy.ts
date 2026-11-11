/** Public CTA policy derived from docs/capability-status.json — never invent availability. */
export type PublicCta={label:string;to:string};
export const PUBLIC_PRIMARY_CTA:PublicCta={label:"Research access",to:"/contact"};
export const PUBLIC_SECONDARY_CTA:PublicCta={label:"See How It Works",to:"/how-it-works"};
export const PUBLIC_PLATFORM_CTA:PublicCta={label:"Explore the platform",to:"/platform"};
export const PUBLIC_GRAPH_CTA:PublicCta={label:"Open knowledge graph",to:"/research/knowledge-graph"};
