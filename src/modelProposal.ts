/**
 * Model-proposal artifacts → Gate C draft rows.
 *
 * NNs/agents may emit this shape; humans decide via Gate C.
 * Never sets hsiGrade / curationReview / autoApprove.
 * See docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md + MODEL_PROPOSAL_ARTIFACT_SCHEMA.
 */
import { MODEL_PROPOSAL_ARTIFACT_SCHEMA } from "./systemsAxes";
import type { HsiTeachingStatus } from "./grades";

export const MODEL_PROPOSAL_RUNTIME_SCHEMA = "hsi-model-proposal-runtime-1" as const;

/**
 * Typed instance matching MODEL_PROPOSAL_ARTIFACT_SCHEMA.requiredFields.
 * Forbidden: hsiGrade, curationReview, autoApprove.
 */
export type ModelProposalArtifact = {
  proposalId: string;
  sourceAdapterOrAgent: string;
  proposedSubject: string;
  proposedPredicate: string;
  proposedObject: string;
  contextNote: string;
  evidenceHints: string[];
  suggestedTeachingStatus: Extract<
    HsiTeachingStatus,
    "hypothesized" | "associative" | "unknown"
  >;
  createdAt: string;
};

/** Gate C checklist row derived from a model proposal — always pending, never auto. */
export type GateCModelProposalRow = ModelProposalArtifact & {
  proposalKind: "model_draft";
  gateCStatus: "pending";
  autoApprove: false;
  autoApproveIntoKg: false;
  mayFlipEvidenceGrade: false;
  /** Explicit: proposals are not graded KG edges. */
  isGradedKgEdge: false;
  schemaRef: typeof MODEL_PROPOSAL_ARTIFACT_SCHEMA.schemaVersion;
};

const FORBIDDEN_KEYS = MODEL_PROPOSAL_ARTIFACT_SCHEMA.forbiddenFields;

/** True when an object looks like a safe proposal (no forbidden grade/auto fields). */
export function assertSafeModelProposal(
  value: Record<string, unknown>,
): { ok: true } | { ok: false; reason: string } {
  for (const key of FORBIDDEN_KEYS) {
    if (key in value) {
      return {
        ok: false,
        reason: `Forbidden field "${key}" on model proposal — may not set grades or autoApprove`,
      };
    }
  }
  if (value.mayFlipEvidenceGrade === true) {
    return { ok: false, reason: "mayFlipEvidenceGrade must not be true" };
  }
  if (value.autoApproveIntoKg === true) {
    return { ok: false, reason: "autoApproveIntoKg must not be true" };
  }
  return { ok: true };
}

/**
 * Illustrative pending proposals for Gate C wiring demos.
 * Drawn from dual-track SSc neighbourhood / vision stubs — not Gate C approved,
 * not CDS, and not invented partner evidence.
 */
export function buildExampleModelProposals(opts?: {
  createdAt?: string;
}): ModelProposalArtifact[] {
  const createdAt = opts?.createdAt ?? new Date().toISOString();
  return [
    {
      proposalId: "HSI-MP-SSC-001",
      sourceAdapterOrAgent: "hsi-stub-nn-proposer/ssc-tfh-b-il21",
      proposedSubject: "T follicular helper (Tfh) cells",
      proposedPredicate: "associated_with",
      proposedObject: "Systemic sclerosis",
      contextNote:
        "Draft restatement of dual-track SSc seed HSI-E-SSC-001 for Gate C queue demo. Human must re-check S-P-O + PMID before any ISI Neon approve.",
      evidenceHints: ["PMID:30760472", "pack:hsi-ssc-pathway-pack"],
      suggestedTeachingStatus: "associative",
      createdAt,
    },
    {
      proposalId: "HSI-MP-SSC-002",
      sourceAdapterOrAgent: "hsi-stub-nn-proposer/ssc-tfh-b-il21",
      proposedSubject: "IL-21",
      proposedPredicate: "associated_with",
      proposedObject: "joint involvement in systemic sclerosis (B-cell neighbourhood)",
      contextNote:
        "Draft from public PMID 37763102 (serum IL-21 / CD21low B / joint involvement). Suggested teaching=hypothesized — do not promote hsiGrade.",
      evidenceHints: ["PMID:37763102", "card:HSI-CARD-SSC-B", "card:HSI-CARD-SSC-IL21"],
      suggestedTeachingStatus: "hypothesized",
      createdAt,
    },
    {
      proposalId: "HSI-MP-GUT-STUB-001",
      sourceAdapterOrAgent: "hsi-stub-nn-proposer/systems-vision-gut",
      proposedSubject: "SCFA (butyrate neighbourhood)",
      proposedPredicate: "associated_with",
      proposedObject: "mucosal Treg / Th17 balance",
      contextNote:
        "Historical demo draft — P1.3 seeds now land in hsi-gut-immune-pack (HSI-E-GUT-*). Curator should prefer seeded edges over this stub; never flip hsiGrade from model output.",
      evidenceHints: [
        "pack:hsi-gut-immune-pack",
        "PMID:24226770",
        "PMID:23828891",
        "axis:gut_microbiome",
      ],
      suggestedTeachingStatus: "hypothesized",
      createdAt,
    },
    {
      proposalId: "HSI-MP-NEURO-STUB-001",
      sourceAdapterOrAgent: "hsi-stub-nn-proposer/systems-vision-neuro",
      proposedSubject: "Vagus / HPA axis stub",
      proposedPredicate: "associated_with",
      proposedObject: "peripheral inflammatory tone (hypothesized)",
      contextNote:
        "Vision-axis draft only — neuroimmune deepSeedsPresent=false. Queued for P2.1; curator must reject or seed honestly later.",
      evidenceHints: ["vision:hsi-systems-vision", "axis:neuroimmune"],
      suggestedTeachingStatus: "hypothesized",
      createdAt,
    },
  ];
}

export function toGateCModelProposalRow(
  proposal: ModelProposalArtifact,
): GateCModelProposalRow {
  const safety = assertSafeModelProposal(
    proposal as unknown as Record<string, unknown>,
  );
  if (!safety.ok) {
    throw new Error(`Refusing unsafe model proposal ${proposal.proposalId}: ${safety.reason}`);
  }
  return {
    ...proposal,
    proposalKind: "model_draft",
    gateCStatus: "pending",
    autoApprove: false,
    autoApproveIntoKg: false,
    mayFlipEvidenceGrade: false,
    isGradedKgEdge: false,
    schemaRef: MODEL_PROPOSAL_ARTIFACT_SCHEMA.schemaVersion,
  };
}

export function buildGateCModelProposalRows(opts?: {
  createdAt?: string;
}): GateCModelProposalRow[] {
  return buildExampleModelProposals(opts).map(toGateCModelProposalRow);
}
