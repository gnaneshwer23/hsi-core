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

/** Domain → illustrative homepage scenario (not a product disease wall). */
export const DOMAIN_SCENARIO_HINT: Readonly<Record<string, string>> = {
  biology: "ssc_fibrosis",
  immunity: "ssc_fibrosis",
  microbiome: "gut_neuro",
  evidence: "ssc_fibrosis",
  clinical: "metabolic_inflammation",
  omics: "cytokine_cross_tissue",
  trials: "tumour_immune",
  health: "ssc_fibrosis",
};

/** Three cross-domain acceptance entry paths — public navigable, live_backend false. */
export const CROSS_DOMAIN_JOURNEY_ENTRIES = [
  {
    id: "immunology_tcell",
    label: "Immunology · T-cell / inflammation",
    scenarioId: "ssc_fibrosis",
    domain: "immunity",
    exploreTo: "/science/graph",
    evidenceTo: "/evidence-safety",
  },
  {
    id: "gut_brain_immune",
    label: "Gut–brain–immune",
    scenarioId: "gut_neuro",
    domain: "microbiome",
    exploreTo: "/research/knowledge-graph",
    evidenceTo: "/evidence-safety",
  },
  {
    id: "metabolic_immunology",
    label: "Metabolic immunology",
    scenarioId: "metabolic_inflammation",
    domain: "clinical",
    exploreTo: "/science/body",
    evidenceTo: "/evidence-safety",
  },
] as const;

const ACCESS_INTENT_KEY = "hsi-access-intent-v1";

export type AccessIntentDraft = {
  question: string;
  domain?: string;
  scenarioId?: string;
  emailHint?: string;
  savedAt: string;
  persistence: "browser_only";
};

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
  domain?: string;
}): string {
  const params = new URLSearchParams();
  if (opts.scenarioId) params.set(RESEARCH_CONTEXT_KEYS.scenario, opts.scenarioId);
  if (opts.panel) params.set(RESEARCH_CONTEXT_KEYS.panel, opts.panel);
  if (opts.domain) params.set(RESEARCH_CONTEXT_KEYS.domain, opts.domain);
  const q = params.toString();
  return q ? `/?${q}#product-demo` : `/#product-demo`;
}

/** Auth return path — only allow same-origin relative paths (no scheme, no protocol-relative). */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes("://")) return null;
  return value;
}

export function withResearchContext(
  path: string,
  ctx: {
    domain?: string;
    scenario?: string;
    investigation?: string;
    next?: string;
    panel?: DemoPanel;
  },
): string {
  const hashIndex = path.indexOf("#");
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const [base, existing = ""] = withoutHash.split("?");
  const params = new URLSearchParams(existing);
  if (ctx.domain) params.set(RESEARCH_CONTEXT_KEYS.domain, ctx.domain);
  if (ctx.scenario) params.set(RESEARCH_CONTEXT_KEYS.scenario, ctx.scenario);
  if (ctx.panel) params.set(RESEARCH_CONTEXT_KEYS.panel, ctx.panel);
  if (ctx.investigation) params.set(RESEARCH_CONTEXT_KEYS.investigation, ctx.investigation);
  if (ctx.next) {
    const next = safeNextPath(ctx.next);
    if (next) params.set(RESEARCH_CONTEXT_KEYS.next, next);
  }
  const q = params.toString();
  return `${q ? `${base}?${q}` : base}${hash}`;
}

/** Contact / sign-up entry carrying research intent (still no server access-request write). */
export function contactAccessHref(opts: {
  scenarioId?: string;
  domain?: string;
  next?: string;
}): string {
  return withResearchContext("/contact", {
    scenario: opts.scenarioId,
    domain: opts.domain,
    next: opts.next ?? "/research/account",
  });
}

export function signInHref(next?: string): string {
  return withResearchContext("/sign-in", { next: next ?? "/research/account" });
}

export function signUpHref(opts?: { next?: string; domain?: string; scenario?: string }): string {
  return withResearchContext("/sign-up", {
    next: opts?.next ?? "/research/account",
    domain: opts?.domain,
    scenario: opts?.scenario,
  });
}

export function readAccessIntent(): AccessIntentDraft | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ACCESS_INTENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AccessIntentDraft;
    if (!parsed?.question || parsed.persistence !== "browser_only") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeAccessIntent(input: {
  question: string;
  domain?: string;
  scenarioId?: string;
  emailHint?: string;
}): AccessIntentDraft {
  const draft: AccessIntentDraft = {
    question: input.question.trim().slice(0, 1000),
    domain: input.domain?.trim() || undefined,
    scenarioId: input.scenarioId?.trim() || undefined,
    emailHint: input.emailHint?.trim().slice(0, 254) || undefined,
    savedAt: new Date().toISOString(),
    persistence: "browser_only",
  };
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(ACCESS_INTENT_KEY, JSON.stringify(draft));
  }
  return draft;
}

export function clearAccessIntent(): void {
  if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(ACCESS_INTENT_KEY);
}
