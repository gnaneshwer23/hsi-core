/**
 * PR-E2E-07 — research brief passport columns soft-land.
 *
 * Catalogues passport-column brief, verification status, and limitations
 * surfaces for exportable source-linked briefs. Never invents biological
 * context, verification gate pass, or scientific approval.
 */

export const E2E_07_BRIEF_PASSPORT_SCHEMA =
  "hsi-e2e-07-brief-passport-soft-land-1" as const;

export type E2e07SuiteMode = "check" | "fixture";

export type E2e07SurfaceId =
  | "live_brief_passport_rows"
  | "passport_evidence_table"
  | "verification_status_labels"
  | "limitations_honesty"
  | "live_brief_v2_export"
  | "research_brief_markdown"
  | "exportable_source_linked_brief";

export type E2e07SurfaceDisposition =
  | "reuse_adapter"
  | "reuse_export"
  | "owner_journey_acceptance";

export type E2e07SurfaceRow = {
  surface: E2e07SurfaceId;
  disposition: E2e07SurfaceDisposition;
  briefAccepted: false;
  scientificApproval: false;
  verificationGatePassed: false;
  pathHints: readonly string[];
  notes: string;
};

export type E2e07BriefPassportPacket = {
  schemaVersion: typeof E2E_07_BRIEF_PASSPORT_SCHEMA;
  purpose: "pr_e2e_07_brief_passport_soft_land";
  backlogId: "PR-E2E-07";
  priority: "P1";
  scientificApproval: false;
  briefAccepted: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  verificationGatePassed: false;
  inventedBiologicalContext: false;
  implementationPr: "#471";
  dependsOn: readonly ["PR-E2E-01", "PR-E2E-05", "PR-E2E-06"];
  ciSafeModes: readonly E2e07SuiteMode[];
  reuseModules: readonly string[];
  surfaces: readonly E2e07SurfaceRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/e2e-07-brief-passport.pending.json";
  softLandDocPath: "docs/engineering/E2E_07_BRIEF_PASSPORT_SOFT_LAND.md";
  honesty: {
    passportColumnsNotProof: true;
    noInventedBiologicalContext: true;
    noVerificationGatePassClaim: true;
    limitationsAlwaysPresent: true;
    fixtureIsNotBriefAcceptance: true;
  };
};

export type E2e07Assessment = {
  schemaVersion: "hsi-e2e-07-assessment-1";
  suiteMode: E2e07SuiteMode;
  mayClaimBriefAccepted: false;
  mayClaimVerificationGatePass: false;
  mayInventBiologicalContext: false;
  mayClaimScientificApproval: false;
  ciSafe: true;
  reasons: string[];
  scientificApproval: false;
  briefAccepted: false;
};

export type E2e07BriefHonesty = {
  schemaVersion: "hsi-e2e-07-brief-honesty-1";
  mustKeepPassportColumnsSourceLinked: true;
  mustSurfaceVerificationStatus: true;
  mustSurfaceLimitations: true;
  mustNotTreatLocatorAsProof: true;
  mustNotClaimGatePassFromHarness: true;
  reasons: string[];
};

const SURFACES: readonly E2e07SurfaceRow[] = [
  {
    surface: "live_brief_passport_rows",
    disposition: "reuse_adapter",
    briefAccepted: false,
    scientificApproval: false,
    verificationGatePassed: false,
    pathHints: [
      "src/investigation/liveBriefPassport.ts",
      "src/investigation/liveClaimPassportEdge.ts",
    ],
    notes: "Maps live investigation candidates onto passport evidence-table rows.",
  },
  {
    surface: "passport_evidence_table",
    disposition: "reuse_adapter",
    briefAccepted: false,
    scientificApproval: false,
    verificationGatePassed: false,
    pathHints: ["src/knowledgeGraph/passportEvidenceTable.ts"],
    notes: "Passport-column table builder; never invents missing biological context.",
  },
  {
    surface: "verification_status_labels",
    disposition: "reuse_adapter",
    briefAccepted: false,
    scientificApproval: false,
    verificationGatePassed: false,
    pathHints: ["src/investigation/liveBriefPassport.ts"],
    notes: "Honest verification labels (not_run / disputed / abstain / failed); not a gate pass.",
  },
  {
    surface: "limitations_honesty",
    disposition: "reuse_adapter",
    briefAccepted: false,
    scientificApproval: false,
    verificationGatePassed: false,
    pathHints: ["src/investigation/liveBrief.ts", "src/investigation/liveBriefV2.ts"],
    notes: "Limitations and readiness language stay visible on exportable briefs.",
  },
  {
    surface: "live_brief_v2_export",
    disposition: "reuse_export",
    briefAccepted: false,
    scientificApproval: false,
    verificationGatePassed: false,
    pathHints: [
      "src/investigation/liveBriefV2.ts",
      "docs/plans/LIVE_BRIEF_V2_EXPORT.md",
    ],
    notes: "C6 live-path brief v2 envelope; soft-land ≠ scientific acceptance.",
  },
  {
    surface: "research_brief_markdown",
    disposition: "reuse_export",
    briefAccepted: false,
    scientificApproval: false,
    verificationGatePassed: false,
    pathHints: ["site/src/lib/researchBrief.ts"],
    notes: "Source-linked Markdown helpers; locator is not proof of support.",
  },
  {
    surface: "exportable_source_linked_brief",
    disposition: "owner_journey_acceptance",
    briefAccepted: false,
    scientificApproval: false,
    verificationGatePassed: false,
    pathHints: ["docs/implementation/02-prioritised-backlog.md"],
    notes: "Exportable source-linked brief exit waits on staging journey evidence.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Keep passport columns source-linked; never invent biological context fields.",
  "Surface verification status and limitations on every exportable brief.",
  "Do not treat PubMed/DOI locators or harness green as verification gate pass.",
  "Accept the exportable brief exit only after staging evidence for the live path.",
];

const REUSE_MODULES: readonly string[] = [
  "src/investigation/liveBriefPassport.ts",
  "src/investigation/liveClaimPassportEdge.ts",
  "src/knowledgeGraph/passportEvidenceTable.ts",
  "src/investigation/liveBrief.ts",
  "src/investigation/liveBriefV2.ts",
  "site/src/lib/researchBrief.ts",
  "docs/plans/LIVE_BRIEF_V2_EXPORT.md",
];

export function e2e07BriefPassportPacket(): E2e07BriefPassportPacket {
  return {
    schemaVersion: E2E_07_BRIEF_PASSPORT_SCHEMA,
    purpose: "pr_e2e_07_brief_passport_soft_land",
    backlogId: "PR-E2E-07",
    priority: "P1",
    scientificApproval: false,
    briefAccepted: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    verificationGatePassed: false,
    inventedBiologicalContext: false,
    implementationPr: "#471",
    dependsOn: ["PR-E2E-01", "PR-E2E-05", "PR-E2E-06"],
    ciSafeModes: ["check", "fixture"],
    reuseModules: REUSE_MODULES,
    surfaces: SURFACES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/e2e-07-brief-passport.pending.json",
    softLandDocPath: "docs/engineering/E2E_07_BRIEF_PASSPORT_SOFT_LAND.md",
    honesty: {
      passportColumnsNotProof: true,
      noInventedBiologicalContext: true,
      noVerificationGatePassClaim: true,
      limitationsAlwaysPresent: true,
      fixtureIsNotBriefAcceptance: true,
    },
  };
}

export function e2e07SurfaceById(surface: E2e07SurfaceId): E2e07SurfaceRow {
  switch (surface) {
    case "live_brief_passport_rows":
    case "passport_evidence_table":
    case "verification_status_labels":
    case "limitations_honesty":
    case "live_brief_v2_export":
    case "research_brief_markdown":
    case "exportable_source_linked_brief": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing E2E-07 surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown E2E-07 surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessE2e07Mode(mode: E2e07SuiteMode): E2e07Assessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-e2e-07-assessment-1",
        suiteMode: mode,
        mayClaimBriefAccepted: false,
        mayClaimVerificationGatePass: false,
        mayInventBiologicalContext: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "check mode validates passport-column honesty only",
          "exportable brief acceptance stays owner-gated on staging evidence",
        ],
        scientificApproval: false,
        briefAccepted: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-e2e-07-assessment-1",
        suiteMode: mode,
        mayClaimBriefAccepted: false,
        mayClaimVerificationGatePass: false,
        mayInventBiologicalContext: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "fixture brief/passport tests use synthetic live runs only",
          "fixture green is not verification gate pass or brief acceptance",
        ],
        scientificApproval: false,
        briefAccepted: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown E2E-07 suite mode: ${String(_exhaustive)}`);
    }
  }
}

/** Brief honesty for PR-E2E-07 soft-land. */
export function assessE2e07BriefHonesty(): E2e07BriefHonesty {
  return {
    schemaVersion: "hsi-e2e-07-brief-honesty-1",
    mustKeepPassportColumnsSourceLinked: true,
    mustSurfaceVerificationStatus: true,
    mustSurfaceLimitations: true,
    mustNotTreatLocatorAsProof: true,
    mustNotClaimGatePassFromHarness: true,
    reasons: [
      "Passport columns must remain source-linked without invented context",
      "Verification status must be visible even when not_run or disputed",
      "Limitations must appear on every exportable brief",
      "PubMed/DOI locators are not proof a paper supports a claim",
      "Dual-provider harness green is not a verification gate pass",
    ],
  };
}

export function assertE2e07BriefPassportSoftLand(
  packet: E2e07BriefPassportPacket,
): {
  surfaceCount: number;
  briefAccepted: false;
  verificationGatePassed: false;
  inventedBiologicalContext: false;
} {
  if (packet.schemaVersion !== E2E_07_BRIEF_PASSPORT_SCHEMA) {
    throw new Error("unexpected E2E-07 brief-passport schema");
  }
  if (packet.backlogId !== "PR-E2E-07" || packet.priority !== "P1") {
    throw new Error("soft-land must bind PR-E2E-07 at P1");
  }
  if (packet.briefAccepted !== false || packet.acceptedForScope !== false) {
    throw new Error("soft-land must keep briefAccepted and acceptedForScope false");
  }
  if (packet.scientificApproval !== false || packet.signedPacketClaimed !== false) {
    throw new Error("soft-land must not claim scientific approval or signed packet");
  }
  if (packet.verificationGatePassed !== false || packet.inventedBiologicalContext !== false) {
    throw new Error("soft-land must not claim gate pass or invent biological context");
  }
  if (
    packet.dependsOn.length !== 3 ||
    packet.dependsOn[0] !== "PR-E2E-01" ||
    packet.dependsOn[1] !== "PR-E2E-05" ||
    packet.dependsOn[2] !== "PR-E2E-06"
  ) {
    throw new Error("soft-land must depend on PR-E2E-01, 05, and 06");
  }
  if (packet.surfaces.length !== 7) throw new Error("expected seven E2E-07 surfaces");
  for (const surface of packet.surfaces) {
    if (surface.briefAccepted !== false || surface.verificationGatePassed !== false) {
      throw new Error(`surface ${surface.surface} must keep brief/gate claims false`);
    }
    if (surface.scientificApproval !== false) {
      throw new Error(`surface ${surface.surface} must not claim scientific approval`);
    }
  }
  return {
    surfaceCount: packet.surfaces.length,
    briefAccepted: false,
    verificationGatePassed: false,
    inventedBiologicalContext: false,
  };
}
