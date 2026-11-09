/**
 * Milestone 16 PR4 — immune–metabolic–microbiome intelligence honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  IMMI_AXIS_BANDS,
  IMMI_CAPABILITY_KINDS,
  IMMI_EVIDENCE_DISTINCTIONS,
  buildImmuneMetabolicMicrobiomeIntelligencePack,
  chainBlockedByUnsupportedLinks,
  createMemoryImmuneMetabolicMicrobiomeIntelligenceStore,
  draftDiseaseContextComparison,
  draftEvidenceContradictionAnalysis,
  draftGutImmuneMetabolicGraphScope,
  draftImmuneMetabolicMicrobiomeProfile,
  draftImmuneVsMetabolicPathwayComparison,
  draftInflammationMetabolicPhenotypeRelationship,
  draftMetaboliteHostInteraction,
  draftMicrobialFunctionHostPathwayMapping,
  fingerprintImmuneMetabolicMicrobiomeProfile,
  projectImmuneMetabolicMicrobiomeIntelligencePersistenceLines,
  transitionImmuneMetabolicMicrobiomeProfile,
  type GutImmuneMetabolicGraphScope,
} from "../src/immuneMetabolicMicrobiomeIntelligenceContracts";

const asOf = "2026-11-09T17:00:00.000Z";

const immunePathway = {
  id: "hsi-immi-ent-il6-pathway-fixture",
  label: "Fixture IL6 immune pathway association",
  axisBand: "immune" as const,
  ontologySystem: "ontology:pathway",
  ontologyValue: "IL6-IMMUNE-FIXTURE",
  note: "",
};

const metabolicPathway = {
  id: "hsi-immi-ent-scfa-pathway-fixture",
  label: "Fixture SCFA metabolic pathway association",
  axisBand: "metabolic" as const,
  ontologySystem: "ontology:pathway",
  ontologyValue: "SCFA-METABOLIC-FIXTURE",
  note: "",
};

const metabolite = {
  id: "hsi-immi-ent-butyrate-fixture",
  label: "Fixture butyrate metabolite",
  axisBand: "metabolic" as const,
  ontologySystem: "ontology:metabolite",
  ontologyValue: "BUTYRATE-FIXTURE",
  note: "",
};

const hostTreg = {
  id: "hsi-immi-ent-colonic-treg-fixture",
  label: "Fixture colonic Treg host response",
  axisBand: "immune" as const,
  ontologySystem: "ontology:cell",
  ontologyValue: "TREG-FIXTURE",
  note: "",
};

const microbialTaxon = {
  id: "hsi-immi-ent-clostridia-fixture",
  label: "Fixture Clostridia taxonomic association",
  axisBand: "microbiome" as const,
  ontologySystem: "ontology:taxon",
  ontologyValue: "CLOSTRIDIA-FIXTURE",
  note: "",
};

const hostPathway = {
  id: "hsi-immi-ent-foxp3-pathway-fixture",
  label: "Fixture Foxp3 host pathway",
  axisBand: "host_pathway" as const,
  ontologySystem: "ontology:pathway",
  ontologyValue: "FOXP3-HOST-FIXTURE",
  note: "",
};

const inflammation = {
  id: "hsi-immi-ent-colonic-inflam-fixture",
  label: "Fixture colonic inflammation phenotype",
  axisBand: "inflammation_phenotype" as const,
  ontologySystem: "ontology:phenotype",
  ontologyValue: "COLONIC-INFLAM-FIXTURE",
  note: "",
};

function seedScope(
  overrides?: Partial<Parameters<typeof draftGutImmuneMetabolicGraphScope>[0]>,
): GutImmuneMetabolicGraphScope {
  return draftGutImmuneMetabolicGraphScope({
    id: "hsi-immi-scp-gut-immune-metabolic-fixture",
    displayName: "Fixture gut–immune–metabolic graph scope",
    scientificQuestion:
      "Which fixture immune–metabolic–microbiome associations can be reviewed without equating composition correlations with causality, auto-translating animal evidence to human, or completing unsupported gut–immune–metabolic chains?",
    coveredAxisBands: [
      "immune",
      "metabolic",
      "microbiome",
      "inflammation_phenotype",
      "host_pathway",
    ],
    diseaseContextIds: [
      "hsi-hdi-ctx-ibd-fixture",
      "hsi-hdi-ctx-ra-fixture",
    ],
    optionalCsbrScopeId: "hsi-csbr-scp-physio-fixture",
    optionalHsysOrganSystemRelationshipId: "hsi-hsys-osr-gut-immune",
    optionalCdmiComparativeProfileId: "hsi-cdmi-cmp-ibd-ra-fixture",
    optionalGutImmunePackSchema: "hsi-gut-immune-pack-1",
    datasetAvailability: "fixture_only",
    authoredByPrincipalId: "agent-hsi-immi-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    ...overrides,
  });
}

function seedBlockedScope(): GutImmuneMetabolicGraphScope {
  return draftGutImmuneMetabolicGraphScope({
    id: "hsi-immi-scp-blocked-demo",
    displayName: "Blocked gut–immune–metabolic scope until authorised dataset",
    scientificQuestion:
      "Blocked scientific path until an authorised research dataset is supplied.",
    coveredAxisBands: ["immune", "metabolic", "microbiome"],
    datasetAvailability: "blocked_no_authorised_clinical_dataset",
    authoredByPrincipalId: "agent-hsi-immi-1",
    createdAt: asOf,
  });
}

describe("immune-metabolic-microbiome intelligence contracts (M16 PR4)", () => {
  test("covers axis bands, capabilities, distinctions, and composes CSBR / HSI / CDMI / gut pack refs", () => {
    expect(IMMI_AXIS_BANDS).toEqual([
      "immune",
      "metabolic",
      "microbiome",
      "inflammation_phenotype",
      "host_pathway",
    ]);
    expect(IMMI_CAPABILITY_KINDS).toContain(
      "immune_vs_metabolic_pathway_comparison",
    );
    expect(IMMI_CAPABILITY_KINDS).toContain("metabolite_host_interaction");
    expect(IMMI_CAPABILITY_KINDS).toContain(
      "microbial_function_host_pathway_mapping",
    );
    expect(IMMI_CAPABILITY_KINDS).toContain(
      "inflammation_metabolic_phenotype_relationship",
    );
    expect(IMMI_CAPABILITY_KINDS).toContain("disease_context_comparison");
    expect(IMMI_CAPABILITY_KINDS).toContain("evidence_contradiction_analysis");
    expect(IMMI_EVIDENCE_DISTINCTIONS).toEqual([
      "microbial_taxonomic_association",
      "microbial_functional_evidence",
      "metabolite_measurement",
      "host_molecular_response",
      "experimental_causal_evidence",
      "human_observational_association",
    ]);

    const scope = seedScope();
    expect(scope.coveredAxisBands).toHaveLength(5);
    expect(scope.optionalCsbrScopeId).toBe("hsi-csbr-scp-physio-fixture");
    expect(scope.optionalHsysOrganSystemRelationshipId).toBe(
      "hsi-hsys-osr-gut-immune",
    );
    expect(scope.optionalCdmiComparativeProfileId).toBe(
      "hsi-cdmi-cmp-ibd-ra-fixture",
    );
    expect(scope.optionalGutImmunePackSchema).toBe("hsi-gut-immune-pack-1");
    expect(scope.compositionCorrelationIsCausality).toBe(false);
    expect(scope.animalEvidenceAutoTranslatesToHuman).toBe(false);
    expect(scope.honesty.neonProjectPolicy).toBe("red-wave-only");

    expect(() =>
      draftGutImmuneMetabolicGraphScope({
        id: "hsi-immi-scp-single-bad",
        displayName: "Single axis masquerade",
        scientificQuestion: "Only one axis",
        coveredAxisBands: ["immune"],
        authoredByPrincipalId: "agent-hsi-immi-1",
        createdAt: asOf,
      }),
    ).toThrow(/At least 2 coveredAxisBands/);

    expect(() =>
      draftGutImmuneMetabolicGraphScope({
        id: "hsi-immi-scp-causality-bad",
        displayName: "Illegal composition causality claim",
        scientificQuestion: "Should fail closed",
        coveredAxisBands: ["immune", "metabolic"],
        authoredByPrincipalId: "agent-hsi-immi-1",
        createdAt: asOf,
        claimCompositionCorrelationIsCausality: true,
      }),
    ).toThrow(/composition correlations must not be treated as causality/);
  });

  test("compares immune vs metabolic pathways without composition→causality collapse", () => {
    const scope = seedScope();
    const comparison = draftImmuneVsMetabolicPathwayComparison({
      id: "hsi-immi-ipc-il6-scfa",
      scope,
      immunePathwayEntity: immunePathway,
      metabolicPathwayEntity: metabolicPathway,
      comparisonOutcome: "context_dependent_declared",
      evidenceDistinction: "host_molecular_response",
      comparisonSummary:
        "Fixture IL6 vs SCFA pathway comparison — overlap is context-dependent and not causal from composition alone.",
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    expect(comparison.compositionCorrelationIsCausality).toBe(false);
    expect(comparison.comparisonOutcome).toBe("context_dependent_declared");

    expect(() =>
      draftImmuneVsMetabolicPathwayComparison({
        id: "hsi-immi-ipc-causality-bad",
        scope,
        immunePathwayEntity: immunePathway,
        metabolicPathwayEntity: metabolicPathway,
        comparisonOutcome: "overlap_declared",
        evidenceDistinction: "metabolite_measurement",
        comparisonSummary: "Should fail",
        authoredByPrincipalId: "agent-hsi-immi-1",
        createdAt: asOf,
        claimCompositionCorrelationIsCausality: true,
      }),
    ).toThrow(/composition correlations must not be treated as causality/);
  });

  test("records metabolite–host interactions and refuses animal→human auto-translation", () => {
    const scope = seedScope();
    const interaction = draftMetaboliteHostInteraction({
      id: "hsi-immi-mhi-butyrate-treg",
      scope,
      metaboliteEntity: metabolite,
      hostEntity: hostTreg,
      interactionKind: "experimental_effect_declared",
      evidenceDistinction: "experimental_causal_evidence",
      translationStatus: "animal_only_declared",
      interactionSummary:
        "Fixture butyrate→colonic Treg experimental association in animal models — not automatic human translation.",
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    expect(interaction.animalEvidenceAutoTranslatesToHuman).toBe(false);
    expect(interaction.translationStatus).toBe("animal_only_declared");

    expect(() =>
      draftMetaboliteHostInteraction({
        id: "hsi-immi-mhi-auto-human-bad",
        scope,
        metaboliteEntity: metabolite,
        hostEntity: hostTreg,
        interactionKind: "experimental_effect_declared",
        evidenceDistinction: "experimental_causal_evidence",
        translationStatus: "animal_only_declared",
        interactionSummary: "Should fail",
        authoredByPrincipalId: "agent-hsi-immi-1",
        createdAt: asOf,
        claimAnimalAutoTranslatesToHuman: true,
      }),
    ).toThrow(/animal evidence must not automatically translate to human/);
  });

  test("maps microbial function to host pathways and blocks unsupported complete chains", () => {
    const scope = seedScope();
    const functional = draftMicrobialFunctionHostPathwayMapping({
      id: "hsi-immi-mfm-scfa-foxp3",
      scope,
      microbialEntity: microbialTaxon,
      hostPathwayEntity: hostPathway,
      mappingOutcome: "supported",
      evidenceDistinction: "microbial_functional_evidence",
      chainStatus: "chain_partial_supported_links_only",
      mappingSummary:
        "Fixture microbial functional evidence linked to host Foxp3 pathway — partial chain only.",
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    expect(functional.completeUnsupportedChainClaimed).toBe(false);
    expect(
      functional.taxonomicAssociationCollapsedIntoFunctionalEvidence,
    ).toBe(false);

    expect(() =>
      draftMicrobialFunctionHostPathwayMapping({
        id: "hsi-immi-mfm-taxonomic-collapse-bad",
        scope,
        microbialEntity: microbialTaxon,
        hostPathwayEntity: hostPathway,
        mappingOutcome: "supported",
        evidenceDistinction: "microbial_taxonomic_association",
        mappingSummary: "Should fail on taxonomic→functional collapse",
        authoredByPrincipalId: "agent-hsi-immi-1",
        createdAt: asOf,
        collapseTaxonomicIntoFunctional: true,
      }),
    ).toThrow(/taxonomic association must not collapse/);

    expect(() =>
      draftMicrobialFunctionHostPathwayMapping({
        id: "hsi-immi-mfm-complete-chain-bad",
        scope,
        microbialEntity: microbialTaxon,
        hostPathwayEntity: hostPathway,
        mappingOutcome: "unsupported",
        evidenceDistinction: "microbial_taxonomic_association",
        chainStatus: "chain_blocked_unsupported_links",
        mappingSummary: "Should fail when claiming complete unsupported chain",
        authoredByPrincipalId: "agent-hsi-immi-1",
        createdAt: asOf,
        claimCompleteUnsupportedChain: true,
      }),
    ).toThrow(/complete gut–immune–metabolic chains/);

    expect(
      chainBlockedByUnsupportedLinks(
        "chain_blocked_unsupported_links",
        "unsupported",
      ),
    ).toBe(true);
    expect(
      chainBlockedByUnsupportedLinks(
        "not_applicable_single_link",
        "supported",
      ),
    ).toBe(false);
  });

  test("models inflammation–metabolic phenotypes, disease-context comparisons, and contradictions", () => {
    const scope = seedScope();
    const inflamMet = draftInflammationMetabolicPhenotypeRelationship({
      id: "hsi-immi-imp-inflam-scfa",
      scope,
      inflammationEntity: inflammation,
      metabolicPhenotypeEntity: metabolicPathway,
      mappingOutcome: "uncertain",
      evidenceDistinction: "human_observational_association",
      relationshipSummary:
        "Fixture inflammation–metabolic phenotype observational association — composition correlation is not causality.",
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    expect(inflamMet.compositionCorrelationIsCausality).toBe(false);

    const diseaseCmp = draftDiseaseContextComparison({
      id: "hsi-immi-dcc-ibd-ra",
      scope,
      diseaseContextIds: [
        "hsi-hdi-ctx-ibd-fixture",
        "hsi-hdi-ctx-ra-fixture",
      ],
      comparisonOutcome: "divergence_declared",
      evidenceDistinction: "human_observational_association",
      comparisonSummary:
        "Fixture IBD vs RA gut–immune–metabolic disease-context comparison — no auto-transfer.",
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    expect(diseaseCmp.autoTransferAcrossDiseases).toBe(false);

    expect(() =>
      draftDiseaseContextComparison({
        id: "hsi-immi-dcc-single-bad",
        scope,
        diseaseContextIds: ["hsi-hdi-ctx-ibd-fixture"],
        comparisonOutcome: "overlap_declared",
        evidenceDistinction: "human_observational_association",
        comparisonSummary: "Should fail with one disease",
        authoredByPrincipalId: "agent-hsi-immi-1",
        createdAt: asOf,
      }),
    ).toThrow(/At least 2 diseaseContextIds/);

    expect(() =>
      draftDiseaseContextComparison({
        id: "hsi-immi-dcc-transfer-bad",
        scope,
        diseaseContextIds: [
          "hsi-hdi-ctx-ibd-fixture",
          "hsi-hdi-ctx-ra-fixture",
        ],
        comparisonOutcome: "overlap_declared",
        evidenceDistinction: "human_observational_association",
        comparisonSummary: "Should fail on auto-transfer",
        authoredByPrincipalId: "agent-hsi-immi-1",
        createdAt: asOf,
        claimAutoTransferAcrossDiseases: true,
      }),
    ).toThrow(/auto-transfer across diseases/);

    const contradiction = draftEvidenceContradictionAnalysis({
      id: "hsi-immi-eca-th17-competing",
      scope,
      relatedRecordIds: [inflamMet.id, diseaseCmp.id],
      contradictionStatus: "competing_evidence_declared",
      evidenceDistinctionsCompared: [
        "experimental_causal_evidence",
        "human_observational_association",
      ],
      analysisSummary:
        "Fixture competing Th17 promote vs inhibit evidence retained as distinct distinctions — not collapsed.",
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    expect(contradiction.distinctionsCollapsed).toBe(false);

    expect(() =>
      draftEvidenceContradictionAnalysis({
        id: "hsi-immi-eca-collapse-bad",
        scope,
        relatedRecordIds: [inflamMet.id],
        contradictionStatus: "contradiction_detected_declared",
        evidenceDistinctionsCompared: [
          "experimental_causal_evidence",
          "human_observational_association",
        ],
        analysisSummary: "Should fail",
        authoredByPrincipalId: "agent-hsi-immi-1",
        createdAt: asOf,
        collapseDistinctions: true,
      }),
    ).toThrow(/evidence distinctions must not be collapsed/);
  });

  test("produces reviewable profile with human acceptance and unsupported-chain blockers", () => {
    const blockedScope = seedBlockedScope();
    const blockedProfile = draftImmuneMetabolicMicrobiomeProfile({
      id: "hsi-immi-prf-blocked-demo",
      displayName: "Blocked immune–metabolic–microbiome profile",
      scope: blockedScope,
      immuneVsMetabolicPathwayComparisons: [],
      metaboliteHostInteractions: [],
      microbialFunctionHostPathwayMappings: [],
      inflammationMetabolicPhenotypeRelationships: [],
      diseaseContextComparisons: [],
      evidenceContradictionAnalyses: [],
      profileVersion: "0.1.0",
      limitations: [
        "Blocked awaiting authorised research dataset — not scientific validation.",
        "Composition correlations are not causality.",
        "Animal evidence is not automatic human translation.",
      ],
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    expect(blockedProfile.lifecycle).toBe(
      "blocked_awaiting_authorised_dataset",
    );

    const scope = seedScope();
    const blockedMapping = draftMicrobialFunctionHostPathwayMapping({
      id: "hsi-immi-mfm-blocked-chain",
      scope,
      microbialEntity: microbialTaxon,
      hostPathwayEntity: hostPathway,
      mappingOutcome: "unsupported",
      evidenceDistinction: "microbial_taxonomic_association",
      chainStatus: "chain_blocked_unsupported_links",
      mappingSummary:
        "Fixture taxonomic association alone — chain blocked without supported functional links.",
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    const chainBlockedProfile = draftImmuneMetabolicMicrobiomeProfile({
      id: "hsi-immi-prf-chain-blocked",
      displayName: "Profile blocked for unsupported chain links",
      scope,
      immuneVsMetabolicPathwayComparisons: [],
      metaboliteHostInteractions: [],
      microbialFunctionHostPathwayMappings: [blockedMapping],
      inflammationMetabolicPhenotypeRelationships: [],
      diseaseContextComparisons: [],
      evidenceContradictionAnalyses: [],
      profileVersion: "0.1.0",
      limitations: [
        "Unsupported links must not complete gut–immune–metabolic chains.",
        "Fixtures are not scientific validation.",
        "Composition correlations are not causality.",
      ],
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    expect(chainBlockedProfile.lifecycle).toBe(
      "blocked_unsupported_chain_links",
    );
    expect(() =>
      transitionImmuneMetabolicMicrobiomeProfile({
        profile: chainBlockedProfile,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "human-reviewer-1", actorKind: "human"},
      }),
    ).toThrow(
      /Invalid immune-metabolic-microbiome profile transition|human reviewer/,
    );

    const comparison = draftImmuneVsMetabolicPathwayComparison({
      id: "hsi-immi-ipc-profile-ok",
      scope,
      immunePathwayEntity: immunePathway,
      metabolicPathwayEntity: metabolicPathway,
      comparisonOutcome: "overlap_declared",
      evidenceDistinction: "host_molecular_response",
      comparisonSummary: "Fixture pathway comparison for accepted profile.",
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    const interaction = draftMetaboliteHostInteraction({
      id: "hsi-immi-mhi-profile-ok",
      scope,
      metaboliteEntity: metabolite,
      hostEntity: hostTreg,
      interactionKind: "observational_association_declared",
      evidenceDistinction: "human_observational_association",
      translationStatus: "human_evidence_declared",
      interactionSummary: "Fixture human observational metabolite–host link.",
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    const mapping = draftMicrobialFunctionHostPathwayMapping({
      id: "hsi-immi-mfm-profile-ok",
      scope,
      microbialEntity: microbialTaxon,
      hostPathwayEntity: hostPathway,
      mappingOutcome: "supported",
      evidenceDistinction: "microbial_functional_evidence",
      chainStatus: "not_applicable_single_link",
      mappingSummary: "Fixture single-link microbial functional mapping.",
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    const inflamMet = draftInflammationMetabolicPhenotypeRelationship({
      id: "hsi-immi-imp-profile-ok",
      scope,
      inflammationEntity: inflammation,
      metabolicPhenotypeEntity: metabolicPathway,
      mappingOutcome: "supported",
      evidenceDistinction: "metabolite_measurement",
      relationshipSummary: "Fixture inflammation–metabolic measurement link.",
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    const diseaseCmp = draftDiseaseContextComparison({
      id: "hsi-immi-dcc-profile-ok",
      scope,
      diseaseContextIds: [
        "hsi-hdi-ctx-ibd-fixture",
        "hsi-hdi-ctx-ra-fixture",
      ],
      comparisonOutcome: "context_dependent_declared",
      evidenceDistinction: "human_observational_association",
      comparisonSummary: "Fixture disease-context comparison for profile.",
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    const contradiction = draftEvidenceContradictionAnalysis({
      id: "hsi-immi-eca-profile-ok",
      scope,
      relatedRecordIds: [comparison.id, interaction.id],
      contradictionStatus: "none_detected_declared",
      evidenceDistinctionsCompared: [
        "host_molecular_response",
        "human_observational_association",
      ],
      analysisSummary: "Fixture contradiction analysis with no contradiction.",
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });

    let profile = draftImmuneMetabolicMicrobiomeProfile({
      id: "hsi-immi-prf-reviewable",
      displayName: "Reviewable immune–metabolic–microbiome profile",
      scope,
      immuneVsMetabolicPathwayComparisons: [comparison],
      metaboliteHostInteractions: [interaction],
      microbialFunctionHostPathwayMappings: [mapping],
      inflammationMetabolicPhenotypeRelationships: [inflamMet],
      diseaseContextComparisons: [diseaseCmp],
      evidenceContradictionAnalyses: [contradiction],
      profileVersion: "0.1.0",
      limitations: [
        "Fixtures are not scientific validation.",
        "Composition correlations are not causality.",
        "Animal evidence is not automatic human translation.",
        "Unsupported links must not complete gut–immune–metabolic chains.",
      ],
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    expect(profile.lifecycle).toBe("draft");
    expect(profile.completeUnsupportedChainClaimed).toBe(false);

    profile = transitionImmuneMetabolicMicrobiomeProfile({
      profile,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "human-reviewer-1", actorKind: "human"},
    });
    profile = transitionImmuneMetabolicMicrobiomeProfile({
      profile,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "human-reviewer-1", actorKind: "human"},
    });
    expect(profile.lifecycle).toBe("accepted_with_limitations");
    expect(profile.reviewedBy?.actorKind).toBe("human");

    const agentDraft = draftImmuneMetabolicMicrobiomeProfile({
      id: "hsi-immi-prf-agent-accept-bad",
      displayName: "Agent cannot accept",
      scope,
      immuneVsMetabolicPathwayComparisons: [comparison],
      metaboliteHostInteractions: [],
      microbialFunctionHostPathwayMappings: [],
      inflammationMetabolicPhenotypeRelationships: [],
      diseaseContextComparisons: [],
      evidenceContradictionAnalyses: [],
      profileVersion: "0.1.0",
      limitations: [
        "Fixtures are not scientific validation.",
        "Composition correlations are not causality.",
      ],
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    const underReview = transitionImmuneMetabolicMicrobiomeProfile({
      profile: agentDraft,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-immi-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionImmuneMetabolicMicrobiomeProfile({
        profile: underReview,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-immi-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/human reviewer/);
  });

  test("memory store, persistence lines, pack, and fingerprint stay fixture-honest", () => {
    const scope = seedScope();
    const blockedScope = seedBlockedScope();
    const comparison = draftImmuneVsMetabolicPathwayComparison({
      id: "hsi-immi-ipc-store-1",
      scope,
      immunePathwayEntity: immunePathway,
      metabolicPathwayEntity: metabolicPathway,
      comparisonOutcome: "overlap_declared",
      evidenceDistinction: "host_molecular_response",
      comparisonSummary: "Fixture store pathway comparison.",
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    const interaction = draftMetaboliteHostInteraction({
      id: "hsi-immi-mhi-store-1",
      scope,
      metaboliteEntity: metabolite,
      hostEntity: hostTreg,
      interactionKind: "measurement_linked_declared",
      evidenceDistinction: "metabolite_measurement",
      translationStatus: "translation_uncertain",
      interactionSummary: "Fixture store metabolite–host interaction.",
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    const mapping = draftMicrobialFunctionHostPathwayMapping({
      id: "hsi-immi-mfm-store-1",
      scope,
      microbialEntity: microbialTaxon,
      hostPathwayEntity: hostPathway,
      mappingOutcome: "supported",
      evidenceDistinction: "microbial_functional_evidence",
      chainStatus: "not_applicable_single_link",
      mappingSummary: "Fixture store microbial mapping.",
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    const inflamMet = draftInflammationMetabolicPhenotypeRelationship({
      id: "hsi-immi-imp-store-1",
      scope,
      inflammationEntity: inflammation,
      metabolicPhenotypeEntity: metabolicPathway,
      mappingOutcome: "uncertain",
      evidenceDistinction: "human_observational_association",
      relationshipSummary: "Fixture store inflammation–metabolic link.",
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    const diseaseCmp = draftDiseaseContextComparison({
      id: "hsi-immi-dcc-store-1",
      scope,
      diseaseContextIds: [
        "hsi-hdi-ctx-ibd-fixture",
        "hsi-hdi-ctx-ra-fixture",
      ],
      comparisonOutcome: "divergence_declared",
      evidenceDistinction: "human_observational_association",
      comparisonSummary: "Fixture store disease-context comparison.",
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    const contradiction = draftEvidenceContradictionAnalysis({
      id: "hsi-immi-eca-store-1",
      scope,
      relatedRecordIds: [comparison.id, mapping.id],
      contradictionStatus: "insufficient_to_analyse",
      evidenceDistinctionsCompared: [
        "microbial_functional_evidence",
        "host_molecular_response",
      ],
      analysisSummary: "Fixture store contradiction analysis insufficient.",
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });
    const profile = draftImmuneMetabolicMicrobiomeProfile({
      id: "hsi-immi-prf-store-1",
      displayName: "Store profile",
      scope,
      immuneVsMetabolicPathwayComparisons: [comparison],
      metaboliteHostInteractions: [interaction],
      microbialFunctionHostPathwayMappings: [mapping],
      inflammationMetabolicPhenotypeRelationships: [inflamMet],
      diseaseContextComparisons: [diseaseCmp],
      evidenceContradictionAnalyses: [contradiction],
      profileVersion: "0.1.0",
      limitations: [
        "Fixtures are not scientific validation.",
        "Composition correlations are not causality.",
        "Animal evidence is not automatic human translation.",
      ],
      authoredByPrincipalId: "agent-hsi-immi-1",
      createdAt: asOf,
    });

    const store = createMemoryImmuneMetabolicMicrobiomeIntelligenceStore();
    store.upsertGutImmuneMetabolicGraphScope(scope);
    store.upsertGutImmuneMetabolicGraphScope(blockedScope);
    store.upsertImmuneVsMetabolicPathwayComparison(comparison);
    store.upsertMetaboliteHostInteraction(interaction);
    store.upsertMicrobialFunctionHostPathwayMapping(mapping);
    store.upsertInflammationMetabolicPhenotypeRelationship(inflamMet);
    store.upsertDiseaseContextComparison(diseaseCmp);
    store.upsertEvidenceContradictionAnalysis(contradiction);
    store.upsertProfile(profile);

    expect(store.listGutImmuneMetabolicGraphScopes()).toHaveLength(2);
    expect(
      store.listImmuneVsMetabolicPathwayComparisons(scope.id),
    ).toHaveLength(1);
    expect(store.getProfile(profile.id)?.id).toBe(profile.id);

    const lines =
      projectImmuneMetabolicMicrobiomeIntelligencePersistenceLines({
        gutImmuneMetabolicGraphScopes: [scope, blockedScope],
        immuneVsMetabolicPathwayComparisons: [comparison],
        metaboliteHostInteractions: [interaction],
        microbialFunctionHostPathwayMappings: [mapping],
        inflammationMetabolicPhenotypeRelationships: [inflamMet],
        diseaseContextComparisons: [diseaseCmp],
        evidenceContradictionAnalyses: [contradiction],
        profiles: [profile],
      });
    expect(lines).toContain(
      "schema=hsi-immune-metabolic-microbiome-intelligence-1",
    );
    expect(lines).toContain("compositionCorrelationIsNotCausality=true");
    expect(lines).toContain(
      "animalEvidenceIsNotAutomaticHumanTranslation=true",
    );
    expect(lines).toContain("neon=red-wave-only");

    const pack = buildImmuneMetabolicMicrobiomeIntelligencePack({
      gutImmuneMetabolicGraphScopes: [scope, blockedScope],
      immuneVsMetabolicPathwayComparisons: [comparison],
      metaboliteHostInteractions: [interaction],
      microbialFunctionHostPathwayMappings: [mapping],
      inflammationMetabolicPhenotypeRelationships: [inflamMet],
      diseaseContextComparisons: [diseaseCmp],
      evidenceContradictionAnalyses: [contradiction],
      profiles: [profile],
      asOf,
    });
    expect(pack.gutImmuneMetabolicGraphScopeCount).toBe(2);
    expect(pack.profileCount).toBe(1);
    expect(pack.axisBandCount).toBe(5);
    expect(pack.capabilityKindCount).toBe(6);
    expect(pack.evidenceDistinctionCount).toBe(6);
    expect(pack.honesty.compositionCorrelationIsNotCausality).toBe(true);
    expect(pack.honesty.scientificApproval).toBe(false);

    const fp = fingerprintImmuneMetabolicMicrobiomeProfile(profile);
    expect(fp).toMatch(/^[a-f0-9]{64}$/);
  });
});
