/**
 * Shared public→research context contracts.
 * Preserve domain / scenario / panel / investigation identity across navigation
 * without hardcoding disease product boundaries.
 */

export type DemoPanel = "mechanism" | "graph" | "brief";

export const RESEARCH_CONTEXT_KEYS = {
  scenario: "scenario",
  panel: "panel",
  domain: "domain",
  investigation: "investigation",
  next: "next",
} as const;

const DEMO_PANELS = new Set<DemoPanel>(["mechanism", "graph", "brief"]);

export function parseDemoPanel(value: string | null | undefined): DemoPanel | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return DEMO_PANELS.has(normalized as DemoPanel) ? (normalized as DemoPanel) : null;
}

/** Read panel from `?panel=` or hash `#brief` / `#demo-panel-brief` / `#product-demo-brief`. */
export function resolveDemoPanel(search: string, hash: string): DemoPanel | null {
  const fromQuery = parseDemoPanel(new URLSearchParams(search).get(RESEARCH_CONTEXT_KEYS.panel));
  if (fromQuery) return fromQuery;
  const h = hash.replace(/^#/, "").toLowerCase();
  if (h === "brief" || h === "demo-panel-brief" || h === "product-demo-brief") return "brief";
  if (h === "graph" || h === "demo-panel-graph") return "graph";
  if (h === "mechanism" || h === "demo-panel-mechanism") return "mechanism";
  return null;
}

export function parseScenarioId(
  value: string | null | undefined,
  knownIds: readonly string[],
): string | null {
  if (!value) return null;
  return knownIds.includes(value) ? value : null;
}

/** Homepage deep link that opens the illustrative demo on a chosen panel. */
export function homeDemoHref(opts: {
  scenarioId?: string;
  panel?: DemoPanel;
}): string {
  const params = new URLSearchParams();
  if (opts.scenarioId) params.set(RESEARCH_CONTEXT_KEYS.scenario, opts.scenarioId);
  if (opts.panel) params.set(RESEARCH_CONTEXT_KEYS.panel, opts.panel);
  const q = params.toString();
  const hash = opts.panel === "brief" ? "#product-demo" : "#product-demo";
  return q ? `/?${q}${hash}` : `/#product-demo`;
}

/** Auth return path — only allow same-origin relative research/account paths. */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes("://")) return null;
  return value;
}

export function withResearchContext(
  path: string,
  ctx: { domain?: string; investigation?: string; next?: string },
): string {
  const [base, existing = ""] = path.split("?");
  const params = new URLSearchParams(existing);
  if (ctx.domain) params.set(RESEARCH_CONTEXT_KEYS.domain, ctx.domain);
  if (ctx.investigation) params.set(RESEARCH_CONTEXT_KEYS.investigation, ctx.investigation);
  if (ctx.next) {
    const next = safeNextPath(ctx.next);
    if (next) params.set(RESEARCH_CONTEXT_KEYS.next, next);
  }
  const q = params.toString();
  return q ? `${base}?${q}` : base;
}
