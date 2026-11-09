/**
 * Milestone 10 PR3 — protocol intelligence and scientific approval honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  addProtocolReviewerComment,
  buildChangeControlEntry,
  buildProtocolIntelligencePack,
  createMemoryProtocolIntelligenceStore,
  draftIntelligentProtocol,
  fingerprintIntelligentProtocolDraft,
  projectProtocolIntelligencePersistenceLines,
  refuseAutomaticInstrumentInstructions,
  reviseIntelligentProtocolVersion,
  transitionIntelligentProtocolDraft,
  validateIntelligentProtocolDraft,
  type IntelligentProtocolDraft,
  type MethodControlDocumentation,
  type QualityControlRequirement,
  type RequiredProtocolMetadataField,
  type SafetyEthicsGovernanceRecord,
  type StatisticalAnalysisPlan,
} from "../src/protocolIntelligenceScientificApprovalContracts";

const asOf = "2026-11-09T16:00:00.000Z";

function seedMethods(): MethodControlDocumentation {
  return {
    methods: [
      "Declare fixture IL-6 discrimination procedure steps without wet-lab run claims.",
      "Freeze prediction content hash before any outcome attach (N7).",
    ],
    controls: ["vehicle_fixture", "isotype_fixture"],
    negativeControls: ["non_targeting_control"],
    measurements: ["phospho_STAT3_fixture_readout"],
    proceduralLimitations: [
      "Engineering fixture only — not an executable lab SOP.",
      "Does not authorise clinical or instrument control claims.",
    ],
  };
}

function seedMetadata(): RequiredProtocolMetadataField[] {
  return [
    {
      key: "dose",
      label: "Dose / concentration",
      required: true,
      value: null,
      missingReason: "Dose field deferred until authorised protocol freeze.",
    },
    {
      key: "tissue_context",
      label: "Tissue / compartment context",
      required: true,
      value: "fixture_fibroblast_culture",
      missingReason: null,
    },
    {
      key: "assay_panel",
      label: "Assay panel identifier",
      required: false,
      value: "fixture_panel_A",
      missingReason: null,
    },
  ];
}

function seedSap(
  overrides?: Partial<StatisticalAnalysisPlan>,
): StatisticalAnalysisPlan {
  return {
    objectives: [
      "Discriminate IL-6-dominant vs TGF-β-dominant framing under fixture constraints.",
    ],
    endpoints: ["phospho_STAT3_direction", "collagen_transcript_direction"],
    analysisMethods: [
      "Qualitative direction concordance against pre-declared competing explanations.",
    ],
    justificationKind: "qualitative_only",
    planSummary:
      "Exploratory fixture SAP: report directionality vs controls; do not invent power or sample size.",
    externalPlanRef: null,
    inventedPowerSampleSizeClaims: false,
    ...overrides,
  };
}

function seedQc(): QualityControlRequirement[] {
  return [
    {
      id: "qc-neg-control",
      description: "Negative control must remain within fixture null band.",
      acceptanceCriterion: "Non-targeting control shows no pathway activation claim.",
    },
    {
      id: "qc-prediction-freeze",
      description: "N7 prediction hash frozen before any outcome attach.",
      acceptanceCriterion: "Prediction content hash recorded before results envelope.",
    },
  ];
}

function seedSafety(): SafetyEthicsGovernanceRecord[] {
  return [
    {
      kind: "none_declared",
      externalRef: null,
      summary:
        "Fixture engineering protocol — no ethics committee or partner MoU invented.",
      mouInvented: false,
      gateCAutoApprove: false,
    },
  ];
}

function seedDraft(
  overrides?: Partial<Parameters<typeof draftIntelligentProtocol>[0]>,
): IntelligentProtocolDraft {
  return draftIntelligentProtocol({
    id: "hsi-exp-pint-ssc-il6-001",
    title: "IL-6 discrimination protocol (fixture intelligence)",
    objective:
      "Document methods, controls, metadata, SAP, QC, and governance for researcher review without auto-execution.",
    draftedByPrincipalId: "agent-hsi-protocol-1",
    draftedByActorKind: "ai_agent",
    createdAt: asOf,
    sourceProposalId: "hsi-exp-prop-ssc-il6-assay",
    sourceDesignPackageId: "hsi-exp-des-ssc-il6-001",
    sourceApproachId: "hsi-exp-apr-il6-invitro",
    linkedPr1ProtocolId: "hsi-exp-prot-il6-v1",
    hypothesisId: "hyp-ssc-il6-001",
    investigationId: "inv-ssc-mech-001",
    methodControls: seedMethods(),
    requiredMetadata: seedMetadata(),
    statisticalAnalysisPlan: seedSap(),
    qualityControlRequirements: seedQc(),
    safetyEthics: seedSafety(),
    ...overrides,
  });
}

function submitForReview(
  draft = seedDraft(),
): IntelligentProtocolDraft {
  return transitionIntelligentProtocolDraft({
    draft,
    to: "submitted_for_scientific_review",
    updatedAt: asOf,
    actor: {principalId: "agent-hsi-protocol-1", actorKind: "ai_agent"},
  });
}

describe("protocol intelligence scientific approval contracts (M10 PR3)", () => {
  test("drafts protocol from approved experiment specs with honesty gates", () => {
    const draft = seedDraft();
    expect(draft.lifecycle).toBe("draft");
    expect(draft.protocolVersion).toBe(1);
    expect(draft.sourceProposalId).toBe("hsi-exp-prop-ssc-il6-assay");
    expect(draft.sourceDesignPackageId).toBe("hsi-exp-des-ssc-il6-001");
    expect(draft.methodControls.negativeControls.length).toBeGreaterThan(0);
    expect(draft.requiredMetadata.some((m) => m.key === "dose")).toBe(true);
    expect(draft.statisticalAnalysisPlan.inventedPowerSampleSizeClaims).toBe(
      false,
    );
    expect(draft.executableInstrumentInstructions).toBeNull();
    expect(draft.instrumentInstructionsIssued).toBe(false);
    expect(draft.honesty.dependsOnPr1LifecycleContracts).toBe(true);
    expect(draft.honesty.dependsOnPr2DesignPrioritisation).toBe(true);
    expect(draft.honesty.noAutomaticInstrumentInstructions).toBe(true);
    expect(draft.honesty.mouInvented).toBe(false);
    expect(draft.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(fingerprintIntelligentProtocolDraft(draft)).toMatch(/^[a-f0-9]{64}$/);
  });

  test("requires source specification and refuses invented SAP power/n", () => {
    expect(() =>
      seedDraft({
        sourceProposalId: null,
        sourceDesignPackageId: null,
      }),
    ).toThrow(/sourceProposalId and\/or sourceDesignPackageId/i);

    expect(() =>
      seedDraft({
        statisticalAnalysisPlan: seedSap({
          planSummary: "We assume power=0.8 with n=42 for this fixture run.",
        }),
      }),
    ).toThrow(/must not invent unjustified power or sample-size/i);

    expect(() =>
      seedDraft({
        statisticalAnalysisPlan: seedSap({
          justificationKind: "declared_external_plan",
          externalPlanRef: null,
          planSummary: "External plan declared but ref missing.",
        }),
      }),
    ).toThrow(/declared_external_plan requires externalPlanRef/i);
  });

  test("requires methods, negative controls, QC, and honest metadata gaps", () => {
    expect(() =>
      seedDraft({
        methodControls: {...seedMethods(), negativeControls: []},
      }),
    ).toThrow(/negative controls/i);

    expect(() =>
      seedDraft({
        qualityControlRequirements: [],
      }),
    ).toThrow(/QC requirement/i);

    expect(() =>
      seedDraft({
        requiredMetadata: [
          {
            key: "dose",
            label: "Dose",
            required: true,
            value: null,
            missingReason: null,
          },
        ],
      }),
    ).toThrow(/missingReason/i);
  });

  test("rejects AI self-approval and non-human scientific decisions", () => {
    const submitted = submitForReview();
    expect(() =>
      transitionIntelligentProtocolDraft({
        draft: submitted,
        to: "researcher_approved",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-protocol-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Only authorised human researchers may decide/i);

    expect(() =>
      transitionIntelligentProtocolDraft({
        draft: submitted,
        to: "researcher_approved",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-protocol-1", actorKind: "human"},
      }),
    ).toThrow(/AI cannot self-approve experimental protocol/i);

    expect(() =>
      transitionIntelligentProtocolDraft({
        draft: seedDraft(),
        to: "researcher_approved",
        updatedAt: asOf,
        actor: {principalId: "principal-researcher-alice", actorKind: "human"},
      }),
    ).toThrow(/Illegal protocol draft transition/i);
  });

  test("supports reviewer comments, approval, rejection, and change control", () => {
    const submitted = submitForReview();
    const comment = addProtocolReviewerComment({
      id: "hsi-exp-pcom-dose-gap",
      draft: submitted,
      authorPrincipalId: "principal-researcher-alice",
      severity: "major",
      body: "Dose metadata remains missing; resolve before approval.",
      createdAt: asOf,
    });
    expect(comment.protocolVersion).toBe(1);
    expect(comment.severity).toBe("major");

    const changesRequested = transitionIntelligentProtocolDraft({
      draft: submitted,
      to: "changes_requested",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher-alice", actorKind: "human"},
    });
    expect(changesRequested.lifecycle).toBe("changes_requested");

    const {draft: v2, change} = reviseIntelligentProtocolVersion({
      prior: changesRequested,
      revisedAt: asOf,
      actor: {principalId: "agent-hsi-protocol-1", actorKind: "ai_agent"},
      requiredMetadata: seedMetadata().map((field) =>
        field.key === "dose"
          ? {
              ...field,
              value: "fixture_dose_deferred_declared",
              missingReason: null,
            }
          : field,
      ),
      note: "Addressed dose metadata gap.",
    });
    expect(v2.protocolVersion).toBe(2);
    expect(v2.parentProtocolVersion).toBe(1);
    expect(change.kind).toBe("content_revised");

    const resubmitted = transitionIntelligentProtocolDraft({
      draft: v2,
      to: "submitted_for_scientific_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-protocol-1", actorKind: "ai_agent"},
    });
    const approved = transitionIntelligentProtocolDraft({
      draft: resubmitted,
      to: "researcher_approved",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher-alice", actorKind: "human"},
    });
    expect(approved.approvedBy?.principalId).toBe("principal-researcher-alice");
    expect(approved.approvedBy?.actorKind).toBe("human");

    const rejectedPath = transitionIntelligentProtocolDraft({
      draft: submitForReview(
        seedDraft({id: "hsi-exp-pint-ssc-il6-reject"}),
      ),
      to: "researcher_rejected",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher-bob", actorKind: "human"},
      rejectionReason: "Controls insufficient for discrimination claim.",
    });
    expect(rejectedPath.lifecycle).toBe("researcher_rejected");
    expect(rejectedPath.rejectedBy?.reason).toMatch(/Controls insufficient/i);
  });

  test("approval does not auto-issue instrument instructions", () => {
    const approved = transitionIntelligentProtocolDraft({
      draft: submitForReview(),
      to: "researcher_approved",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher-alice", actorKind: "human"},
    });
    const refusal = refuseAutomaticInstrumentInstructions(approved);
    expect(refusal.refused).toBe(true);
    expect(refusal.instrumentInstructionsIssued).toBe(false);
    expect(refusal.executableInstrumentInstructions).toBeNull();
    expect(() =>
      validateIntelligentProtocolDraft({
        ...approved,
        instrumentInstructionsIssued: true as false,
      }),
    ).toThrow(/Instrument instructions must not be issued/i);
  });

  test("memory store + pack + persistence projection", () => {
    const store = createMemoryProtocolIntelligenceStore();
    const draft = seedDraft();
    store.upsertProtocolDraft(draft);
    store.appendChangeControl(
      buildChangeControlEntry({
        id: "hsi-exp-pch-ssc-il6-001-created",
        protocolDraftId: draft.id,
        fromVersion: null,
        toVersion: 1,
        kind: "created",
        summary: "Initial protocol intelligence draft",
        actorPrincipalId: "agent-hsi-protocol-1",
        actorKind: "ai_agent",
        at: asOf,
      }),
    );
    const submitted = submitForReview(draft);
    store.upsertProtocolDraft(submitted);
    const comment = addProtocolReviewerComment({
      id: "hsi-exp-pcom-review-1",
      draft: submitted,
      authorPrincipalId: "principal-researcher-alice",
      severity: "info",
      body: "Proceed after metadata confirmation.",
      createdAt: asOf,
    });
    store.upsertReviewerComment(comment);
    const approved = transitionIntelligentProtocolDraft({
      draft: submitted,
      to: "researcher_approved",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher-alice", actorKind: "human"},
    });
    store.upsertProtocolDraft(approved);
    store.appendChangeControl(
      buildChangeControlEntry({
        id: "hsi-exp-pch-ssc-il6-001-approved",
        protocolDraftId: approved.id,
        fromVersion: 1,
        toVersion: 1,
        kind: "approved",
        summary: "Authorised researcher approved protocol draft",
        actorPrincipalId: "principal-researcher-alice",
        actorKind: "human",
        at: asOf,
      }),
    );

    expect(store.listProtocolDrafts("hyp-ssc-il6-001")).toHaveLength(1);
    expect(store.listReviewerComments(approved.id)).toHaveLength(1);
    expect(store.listChangeControl(approved.id)).toHaveLength(2);

    const pack = buildProtocolIntelligencePack({
      drafts: [approved],
      comments: store.listReviewerComments(approved.id),
      changes: store.listChangeControl(approved.id),
      asOf,
    });
    expect(pack.protocolDraftCount).toBe(1);
    expect(pack.reviewerCommentCount).toBe(1);
    expect(pack.changeControlCount).toBe(2);
    expect(pack.dependency.requiresPr1LifecycleContracts).toBe(true);
    expect(pack.dependency.requiresPr2DesignPrioritisation).toBe(true);
    expect(pack.honesty.pipelinesExecuted).toBe(false);

    const lines = projectProtocolIntelligencePersistenceLines({
      draft: approved,
      comments: pack.comments,
      changes: pack.changes,
    });
    expect(lines).toContain("dependsOnPr1=true");
    expect(lines).toContain("dependsOnPr2=true");
    expect(lines).toContain("instrumentInstructionsIssued=false");
    expect(lines).toContain("powerSampleSizeClaims=false");
  });

  test("records external governance without inventing MoU or Gate C", () => {
    const withEthics = seedDraft({
      id: "hsi-exp-pint-ssc-il6-ethics",
      safetyEthics: [
        {
          kind: "ethics_committee_ref",
          externalRef: "EXT-ETHICS-REF-FIXTURE-001",
          summary: "External ethics reference recorded; not an invented MoU.",
          mouInvented: false,
          gateCAutoApprove: false,
        },
      ],
    });
    expect(withEthics.safetyEthics[0]?.kind).toBe("ethics_committee_ref");
    expect(withEthics.honesty.mouInvented).toBe(false);
    expect(withEthics.honesty.gateCAutoApprove).toBe(false);

    expect(() =>
      seedDraft({
        id: "hsi-exp-pint-ssc-il6-bad-gov",
        safetyEthics: [
          {
            kind: "partner_agreement_ref",
            externalRef: null,
            summary: "Missing ref",
            mouInvented: false,
            gateCAutoApprove: false,
          },
        ],
      }),
    ).toThrow(/requires externalRef/i);
  });
});
