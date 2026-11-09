/**
 * Milestone 16 PR3 — cross-scale biological relationships honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  CSBR_BIOLOGICAL_SCALES,
  CSBR_CAPABILITY_KINDS,
  CSBR_EVIDENCE_MODES,
  buildCrossScaleBiologicalRelationshipsPack,
  createMemoryCrossScaleBiologicalRelationshipsStore,
  crossesToOrganOrDiseaseOutcome,
  draftAlternativeExplanationRecord,
  draftBiologicalUncertaintyRecord,
  draftContextDependentRelationshipRecord,
  draftCrossScaleDirectionalityRecord,
  draftCrossScaleEntityMappingRecord,
  draftCrossScaleRelationshipProfile,
  draftMechanismProvenanceRecord,
  draftPhysiologyGraphScope,
  draftTemporalRelationshipRecord,
  fingerprintCrossScaleRelationshipProfile,
  projectCrossScaleBiologicalRelationshipsPersistenceLines,
  scaleDistance,
  transitionCrossScaleRelationshipProfile,
  type PhysiologyGraphScope,
} from "../src/crossScaleBiologicalRelationshipsContracts";

const asOf = "2026-11-09T16:00:00.000Z";

const molecularEntity = {
  id: "hsi-csbr-ent-il6-fixture",
  label: "Fixture IL6 molecular association",
  scale: "molecular" as const,
  ontologySystem: "ontology:gene",
  ontologyValue: "IL6-FIXTURE",
  note: "",
};

const tissueEntity = {
  id: "hsi-csbr-ent-synovium-fixture",
  label: "Fixture synovial tissue state",
  scale: "tissue" as const,
  ontologySystem: "ontology:tissue",
  ontologyValue: "SYNOVIUM-FIXTURE",
  note: "",
};

const organEntity = {
  id: "hsi-csbr-ent-joint-fixture",
  label: "Fixture joint organ phenotype association",
  scale: "organ" as const,
  ontologySystem: "ontology:organ",
  ontologyValue: "JOINT-FIXTURE",
  note: "",
};

const diseaseOutcomeEntity = {
  id: "hsi-csbr-ent-outcome-fixture",
  label: "Fixture disease outcome association",
  scale: "disease_outcome" as const,
  ontologySystem: "ontology:outcome",
  ontologyValue: "OUTCOME-FIXTURE",
  note: "",
};

function seedScope(
  overrides?: Partial<Parameters<typeof draftPhysiologyGraphScope>[0]>,
): PhysiologyGraphScope {
  return draftPhysiologyGraphScope({
    id: "hsi-csbr-scp-physio-fixture",
    displayName: "Fixture physiology graph cross-scale scope",
    scientificQuestion:
      "Which fixture cross-scale associations can be reviewed without claiming organ outcomes from molecular edges or converting all edges into causal links?",
    coveredScales: [
      "molecular",
      "cellular",
      "tissue",
      "organ",
      "organ_system",
      "clinical_phenotype",
      "disease_outcome",
    ],
    diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
    optionalCsolSpecId: "hsi-csol-spec-ssc-fixture",
    optionalHsysOrganSystemRelationshipId: "hsi-hsys-osr-immune-vascular",
    optionalCdmiComparativeProfileId: "hsi-cdmi-cmp-ssc-ra-fixture",
    datasetAvailability: "fixture_only",
    authoredByPrincipalId: "agent-hsi-csbr-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    ...overrides,
  });
}

function seedBlockedScope(): PhysiologyGraphScope {
  return draftPhysiologyGraphScope({
    id: "hsi-csbr-scp-blocked-demo",
    displayName: "Blocked physiology scope until authorised dataset",
    scientificQuestion:
      "Blocked scientific path until an authorised research dataset is supplied.",
    coveredScales: ["molecular", "organ", "disease_outcome"],
    datasetAvailability: "blocked_no_authorised_clinical_dataset",
    authoredByPrincipalId: "agent-hsi-csbr-1",
    createdAt: asOf,
  });
}

describe("cross-scale biological relationships contracts (M16 PR3)", () => {
  test("covers physiology scales and composes CSOL / HSI / CDMI refs", () => {
    expect(CSBR_BIOLOGICAL_SCALES).toEqual([
      "molecular",
      "cellular",
      "tissue",
      "organ",
      "organ_system",
      "clinical_phenotype",
      "disease_outcome",
    ]);
    expect(CSBR_CAPABILITY_KINDS).toContain("cross_scale_entity_mapping");
    expect(CSBR_CAPABILITY_KINDS).toContain("mechanism_provenance");
    expect(CSBR_CAPABILITY_KINDS).toContain("context_dependent_relationship");
    expect(CSBR_CAPABILITY_KINDS).toContain("directionality");
    expect(CSBR_CAPABILITY_KINDS).toContain("temporal_relationship");
    expect(CSBR_CAPABILITY_KINDS).toContain("biological_uncertainty");
    expect(CSBR_CAPABILITY_KINDS).toContain(
      "alternative_explanation_detection",
    );
    expect(CSBR_EVIDENCE_MODES).toContain("direct_mechanistic_evidence");
    expect(CSBR_EVIDENCE_MODES).toContain("indirect_inference");

    const scope = seedScope();
    expect(scope.coveredScales).toHaveLength(7);
    expect(scope.optionalCsolSpecId).toBe("hsi-csol-spec-ssc-fixture");
    expect(scope.optionalHsysOrganSystemRelationshipId).toBe(
      "hsi-hsys-osr-immune-vascular",
    );
    expect(scope.optionalCdmiComparativeProfileId).toBe(
      "hsi-cdmi-cmp-ssc-ra-fixture",
    );
    expect(scope.wholeBodyPhysiologyClaimed).toBe(false);
    expect(scope.honesty.graphEdgeIsNotCausalLink).toBe(true);
    expect(scope.honesty.neonProjectPolicy).toBe("red-wave-only");

    expect(crossesToOrganOrDiseaseOutcome("molecular", "organ")).toBe(true);
    expect(crossesToOrganOrDiseaseOutcome("molecular", "disease_outcome")).toBe(
      true,
    );
    expect(crossesToOrganOrDiseaseOutcome("molecular", "tissue")).toBe(false);
    expect(scaleDistance("molecular", "disease_outcome")).toBe(6);

    expect(() =>
      draftPhysiologyGraphScope({
        id: "hsi-csbr-scp-single-bad",
        displayName: "Single scale masquerade",
        scientificQuestion: "Only one scale",
        coveredScales: ["molecular"],
        authoredByPrincipalId: "agent-hsi-csbr-1",
        createdAt: asOf,
      }),
    ).toThrow(/At least 2 coveredScales/);

    expect(() =>
      draftPhysiologyGraphScope({
        id: "hsi-csbr-scp-whole-body-bad",
        displayName: "Illegal whole-body claim",
        scientificQuestion: "Should fail closed",
        coveredScales: ["molecular", "organ"],
        authoredByPrincipalId: "agent-hsi-csbr-1",
        createdAt: asOf,
        claimWholeBodyPhysiology: true,
      }),
    ).toThrow(/whole-body physiology/);
  });

  test("maps entities across scales and refuses molecular→organ outcome without intermediates", () => {
    const scope = seedScope();
    const adjacent = draftCrossScaleEntityMappingRecord({
      id: "hsi-csbr-map-mol-tissue",
      scope,
      sourceEntity: molecularEntity,
      targetEntity: tissueEntity,
      mappingOutcome: "supported",
      edgeKind: "association_edge",
      evidenceMode: "association_only",
      relationshipSummary:
        "Fixture molecular→tissue association — not an organ causal claim.",
      optionalCsolMappingId: "hsi-csol-map-il6-synovium",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    expect(adjacent.intermediateStatus).toBe(
      "not_applicable_adjacent_or_same_band",
    );
    expect(adjacent.graphEdgeIsCausalLink).toBe(false);
    expect(adjacent.molecularAssociationImpliesOrganOrDiseaseOutcome).toBe(
      false,
    );

    expect(() =>
      draftCrossScaleEntityMappingRecord({
        id: "hsi-csbr-map-mol-organ-bad",
        scope,
        sourceEntity: molecularEntity,
        targetEntity: organEntity,
        mappingOutcome: "supported",
        edgeKind: "association_edge",
        evidenceMode: "association_only",
        intermediateStatus: "intermediates_missing",
        relationshipSummary: "Should fail when claiming organ outcome",
        authoredByPrincipalId: "agent-hsi-csbr-1",
        createdAt: asOf,
        claimOrganOrDiseaseOutcome: true,
      }),
    ).toThrow(/validated intermediate/);

    expect(() =>
      draftCrossScaleEntityMappingRecord({
        id: "hsi-csbr-map-mol-outcome-direct-bad",
        scope,
        sourceEntity: molecularEntity,
        targetEntity: diseaseOutcomeEntity,
        mappingOutcome: "supported",
        edgeKind: "mechanistic_edge_declared",
        evidenceMode: "direct_mechanistic_evidence",
        intermediateStatus: "blocked_no_validated_intermediates",
        relationshipSummary: "Should fail without validated intermediates",
        authoredByPrincipalId: "agent-hsi-csbr-1",
        createdAt: asOf,
      }),
    ).toThrow(/validated intermediates/);

    const withIntermediates = draftCrossScaleEntityMappingRecord({
      id: "hsi-csbr-map-mol-organ-ok",
      scope,
      sourceEntity: molecularEntity,
      targetEntity: organEntity,
      mappingOutcome: "supported",
      edgeKind: "mechanistic_edge_declared",
      evidenceMode: "direct_mechanistic_evidence",
      intermediateStatus: "intermediates_validated_declared",
      relationshipSummary:
        "Fixture molecular→organ mapping with declared validated tissue/cellular intermediates — still not whole-body physiology.",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    expect(withIntermediates.intermediateStatus).toBe(
      "intermediates_validated_declared",
    );
    expect(withIntermediates.graphEdgeIsCausalLink).toBe(false);

    expect(() =>
      draftCrossScaleEntityMappingRecord({
        id: "hsi-csbr-map-all-causal-bad",
        scope,
        sourceEntity: molecularEntity,
        targetEntity: tissueEntity,
        mappingOutcome: "supported",
        edgeKind: "association_edge",
        evidenceMode: "association_only",
        relationshipSummary: "Should fail when claiming all edges causal",
        authoredByPrincipalId: "agent-hsi-csbr-1",
        createdAt: asOf,
        claimAllEdgesCausal: true,
      }),
    ).toThrow(/causal links/);
  });

  test("distinguishes direct mechanistic evidence from indirect inference in provenance", () => {
    const scope = seedScope();
    const mapping = draftCrossScaleEntityMappingRecord({
      id: "hsi-csbr-map-prov-base",
      scope,
      sourceEntity: molecularEntity,
      targetEntity: tissueEntity,
      mappingOutcome: "supported",
      edgeKind: "association_edge",
      evidenceMode: "indirect_inference",
      relationshipSummary:
        "Fixture indirect inference mapping for provenance honesty.",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });

    const provenance = draftMechanismProvenanceRecord({
      id: "hsi-csbr-prv-indirect-1",
      scope,
      mapping,
      provenanceKind: "fixture_declared",
      evidenceMode: "indirect_inference",
      provenanceSummary:
        "Fixture provenance records indirect inference — not upgraded to direct mechanistic evidence.",
      evidenceRef: "fixture:provenance:indirect:1",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    expect(
      provenance.directMechanisticEvidenceDistinctFromIndirectInference,
    ).toBe(true);
    expect(provenance.evidenceMode).toBe("indirect_inference");

    expect(() =>
      draftMechanismProvenanceRecord({
        id: "hsi-csbr-prv-upgrade-bad",
        scope,
        mapping,
        provenanceKind: "fixture_declared",
        evidenceMode: "direct_mechanistic_evidence",
        provenanceSummary: "Illegal upgrade of evidence mode",
        evidenceRef: "fixture:provenance:bad",
        authoredByPrincipalId: "agent-hsi-csbr-1",
        createdAt: asOf,
      }),
    ).toThrow(/cannot upgrade mapping evidenceMode/);

    expect(() =>
      draftMechanismProvenanceRecord({
        id: "hsi-csbr-prv-collapse-bad",
        scope,
        mapping,
        provenanceKind: "fixture_declared",
        evidenceMode: "indirect_inference",
        provenanceSummary: "Collapse attempt",
        evidenceRef: "fixture:provenance:collapse",
        authoredByPrincipalId: "agent-hsi-csbr-1",
        createdAt: asOf,
        claimDirectWhenIndirect: true,
      }),
    ).toThrow(/must not be collapsed into direct/);

    const cdmiProv = draftMechanismProvenanceRecord({
      id: "hsi-csbr-prv-cdmi-1",
      scope,
      mapping,
      provenanceKind: "cdmi_mechanism_ref",
      evidenceMode: "association_only",
      provenanceSummary:
        "Fixture composition with CDMI approved mechanism ref.",
      evidenceRef: "fixture:provenance:cdmi:1",
      optionalCdmiMechanismId: "hsi-cdmi-mech-il6-ssc",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    expect(cdmiProv.optionalCdmiMechanismId).toBe("hsi-cdmi-mech-il6-ssc");
  });

  test("models context-dependent relationships, directionality, and temporal edges without causal collapse", () => {
    const scope = seedScope();
    const mapping = draftCrossScaleEntityMappingRecord({
      id: "hsi-csbr-map-ctx-base",
      scope,
      sourceEntity: molecularEntity,
      targetEntity: tissueEntity,
      mappingOutcome: "supported",
      edgeKind: "association_edge",
      evidenceMode: "association_only",
      relationshipSummary: "Fixture mapping for context/direction/temporal.",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });

    const context = draftContextDependentRelationshipRecord({
      id: "hsi-csbr-ctx-synovium",
      scope,
      mapping,
      contextSummary:
        "Fixture relationship holds in synovial tissue context and may not transfer to blood.",
      contextLabel: "synovial tissue fixture context",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    expect(context.contextDependent).toBe(true);
    expect(context.edgeKind).toBe("context_dependent_edge");

    const direction = draftCrossScaleDirectionalityRecord({
      id: "hsi-csbr-dir-forward-1",
      scope,
      mapping,
      directionalityOrdinal: "forward_association_declared",
      evaluationSummary:
        "Fixture forward association declared — not proven causation.",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    expect(direction.causalDirectionProven).toBe(false);
    expect(direction.graphEdgeIsCausalLink).toBe(false);

    expect(() =>
      draftCrossScaleDirectionalityRecord({
        id: "hsi-csbr-dir-causal-bad",
        scope,
        mapping,
        directionalityOrdinal: "forward_association_declared",
        evaluationSummary: "Should fail",
        authoredByPrincipalId: "agent-hsi-csbr-1",
        createdAt: asOf,
        claimCausalDirectionProven: true,
      }),
    ).toThrow(/causal direction proven/);

    const temporal = draftTemporalRelationshipRecord({
      id: "hsi-csbr-tmp-precedes-1",
      scope,
      mapping,
      temporalKind: "precedes_declared",
      temporalSummary:
        "Fixture temporal precedence declared — temporal does not imply causal.",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    expect(temporal.temporalImpliesCausal).toBe(false);

    expect(() =>
      draftTemporalRelationshipRecord({
        id: "hsi-csbr-tmp-causal-bad",
        scope,
        mapping,
        temporalKind: "precedes_declared",
        temporalSummary: "Should fail",
        authoredByPrincipalId: "agent-hsi-csbr-1",
        createdAt: asOf,
        claimTemporalImpliesCausal: true,
      }),
    ).toThrow(/must not imply causal/);
  });

  test("records biological uncertainty and alternative explanation detection", () => {
    const scope = seedScope();
    const mapping = draftCrossScaleEntityMappingRecord({
      id: "hsi-csbr-map-unc-base",
      scope,
      sourceEntity: molecularEntity,
      targetEntity: organEntity,
      mappingOutcome: "uncertain",
      edgeKind: "uncertain_edge",
      evidenceMode: "indirect_inference",
      intermediateStatus: "intermediates_uncertain",
      relationshipSummary:
        "Fixture uncertain molecular→organ association pending intermediates.",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });

    const uncertainty = draftBiologicalUncertaintyRecord({
      id: "hsi-csbr-unc-high-1",
      scope,
      mapping,
      uncertaintyOrdinal: "high_declared",
      uncertaintySummary:
        "Fixture high biological uncertainty — organ outcome not inferred.",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    expect(uncertainty.uncertaintyOrdinal).toBe("high_declared");

    const alternative = draftAlternativeExplanationRecord({
      id: "hsi-csbr-alt-competing-1",
      scope,
      mapping,
      alternativeStatus: "competing_explanations_declared",
      alternativeSummary:
        "Fixture competing explanation via tissue inflammation confounder — primary not collapsed.",
      alternativeLabel: "tissue inflammation confounder fixture",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    expect(alternative.alternativeStatus).toBe(
      "competing_explanations_declared",
    );
    expect(alternative.primaryExplanationCollapsed).toBe(false);

    expect(() =>
      draftAlternativeExplanationRecord({
        id: "hsi-csbr-alt-collapse-bad",
        scope,
        mapping,
        alternativeStatus: "alternative_detected_declared",
        alternativeSummary: "Should fail",
        alternativeLabel: "other explanation",
        authoredByPrincipalId: "agent-hsi-csbr-1",
        createdAt: asOf,
        collapsePrimaryExplanation: true,
      }),
    ).toThrow(/must not collapse the primary explanation/);
  });

  test("produces reviewable profile with human acceptance and intermediate blockers", () => {
    const blockedScope = seedBlockedScope();
    const blockedProfile = draftCrossScaleRelationshipProfile({
      id: "hsi-csbr-prf-blocked-demo",
      displayName: "Blocked cross-scale relationship profile",
      scope: blockedScope,
      entityMappings: [],
      mechanismProvenances: [],
      contextDependentRelationships: [],
      directionalities: [],
      temporalRelationships: [],
      biologicalUncertainties: [],
      alternativeExplanations: [],
      profileVersion: "0.1.0",
      limitations: [
        "Blocked awaiting authorised research dataset — not scientific validation.",
        "Molecular association is not an organ or disease outcome.",
        "Graph edges are not causal links.",
      ],
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    expect(blockedProfile.lifecycle).toBe(
      "blocked_awaiting_authorised_dataset",
    );

    const scope = seedScope();
    const missingIntermediates = draftCrossScaleEntityMappingRecord({
      id: "hsi-csbr-map-missing-int",
      scope,
      sourceEntity: molecularEntity,
      targetEntity: diseaseOutcomeEntity,
      mappingOutcome: "uncertain",
      edgeKind: "association_edge",
      evidenceMode: "association_only",
      intermediateStatus: "blocked_no_validated_intermediates",
      relationshipSummary:
        "Fixture molecular→disease_outcome association blocked without validated intermediates.",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    const missingProfile = draftCrossScaleRelationshipProfile({
      id: "hsi-csbr-prf-missing-int",
      displayName: "Profile blocked for missing intermediates",
      scope,
      entityMappings: [missingIntermediates],
      mechanismProvenances: [],
      contextDependentRelationships: [],
      directionalities: [],
      temporalRelationships: [],
      biologicalUncertainties: [],
      alternativeExplanations: [],
      profileVersion: "0.1.0",
      limitations: [
        "Organ/disease-outcome inference blocked without validated intermediates.",
        "Fixtures are not scientific validation.",
        "Graph edges are not causal links.",
      ],
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    expect(missingProfile.lifecycle).toBe(
      "blocked_missing_validated_intermediates",
    );
    expect(() =>
      transitionCrossScaleRelationshipProfile({
        profile: missingProfile,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "human-reviewer-1", actorKind: "human"},
      }),
    ).toThrow(
      /Invalid cross-scale relationship profile transition|human reviewer/,
    );

    const mapping = draftCrossScaleEntityMappingRecord({
      id: "hsi-csbr-map-profile-ok",
      scope,
      sourceEntity: molecularEntity,
      targetEntity: tissueEntity,
      mappingOutcome: "supported",
      edgeKind: "association_edge",
      evidenceMode: "association_only",
      relationshipSummary: "Fixture mapping for accepted profile path.",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    const provenance = draftMechanismProvenanceRecord({
      id: "hsi-csbr-prv-profile-1",
      scope,
      mapping,
      provenanceKind: "csol_provenance_ref",
      evidenceMode: "association_only",
      provenanceSummary: "Fixture CSOL provenance composition.",
      evidenceRef: "fixture:provenance:profile:1",
      optionalCsolProvenanceId: "hsi-csol-prv-il6-fixture",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    const context = draftContextDependentRelationshipRecord({
      id: "hsi-csbr-ctx-profile-1",
      scope,
      mapping,
      contextSummary: "Fixture context-dependent qualifier for profile.",
      contextLabel: "synovial fixture context",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    const direction = draftCrossScaleDirectionalityRecord({
      id: "hsi-csbr-dir-profile-1",
      scope,
      mapping,
      directionalityOrdinal: "context_dependent_direction_declared",
      evaluationSummary: "Fixture context-dependent directionality.",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    const temporal = draftTemporalRelationshipRecord({
      id: "hsi-csbr-tmp-profile-1",
      scope,
      mapping,
      temporalKind: "cross_sectional_declared",
      temporalSummary: "Fixture cross-sectional temporal context.",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    const uncertainty = draftBiologicalUncertaintyRecord({
      id: "hsi-csbr-unc-profile-1",
      scope,
      mapping,
      uncertaintyOrdinal: "moderate_declared",
      uncertaintySummary: "Fixture moderate biological uncertainty.",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    const alternative = draftAlternativeExplanationRecord({
      id: "hsi-csbr-alt-profile-1",
      scope,
      mapping,
      alternativeStatus: "alternative_detected_declared",
      alternativeSummary: "Fixture alternative explanation retained.",
      alternativeLabel: "alternate tissue pathway fixture",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });

    let profile = draftCrossScaleRelationshipProfile({
      id: "hsi-csbr-prf-reviewable",
      displayName: "Reviewable cross-scale relationship profile",
      scope,
      entityMappings: [mapping],
      mechanismProvenances: [provenance],
      contextDependentRelationships: [context],
      directionalities: [direction],
      temporalRelationships: [temporal],
      biologicalUncertainties: [uncertainty],
      alternativeExplanations: [alternative],
      profileVersion: "0.1.0",
      limitations: [
        "Fixtures are not scientific validation.",
        "Molecular association is not an organ or disease outcome.",
        "Graph edges are not causal links.",
        "Direct mechanistic evidence stays distinct from indirect inference.",
      ],
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    expect(profile.lifecycle).toBe("draft");
    expect(profile.wholeBodyPhysiologyClaimed).toBe(false);

    profile = transitionCrossScaleRelationshipProfile({
      profile,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "human-reviewer-1", actorKind: "human"},
    });
    profile = transitionCrossScaleRelationshipProfile({
      profile,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "human-reviewer-1", actorKind: "human"},
    });
    expect(profile.lifecycle).toBe("accepted_with_limitations");
    expect(profile.reviewedBy?.actorKind).toBe("human");

    expect(() =>
      transitionCrossScaleRelationshipProfile({
        profile: {
          ...profile,
          lifecycle: "draft",
          reviewedBy: null,
        },
        to: "under_review",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-csbr-1", actorKind: "ai_agent"},
      }),
    ).not.toThrow();

    const agentDraft = draftCrossScaleRelationshipProfile({
      id: "hsi-csbr-prf-agent-accept-bad",
      displayName: "Agent cannot accept",
      scope,
      entityMappings: [mapping],
      mechanismProvenances: [],
      contextDependentRelationships: [],
      directionalities: [],
      temporalRelationships: [],
      biologicalUncertainties: [],
      alternativeExplanations: [],
      profileVersion: "0.1.0",
      limitations: [
        "Fixtures are not scientific validation.",
        "Graph edges are not causal links.",
      ],
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    const underReview = transitionCrossScaleRelationshipProfile({
      profile: agentDraft,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-csbr-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionCrossScaleRelationshipProfile({
        profile: underReview,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-csbr-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/human reviewer/);
  });

  test("memory store, persistence lines, pack, and fingerprint stay fixture-honest", () => {
    const scope = seedScope();
    const blockedScope = seedBlockedScope();
    const mapping = draftCrossScaleEntityMappingRecord({
      id: "hsi-csbr-map-store-1",
      scope,
      sourceEntity: molecularEntity,
      targetEntity: tissueEntity,
      mappingOutcome: "supported",
      edgeKind: "association_edge",
      evidenceMode: "association_only",
      relationshipSummary: "Fixture store mapping.",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    const provenance = draftMechanismProvenanceRecord({
      id: "hsi-csbr-prv-store-1",
      scope,
      mapping,
      provenanceKind: "fixture_declared",
      evidenceMode: "association_only",
      provenanceSummary: "Fixture store provenance.",
      evidenceRef: "fixture:store:prv:1",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    const context = draftContextDependentRelationshipRecord({
      id: "hsi-csbr-ctx-store-1",
      scope,
      mapping,
      contextSummary: "Fixture store context.",
      contextLabel: "store context",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    const direction = draftCrossScaleDirectionalityRecord({
      id: "hsi-csbr-dir-store-1",
      scope,
      mapping,
      directionalityOrdinal: "not_assessed",
      evaluationSummary: "Fixture store directionality not assessed.",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    const temporal = draftTemporalRelationshipRecord({
      id: "hsi-csbr-tmp-store-1",
      scope,
      mapping,
      temporalKind: "temporal_context_unknown",
      temporalSummary: "Fixture store temporal unknown.",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    const uncertainty = draftBiologicalUncertaintyRecord({
      id: "hsi-csbr-unc-store-1",
      scope,
      mapping,
      uncertaintyOrdinal: "low_declared",
      uncertaintySummary: "Fixture store uncertainty.",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    const alternative = draftAlternativeExplanationRecord({
      id: "hsi-csbr-alt-store-1",
      scope,
      mapping,
      alternativeStatus: "none_detected_declared",
      alternativeSummary: "Fixture no alternative detected.",
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });
    const profile = draftCrossScaleRelationshipProfile({
      id: "hsi-csbr-prf-store-1",
      displayName: "Store profile",
      scope,
      entityMappings: [mapping],
      mechanismProvenances: [provenance],
      contextDependentRelationships: [context],
      directionalities: [direction],
      temporalRelationships: [temporal],
      biologicalUncertainties: [uncertainty],
      alternativeExplanations: [alternative],
      profileVersion: "0.1.0",
      limitations: [
        "Fixtures are not scientific validation.",
        "Graph edges are not causal links.",
        "Molecular association is not an organ or disease outcome.",
      ],
      authoredByPrincipalId: "agent-hsi-csbr-1",
      createdAt: asOf,
    });

    const store = createMemoryCrossScaleBiologicalRelationshipsStore();
    store.upsertPhysiologyGraphScope(scope);
    store.upsertPhysiologyGraphScope(blockedScope);
    store.upsertEntityMapping(mapping);
    store.upsertMechanismProvenance(provenance);
    store.upsertContextDependentRelationship(context);
    store.upsertDirectionality(direction);
    store.upsertTemporalRelationship(temporal);
    store.upsertBiologicalUncertainty(uncertainty);
    store.upsertAlternativeExplanation(alternative);
    store.upsertRelationshipProfile(profile);

    expect(store.listPhysiologyGraphScopes()).toHaveLength(2);
    expect(store.listEntityMappings(scope.id)).toHaveLength(1);
    expect(store.getRelationshipProfile(profile.id)?.id).toBe(profile.id);

    const lines = projectCrossScaleBiologicalRelationshipsPersistenceLines({
      physiologyGraphScopes: [scope, blockedScope],
      entityMappings: [mapping],
      mechanismProvenances: [provenance],
      contextDependentRelationships: [context],
      directionalities: [direction],
      temporalRelationships: [temporal],
      biologicalUncertainties: [uncertainty],
      alternativeExplanations: [alternative],
      relationshipProfiles: [profile],
    });
    expect(lines).toContain(
      "schema=hsi-cross-scale-biological-relationships-1",
    );
    expect(lines).toContain("graphEdgeIsNotCausalLink=true");
    expect(lines).toContain("neon=red-wave-only");

    const pack = buildCrossScaleBiologicalRelationshipsPack({
      physiologyGraphScopes: [scope, blockedScope],
      entityMappings: [mapping],
      mechanismProvenances: [provenance],
      contextDependentRelationships: [context],
      directionalities: [direction],
      temporalRelationships: [temporal],
      biologicalUncertainties: [uncertainty],
      alternativeExplanations: [alternative],
      relationshipProfiles: [profile],
      asOf,
    });
    expect(pack.physiologyGraphScopeCount).toBe(2);
    expect(pack.relationshipProfileCount).toBe(1);
    expect(pack.biologicalScaleCount).toBe(7);
    expect(pack.capabilityKindCount).toBe(7);
    expect(pack.honesty.organOutcomeRequiresValidatedIntermediates).toBe(true);
    expect(pack.honesty.scientificApproval).toBe(false);

    const fp = fingerprintCrossScaleRelationshipProfile(profile);
    expect(fp).toMatch(/^[a-f0-9]{64}$/);
  });
});
