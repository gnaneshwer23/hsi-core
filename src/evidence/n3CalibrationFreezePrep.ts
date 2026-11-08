/**
 * N3 calibration freeze prep (production-readiness audit Phase #4).
 * Engineering scaffolding for SME recruitment + 20–50 label freeze + pilot plan.
 * Never invents scientific labels, SME identities, freeze dates, or Gate C approval.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import {
  N3_ANNOTATION_GUIDELINE_VERSION,
  N3_LABEL_PACKET_SCHEMA,
  assessLabelFreeze,
  parseBenchmarkLabelPacket,
  parseScientificBenchmarkKit,
  type BenchmarkLabelPacket,
  type GateStatus,
  type ScientificBenchmarkKit,
} from "./scientificBenchmark";

export const N3_FREEZE_PREP_SCHEMA = "hsi-n3-calibration-freeze-prep-1" as const;

export type FreezePrepCheckStatus = "CLEARED" | "BLOCKED" | "PENDING_HUMAN";

export type FreezePrepCheckId =
  | "calibration_scaffold_20_50"
  | "empty_label_packet_awaiting_sme"
  | "study_family_split_no_leakage"
  | "annotation_guideline_published"
  | "sme_roster_slots_reserved"
  | "sme_reviewers_recruited"
  | "calibration_labels_complete"
  | "disagreement_adjudicated"
  | "label_packet_frozen"
  | "pilot_scale_plan_acknowledged";

export type FreezePrepCheck = {
  id: FreezePrepCheckId;
  title: string;
  plane: "engineering" | "human";
  status: FreezePrepCheckStatus;
  evidence: string;
};

export type SmeRosterSlotRole = "annotator_a" | "annotator_b" | "adjudicator" | "operator";

/** Anonymous role slots only — principal stays null until a real human is named. */
export type SmeRosterSlot = {
  slotId: string;
  role: SmeRosterSlotRole;
  /** Stable role label for worksheets — not a person's name. */
  roleLabel: string;
  principal: null;
  organisation: null;
  recruitedAt: null;
  credentialsAttested: false;
  ndaOrConflictCleared: false;
  notes: string;
};

export type N3CalibrationFreezePrep = {
  schemaVersion: typeof N3_FREEZE_PREP_SCHEMA;
  phase: "N3";
  programme: "gut_immune_t2d";
  remediationPhase: "production_readiness_audit_phase_4";
  generatedAt: string;
  guidelineVersion: typeof N3_ANNOTATION_GUIDELINE_VERSION;
  labelPacketSchema: typeof N3_LABEL_PACKET_SCHEMA;
  kitHash: string;
  labelsHash: string;
  calibrationItemCount: number;
  labelledCalibrationCount: 0;
  proposedCalibrationRange: {min: 20; max: 50};
  proposedPilotRange: {min: 100; max: 200};
  engineeringScaffold: GateStatus;
  humanLabelFreeze: "BLOCKED";
  scientificAcceptance: "BLOCKED";
  scientificApproval: false;
  graphPromotable: false;
  fabricatedLabelsPermitted: false;
  inventedSmeIdentitiesPermitted: false;
  honesty: {
    emptyLabelsAreNotScores: true;
    roleSlotsAreNotPeople: true;
    freezeRequiresRealReviewers: true;
    noGateCAutoApprove: true;
    noLiveCdsPhi: true;
    redWaveOnlyForHsi: true;
  };
  smeRosterSlots: SmeRosterSlot[];
  checks: FreezePrepCheck[];
  summary: {
    engineeringChecksCleared: number;
    engineeringChecksTotal: number;
    humanChecksPending: number;
    humanChecksTotal: number;
    smeSlotsReserved: number;
    smeSlotsFilled: 0;
    calibrationInRange: true;
  };
  residualHumanSteps: string[];
  prepHash: string;
};

export class N3CalibrationFreezePrepError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "N3CalibrationFreezePrepError";
  }
}

function digest(value: unknown): string {
  return createHash("sha256").update(canonicalEvidenceJson(value)).digest("hex");
}

function seal(body: Omit<N3CalibrationFreezePrep, "prepHash">): N3CalibrationFreezePrep {
  return {...body, prepHash: digest(body)};
}

function defaultRosterSlots(): SmeRosterSlot[] {
  return [
    {
      slotId: "N3-SME-SLOT-A",
      role: "annotator_a",
      roleLabel: "Annotator A",
      principal: null,
      organisation: null,
      recruitedAt: null,
      credentialsAttested: false,
      ndaOrConflictCleared: false,
      notes: "Independent primary annotator slot. Fill only with a real recruited reviewer.",
    },
    {
      slotId: "N3-SME-SLOT-B",
      role: "annotator_b",
      roleLabel: "Annotator B",
      principal: null,
      organisation: null,
      recruitedAt: null,
      credentialsAttested: false,
      ndaOrConflictCleared: false,
      notes: "Independent secondary annotator slot. Must not share labels with Annotator A before adjudication.",
    },
    {
      slotId: "N3-SME-SLOT-ADJ",
      role: "adjudicator",
      roleLabel: "Adjudicator",
      principal: null,
      organisation: null,
      recruitedAt: null,
      credentialsAttested: false,
      ndaOrConflictCleared: false,
      notes: "Resolves A/B disagreement; retains both originals. Not inventable by engineering.",
    },
    {
      slotId: "N3-SME-SLOT-OPS",
      role: "operator",
      roleLabel: "Operator",
      principal: null,
      organisation: null,
      recruitedAt: null,
      credentialsAttested: false,
      ndaOrConflictCleared: false,
      notes: "Maintains empty packets and freeze checklist; never invents expectedOutcome labels.",
    },
  ];
}

function buildChecks(input: {
  kit: ScientificBenchmarkKit;
  labels: BenchmarkLabelPacket;
  freezeStatus: GateStatus;
  labelledCount: number;
}): FreezePrepCheck[] {
  const cal = input.kit.scalePlan.currentCalibrationCount;
  const inRange = cal >= 20 && cal <= 50;
  return [
    {
      id: "calibration_scaffold_20_50",
      title: "Calibration scaffold within 20–50 unlabelled items",
      plane: "engineering",
      status: inRange ? "CLEARED" : "BLOCKED",
      evidence: `${cal} calibration items in kit (target 20–50); none invented as labels.`,
    },
    {
      id: "empty_label_packet_awaiting_sme",
      title: "Empty label packet status awaiting_sme",
      plane: "engineering",
      status:
        input.labels.status === "awaiting_sme" && input.labelledCount === 0 ? "CLEARED" : "BLOCKED",
      evidence: `Packet status=${input.labels.status}; labelledCount=${input.labelledCount}.`,
    },
    {
      id: "study_family_split_no_leakage",
      title: "Study-family split validates with no scored-partition leakage",
      plane: "engineering",
      status: input.kit.gates.studyFamilySplit,
      evidence: "assertStudyFamilySeparation / kit.gates.studyFamilySplit from scientificBenchmark.",
    },
    {
      id: "annotation_guideline_published",
      title: "Annotation guideline published for gut–immune–T2D",
      plane: "engineering",
      status: "CLEARED",
      evidence: `research/domain-graph/n3/annotation-guideline-v1.md · ${N3_ANNOTATION_GUIDELINE_VERSION}`,
    },
    {
      id: "sme_roster_slots_reserved",
      title: "Anonymous SME roster slots reserved (A/B/adjudicator/operator)",
      plane: "engineering",
      status: "CLEARED",
      evidence: "Four role slots with principal=null; identities not invented.",
    },
    {
      id: "sme_reviewers_recruited",
      title: "Real SMEs recruited into roster slots",
      plane: "human",
      status: "PENDING_HUMAN",
      evidence: "smeSlotsFilled=0. Founder/operator must name independent reviewers.",
    },
    {
      id: "calibration_labels_complete",
      title: "Calibration labels complete (20–50) with rationale + annotatorId",
      plane: "human",
      status: "PENDING_HUMAN",
      evidence: "labelledCalibrationCount=0; assessLabelFreeze remains BLOCKED.",
    },
    {
      id: "disagreement_adjudicated",
      title: "A/B disagreement recorded and adjudicated where needed",
      plane: "human",
      status: "PENDING_HUMAN",
      evidence: "No disagreement rows exist until humans label.",
    },
    {
      id: "label_packet_frozen",
      title: "Label packet frozen_human_labels + split freezeDate set",
      plane: "human",
      status: input.freezeStatus === "CLEARED" ? "CLEARED" : "PENDING_HUMAN",
      evidence:
        input.freezeStatus === "BLOCKED"
          ? "humanLabelFreeze BLOCKED; freezeDate null; status ≠ frozen_human_labels."
          : "Unexpected CLEARED freeze without human process — refuse silent acceptance.",
    },
    {
      id: "pilot_scale_plan_acknowledged",
      title: "Pilot scale plan (100–200) documented for post-calibration",
      plane: "engineering",
      status: "CLEARED",
      evidence: "docs/engineering/N3_PILOT_SCALE_PLAN.md — plan only; 0 pilot candidates minted.",
    },
  ];
}

/** Build fail-closed freeze-prep packet from the current N3 kit + empty labels. */
export function buildN3CalibrationFreezePrep(input: {
  kit: ScientificBenchmarkKit;
  labels: BenchmarkLabelPacket;
  generatedAt: string;
}): N3CalibrationFreezePrep {
  const kit = parseScientificBenchmarkKit(input.kit);
  const labels = parseBenchmarkLabelPacket(input.labels);
  const freeze = assessLabelFreeze(labels, kit);
  if (freeze.status === "CLEARED") {
    throw new N3CalibrationFreezePrepError(
      "Refuse freeze-prep that claims humanLabelFreeze CLEARED without a separate human freeze receipt",
    );
  }
  if (freeze.labelledCount !== 0) {
    throw new N3CalibrationFreezePrepError(
      "Freeze-prep scaffold requires zero labelled rows; do not invent or stage fake SME labels",
    );
  }
  const cal = kit.scalePlan.currentCalibrationCount;
  if (cal < 20 || cal > 50) {
    throw new N3CalibrationFreezePrepError(
      `Calibration scaffold must stay in 20–50 range for Phase #4 prep (got ${cal})`,
    );
  }
  const smeRosterSlots = defaultRosterSlots();
  const checks = buildChecks({
    kit,
    labels,
    freezeStatus: freeze.status,
    labelledCount: freeze.labelledCount,
  });
  const eng = checks.filter((c) => c.plane === "engineering");
  const human = checks.filter((c) => c.plane === "human");
  const engCleared = eng.filter((c) => c.status === "CLEARED").length;
  const humanPending = human.filter((c) => c.status === "PENDING_HUMAN" || c.status === "BLOCKED").length;
  if (engCleared !== eng.length) {
    throw new N3CalibrationFreezePrepError("Engineering freeze-prep checks must all CLEARED before writing artifact");
  }
  if (humanPending !== human.length) {
    throw new N3CalibrationFreezePrepError("Human freeze-prep checks must remain PENDING_HUMAN while labels are empty");
  }

  return seal({
    schemaVersion: N3_FREEZE_PREP_SCHEMA,
    phase: "N3",
    programme: "gut_immune_t2d",
    remediationPhase: "production_readiness_audit_phase_4",
    generatedAt: input.generatedAt,
    guidelineVersion: N3_ANNOTATION_GUIDELINE_VERSION,
    labelPacketSchema: N3_LABEL_PACKET_SCHEMA,
    kitHash: labels.kitHash,
    labelsHash: digest(labels),
    calibrationItemCount: cal,
    labelledCalibrationCount: 0,
    proposedCalibrationRange: {min: 20, max: 50},
    proposedPilotRange: {min: 100, max: 200},
    engineeringScaffold: "CLEARED",
    humanLabelFreeze: "BLOCKED",
    scientificAcceptance: "BLOCKED",
    scientificApproval: false,
    graphPromotable: false,
    fabricatedLabelsPermitted: false,
    inventedSmeIdentitiesPermitted: false,
    honesty: {
      emptyLabelsAreNotScores: true,
      roleSlotsAreNotPeople: true,
      freezeRequiresRealReviewers: true,
      noGateCAutoApprove: true,
      noLiveCdsPhi: true,
      redWaveOnlyForHsi: true,
    },
    smeRosterSlots,
    checks,
    summary: {
      engineeringChecksCleared: engCleared,
      engineeringChecksTotal: eng.length,
      humanChecksPending: humanPending,
      humanChecksTotal: human.length,
      smeSlotsReserved: smeRosterSlots.length,
      smeSlotsFilled: 0,
      calibrationInRange: true,
    },
    residualHumanSteps: [
      "Recruit independent Annotator A, Annotator B, and Adjudicator into empty roster slots (do not invent identities).",
      "Calibrate on the 24 unlabelled items using annotation-guideline-v1.md; record disagreement / insufficient context.",
      "Keep N1 passage rights metadata-only until human licenceEvidenceUri clearance — prefer abstain when passages uncleared.",
      "Only after calibration agreement: mint pilot_candidate rows per N3_PILOT_SCALE_PLAN.md with study-family freeze before labelling held-out.",
      "Set label packet status to frozen_human_labels and split.freezeDate only after adjudication — never from eng alone.",
      "Re-run bun run n3:check / n3:freeze-prep; scientificAcceptance stays BLOCKED until freeze CLEARED.",
    ],
  });
}

export function parseN3CalibrationFreezePrep(value: unknown): N3CalibrationFreezePrep {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new N3CalibrationFreezePrepError("Invalid N3 freeze-prep packet");
  }
  const prep = value as N3CalibrationFreezePrep;
  if (
    prep.schemaVersion !== N3_FREEZE_PREP_SCHEMA ||
    prep.phase !== "N3" ||
    prep.programme !== "gut_immune_t2d" ||
    prep.remediationPhase !== "production_readiness_audit_phase_4"
  ) {
    throw new N3CalibrationFreezePrepError("Unsupported N3 freeze-prep schema");
  }
  if (
    prep.scientificApproval !== false ||
    prep.graphPromotable !== false ||
    prep.fabricatedLabelsPermitted !== false ||
    prep.inventedSmeIdentitiesPermitted !== false ||
    prep.humanLabelFreeze !== "BLOCKED" ||
    prep.scientificAcceptance !== "BLOCKED" ||
    prep.labelledCalibrationCount !== 0 ||
    prep.summary.smeSlotsFilled !== 0
  ) {
    throw new N3CalibrationFreezePrepError("N3 freeze-prep cannot claim science freeze or filled SME slots");
  }
  if (!Array.isArray(prep.smeRosterSlots) || prep.smeRosterSlots.length < 3) {
    throw new N3CalibrationFreezePrepError("N3 freeze-prep must reserve at least A/B/adjudicator slots");
  }
  for (const slot of prep.smeRosterSlots) {
    if (
      slot.principal !== null ||
      slot.organisation !== null ||
      slot.recruitedAt !== null ||
      slot.credentialsAttested !== false ||
      slot.ndaOrConflictCleared !== false
    ) {
      throw new N3CalibrationFreezePrepError("N3 freeze-prep cannot invent SME identities or attestations");
    }
  }
  if (!Array.isArray(prep.checks) || prep.checks.length === 0) {
    throw new N3CalibrationFreezePrepError("N3 freeze-prep checks missing");
  }
  for (const check of prep.checks) {
    if (check.plane === "human" && check.status === "CLEARED") {
      throw new N3CalibrationFreezePrepError(`Human check ${check.id} cannot be CLEARED in empty freeze-prep`);
    }
  }
  if (prep.calibrationItemCount < 20 || prep.calibrationItemCount > 50 || prep.summary.calibrationInRange !== true) {
    throw new N3CalibrationFreezePrepError("N3 freeze-prep calibration count out of 20–50 range");
  }
  const {prepHash, ...body} = prep;
  const expected = digest(body);
  if (prepHash !== expected) {
    throw new N3CalibrationFreezePrepError("N3 freeze-prep hash mismatch");
  }
  return prep;
}
