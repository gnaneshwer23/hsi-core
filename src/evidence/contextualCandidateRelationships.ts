/**
 * PR 4 — Contextual candidate relationships (biological context + finding polarity).
 *
 * Extends existing graph / living-evidence / dynamic-persistence contracts.
 * Does NOT create a parallel graph stack, invent mechanistic conclusions from
 * bibliographic-only metadata, or auto-promote into the approved release graph.
 *
 * Axes stay orthogonal: curationReview · hsiGrade · teachingStatus
 * (never collapsed into a model confidence score).
 */
import {createHash} from "node:crypto";
import type {HsiCurationReview, HsiGrade, HsiTeachingStatus} from "../grades";
import type {OpenTargetsDiseaseRecord} from "./openTargetsLookup";
import {OPEN_TARGETS_PROVIDER} from "./openTargetsLookup";
import type {LivingEvidenceGraphRelationshipCandidate} from "./livingEvidenceExpansion";
import type {DynamicPersistencePlan, DynamicCandidateSource} from "./dynamicEvidencePersistence";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";

export const CONTEXTUAL_CANDIDATE_SCHEMA = "hsi-contextual-candidate-relationship-1" as const;
export const CONTEXTUAL_CANDIDATE_METHOD = "hsi.contextual_candidate_relationships.v1" as const;
export const CONTEXTUAL_CANDIDATE_VERSION = "0.1.0" as const;

export type FindingPolarity = "supporting" | "opposing" | "uncertain";

export type ContextualSurfaceLabel = "candidate" | "draft" | "fixture";

export type LimitationClass =
  | "metadata_only"
  | "claim_support_not_assessed"
  | "rights_uncleared"
  | "opposing_search_incomplete"
  | "bibliographic_not_mechanistic"
  | "association_index_not_claim"
  | "independent_corroboration_unverified"
  | "human_review_required";

/** Biological context retained on every candidate relationship when data exists. */
export type CandidateBiologicalContext = {
  diseasePhenotype: readonly {system: string; value: string; label: string | null}[];
  organTissueCellState: readonly {system: string; value: string; label: string | null}[];
  genesProteinsPathways: readonly {system: string; value: string; label: string | null}[];
  experimentalSystemsSpecies: readonly {system: string; value: string; label: string | null}[];
  interventionsTargets: readonly {system: string; value: string; label: string | null}[];
};

export type ContextualCandidateAxes = {
  curationReview: Extract<HsiCurationReview, "draft">;
  hsiGrade: Extract<HsiGrade, "unexplored">;
  teachingStatus: Extract<HsiTeachingStatus, "unknown">;
};

export type ContextualCandidateRelationship = {
  schemaVersion: typeof CONTEXTUAL_CANDIDATE_SCHEMA;
  id: string;
  kind:
    | "disease_associated_target_metadata"
    | "declared_contextual_association"
    | "bibliographic_context_anchor";
  subject: {system: string; value: string; label: string | null};
  predicate: string;
  object: {system: string; value: string; label: string | null};
  findingPolarity: FindingPolarity;
  biologicalContext: CandidateBiologicalContext;
  evidenceSourceIds: readonly string[];
  sourceProvider: string;
  responseIdentity: string | null;
  version: typeof CONTEXTUAL_CANDIDATE_VERSION;
  reviewState: "draft";
  surfaceLabel: ContextualSurfaceLabel;
  axes: ContextualCandidateAxes;
  claimSupport: false;
  scientificApproval: false;
  graphPromotable: false;
  needsHumanReview: true;
  limitations: readonly LimitationClass[];
  associationScore: number | null;
  note: string;
};

export type OpposingEvidenceSearchStatus =
  | "not_executed"
  | "stubbed_incomplete"
  | "recorded_traces_only";

export type ContextualCandidatePack = {
  schemaVersion: "hsi-contextual-candidate-pack-1";
  method: typeof CONTEXTUAL_CANDIDATE_METHOD;
  searchRecordId: string | null;
  version: typeof CONTEXTUAL_CANDIDATE_VERSION;
  generatedAt: string;
  relationships: ContextualCandidateRelationship[];
  opposingEvidenceSearch: {
    status: OpposingEvidenceSearchStatus;
    recordedOpposingCount: number;
    consensusEstablished: false;
    note: string;
  };
  honesty: {
    metadataOnly: true;
    claimSupportNotAssessed: true;
    sourceIdentityDistinctFromClaimSupport: true;
    bibliographicDoesNotInventMechanism: true;
    axesPreservedOrthogonal: true;
    noModelConfidenceScore: true;
    scientificApproval: false;
    graphPromotable: false;
    gateCAutoApprove: false;
    autoPromotedToApprovedGraph: false;
    draftsRequireExplicitLabel: true;
    cdsPhi: false;
    fixturesAreNotLiveEvidence: true;
  };
};

/** Researcher / curator-declared context — never inferred from title heuristics alone. */
export type DeclaredBiologicalContext = {
  diseasePhenotype?: readonly {system: string; value: string; label?: string | null}[];
  organTissueCellState?: readonly {system: string; value: string; label?: string | null}[];
  genesProteinsPathways?: readonly {system: string; value: string; label?: string | null}[];
  experimentalSystemsSpecies?: readonly {system: string; value: string; label?: string | null}[];
  interventionsTargets?: readonly {system: string; value: string; label?: string | null}[];
};

export type DeclaredContextualAssociation = {
  id?: string;
  subject: {system: string; value: string; label?: string | null};
  predicate: string;
  object: {system: string; value: string; label?: string | null};
  findingPolarity: FindingPolarity;
  evidenceSourceIds: readonly string[];
  context?: DeclaredBiologicalContext;
  note?: string;
};

const DRAFT_AXES: ContextualCandidateAxes = {
  curationReview: "draft",
  hsiGrade: "unexplored",
  teachingStatus: "unknown",
};

const EMPTY_CONTEXT: CandidateBiologicalContext = {
  diseasePhenotype: [],
  organTissueCellState: [],
  genesProteinsPathways: [],
  experimentalSystemsSpecies: [],
  interventionsTargets: [],
};

function fail(message: string): never {
  throw new Error(message);
}

function relId(parts: Record<string, unknown>): string {
  return `cand-rel:${createHash("sha256").update(canonicalEvidenceJson(parts)).digest("hex").slice(0, 32)}`;
}

function normaliseDeclaredContext(input?: DeclaredBiologicalContext): CandidateBiologicalContext {
  if (!input) return {...EMPTY_CONTEXT};
  const map = (
    rows: readonly {system: string; value: string; label?: string | null}[] | undefined,
  ): {system: string; value: string; label: string | null}[] =>
    (rows ?? [])
      .filter((r) => r.system.trim() && r.value.trim())
      .slice(0, 40)
      .map((r) => ({system: r.system.trim(), value: r.value.trim(), label: r.label ?? null}));
  return {
    diseasePhenotype: map(input.diseasePhenotype),
    organTissueCellState: map(input.organTissueCellState),
    genesProteinsPathways: map(input.genesProteinsPathways),
    experimentalSystemsSpecies: map(input.experimentalSystemsSpecies),
    interventionsTargets: map(input.interventionsTargets),
  };
}

function baseLimitations(extra: LimitationClass[] = []): LimitationClass[] {
  const set = new Set<LimitationClass>([
    "metadata_only",
    "claim_support_not_assessed",
    "rights_uncleared",
    "opposing_search_incomplete",
    "human_review_required",
    ...extra,
  ]);
  return [...set];
}

function assertDraftHonesty(rel: ContextualCandidateRelationship): void {
  if (rel.reviewState !== "draft") fail("Candidate relationship must remain draft");
  if (rel.scientificApproval !== false || rel.graphPromotable !== false || rel.claimSupport !== false) {
    fail("Candidate relationship approval / promotion / claim-support refused");
  }
  if (rel.axes.curationReview !== "draft" || rel.axes.hsiGrade !== "unexplored") {
    fail("Candidate axes must remain draft / unexplored");
  }
  if (rel.axes.teachingStatus !== "unknown") fail("Candidate teachingStatus must remain unknown");
  if (!["candidate", "draft", "fixture"].includes(rel.surfaceLabel)) {
    fail("Candidate surface label required");
  }
}

function fromOpenTargetsRecord(
  record: OpenTargetsDiseaseRecord,
  evidenceSourceId: string,
  surfaceLabel: ContextualSurfaceLabel,
): ContextualCandidateRelationship[] {
  if (record.scientificApproval !== false || record.graphPromotable !== false) {
    fail("Open Targets record must stay unapproved / non-promotable");
  }
  const mondo = record.diseaseId.replace("_", ":");
  const out: ContextualCandidateRelationship[] = [];
  for (const assoc of record.associations) {
    const subject = {system: "MONDO", value: mondo, label: record.diseaseName};
    const object = {
      system: "Ensembl",
      value: assoc.targetEnsemblId,
      label: assoc.approvedSymbol,
    };
    const biologicalContext: CandidateBiologicalContext = {
      diseasePhenotype: [subject],
      organTissueCellState: [],
      genesProteinsPathways: [object],
      experimentalSystemsSpecies: [],
      interventionsTargets: [object],
    };
    const rel: ContextualCandidateRelationship = {
      schemaVersion: CONTEXTUAL_CANDIDATE_SCHEMA,
      id: relId({
        kind: "disease_associated_target_metadata",
        diseaseId: record.diseaseId,
        target: assoc.targetEnsemblId,
        response: record.responseIdentity,
      }),
      kind: "disease_associated_target_metadata",
      subject,
      predicate: "associated_with_target_metadata",
      object,
      findingPolarity: "uncertain",
      biologicalContext,
      evidenceSourceIds: [evidenceSourceId],
      sourceProvider: OPEN_TARGETS_PROVIDER,
      responseIdentity: record.responseIdentity,
      version: CONTEXTUAL_CANDIDATE_VERSION,
      reviewState: "draft",
      surfaceLabel,
      axes: {...DRAFT_AXES},
      claimSupport: false,
      scientificApproval: false,
      graphPromotable: false,
      needsHumanReview: true,
      limitations: baseLimitations([
        "association_index_not_claim",
        "independent_corroboration_unverified",
      ]),
      associationScore: assoc.score,
      note:
        "Open Targets association index metadata only. Score is not claim support, mechanistic proof, or approved graph edge.",
    };
    assertDraftHonesty(rel);
    out.push(rel);
  }
  return out;
}

function fromLivingEvidenceCandidate(
  c: LivingEvidenceGraphRelationshipCandidate,
  surfaceLabel: ContextualSurfaceLabel,
): ContextualCandidateRelationship {
  if (c.graphPromotable || c.scientificApproval || c.claimSupport) {
    fail("Living-evidence graph candidate honesty violated");
  }
  const biologicalContext: CandidateBiologicalContext = {
    diseasePhenotype: [c.subject],
    organTissueCellState: [],
    genesProteinsPathways: [c.object],
    experimentalSystemsSpecies: [],
    interventionsTargets: [c.object],
  };
  const rel: ContextualCandidateRelationship = {
    schemaVersion: CONTEXTUAL_CANDIDATE_SCHEMA,
    id: relId({kind: c.kind, id: c.id, response: c.responseIdentity}),
    kind: "disease_associated_target_metadata",
    subject: c.subject,
    predicate: "associated_with_target_metadata",
    object: c.object,
    findingPolarity: "uncertain",
    biologicalContext,
    evidenceSourceIds: [`open_targets:disease:${c.sourceDiseaseId}`],
    sourceProvider: c.sourceProvider,
    responseIdentity: c.responseIdentity,
    version: CONTEXTUAL_CANDIDATE_VERSION,
    reviewState: "draft",
    surfaceLabel,
    axes: {...DRAFT_AXES},
    claimSupport: false,
    scientificApproval: false,
    graphPromotable: false,
    needsHumanReview: true,
    limitations: baseLimitations([
      "association_index_not_claim",
      "independent_corroboration_unverified",
    ]),
    associationScore: c.score,
    note:
      "Living-evidence disease→target metadata candidate. Not an approved graph relationship.",
  };
  assertDraftHonesty(rel);
  return rel;
}

function bibliographicAnchors(
  candidates: readonly DynamicCandidateSource[],
  declaredContext: CandidateBiologicalContext,
  surfaceLabel: ContextualSurfaceLabel,
): ContextualCandidateRelationship[] {
  const pubs = candidates.filter((c) => c.sourceKind === "publication" && c.pmid);
  if (pubs.length === 0) return [];
  const hasAnyContext =
    declaredContext.diseasePhenotype.length > 0 ||
    declaredContext.organTissueCellState.length > 0 ||
    declaredContext.genesProteinsPathways.length > 0 ||
    declaredContext.experimentalSystemsSpecies.length > 0 ||
    declaredContext.interventionsTargets.length > 0;
  if (!hasAnyContext) {
    // Bibliographic-only metadata must not invent mechanistic edges.
    return [];
  }
  return pubs.slice(0, 25).map((c) => {
    const subject =
      declaredContext.diseasePhenotype[0] ??
      declaredContext.genesProteinsPathways[0] ?? {
        system: "PMID",
        value: c.pmid!,
        label: c.title,
      };
    const object =
      declaredContext.interventionsTargets[0] ??
      declaredContext.genesProteinsPathways[0] ??
      declaredContext.organTissueCellState[0] ??
      subject;
    const rel: ContextualCandidateRelationship = {
      schemaVersion: CONTEXTUAL_CANDIDATE_SCHEMA,
      id: relId({kind: "bibliographic_context_anchor", sourceId: c.id, pmid: c.pmid}),
      kind: "bibliographic_context_anchor",
      subject,
      predicate: "bibliographic_context_for",
      object,
      findingPolarity: "uncertain",
      biologicalContext: declaredContext,
      evidenceSourceIds: [c.id],
      sourceProvider: c.provider,
      responseIdentity: c.responseIdentity,
      version: CONTEXTUAL_CANDIDATE_VERSION,
      reviewState: "draft",
      surfaceLabel,
      axes: {...DRAFT_AXES},
      claimSupport: false,
      scientificApproval: false,
      graphPromotable: false,
      needsHumanReview: true,
      limitations: baseLimitations(["bibliographic_not_mechanistic"]),
      associationScore: null,
      note:
        "Bibliographic metadata bound to declared biological context only. Title/DOI alone never invent mechanism.",
    };
    assertDraftHonesty(rel);
    return rel;
  });
}

function fromDeclaredAssociations(
  rows: readonly DeclaredContextualAssociation[],
  surfaceLabel: ContextualSurfaceLabel,
): ContextualCandidateRelationship[] {
  return rows.map((row) => {
    if (!row.subject.system.trim() || !row.subject.value.trim()) fail("Declared association subject required");
    if (!row.object.system.trim() || !row.object.value.trim()) fail("Declared association object required");
    if (!row.predicate.trim()) fail("Declared association predicate required");
    if (!row.evidenceSourceIds.length) fail("Declared association requires evidence source ids");
    if (!["supporting", "opposing", "uncertain"].includes(row.findingPolarity)) {
      fail("Invalid finding polarity");
    }
    const biologicalContext = normaliseDeclaredContext(row.context);
    const rel: ContextualCandidateRelationship = {
      schemaVersion: CONTEXTUAL_CANDIDATE_SCHEMA,
      id:
        row.id?.trim() ||
        relId({
          kind: "declared_contextual_association",
          subject: row.subject,
          object: row.object,
          predicate: row.predicate,
          sources: row.evidenceSourceIds,
        }),
      kind: "declared_contextual_association",
      subject: {
        system: row.subject.system.trim(),
        value: row.subject.value.trim(),
        label: row.subject.label ?? null,
      },
      predicate: row.predicate.trim(),
      object: {
        system: row.object.system.trim(),
        value: row.object.value.trim(),
        label: row.object.label ?? null,
      },
      findingPolarity: row.findingPolarity,
      biologicalContext,
      evidenceSourceIds: [...row.evidenceSourceIds],
      sourceProvider: "declared_context",
      responseIdentity: null,
      version: CONTEXTUAL_CANDIDATE_VERSION,
      reviewState: "draft",
      surfaceLabel,
      axes: {...DRAFT_AXES},
      claimSupport: false,
      scientificApproval: false,
      graphPromotable: false,
      needsHumanReview: true,
      limitations: baseLimitations(
        row.findingPolarity === "opposing" ? [] : ["opposing_search_incomplete"],
      ),
      associationScore: null,
      note:
        row.note?.trim() ||
        "Declared contextual association retained as draft candidate. Not approved graph release.",
    };
    assertDraftHonesty(rel);
    return rel;
  });
}

/**
 * Build contextual candidate relationships from persisted dynamic evidence +
 * optional Open Targets / living-evidence / declared context inputs.
 */
export function buildContextualCandidatePack(input: {
  plan?: DynamicPersistencePlan;
  openTargetsRecords?: readonly OpenTargetsDiseaseRecord[];
  livingEvidenceCandidates?: readonly LivingEvidenceGraphRelationshipCandidate[];
  declaredAssociations?: readonly DeclaredContextualAssociation[];
  declaredContext?: DeclaredBiologicalContext;
  surfaceLabel?: ContextualSurfaceLabel;
  generatedAt?: string;
  opposingSearchStatus?: OpposingEvidenceSearchStatus;
}): ContextualCandidatePack {
  const surfaceLabel = input.surfaceLabel ?? "candidate";
  if (input.plan) {
    if (input.plan.honesty.graphPromotable !== false || input.plan.honesty.scientificApproval !== false) {
      fail("Persistence plan must remain non-promotable / unapproved");
    }
    if (input.plan.honesty.claimSupport !== "not_assessed") {
      fail("Persistence plan fabricated claim support");
    }
  }

  const declaredContext = normaliseDeclaredContext(input.declaredContext);
  const relationships: ContextualCandidateRelationship[] = [];

  if (input.openTargetsRecords) {
    for (const record of input.openTargetsRecords) {
      const sourceId = `open_targets:disease:${record.diseaseId}`;
      relationships.push(...fromOpenTargetsRecord(record, sourceId, surfaceLabel));
    }
  }

  if (input.livingEvidenceCandidates) {
    for (const c of input.livingEvidenceCandidates) {
      relationships.push(fromLivingEvidenceCandidate(c, surfaceLabel));
    }
  }

  if (input.declaredAssociations) {
    relationships.push(...fromDeclaredAssociations(input.declaredAssociations, surfaceLabel));
  }

  if (input.plan) {
    relationships.push(
      ...bibliographicAnchors(input.plan.candidates, declaredContext, surfaceLabel),
    );
  }

  const recordedOpposing = relationships.filter((r) => r.findingPolarity === "opposing").length;
  const opposingStatus = input.opposingSearchStatus ?? "stubbed_incomplete";

  for (const rel of relationships) assertDraftHonesty(rel);

  return {
    schemaVersion: "hsi-contextual-candidate-pack-1",
    method: CONTEXTUAL_CANDIDATE_METHOD,
    searchRecordId: input.plan?.searchRecordId ?? null,
    version: CONTEXTUAL_CANDIDATE_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    relationships,
    opposingEvidenceSearch: {
      status: opposingStatus,
      recordedOpposingCount: recordedOpposing,
      consensusEstablished: false,
      note:
        opposingStatus === "not_executed"
          ? "Opposing-evidence search was not executed. Absence of oppose rows is not consensus."
          : opposingStatus === "recorded_traces_only"
            ? "Only recorded opposing traces are present; exhaustive contradiction search is not claimed."
            : "Opposing-evidence search workflow is stubbed incomplete in this PR. Incomplete oppose ≠ consensus.",
    },
    honesty: {
      metadataOnly: true,
      claimSupportNotAssessed: true,
      sourceIdentityDistinctFromClaimSupport: true,
      bibliographicDoesNotInventMechanism: true,
      axesPreservedOrthogonal: true,
      noModelConfidenceScore: true,
      scientificApproval: false,
      graphPromotable: false,
      gateCAutoApprove: false,
      autoPromotedToApprovedGraph: false,
      draftsRequireExplicitLabel: true,
      cdsPhi: false,
      fixturesAreNotLiveEvidence: true,
    },
  };
}

/** Refuse any attempt to treat a contextual candidate as an approved graph edge. */
export function assertNotApprovedGraphRelationship(
  rel: ContextualCandidateRelationship,
): asserts rel is ContextualCandidateRelationship {
  assertDraftHonesty(rel);
  if (rel.surfaceLabel === "fixture") {
    // Fixture remains explicitly labelled; still not approved.
    return;
  }
  if (rel.reviewState === ("approved" as string)) {
    fail("Contextual candidate cannot present as approved graph relationship");
  }
}

/**
 * Auto-promotion is forbidden. Even mutating source ids / adding citations
 * cannot flip a candidate into the approved graph path.
 */
export function refuseAutoPromoteContextualCandidate(
  rel: ContextualCandidateRelationship,
  attemptedMutation?: {
    replacementSourceId?: string;
    additionalCitationIds?: readonly string[];
  },
): {promoted: false; reasons: string[]} {
  assertDraftHonesty(rel);
  const reasons = [
    "auto_promotion_forbidden",
    "missing_authenticated_human_review",
    "missing_release_assessment",
    "candidate_graphPromotable_false",
  ];
  if (attemptedMutation?.replacementSourceId) {
    reasons.push("source_identity_mutation_does_not_grant_approval");
  }
  if (attemptedMutation?.additionalCitationIds?.length) {
    reasons.push("additional_citations_do_not_bypass_approval");
  }
  return {promoted: false, reasons};
}
