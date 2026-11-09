/**
 * Milestone 10 / PR3 — protocol intelligence & scientific approval pack check.
 * Offline contracts only — does not invent results, MoU, or instrument runs.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  addProtocolReviewerComment,
  buildChangeControlEntry,
  buildProtocolIntelligencePack,
  draftIntelligentProtocol,
  PROTOCOL_INTELLIGENCE_METHOD,
  PROTOCOL_INTELLIGENCE_SCHEMA,
  PROTOCOL_INTELLIGENCE_VERSION,
  projectProtocolIntelligencePersistenceLines,
  refuseAutomaticInstrumentInstructions,
  reviseIntelligentProtocolVersion,
  transitionIntelligentProtocolDraft,
} from "../src/protocolIntelligenceScientificApprovalContracts";

const asOf = "2026-11-09T16:00:00.000Z";
const outDir = "evaluation/protocol-intelligence-scientific-approval";

function fixturePack() {
  const draft = draftIntelligentProtocol({
    id: "hsi-exp-pint-fixture-demo",
    title: "Fixture protocol intelligence draft",
    objective:
      "Document methods, controls, metadata, SAP, QC, and governance for scientific review without auto-execution.",
    draftedByPrincipalId: "fixture-agent-protocol",
    draftedByActorKind: "ai_agent",
    createdAt: asOf,
    sourceProposalId: "hsi-exp-prop-fixture-demo",
    sourceDesignPackageId: "hsi-exp-des-fixture-demo",
    sourceApproachId: "hsi-exp-apr-fixture-invitro",
    linkedPr1ProtocolId: "hsi-exp-prot-fixture-v1",
    hypothesisId: "hyp-fixture-001",
    investigationId: "inv-fixture-001",
    methodControls: {
      methods: [
        "Declare fixture procedure steps without wet-lab run claims.",
        "Freeze prediction content hash before outcome attach.",
      ],
      controls: ["vehicle_fixture"],
      negativeControls: ["non_targeting_control"],
      measurements: ["marker_readout_fixture"],
      proceduralLimitations: [
        "Engineering fixture only — not an executable lab SOP.",
      ],
    },
    requiredMetadata: [
      {
        key: "dose",
        label: "Dose / concentration",
        required: true,
        value: null,
        missingReason: "Dose deferred until authorised freeze.",
      },
      {
        key: "tissue_context",
        label: "Tissue context",
        required: true,
        value: "fixture_culture",
        missingReason: null,
      },
    ],
    statisticalAnalysisPlan: {
      objectives: ["Discriminate pathway-X vs pathway-Y under fixture constraints."],
      endpoints: ["marker_direction"],
      analysisMethods: [
        "Qualitative direction concordance vs pre-declared competing explanations.",
      ],
      justificationKind: "qualitative_only",
      planSummary:
        "Exploratory fixture SAP: report directionality; do not invent power or sample size.",
      externalPlanRef: null,
      inventedPowerSampleSizeClaims: false,
    },
    qualityControlRequirements: [
      {
        id: "qc-neg-control",
        description: "Negative control remains within fixture null band.",
        acceptanceCriterion: "Non-targeting control shows no activation claim.",
      },
    ],
    safetyEthics: [
      {
        kind: "none_declared",
        externalRef: null,
        summary: "Fixture engineering — no MoU or Gate C auto-approve invented.",
        mouInvented: false,
        gateCAutoApprove: false,
      },
    ],
  });

  const created = buildChangeControlEntry({
    id: "hsi-exp-pch-fixture-demo-created",
    protocolDraftId: draft.id,
    fromVersion: null,
    toVersion: 1,
    kind: "created",
    summary: "Initial fixture protocol intelligence draft",
    actorPrincipalId: "fixture-agent-protocol",
    actorKind: "ai_agent",
    at: asOf,
  });

  const submitted = transitionIntelligentProtocolDraft({
    draft,
    to: "submitted_for_scientific_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-protocol", actorKind: "ai_agent"},
  });

  const comment = addProtocolReviewerComment({
    id: "hsi-exp-pcom-fixture-dose",
    draft: submitted,
    authorPrincipalId: "fixture-researcher",
    severity: "major",
    body: "Dose metadata still missing; revise before approval.",
    createdAt: asOf,
  });

  const changesRequested = transitionIntelligentProtocolDraft({
    draft: submitted,
    to: "changes_requested",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const {draft: v2, change: revised} = reviseIntelligentProtocolVersion({
    prior: changesRequested,
    revisedAt: asOf,
    actor: {principalId: "fixture-agent-protocol", actorKind: "ai_agent"},
    requiredMetadata: [
      {
        key: "dose",
        label: "Dose / concentration",
        required: true,
        value: "fixture_dose_declared",
        missingReason: null,
      },
      {
        key: "tissue_context",
        label: "Tissue context",
        required: true,
        value: "fixture_culture",
        missingReason: null,
      },
    ],
    note: "Addressed dose metadata gap.",
  });

  const resubmitted = transitionIntelligentProtocolDraft({
    draft: v2,
    to: "submitted_for_scientific_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-protocol", actorKind: "ai_agent"},
  });

  const approved = transitionIntelligentProtocolDraft({
    draft: resubmitted,
    to: "researcher_approved",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const approvedChange = buildChangeControlEntry({
    id: "hsi-exp-pch-fixture-demo-approved",
    protocolDraftId: approved.id,
    fromVersion: 2,
    toVersion: 2,
    kind: "approved",
    summary: "Authorised researcher approved fixture protocol",
    actorPrincipalId: "fixture-researcher",
    actorKind: "human",
    at: asOf,
  });

  const instrumentRefusal = refuseAutomaticInstrumentInstructions(approved);

  return {
    draft: approved,
    comments: [comment],
    changes: [created, revised, approvedChange],
    instrumentRefusal,
  };
}

function main() {
  const checkOnly = process.argv.includes("--check");
  const {draft, comments, changes, instrumentRefusal} = fixturePack();
  const pack = buildProtocolIntelligencePack({
    drafts: [draft],
    comments,
    changes,
    asOf,
  });
  const status = {
    schema: PROTOCOL_INTELLIGENCE_SCHEMA,
    method: PROTOCOL_INTELLIGENCE_METHOD,
    version: PROTOCOL_INTELLIGENCE_VERSION,
    asOf,
    protocolDraftCount: pack.protocolDraftCount,
    reviewerCommentCount: pack.reviewerCommentCount,
    changeControlCount: pack.changeControlCount,
    protocolVersion: draft.protocolVersion,
    lifecycle: draft.lifecycle,
    migration: "deferred",
    neon: "red-wave-only",
    dependsOnPr1: true,
    dependsOnPr2: true,
    pr1PullRequest: 101,
    pr2PullRequest: 102,
    instrumentInstructionsIssued: false,
    instrumentRefusal,
    honesty: pack.honesty,
    persistenceLines: projectProtocolIntelligencePersistenceLines({
      draft,
      comments,
      changes,
    }),
  };

  if (!checkOnly) {
    mkdirSync(outDir, {recursive: true});
    writeFileSync(join(outDir, "STATUS.json"), `${JSON.stringify(status, null, 2)}\n`);
    writeFileSync(
      join(outDir, "protocol-intelligence-pack.v1.json"),
      `${JSON.stringify(pack, null, 2)}\n`,
    );
  }

  if (pack.honesty.fabricatedResults) {
    throw Error("Fabricated results must stay false");
  }
  if (pack.honesty.pipelinesExecuted) {
    throw Error("Pipeline execution must stay false");
  }
  if (pack.honesty.labAdaptersWired) {
    throw Error("Lab adapters must stay false");
  }
  if (pack.honesty.mouInvented) {
    throw Error("MoU must stay non-invented");
  }
  if (pack.honesty.gateCAutoApprove) {
    throw Error("Gate C auto-approve must stay false");
  }
  if (draft.instrumentInstructionsIssued) {
    throw Error("Instrument instructions must stay unissued");
  }
  if (!instrumentRefusal.refused) {
    throw Error("Automatic instrument instructions must be refused");
  }
  if (draft.lifecycle !== "researcher_approved") {
    throw Error("Expected researcher_approved fixture protocol");
  }
  if (draft.protocolVersion !== 2) {
    throw Error("Expected revised protocol version 2");
  }

  console.log(
    checkOnly
      ? `protocol-intelligence-scientific-approval check ok (${pack.protocolDraftCount} drafts, ${pack.reviewerCommentCount} comments, ${pack.changeControlCount} changes)`
      : `wrote ${outDir} (${pack.protocolDraftCount} drafts, ${pack.reviewerCommentCount} comments, ${pack.changeControlCount} changes)`,
  );
}

main();
