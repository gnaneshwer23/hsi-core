/**
 * Milestone 16 PR1 — human systems intelligence contract honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  CROSS_DISEASE_MECHANISM_RELATIONSHIP_CLASSIFICATIONS,
  HSYS_PERMITTED_RESEARCH_USES,
  buildHumanSystemsIntelligencePack,
  createMemoryHumanSystemsIntelligenceStore,
  draftCrossDiseaseInvestigation,
  draftCrossDiseaseMechanismRelationship,
  draftMultimorbidityResearchContext,
  draftOrganSystemRelationship,
  draftSystemsSimulation,
  fingerprintCrossDiseaseInvestigation,
  projectHumanSystemsIntelligencePersistenceLines,
  transitionCrossDiseaseInvestigation,
  transitionSystemsSimulation,
  type CrossDiseaseInvestigation,
} from "../src/humanSystemsIntelligenceContracts";

const asOf = "2026-11-09T14:00:00.000Z";

function seedFixtureInvestigation(
  overrides?: Partial<Parameters<typeof draftCrossDiseaseInvestigation>[0]>,
): CrossDiseaseInvestigation {
  return draftCrossDiseaseInvestigation({
    id: "hsi-hsys-inv-ssc-ra-fixture",
    displayName: "Fixture SSc–RA cross-disease investigation",
    scientificQuestion:
      "Which fixture cross-disease mechanism relationship classifications can be governed without claiming shared causal mechanisms or auto-transfer?",
    diseaseContextIds: [
      "hsi-hdi-ctx-ssc-fixture",
      "hsi-hdi-ctx-ra-fixture",
    ],
    permittedResearchUses: [
      "cross_disease_mechanism_research",
      "multimorbidity_association_research",
      "systems_simulation_research",
      "methods_engineering_fixture",
    ],
    datasetAvailability: "fixture_only",
    accessClassification: "fixture_engineering",
    authoredByPrincipalId: "agent-hsi-hsys-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    csolSpecId: "hsi-csol-spec-fixture-demo",
    rweStudyId: "hsi-rwe-study-fixture-demo",
    longitudinalAnalysisSpecId: "hsi-lce-spec-lab-trend-fixture",
    cohortDefinitionId: "hsi-rcb-coh-fixture-reserved",
    ...overrides,
  });
}

function seedBlockedInvestigation(): CrossDiseaseInvestigation {
  return draftCrossDiseaseInvestigation({
    id: "hsi-hsys-inv-blocked-demo",
    displayName: "Blocked cross-disease investigation until authorised dataset",
    scientificQuestion:
      "Blocked scientific path until an authorised research dataset is supplied.",
    diseaseContextIds: [
      "hsi-hdi-ctx-blocked-a",
      "hsi-hdi-ctx-blocked-b",
    ],
    permittedResearchUses: ["methods_engineering_fixture"],
    datasetAvailability: "blocked_no_authorised_clinical_dataset",
    authoredByPrincipalId: "agent-hsi-hsys-1",
    createdAt: asOf,
  });
}

describe("human systems intelligence contracts (M16 PR1)", () => {
  test("cross-disease investigation requires ≥2 HDI contexts and honesty gates", () => {
    expect(HSYS_PERMITTED_RESEARCH_USES).toContain(
      "cross_disease_mechanism_research",
    );
    const investigation = seedFixtureInvestigation();
    expect(investigation.diseaseContextIds).toHaveLength(2);
    expect(investigation.autoTransferAcrossDiseases).toBe(false);
    expect(investigation.containsIdentifiablePhi).toBe(false);
    expect(investigation.honesty.sharedGeneIsNotSharedCausalMechanism).toBe(
      true,
    );
    expect(investigation.honesty.pathwayEnrichmentIsNotActivation).toBe(true);
    expect(investigation.honesty.coOccurrenceIsNotCausation).toBe(true);
    expect(investigation.honesty.noWholeBodySimulationClaim).toBe(true);
    expect(investigation.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(investigation.csolSpecId).toBe("hsi-csol-spec-fixture-demo");
    expect(fingerprintCrossDiseaseInvestigation(investigation)).toMatch(
      /^[a-f0-9]{64}$/,
    );

    expect(() =>
      draftCrossDiseaseInvestigation({
        id: "hsi-hsys-inv-single-bad",
        displayName: "Single disease masquerade",
        scientificQuestion: "Only one disease context",
        diseaseContextIds: ["hsi-hdi-ctx-ssc-only"],
        permittedResearchUses: ["methods_engineering_fixture"],
        authoredByPrincipalId: "agent-hsi-hsys-1",
        createdAt: asOf,
      }),
    ).toThrow(/At least 2 diseaseContextIds/);
  });

  test("mechanism relationship classifications preserve gene≠mechanism and enrichment≠activation", () => {
    expect(CROSS_DISEASE_MECHANISM_RELATIONSHIP_CLASSIFICATIONS).toContain(
      "shared_gene_association",
    );
    expect(CROSS_DISEASE_MECHANISM_RELATIONSHIP_CLASSIFICATIONS).toContain(
      "shared_pathway_enrichment",
    );
    const investigation = seedFixtureInvestigation();

    const geneLink = draftCrossDiseaseMechanismRelationship({
      id: "hsi-hsys-cmr-gene-fixture",
      investigation,
      displayName: "Fixture shared gene association",
      diseaseContextIdA: "hsi-hdi-ctx-ssc-fixture",
      diseaseContextIdB: "hsi-hdi-ctx-ra-fixture",
      relationshipClassification: "shared_gene_association",
      mechanismSummary:
        "Fixture shared gene association across SSc and RA research contexts — not a shared causal mechanism",
      limitations: [
        "Shared gene association is not a shared causal mechanism.",
        "Auto-transfer of mechanisms across diseases is forbidden.",
      ],
      authoredByPrincipalId: "agent-hsi-hsys-1",
      createdAt: asOf,
      ontologyConceptRef: "ontology:gene:FIXTURE1",
      provenanceNote: "fixture_declared",
    });
    expect(geneLink.sharedGeneIsNotSharedCausalMechanism).toBe(true);
    expect(geneLink.autoTransferAcrossDiseases).toBe(false);
    expect(geneLink.inventedStatistics).toBeNull();

    const enrichment = draftCrossDiseaseMechanismRelationship({
      id: "hsi-hsys-cmr-enrich-fixture",
      investigation,
      displayName: "Fixture pathway enrichment association",
      diseaseContextIdA: "hsi-hdi-ctx-ssc-fixture",
      diseaseContextIdB: "hsi-hdi-ctx-ra-fixture",
      relationshipClassification: "shared_pathway_enrichment",
      mechanismSummary:
        "Fixture shared pathway enrichment signal — enrichment is not activation",
      limitations: [
        "Pathway enrichment is not pathway activation.",
        "Co-occurrence is not causation.",
      ],
      authoredByPrincipalId: "agent-hsi-hsys-1",
      createdAt: asOf,
    });
    expect(enrichment.pathwayEnrichmentIsNotActivation).toBe(true);

    expect(() =>
      draftCrossDiseaseMechanismRelationship({
        id: "hsi-hsys-cmr-bad-gene",
        investigation,
        displayName: "Bad shared causal claim",
        diseaseContextIdA: "hsi-hdi-ctx-ssc-fixture",
        diseaseContextIdB: "hsi-hdi-ctx-ra-fixture",
        relationshipClassification: "shared_gene_association",
        mechanismSummary:
          "This shared gene proves a shared causal mechanism across diseases",
        limitations: ["x"],
        authoredByPrincipalId: "agent-hsi-hsys-1",
        createdAt: asOf,
      }),
    ).toThrow(/shared causal mechanism/);

    expect(() =>
      draftCrossDiseaseMechanismRelationship({
        id: "hsi-hsys-cmr-bad-enrich",
        investigation,
        displayName: "Bad activation claim",
        diseaseContextIdA: "hsi-hdi-ctx-ssc-fixture",
        diseaseContextIdB: "hsi-hdi-ctx-ra-fixture",
        relationshipClassification: "shared_pathway_enrichment",
        mechanismSummary: "Enrichment demonstrates pathway activation here",
        limitations: ["x"],
        authoredByPrincipalId: "agent-hsi-hsys-1",
        createdAt: asOf,
      }),
    ).toThrow(/pathway activation/);
  });

  test("organ-system relationships refuse whole-body physiology claims", () => {
    const investigation = seedFixtureInvestigation();
    const relationship = draftOrganSystemRelationship({
      id: "hsi-hsys-osr-immune-gi-fixture",
      investigation,
      displayName: "Fixture immune–GI organ-system relationship",
      organSystemA: "immune",
      organSystemB: "gastrointestinal",
      relationshipKind: "gut_immune_metabolic_axis_association",
      relationshipSummary:
        "Fixture gut–immune axis association for research framing — not whole-body physiology",
      limitations: [
        "Organ-system association is not validated whole-body physiology.",
        "No live multiscale engine is claimed.",
      ],
      authoredByPrincipalId: "agent-hsi-hsys-1",
      createdAt: asOf,
      csolSpecId: "hsi-csol-spec-fixture-demo",
    });
    expect(relationship.wholeBodyPhysiologyClaimed).toBe(false);
    expect(relationship.organSystemA).toBe("immune");
    expect(relationship.organSystemB).toBe("gastrointestinal");

    expect(() =>
      draftOrganSystemRelationship({
        id: "hsi-hsys-osr-same-bad",
        displayName: "Same system",
        organSystemA: "immune",
        organSystemB: "immune",
        relationshipKind: "inflammatory_axis_association",
        relationshipSummary: "Same system pair",
        limitations: ["x"],
        authoredByPrincipalId: "agent-hsi-hsys-1",
        createdAt: asOf,
      }),
    ).toThrow(/two distinct systems/);

    expect(() =>
      draftOrganSystemRelationship({
        id: "hsi-hsys-osr-wb-bad",
        displayName: "Whole-body claim",
        organSystemA: "immune",
        organSystemB: "cardiovascular",
        relationshipKind: "physiological_coupling_declared",
        relationshipSummary:
          "This validates a whole-body simulation of human physiology",
        limitations: ["x"],
        authoredByPrincipalId: "agent-hsi-hsys-1",
        createdAt: asOf,
      }),
    ).toThrow(/whole-body simulation|must not diagnose/);
  });

  test("multimorbidity context preserves co-occurrence ≠ causation", () => {
    const investigation = seedFixtureInvestigation();
    const context = draftMultimorbidityResearchContext({
      id: "hsi-hsys-mm-ssc-ra-fixture",
      investigation,
      displayName: "Fixture SSc–RA multimorbidity research context",
      diseaseContextIds: [
        "hsi-hdi-ctx-ssc-fixture",
        "hsi-hdi-ctx-ra-fixture",
      ],
      populationFraming:
        "Fixture engineering multimorbidity framing — not an authorised clinical population",
      coOccurrenceFraming:
        "Declared fixture co-occurrence framing — co-occurrence is not causation",
      permittedResearchUses: [
        "multimorbidity_association_research",
        "methods_engineering_fixture",
      ],
      limitations: [
        "Co-occurrence is not causation.",
        "Invented prevalence or effect sizes are forbidden.",
      ],
      authoredByPrincipalId: "agent-hsi-hsys-1",
      createdAt: asOf,
      rweStudyId: "hsi-rwe-study-fixture-demo",
      cohortDefinitionId: "hsi-rcb-coh-fixture-reserved",
    });
    expect(context.coOccurrenceIsNotCausation).toBe(true);
    expect(context.causalMultimorbidityNetworkClaimed).toBe(false);
    expect(context.inventedPrevalenceOrEffectSize).toBeNull();

    expect(() =>
      draftMultimorbidityResearchContext({
        id: "hsi-hsys-mm-stats-bad",
        displayName: "Invented stats",
        diseaseContextIds: [
          "hsi-hdi-ctx-ssc-fixture",
          "hsi-hdi-ctx-ra-fixture",
        ],
        populationFraming: "Fixture population",
        coOccurrenceFraming: "Co-occurrence with prevalence = 42% claimed",
        permittedResearchUses: ["methods_engineering_fixture"],
        limitations: ["x"],
        authoredByPrincipalId: "agent-hsi-hsys-1",
        createdAt: asOf,
      }),
    ).toThrow(/invent effect sizes|must not diagnose/);
  });

  test("systems simulation is research-scoped with validation scope and no whole-body claim", () => {
    const investigation = seedFixtureInvestigation();
    const organ = draftOrganSystemRelationship({
      id: "hsi-hsys-osr-sim-link",
      investigation,
      displayName: "Fixture organ link for simulation",
      organSystemA: "immune",
      organSystemB: "endocrine_metabolic",
      relationshipKind: "metabolic_axis_association",
      relationshipSummary: "Fixture metabolic axis association for research",
      limitations: [
        "Research association only — not whole-body physiology.",
      ],
      authoredByPrincipalId: "agent-hsi-hsys-1",
      createdAt: asOf,
    });
    const mechanism = draftCrossDiseaseMechanismRelationship({
      id: "hsi-hsys-cmr-sim-link",
      investigation,
      displayName: "Fixture mechanism link for simulation",
      diseaseContextIdA: "hsi-hdi-ctx-ssc-fixture",
      diseaseContextIdB: "hsi-hdi-ctx-ra-fixture",
      relationshipClassification: "uncertain_relationship",
      mechanismSummary: "Fixture uncertain cross-disease relationship",
      limitations: [
        "Uncertain relationship — not a shared causal mechanism.",
      ],
      authoredByPrincipalId: "agent-hsi-hsys-1",
      createdAt: asOf,
    });
    const multimorbidity = draftMultimorbidityResearchContext({
      id: "hsi-hsys-mm-sim-link",
      investigation,
      displayName: "Fixture multimorbidity for simulation",
      diseaseContextIds: [
        "hsi-hdi-ctx-ssc-fixture",
        "hsi-hdi-ctx-ra-fixture",
      ],
      populationFraming: "Fixture population framing",
      coOccurrenceFraming: "Fixture co-occurrence — not causation",
      permittedResearchUses: ["systems_simulation_research"],
      limitations: ["Co-occurrence is not causation."],
      authoredByPrincipalId: "agent-hsi-hsys-1",
      createdAt: asOf,
    });

    const simulation = draftSystemsSimulation({
      id: "hsi-hsys-sim-fixture-001",
      investigation,
      multimorbidityContext: multimorbidity,
      displayName: "Fixture research-scoped systems simulation",
      researchQuestion:
        "What multi-organ research associations can a fixture systems simulation explore without whole-body claims?",
      validationScope: "multi_organ_research_scoped_not_whole_body",
      organSystemRelationshipIds: [organ.id],
      mechanismRelationshipIds: [mechanism.id],
      limitations: [
        "Research-only systems simulation — not a whole-body simulation.",
        "M11 multiscale engine is skipped/missing; live engine not operational.",
        "Not diagnosis or treatment selection.",
      ],
      authoredByPrincipalId: "agent-hsi-hsys-1",
      createdAt: asOf,
    });
    expect(simulation.researchOnly).toBe(true);
    expect(simulation.wholeBodySimulationClaimed).toBe(false);
    expect(simulation.liveMultiscaleEngineOperational).toBe(false);
    expect(simulation.m11SimulationClaimed).toBe(false);
    expect(simulation.inventedParameters).toBeNull();
    expect(simulation.validationScope).toBe(
      "multi_organ_research_scoped_not_whole_body",
    );

    expect(() =>
      draftSystemsSimulation({
        id: "hsi-hsys-sim-wb-bad",
        displayName: "Whole-body bad",
        researchQuestion:
          "Run a whole-body simulation for clinical decision-making",
        validationScope: "fixture_engineering_only",
        limitations: ["x"],
        authoredByPrincipalId: "agent-hsi-hsys-1",
        createdAt: asOf,
      }),
    ).toThrow(/whole-body simulation|clinical decision|must not diagnose/);
  });

  test("blocked dataset paths cannot be accepted; human review required", () => {
    const blocked = seedBlockedInvestigation();
    expect(blocked.lifecycle).toBe("blocked_awaiting_authorised_dataset");
    expect(() =>
      transitionCrossDiseaseInvestigation({
        investigation: blocked,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "principal-researcher", actorKind: "human"},
      }),
    ).toThrow(/Illegal lifecycle transition/);

    const fixture = seedFixtureInvestigation();
    const underReview = transitionCrossDiseaseInvestigation({
      investigation: fixture,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-hsys-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionCrossDiseaseInvestigation({
        investigation: underReview,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-hsys-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Only human researchers/);
    const accepted = transitionCrossDiseaseInvestigation({
      investigation: underReview,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher", actorKind: "human"},
    });
    expect(accepted.lifecycle).toBe("accepted_with_limitations");

    const engineBlocked = draftSystemsSimulation({
      id: "hsi-hsys-sim-engine-blocked",
      displayName: "Blocked for missing multiscale engine",
      researchQuestion: "Blocked until a live multiscale engine exists",
      validationScope: "blocked_no_live_multiscale_engine",
      limitations: [
        "Live multiscale engine is not operational; M11 skipped/missing.",
      ],
      authoredByPrincipalId: "agent-hsi-hsys-1",
      createdAt: asOf,
    });
    expect(engineBlocked.lifecycle).toBe("blocked_no_live_multiscale_engine");
    expect(() =>
      transitionSystemsSimulation({
        simulation: engineBlocked,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "principal-researcher", actorKind: "human"},
      }),
    ).toThrow(/Illegal lifecycle transition/);
  });

  test("memory store round-trips and persistence lines stay honest", () => {
    const investigation = seedFixtureInvestigation();
    const mechanism = draftCrossDiseaseMechanismRelationship({
      id: "hsi-hsys-cmr-store",
      investigation,
      displayName: "Fixture store mechanism relationship",
      diseaseContextIdA: "hsi-hdi-ctx-ssc-fixture",
      diseaseContextIdB: "hsi-hdi-ctx-ra-fixture",
      relationshipClassification: "co_occurrence_association",
      mechanismSummary:
        "Fixture co-occurrence association — co-occurrence is not causation",
      limitations: ["Co-occurrence is not causation."],
      authoredByPrincipalId: "agent-hsi-hsys-1",
      createdAt: asOf,
    });
    const organ = draftOrganSystemRelationship({
      id: "hsi-hsys-osr-store",
      investigation,
      displayName: "Fixture store organ-system relationship",
      organSystemA: "immune",
      organSystemB: "respiratory",
      relationshipKind: "inflammatory_axis_association",
      relationshipSummary: "Fixture inflammatory axis association",
      limitations: [
        "Not validated whole-body physiology.",
      ],
      authoredByPrincipalId: "agent-hsi-hsys-1",
      createdAt: asOf,
    });
    const multimorbidity = draftMultimorbidityResearchContext({
      id: "hsi-hsys-mm-store",
      investigation,
      displayName: "Fixture store multimorbidity context",
      diseaseContextIds: [
        "hsi-hdi-ctx-ssc-fixture",
        "hsi-hdi-ctx-ra-fixture",
      ],
      populationFraming: "Fixture population",
      coOccurrenceFraming: "Fixture co-occurrence — not causation",
      permittedResearchUses: ["multimorbidity_association_research"],
      limitations: ["Co-occurrence is not causation."],
      authoredByPrincipalId: "agent-hsi-hsys-1",
      createdAt: asOf,
    });
    const simulation = draftSystemsSimulation({
      id: "hsi-hsys-sim-store",
      investigation,
      multimorbidityContext: multimorbidity,
      displayName: "Fixture store systems simulation",
      researchQuestion: "Fixture research-scoped systems simulation envelope",
      validationScope: "fixture_engineering_only",
      organSystemRelationshipIds: [organ.id],
      mechanismRelationshipIds: [mechanism.id],
      limitations: [
        "Research-only; not a whole-body simulation; M11 engine absent.",
      ],
      authoredByPrincipalId: "agent-hsi-hsys-1",
      createdAt: asOf,
    });

    const store = createMemoryHumanSystemsIntelligenceStore();
    store.upsertInvestigation(investigation);
    store.upsertMechanismRelationship(mechanism);
    store.upsertOrganSystemRelationship(organ);
    store.upsertMultimorbidityContext(multimorbidity);
    store.upsertSystemsSimulation(simulation);
    expect(store.listInvestigations()).toHaveLength(1);
    expect(store.listMechanismRelationships(investigation.id)).toHaveLength(1);
    expect(store.listOrganSystemRelationships(investigation.id)).toHaveLength(
      1,
    );
    expect(store.listMultimorbidityContexts()).toHaveLength(1);
    expect(store.listSystemsSimulations()).toHaveLength(1);

    const lines = projectHumanSystemsIntelligencePersistenceLines({
      investigations: [investigation],
      mechanismRelationships: [mechanism],
      organSystemRelationships: [organ],
      multimorbidityContexts: [multimorbidity],
      systemsSimulations: [simulation],
    });
    expect(lines).toContain("sharedGeneIsNotSharedCausalMechanism=true");
    expect(lines).toContain("pathwayEnrichmentIsNotActivation=true");
    expect(lines).toContain("coOccurrenceIsNotCausation=true");
    expect(lines).toContain("wholeBodySimulationClaimed=false");
    expect(lines).toContain("liveMultiscaleEngine=false");
    expect(lines).toContain("noDuplicateEntityRegistries=true");

    const pack = buildHumanSystemsIntelligencePack({
      investigations: [investigation],
      mechanismRelationships: [mechanism],
      organSystemRelationships: [organ],
      multimorbidityContexts: [multimorbidity],
      systemsSimulations: [simulation],
      asOf,
    });
    expect(pack.investigationCount).toBe(1);
    expect(pack.honesty.noAutoTransferOfMechanismsAcrossDiseases).toBe(true);
    expect(pack.honesty.noInventedMechanismsOrStatistics).toBe(true);
  });
});
