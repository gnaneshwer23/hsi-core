/**
 * PR-E2E-06 — dual-provider verification staging bind soft-land.
 *
 * Catalogues harness reuse, staging bind surfaces, and abstention honesty.
 * Never invents provider credentials, approved deployments, SME gold, or
 * reliability-gate pass. modelIndependenceVerified stays false.
 */

export const E2E_06_DUAL_PROVIDER_SCHEMA =
  "hsi-e2e-06-dual-provider-verification-1" as const;

export type E2e06SuiteMode = "check" | "fixture";

export type E2e06VerificationSurfaceId =
  | "dual_model_challenge"
  | "provider_reliability_boundary"
  | "reliability_evaluation_harness"
  | "scientific_reliability_gate"
  | "investigation_workspace_verification_ui"
  | "staging_provider_bind"
  | "sme_gold_adjudication";

export type E2e06SurfaceDisposition =
  | "reuse_harness"
  | "ui_honesty"
  | "owner_gated_staging"
  | "blocked_on_gold";

export type E2e06VerificationSurfaceRow = {
  surface: E2e06VerificationSurfaceId;
  disposition: E2e06SurfaceDisposition;
  /** Soft-land never claims gate pass or independence proof. */
  reliabilityGatePassClaimed: false;
  modelIndependenceVerified: false;
  scientificAccuracyCalibrated: false;
  pathHints: readonly string[];
  notes: string;
};

export type E2e06DualProviderPacket = {
  schemaVersion: typeof E2E_06_DUAL_PROVIDER_SCHEMA;
  purpose: "pr_e2e_06_dual_provider_verification_soft_land";
  backlogId: "PR-E2E-06";
  scientificApproval: false;
  reliabilityGatePassClaimed: false;
  modelIndependenceVerified: false;
  scientificAccuracyCalibrated: false;
  liveProviderBindAuthorized: false;
  productionActivationApproved: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  inventedProviderCredentials: false;
  inventedApprovedDeployments: false;
  ciSafeModes: readonly E2e06SuiteMode[];
  reuseModules: readonly string[];
  surfaces: readonly E2e06VerificationSurfaceRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/e2e-06-dual-provider-verification.pending.json";
  softLandDocPath: "docs/engineering/E2E_06_DUAL_PROVIDER_VERIFICATION_SOFT_LAND.md";
  honesty: {
    noInventedCredentials: true;
    noInventedDeployments: true;
    noGatePassClaim: true;
    independenceUnproven: true;
    abstentionRequiredWhenInsufficient: true;
    fixtureIsNotLiveBind: true;
  };
};

export type E2e06VerificationAssessment = {
  schemaVersion: "hsi-e2e-06-assessment-1";
  suiteMode: E2e06SuiteMode;
  mayClaimReliabilityGatePass: false;
  mayClaimModelIndependence: false;
  mayClaimLiveProviderBind: false;
  mayClaimScientificApproval: false;
  ciSafe: true;
  reasons: string[];
  scientificApproval: false;
  modelIndependenceVerified: false;
};

export type E2e06AbstentionHonesty = {
  schemaVersion: "hsi-e2e-06-abstention-honesty-1";
  mustShowAbstentionWhenInsufficient: true;
  mustNotClaimConsensusFromEmptyOpposing: true;
  mustKeepCandidateUnreviewedLabel: true;
  mustKeepModelIndependenceVerifiedFalse: true;
  reasons: string[];
};

const SURFACES: readonly E2e06VerificationSurfaceRow[] = [
  {
    surface: "dual_model_challenge",
    disposition: "reuse_harness",
    reliabilityGatePassClaimed: false,
    modelIndependenceVerified: false,
    scientificAccuracyCalibrated: false,
    pathHints: ["src/researchV2/dualModelChallenge.ts"],
    notes: "Two injected runners; individual failure → abstention; independence flag stays false.",
  },
  {
    surface: "provider_reliability_boundary",
    disposition: "reuse_harness",
    reliabilityGatePassClaimed: false,
    modelIndependenceVerified: false,
    scientificAccuracyCalibrated: false,
    pathHints: ["src/researchV2/providerReliability.ts"],
    notes: "Allowlisted endpoints only; no credentials or live activation in soft-land.",
  },
  {
    surface: "reliability_evaluation_harness",
    disposition: "reuse_harness",
    reliabilityGatePassClaimed: false,
    modelIndependenceVerified: false,
    scientificAccuracyCalibrated: false,
    pathHints: ["src/researchV2/reliabilityEvaluationHarness.ts"],
    notes: "Engineering harness only; not scientific acceptance.",
  },
  {
    surface: "scientific_reliability_gate",
    disposition: "reuse_harness",
    reliabilityGatePassClaimed: false,
    modelIndependenceVerified: false,
    scientificAccuracyCalibrated: false,
    pathHints: ["src/researchV2/scientificReliabilityGate.ts"],
    notes: "releaseEligible always false until governance thresholds + gold exist.",
  },
  {
    surface: "investigation_workspace_verification_ui",
    disposition: "ui_honesty",
    reliabilityGatePassClaimed: false,
    modelIndependenceVerified: false,
    scientificAccuracyCalibrated: false,
    pathHints: ["site/src/pages/InvestigationWorkspace.tsx"],
    notes: "Must surface not_configured / abstention / candidate-only copy; never claim gate pass.",
  },
  {
    surface: "staging_provider_bind",
    disposition: "owner_gated_staging",
    reliabilityGatePassClaimed: false,
    modelIndependenceVerified: false,
    scientificAccuracyCalibrated: false,
    pathHints: ["src/researchV2/providerReliability.ts", "docs/research/B044_LINKAGE_AND_DUAL_CHALLENGE.md"],
    notes: "Two approved staging deployments required; soft-land does not invent them.",
  },
  {
    surface: "sme_gold_adjudication",
    disposition: "blocked_on_gold",
    reliabilityGatePassClaimed: false,
    modelIndependenceVerified: false,
    scientificAccuracyCalibrated: false,
    pathHints: ["docs/implementation/02-prioritised-backlog.md"],
    notes: "PR-E2E-10 / SME gold vault; soft-land never invents adjudicated cases.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Name two distinct approved provider deployments (providerId/modelId/endpoint) for staging only.",
  "Provision credentials privately; never commit keys or invent allowlist endpoints.",
  "Run dual-model challenge against cleared passages only (after clearance B1 / E2E-03 owner steps).",
  "Confirm UI shows abstention / not_configured honesty when a runner fails or is unbound.",
  "Do not treat harness green or soft-land green as reliability-gate pass or scientific approval.",
];

const REUSE_MODULES: readonly string[] = [
  "src/researchV2/dualModelChallenge.ts",
  "src/researchV2/providerReliability.ts",
  "src/researchV2/reliabilityEvaluationHarness.ts",
  "src/researchV2/scientificReliabilityGate.ts",
  "src/researchV2/scientificEntailment.ts",
  "src/researchV2/modelEntailment.ts",
];

export function e2e06DualProviderVerificationPacket(): E2e06DualProviderPacket {
  return {
    schemaVersion: E2E_06_DUAL_PROVIDER_SCHEMA,
    purpose: "pr_e2e_06_dual_provider_verification_soft_land",
    backlogId: "PR-E2E-06",
    scientificApproval: false,
    reliabilityGatePassClaimed: false,
    modelIndependenceVerified: false,
    scientificAccuracyCalibrated: false,
    liveProviderBindAuthorized: false,
    productionActivationApproved: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedProviderCredentials: false,
    inventedApprovedDeployments: false,
    ciSafeModes: ["check", "fixture"],
    reuseModules: REUSE_MODULES,
    surfaces: SURFACES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/e2e-06-dual-provider-verification.pending.json",
    softLandDocPath: "docs/engineering/E2E_06_DUAL_PROVIDER_VERIFICATION_SOFT_LAND.md",
    honesty: {
      noInventedCredentials: true,
      noInventedDeployments: true,
      noGatePassClaim: true,
      independenceUnproven: true,
      abstentionRequiredWhenInsufficient: true,
      fixtureIsNotLiveBind: true,
    },
  };
}

export function e2e06VerificationSurfaceById(
  surface: E2e06VerificationSurfaceId,
): E2e06VerificationSurfaceRow {
  switch (surface) {
    case "dual_model_challenge":
    case "provider_reliability_boundary":
    case "reliability_evaluation_harness":
    case "scientific_reliability_gate":
    case "investigation_workspace_verification_ui":
    case "staging_provider_bind":
    case "sme_gold_adjudication": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing dual-provider surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown dual-provider surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessE2e06VerificationMode(
  mode: E2e06SuiteMode,
): E2e06VerificationAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-e2e-06-assessment-1",
        suiteMode: mode,
        mayClaimReliabilityGatePass: false,
        mayClaimModelIndependence: false,
        mayClaimLiveProviderBind: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "check mode validates catalog honesty only",
          "modelIndependenceVerified remains false until independence is proven outside soft-land",
        ],
        scientificApproval: false,
        modelIndependenceVerified: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-e2e-06-assessment-1",
        suiteMode: mode,
        mayClaimReliabilityGatePass: false,
        mayClaimModelIndependence: false,
        mayClaimLiveProviderBind: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "fixture dual-model tests use injected runners only",
          "fixture green is not staging provider bind or gate pass",
        ],
        scientificApproval: false,
        modelIndependenceVerified: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown dual-provider suite mode: ${String(_exhaustive)}`);
    }
  }
}

/** UI / product honesty for abstention under soft-land (no gate pass). */
export function assessVerificationAbstentionHonesty(): E2e06AbstentionHonesty {
  return {
    schemaVersion: "hsi-e2e-06-abstention-honesty-1",
    mustShowAbstentionWhenInsufficient: true,
    mustNotClaimConsensusFromEmptyOpposing: true,
    mustKeepCandidateUnreviewedLabel: true,
    mustKeepModelIndependenceVerifiedFalse: true,
    reasons: [
      "Insufficient evidence and runner failure must abstain, not invent support",
      "Empty opposing checks do not establish consensus",
      "Candidates remain unreviewed until SME adjudication",
      "modelIndependenceVerified stays false in DualModelResult",
    ],
  };
}

export function assertE2e06DualProviderSoftLand(
  packet: E2e06DualProviderPacket,
): {
  surfaceCount: number;
  reliabilityGatePassClaimed: false;
  modelIndependenceVerified: false;
  liveProviderBindAuthorized: false;
} {
  if (packet.schemaVersion !== E2E_06_DUAL_PROVIDER_SCHEMA) {
    throw new Error("unexpected e2e-06 dual-provider schema");
  }
  if (packet.reliabilityGatePassClaimed !== false) {
    throw new Error("soft-land must not claim reliability gate pass");
  }
  if (packet.modelIndependenceVerified !== false) {
    throw new Error("soft-land must keep modelIndependenceVerified false");
  }
  if (packet.scientificAccuracyCalibrated !== false) {
    throw new Error("soft-land must keep scientificAccuracyCalibrated false");
  }
  if (packet.liveProviderBindAuthorized !== false) {
    throw new Error("soft-land must not authorize live provider bind");
  }
  if (packet.scientificApproval !== false) {
    throw new Error("soft-land must not claim scientific approval");
  }
  if (packet.inventedProviderCredentials !== false || packet.inventedApprovedDeployments !== false) {
    throw new Error("soft-land must not invent credentials or deployments");
  }
  if (packet.acceptedForScope !== false || packet.signedPacketClaimed !== false) {
    throw new Error("soft-land must not claim acceptance or signed packet");
  }
  if (packet.surfaces.length !== 7) throw new Error("expected seven verification surfaces");
  for (const surface of packet.surfaces) {
    if (surface.reliabilityGatePassClaimed !== false) {
      throw new Error(`surface ${surface.surface} must not claim gate pass`);
    }
    if (surface.modelIndependenceVerified !== false) {
      throw new Error(`surface ${surface.surface} must keep independence unverified`);
    }
  }
  return {
    surfaceCount: packet.surfaces.length,
    reliabilityGatePassClaimed: false,
    modelIndependenceVerified: false,
    liveProviderBindAuthorized: false,
  };
}
