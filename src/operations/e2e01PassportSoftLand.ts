/**
 * PR-E2E-01 — Context Passport on default investigation path soft-land.
 *
 * Catalogues passport surfaces reused from #469 / A2.1 without inventing
 * context values, scores, or scientific approval. Missing fields stay explicit.
 */

export const E2E_01_PASSPORT_SCHEMA =
  "hsi-e2e-01-passport-soft-land-1" as const;

export type E2e01SuiteMode = "check" | "fixture";

export type E2e01SurfaceId =
  | "passport_builder"
  | "passport_ui_panel"
  | "investigation_workspace_default"
  | "graph_edge_selection"
  | "missing_field_honesty"
  | "live_brief_passport_columns"
  | "playwright_heading_assert";

export type E2e01SurfaceDisposition =
  | "reuse_adapter"
  | "reuse_ui"
  | "honesty_gate"
  | "reuse_test";

export type E2e01SurfaceRow = {
  surface: E2e01SurfaceId;
  disposition: E2e01SurfaceDisposition;
  inventedContext: false;
  scientificApproval: false;
  productionWritesEnabled: false;
  pathHints: readonly string[];
  notes: string;
};

export type E2e01PassportPacket = {
  schemaVersion: typeof E2E_01_PASSPORT_SCHEMA;
  purpose: "pr_e2e_01_passport_soft_land";
  backlogId: "PR-E2E-01";
  priority: "P1";
  scientificApproval: false;
  inventedContext: false;
  productionWritesEnabled: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  journeyAcceptanceClaimed: false;
  implementationPr: "#469";
  a21PassportUiPr: "#449";
  ciSafeModes: readonly E2e01SuiteMode[];
  reuseModules: readonly string[];
  surfaces: readonly E2e01SurfaceRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/e2e-01-passport.pending.json";
  softLandDocPath: "docs/engineering/E2E_01_PASSPORT_SOFT_LAND.md";
  honesty: {
    missingFieldsStayExplicit: true;
    noInventedContext: true;
    noScientificApproval: true;
    noProductionWrites: true;
    fixtureIsNotJourneyAcceptance: true;
  };
};

export type E2e01Assessment = {
  schemaVersion: "hsi-e2e-01-assessment-1";
  suiteMode: E2e01SuiteMode;
  mayInventContext: false;
  mayClaimScientificApproval: false;
  mayEnableProductionWrites: false;
  mayClaimJourneyAcceptance: false;
  ciSafe: true;
  reasons: string[];
  scientificApproval: false;
  inventedContext: false;
};

export type E2e01PassportHonesty = {
  schemaVersion: "hsi-e2e-01-passport-honesty-1";
  mustShowMissingFieldsExplicitly: true;
  mustNotInventTissueDoseSpecies: true;
  mustKeepCandidateUnreviewedLabel: true;
  mustRemainReadOnlyUi: true;
  reasons: string[];
};

const SURFACES: readonly E2e01SurfaceRow[] = [
  {
    surface: "passport_builder",
    disposition: "reuse_adapter",
    inventedContext: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    pathHints: ["src/knowledgeGraph/evidenceContextPassport.ts"],
    notes: "buildEvidenceContextPassport keeps Not stated / Not extracted; never invents fills.",
  },
  {
    surface: "passport_ui_panel",
    disposition: "reuse_ui",
    inventedContext: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    pathHints: ["site/src/components/EvidenceContextPassport.tsx"],
    notes: "EvidenceContextPassportView is read-only inspectable UI over existing edge fields.",
  },
  {
    surface: "investigation_workspace_default",
    disposition: "reuse_ui",
    inventedContext: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    pathHints: ["site/src/pages/InvestigationWorkspace.tsx"],
    notes: "Default investigation path surfaces passport for selected claim/edge (#469).",
  },
  {
    surface: "graph_edge_selection",
    disposition: "reuse_ui",
    inventedContext: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    pathHints: ["site/src/components/InvestigationGraphExperience.tsx"],
    notes: "Graph selection mounts passport heading without leaving the workbench.",
  },
  {
    surface: "missing_field_honesty",
    disposition: "honesty_gate",
    inventedContext: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    pathHints: [
      "src/knowledgeGraph/evidenceContextPassport.ts",
      "src/evidence/passageLinkedContext.ts",
    ],
    notes: "Empty/missing fields stay explicit; soft-land never invents context values.",
  },
  {
    surface: "live_brief_passport_columns",
    disposition: "reuse_adapter",
    inventedContext: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    pathHints: [
      "src/investigation/liveBriefPassport.ts",
      "src/investigation/liveClaimPassportEdge.ts",
    ],
    notes: "Live brief passport helpers feed columns; gate-pass claims stay out of scope here.",
  },
  {
    surface: "playwright_heading_assert",
    disposition: "reuse_test",
    inventedContext: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    pathHints: ["test/"],
    notes: "CI-safe heading/missing-field asserts; green tests are not journey acceptance.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Keep passport read-only; do not invent tissue/dose/species when absent.",
  "Do not enable production writes or new infrastructure from this soft-land.",
  "Do not claim scientific approval or live journey acceptance from soft-land green.",
  "Keep missing-field honesty on the default investigation path.",
  "Brief column acceptance remains PR-E2E-07 / owner gates — not this catalog alone.",
];

const REUSE_MODULES: readonly string[] = [
  "src/knowledgeGraph/evidenceContextPassport.ts",
  "site/src/components/EvidenceContextPassport.tsx",
  "site/src/pages/InvestigationWorkspace.tsx",
  "site/src/components/InvestigationGraphExperience.tsx",
  "src/investigation/liveBriefPassport.ts",
  "src/investigation/liveClaimPassportEdge.ts",
  "site/src/styles/evidence-context-passport.css",
];

export function e2e01PassportPacket(): E2e01PassportPacket {
  return {
    schemaVersion: E2E_01_PASSPORT_SCHEMA,
    purpose: "pr_e2e_01_passport_soft_land",
    backlogId: "PR-E2E-01",
    priority: "P1",
    scientificApproval: false,
    inventedContext: false,
    productionWritesEnabled: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    journeyAcceptanceClaimed: false,
    implementationPr: "#469",
    a21PassportUiPr: "#449",
    ciSafeModes: ["check", "fixture"],
    reuseModules: REUSE_MODULES,
    surfaces: SURFACES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/e2e-01-passport.pending.json",
    softLandDocPath: "docs/engineering/E2E_01_PASSPORT_SOFT_LAND.md",
    honesty: {
      missingFieldsStayExplicit: true,
      noInventedContext: true,
      noScientificApproval: true,
      noProductionWrites: true,
      fixtureIsNotJourneyAcceptance: true,
    },
  };
}

export function e2e01SurfaceById(surface: E2e01SurfaceId): E2e01SurfaceRow {
  switch (surface) {
    case "passport_builder":
    case "passport_ui_panel":
    case "investigation_workspace_default":
    case "graph_edge_selection":
    case "missing_field_honesty":
    case "live_brief_passport_columns":
    case "playwright_heading_assert": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing E2E-01 surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown E2E-01 surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessE2e01Mode(mode: E2e01SuiteMode): E2e01Assessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-e2e-01-assessment-1",
        suiteMode: mode,
        mayInventContext: false,
        mayClaimScientificApproval: false,
        mayEnableProductionWrites: false,
        mayClaimJourneyAcceptance: false,
        ciSafe: true,
        reasons: [
          "check mode validates passport honesty catalog only",
          "soft-land green is not journey acceptance or invented context permission",
        ],
        scientificApproval: false,
        inventedContext: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-e2e-01-assessment-1",
        suiteMode: mode,
        mayInventContext: false,
        mayClaimScientificApproval: false,
        mayEnableProductionWrites: false,
        mayClaimJourneyAcceptance: false,
        ciSafe: true,
        reasons: [
          "fixture missing-field / heading tests never invent context values",
          "fixture green is not production writes or scientific approval",
        ],
        scientificApproval: false,
        inventedContext: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown E2E-01 suite mode: ${String(_exhaustive)}`);
    }
  }
}

/** Passport honesty for PR-E2E-01 soft-land. */
export function assessE2e01PassportHonesty(): E2e01PassportHonesty {
  return {
    schemaVersion: "hsi-e2e-01-passport-honesty-1",
    mustShowMissingFieldsExplicitly: true,
    mustNotInventTissueDoseSpecies: true,
    mustKeepCandidateUnreviewedLabel: true,
    mustRemainReadOnlyUi: true,
    reasons: [
      "Missing passport fields stay Not stated / Not extracted",
      "Tissue, dose, species and similar fields are never invented",
      "Relationships stay candidate / unreviewed until human review",
      "Passport UI remains read-only with no production write enablement",
    ],
  };
}

export function assertE2e01PassportSoftLand(packet: E2e01PassportPacket): {
  surfaceCount: number;
  inventedContext: false;
  scientificApproval: false;
  productionWritesEnabled: false;
} {
  if (packet.schemaVersion !== E2E_01_PASSPORT_SCHEMA) {
    throw new Error("unexpected E2E-01 passport schema");
  }
  if (packet.backlogId !== "PR-E2E-01" || packet.priority !== "P1") {
    throw new Error("soft-land must bind PR-E2E-01 at P1");
  }
  if (
    packet.inventedContext !== false ||
    packet.scientificApproval !== false ||
    packet.productionWritesEnabled !== false
  ) {
    throw new Error("soft-land must not invent context, claim approval, or enable production writes");
  }
  if (
    packet.acceptedForScope !== false ||
    packet.signedPacketClaimed !== false ||
    packet.journeyAcceptanceClaimed !== false
  ) {
    throw new Error("soft-land must not claim acceptance, signed packet, or journey acceptance");
  }
  if (packet.surfaces.length !== 7) throw new Error("expected seven E2E-01 surfaces");
  for (const surface of packet.surfaces) {
    if (
      surface.inventedContext !== false ||
      surface.scientificApproval !== false ||
      surface.productionWritesEnabled !== false
    ) {
      throw new Error(`surface ${surface.surface} must keep all claim flags false`);
    }
  }
  return {
    surfaceCount: packet.surfaces.length,
    inventedContext: false,
    scientificApproval: false,
    productionWritesEnabled: false,
  };
}
