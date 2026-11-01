/** Types + loaders for Discovery Centre static artifacts (Phase 6–8). */

export type DiscoveryIndex = {
  schemaVersion: string;
  notCds: boolean;
  clinicalActive?: boolean;
  clinicalUse?: string;
  framing: string;
  phase: string;
  generatedAt: string;
  bundleId: string;
  disease: string | null;
  researchQuestion: string | null;
  scopeLocked: boolean;
  partnerSigned: boolean;
  lockedPilot: boolean;
  files: string[];
  notes: string[];
};

export type PartnerLock = {
  schemaVersion: string;
  scopeLocked: boolean;
  partnerSigned: boolean;
  lockedPilot: boolean;
  provisionalLock: boolean;
  status: string;
  disease: { id: string; label: string; shortLabel: string } | null;
  researchQuestion: string | null;
  candidateQuestions: string[];
  partner: {
    id: string;
    label: string;
    type: string;
    region?: string;
    outreachStatus?: string;
    notes?: string;
  } | null;
  seedPathway: {
    id: string;
    label: string;
    rationale: string;
    primaryClaimIds: string[];
    primaryEdgeIds: string[];
    primaryPmids: string[];
  } | null;
  flipRequirements: string[];
  honesty: string[];
};

export type EvidenceRow = {
  claimId: string;
  edgeId: string;
  claimText: string;
  subject: string;
  relationship: string;
  object: string;
  conditionContext: string | null;
  evidenceGrade: "established" | "uncertain" | "unexplored" | string;
  reviewStatus: string;
  source: {
    pmid: string | null;
    doi?: string | null;
    citationLabel?: string | null;
    sourceUrl?: string | null;
  };
  marker?: {
    markerId: string | null;
    markerName: string | null;
    loinc: string | null;
    linkKind: string | null;
  };
  limitations?: string | null;
};

export type ExplanationSlot = {
  id: string;
  label: string;
  status: string;
  relatedClaimIds: string[];
  note: string;
};

export type ExpertItem = {
  id: string;
  kind: string;
  text: string;
  relatedClaimIds: string[];
  autoApproved: boolean;
};

export type EntitySlice = {
  diseases?: string[];
  cells?: string[];
  pathwaysOrMechanisms?: string[];
  biomarkers?: string[];
  treatments?: string[];
  studies?: string[];
  note?: string;
};

export type PilotPack = {
  schemaVersion: string;
  notCds: boolean;
  generatedAt: string;
  disease: string;
  researchQuestion: string;
  scopeLocked: boolean;
  partnerSigned: boolean;
  lockedPilot: boolean;
  substrateNote?: string;
  partnerLock?: PartnerLock;
  discoveryCentre: {
    discoveryLoop: {
      framing: string;
      steps: { id: string; label: string; order: number; desc: string }[];
    };
    illustrativeDiseaseContexts: {
      id: string;
      label: string;
      shortLabel: string;
      status: string;
      lockedPilot: boolean;
      seedHint: string;
    }[];
    gradeVocabulary: string[];
  };
  gradeDefinitions?: Record<string, string>;
  evidenceMap: EvidenceRow[];
  entitySlice: EntitySlice;
  partnerScopedEntitySlice?: EntitySlice;
  competingExplanations: ExplanationSlot[];
  uncertainties: ExplanationSlot[];
  expertShortlist: ExpertItem[];
  summary: {
    evidenceMapRows: number;
    partnerScopedEvidenceRows?: number;
    claimsWithLoinc?: number;
    gradeCounts?: Record<string, number>;
  };
};

export type GapReport = {
  schemaVersion: string;
  generatedAt: string;
  summary: {
    seedEdges: number;
    gradeCounts: Record<string, number>;
    claimsMappedToIsi: number;
    loinc?: { claimsWithLoincMarker: number };
  };
  gaps: {
    claimId: string;
    edgeId: string;
    assertion: string;
    domain: string;
    hsiGrade: string;
    missing: string[];
  }[];
  nextActions: string[];
};

export type R2ValidationStatus =
  | "untested"
  | "supported"
  | "refuted"
  | "gap";

export type R2LiteratureTest = {
  id: string;
  kind: string;
  prompt: string;
  relatedClaimIds: string[];
  relatedPmids: string[];
  notClinicalProtocol: boolean;
};

export type R2HypothesisCard = {
  id: string;
  label: string;
  sourceExplanationId: string;
  validationStatus: R2ValidationStatus | string;
  statusRationale: string;
  relatedClaimIds: string[];
  relatedEdgeIds: string[];
  groundingPmids: string[];
  literatureTests: R2LiteratureTest[];
  autoApproved: boolean;
};

export type R2RankedGap = {
  id: string;
  rank: number;
  priority: "high" | "medium" | "low" | string;
  title: string;
  why: string;
  nextExperimentPrompt: string;
  relatedClaimIds: string[];
  relatedPmids: string[];
  source: string;
};

export type R2Validation = {
  schemaVersion: string;
  phase: string;
  targetRelease: string;
  notCds: boolean;
  framing: string;
  generatedAt: string;
  disease: string;
  researchQuestion: string;
  hypothesisCards: R2HypothesisCard[];
  rankedGaps: R2RankedGap[];
  summary: {
    hypothesisCards: number;
    byStatus: Record<string, number>;
    rankedGaps: number;
    literatureTests: number;
    groundingPmidCount: number;
  };
  boundary: string[];
  nextActions: string[];
};

export type TranslationCandidate = {
  id: string;
  claimId: string;
  edgeId: string;
  assertion: string;
  spoNote: string;
  teachingStatus: string;
  hsiGrade: string;
  curationReview: string;
  cdsSurfacable: boolean;
  akshNodeId: string | null;
  clinicLabel: string | null;
  markerId: string | null;
  markerName: string | null;
  loinc: string | null;
  pmid: string | null;
  hitlRequired: boolean;
  autoApprove: boolean;
  status: string;
  clinicalUse: string;
  intendedConsumer: string;
  requiredClinicianAction: {
    label: string;
    rationale: string;
  };
  axesNote: string;
};

export type TranslationHandoff = {
  schemaVersion: string;
  phase: string;
  targetReleases: string[];
  notCds: boolean;
  clinicalActive: boolean;
  clinicalUse: string;
  intendedConsumer: string;
  akenoProductIntegration: string;
  akenoConsumerPath?: string;
  framing: string;
  generatedAt: string;
  disease: string;
  researchQuestion: string;
  candidates: TranslationCandidate[];
  summary: {
    candidates: number;
    withAkshNodeId: number;
    withLoinc: number;
    withPmid: number;
    hitlRequired: number;
    cdsSurfacableCount: number;
    deferredUntilHitl: number;
    notForClinicalUse: number;
  };
  boundary: string[];
  nextActions: string[];
  whatRemainsOutsideHsiCore: string[];
};

export type SystemsSecondaryAxis = {
  id: string;
  label: string;
  status: string;
  deepSeedsPresent: boolean;
  packFile: string;
  seedHint: string;
};

export type GutImmunePackSummary = {
  schemaVersion: string;
  notCds: boolean;
  deepSeedsPresent: boolean;
  discoveryRole?: string;
  pathway: {
    id: string;
    label: string;
    primaryPmids?: string[];
  };
  evidenceMap: {
    edgeId: string;
    subject: string;
    predicate: string;
    object: string;
    evidenceGrade: string;
    teachingStatus: string;
    pmid: string | null;
  }[];
  competingExplanations: ExplanationSlot[];
  honesty: string[];
};

/** Same shape as gut pack — systems secondary neuroimmune slice. */
export type NeuroImmunePackSummary = GutImmunePackSummary;

export type DiscoveryBundle = {
  index: DiscoveryIndex;
  lock: PartnerLock;
  pack: PilotPack;
  gap: GapReport;
  r2: R2Validation;
  translation: TranslationHandoff;
  /** Optional systems secondary axis pack (gut–immune); never replaces RA ASK. */
  gutImmune: GutImmunePackSummary | null;
  /** Optional systems secondary axis pack (neuroimmune); never replaces RA ASK. */
  neuroImmune: NeuroImmunePackSummary | null;
};

const BASE = "/discovery";

async function fetchJson<T>(name: string): Promise<T> {
  const res = await fetch(`${BASE}/${name}`);
  if (!res.ok) {
    throw new Error(`Failed to load ${name} (${res.status})`);
  }
  return (await res.json()) as T;
}

export async function loadDiscoveryBundle(): Promise<DiscoveryBundle> {
  const [index, lock, pack, gap, r2, translation, gutImmune, neuroImmune] =
    await Promise.all([
      fetchJson<DiscoveryIndex>("index.json"),
      fetchJson<PartnerLock>("hsi-partner-lock.json"),
      fetchJson<PilotPack>("hsi-pilot-evidence-pack.json"),
      fetchJson<GapReport>("hsi-gap-report.json"),
      fetchJson<R2Validation>("hsi-r2-validation.json"),
      fetchJson<TranslationHandoff>("hsi-translation-handoff.json"),
      fetchJson<GutImmunePackSummary>("hsi-gut-immune-pack.json").catch(
        () => null,
      ),
      fetchJson<NeuroImmunePackSummary>("hsi-neuroimmune-pack.json").catch(
        () => null,
      ),
    ]);
  return { index, lock, pack, gap, r2, translation, gutImmune, neuroImmune };
}

/** Prefer pathway claim IDs from the partner lock; fall back to RA/TNF heuristics. */
export function partnerScopedEvidence(
  pack: PilotPack,
  lock?: PartnerLock,
): EvidenceRow[] {
  const focus = new Set(
    lock?.seedPathway?.primaryClaimIds ??
      pack.partnerLock?.seedPathway?.primaryClaimIds ??
      [],
  );
  if (focus.size > 0) {
    const scoped = pack.evidenceMap.filter((r) => focus.has(r.claimId));
    if (scoped.length > 0) return scoped;
  }
  return pack.evidenceMap.filter(
    (r) =>
      r.claimId.includes("-RA-") ||
      /anti-?tnf|rheumatoid|acpa|\bADA\b|anti-CCP/i.test(r.claimText),
  );
}

export function gradeCounts(rows: EvidenceRow[]): Record<string, number> {
  const out: Record<string, number> = {
    established: 0,
    uncertain: 0,
    unexplored: 0,
  };
  for (const r of rows) {
    const g = r.evidenceGrade || "uncertain";
    out[g] = (out[g] ?? 0) + 1;
  }
  return out;
}
