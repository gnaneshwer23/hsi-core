/**
 * Milestone 10 PR2 — experiment design and prioritisation honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  buildExperimentDesignPack,
  buildExperimentPrioritisation,
  createMemoryExperimentDesignStore,
  draftExperimentDesignPackage,
  fingerprintExperimentDesignPackage,
  projectExperimentDesignPersistenceLines,
  transitionExperimentDesignPackage,
  validateExperimentPrioritisation,
  type CandidateExperimentalApproach,
  type ExperimentDesignPackage,
} from "../src/experimentDesignPrioritisationContracts";

const asOf = "2026-11-09T15:00:00.000Z";

function seedApproaches(): CandidateExperimentalApproach[] {
  return [
    {
      id: "hsi-exp-apr-il6-public-reanalysis",
      title: "Public IL-6 pathway reanalysis",
      category: "public_dataset_reanalysis",
      experimentalModel:
        "Reanalyse authorised public transcriptomic cohorts for IL-6 signature enrichment.",
      controls: ["matched_non_IL6_signature"],
      negativeControls: ["scrambled_gene_set_null"],
      measurements: ["pathway_enrichment_score", "effect_direction_consistency"],
      confounders: ["batch_effects", "disease_stage_mix"],
      methodologicalLimitations: [
        "Public cohorts may lack tissue resolution needed for mechanism claims.",
      ],
      feasibility: "high",
      feasibilityNotes: "Uses authorised public data only; no wet-lab required.",
      discriminationStrength: "moderate",
      distinguishesExplanationIds: ["ce-tgfb-dominant"],
      resultsSupportHypothesis:
        "Consistent IL-6 enrichment across cohorts would support IL-6-dominant framing.",
      resultsChallengeHypothesis:
        "Absent or opposite enrichment would challenge IL-6-dominant framing.",
      nullResultInterpretation:
        "Null enrichment does not prove TGF-β dominance; may reflect cohort mismatch or underpowered public metadata.",
      remainingUncertainties: [
        "Tissue compartment not resolved in bulk public data.",
      ],
      infoRequiredBeforeExecution: [
        "Confirm public dataset licence and cohort inclusion criteria.",
      ],
      reproducibilityNotes: [
        "Pin dataset accessions and analysis script hashes before run.",
      ],
      linkedProposalId: "hsi-exp-prop-ssc-il6-assay",
      note: "Fixture approach A",
    },
    {
      id: "hsi-exp-apr-il6-invitro",
      title: "In vitro IL-6 signalling discrimination",
      category: "in_vitro_mechanistic",
      experimentalModel:
        "Primary fibroblast culture with IL-6 pathway perturbation vs TGF-β controls.",
      controls: ["vehicle", "isotype"],
      negativeControls: ["non_targeting_control", "pathway_irrelevant_cytokine"],
      measurements: ["phospho_STAT3", "collagen_transcript"],
      confounders: ["serum_batch", "passage_number"],
      methodologicalLimitations: [
        "In vitro systems may not recapitulate tissue microenvironments.",
        "Does not authorise clinical claims.",
      ],
      feasibility: "moderate",
      feasibilityNotes:
        "Requires lab partner agreement; blocked for real observation until authorised.",
      discriminationStrength: "strong",
      distinguishesExplanationIds: ["ce-tgfb-dominant", "ce-il6-epiphenomenon"],
      resultsSupportHypothesis:
        "IL-6-specific phospho-STAT3 dependence with TGF-β-independent collagen change supports IL-6 mechanism.",
      resultsChallengeHypothesis:
        "TGF-β-only dependence with IL-6-null phenotype challenges IL-6-causal claim.",
      nullResultInterpretation:
        "Null across both arms challenges both simple causal stories; revisit confounders and dose.",
      remainingUncertainties: [
        "Translation from culture to human tissue unresolved.",
        "Partner lab protocol version not yet bound (PR1).",
      ],
      infoRequiredBeforeExecution: [
        "Researcher-approved PR1 protocol version.",
        "Partner lab agreement reference (do not invent MoU).",
        "Dose and tissue fields declared before prediction freeze.",
      ],
      reproducibilityNotes: [
        "Independent replication category should be queued if positive culture signal appears.",
      ],
      linkedProposalId: null,
      note: "Fixture approach B — discriminating preferred",
    },
    {
      id: "hsi-exp-apr-il6-computational",
      title: "Computational pathway cross-check",
      category: "computational_pathway",
      experimentalModel:
        "Bounded pathway graph consistency check against curated public edges.",
      controls: ["degree_matched_random_paths"],
      negativeControls: ["shuffled_edge_sign_null"],
      measurements: ["path_consistency_score"],
      confounders: ["curation_coverage_bias"],
      methodologicalLimitations: [
        "Computational consistency is not experimental validation.",
      ],
      feasibility: "high",
      feasibilityNotes: "Offline fixture / authorised public graph only.",
      discriminationStrength: "weak",
      distinguishesExplanationIds: ["ce-il6-epiphenomenon"],
      resultsSupportHypothesis:
        "Path consistency with IL-6 intermediates is compatible with the hypothesis.",
      resultsChallengeHypothesis:
        "Inconsistent or opposing curated edges challenge the mechanistic path claim.",
      nullResultInterpretation:
        "Null path support leaves competing explanations open; do not claim falsification alone.",
      remainingUncertainties: ["Missing edges may be curation gaps, not biology."],
      infoRequiredBeforeExecution: [
        "Declare graph release hash and edge provenance filters.",
      ],
      reproducibilityNotes: ["Re-run against the same release hash."],
      linkedProposalId: null,
      note: "Fixture approach C",
    },
  ];
}

function seedDesign(
  overrides?: Partial<Parameters<typeof draftExperimentDesignPackage>[0]>,
): ExperimentDesignPackage {
  return draftExperimentDesignPackage({
    id: "hsi-exp-des-ssc-il6-001",
    hypothesisId: "hyp-ssc-il6-001",
    hypothesisStatement:
      "IL-6 signalling is a dominant driver of fibroblast activation in the scoped SSc context.",
    hypothesisFalsifier:
      "If authorised IL-6 pathway readouts remain null after protocol freeze while TGF-β controls respond, IL-6-dominant claim is not supported.",
    authoredByPrincipalId: "agent-hsi-designer-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    investigationId: "inv-ssc-mech-001",
    falsifiablePredictions: [
      {
        id: "pred-il6-stat3",
        statement:
          "Authorised IL-6 pathway perturbation changes fibroblast activation markers via STAT3.",
        falsifier:
          "No STAT3-linked marker change under authorised IL-6 perturbation with intact controls.",
      },
    ],
    competingExplanations: [
      {
        id: "ce-tgfb-dominant",
        statement: "TGF-β signalling dominates fibroblast activation; IL-6 is secondary.",
        evidenceRefIds: ["gap-oppose-001"],
      },
      {
        id: "ce-il6-epiphenomenon",
        statement: "IL-6 elevation is correlative / epiphenomenal, not causal.",
        evidenceRefIds: [],
      },
    ],
    discriminatingQuestions: [
      {
        id: "dq-il6-vs-tgfb",
        question:
          "Does IL-6 pathway perturbation alter activation markers independently of TGF-β?",
        targetsExplanationIds: ["ce-tgfb-dominant", "ce-il6-epiphenomenon"],
      },
    ],
    candidateApproaches: seedApproaches(),
    ...overrides,
  });
}

function readyForPrioritisation(
  pack = seedDesign(),
): ExperimentDesignPackage {
  return transitionExperimentDesignPackage({
    pack,
    to: "ready_for_prioritisation",
    updatedAt: asOf,
    actor: {principalId: "agent-hsi-designer-1", actorKind: "ai_agent"},
  });
}

describe("experiment design prioritisation contracts (M10 PR2)", () => {
  test("drafts design package with M3 hypothesis links and honesty gates", () => {
    const pack = seedDesign();
    expect(pack.lifecycle).toBe("draft");
    expect(pack.hypothesisId).toBe("hyp-ssc-il6-001");
    expect(pack.falsifiablePredictions).toHaveLength(1);
    expect(pack.competingExplanations).toHaveLength(2);
    expect(pack.discriminatingQuestions).toHaveLength(1);
    expect(pack.candidateApproaches).toHaveLength(3);
    expect(pack.honesty.noInventedInformationGainProbability).toBe(true);
    expect(pack.honesty.noInventedPowerSampleSizeClaims).toBe(true);
    expect(pack.honesty.dependsOnPr1LifecycleContracts).toBe(true);
    expect(pack.honesty.fabricatedResults).toBe(false);
    expect(pack.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(fingerprintExperimentDesignPackage(pack)).toMatch(/^[a-f0-9]{64}$/);
  });

  test("requires negative controls, null interpretation, and pre-execution info", () => {
    expect(() =>
      seedDesign({
        candidateApproaches: [
          {
            ...seedApproaches()[0]!,
            id: "hsi-exp-apr-bad-neg",
            negativeControls: [],
          },
        ],
      }),
    ).toThrow(/negative control/i);

    expect(() =>
      seedDesign({
        candidateApproaches: [
          {
            ...seedApproaches()[0]!,
            id: "hsi-exp-apr-bad-null",
            nullResultInterpretation: "   ",
          },
        ],
      }),
    ).toThrow(/null-result/i);

    expect(() =>
      seedDesign({
        candidateApproaches: [
          {
            ...seedApproaches()[0]!,
            id: "hsi-exp-apr-bad-info",
            infoRequiredBeforeExecution: [],
          },
        ],
      }),
    ).toThrow(/infoRequiredBeforeExecution/i);
  });

  test("rejects unknown explanation targets and illegal transitions", () => {
    expect(() =>
      seedDesign({
        discriminatingQuestions: [
          {
            id: "dq-bad",
            question: "Does this target a missing explanation?",
            targetsExplanationIds: ["ce-missing"],
          },
        ],
      }),
    ).toThrow(/unknown explanation/i);

    const pack = seedDesign();
    expect(() =>
      transitionExperimentDesignPackage({
        pack,
        to: "prioritised",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-designer-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Illegal design package transition/i);
  });

  test("prioritises discriminating approaches without inventing probabilities", () => {
    const ready = readyForPrioritisation();
    const pri = buildExperimentPrioritisation({
      id: "hsi-exp-pri-ssc-il6-001",
      designPackage: ready,
      createdAt: asOf,
      createdByPrincipalId: "agent-hsi-designer-1",
    });

    expect(pri.rankingMethod).toBe("discrimination_then_feasibility_ordinal");
    expect(pri.inventedInformationGainProbability).toBe(false);
    expect(pri.inventedPowerSampleSizeClaims).toBe(false);
    expect(pri.optimisesSolelyForPredictedPositives).toBe(false);
    expect(pri.autoApprovedForExecution).toBe(false);
    // Strong discrimination preferred over high-feasibility weak/moderate.
    expect(pri.rankedApproachIds[0]).toBe("hsi-exp-apr-il6-invitro");
    expect(pri.comparisons[0]?.discriminationStrength).toBe("strong");
    expect(pri.comparisons[0]?.nullResultInterpretation.length).toBeGreaterThan(10);
    expect(pri.comparisons[0]?.infoRequiredBeforeExecution.length).toBeGreaterThan(0);
    expect(pri.rankedApproachIds).toContain("hsi-exp-apr-il6-public-reanalysis");
    expect(pri.rankedApproachIds).toContain("hsi-exp-apr-il6-computational");
  });

  test("refuses prioritisation from draft and rejects invented probability rationale", () => {
    expect(() =>
      buildExperimentPrioritisation({
        id: "hsi-exp-pri-too-early",
        designPackage: seedDesign(),
        createdAt: asOf,
        createdByPrincipalId: "agent-hsi-designer-1",
      }),
    ).toThrow(/ready_for_prioritisation/i);

    const ready = readyForPrioritisation();
    const pri = buildExperimentPrioritisation({
      id: "hsi-exp-pri-ssc-il6-002",
      designPackage: ready,
      createdAt: asOf,
      createdByPrincipalId: "principal-researcher-alice",
    });
    expect(() =>
      validateExperimentPrioritisation({
        ...pri,
        comparisons: pri.comparisons.map((row, i) =>
          i === 0
            ? {
                ...row,
                prioritisationRationale:
                  "Expected information-gain probability p=0.87 with power=0.8 n=42.",
              }
            : row,
        ),
      }),
    ).toThrow(/must not invent probabilities/i);
  });

  test("memory store + pack + persistence projection", () => {
    const store = createMemoryExperimentDesignStore();
    const draft = seedDesign();
    const ready = readyForPrioritisation(draft);
    store.upsertDesignPackage(ready);
    const pri = buildExperimentPrioritisation({
      id: "hsi-exp-pri-ssc-il6-003",
      designPackage: ready,
      createdAt: asOf,
      createdByPrincipalId: "principal-researcher-alice",
    });
    store.upsertPrioritisation(pri);

    const prioritised = transitionExperimentDesignPackage({
      pack: ready,
      to: "prioritised",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher-alice", actorKind: "human"},
    });
    store.upsertDesignPackage(prioritised);

    expect(store.listDesignPackages("hyp-ssc-il6-001")).toHaveLength(1);
    expect(store.listPrioritisations(ready.id)).toHaveLength(1);
    expect(store.getPrioritisation(pri.id)?.rankedApproachIds[0]).toBe(
      "hsi-exp-apr-il6-invitro",
    );

    const pack = buildExperimentDesignPack({
      designPackages: [prioritised],
      prioritisations: [pri],
      asOf,
    });
    expect(pack.designPackageCount).toBe(1);
    expect(pack.prioritisationCount).toBe(1);
    expect(pack.dependency.requiresPr1LifecycleContracts).toBe(true);
    expect(pack.honesty.pipelinesExecuted).toBe(false);

    const lines = projectExperimentDesignPersistenceLines({
      designPackage: prioritised,
      prioritisation: pri,
    });
    expect(lines).toContain("dependsOnPr1=true");
    expect(lines).toContain("infoGainProbability=false");
    expect(lines).toContain(`topApproachId=${pri.rankedApproachIds[0]}`);
  });

  test("covers all declared experiment categories in closed vocabulary", () => {
    const allCategoryApproach = (
      category: CandidateExperimentalApproach["category"],
      idSuffix: string,
    ): CandidateExperimentalApproach => ({
      ...seedApproaches()[2]!,
      id: `hsi-exp-apr-cat-${idSuffix}`,
      title: `Category fixture ${category}`,
      category,
      discriminationStrength: "weak",
      distinguishesExplanationIds: ["ce-il6-epiphenomenon"],
    });

    const pack = seedDesign({
      id: "hsi-exp-des-category-sweep",
      candidateApproaches: [
        allCategoryApproach("public_dataset_reanalysis", "pub"),
        allCategoryApproach("single_cell_spatial_omics", "sc"),
        allCategoryApproach("proteomic_metabolomic", "prot"),
        allCategoryApproach("computational_pathway", "comp"),
        allCategoryApproach("in_vitro_mechanistic", "invitro"),
        allCategoryApproach("ex_vivo", "exvivo"),
        allCategoryApproach("approved_observational_cohort", "cohort"),
        allCategoryApproach("independent_replication", "repl"),
        allCategoryApproach("biomarker_validation", "biomarker"),
      ],
    });
    expect(pack.candidateApproaches).toHaveLength(9);
  });
});
