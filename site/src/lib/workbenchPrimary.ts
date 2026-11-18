/**
 * Single primary live investigation path for HSI 1.0 reconnect.
 * Legacy workbench URLs remain as specialised tools — do not rebuild them.
 */
export const LIVE_INVESTIGATION_PATH = "/research/workspace" as const;
export const RESEARCH_HOME_PATH = "/research/home" as const;
/** Auth-owned interrogative packages (requires ?investigation=). */
export const AUTHORISED_INVESTIGATION_PATH = "/research/decision-workbench" as const;
/** Curated demo investigation (not the live run). */
export const CURATED_DEMO_INVESTIGATION_PATH = "/research/investigate" as const;

export function liveInvestigationHref(opts?: { reopen?: boolean }): string {
  return opts?.reopen ? `${LIVE_INVESTIGATION_PATH}?reopen=1` : LIVE_INVESTIGATION_PATH;
}

export function authorisedInvestigationHref(id: string): string {
  return `${AUTHORISED_INVESTIGATION_PATH}?investigation=${encodeURIComponent(id)}`;
}

/** Routes that used to market themselves as the investigation workbench. */
export const LEGACY_WORKBENCH_REDIRECTS = [
  { from: "/research/discovery-experience", to: LIVE_INVESTIGATION_PATH },
] as const;
