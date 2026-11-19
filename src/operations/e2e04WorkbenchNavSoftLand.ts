/**
 * PR-E2E-04 — workbench nav reconnect soft-land.
 *
 * Catalogues the single primary Ask→evidence→graph→verify→brief path and
 * legacy redirect honesty. Never rebuilds workbenches, invents route counts,
 * or claims scientific approval / 1.0 journey acceptance.
 */

export const E2E_04_WORKBENCH_NAV_SCHEMA =
  "hsi-e2e-04-workbench-nav-soft-land-1" as const;

export type E2e04SuiteMode = "check" | "fixture";

export type E2e04SurfaceId =
  | "live_investigation_primary"
  | "research_home_entry"
  | "legacy_workbench_redirects"
  | "research_nav_items"
  | "site_route_catalog"
  | "authorised_decision_workbench"
  | "primary_journey_honesty";

export type E2e04SurfaceDisposition =
  | "reuse_primary"
  | "reuse_redirect"
  | "reuse_catalog"
  | "owner_journey_acceptance";

export type E2e04SurfaceRow = {
  surface: E2e04SurfaceId;
  disposition: E2e04SurfaceDisposition;
  primaryPathClaimed: false;
  scientificApproval: false;
  journeyAccepted: false;
  pathHints: readonly string[];
  notes: string;
};

export type E2e04WorkbenchNavPacket = {
  schemaVersion: typeof E2E_04_WORKBENCH_NAV_SCHEMA;
  purpose: "pr_e2e_04_workbench_nav_soft_land";
  backlogId: "PR-E2E-04";
  priority: "P1";
  scientificApproval: false;
  journeyAccepted: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  rebuiltWorkbenches: false;
  inventedRouteCount: false;
  primaryLivePath: "/research/workspace";
  implementationPr: "#470";
  ciSafeModes: readonly E2e04SuiteMode[];
  reuseModules: readonly string[];
  surfaces: readonly E2e04SurfaceRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/e2e-04-workbench-nav.pending.json";
  softLandDocPath: "docs/engineering/E2E_04_WORKBENCH_NAV_SOFT_LAND.md";
  honesty: {
    singlePrimaryPath: true;
    noWorkbenchRebuild: true;
    noInventedRouteCount: true;
    legacyRedirectsNotPrimary: true;
    fixtureIsNotJourneyAcceptance: true;
  };
};

export type E2e04Assessment = {
  schemaVersion: "hsi-e2e-04-assessment-1";
  suiteMode: E2e04SuiteMode;
  mayClaimJourneyAccepted: false;
  mayRebuildWorkbenches: false;
  mayInventRouteCount: false;
  mayClaimScientificApproval: false;
  ciSafe: true;
  reasons: string[];
  scientificApproval: false;
  journeyAccepted: false;
};

export type E2e04NavHonesty = {
  schemaVersion: "hsi-e2e-04-nav-honesty-1";
  mustKeepLiveWorkspacePrimary: true;
  mustRedirectLegacyWorkbenchUrls: true;
  mustNotRebuildSpecialisedTools: true;
  mustKeepAskEvidenceGraphVerifyBriefOrder: true;
  mustNotTreatSoftLandAsJourneyAcceptance: true;
  reasons: string[];
};

const SURFACES: readonly E2e04SurfaceRow[] = [
  {
    surface: "live_investigation_primary",
    disposition: "reuse_primary",
    primaryPathClaimed: false,
    scientificApproval: false,
    journeyAccepted: false,
    pathHints: ["site/src/lib/workbenchPrimary.ts"],
    notes: "LIVE_INVESTIGATION_PATH=/research/workspace is the single primary live path.",
  },
  {
    surface: "research_home_entry",
    disposition: "reuse_primary",
    primaryPathClaimed: false,
    scientificApproval: false,
    journeyAccepted: false,
    pathHints: ["site/src/pages/ResearchHome.tsx", "site/src/lib/workbenchPrimary.ts"],
    notes: "Research home routes into the live workspace; not a second workbench product.",
  },
  {
    surface: "legacy_workbench_redirects",
    disposition: "reuse_redirect",
    primaryPathClaimed: false,
    scientificApproval: false,
    journeyAccepted: false,
    pathHints: ["site/src/lib/workbenchPrimary.ts"],
    notes: "Legacy URLs redirect to the primary path; do not rebuild specialised tools.",
  },
  {
    surface: "research_nav_items",
    disposition: "reuse_catalog",
    primaryPathClaimed: false,
    scientificApproval: false,
    journeyAccepted: false,
    pathHints: ["site/src/lib/researchNavItems.ts"],
    notes: "Nav items point at the live path; soft-land never invents a route-count claim.",
  },
  {
    surface: "site_route_catalog",
    disposition: "reuse_catalog",
    primaryPathClaimed: false,
    scientificApproval: false,
    journeyAccepted: false,
    pathHints: ["site/src/lib/siteRouteCatalog.ts"],
    notes: "WB-07 / UX-05 route catalog honesty; one-hop retired aliases only.",
  },
  {
    surface: "authorised_decision_workbench",
    disposition: "reuse_primary",
    primaryPathClaimed: false,
    scientificApproval: false,
    journeyAccepted: false,
    pathHints: [
      "site/src/lib/workbenchPrimary.ts",
      "site/src/pages/AuthenticatedInterrogativeWorkbench.tsx",
    ],
    notes: "Auth-owned packages require ?investigation=; specialised, not a parallel primary.",
  },
  {
    surface: "primary_journey_honesty",
    disposition: "owner_journey_acceptance",
    primaryPathClaimed: false,
    scientificApproval: false,
    journeyAccepted: false,
    pathHints: ["docs/implementation/02-prioritised-backlog.md"],
    notes: "Ask→evidence→graph→verify→brief order is the reconnect target; soft-land ≠ journey acceptance.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Keep /research/workspace as the single primary live investigation path.",
  "Do not rebuild legacy workbench URLs; keep them as redirects or specialised tools.",
  "Verify Ask→evidence→graph→verify→brief remains one-hop navigable from research home/nav.",
  "Do not invent route-count marketing claims from the site route catalog.",
  "Treat soft-land / #470 green as reconnect wiring, not 1.0 journey acceptance.",
];

const REUSE_MODULES: readonly string[] = [
  "site/src/lib/workbenchPrimary.ts",
  "site/src/lib/researchNavItems.ts",
  "site/src/lib/siteRouteCatalog.ts",
  "site/src/pages/ResearchHome.tsx",
  "site/src/pages/AuthenticatedInterrogativeWorkbench.tsx",
];

export function e2e04WorkbenchNavPacket(): E2e04WorkbenchNavPacket {
  return {
    schemaVersion: E2E_04_WORKBENCH_NAV_SCHEMA,
    purpose: "pr_e2e_04_workbench_nav_soft_land",
    backlogId: "PR-E2E-04",
    priority: "P1",
    scientificApproval: false,
    journeyAccepted: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    rebuiltWorkbenches: false,
    inventedRouteCount: false,
    primaryLivePath: "/research/workspace",
    implementationPr: "#470",
    ciSafeModes: ["check", "fixture"],
    reuseModules: REUSE_MODULES,
    surfaces: SURFACES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/e2e-04-workbench-nav.pending.json",
    softLandDocPath: "docs/engineering/E2E_04_WORKBENCH_NAV_SOFT_LAND.md",
    honesty: {
      singlePrimaryPath: true,
      noWorkbenchRebuild: true,
      noInventedRouteCount: true,
      legacyRedirectsNotPrimary: true,
      fixtureIsNotJourneyAcceptance: true,
    },
  };
}

export function e2e04SurfaceById(surface: E2e04SurfaceId): E2e04SurfaceRow {
  switch (surface) {
    case "live_investigation_primary":
    case "research_home_entry":
    case "legacy_workbench_redirects":
    case "research_nav_items":
    case "site_route_catalog":
    case "authorised_decision_workbench":
    case "primary_journey_honesty": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing E2E-04 surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown E2E-04 surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessE2e04Mode(mode: E2e04SuiteMode): E2e04Assessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-e2e-04-assessment-1",
        suiteMode: mode,
        mayClaimJourneyAccepted: false,
        mayRebuildWorkbenches: false,
        mayInventRouteCount: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "check mode validates primary-path honesty only",
          "Ask→evidence→graph→verify→brief journey acceptance stays owner-gated",
        ],
        scientificApproval: false,
        journeyAccepted: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-e2e-04-assessment-1",
        suiteMode: mode,
        mayClaimJourneyAccepted: false,
        mayRebuildWorkbenches: false,
        mayInventRouteCount: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "fixture nav/route tests prove wiring only",
          "fixture green is not 1.0 journey acceptance",
        ],
        scientificApproval: false,
        journeyAccepted: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown E2E-04 suite mode: ${String(_exhaustive)}`);
    }
  }
}

/** Nav honesty for PR-E2E-04 soft-land. */
export function assessE2e04NavHonesty(): E2e04NavHonesty {
  return {
    schemaVersion: "hsi-e2e-04-nav-honesty-1",
    mustKeepLiveWorkspacePrimary: true,
    mustRedirectLegacyWorkbenchUrls: true,
    mustNotRebuildSpecialisedTools: true,
    mustKeepAskEvidenceGraphVerifyBriefOrder: true,
    mustNotTreatSoftLandAsJourneyAcceptance: true,
    reasons: [
      "/research/workspace remains the single primary live investigation path",
      "Legacy workbench URLs redirect or stay specialised tools",
      "Do not rebuild parallel workbench products",
      "Primary journey order is Ask→evidence→graph→verify→brief",
      "Soft-land and #470 wiring are not 1.0 journey acceptance",
    ],
  };
}

export function assertE2e04WorkbenchNavSoftLand(
  packet: E2e04WorkbenchNavPacket,
): {
  surfaceCount: number;
  journeyAccepted: false;
  primaryLivePath: "/research/workspace";
  rebuiltWorkbenches: false;
} {
  if (packet.schemaVersion !== E2E_04_WORKBENCH_NAV_SCHEMA) {
    throw new Error("unexpected E2E-04 workbench-nav schema");
  }
  if (packet.backlogId !== "PR-E2E-04" || packet.priority !== "P1") {
    throw new Error("soft-land must bind PR-E2E-04 at P1");
  }
  if (packet.journeyAccepted !== false || packet.acceptedForScope !== false) {
    throw new Error("soft-land must keep journeyAccepted and acceptedForScope false");
  }
  if (packet.scientificApproval !== false || packet.signedPacketClaimed !== false) {
    throw new Error("soft-land must not claim scientific approval or signed packet");
  }
  if (packet.rebuiltWorkbenches !== false || packet.inventedRouteCount !== false) {
    throw new Error("soft-land must not rebuild workbenches or invent route counts");
  }
  if (packet.primaryLivePath !== "/research/workspace") {
    throw new Error("soft-land must keep /research/workspace as primary live path");
  }
  if (packet.surfaces.length !== 7) throw new Error("expected seven E2E-04 surfaces");
  for (const surface of packet.surfaces) {
    if (surface.primaryPathClaimed !== false || surface.journeyAccepted !== false) {
      throw new Error(`surface ${surface.surface} must keep primary/journey claims false`);
    }
    if (surface.scientificApproval !== false) {
      throw new Error(`surface ${surface.surface} must not claim scientific approval`);
    }
  }
  return {
    surfaceCount: packet.surfaces.length,
    journeyAccepted: false,
    primaryLivePath: "/research/workspace",
    rebuiltWorkbenches: false,
  };
}
