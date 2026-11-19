/**
 * PR-E2E-03 — source clearance composition soft-land.
 *
 * Catalogues retrieval surfaces that must compose over existing receipt
 * verifiers / operational clearance. Never invents policy approval, signers,
 * authorities, or live clearance. Keeps SOURCE_CLEARANCE_POLICY_DRAFT as DRAFT.
 */

export const E2E_03_CLEARANCE_COMPOSITION_SCHEMA =
  "hsi-e2e-03-source-clearance-composition-1" as const;

export type E2e03CompositionMode = "check" | "fixture";

export type E2e03RetrievalSurfaceId =
  | "scientific_abstract_api"
  | "live_sources_abstracts"
  | "investigation_live_run"
  | "open_access_sections"
  | "literature_search_metadata"
  | "scientific_pubmed"
  | "investigation_trace"
  | "dynamic_evidence_metadata"
  | "live_search_cleared_path";

export type E2e03SurfaceDisposition = "gate" | "metadata_only" | "already_composed";

export type E2e03RetrievalSurfaceRow = {
  surface: E2e03RetrievalSurfaceId;
  disposition: E2e03SurfaceDisposition;
  /** Soft-land never authorizes uncleared passage/abstract egress. */
  passageOrAbstractWithoutReceiptAllowed: false;
  pathHints: readonly string[];
  notes: string;
};

export type E2e03ClearanceCompositionPacket = {
  schemaVersion: typeof E2E_03_CLEARANCE_COMPOSITION_SCHEMA;
  purpose: "pr_e2e_03_source_clearance_composition_soft_land";
  backlogId: "PR-E2E-03";
  policyDraftPath: "docs/SOURCE_CLEARANCE_POLICY_DRAFT.md";
  policyDraftStatus: "DRAFT";
  policySigned: false;
  policyApprovalRef: null;
  scientificApproval: false;
  livePassageRetrievalAuthorized: false;
  inventedSigner: false;
  inventedAuthority: false;
  productionActivationApproved: false;
  ciSafeModes: readonly E2e03CompositionMode[];
  reuseModules: readonly string[];
  surfaces: readonly E2e03RetrievalSurfaceRow[];
  pendingWorksheetPath: "operations/staging/e2e-03-source-clearance.pending.json";
  softLandDocPath: "docs/engineering/E2E_03_SOURCE_CLEARANCE_COMPOSITION_SOFT_LAND.md";
  ownerPreconditions: readonly string[];
  honesty: {
    noInventedSigner: true;
    noInventedAuthority: true;
    noInventedPolicyApproval: true;
    draftPolicyRemainsDraft: true;
    fixtureIsNotLiveClearance: true;
  };
};

export type E2e03CompositionAssessment = {
  schemaVersion: "hsi-e2e-03-assessment-1";
  suiteMode: E2e03CompositionMode;
  mayClaimPolicySigned: false;
  mayReturnPassageOrAbstractWithoutReceipt: false;
  mayClaimLiveClearance: false;
  ciSafe: true;
  reasons: string[];
  scientificApproval: false;
  policyDraftStatus: "DRAFT";
};

export type E2e03AbstractEgressAssessment = {
  schemaVersion: "hsi-e2e-03-abstract-egress-1";
  mayReturnPassageOrAbstractWithoutReceipt: false;
  sourceClearanceVerified: false;
  passageReuseAuthorized: false;
  policyDraftStatus: "DRAFT";
  policySigned: false;
  reasons: string[];
};

const SURFACES: readonly E2e03RetrievalSurfaceRow[] = [
  {
    surface: "scientific_abstract_api",
    disposition: "gate",
    passageOrAbstractWithoutReceiptAllowed: false,
    pathHints: ["site/api/scientific-abstract.ts", "src/scientificAbstractContext.ts"],
    notes: "Legacy Europe PMC abstract body path; must not claim clearance or reuse rights.",
  },
  {
    surface: "live_sources_abstracts",
    disposition: "gate",
    passageOrAbstractWithoutReceiptAllowed: false,
    pathHints: ["src/evidence/liveSources.ts"],
    notes: "OpenAlex / Europe PMC adapters may observe abstracts with licenceStatus not_assessed.",
  },
  {
    surface: "investigation_live_run",
    disposition: "gate",
    passageOrAbstractWithoutReceiptAllowed: false,
    pathHints: ["src/investigation/liveRun.ts"],
    notes: "Consumes uncleared abstract text for sentence extraction; must stay honesty-labelled.",
  },
  {
    surface: "open_access_sections",
    disposition: "gate",
    passageOrAbstractWithoutReceiptAllowed: false,
    pathHints: ["src/researchV2/openAccessSections.ts"],
    notes: "Full-text paragraphs only under liveSearch + operational decide→cleared.",
  },
  {
    surface: "literature_search_metadata",
    disposition: "metadata_only",
    passageOrAbstractWithoutReceiptAllowed: false,
    pathHints: ["src/server/literatureSearchHandler.ts"],
    notes: "Bibliographic metadata only; abstracts are not proxied.",
  },
  {
    surface: "scientific_pubmed",
    disposition: "metadata_only",
    passageOrAbstractWithoutReceiptAllowed: false,
    pathHints: ["site/api/scientific-pubmed.ts"],
    notes: "Bibliography retrieval; not passage clearance.",
  },
  {
    surface: "investigation_trace",
    disposition: "metadata_only",
    passageOrAbstractWithoutReceiptAllowed: false,
    pathHints: ["site/api/scientific-investigation-trace.ts"],
    notes: "Trace returns empty passages by design.",
  },
  {
    surface: "dynamic_evidence_metadata",
    disposition: "metadata_only",
    passageOrAbstractWithoutReceiptAllowed: false,
    pathHints: ["src/evidence/dynamicEvidenceRetrieval.ts"],
    notes: "Non-metadata contentAccess already refused as permission_licence_restriction.",
  },
  {
    surface: "live_search_cleared_path",
    disposition: "already_composed",
    passageOrAbstractWithoutReceiptAllowed: false,
    pathHints: ["src/liveSearch.ts", "src/liveWiring.ts", "src/researchV2/operationalSourceClearance.ts"],
    notes: "Gold path requires injected signed policy + decide→cleared; still blocked until B1.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Sign or explicitly defer docs/SOURCE_CLEARANCE_POLICY_DRAFT.md (Track B1 / #442) — soft-land never invents approval.",
  "Appoint clearance authority and managed Ed25519 signer outside the repository.",
  "Wire liveWiring with verified policy approval + pinned public keys (no invented interim approval).",
  "Prove first-scope CC BY chain end-to-end before widening licence classes.",
  "Keep model_transmission blocked until provider allow-list is owner-decided.",
];

const REUSE_MODULES: readonly string[] = [
  "src/researchV2/sourceClearanceReceipt.ts",
  "src/researchV2/operationalSourceClearance.ts",
  "src/researchV2/clearancePolicy.ts",
  "src/researchV2/clearanceAuthority.ts",
  "src/researchV2/clearanceSigning.ts",
  "src/liveSearch.ts",
  "src/liveWiring.ts",
];

export function e2e03SourceClearanceCompositionPacket(): E2e03ClearanceCompositionPacket {
  return {
    schemaVersion: E2E_03_CLEARANCE_COMPOSITION_SCHEMA,
    purpose: "pr_e2e_03_source_clearance_composition_soft_land",
    backlogId: "PR-E2E-03",
    policyDraftPath: "docs/SOURCE_CLEARANCE_POLICY_DRAFT.md",
    policyDraftStatus: "DRAFT",
    policySigned: false,
    policyApprovalRef: null,
    scientificApproval: false,
    livePassageRetrievalAuthorized: false,
    inventedSigner: false,
    inventedAuthority: false,
    productionActivationApproved: false,
    ciSafeModes: ["check", "fixture"],
    reuseModules: REUSE_MODULES,
    surfaces: SURFACES,
    pendingWorksheetPath: "operations/staging/e2e-03-source-clearance.pending.json",
    softLandDocPath: "docs/engineering/E2E_03_SOURCE_CLEARANCE_COMPOSITION_SOFT_LAND.md",
    ownerPreconditions: OWNER_PRECONDITIONS,
    honesty: {
      noInventedSigner: true,
      noInventedAuthority: true,
      noInventedPolicyApproval: true,
      draftPolicyRemainsDraft: true,
      fixtureIsNotLiveClearance: true,
    },
  };
}

export function e2e03RetrievalSurfaceById(
  surface: E2e03RetrievalSurfaceId,
): E2e03RetrievalSurfaceRow {
  switch (surface) {
    case "scientific_abstract_api":
    case "live_sources_abstracts":
    case "investigation_live_run":
    case "open_access_sections":
    case "literature_search_metadata":
    case "scientific_pubmed":
    case "investigation_trace":
    case "dynamic_evidence_metadata":
    case "live_search_cleared_path": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing clearance composition surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown clearance composition surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessE2e03CompositionMode(
  mode: E2e03CompositionMode,
): E2e03CompositionAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-e2e-03-assessment-1",
        suiteMode: mode,
        mayClaimPolicySigned: false,
        mayReturnPassageOrAbstractWithoutReceipt: false,
        mayClaimLiveClearance: false,
        ciSafe: true,
        reasons: [
          "check mode validates catalog honesty and DRAFT policy status only",
          "signed clearance policy is still missing (SOURCE_CLEARANCE_POLICY_DRAFT)",
        ],
        scientificApproval: false,
        policyDraftStatus: "DRAFT",
      };
    case "fixture":
      return {
        schemaVersion: "hsi-e2e-03-assessment-1",
        suiteMode: mode,
        mayClaimPolicySigned: false,
        mayReturnPassageOrAbstractWithoutReceipt: false,
        mayClaimLiveClearance: false,
        ciSafe: true,
        reasons: [
          "fixture composition uses synthetic receipts only when tests inject them",
          "fixture green is not live clearance or policy approval",
        ],
        scientificApproval: false,
        policyDraftStatus: "DRAFT",
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown clearance composition mode: ${String(_exhaustive)}`);
    }
  }
}

/**
 * Soft-land egress assessor for legacy abstract/passage APIs.
 * Always refuses reuse authorization until an owner-signed policy exists.
 */
export function assessPassageAbstractEgress(): E2e03AbstractEgressAssessment {
  return {
    schemaVersion: "hsi-e2e-03-abstract-egress-1",
    mayReturnPassageOrAbstractWithoutReceipt: false,
    sourceClearanceVerified: false,
    passageReuseAuthorized: false,
    policyDraftStatus: "DRAFT",
    policySigned: false,
    reasons: [
      "SOURCE_CLEARANCE_POLICY_DRAFT remains DRAFT — no signed policy approval",
      "no clearance authority or managed signer is appointed in this soft-land",
      "passage or abstract reuse requires a verified source clearance receipt",
    ],
  };
}

export function assertE2e03ClearanceCompositionSoftLand(
  packet: E2e03ClearanceCompositionPacket,
): {
  surfaceCount: number;
  policySigned: false;
  policyDraftStatus: "DRAFT";
  livePassageRetrievalAuthorized: false;
} {
  if (packet.schemaVersion !== E2E_03_CLEARANCE_COMPOSITION_SCHEMA) {
    throw new Error("unexpected e2e-03 clearance composition schema");
  }
  if (packet.policyDraftStatus !== "DRAFT") {
    throw new Error("soft-land must keep SOURCE_CLEARANCE_POLICY_DRAFT as DRAFT");
  }
  if (packet.policySigned !== false) throw new Error("soft-land must not claim policy signed");
  if (packet.policyApprovalRef !== null) throw new Error("soft-land must not invent policy approval ref");
  if (packet.scientificApproval !== false) throw new Error("soft-land must not claim scientific approval");
  if (packet.livePassageRetrievalAuthorized !== false) {
    throw new Error("soft-land must not authorize live passage retrieval");
  }
  if (packet.inventedSigner !== false || packet.inventedAuthority !== false) {
    throw new Error("soft-land must not invent signer or authority");
  }
  if (packet.productionActivationApproved !== false) {
    throw new Error("soft-land must not approve production activation");
  }
  if (packet.surfaces.length !== 9) throw new Error("expected nine retrieval surfaces");
  for (const surface of packet.surfaces) {
    if (surface.passageOrAbstractWithoutReceiptAllowed !== false) {
      throw new Error(`surface ${surface.surface} must refuse uncleared passage egress`);
    }
  }
  return {
    surfaceCount: packet.surfaces.length,
    policySigned: false,
    policyDraftStatus: "DRAFT",
    livePassageRetrievalAuthorized: false,
  };
}
