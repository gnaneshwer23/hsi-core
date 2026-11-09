/**
 * Milestone 16 / PR1 — human systems intelligence pack check.
 * Offline contracts only — no diagnosis, treatment selection, whole-body
 * simulation, invented mechanisms/statistics, or live multiscale claims.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  CROSS_DISEASE_MECHANISM_RELATIONSHIP_CLASSIFICATIONS,
  HUMAN_SYSTEMS_INTELLIGENCE_METHOD,
  HUMAN_SYSTEMS_INTELLIGENCE_SCHEMA,
  HUMAN_SYSTEMS_INTELLIGENCE_VERSION,
  HSYS_PERMITTED_RESEARCH_USES,
  buildHumanSystemsIntelligencePack,
  draftCrossDiseaseInvestigation,
  draftCrossDiseaseMechanismRelationship,
  draftMultimorbidityResearchContext,
  draftOrganSystemRelationship,
  draftSystemsSimulation,
  projectHumanSystemsIntelligencePersistenceLines,
  transitionCrossDiseaseInvestigation,
  transitionSystemsSimulation,
} from "../src/humanSystemsIntelligenceContracts";

const asOf = "2026-11-09T14:00:00.000Z";
const outDir = "evaluation/human-systems-intelligence";

function fixturePack() {
  const blocked = draftCrossDiseaseInvestigation({
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
    authoredByPrincipalId: "fixture-agent-hsys",
    createdAt: asOf,
  });

  const draft = draftCrossDiseaseInvestigation({
    id: "hsi-hsys-inv-ssc-ra-demo",
    displayName: "Fixture SSc–RA cross-disease investigation",
    scientificQuestion:
      "Fixture cross-disease envelopes — shared gene/pathway associations without causal auto-transfer.",
    diseaseContextIds: [
      "hsi-hdi-ctx-ssc-fixture",
      "hsi-hdi-ctx-ra-fixture",
    ],
    permittedResearchUses: [
      "cross_disease_mechanism_research",
      "multimorbidity_association_research",
      "organ_system_relationship_research",
      "systems_simulation_research",
      "methods_engineering_fixture",
    ],
    datasetAvailability: "fixture_only",
    accessClassification: "fixture_engineering",
    authoredByPrincipalId: "fixture-agent-hsys",
    createdAt: asOf,
    csolSpecId: "hsi-csol-spec-fixture-demo",
    rweStudyId: "hsi-rwe-study-fixture-demo",
    longitudinalAnalysisSpecId: "hsi-lce-spec-lab-trend-demo",
    cohortDefinitionId: "hsi-rcb-coh-fixture-reserved",
  });
  const underReview = transitionCrossDiseaseInvestigation({
    investigation: draft,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-hsys", actorKind: "ai_agent"},
  });
  const investigation = transitionCrossDiseaseInvestigation({
    investigation: underReview,
    to: "accepted_with_limitations",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const mechanism = draftCrossDiseaseMechanismRelationship({
    id: "hsi-hsys-cmr-gene-demo",
    investigation,
    displayName: "Fixture shared gene association",
    diseaseContextIdA: "hsi-hdi-ctx-ssc-fixture",
    diseaseContextIdB: "hsi-hdi-ctx-ra-fixture",
    relationshipClassification: "shared_gene_association",
    mechanismSummary:
      "Fixture shared gene association — not a shared causal mechanism; auto-transfer forbidden",
    limitations: [
      "Shared gene association is not a shared causal mechanism.",
      "Pathway enrichment is not pathway activation.",
      "Auto-transfer of mechanisms across diseases is forbidden.",
    ],
    authoredByPrincipalId: "fixture-agent-hsys",
    createdAt: asOf,
    ontologyConceptRef: "ontology:gene:FIXTURE1",
    provenanceNote: "fixture_declared",
  });

  const organ = draftOrganSystemRelationship({
    id: "hsi-hsys-osr-immune-gi-demo",
    investigation,
    displayName: "Fixture immune–GI organ-system relationship",
    organSystemA: "immune",
    organSystemB: "gastrointestinal",
    relationshipKind: "gut_immune_metabolic_axis_association",
    relationshipSummary:
      "Fixture gut–immune–metabolic axis association — not whole-body physiology",
    limitations: [
      "Organ-system association is not validated whole-body physiology.",
      "No live multiscale engine is claimed.",
    ],
    authoredByPrincipalId: "fixture-agent-hsys",
    createdAt: asOf,
    csolSpecId: "hsi-csol-spec-fixture-demo",
  });

  const multimorbidity = draftMultimorbidityResearchContext({
    id: "hsi-hsys-mm-ssc-ra-demo",
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
    authoredByPrincipalId: "fixture-agent-hsys",
    createdAt: asOf,
    rweStudyId: "hsi-rwe-study-fixture-demo",
    cohortDefinitionId: "hsi-rcb-coh-fixture-reserved",
  });

  const simulationDraft = draftSystemsSimulation({
    id: "hsi-hsys-sim-demo-001",
    investigation,
    multimorbidityContext: multimorbidity,
    displayName: "Fixture research-scoped systems simulation",
    researchQuestion:
      "Fixture multi-organ research simulation envelope under declared validation scope — not whole-body.",
    validationScope: "multi_organ_research_scoped_not_whole_body",
    organSystemRelationshipIds: [organ.id],
    mechanismRelationshipIds: [mechanism.id],
    limitations: [
      "Research-only systems simulation — not a whole-body simulation.",
      "M11 multiscale engine is skipped/missing; live engine not operational.",
      "Synthetic/fixture results are not scientific validation when authorised dataset is blocked.",
    ],
    authoredByPrincipalId: "fixture-agent-hsys",
    createdAt: asOf,
  });
  const simulationReview = transitionSystemsSimulation({
    simulation: simulationDraft,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-hsys", actorKind: "ai_agent"},
  });
  const simulation = transitionSystemsSimulation({
    simulation: simulationReview,
    to: "accepted_with_limitations",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const investigations = [blocked, investigation];
  const pack = buildHumanSystemsIntelligencePack({
    investigations,
    mechanismRelationships: [mechanism],
    organSystemRelationships: [organ],
    multimorbidityContexts: [multimorbidity],
    systemsSimulations: [simulation],
    asOf,
  });
  const persistenceLines = projectHumanSystemsIntelligencePersistenceLines({
    investigations,
    mechanismRelationships: [mechanism],
    organSystemRelationships: [organ],
    multimorbidityContexts: [multimorbidity],
    systemsSimulations: [simulation],
  });

  return {pack, persistenceLines, blocked};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines, blocked} = fixturePack();
  writeFileSync(
    join(outDir, "human-systems-intelligence-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: HUMAN_SYSTEMS_INTELLIGENCE_SCHEMA,
        method: HUMAN_SYSTEMS_INTELLIGENCE_METHOD,
        version: HUMAN_SYSTEMS_INTELLIGENCE_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        datasetAvailabilityBlocked: blocked.datasetAvailability,
        scientificPathBlockedNoAuthorisedDataset: true,
        researchIntelligenceOnly: true,
        notDiagnosisOrTreatmentSelection: true,
        sharedGeneIsNotSharedCausalMechanism: true,
        pathwayEnrichmentIsNotActivation: true,
        coOccurrenceIsNotCausation: true,
        noAutoTransferOfMechanismsAcrossDiseases: true,
        noDuplicateEntityRegistries: true,
        wholeBodySimulationClaimed: false,
        liveMultiscaleEngine: false,
        m11SimulationClaimed: false,
        inventedMechanismsOrStatistics: false,
        workbenchUi: false,
        neonProjectPolicy: "red-wave-only",
        migration: "deferred",
        relationshipClassificationCount:
          CROSS_DISEASE_MECHANISM_RELATIONSHIP_CLASSIFICATIONS.length,
        permittedResearchUseCount: HSYS_PERMITTED_RESEARCH_USES.length,
        persistenceLineCount: persistenceLines.length,
        persistenceLines,
      },
      null,
      2,
    )}\n`,
  );
}

const checkOnly = process.argv.includes("--check");
if (checkOnly) {
  const {pack, blocked} = fixturePack();
  if (
    pack.investigationCount < 2 ||
    pack.mechanismRelationshipCount !== 1 ||
    pack.organSystemRelationshipCount !== 1 ||
    pack.multimorbidityContextCount !== 1 ||
    pack.systemsSimulationCount !== 1
  ) {
    throw new Error("Human systems intelligence pack check failed");
  }
  if (pack.honesty.sharedGeneIsNotSharedCausalMechanism !== true) {
    throw new Error("Shared-gene honesty gate failed");
  }
  if (pack.honesty.pathwayEnrichmentIsNotActivation !== true) {
    throw new Error("Pathway-enrichment honesty gate failed");
  }
  if (pack.honesty.coOccurrenceIsNotCausation !== true) {
    throw new Error("Co-occurrence honesty gate failed");
  }
  if (pack.honesty.noWholeBodySimulationClaim !== true) {
    throw new Error("Whole-body simulation honesty gate failed");
  }
  if (
    blocked.datasetAvailability !== "blocked_no_authorised_clinical_dataset"
  ) {
    throw new Error("Dataset blocker must remain declared");
  }
  console.log(
    `human-systems-intelligence-contracts check ok (${pack.investigationCount} investigations, ${pack.mechanismRelationshipCount} mechanism relationships, ${pack.organSystemRelationshipCount} organ-system relationships, ${pack.multimorbidityContextCount} multimorbidity contexts, ${pack.systemsSimulationCount} systems simulations; dataset blocked declared)`,
  );
} else {
  writeOutputs();
  console.log(`Wrote ${outDir}/human-systems-intelligence-pack.v1.json`);
}
