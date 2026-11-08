/**
 * N6 blinded usefulness pilot prep (production-readiness audit Phase #7).
 * Engineering scaffolding only — science stays NO-GO until N3 freeze (#4) + agreed thresholds.
 * Never invents usefulness scores, SME identities, MoU, Gate C approval, or live CDS/PHI.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import {
  BLINDED_SCORE_PACKET_SCHEMA,
  BLINDED_USEFULNESS_PROTOCOL_SCHEMA,
  N6_RUBRIC_VERSION,
  type BlindedEvalReceipt,
  type BlindedRunManifest,
  type BlindedUsefulnessProtocol,
  type ExpertScorePacket,
  type GateStatus,
  digestCanonical,
  parseBlindedEvalReceipt,
  parseBlindedRunManifest,
  parseBlindedUsefulnessProtocol,
  parseExpertScorePacket,
} from "./blindedExpertUsefulness";

export const N6_PILOT_PREP_SCHEMA = "hsi-n6-usefulness-pilot-prep-1" as const;

export type PilotPrepCheckStatus = "CLEARED" | "BLOCKED" | "PENDING_HUMAN" | "NO_GO";

export type PilotPrepCheckId =
  | "protocol_rubric_frozen"
  | "empty_score_packets_awaiting_reviewers"
  | "blinding_scaffold_conceals_system"
  | "reviewer_roster_slots_reserved"
  | "thresholds_remain_proposed_unagreed"
  | "n3_freeze_prerequisite_acknowledged_blocked"
  | "eval_deltas_forced_null"
  | "pilot_checklist_published"
  | "n3_human_label_freeze_cleared"
  | "thresholds_pre_agreed_with_smes"
  | "independent_blinded_reviewers_recruited"
  | "conventional_arm_artifacts_supplied"
  | "dual_review_adjudicated_scores_frozen"
  | "human_controlled_unblinding_complete"
  | "usefulness_claim_vs_baseline";

export type PilotPrepCheck = {
  id: PilotPrepCheckId;
  title: string;
  plane: "engineering" | "human";
  status: PilotPrepCheckStatus;
  evidence: string;
};

export type BlindedReviewerSlotRole =
  | "blinded_reviewer_1"
  | "blinded_reviewer_2"
  | "adjudicator"
  | "unblinding_operator"
  | "study_operator";

/** Anonymous role slots only — principal stays null until a real human is named. */
export type BlindedReviewerRosterSlot = {
  slotId: string;
  role: BlindedReviewerSlotRole;
  roleLabel: string;
  principal: null;
  organisation: null;
  recruitedAt: null;
  credentialsAttested: false;
  independenceAttested: false;
  notes: string;
};

export type N6UsefulnessPilotPrep = {
  schemaVersion: typeof N6_PILOT_PREP_SCHEMA;
  phase: "N6";
  programme: "gut_immune_t2d";
  remediationPhase: "production_readiness_audit_phase_7";
  generatedAt: string;
  protocolSchema: typeof BLINDED_USEFULNESS_PROTOCOL_SCHEMA;
  scorePacketSchema: typeof BLINDED_SCORE_PACKET_SCHEMA;
  rubricVersion: typeof N6_RUBRIC_VERSION;
  protocolHash: string;
  scorePacketHash: string;
  runManifestHash: string;
  evalReceiptHash: string;
  questionCount: number;
  conditionCount: number;
  packetCount: number;
  scoredRows: 0;
  /** Hard dependency — Audit #4 human freeze still required. */
  n3HumanLabelFreezePrerequisite: "BLOCKED";
  thresholdsStatus: "proposed_unagreed";
  usefulnessPilotGoNoGo: "NO_GO";
  engineeringScaffold: GateStatus;
  independentBlindedReviewers: "BLOCKED";
  scientificAcceptance: "BLOCKED";
  usefulnessClaimed: false;
  scientificApproval: false;
  graphPromotable: false;
  fabricatedExpertScoresPermitted: false;
  inventedReviewerIdentitiesPermitted: false;
  honesty: {
    emptyScoresAreNotUsefulness: true;
    roleSlotsAreNotPeople: true;
    n6PilotRequiresN3Freeze: true;
    thresholdsMustBePreAgreed: true;
    noGateCAutoApprove: true;
    noLiveCdsPhi: true;
    redWaveOnlyForHsi: true;
    noInventedMoU: true;
  };
  reviewerRosterSlots: BlindedReviewerRosterSlot[];
  checks: PilotPrepCheck[];
  summary: {
    engineeringChecksCleared: number;
    engineeringChecksTotal: number;
    humanChecksPending: number;
    humanChecksTotal: number;
    reviewerSlotsReserved: number;
    reviewerSlotsFilled: 0;
    scoredRows: 0;
    usefulnessPilotCleared: false;
  };
  residualHumanSteps: string[];
  prepHash: string;
};

export class N6UsefulnessPilotPrepError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "N6UsefulnessPilotPrepError";
  }
}

function digest(value: unknown): string {
  return createHash("sha256").update(canonicalEvidenceJson(value)).digest("hex");
}

function seal(body: Omit<N6UsefulnessPilotPrep, "prepHash">): N6UsefulnessPilotPrep {
  return {...body, prepHash: digest(body)};
}

function defaultReviewerSlots(): BlindedReviewerRosterSlot[] {
  return [
    {
      slotId: "N6-REV-SLOT-1",
      role: "blinded_reviewer_1",
      roleLabel: "Blinded reviewer 1",
      principal: null,
      organisation: null,
      recruitedAt: null,
      credentialsAttested: false,
      independenceAttested: false,
      notes: "Independent primary blinded scorer. Fill only with a real recruited reviewer after N3 freeze.",
    },
    {
      slotId: "N6-REV-SLOT-2",
      role: "blinded_reviewer_2",
      roleLabel: "Blinded reviewer 2",
      principal: null,
      organisation: null,
      recruitedAt: null,
      credentialsAttested: false,
      independenceAttested: false,
      notes: "Independent secondary blinded scorer. Must not share scores with reviewer 1 before adjudication.",
    },
    {
      slotId: "N6-REV-SLOT-ADJ",
      role: "adjudicator",
      roleLabel: "Adjudicator",
      principal: null,
      organisation: null,
      recruitedAt: null,
      credentialsAttested: false,
      independenceAttested: false,
      notes: "Resolves reviewer disagreement; retains both originals. Not inventable by engineering.",
    },
    {
      slotId: "N6-REV-SLOT-UNBLIND",
      role: "unblinding_operator",
      roleLabel: "Unblinding operator",
      principal: null,
      organisation: null,
      recruitedAt: null,
      credentialsAttested: false,
      independenceAttested: false,
      notes: "Holds protocol.blindingKey separately; unblinds only after scores are frozen.",
    },
    {
      slotId: "N6-REV-SLOT-OPS",
      role: "study_operator",
      roleLabel: "Study operator",
      principal: null,
      organisation: null,
      recruitedAt: null,
      credentialsAttested: false,
      independenceAttested: false,
      notes: "Maintains empty packets and pilot checklist; never invents usefulness scores or deltas.",
    },
  ];
}

function buildChecks(input: {
  protocol: BlindedUsefulnessProtocol;
  scores: ExpertScorePacket;
  run: BlindedRunManifest;
  receipt: BlindedEvalReceipt;
}): PilotPrepCheck[] {
  const emptyScores =
    input.scores.status === "awaiting_blinded_reviewers" &&
    input.receipt.scoredRows === 0 &&
    input.scores.rows.every((row) => row.reviewerId === null && row.scoredAt === null);
  const thresholdsUnagreed = input.protocol.proposedThresholds.status === "proposed_unagreed";
  const deltasNull =
    input.receipt.usefulnessDeltaVsBaseline === null &&
    input.receipt.usefulnessDeltaVsConventional === null &&
    input.receipt.usefulnessClaimed === false;

  return [
    {
      id: "protocol_rubric_frozen",
      title: "Frozen study protocol + rubric + major-error taxonomy",
      plane: "engineering",
      status: input.run.gates.protocolFrozen === "CLEARED" ? "CLEARED" : "BLOCKED",
      evidence: `protocol.v1.json · rubric ${N6_RUBRIC_VERSION}; engineeringHarness=${input.run.gates.engineeringHarness}.`,
    },
    {
      id: "empty_score_packets_awaiting_reviewers",
      title: "Empty expert score packets awaiting blinded reviewers",
      plane: "engineering",
      status: emptyScores ? "CLEARED" : "BLOCKED",
      evidence: `Packet status=${input.scores.status}; scoredRows=${input.receipt.scoredRows}; no invented reviewerIds.`,
    },
    {
      id: "blinding_scaffold_conceals_system",
      title: "Blinding scaffold conceals system identity on score rows",
      plane: "engineering",
      status: input.run.gates.blindingScaffold === "CLEARED" ? "CLEARED" : "BLOCKED",
      evidence: "Score rows omit conditionId; unblinding key stays on protocol only.",
    },
    {
      id: "reviewer_roster_slots_reserved",
      title: "Anonymous blinded-reviewer roster slots reserved",
      plane: "engineering",
      status: "CLEARED",
      evidence: "Five role slots with principal=null; identities not invented.",
    },
    {
      id: "thresholds_remain_proposed_unagreed",
      title: "Acceptance thresholds remain proposed_unagreed",
      plane: "engineering",
      status: thresholdsUnagreed ? "CLEARED" : "BLOCKED",
      evidence: "Proposed targets are not measured HSI performance and are not pre-agreed.",
    },
    {
      id: "n3_freeze_prerequisite_acknowledged_blocked",
      title: "N3 human label freeze prerequisite acknowledged BLOCKED",
      plane: "engineering",
      status: "CLEARED",
      evidence: "Audit #4 freeze-prep eng CLEARED; labelledCalibrationCount=0 / smeSlotsFilled=0 → N6 pilot NO-GO.",
    },
    {
      id: "eval_deltas_forced_null",
      title: "Eval usefulness deltas forced null / unclaimed",
      plane: "engineering",
      status: deltasNull ? "CLEARED" : "BLOCKED",
      evidence: "usefulnessDeltaVsBaseline/Conventional null; usefulnessClaimed=false.",
    },
    {
      id: "pilot_checklist_published",
      title: "N6 usefulness pilot checklist published",
      plane: "engineering",
      status: "CLEARED",
      evidence: "docs/engineering/N6_USEFULNESS_PILOT_CHECKLIST.md — operator path only; no pilot CLEARED claim.",
    },
    {
      id: "n3_human_label_freeze_cleared",
      title: "N3 human label freeze CLEARED (Audit #4 residual)",
      plane: "human",
      status: "NO_GO",
      evidence: "n3HumanLabelFreezePrerequisite=BLOCKED; usefulness pilot must wait for real SME labels.",
    },
    {
      id: "thresholds_pre_agreed_with_smes",
      title: "Scoring rubric thresholds pre-agreed with SMEs",
      plane: "human",
      status: "PENDING_HUMAN",
      evidence: "thresholdsStatus=proposed_unagreed until humans lock acceptance criteria.",
    },
    {
      id: "independent_blinded_reviewers_recruited",
      title: "Independent blinded reviewers recruited into roster slots",
      plane: "human",
      status: "PENDING_HUMAN",
      evidence: "reviewerSlotsFilled=0. Founder/operator must name independent reviewers.",
    },
    {
      id: "conventional_arm_artifacts_supplied",
      title: "Conventional-research arm artifacts supplied without unblinding A/B",
      plane: "human",
      status: "PENDING_HUMAN",
      evidence: "Condition C remains an empty human slot in the protocol.",
    },
    {
      id: "dual_review_adjudicated_scores_frozen",
      title: "Dual-review → adjudicate → freeze frozen_human_scores",
      plane: "human",
      status: "PENDING_HUMAN",
      evidence: "Score packet remains awaiting_blinded_reviewers with zero scored rows.",
    },
    {
      id: "human_controlled_unblinding_complete",
      title: "Human-controlled unblinding with denominators + uncertainty",
      plane: "human",
      status: "PENDING_HUMAN",
      evidence: "Unblinding requires separate human key; software tests alone do not suffice.",
    },
    {
      id: "usefulness_claim_vs_baseline",
      title: "Scientific usefulness claim vs baseline",
      plane: "human",
      status: "NO_GO",
      evidence: "usefulnessPilotGoNoGo=NO_GO; usefulnessClaimed=false; scientificAcceptance=BLOCKED.",
    },
  ];
}

/** Build fail-closed N6 pilot-prep packet from current protocol / empty scores / BLOCKED eval. */
export function buildN6UsefulnessPilotPrep(input: {
  protocol: BlindedUsefulnessProtocol;
  scores: ExpertScorePacket;
  run: BlindedRunManifest;
  receipt: BlindedEvalReceipt;
  generatedAt: string;
}): N6UsefulnessPilotPrep {
  const protocol = parseBlindedUsefulnessProtocol(input.protocol);
  const scores = parseExpertScorePacket(input.scores);
  const run = parseBlindedRunManifest(input.run);
  const receipt = parseBlindedEvalReceipt(input.receipt);

  if (receipt.scientificAcceptance === "CLEARED" || receipt.usefulnessClaimed) {
    throw new N6UsefulnessPilotPrepError(
      "Refuse pilot-prep that claims scientificAcceptance CLEARED or usefulnessClaimed",
    );
  }
  if (receipt.independentBlindedReviewers !== "BLOCKED") {
    throw new N6UsefulnessPilotPrepError(
      "Pilot-prep scaffold requires independentBlindedReviewers BLOCKED (empty scores)",
    );
  }
  if (receipt.scoredRows !== 0) {
    throw new N6UsefulnessPilotPrepError(
      "Pilot-prep scaffold requires zero scored rows; do not invent usefulness scores",
    );
  }
  if (protocol.proposedThresholds.status !== "proposed_unagreed") {
    throw new N6UsefulnessPilotPrepError(
      "Pilot-prep must keep thresholds as proposed_unagreed until humans agree",
    );
  }

  const reviewerRosterSlots = defaultReviewerSlots();
  const checks = buildChecks({protocol, scores, run, receipt});
  const eng = checks.filter((c) => c.plane === "engineering");
  const human = checks.filter((c) => c.plane === "human");
  const engCleared = eng.filter((c) => c.status === "CLEARED").length;
  const humanPending = human.filter(
    (c) => c.status === "PENDING_HUMAN" || c.status === "NO_GO" || c.status === "BLOCKED",
  ).length;
  if (engCleared !== eng.length) {
    throw new N6UsefulnessPilotPrepError(
      "Engineering pilot-prep checks must all CLEARED before writing artifact",
    );
  }
  if (humanPending !== human.length) {
    throw new N6UsefulnessPilotPrepError(
      "Human pilot-prep checks must remain PENDING_HUMAN/NO_GO while scores are empty",
    );
  }

  return seal({
    schemaVersion: N6_PILOT_PREP_SCHEMA,
    phase: "N6",
    programme: "gut_immune_t2d",
    remediationPhase: "production_readiness_audit_phase_7",
    generatedAt: input.generatedAt,
    protocolSchema: BLINDED_USEFULNESS_PROTOCOL_SCHEMA,
    scorePacketSchema: BLINDED_SCORE_PACKET_SCHEMA,
    rubricVersion: N6_RUBRIC_VERSION,
    protocolHash: digestCanonical(protocol),
    scorePacketHash: digestCanonical(scores),
    runManifestHash: digestCanonical(run),
    evalReceiptHash: digestCanonical(receipt),
    questionCount: receipt.questionCount,
    conditionCount: receipt.conditionCount,
    packetCount: receipt.packetCount,
    scoredRows: 0,
    n3HumanLabelFreezePrerequisite: "BLOCKED",
    thresholdsStatus: "proposed_unagreed",
    usefulnessPilotGoNoGo: "NO_GO",
    engineeringScaffold: "CLEARED",
    independentBlindedReviewers: "BLOCKED",
    scientificAcceptance: "BLOCKED",
    usefulnessClaimed: false,
    scientificApproval: false,
    graphPromotable: false,
    fabricatedExpertScoresPermitted: false,
    inventedReviewerIdentitiesPermitted: false,
    honesty: {
      emptyScoresAreNotUsefulness: true,
      roleSlotsAreNotPeople: true,
      n6PilotRequiresN3Freeze: true,
      thresholdsMustBePreAgreed: true,
      noGateCAutoApprove: true,
      noLiveCdsPhi: true,
      redWaveOnlyForHsi: true,
      noInventedMoU: true,
    },
    reviewerRosterSlots,
    checks,
    summary: {
      engineeringChecksCleared: engCleared,
      engineeringChecksTotal: eng.length,
      humanChecksPending: humanPending,
      humanChecksTotal: human.length,
      reviewerSlotsReserved: reviewerRosterSlots.length,
      reviewerSlotsFilled: 0,
      scoredRows: 0,
      usefulnessPilotCleared: false,
    },
    residualHumanSteps: [
      "Complete Audit #4 N3 human label freeze (named SMEs + adjudication) before starting N6 pilot scoring.",
      "Pre-agree scoring rubric thresholds and major-error adjudication with SMEs — keep proposed_unagreed until locked.",
      "Recruit independent blinded reviewers into empty roster slots (do not invent identities).",
      "Supply conventional-research artifacts for condition C without unblinding A/B.",
      "Dual-review → record disagreement → adjudicate → freeze scores as frozen_human_scores.",
      "Unblind under separate human control using protocol.blindingKey; report denominators and uncertainty.",
      "Only then consider usefulness vs baseline — software tests and empty packets never clear the pilot.",
      "Re-run bun run n6:check / n6:pilot-prep; scientificAcceptance and usefulnessClaimed stay BLOCKED/false until humans finish.",
    ],
  });
}

export function parseN6UsefulnessPilotPrep(value: unknown): N6UsefulnessPilotPrep {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new N6UsefulnessPilotPrepError("Invalid N6 pilot-prep packet");
  }
  const prep = value as N6UsefulnessPilotPrep;
  if (
    prep.schemaVersion !== N6_PILOT_PREP_SCHEMA ||
    prep.phase !== "N6" ||
    prep.programme !== "gut_immune_t2d" ||
    prep.remediationPhase !== "production_readiness_audit_phase_7"
  ) {
    throw new N6UsefulnessPilotPrepError("Unsupported N6 pilot-prep schema");
  }
  if (
    prep.scientificApproval !== false ||
    prep.graphPromotable !== false ||
    prep.fabricatedExpertScoresPermitted !== false ||
    prep.inventedReviewerIdentitiesPermitted !== false ||
    prep.usefulnessClaimed !== false ||
    prep.scientificAcceptance !== "BLOCKED" ||
    prep.independentBlindedReviewers !== "BLOCKED" ||
    prep.n3HumanLabelFreezePrerequisite !== "BLOCKED" ||
    prep.thresholdsStatus !== "proposed_unagreed" ||
    prep.usefulnessPilotGoNoGo !== "NO_GO" ||
    prep.scoredRows !== 0 ||
    prep.summary.reviewerSlotsFilled !== 0 ||
    prep.summary.usefulnessPilotCleared !== false
  ) {
    throw new N6UsefulnessPilotPrepError(
      "N6 pilot-prep cannot claim usefulness pilot CLEARED, science acceptance, or filled reviewer slots",
    );
  }
  if (!Array.isArray(prep.reviewerRosterSlots) || prep.reviewerRosterSlots.length < 3) {
    throw new N6UsefulnessPilotPrepError(
      "N6 pilot-prep must reserve at least two reviewers + adjudicator slots",
    );
  }
  for (const slot of prep.reviewerRosterSlots) {
    if (
      slot.principal !== null ||
      slot.organisation !== null ||
      slot.recruitedAt !== null ||
      slot.credentialsAttested !== false ||
      slot.independenceAttested !== false
    ) {
      throw new N6UsefulnessPilotPrepError(
        "N6 pilot-prep cannot invent reviewer identities or attestations",
      );
    }
  }
  if (!Array.isArray(prep.checks) || prep.checks.length === 0) {
    throw new N6UsefulnessPilotPrepError("N6 pilot-prep checks missing");
  }
  for (const check of prep.checks) {
    if (check.plane === "human" && check.status === "CLEARED") {
      throw new N6UsefulnessPilotPrepError(
        `Human check ${check.id} cannot be CLEARED in empty N6 pilot-prep`,
      );
    }
  }
  const {prepHash, ...body} = prep;
  const expected = digest(body);
  if (prepHash !== expected) {
    throw new N6UsefulnessPilotPrepError("N6 pilot-prep hash mismatch");
  }
  return prep;
}
