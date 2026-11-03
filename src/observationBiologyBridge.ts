/**
 * Research-safe observation → biology bridge (Phase 8 scaffolding).
 * Accepts only de-identified / synthetic observation stubs with containsPhi=false.
 * Never emits clinical advice, live CDS, or Gate C approval.
 */
import { HSI_CDS_PHI_INVARIANTS, rejectPhiPayload, rejectLiveCdsClaim } from "./cdsPhiBoundary";

export const OBSERVATION_BIOLOGY_BRIDGE_VERSION = "hsi-observation-biology-bridge-1" as const;

export type ResearchSafeObservationStub = {
  id: string;
  label: string;
  /** De-identified or synthetic observation code — never a patient identifier. */
  observationCode: string;
  valueSummary: string;
  containsPhi: false;
  syntheticOnly: true;
  liveEmis: false;
};

export type BiologyBridgeConcept = {
  conceptId: string;
  label: string;
  relationshipHint: "related_context_only";
  support: "unassessed";
};

export type ObservationBiologyBridgeResult = {
  schemaVersion: typeof OBSERVATION_BIOLOGY_BRIDGE_VERSION;
  containsPhi: false;
  clinicalAdvice: false;
  kgWrite: false;
  notCds: true;
  scientificReview: "unreviewed";
  observationId: string;
  concepts: BiologyBridgeConcept[];
  limitations: string[];
};

export class ObservationBiologyBridgeError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const idPattern = /^[A-Za-z0-9][A-Za-z0-9:_.-]{0,127}$/;

/** Bounded RA/demo keyword map — scaffolding only, not a validated ontology binding. */
const KEYWORD_MAP: Array<{ pattern: RegExp; conceptId: string; label: string }> = [
  { pattern: /\brheumatoid|RA\b|anti-?CCP|rheumatoid factor|\bRF\b/i, conceptId: "D001", label: "Rheumatoid arthritis" },
  { pattern: /\banti-?TNF|TNF blockade|infliximab|adalimumab|etanercept/i, conceptId: "I032", label: "TNF blockade (class)" },
  { pattern: /\bTNF\b|tumou?r necrosis factor/i, conceptId: "M001", label: "TNF" },
];

export function bridgeObservationToBiology(observation: ResearchSafeObservationStub): ObservationBiologyBridgeResult {
  if (observation.containsPhi !== false || observation.syntheticOnly !== true || observation.liveEmis !== false) {
    throw new ObservationBiologyBridgeError("observation_boundary");
  }
  if (!idPattern.test(observation.id) || !observation.label.trim() || !observation.observationCode.trim()) {
    throw new ObservationBiologyBridgeError("observation_identity");
  }
  const textBlob = `${observation.label} ${observation.valueSummary} ${observation.observationCode}`;
  const phi = rejectPhiPayload({ containsPhi: false, textBlobs: [textBlob] });
  if (!phi.ok) throw new ObservationBiologyBridgeError(`phi_rejected:${phi.reasons.join(",")}`);
  const cds = rejectLiveCdsClaim({ notCds: true, textBlobs: [textBlob] });
  if (!cds.ok) throw new ObservationBiologyBridgeError(`cds_rejected:${cds.reasons.join(",")}`);

  const haystack = `${observation.label} ${observation.observationCode} ${observation.valueSummary}`;
  const concepts: BiologyBridgeConcept[] = [];
  for (const row of KEYWORD_MAP) {
    if (row.pattern.test(haystack) && !concepts.some((c) => c.conceptId === row.conceptId)) {
      concepts.push({
        conceptId: row.conceptId,
        label: row.label,
        relationshipHint: "related_context_only",
        support: "unassessed",
      });
    }
  }

  return {
    schemaVersion: OBSERVATION_BIOLOGY_BRIDGE_VERSION,
    containsPhi: false,
    clinicalAdvice: false,
    kgWrite: false,
    notCds: HSI_CDS_PHI_INVARIANTS.notCds,
    scientificReview: "unreviewed",
    observationId: observation.id,
    concepts,
    limitations: [
      "Scaffolding only: keyword hints are not validated ontology bindings or claim assessments.",
      "containsPhi must remain false; live patient observations are out of scope for this bridge.",
      "No clinical advice, dosing, eligibility, or Gate C approval is produced.",
    ],
  };
}
