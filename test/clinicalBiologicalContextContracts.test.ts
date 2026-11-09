/**
 * Milestone 15 PR2 — clinical and biological context integration honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  KNOWLEDGE_LAYER_KINDS,
  buildClinicalBiologicalContextPack,
  createMemoryClinicalBiologicalContextStore,
  draftAuthorisedResearchContextResolution,
  draftBiologicalKnowledgeRetrieval,
  draftClinicalBiologicalConceptMapping,
  draftDataQualityAssessment,
  draftIntegratedDiseaseContext,
  draftMissingMeasurementIdentification,
  draftPermittedClinicalObservationRetrieval,
  draftSupportedRelationshipRecord,
  draftTemporalObservationAlignment,
  draftUnsupportedUncertainMappingPreservation,
  fingerprintIntegratedDiseaseContext,
  projectClinicalBiologicalContextPersistenceLines,
  transitionIntegratedDiseaseContext,
  type AuthorisedResearchContextResolution,
} from "../src/clinicalBiologicalContextContracts";

const asOf = "2026-11-09T23:00:00.000Z";

function seedResolvedContext(
  overrides?: Partial<
    Parameters<typeof draftAuthorisedResearchContextResolution>[0]
  >,
): AuthorisedResearchContextResolution {
  return draftAuthorisedResearchContextResolution({
    id: "hsi-cbc-res-ssc-fixture",
    diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
    displayName: "Fixture SSc clinical↔biology research context resolution",
    resolutionStatus: "resolved_fixture",
    rweStudyId: "hsi-rwe-study-fixture-demo",
    longitudinalAnalysisSpecId: "hsi-lce-spec-lab-trend-fixture",
    authoredByPrincipalId: "agent-hsi-cbc-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    ...overrides,
  });
}

function seedBlockedContext(): AuthorisedResearchContextResolution {
  return draftAuthorisedResearchContextResolution({
    id: "hsi-cbc-res-blocked-demo",
    diseaseContextId: "hsi-hdi-ctx-blocked-demo",
    displayName: "Blocked clinical↔biology context until authorised dataset",
    resolutionStatus: "blocked_no_authorised_dataset",
    authoredByPrincipalId: "agent-hsi-cbc-1",
    createdAt: asOf,
  });
}

describe("clinical biological context contracts (M15 PR2)", () => {
  test("resolves authorised research context composing HDI + M14 ids", () => {
    expect(KNOWLEDGE_LAYER_KINDS).toContain("patient_observation");
    expect(KNOWLEDGE_LAYER_KINDS).toContain("population_association");
    expect(KNOWLEDGE_LAYER_KINDS).toContain("established_mechanism");
    expect(KNOWLEDGE_LAYER_KINDS).toContain("computational_inference");
    expect(KNOWLEDGE_LAYER_KINDS).toContain("unvalidated_hypothesis");

    const resolved = seedResolvedContext();
    expect(resolved.authorised).toBe(true);
    expect(resolved.containsIdentifiablePhi).toBe(false);
    expect(resolved.honesty.populationAssociationIsNotIndividualInference).toBe(
      true,
    );
    expect(
      resolved.honesty.restrictedPatientObservationsMustNotPromoteToPublicGraph,
    ).toBe(true);
    expect(resolved.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(resolved.rweStudyId).toBe("hsi-rwe-study-fixture-demo");
    expect(resolved.longitudinalAnalysisSpecId).toBe(
      "hsi-lce-spec-lab-trend-fixture",
    );
    expect(resolved.diseaseContextId).toBe("hsi-hdi-ctx-ssc-fixture");

    const denied = draftAuthorisedResearchContextResolution({
      id: "hsi-cbc-res-denied-demo",
      diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
      displayName: "Denied research context without authorisation",
      resolutionStatus: "denied_no_authorisation",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    expect(denied.authorised).toBe(false);
    expect(denied.denyReason).toMatch(/not resolved/i);
  });

  test("retrieves permitted clinical observations and public biology without PHI promotion", () => {
    const context = seedResolvedContext();
    const clinical = draftPermittedClinicalObservationRetrieval({
      id: "hsi-cbc-clr-crp-fixture",
      researchContext: context,
      retrievalScope: "fixture_longitudinal",
      clinicalConcept: "Fixture CRP laboratory concept",
      subjectOrCohortRef: "pseudo-subj-cbc-demo",
      observedAt: "2024-03-10T12:00:00.000Z",
      hdiObservationId: "hsi-hdi-obs-crp-demo",
      rweObservationId: "hsi-rwe-obs-fixture-demo",
      longitudinalSeriesId: "hsi-lce-ser-lab-fixture",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    expect(clinical.permitted).toBe(true);
    expect(clinical.knowledgeLayer).toBe("patient_observation");
    expect(clinical.graphPromotable).toBe(false);
    expect(clinical.containsIdentifiablePhi).toBe(false);

    const biology = draftBiologicalKnowledgeRetrieval({
      id: "hsi-cbc-bio-il6-fixture",
      researchContext: context,
      retrievalScope: "public_biomedical_fixture",
      biologicalConcept: "Fixture IL6 signalling public concept",
      knowledgeLayer: "established_mechanism",
      publicGraphNodeId: "bio:il6-signalling-fixture",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    expect(biology.permitted).toBe(true);
    expect(biology.visibility).toBe("public_biomedical");
    expect(biology.patientContextLayerExcluded).toBe(true);
    expect(biology.liveGraphQueryOperational).toBe(false);

    expect(() =>
      draftPermittedClinicalObservationRetrieval({
        id: "hsi-cbc-clr-restricted-promote",
        researchContext: context,
        retrievalScope: "restricted_not_retrieved",
        clinicalConcept: "Restricted patient observation",
        subjectOrCohortRef: "pseudo-subj-restricted",
        restrictedPatientObservation: true,
        promoteToPublicGraph: true,
        authoredByPrincipalId: "agent-hsi-cbc-1",
        createdAt: asOf,
      }),
    ).toThrow(/must not promote to public graph/);

    const blockedBiology = draftBiologicalKnowledgeRetrieval({
      id: "hsi-cbc-bio-patient-layer-blocked",
      researchContext: context,
      retrievalScope: "blocked_patient_context_layer",
      biologicalConcept: "Blocked patient-context layer concept",
      knowledgeLayer: "unvalidated_hypothesis",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    expect(blockedBiology.permitted).toBe(false);
  });

  test("maps concepts with layer distinctions; fail-closed on population→individual", () => {
    const context = seedResolvedContext();
    const clinical = draftPermittedClinicalObservationRetrieval({
      id: "hsi-cbc-clr-map-src",
      researchContext: context,
      retrievalScope: "fixture_longitudinal",
      clinicalConcept: "Fixture skin-score observation",
      subjectOrCohortRef: "pseudo-subj-cbc-map",
      observedAt: "2024-04-01T09:00:00.000Z",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const population = draftBiologicalKnowledgeRetrieval({
      id: "hsi-cbc-bio-pop-assoc",
      researchContext: context,
      retrievalScope: "public_biomedical_fixture",
      biologicalConcept: "Fixture population association concept",
      knowledgeLayer: "population_association",
      publicGraphNodeId: "bio:pop-assoc-fixture",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });

    const supported = draftClinicalBiologicalConceptMapping({
      id: "hsi-cbc-map-supported-1",
      researchContext: context,
      clinicalObservation: clinical,
      biologicalKnowledge: population,
      mappingOutcome: "supported",
      mappingConfidence: "low",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    expect(supported.clinicalKnowledgeLayer).toBe("patient_observation");
    expect(supported.biologicalKnowledgeLayer).toBe("population_association");
    expect(supported.populationAssociationPromotedToIndividualInference).toBe(
      false,
    );
    expect(supported.restrictedObservationPromotedToPublicGraph).toBe(false);

    expect(() =>
      draftClinicalBiologicalConceptMapping({
        id: "hsi-cbc-map-illegal-individual",
        researchContext: context,
        clinicalObservation: clinical,
        biologicalKnowledge: population,
        mappingOutcome: "supported",
        mappingConfidence: "moderate",
        claimedIndividualInference: true,
        authoredByPrincipalId: "agent-hsi-cbc-1",
        createdAt: asOf,
      }),
    ).toThrow(/population association must not become individual inference/i);

    const uncertainBio = draftBiologicalKnowledgeRetrieval({
      id: "hsi-cbc-bio-hyp-fixture",
      researchContext: context,
      retrievalScope: "public_biomedical_fixture",
      biologicalConcept: "Fixture unvalidated hypothesis concept",
      knowledgeLayer: "unvalidated_hypothesis",
      publicGraphNodeId: "bio:hyp-fixture",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const uncertain = draftClinicalBiologicalConceptMapping({
      id: "hsi-cbc-map-uncertain-1",
      researchContext: context,
      clinicalObservation: clinical,
      biologicalKnowledge: uncertainBio,
      mappingOutcome: "uncertain",
      mappingConfidence: "insufficient",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const preserved = draftUnsupportedUncertainMappingPreservation({
      id: "hsi-cbc-unc-hyp-1",
      researchContext: context,
      conceptMapping: uncertain,
      preservationReason:
        "Uncertain mapping preserved for review — not discarded or invented as support.",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    expect(preserved.discarded).toBe(false);
    expect(preserved.inventedSupport).toBeNull();
    expect(preserved.mappingOutcome).toBe("uncertain");
  });

  test("aligns temporal observations, assesses quality, and records missing measurements", () => {
    const context = seedResolvedContext();
    const obsA = draftPermittedClinicalObservationRetrieval({
      id: "hsi-cbc-clr-tmp-a",
      researchContext: context,
      retrievalScope: "fixture_longitudinal",
      clinicalConcept: "Fixture CRP at t0",
      subjectOrCohortRef: "pseudo-subj-cbc-tmp",
      observedAt: "2024-01-15T10:00:00.000Z",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const obsB = draftPermittedClinicalObservationRetrieval({
      id: "hsi-cbc-clr-tmp-b",
      researchContext: context,
      retrievalScope: "fixture_longitudinal",
      clinicalConcept: "Fixture CRP at t1",
      subjectOrCohortRef: "pseudo-subj-cbc-tmp",
      observedAt: "2024-02-15T10:00:00.000Z",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const alignment = draftTemporalObservationAlignment({
      id: "hsi-cbc-tmp-crp-window",
      researchContext: context,
      clinicalObservations: [obsA, obsB],
      alignmentRule:
        "Fixture calendar-month alignment of longitudinal CRP observations",
      alignedWindowStart: "2024-01-01T00:00:00.000Z",
      alignedWindowEnd: "2024-02-29T23:59:59.000Z",
      interopTemporalAlignmentId: "hsi-scdi-tmp-fixture-demo",
      longitudinalSeriesId: "hsi-lce-ser-lab-fixture",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    expect(alignment.liveAlignmentOperational).toBe(false);
    expect(alignment.fabricatedTimeline).toBeNull();
    expect(alignment.clinicalObservationRetrievalIds).toHaveLength(2);

    const quality = draftDataQualityAssessment({
      id: "hsi-cbc-qlt-fixture-1",
      researchContext: context,
      checksPerformed: [
        "timestamp_present",
        "concept_code_declared",
        "missingness_declared",
      ],
      qualityOrdinal: "adequate_for_fixture_engineering",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    expect(quality.fabricatedResults).toBeNull();

    const missing = draftMissingMeasurementIdentification({
      id: "hsi-cbc-mis-fvc-gap",
      researchContext: context,
      missingConcept: "Fixture FVC measurement",
      missingnessKind: "measurement_absent",
      rationale:
        "FVC not present in permitted longitudinal retrieval window — gap recorded without inventing a value.",
      relatedClinicalObservationRetrievalId: obsA.id,
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    expect(missing.inventedMeasurementValue).toBeNull();
  });

  test("records supported relationships and refuses collapsing unsupported into support", () => {
    const context = seedResolvedContext();
    const clinical = draftPermittedClinicalObservationRetrieval({
      id: "hsi-cbc-clr-rel-src",
      researchContext: context,
      retrievalScope: "fixture_longitudinal",
      clinicalConcept: "Fixture autoantibody observation",
      subjectOrCohortRef: "pseudo-subj-cbc-rel",
      observedAt: "2024-05-01T11:00:00.000Z",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const mechanism = draftBiologicalKnowledgeRetrieval({
      id: "hsi-cbc-bio-mech",
      researchContext: context,
      retrievalScope: "public_biomedical_fixture",
      biologicalConcept: "Fixture fibroblast activation mechanism",
      knowledgeLayer: "established_mechanism",
      publicGraphNodeId: "bio:fibroblast-activation-fixture",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const mapping = draftClinicalBiologicalConceptMapping({
      id: "hsi-cbc-map-rel-supported",
      researchContext: context,
      clinicalObservation: clinical,
      biologicalKnowledge: mechanism,
      mappingOutcome: "supported",
      mappingConfidence: "moderate",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const supported = draftSupportedRelationshipRecord({
      id: "hsi-cbc-rel-autoab-fibroblast",
      researchContext: context,
      conceptMapping: mapping,
      relationshipSummary:
        "Fixture supported research relationship between autoantibody observation and public fibroblast mechanism — population association is not individual inference.",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    expect(supported.mappingOutcome).toBe("supported");
    expect(supported.graphPromotable).toBe(false);
    expect(supported.knowledgeLayer).toBe("established_mechanism");

    const unsupportedMap = draftClinicalBiologicalConceptMapping({
      id: "hsi-cbc-map-rel-unsupported",
      researchContext: context,
      clinicalObservation: clinical,
      biologicalKnowledge: mechanism,
      mappingOutcome: "unsupported",
      mappingConfidence: "insufficient",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    expect(() =>
      draftSupportedRelationshipRecord({
        id: "hsi-cbc-rel-illegal-from-unsupported",
        researchContext: context,
        conceptMapping: unsupportedMap,
        relationshipSummary: "Should fail",
        authoredByPrincipalId: "agent-hsi-cbc-1",
        createdAt: asOf,
      }),
    ).toThrow(/requires supported mappingOutcome/);
  });

  test("produces versioned integrated disease context with human review gates", () => {
    const blocked = seedBlockedContext();
    const blockedIntegrated = draftIntegratedDiseaseContext({
      id: "hsi-cbc-idc-blocked-demo",
      displayName: "Blocked integrated disease context",
      researchContext: blocked,
      clinicalObservations: [],
      biologicalKnowledge: [],
      conceptMappings: [],
      temporalAlignments: [],
      qualityAssessments: [],
      missingMeasurements: [],
      supportedRelationships: [],
      unsupportedUncertainMappings: [],
      contextVersion: "0.1.0",
      limitations: [
        "Blocked awaiting authorised research dataset — not scientific validation.",
        "Population association is not individual inference.",
      ],
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    expect(blockedIntegrated.lifecycle).toBe(
      "blocked_awaiting_authorised_dataset",
    );
    expect(blockedIntegrated.liveTwinOperational).toBe(false);
    expect(blockedIntegrated.graphPromotable).toBe(false);
    expect(() =>
      transitionIntegratedDiseaseContext({
        context: blockedIntegrated,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "human-reviewer-1", actorKind: "human"},
      }),
    ).toThrow(/Invalid integrated disease context transition|cannot be accepted/);

    const context = seedResolvedContext();
    const clinical = draftPermittedClinicalObservationRetrieval({
      id: "hsi-cbc-clr-idc-1",
      researchContext: context,
      retrievalScope: "fixture_longitudinal",
      clinicalConcept: "Fixture CRP laboratory concept",
      subjectOrCohortRef: "pseudo-subj-cbc-idc",
      observedAt: "2024-03-10T12:00:00.000Z",
      hdiObservationId: "hsi-hdi-obs-crp-demo",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const biology = draftBiologicalKnowledgeRetrieval({
      id: "hsi-cbc-bio-idc-1",
      researchContext: context,
      retrievalScope: "public_biomedical_fixture",
      biologicalConcept: "Fixture IL6 public concept",
      knowledgeLayer: "computational_inference",
      publicGraphNodeId: "bio:il6-fixture",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const mapping = draftClinicalBiologicalConceptMapping({
      id: "hsi-cbc-map-idc-1",
      researchContext: context,
      clinicalObservation: clinical,
      biologicalKnowledge: biology,
      mappingOutcome: "supported",
      mappingConfidence: "low",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const alignment = draftTemporalObservationAlignment({
      id: "hsi-cbc-tmp-idc-1",
      researchContext: context,
      clinicalObservations: [clinical],
      alignmentRule: "Fixture single-point temporal envelope",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const quality = draftDataQualityAssessment({
      id: "hsi-cbc-qlt-idc-1",
      researchContext: context,
      checksPerformed: ["fixture_completeness"],
      qualityOrdinal: "adequate_for_fixture_engineering",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const missing = draftMissingMeasurementIdentification({
      id: "hsi-cbc-mis-idc-1",
      researchContext: context,
      missingConcept: "Fixture missing DLCO",
      missingnessKind: "measurement_absent",
      rationale: "DLCO absent in fixture window — recorded without invention.",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const supported = draftSupportedRelationshipRecord({
      id: "hsi-cbc-rel-idc-1",
      researchContext: context,
      conceptMapping: mapping,
      relationshipSummary:
        "Fixture supported CRP↔IL6 research relationship under declared limitations.",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });

    const draft = draftIntegratedDiseaseContext({
      id: "hsi-cbc-idc-ssc-fixture",
      displayName: "Fixture integrated SSc clinical↔biology disease context",
      researchContext: context,
      clinicalObservations: [clinical],
      biologicalKnowledge: [biology],
      conceptMappings: [mapping],
      temporalAlignments: [alignment],
      qualityAssessments: [quality],
      missingMeasurements: [missing],
      supportedRelationships: [supported],
      unsupportedUncertainMappings: [],
      contextVersion: "0.1.0",
      limitations: [
        "Fixture integrated context only — not a diagnosis.",
        "Not a live twin product; research envelopes only.",
        "Restricted patient observations stay outside the public biomedical graph.",
        "Population association is not individual inference.",
      ],
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    expect(draft.lifecycle).toBe("draft");
    expect(draft.contextVersion).toBe("0.1.0");
    expect(fingerprintIntegratedDiseaseContext(draft)).toMatch(/^[a-f0-9]{64}$/);

    const underReview = transitionIntegratedDiseaseContext({
      context: draft,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-cbc-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionIntegratedDiseaseContext({
        context: underReview,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-cbc-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Human review required/);

    const accepted = transitionIntegratedDiseaseContext({
      context: underReview,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "human-reviewer-1", actorKind: "human"},
    });
    expect(accepted.lifecycle).toBe("accepted_with_limitations");
    expect(accepted.reviewedBy?.actorKind).toBe("human");
  });

  test("memory store round-trips and persistence lines stay honest", () => {
    const context = seedResolvedContext();
    const clinical = draftPermittedClinicalObservationRetrieval({
      id: "hsi-cbc-clr-store-1",
      researchContext: context,
      retrievalScope: "fixture_longitudinal",
      clinicalConcept: "Fixture store CRP",
      subjectOrCohortRef: "pseudo-subj-cbc-store",
      observedAt: "2024-03-10T12:00:00.000Z",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const biology = draftBiologicalKnowledgeRetrieval({
      id: "hsi-cbc-bio-store-1",
      researchContext: context,
      retrievalScope: "public_biomedical_fixture",
      biologicalConcept: "Fixture store biology",
      knowledgeLayer: "established_mechanism",
      publicGraphNodeId: "bio:store-fixture",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const mapping = draftClinicalBiologicalConceptMapping({
      id: "hsi-cbc-map-store-1",
      researchContext: context,
      clinicalObservation: clinical,
      biologicalKnowledge: biology,
      mappingOutcome: "supported",
      mappingConfidence: "low",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const alignment = draftTemporalObservationAlignment({
      id: "hsi-cbc-tmp-store-1",
      researchContext: context,
      clinicalObservations: [clinical],
      alignmentRule: "Fixture store alignment",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const quality = draftDataQualityAssessment({
      id: "hsi-cbc-qlt-store-1",
      researchContext: context,
      checksPerformed: ["store_round_trip"],
      qualityOrdinal: "adequate_for_fixture_engineering",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const missing = draftMissingMeasurementIdentification({
      id: "hsi-cbc-mis-store-1",
      researchContext: context,
      missingConcept: "Fixture missing store concept",
      missingnessKind: "temporal_gap",
      rationale: "Temporal gap recorded for store honesty.",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const supported = draftSupportedRelationshipRecord({
      id: "hsi-cbc-rel-store-1",
      researchContext: context,
      conceptMapping: mapping,
      relationshipSummary:
        "Fixture supported store relationship under research limitations.",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const uncertainBio = draftBiologicalKnowledgeRetrieval({
      id: "hsi-cbc-bio-store-unc",
      researchContext: context,
      retrievalScope: "public_biomedical_fixture",
      biologicalConcept: "Fixture uncertain biology",
      knowledgeLayer: "unvalidated_hypothesis",
      publicGraphNodeId: "bio:unc-fixture",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const uncertainMap = draftClinicalBiologicalConceptMapping({
      id: "hsi-cbc-map-store-unc",
      researchContext: context,
      clinicalObservation: clinical,
      biologicalKnowledge: uncertainBio,
      mappingOutcome: "uncertain",
      mappingConfidence: "insufficient",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const preserved = draftUnsupportedUncertainMappingPreservation({
      id: "hsi-cbc-unc-store-1",
      researchContext: context,
      conceptMapping: uncertainMap,
      preservationReason: "Uncertain mapping preserved in store.",
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });
    const integrated = draftIntegratedDiseaseContext({
      id: "hsi-cbc-idc-store-1",
      displayName: "Fixture store integrated disease context",
      researchContext: context,
      clinicalObservations: [clinical],
      biologicalKnowledge: [biology, uncertainBio],
      conceptMappings: [mapping, uncertainMap],
      temporalAlignments: [alignment],
      qualityAssessments: [quality],
      missingMeasurements: [missing],
      supportedRelationships: [supported],
      unsupportedUncertainMappings: [preserved],
      contextVersion: "0.1.0",
      limitations: [
        "Fixture store integrated context — research decision support only.",
        "Population association is not individual inference.",
      ],
      authoredByPrincipalId: "agent-hsi-cbc-1",
      createdAt: asOf,
    });

    const store = createMemoryClinicalBiologicalContextStore();
    store.upsertResearchContextResolution(context);
    store.upsertClinicalObservationRetrieval(clinical);
    store.upsertBiologicalKnowledgeRetrieval(biology);
    store.upsertBiologicalKnowledgeRetrieval(uncertainBio);
    store.upsertConceptMapping(mapping);
    store.upsertConceptMapping(uncertainMap);
    store.upsertTemporalAlignment(alignment);
    store.upsertQualityAssessment(quality);
    store.upsertMissingMeasurement(missing);
    store.upsertSupportedRelationship(supported);
    store.upsertUnsupportedUncertainMapping(preserved);
    store.upsertIntegratedDiseaseContext(integrated);

    expect(store.listResearchContextResolutions()).toHaveLength(1);
    expect(
      store.listClinicalObservationRetrievals(context.diseaseContextId),
    ).toHaveLength(1);
    expect(
      store.listBiologicalKnowledgeRetrievals(context.diseaseContextId),
    ).toHaveLength(2);
    expect(store.listConceptMappings(context.diseaseContextId)).toHaveLength(2);
    expect(store.listIntegratedDiseaseContexts(context.diseaseContextId)).toHaveLength(
      1,
    );

    const lines = projectClinicalBiologicalContextPersistenceLines({
      researchContextResolutions: [context],
      clinicalObservationRetrievals: [clinical],
      biologicalKnowledgeRetrievals: [biology, uncertainBio],
      conceptMappings: [mapping, uncertainMap],
      temporalAlignments: [alignment],
      qualityAssessments: [quality],
      missingMeasurements: [missing],
      supportedRelationships: [supported],
      unsupportedUncertainMappings: [preserved],
      integratedDiseaseContexts: [integrated],
    });
    expect(lines).toContain(
      "populationAssociationIsNotIndividualInference=true",
    );
    expect(lines).toContain(
      "restrictedPatientObservationsMustNotPromoteToPublicGraph=true",
    );
    expect(lines).toContain("graphPromotable=false");
    expect(lines).toContain("neon=red-wave-only");

    const pack = buildClinicalBiologicalContextPack({
      researchContextResolutions: [context],
      clinicalObservationRetrievals: [clinical],
      biologicalKnowledgeRetrievals: [biology, uncertainBio],
      conceptMappings: [mapping, uncertainMap],
      temporalAlignments: [alignment],
      qualityAssessments: [quality],
      missingMeasurements: [missing],
      supportedRelationships: [supported],
      unsupportedUncertainMappings: [preserved],
      integratedDiseaseContexts: [integrated],
      asOf,
    });
    expect(pack.integratedDiseaseContextCount).toBe(1);
    expect(pack.honesty.noLiveTwinOrMultiscaleClaim).toBe(true);
    expect(pack.honesty.knowledgeLayersMustNotCollapse).toBe(true);
  });
});
