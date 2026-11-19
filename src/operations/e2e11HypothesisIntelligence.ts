/**
 * PR-E2E-11 — hypothesis intelligence soft-land (P3 / labelled later).
 *
 * Catalogues existing hypothesis / falsification surfaces without promoting
 * them into the HSI 1.0 must-ship path. Never invents experimental validation,
 * scientific approval, or graph promotion. Validation stays gated.
 */

export const E2E_11_HYPOTHESIS_SCHEMA =
  "hsi-e2e-11-hypothesis-intelligence-1" as const;

export type E2e11SuiteMode = "check" | "fixture";

export type E2e11HypothesisSurfaceId =
  | "hypothesis_registry"
  | "hypothesis_ledger_device_local"
  | "falsifiable_experiment_proposals"
  | "interrogative_falsification_engine"
  | "research_outcome_hypotheses"
  | "collaboration_hypothesis_stubs"
  | "optional_planner_comparison";

export type E2e11SurfaceDisposition =
  | "reuse_registry"
  | "reuse_ledger"
  | "reuse_falsification"
  | "stub_later"
  | "validation_gated";

export type E2e11HypothesisSurfaceRow = {
  surface: E2e11HypothesisSurfaceId;
  disposition: E2e11SurfaceDisposition;
  /** Soft-land never claims experimental validation or 1.0 must-ship. */
  experimentallyValidated: false;
  scientificApproval: false;
  mustShipForHsi10: false;
  pathHints: readonly string[];
  notes: string;
};

export type E2e11HypothesisPacket = {
  schemaVersion: typeof E2E_11_HYPOTHESIS_SCHEMA;
  purpose: "pr_e2e_11_hypothesis_intelligence_soft_land";
  backlogId: "PR-E2E-11";
  priority: "P3";
  labelledLater: true;
  scientificApproval: false;
  experimentallyValidated: false;
  mustShipForHsi10: false;
  graphPromotable: false;
  gateCAutoApprove: false;
  inventedWetLabOutcomes: false;
  inventedNumericConfidence: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  ciSafeModes: readonly E2e11SuiteMode[];
  reuseModules: readonly string[];
  surfaces: readonly E2e11HypothesisSurfaceRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/e2e-11-hypothesis-intelligence.pending.json";
  softLandDocPath: "docs/engineering/E2E_11_HYPOTHESIS_INTELLIGENCE_SOFT_LAND.md";
  honesty: {
    reviewIsNotExperimentalValidation: true;
    ledgerUnvalidatedAlways: true;
    labelledLaterNotMustShip: true;
    noInventedWetLabOutcomes: true;
    noNumericLlmConfidence: true;
    fixtureIsNotValidation: true;
  };
};

export type E2e11HypothesisAssessment = {
  schemaVersion: "hsi-e2e-11-assessment-1";
  suiteMode: E2e11SuiteMode;
  mayClaimExperimentalValidation: false;
  mayClaimScientificApproval: false;
  mayClaimMustShipForHsi10: false;
  mayPromoteToGraph: false;
  ciSafe: true;
  reasons: string[];
  scientificApproval: false;
  experimentallyValidated: false;
};

export type E2e11HypothesisHonesty = {
  schemaVersion: "hsi-e2e-11-hypothesis-honesty-1";
  mustKeepUnvalidatedFlag: true;
  mustRequireFalsifierBeforeTesting: true;
  mustKeepConfidenceNotAssessed: true;
  mustNotTreatReviewAsValidation: true;
  mustKeepLabelledLater: true;
  reasons: string[];
};

const SURFACES: readonly E2e11HypothesisSurfaceRow[] = [
  {
    surface: "hypothesis_registry",
    disposition: "reuse_registry",
    experimentallyValidated: false,
    scientificApproval: false,
    mustShipForHsi10: false,
    pathHints: ["src/evidence/hypothesisRegistry.ts"],
    notes: "Lifecycle registry; review approval ≠ experimental validation; confidence not_assessed.",
  },
  {
    surface: "hypothesis_ledger_device_local",
    disposition: "reuse_ledger",
    experimentallyValidated: false,
    scientificApproval: false,
    mustShipForHsi10: false,
    pathHints: ["src/investigation/hypothesisLedger.ts"],
    notes: "Device-local ledger; unvalidated:true always; requires falsifier before testing.",
  },
  {
    surface: "falsifiable_experiment_proposals",
    disposition: "reuse_falsification",
    experimentallyValidated: false,
    scientificApproval: false,
    mustShipForHsi10: false,
    pathHints: ["src/evidence/falsifiableExperimentProposals.ts"],
    notes: "Structured proposal fields including falsificationCriterion; not wet-lab results.",
  },
  {
    surface: "interrogative_falsification_engine",
    disposition: "reuse_falsification",
    experimentallyValidated: false,
    scientificApproval: false,
    mustShipForHsi10: false,
    pathHints: ["src/interrogativeFalsificationEngine.ts"],
    notes: "Conservative uncertainty / falsification-first report; contested or insufficient only.",
  },
  {
    surface: "research_outcome_hypotheses",
    disposition: "reuse_falsification",
    experimentallyValidated: false,
    scientificApproval: false,
    mustShipForHsi10: false,
    pathHints: ["src/researchOutcome.ts"],
    notes: "Saved candidate hypotheses with falsification criteria; experimentSpecified stays false.",
  },
  {
    surface: "collaboration_hypothesis_stubs",
    disposition: "stub_later",
    experimentallyValidated: false,
    scientificApproval: false,
    mustShipForHsi10: false,
    pathHints: ["src/collaborativeInvestigationContracts.ts"],
    notes: "HypothesisDiscussionStub / ExperimentProposalStub remain stub:true until later band.",
  },
  {
    surface: "optional_planner_comparison",
    disposition: "validation_gated",
    experimentallyValidated: false,
    scientificApproval: false,
    mustShipForHsi10: false,
    pathHints: ["src/expansion/plannerComparison.ts", "src/expansion/controlledExpansion.ts"],
    notes: "Planner stays disabled; default deterministic falsification fields; no auto agent add.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Accept HSI 1.0 E2E journeys A–F before treating hypothesis intelligence as product centre.",
  "Keep hypothesis surfaces labelled later (P3); do not market them as must-ship for 1.0.",
  "Never set experimental validation from review approval alone.",
  "Do not invent wet-lab outcomes, numeric LLM confidence, or graph promotion from soft-land green.",
  "Optional planner remains off until a preregistered equal-evidence comparison passes ownership gates.",
];

const REUSE_MODULES: readonly string[] = [
  "src/evidence/hypothesisRegistry.ts",
  "src/investigation/hypothesisLedger.ts",
  "src/evidence/falsifiableExperimentProposals.ts",
  "src/interrogativeFalsificationEngine.ts",
  "src/researchOutcome.ts",
  "src/collaborativeInvestigationContracts.ts",
  "src/expansion/plannerComparison.ts",
];

export function e2e11HypothesisIntelligencePacket(): E2e11HypothesisPacket {
  return {
    schemaVersion: E2E_11_HYPOTHESIS_SCHEMA,
    purpose: "pr_e2e_11_hypothesis_intelligence_soft_land",
    backlogId: "PR-E2E-11",
    priority: "P3",
    labelledLater: true,
    scientificApproval: false,
    experimentallyValidated: false,
    mustShipForHsi10: false,
    graphPromotable: false,
    gateCAutoApprove: false,
    inventedWetLabOutcomes: false,
    inventedNumericConfidence: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    ciSafeModes: ["check", "fixture"],
    reuseModules: REUSE_MODULES,
    surfaces: SURFACES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/e2e-11-hypothesis-intelligence.pending.json",
    softLandDocPath: "docs/engineering/E2E_11_HYPOTHESIS_INTELLIGENCE_SOFT_LAND.md",
    honesty: {
      reviewIsNotExperimentalValidation: true,
      ledgerUnvalidatedAlways: true,
      labelledLaterNotMustShip: true,
      noInventedWetLabOutcomes: true,
      noNumericLlmConfidence: true,
      fixtureIsNotValidation: true,
    },
  };
}

export function e2e11HypothesisSurfaceById(
  surface: E2e11HypothesisSurfaceId,
): E2e11HypothesisSurfaceRow {
  switch (surface) {
    case "hypothesis_registry":
    case "hypothesis_ledger_device_local":
    case "falsifiable_experiment_proposals":
    case "interrogative_falsification_engine":
    case "research_outcome_hypotheses":
    case "collaboration_hypothesis_stubs":
    case "optional_planner_comparison": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing hypothesis surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown hypothesis surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessE2e11HypothesisMode(
  mode: E2e11SuiteMode,
): E2e11HypothesisAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-e2e-11-assessment-1",
        suiteMode: mode,
        mayClaimExperimentalValidation: false,
        mayClaimScientificApproval: false,
        mayClaimMustShipForHsi10: false,
        mayPromoteToGraph: false,
        ciSafe: true,
        reasons: [
          "check mode validates catalog honesty only",
          "hypothesis intelligence remains labelled later (P3) until 1.0 E2E is accepted",
        ],
        scientificApproval: false,
        experimentallyValidated: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-e2e-11-assessment-1",
        suiteMode: mode,
        mayClaimExperimentalValidation: false,
        mayClaimScientificApproval: false,
        mayClaimMustShipForHsi10: false,
        mayPromoteToGraph: false,
        ciSafe: true,
        reasons: [
          "fixture hypothesis/ledger tests use unvalidated stubs only",
          "fixture green is not experimental validation or product centre promotion",
        ],
        scientificApproval: false,
        experimentallyValidated: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown hypothesis suite mode: ${String(_exhaustive)}`);
    }
  }
}

/** Product honesty for hypothesis surfaces under soft-land. */
export function assessHypothesisIntelligenceHonesty(): E2e11HypothesisHonesty {
  return {
    schemaVersion: "hsi-e2e-11-hypothesis-honesty-1",
    mustKeepUnvalidatedFlag: true,
    mustRequireFalsifierBeforeTesting: true,
    mustKeepConfidenceNotAssessed: true,
    mustNotTreatReviewAsValidation: true,
    mustKeepLabelledLater: true,
    reasons: [
      "Ledger entries always carry unvalidated:true",
      "Testing requires an explicit falsifier before status can advance",
      "Registry confidence stays not_assessed with null numericConfidence",
      "Review approval never implies experimental validation",
      "Backlog keeps PR-E2E-11 as P3 labelled later, not 1.0 must-ship",
    ],
  };
}

export function assertE2e11HypothesisSoftLand(
  packet: E2e11HypothesisPacket,
): {
  surfaceCount: number;
  experimentallyValidated: false;
  mustShipForHsi10: false;
  scientificApproval: false;
} {
  if (packet.schemaVersion !== E2E_11_HYPOTHESIS_SCHEMA) {
    throw new Error("unexpected e2e-11 hypothesis schema");
  }
  if (packet.labelledLater !== true || packet.priority !== "P3") {
    throw new Error("soft-land must keep PR-E2E-11 labelled later at P3");
  }
  if (packet.experimentallyValidated !== false) {
    throw new Error("soft-land must keep experimentallyValidated false");
  }
  if (packet.mustShipForHsi10 !== false) {
    throw new Error("soft-land must keep mustShipForHsi10 false");
  }
  if (packet.scientificApproval !== false || packet.graphPromotable !== false) {
    throw new Error("soft-land must not claim scientific approval or graph promotion");
  }
  if (packet.gateCAutoApprove !== false) {
    throw new Error("soft-land must keep gateCAutoApprove false");
  }
  if (packet.inventedWetLabOutcomes !== false || packet.inventedNumericConfidence !== false) {
    throw new Error("soft-land must not invent wet-lab outcomes or numeric confidence");
  }
  if (packet.acceptedForScope !== false || packet.signedPacketClaimed !== false) {
    throw new Error("soft-land must not claim acceptance or signed packet");
  }
  if (packet.surfaces.length !== 7) throw new Error("expected seven hypothesis surfaces");
  for (const surface of packet.surfaces) {
    if (surface.experimentallyValidated !== false) {
      throw new Error(`surface ${surface.surface} must keep experimentallyValidated false`);
    }
    if (surface.mustShipForHsi10 !== false) {
      throw new Error(`surface ${surface.surface} must keep mustShipForHsi10 false`);
    }
    if (surface.scientificApproval !== false) {
      throw new Error(`surface ${surface.surface} must not claim scientific approval`);
    }
  }
  return {
    surfaceCount: packet.surfaces.length,
    experimentallyValidated: false,
    mustShipForHsi10: false,
    scientificApproval: false,
  };
}
