/**
 * Milestone 12 PR1 — therapeutic discovery data contract honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  buildTherapeuticDiscoveryPack,
  createMemoryTherapeuticDiscoveryStore,
  draftCompoundOrIntervention,
  draftTargetCandidate,
  draftTargetInterventionAssessment,
  draftTherapeuticProgramme,
  fingerprintTherapeuticProgramme,
  INTERVENTION_KINDS,
  projectTherapeuticDiscoveryPersistenceLines,
  transitionTargetCandidate,
  transitionTargetInterventionAssessment,
  transitionTherapeuticProgramme,
  type TherapeuticProgramme,
} from "../src/therapeuticDiscoveryDataContracts";

const asOf = "2026-11-09T16:00:00.000Z";

function seedProgramme(
  overrides?: Partial<Parameters<typeof draftTherapeuticProgramme>[0]>,
): TherapeuticProgramme {
  return draftTherapeuticProgramme({
    id: "hsi-tx-prog-ssc-il6-fixture",
    name: "SSc IL-6 pathway therapeutic scoping (fixture)",
    researchQuestion:
      "Which IL-6-axis targets deserve further mechanistic investigation in SSc research context?",
    diseaseContext: "Systemic sclerosis (research fixture context)",
    indicationScope: "Research scoping only — not a treatment programme.",
    authoredByPrincipalId: "agent-hsi-tx-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    investigationId: "inv-ssc-mech-001",
    hypothesisIds: ["hyp-ssc-il6-001"],
    orgId: "org-hsi-fixture-1",
    translationalProgrammeContractId: "tec-ssc-il6-001",
    identities: [
      {
        system: "open_targets_disease",
        value: "EFO_0000699",
        label: "systemic sclerosis",
        resolution: "resolved_prefix",
        claimSupport: "not_assessed",
      },
    ],
    ...overrides,
  });
}

describe("therapeutic discovery data contracts (M12 PR1)", () => {
  test("drafts programme with M3/M4/M6/M9 links and honesty gates", () => {
    const programme = seedProgramme();
    expect(programme.lifecycle).toBe("proposed");
    expect(programme.investigationId).toBe("inv-ssc-mech-001");
    expect(programme.hypothesisIds).toEqual(["hyp-ssc-il6-001"]);
    expect(programme.orgId).toBe("org-hsi-fixture-1");
    expect(programme.translationalProgrammeContractId).toBe("tec-ssc-il6-001");
    expect(programme.honesty.associationIsNotEfficacy).toBe(true);
    expect(programme.honesty.noTreatmentRecommendations).toBe(true);
    expect(programme.honesty.noChemblLivePull).toBe(true);
    expect(programme.honesty.doesNotManufactureCertainty).toBe(true);
    expect(programme.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(fingerprintTherapeuticProgramme(programme)).toMatch(/^[a-f0-9]{64}$/);
  });

  test("drafts target candidate without invented priority scores", () => {
    const programme = seedProgramme();
    const target = draftTargetCandidate({
      id: "hsi-tx-tgt-il6r-fixture",
      programme,
      name: "IL6R",
      geneSymbol: "IL6R",
      proteinLabel: "Interleukin-6 receptor subunit alpha",
      rationale:
        "Public pathway neighbourhood suggests IL6R as a research target candidate for further investigation.",
      biologicalPlausibilityNote:
        "Mechanistic neighbourhood plausibility only — not predictive validity.",
      authoredByPrincipalId: "agent-hsi-tx-1",
      createdAt: asOf,
      evidenceStrength: "associative_only",
      identities: [
        {
          system: "open_targets_target",
          value: "ENSG00000160712",
          label: "IL6R",
          resolution: "resolved_prefix",
          claimSupport: "not_assessed",
        },
        {
          system: "uniprot",
          value: "P08887",
          label: "IL6RA_HUMAN",
          resolution: "resolved_prefix",
          claimSupport: "not_assessed",
        },
      ],
    });
    expect(target.inventedPriorityScore).toBeNull();
    expect(target.biologicalPlausibilityIsNotPredictiveValidity).toBe(true);
    expect(target.programmeId).toBe(programme.id);
    expect(() =>
      draftTargetCandidate({
        id: "hsi-tx-tgt-bad-score",
        programme,
        name: "Bad",
        rationale: "priority score = 0.92 invented",
        biologicalPlausibilityNote: "ok note",
        authoredByPrincipalId: "agent-hsi-tx-1",
        createdAt: asOf,
      }),
    ).toThrow(/must not invent scores/);
  });

  test("distinguishes intervention kinds and ChEMBL stub-only ids", () => {
    const programme = seedProgramme();
    const compound = draftCompoundOrIntervention({
      id: "hsi-tx-int-mtx-fixture",
      programme,
      name: "Methotrexate (research fixture)",
      interventionKind: "molecular_compound",
      publicSmiles:
        "CN(Cc1cnc2nc(N)nc(N)c2n1)c1ccc(C(=O)N[C@@H](CCC(=O)O)C(=O)O)cc1",
      authoredByPrincipalId: "agent-hsi-tx-1",
      createdAt: asOf,
      identities: [
        {
          system: "chembl",
          value: "CHEMBL25",
          label: "methotrexate",
          resolution: "stub_only",
          claimSupport: "not_assessed",
        },
      ],
    });
    expect(compound.interventionKind).toBe("molecular_compound");
    expect(compound.approvedMedicineIsNotTreatmentRecommendation).toBe(true);

    const approved = draftCompoundOrIntervention({
      id: "hsi-tx-int-approved-fixture",
      programme,
      name: "Approved medicine catalogue entry (fixture)",
      interventionKind: "approved_medicine",
      approvalJurisdictionNote:
        "Declared public approval jurisdiction note for catalogue identity only.",
      authoredByPrincipalId: "agent-hsi-tx-1",
      createdAt: asOf,
    });
    expect(approved.interventionKind).toBe("approved_medicine");

    expect(() =>
      draftCompoundOrIntervention({
        id: "hsi-tx-int-missing-smiles",
        programme,
        name: "No smiles",
        interventionKind: "molecular_compound",
        authoredByPrincipalId: "agent-hsi-tx-1",
        createdAt: asOf,
      }),
    ).toThrow(/publicSmiles/);

    expect(INTERVENTION_KINDS).toEqual([
      "molecular_compound",
      "modality",
      "experimental_intervention",
      "approved_medicine",
    ]);
  });

  test("assessment refuses efficacy/safety/treatment claims and AI accept", () => {
    const programme = seedProgramme();
    const target = draftTargetCandidate({
      id: "hsi-tx-tgt-il6-assess",
      programme,
      name: "IL6",
      rationale: "Fixture target for assessment honesty.",
      biologicalPlausibilityNote: "Plausibility note only.",
      authoredByPrincipalId: "agent-hsi-tx-1",
      createdAt: asOf,
    });
    const intervention = draftCompoundOrIntervention({
      id: "hsi-tx-int-exp-assess",
      programme,
      name: "Experimental IL-6 pathway probe (fixture)",
      interventionKind: "experimental_intervention",
      authoredByPrincipalId: "agent-hsi-tx-1",
      createdAt: asOf,
    });
    const assessment = draftTargetInterventionAssessment({
      id: "hsi-tx-assess-il6-fixture",
      programme,
      target,
      intervention,
      summary:
        "Associative public neighbourhood only — further investigation may be warranted; not efficacy.",
      conclusionKind: "further_investigation_warranted",
      evidenceStrength: "associative_only",
      remainingUncertainties: [
        "No authorised causal evidence attached.",
        "Tissue compartment unresolved.",
      ],
      infoRequiredBeforeFurtherWork: [
        "Confirm public evidence licences.",
        "Define discriminating experiment question.",
      ],
      authoredByPrincipalId: "agent-hsi-tx-1",
      createdAt: asOf,
    });
    expect(assessment.efficacyClaimed).toBe(false);
    expect(assessment.safetyClaimed).toBe(false);
    expect(assessment.clinicalSuitabilityClaimed).toBe(false);
    expect(assessment.treatmentRecommended).toBe(false);
    expect(assessment.inventedNumericScore).toBeNull();

    const submitted = transitionTargetInterventionAssessment({
      assessment,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-tx-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionTargetInterventionAssessment({
        assessment: submitted,
        to: "accepted_for_further_investigation",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-tx-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Only human researchers/);

    const accepted = transitionTargetInterventionAssessment({
      assessment: submitted,
      to: "accepted_for_further_investigation",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher-alice", actorKind: "human"},
    });
    expect(accepted.lifecycle).toBe("accepted_for_further_investigation");
    expect(accepted.reviewedBy?.actorKind).toBe("human");
  });

  test("rejects AI target prioritisation and illegal programme transitions", () => {
    const programme = seedProgramme();
    const target = draftTargetCandidate({
      id: "hsi-tx-tgt-prio",
      programme,
      name: "STAT3",
      rationale: "Fixture competing target.",
      biologicalPlausibilityNote: "Plausibility only.",
      authoredByPrincipalId: "agent-hsi-tx-1",
      createdAt: asOf,
    });
    const reviewed = transitionTargetCandidate({
      target,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-tx-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionTargetCandidate({
        target: reviewed,
        to: "prioritised_for_investigation",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-tx-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Only human researchers/);

    expect(() =>
      transitionTherapeuticProgramme({
        programme,
        to: "active_investigation",
        updatedAt: asOf,
      }),
    ).toThrow(/Illegal programme transition/);
  });

  test("memory store + pack + persistence projection", () => {
    const programme = seedProgramme();
    const target = draftTargetCandidate({
      id: "hsi-tx-tgt-store",
      programme,
      name: "JAK1",
      rationale: "Store fixture target.",
      biologicalPlausibilityNote: "Plausibility only.",
      authoredByPrincipalId: "agent-hsi-tx-1",
      createdAt: asOf,
    });
    const intervention = draftCompoundOrIntervention({
      id: "hsi-tx-int-modality-store",
      programme,
      name: "Small-molecule kinase modality (fixture)",
      interventionKind: "modality",
      modalityLabel: "small_molecule_kinase_inhibitor",
      authoredByPrincipalId: "agent-hsi-tx-1",
      createdAt: asOf,
    });
    const assessment = draftTargetInterventionAssessment({
      id: "hsi-tx-assess-store",
      programme,
      target,
      intervention,
      summary: "Fixture assessment envelope.",
      remainingUncertainties: ["Evidence incomplete."],
      infoRequiredBeforeFurtherWork: ["Need discriminating experiment design."],
      authoredByPrincipalId: "agent-hsi-tx-1",
      createdAt: asOf,
    });

    const store = createMemoryTherapeuticDiscoveryStore();
    store.upsertProgramme(programme);
    store.upsertTarget(target);
    store.upsertIntervention(intervention);
    store.upsertAssessment(assessment);
    expect(store.listTargets(programme.id)).toHaveLength(1);
    expect(store.listInterventions(programme.id)).toHaveLength(1);
    expect(store.listAssessments(programme.id)).toHaveLength(1);

    const pack = buildTherapeuticDiscoveryPack({
      programmes: [programme],
      targets: [target],
      interventions: [intervention],
      assessments: [assessment],
      asOf,
    });
    expect(pack.programmeCount).toBe(1);
    expect(pack.honesty.noRepurposingEngine).toBe(true);

    const lines = projectTherapeuticDiscoveryPersistenceLines({
      programme,
      targets: [target],
      interventions: [intervention],
      assessments: [assessment],
    });
    expect(lines).toContain("efficacyClaimed=false");
    expect(lines).toContain("chemblLivePull=false");
    expect(lines).toContain("migration=deferred");
  });

  test("assessment requires uncertainties and refuses recommend language", () => {
    const programme = seedProgramme();
    const target = draftTargetCandidate({
      id: "hsi-tx-tgt-unc",
      programme,
      name: "TNF",
      rationale: "Fixture.",
      biologicalPlausibilityNote: "Plausibility.",
      authoredByPrincipalId: "agent-hsi-tx-1",
      createdAt: asOf,
    });
    const intervention = draftCompoundOrIntervention({
      id: "hsi-tx-int-unc",
      programme,
      name: "Experimental intervention fixture",
      interventionKind: "experimental_intervention",
      authoredByPrincipalId: "agent-hsi-tx-1",
      createdAt: asOf,
    });
    expect(() =>
      draftTargetInterventionAssessment({
        id: "hsi-tx-assess-unc",
        programme,
        target,
        intervention,
        summary: "Missing uncertainties.",
        remainingUncertainties: [],
        infoRequiredBeforeFurtherWork: ["Need more evidence."],
        authoredByPrincipalId: "agent-hsi-tx-1",
        createdAt: asOf,
      }),
    ).toThrow(/remaining uncertainty/);

    expect(() =>
      draftTargetInterventionAssessment({
        id: "hsi-tx-assess-rec",
        programme,
        target,
        intervention,
        summary: "We recommend this drug for patients.",
        remainingUncertainties: ["x"],
        infoRequiredBeforeFurtherWork: ["y"],
        authoredByPrincipalId: "agent-hsi-tx-1",
        createdAt: asOf,
      }),
    ).toThrow(/must not invent scores or treatment recommendations/);
  });
});
