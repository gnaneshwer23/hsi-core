/**
 * WB-07 / UX-05 soft-land — typed site route catalog.
 * Classifies App routes and retired marketing redirects without claiming
 * route-count halving or D-60 owner decisions.
 */

export const SITE_ROUTE_CATALOG_SCHEMA = "hsi-site-route-catalog-1" as const;

export type SiteRouteBucket =
  | "public_marketing"
  | "investigation_loop"
  | "reviewer_tool"
  | "labs_synthetic"
  | "auth_account"
  | "engineering_chrome"
  | "client_redirect"
  | "legacy_debt"
  | "catch_all";

/** Host + client retired marketing pairs already used by legacy-redirects e2e. */
export const RETIRED_MARKETING_REDIRECTS = [
  ["/technology", "/how-it-works"],
  ["/solutions", "/how-it-works"],
  ["/platform", "/how-it-works"],
  ["/applications", "/how-it-works"],
  ["/research", "/how-it-works"],
  ["/connected-intelligence", "/how-it-works"],
  ["/intelligence", "/how-it-works"],
  ["/intelligence/nexus", "/how-it-works"],
  ["/science", "/knowledge-graph"],
  ["/science/body", "/knowledge-graph"],
  ["/departments", "/knowledge-graph"],
  ["/community", "/research/home"],
  ["/demo", "/research/journey"],
  ["/pricing", "/contact"],
  ["/evidence-safety", "/trust"],
] as const;

/** Client Navigate hops that should land on an existing public destination in one step. */
export const ONE_HOP_MARKETING_REDIRECTS = [
  ["/modules", "/how-it-works"],
  ["/modules/aksh-health", "/how-it-works"],
  ["/modules/clinical", "/how-it-works"],
  ["/modules/isi", "/how-it-works"],
  ["/modules/trials", "/how-it-works"],
  ["/products", "/how-it-works"],
  ["/akeno", "/how-it-works"],
  ["/aksh-agents", "/how-it-works"],
  ["/for-isi", "/how-it-works"],
  ["/for-aksh", "/how-it-works"],
  ["/for-trials", "/how-it-works"],
  ["/research-briefs", "/how-it-works"],
] as const;

const PUBLIC_MARKETING = new Set([
  "/",
  "/how-it-works",
  "/knowledge-graph",
  "/researchers",
  "/enterprise",
  "/biotech",
  "/clinical",
  "/laboratories",
  "/research-community",
  "/validation",
  "/trust",
  "/about",
  "/contact",
]);

const INVESTIGATION_LOOP = new Set([
  "/welcome",
  "/research/home",
  "/research/investigate",
  "/research/workspace",
  "/research/knowledge-graph",
  "/research/gaps",
  "/research/ledger",
  "/research/methods",
  "/research/journey",
  "/research/evaluation",
  "/research/mechanism-workflow",
  "/research/decision-workbench",
  "/research/scientific-workbench",
  "/research/discovery-experience",
  "/research/coverage",
  "/research/evidence-readiness",
  "/research/dashboard",
  "/research/governance",
  "/evidence-intelligence",
  "/academic",
  "/enterprise",
  "/enterprise/professor",
  "/enterprise/student",
  "/enterprise/biotech",
  "/enterprise/clinical",
  "/enterprise/lab",
  "/enterprise/community",
  "/enterprise/participant",
  "/enterprise/funding",
  "/enterprise/pilot",
  "/workspaces",
  "/workspaces/researcher",
  "/workspaces/professor",
  "/workspaces/student",
  "/workspaces/biotech",
  "/workspaces/clinical",
  "/workspaces/laboratory",
  "/workspaces/community",
  "/workspaces/enterprise",
]);

/** Reviewer / curator tools — never auto-redirect in this soft-land. */
export const REVIEWER_TOOL_PATHS = [
  "/research/ontology-review",
  "/research/scientific-review",
  "/research/validation",
  "/context-conflict-audit",
  "/curator",
] as const;

const REVIEWER_TOOL = new Set<string>(REVIEWER_TOOL_PATHS);

const LABS_SYNTHETIC = new Set([
  "/clinical-timeline",
  "/trials-criteria",
  "/gateway",
  "/research/cohort",
  "/research/targets",
  "/research/prescreen",
  "/research/capabilities",
  "/research/community-feed",
]);

const AUTH_ACCOUNT = new Set([
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/research/account",
]);

const ENGINEERING_CHROME = new Set([
  "/status",
  "/sources",
  "/systems",
  "/roadmap",
  "/alignment",
  "/docs",
  "/evidence",
]);

/** Still mounted demos with no redirect — owner D-60 only; do not invent destinations. */
export const LEGACY_DEBT_PATHS = [
  "/explore",
  "/discovery",
  "/discovery-engine",
  "/science/graph",
  "/science/paths",
  "/science/contradictions",
  "/science/literature",
  "/science/study-comparison",
  "/science/review-preparation",
  "/science/clinical-trials",
  "/science/research-agents",
  "/science/zoom",
  "/science/connections",
  "/science/disease",
] as const;

const LEGACY_DEBT = new Set<string>(LEGACY_DEBT_PATHS);

export type SiteRouteEntry = {
  path: string;
  bucket: SiteRouteBucket;
  isRedirect: boolean;
  destination: string | null;
  proposedAction: "keep" | "already_redirect" | "owner_D60" | "catch_all";
};

export type SiteRouteCatalog = {
  schemaVersion: typeof SITE_ROUTE_CATALOG_SCHEMA;
  purpose: "wb07_route_legacy_soft_land";
  packRef: "WB-07";
  routeCountHalved: false;
  wb07Accepted: false;
  d60Decided: false;
  scientificApproval: false;
  inventedDestinations: false;
  reviewerToolsProtected: true;
  entries: readonly SiteRouteEntry[];
};

function norm(path: string): string {
  if (!path.startsWith("/")) path = "/" + path;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path;
}

export function classifySiteRoute(
  path: string,
  opts: {isRedirect: boolean; destination?: string | null} = {isRedirect: false},
): SiteRouteEntry {
  const p = norm(path);
  const destination = opts.destination ? norm(opts.destination) : null;
  if (p === "*") {
    return {path: p, bucket: "catch_all", isRedirect: false, destination: null, proposedAction: "catch_all"};
  }
  if (opts.isRedirect || destination) {
    return {
      path: p,
      bucket: "client_redirect",
      isRedirect: true,
      destination,
      proposedAction: "already_redirect",
    };
  }
  if (REVIEWER_TOOL.has(p)) {
    return {path: p, bucket: "reviewer_tool", isRedirect: false, destination: null, proposedAction: "keep"};
  }
  if (PUBLIC_MARKETING.has(p)) {
    return {path: p, bucket: "public_marketing", isRedirect: false, destination: null, proposedAction: "keep"};
  }
  if (INVESTIGATION_LOOP.has(p)) {
    return {path: p, bucket: "investigation_loop", isRedirect: false, destination: null, proposedAction: "keep"};
  }
  if (LABS_SYNTHETIC.has(p)) {
    return {path: p, bucket: "labs_synthetic", isRedirect: false, destination: null, proposedAction: "keep"};
  }
  if (AUTH_ACCOUNT.has(p)) {
    return {path: p, bucket: "auth_account", isRedirect: false, destination: null, proposedAction: "keep"};
  }
  if (ENGINEERING_CHROME.has(p)) {
    return {path: p, bucket: "engineering_chrome", isRedirect: false, destination: null, proposedAction: "keep"};
  }
  if (LEGACY_DEBT.has(p)) {
    return {path: p, bucket: "legacy_debt", isRedirect: false, destination: null, proposedAction: "owner_D60"};
  }
  return {path: p, bucket: "legacy_debt", isRedirect: false, destination: null, proposedAction: "owner_D60"};
}

export type ParsedAppRoute = {path: string; isRedirect: boolean; destination: string | null};

/** Offline parser for App.tsx route table (soft-land inventory). */
export function parseAppRoutes(appSource: string): ParsedAppRoute[] {
  const out: ParsedAppRoute[] = [];
  const re =
    /<Route\s+path="([^"]+)"\s+element=\{(?:<Navigate\s+to="([^"]+)"[^/]*\/>|[^}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(appSource))) {
    const path = m[1]!;
    const destination = m[2] ?? null;
    out.push({path: norm(path === "*" ? "*" : path), isRedirect: destination !== null, destination});
  }
  return out;
}

export function buildSiteRouteCatalog(appSource: string): SiteRouteCatalog {
  const parsed = parseAppRoutes(appSource);
  const entries = parsed.map((r) =>
    classifySiteRoute(r.path, {isRedirect: r.isRedirect, destination: r.destination}),
  );
  return {
    schemaVersion: SITE_ROUTE_CATALOG_SCHEMA,
    purpose: "wb07_route_legacy_soft_land",
    packRef: "WB-07",
    routeCountHalved: false,
    wb07Accepted: false,
    d60Decided: false,
    scientificApproval: false,
    inventedDestinations: false,
    reviewerToolsProtected: true,
    entries,
  };
}

export function assertSiteRouteCatalogSoftLand(catalog: SiteRouteCatalog): {
  entryCount: number;
  redirectCount: number;
  legacyDebtCount: number;
  routeCountHalved: false;
} {
  if (catalog.schemaVersion !== SITE_ROUTE_CATALOG_SCHEMA) throw new Error("Invalid site route catalog schema");
  if (catalog.routeCountHalved !== false || catalog.wb07Accepted !== false || catalog.d60Decided !== false) {
    throw new Error("WB-07 soft-land must not claim acceptance or D-60 closure");
  }
  if (catalog.inventedDestinations !== false || catalog.scientificApproval !== false) {
    throw new Error("WB-07 soft-land honesty flags invalid");
  }
  for (const path of REVIEWER_TOOL_PATHS) {
    const entry = catalog.entries.find((e) => e.path === path);
    if (!entry || entry.bucket !== "reviewer_tool" || entry.isRedirect) {
      throw new Error("Reviewer tool must stay mounted: " + path);
    }
  }
  const redirectCount = catalog.entries.filter((e) => e.isRedirect).length;
  const legacyDebtCount = catalog.entries.filter((e) => e.bucket === "legacy_debt").length;
  return {
    entryCount: catalog.entries.length,
    redirectCount,
    legacyDebtCount,
    routeCountHalved: false,
  };
}
