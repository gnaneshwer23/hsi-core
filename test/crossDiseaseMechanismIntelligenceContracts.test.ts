/**
 * Milestone 16 PR2 — cross-disease mechanism intelligence honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  CDMI_MECHANISM_CLASSIFICATIONS,
  buildCrossDiseaseMechanismIntelligencePack,
  createMemoryCrossDiseaseMechanismIntelligenceStore,
  draftApprovedMechanismRetrieval,
  draftCellTissueContextComparison,
  draftComparativeMechanismProfile,
  draftDirectionalityEvaluation,
  draftDiseaseComparisonDefinition,
  draftDiseaseIdentifierResolution,
  draftDiseaseSpecificDifferenceIdentification,
  draftOpposingEvidenceRetrieval,
  draftSharedMolecularOverlap,
  draftSupportingEvidenceRetrieval,
  fingerprintComparativeMechanismProfile,
  projectCrossDiseaseMechanismIntelligencePersistenceLines,
  transitionComparativeMechanismProfile,
  type DiseaseComparisonDefinition,
} from "../src/crossDiseaseMechanismIntelligenceContracts";

const asOf = "2026-11-09T15:00:00.000Z";

const fixtureContext = {
  species: "Homo sapiens",
  tissue: "synovial tissue",
  cellState: "activated fibroblast-like synoviocyte fixture state",
  diseaseStage: "established disease fixture stage",
  experimentalContext: "fixture bulk RNA-seq association context",
};

function seedComparison(
  overrides?: Partial<Parameters<typeof draftDiseaseComparisonDefinition>[0]>,
): DiseaseComparisonDefinition {
  return draftDiseaseComparisonDefinition({
    id: "hsi-cdmi-def-ssc-ra-fixture",
    displayName: "Fixture SSc–RA mechanism comparison",
    scientificQuestion:
      "Which fixture shared molecular associations and disease-specific differences can be reviewed without claiming shared causal mechanisms or auto-transfer?",
    investigationId: "hsi-hsys-inv-ssc-ra-fixture",
    diseaseContextIds: [
      "hsi-hdi-ctx-ssc-fixture",
      "hsi-hdi-ctx-ra-fixture",
    ],
    datasetAvailability: "fixture_only",
    authoredByPrincipalId: "agent-hsi-cdmi-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    ...overrides,
  });
}

function seedBlockedComparison(): DiseaseComparisonDefinition {
  return draftDiseaseComparisonDefinition({
    id: "hsi-cdmi-def-blocked-demo",
    displayName: "Blocked comparison until authorised dataset",
    scientificQuestion:
      "Blocked scientific path until an authorised research dataset is supplied.",
    investigationId: "hsi-hsys-inv-blocked-demo",
    diseaseContextIds: [
      "hsi-hdi-ctx-blocked-a",
      "hsi-hdi-ctx-blocked-b",
    ],
    datasetAvailability: "blocked_no_authorised_clinical_dataset",
    authoredByPrincipalId: "agent-hsi-cdmi-1",
    createdAt: asOf,
  });
}

describe("cross-disease mechanism intelligence contracts (M16 PR2)", () => {
  test("defines comparison across ≥2 diseases composing PR1 investigation ids", () => {
    expect(CDMI_MECHANISM_CLASSIFICATIONS).toContain(
      "shared_molecular_association",
    );
    expect(CDMI_MECHANISM_CLASSIFICATIONS).toContain(
      "shared_pathway_involvement",
    );
    expect(CDMI_MECHANISM_CLASSIFICATIONS).toContain(
      "shared_functional_mechanism",
    );
    expect(CDMI_MECHANISM_CLASSIFICATIONS).toContain("disease_specific");
    expect(CDMI_MECHANISM_CLASSIFICATIONS).toContain("context_dependent");
    expect(CDMI_MECHANISM_CLASSIFICATIONS).toContain(
      "computational_similarity",
    );
    expect(CDMI_MECHANISM_CLASSIFICATIONS).toContain(
      "unvalidated_mechanistic_hypothesis",
    );

    const comparison = seedComparison();
    expect(comparison.diseaseContextIds).toHaveLength(2);
    expect(comparison.investigationId).toBe("hsi-hsys-inv-ssc-ra-fixture");
    expect(comparison.autoTransferAcrossDiseases).toBe(false);
    expect(comparison.containsIdentifiablePhi).toBe(false);
    expect(comparison.honesty.sharedGeneIsNotSharedCausalMechanism).toBe(true);
    expect(comparison.honesty.pathwayEnrichmentIsNotActivation).toBe(true);
    expect(comparison.honesty.experimentalContextMustBePreserved).toBe(true);
    expect(comparison.honesty.neonProjectPolicy).toBe("red-wave-only");

    expect(() =>
      draftDiseaseComparisonDefinition({
        id: "hsi-cdmi-def-single-bad",
        displayName: "Single disease masquerade",
        scientificQuestion: "Only one disease",
        investigationId: "hsi-hsys-inv-ssc-ra-fixture",
        diseaseContextIds: ["hsi-hdi-ctx-ssc-fixture"],
        authoredByPrincipalId: "agent-hsi-cdmi-1",
        createdAt: asOf,
      }),
    ).toThrow(/At least 2 diseaseContextIds/);

    expect(() =>
      draftDiseaseComparisonDefinition({
        id: "hsi-cdmi-def-transfer-bad",
        displayName: "Illegal auto-transfer attempt",
        scientificQuestion: "Should fail closed",
        investigationId: "hsi-hsys-inv-ssc-ra-fixture",
        diseaseContextIds: [
          "hsi-hdi-ctx-ssc-fixture",
          "hsi-hdi-ctx-ra-fixture",
        ],
        authoredByPrincipalId: "agent-hsi-cdmi-1",
        createdAt: asOf,
        autoTransferAcrossDiseases: true,
      }),
    ).toThrow(/auto-transfer/);
  });

  test("resolves identifiers and retrieves approved mechanisms with preserved context", () => {
    const comparison = seedComparison();
    const resolvedSsc = draftDiseaseIdentifierResolution({
      id: "hsi-cdmi-res-ssc-fixture",
      comparison,
      diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
      resolvedIdentifier: "ontology:disease:SSC-FIXTURE",
      resolutionStatus: "resolved_fixture",
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    expect(resolvedSsc.resolved).toBe(true);
    expect(resolvedSsc.investigationId).toBe(comparison.investigationId);

    const blocked = draftDiseaseIdentifierResolution({
      id: "hsi-cdmi-res-blocked-demo",
      comparison: seedBlockedComparison(),
      diseaseContextId: "hsi-hdi-ctx-blocked-a",
      resolvedIdentifier: "ontology:disease:BLOCKED",
      resolutionStatus: "blocked_no_authorised_dataset",
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    expect(blocked.resolved).toBe(false);
    expect(blocked.datasetAvailabilityBlocked).toBe(true);

    const mech = draftApprovedMechanismRetrieval({
      id: "hsi-cdmi-mech-il6-ssc",
      comparison,
      diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
      mechanismLabel: "Fixture IL6 signalling association in SSc context",
      approvalScope: "fixture_approved_declared",
      experimentalContext: fixtureContext,
      optionalPr1MechanismRelationshipId: "hsi-hsys-cmr-gene-fixture",
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    expect(mech.approved).toBe(true);
    expect(mech.autoTransferAcrossDiseases).toBe(false);
    expect(mech.experimentalContext.tissue).toBe("synovial tissue");
    expect(mech.optionalPr1MechanismRelationshipId).toBe(
      "hsi-hsys-cmr-gene-fixture",
    );

    const unapproved = draftApprovedMechanismRetrieval({
      id: "hsi-cdmi-mech-blocked",
      comparison,
      diseaseContextId: "hsi-hdi-ctx-ra-fixture",
      mechanismLabel: "Unapproved mechanism blocked from retrieval",
      approvalScope: "blocked_unapproved",
      experimentalContext: fixtureContext,
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    expect(unapproved.approved).toBe(false);
  });

  test("shared gene/pathway overlaps refuse causal and activation collapse", () => {
    const comparison = seedComparison();
    const mechA = draftApprovedMechanismRetrieval({
      id: "hsi-cdmi-mech-overlap-a",
      comparison,
      diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
      mechanismLabel: "Fixture SSc interferon association",
      approvalScope: "fixture_approved_declared",
      experimentalContext: fixtureContext,
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const mechB = draftApprovedMechanismRetrieval({
      id: "hsi-cdmi-mech-overlap-b",
      comparison,
      diseaseContextId: "hsi-hdi-ctx-ra-fixture",
      mechanismLabel: "Fixture RA interferon association",
      approvalScope: "fixture_approved_declared",
      experimentalContext: {
        ...fixtureContext,
        tissue: "peripheral blood",
      },
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });

    const geneOverlap = draftSharedMolecularOverlap({
      id: "hsi-cdmi-mol-ifn-gene",
      comparison,
      diseaseContextIdA: "hsi-hdi-ctx-ssc-fixture",
      diseaseContextIdB: "hsi-hdi-ctx-ra-fixture",
      entityKind: "gene",
      entityLabel: "FIXTURE_IFN_GENE",
      mechanismClassification: "shared_molecular_association",
      experimentalContext: fixtureContext,
      approvedMechanisms: [mechA, mechB],
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    expect(geneOverlap.sharedGeneIsNotSharedCausalMechanism).toBe(true);
    expect(geneOverlap.causalMechanismProven).toBe(false);
    expect(geneOverlap.autoTransferAcrossDiseases).toBe(false);

    expect(() =>
      draftSharedMolecularOverlap({
        id: "hsi-cdmi-mol-gene-causal-bad",
        comparison,
        diseaseContextIdA: "hsi-hdi-ctx-ssc-fixture",
        diseaseContextIdB: "hsi-hdi-ctx-ra-fixture",
        entityKind: "gene",
        entityLabel: "FIXTURE_IFN_GENE",
        mechanismClassification: "shared_molecular_association",
        experimentalContext: fixtureContext,
        approvedMechanisms: [mechA, mechB],
        authoredByPrincipalId: "agent-hsi-cdmi-1",
        createdAt: asOf,
        claimSharedCausalMechanism: true,
      }),
    ).toThrow(/shared causal mechanism/);

    const pathway = draftSharedMolecularOverlap({
      id: "hsi-cdmi-mol-jak-stat",
      comparison,
      diseaseContextIdA: "hsi-hdi-ctx-ssc-fixture",
      diseaseContextIdB: "hsi-hdi-ctx-ra-fixture",
      entityKind: "pathway",
      entityLabel: "Fixture JAK-STAT pathway involvement",
      mechanismClassification: "shared_pathway_involvement",
      experimentalContext: fixtureContext,
      approvedMechanisms: [mechA, mechB],
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    expect(pathway.pathwayEnrichmentIsNotActivation).toBe(true);

    expect(() =>
      draftSharedMolecularOverlap({
        id: "hsi-cdmi-mol-pathway-activation-bad",
        comparison,
        diseaseContextIdA: "hsi-hdi-ctx-ssc-fixture",
        diseaseContextIdB: "hsi-hdi-ctx-ra-fixture",
        entityKind: "pathway",
        entityLabel: "Fixture JAK-STAT pathway involvement",
        mechanismClassification: "shared_pathway_involvement",
        experimentalContext: fixtureContext,
        approvedMechanisms: [mechA, mechB],
        authoredByPrincipalId: "agent-hsi-cdmi-1",
        createdAt: asOf,
        claimPathwayActivation: true,
      }),
    ).toThrow(/pathway activation/);

    expect(() =>
      draftSharedMolecularOverlap({
        id: "hsi-cdmi-mol-gene-as-functional-bad",
        comparison,
        diseaseContextIdA: "hsi-hdi-ctx-ssc-fixture",
        diseaseContextIdB: "hsi-hdi-ctx-ra-fixture",
        entityKind: "gene",
        entityLabel: "FIXTURE_IFN_GENE",
        mechanismClassification: "shared_functional_mechanism",
        experimentalContext: fixtureContext,
        approvedMechanisms: [mechA, mechB],
        authoredByPrincipalId: "agent-hsi-cdmi-1",
        createdAt: asOf,
      }),
    ).toThrow(/Gene overlaps must use/);
  });

  test("compares cell/tissue contexts and separates support vs oppose evidence", () => {
    const comparison = seedComparison();
    const context = draftCellTissueContextComparison({
      id: "hsi-cdmi-ctx-synovium-blood",
      comparison,
      diseaseContextIdA: "hsi-hdi-ctx-ssc-fixture",
      diseaseContextIdB: "hsi-hdi-ctx-ra-fixture",
      contextSummary:
        "Fixture SSc synovial vs RA blood contexts differ — context-dependent, not auto-transferable.",
      contextA: fixtureContext,
      contextB: {
        ...fixtureContext,
        tissue: "peripheral blood",
        cellState: "circulating immune cell fixture state",
      },
      contextsComparable: false,
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    expect(context.contextDependent).toBe(true);
    expect(context.contextA.tissue).toBe("synovial tissue");
    expect(context.contextB.tissue).toBe("peripheral blood");
    expect(context.autoTransferAcrossDiseases).toBe(false);

    const support = draftSupportingEvidenceRetrieval({
      id: "hsi-cdmi-sup-ifn-1",
      comparison,
      relatedOverlapOrMechanismId: "hsi-cdmi-mol-ifn-gene",
      evidenceSummary:
        "Fixture supporting association for shared interferon gene label — not causal proof.",
      evidenceRef: "fixture:evidence:support:ifn-1",
      experimentalContext: fixtureContext,
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    expect(support.polarity).toBe("supports");
    expect(support.inventedStatistics).toBeNull();

    const oppose = draftOpposingEvidenceRetrieval({
      id: "hsi-cdmi-opp-ifn-1",
      comparison,
      relatedOverlapOrMechanismId: "hsi-cdmi-mol-ifn-gene",
      evidenceSummary:
        "Fixture opposing association in alternate tissue context — polarity preserved.",
      evidenceRef: "fixture:evidence:oppose:ifn-1",
      experimentalContext: {
        ...fixtureContext,
        tissue: "skin biopsy",
      },
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    expect(oppose.polarity).toBe("opposes");
  });

  test("evaluates directionality and records disease-specific differences without transfer", () => {
    const comparison = seedComparison();
    const support = draftSupportingEvidenceRetrieval({
      id: "hsi-cdmi-sup-dir-1",
      comparison,
      relatedOverlapOrMechanismId: "hsi-cdmi-mech-overlap-a",
      evidenceSummary: "Fixture supporting polarity for directionality eval.",
      evidenceRef: "fixture:evidence:support:dir-1",
      experimentalContext: fixtureContext,
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const oppose = draftOpposingEvidenceRetrieval({
      id: "hsi-cdmi-opp-dir-1",
      comparison,
      relatedOverlapOrMechanismId: "hsi-cdmi-mech-overlap-a",
      evidenceSummary: "Fixture opposing polarity for directionality eval.",
      evidenceRef: "fixture:evidence:oppose:dir-1",
      experimentalContext: fixtureContext,
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const direction = draftDirectionalityEvaluation({
      id: "hsi-cdmi-dir-mixed-1",
      comparison,
      directionalityOrdinal: "context_dependent_direction_declared",
      evaluationSummary:
        "Fixture directionality is context-dependent across tissues — not proven causation.",
      supportingEvidence: [support],
      opposingEvidence: [oppose],
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    expect(direction.causalMechanismProven).toBe(false);
    expect(direction.supportingEvidenceIds).toHaveLength(1);
    expect(direction.opposingEvidenceIds).toHaveLength(1);

    expect(() =>
      draftDirectionalityEvaluation({
        id: "hsi-cdmi-dir-causal-bad",
        comparison,
        directionalityOrdinal: "concordant_association_declared",
        evaluationSummary: "Should fail",
        supportingEvidence: [support],
        opposingEvidence: [],
        authoredByPrincipalId: "agent-hsi-cdmi-1",
        createdAt: asOf,
        claimCausalMechanismProven: true,
      }),
    ).toThrow(/causal mechanism proven/);

    const difference = draftDiseaseSpecificDifferenceIdentification({
      id: "hsi-cdmi-diff-ssc-fibrosis",
      comparison,
      diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
      differenceSummary:
        "Fixture SSc-specific fibrosis-associated difference — not auto-transferred to RA.",
      mechanismClassification: "disease_specific",
      experimentalContext: {
        ...fixtureContext,
        tissue: "dermal fibroblast niche",
        diseaseStage: "fibrotic stage fixture",
      },
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    expect(difference.mechanismClassification).toBe("disease_specific");
    expect(difference.autoTransferAcrossDiseases).toBe(false);
  });

  test("produces reviewable comparative profile with human acceptance gates", () => {
    const blockedComparison = seedBlockedComparison();
    const blockedProfile = draftComparativeMechanismProfile({
      id: "hsi-cdmi-cmp-blocked-demo",
      displayName: "Blocked comparative mechanism profile",
      comparison: blockedComparison,
      identifierResolutions: [],
      approvedMechanisms: [],
      sharedOverlaps: [],
      contextComparisons: [],
      supportingEvidence: [],
      opposingEvidence: [],
      directionalityEvaluations: [],
      diseaseSpecificDifferences: [],
      primaryMechanismClassification: "unvalidated_mechanistic_hypothesis",
      profileVersion: "0.1.0",
      limitations: [
        "Blocked awaiting authorised research dataset — not scientific validation.",
        "Shared gene association is not a shared causal mechanism.",
        "Auto-transfer of mechanisms across diseases is forbidden.",
      ],
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    expect(blockedProfile.lifecycle).toBe(
      "blocked_awaiting_authorised_dataset",
    );
    expect(() =>
      transitionComparativeMechanismProfile({
        profile: blockedProfile,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "human-reviewer-1", actorKind: "human"},
      }),
    ).toThrow(/Invalid comparative mechanism profile transition|human reviewer/);

    const comparison = seedComparison();
    const resA = draftDiseaseIdentifierResolution({
      id: "hsi-cdmi-res-profile-ssc",
      comparison,
      diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
      resolvedIdentifier: "ontology:disease:SSC-FIXTURE",
      resolutionStatus: "resolved_fixture",
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const resB = draftDiseaseIdentifierResolution({
      id: "hsi-cdmi-res-profile-ra",
      comparison,
      diseaseContextId: "hsi-hdi-ctx-ra-fixture",
      resolvedIdentifier: "ontology:disease:RA-FIXTURE",
      resolutionStatus: "resolved_fixture",
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const mechA = draftApprovedMechanismRetrieval({
      id: "hsi-cdmi-mech-profile-a",
      comparison,
      diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
      mechanismLabel: "Fixture SSc interferon association",
      approvalScope: "fixture_approved_declared",
      experimentalContext: fixtureContext,
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const mechB = draftApprovedMechanismRetrieval({
      id: "hsi-cdmi-mech-profile-b",
      comparison,
      diseaseContextId: "hsi-hdi-ctx-ra-fixture",
      mechanismLabel: "Fixture RA interferon association",
      approvalScope: "fixture_approved_declared",
      experimentalContext: fixtureContext,
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const overlap = draftSharedMolecularOverlap({
      id: "hsi-cdmi-mol-profile-ifn",
      comparison,
      diseaseContextIdA: "hsi-hdi-ctx-ssc-fixture",
      diseaseContextIdB: "hsi-hdi-ctx-ra-fixture",
      entityKind: "gene",
      entityLabel: "FIXTURE_IFN_GENE",
      mechanismClassification: "shared_molecular_association",
      experimentalContext: fixtureContext,
      approvedMechanisms: [mechA, mechB],
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const context = draftCellTissueContextComparison({
      id: "hsi-cdmi-ctx-profile-1",
      comparison,
      diseaseContextIdA: "hsi-hdi-ctx-ssc-fixture",
      diseaseContextIdB: "hsi-hdi-ctx-ra-fixture",
      contextSummary: "Fixture contexts declared with preserved tissue labels.",
      contextA: fixtureContext,
      contextB: fixtureContext,
      contextsComparable: true,
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const support = draftSupportingEvidenceRetrieval({
      id: "hsi-cdmi-sup-profile-1",
      comparison,
      relatedOverlapOrMechanismId: overlap.id,
      evidenceSummary: "Fixture supporting evidence for profile assembly.",
      evidenceRef: "fixture:evidence:support:profile-1",
      experimentalContext: fixtureContext,
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const oppose = draftOpposingEvidenceRetrieval({
      id: "hsi-cdmi-opp-profile-1",
      comparison,
      relatedOverlapOrMechanismId: overlap.id,
      evidenceSummary: "Fixture opposing evidence for profile assembly.",
      evidenceRef: "fixture:evidence:oppose:profile-1",
      experimentalContext: fixtureContext,
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const direction = draftDirectionalityEvaluation({
      id: "hsi-cdmi-dir-profile-1",
      comparison,
      directionalityOrdinal: "discordant_or_opposing_declared",
      evaluationSummary:
        "Fixture mixed polarities preserved — not causal identification.",
      supportingEvidence: [support],
      opposingEvidence: [oppose],
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const difference = draftDiseaseSpecificDifferenceIdentification({
      id: "hsi-cdmi-diff-profile-1",
      comparison,
      diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
      differenceSummary: "Fixture SSc-specific difference retained for review.",
      mechanismClassification: "disease_specific",
      experimentalContext: fixtureContext,
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });

    const draft = draftComparativeMechanismProfile({
      id: "hsi-cdmi-cmp-ssc-ra-fixture",
      displayName: "Fixture SSc–RA comparative mechanism profile",
      comparison,
      identifierResolutions: [resA, resB],
      approvedMechanisms: [mechA, mechB],
      sharedOverlaps: [overlap],
      contextComparisons: [context],
      supportingEvidence: [support],
      opposingEvidence: [oppose],
      directionalityEvaluations: [direction],
      diseaseSpecificDifferences: [difference],
      primaryMechanismClassification: "shared_molecular_association",
      profileVersion: "0.1.0",
      limitations: [
        "Shared gene association is not a shared causal mechanism.",
        "Pathway enrichment is not pathway activation.",
        "Auto-transfer of mechanisms across diseases is forbidden.",
        "Species, tissue, cell state, disease stage, and experimental context are preserved.",
        "Fixture profile only — not scientific validation.",
      ],
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    expect(draft.lifecycle).toBe("draft");
    expect(draft.graphPromotable).toBe(false);
    expect(fingerprintComparativeMechanismProfile(draft)).toMatch(
      /^[a-f0-9]{64}$/,
    );

    const underReview = transitionComparativeMechanismProfile({
      profile: draft,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-cdmi-1", actorKind: "ai_agent"},
    });
    const accepted = transitionComparativeMechanismProfile({
      profile: underReview,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "human-reviewer-1", actorKind: "human"},
    });
    expect(accepted.lifecycle).toBe("accepted_with_limitations");
    expect(accepted.reviewedBy?.actorKind).toBe("human");

    expect(() =>
      transitionComparativeMechanismProfile({
        profile: underReview,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-cdmi-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/human reviewer/);
  });

  test("thin memory store and pack persistence lines stay fixture-honest", () => {
    const comparison = seedComparison();
    const blocked = seedBlockedComparison();
    const res = draftDiseaseIdentifierResolution({
      id: "hsi-cdmi-res-store-1",
      comparison,
      diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
      resolvedIdentifier: "ontology:disease:SSC-FIXTURE",
      resolutionStatus: "resolved_fixture",
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const mech = draftApprovedMechanismRetrieval({
      id: "hsi-cdmi-mech-store-1",
      comparison,
      diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
      mechanismLabel: "Fixture store mechanism",
      approvalScope: "fixture_approved_declared",
      experimentalContext: fixtureContext,
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const mechB = draftApprovedMechanismRetrieval({
      id: "hsi-cdmi-mech-store-2",
      comparison,
      diseaseContextId: "hsi-hdi-ctx-ra-fixture",
      mechanismLabel: "Fixture store mechanism B",
      approvalScope: "fixture_approved_declared",
      experimentalContext: fixtureContext,
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const overlap = draftSharedMolecularOverlap({
      id: "hsi-cdmi-mol-store-1",
      comparison,
      diseaseContextIdA: "hsi-hdi-ctx-ssc-fixture",
      diseaseContextIdB: "hsi-hdi-ctx-ra-fixture",
      entityKind: "protein",
      entityLabel: "FIXTURE_PROTEIN",
      mechanismClassification: "computational_similarity",
      experimentalContext: fixtureContext,
      approvedMechanisms: [mech, mechB],
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const context = draftCellTissueContextComparison({
      id: "hsi-cdmi-ctx-store-1",
      comparison,
      diseaseContextIdA: "hsi-hdi-ctx-ssc-fixture",
      diseaseContextIdB: "hsi-hdi-ctx-ra-fixture",
      contextSummary: "Fixture store context comparison.",
      contextA: fixtureContext,
      contextB: fixtureContext,
      contextsComparable: true,
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const support = draftSupportingEvidenceRetrieval({
      id: "hsi-cdmi-sup-store-1",
      comparison,
      relatedOverlapOrMechanismId: overlap.id,
      evidenceSummary: "Fixture store supporting evidence.",
      evidenceRef: "fixture:evidence:support:store-1",
      experimentalContext: fixtureContext,
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const oppose = draftOpposingEvidenceRetrieval({
      id: "hsi-cdmi-opp-store-1",
      comparison,
      relatedOverlapOrMechanismId: overlap.id,
      evidenceSummary: "Fixture store opposing evidence.",
      evidenceRef: "fixture:evidence:oppose:store-1",
      experimentalContext: fixtureContext,
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const direction = draftDirectionalityEvaluation({
      id: "hsi-cdmi-dir-store-1",
      comparison,
      directionalityOrdinal: "insufficient_to_evaluate",
      evaluationSummary: "Fixture insufficient directionality.",
      supportingEvidence: [support],
      opposingEvidence: [oppose],
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const difference = draftDiseaseSpecificDifferenceIdentification({
      id: "hsi-cdmi-diff-store-1",
      comparison,
      diseaseContextId: "hsi-hdi-ctx-ra-fixture",
      differenceSummary: "Fixture RA-specific difference.",
      mechanismClassification: "context_dependent",
      experimentalContext: fixtureContext,
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const profile = draftComparativeMechanismProfile({
      id: "hsi-cdmi-cmp-store-1",
      displayName: "Fixture store comparative profile",
      comparison,
      identifierResolutions: [res],
      approvedMechanisms: [mech, mechB],
      sharedOverlaps: [overlap],
      contextComparisons: [context],
      supportingEvidence: [support],
      opposingEvidence: [oppose],
      directionalityEvaluations: [direction],
      diseaseSpecificDifferences: [difference],
      primaryMechanismClassification: "computational_similarity",
      profileVersion: "0.1.0",
      limitations: [
        "Computational similarity is not a shared causal mechanism.",
        "Auto-transfer of mechanisms across diseases is forbidden.",
      ],
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });
    const blockedProfile = draftComparativeMechanismProfile({
      id: "hsi-cdmi-cmp-store-blocked",
      displayName: "Blocked store profile",
      comparison: blocked,
      identifierResolutions: [],
      approvedMechanisms: [],
      sharedOverlaps: [],
      contextComparisons: [],
      supportingEvidence: [],
      opposingEvidence: [],
      directionalityEvaluations: [],
      diseaseSpecificDifferences: [],
      primaryMechanismClassification: "unvalidated_mechanistic_hypothesis",
      profileVersion: "0.1.0",
      limitations: [
        "Blocked awaiting authorised research dataset.",
        "Shared gene association is not a shared causal mechanism.",
      ],
      authoredByPrincipalId: "agent-hsi-cdmi-1",
      createdAt: asOf,
    });

    const store = createMemoryCrossDiseaseMechanismIntelligenceStore();
    store.upsertComparisonDefinition(comparison);
    store.upsertComparisonDefinition(blocked);
    store.upsertIdentifierResolution(res);
    store.upsertApprovedMechanismRetrieval(mech);
    store.upsertApprovedMechanismRetrieval(mechB);
    store.upsertSharedMolecularOverlap(overlap);
    store.upsertCellTissueContextComparison(context);
    store.upsertSupportingEvidence(support);
    store.upsertOpposingEvidence(oppose);
    store.upsertDirectionalityEvaluation(direction);
    store.upsertDiseaseSpecificDifference(difference);
    store.upsertComparativeMechanismProfile(profile);
    store.upsertComparativeMechanismProfile(blockedProfile);

    expect(store.listComparisonDefinitions()).toHaveLength(2);
    expect(store.listApprovedMechanismRetrievals(comparison.id)).toHaveLength(
      2,
    );
    expect(store.getComparativeMechanismProfile(profile.id)?.lifecycle).toBe(
      "draft",
    );

    const pack = buildCrossDiseaseMechanismIntelligencePack({
      comparisonDefinitions: [blocked, comparison],
      identifierResolutions: [res],
      approvedMechanismRetrievals: [mech, mechB],
      sharedMolecularOverlaps: [overlap],
      cellTissueContextComparisons: [context],
      supportingEvidenceRetrievals: [support],
      opposingEvidenceRetrievals: [oppose],
      directionalityEvaluations: [direction],
      diseaseSpecificDifferences: [difference],
      comparativeMechanismProfiles: [blockedProfile, profile],
      asOf,
    });
    expect(pack.mechanismClassificationCount).toBe(7);
    expect(pack.honesty.noAutoTransferOfMechanismsAcrossDiseases).toBe(true);
    expect(pack.honesty.experimentalContextMustBePreserved).toBe(true);

    const lines = projectCrossDiseaseMechanismIntelligencePersistenceLines({
      comparisonDefinitions: [blocked, comparison],
      identifierResolutions: [res],
      approvedMechanismRetrievals: [mech, mechB],
      sharedMolecularOverlaps: [overlap],
      cellTissueContextComparisons: [context],
      supportingEvidenceRetrievals: [support],
      opposingEvidenceRetrievals: [oppose],
      directionalityEvaluations: [direction],
      diseaseSpecificDifferences: [difference],
      comparativeMechanismProfiles: [blockedProfile, profile],
    });
    expect(lines).toContain("noAutoTransferAcrossDiseases=true");
    expect(lines).toContain("sharedGeneIsNotSharedCausalMechanism=true");
    expect(lines).toContain("neon=red-wave-only");
  });
});
