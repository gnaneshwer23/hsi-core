/**
 * Interface sketches for an ISI / immunecity HSI artifact consumer.
 * Strings mirror docs/hsi-isi-wiring-spec.json → consumerClientInterfaces.
 * Demo-only — not a published SDK.
 */

export type HsiGradeBand = "established" | "uncertain" | "unexplored";

export type HonestyFlags = {
  notCds?: boolean;
  autoApproveIntoKg?: boolean;
  partnerSigned?: boolean;
  containsPhi?: boolean;
  /** When true with legalBinding=false, partnerSigned may be path-testing only. */
  isHypothetical?: boolean;
  legalBinding?: boolean;
  notALegalAgreement?: boolean;
  agreementKind?: string;
  productionPartnerSigned?: boolean;
  lockedPilot?: boolean;
};

export type IsiConsumeContractArtifact = {
  manifestKey: string;
  fileName: string;
  schemaHint: string;
  loadPriority:
    | "required_core"
    | "required_pilot"
    | "recommended_secondary"
    | "optional_proposal"
    | "optional_aksh";
  consumerSurfaces: string[];
  autoApproveIntoKg: false;
  notes: string;
};

export type IsiConsumeContract = HonestyFlags & {
  schemaVersion: string;
  contractVersion?: string;
  autoApproveIntoKg: false;
  notCds: true;
  partnerSigned: boolean;
  artifacts: IsiConsumeContractArtifact[];
  loadOrderHint: string[];
  grades: {
    hsiGrades: HsiGradeBand[];
    rules: string[];
  };
  gateC: {
    checklistArtifact: string;
    statusOnPublish: "pending";
    autoApprove: false;
    mayFlipHsiGradeFromChecklist: false;
  };
  vertical?: {
    activeScope: string;
    askStaysRa?: boolean;
  };
};

export type HsiWiringSpec = HonestyFlags & {
  schemaVersion: "hsi-isi-wiring-spec-1" | string;
  specVersion?: string;
  companionTo: {
    consumeContractSchema: string;
    playbook: string;
  };
  autoApproveIntoKg: false;
  notCds: true;
  immunecityEditFromThisWorkspace?: false;
  sharedEvidenceNeon?: false;
  urlPatterns: Record<string, string>;
  fetch: {
    discoveryFiles: string[];
    publishOnlyFiles?: string[];
  };
  discoveryRouteMap: Array<{
    hsiPath: string;
    tab: string | null;
    files: string[];
    immunecitySurfaceHint: string;
    notCds: true;
  }>;
  gateC: {
    autoApprove: false;
    statusOnPublish: "pending";
    approveTargetNeon: string;
  };
  acceptanceTests: Array<{ id: string; assert: string }>;
  consumerClientInterfaces?: {
    typescriptSketches?: Record<string, string>;
    referenceImplementation?: string;
  };
};

export type DiscoveryIndex = HonestyFlags & {
  schemaVersion: string;
  framing?: string;
  files: string[];
  activeScope?: string;
};

export type GateCChecklist = {
  schemaVersion?: string;
  status?: string;
  items?: unknown[];
  modelProposals?: unknown[];
  translationCandidates?: unknown[];
};
