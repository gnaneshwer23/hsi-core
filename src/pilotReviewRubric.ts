/**
 * Human review rubric for the scope-locked (Phase 2) / future partner-signed pilot
 * question against Stage 1 four workflow outputs.
 *
 * Checklist + export artifact. Apolo Pharma Stage 1 numeric cut-offs are
 * partner_agreed (2026-11-01); hypothetical fixture path remains set_for_test.
 * Not CDS. Not auto-approval into product KG.
 */
import { getPartnerLock, type HsiPartnerLock } from "./partnerLock";
import { buildPilotEvidencePack, type PilotEvidencePack } from "./pilotEvidencePack";
import {
  evalPackAgainstStage1NumericThresholds,
  getStage1RubricThresholds,
  type Stage1RubricThresholdsBundle,
  type ThresholdSetStatus,
  type ThresholdSource,
} from "./stage1RubricThresholds";

export const PILOT_REVIEW_RUBRIC_SCHEMA = "hsi-pilot-review-rubric-1" as const;

export type RubricCheckStatus =
  | "ready_for_human"
  | "blocked_on_partner"
  | "set_for_test"
  | "n_a_until_lock";

export type RubricCheckItem = {
  id: string;
  output:
    | "evidence_map"
    | "entity_slice"
    | "competing_explanations"
    | "expert_shortlist"
    | "cross_cutting";
  criterion: string;
  howToJudge: string;
  status: RubricCheckStatus;
  relatedClaimIds: string[];
};

export type RubricSuccessMetric = {
  id: string;
  metric: string;
  recordWhat: string;
  /** Human-readable threshold line (numeric or qualitative). */
  threshold: string;
  thresholdStatus: ThresholdSetStatus;
  /** @deprecated Prefer `threshold` + `thresholdStatus`. Kept for older consumers. */
  thresholdWithPartner: string;
};

export type PilotReviewRubric = {
  schemaVersion: typeof PILOT_REVIEW_RUBRIC_SCHEMA;
  notCds: true;
  autoApproveIntoKg: false;
  generatedAt: string;
  partnerLock: {
    scopeLocked: boolean;
    partnerSigned: boolean;
    lockedPilot: boolean;
    provisionalLock: boolean;
    status: HsiPartnerLock["status"];
    disease: string;
    researchQuestion: string;
    partnerId: string;
  };
  stage1Outputs: Array<{
    id: string;
    label: string;
    packField: string;
  }>;
  checklist: RubricCheckItem[];
  /** Active Stage 1 numeric + qualitative fixture / partner thresholds. */
  stage1Thresholds: Stage1RubricThresholdsBundle;
  successMetrics: RubricSuccessMetric[];
  flipToLockedPilot: string[];
  summary: {
    readyForHuman: number;
    blockedOnPartner: number;
    setForTest: number;
    packEvidenceRows: number;
    packClaimsWithLoinc: number;
    numericThresholdsMet: boolean;
    thresholdSource: ThresholdSource;
    thresholdStatus: ThresholdSetStatus;
  };
  nextActions: string[];
};

function buildChecklist(
  lock: HsiPartnerLock,
  pack: PilotEvidencePack,
  thresholds: Stage1RubricThresholdsBundle,
): RubricCheckItem[] {
  const pathwayClaims = lock.seedPathway?.primaryClaimIds ?? [];
  const thresholdsSetForTest = thresholds.thresholdStatus === "set_for_test";
  const thresholdsPartnerAgreed = thresholds.thresholdStatus === "partner_agreed";
  const namedPartnerConfirmed =
    lock.partner?.type === "named_partner" &&
    lock.partnerSigned &&
    lock.legalBinding &&
    !lock.isHypothetical;
  return [
    {
      id: "em-1",
      output: "evidence_map",
      criterion: "Every retained claim has durable provenance (PMID/DOI/label) or an explicit missing label",
      howToJudge: "Scan pack.evidenceMap source.missing; provisional RA rows should prefer real PMIDs.",
      status: "ready_for_human",
      relatedClaimIds: pathwayClaims,
    },
    {
      id: "em-2",
      output: "evidence_map",
      criterion: "Evidence grades stay honest (established / uncertain / unexplored) — no silent promotion",
      howToJudge: "No seed may show established without curationReview=approved; CDS must stay closed.",
      status: "ready_for_human",
      relatedClaimIds: pathwayClaims,
    },
    {
      id: "em-3",
      output: "evidence_map",
      criterion: "Claim → marker → LOINC visible where applicable (e.g. anti-CCP)",
      howToJudge: `Pack reports claimsWithLoinc=${pack.summary.claimsWithLoinc}; fixture min=${thresholds.numeric.minLoincLinkedClaims}; anti-CCP LOINC 53031-9 and RF LOINC 11572-5 expected on RA biomarker rows.`,
      status: "ready_for_human",
      relatedClaimIds: ["HSI-C-RA-002", "HSI-C-RA-011"],
    },
    {
      id: "es-1",
      output: "entity_slice",
      criterion: "Entity slice covers cells, pathways, biomarkers, treatments, studies for the scope-locked question",
      howToJudge:
        "Expect TNF, IL-6, anti-CCP, RF, ADA, anti-TNF therapy, synovial macrophages, RA disease node in partnerScopedEntitySlice.",
      status: "ready_for_human",
      relatedClaimIds: pathwayClaims,
    },
    {
      id: "es-2",
      output: "entity_slice",
      criterion: "Empty buckets mean unknown, not 'no biology'",
      howToJudge: "Read entitySlice.note; do not invent ontology IDs until partner source set is known.",
      status: "ready_for_human",
      relatedClaimIds: [],
    },
    {
      id: "ce-1",
      output: "competing_explanations",
      criterion:
        "Competing frames stay visible: TNF-centric, IL-6 / multi-cytokine, ADA/immunogenicity, and RF/ACPA serology tension",
      howToJudge: `Pack competingExplanations should include expl-ra-tnf-centric, expl-ra-multi-cytokine, expl-ra-ada-immunogenicity, expl-ra-acpa-subgroup; fixture min=${thresholds.numeric.minCompetingExplanations}.`,
      status: "ready_for_human",
      relatedClaimIds: [
        "HSI-C-RA-001",
        "HSI-C-RA-004",
        "HSI-C-RA-005",
        "HSI-C-RA-007",
        "HSI-C-RA-009",
        "HSI-C-RA-010",
      ],
    },
    {
      id: "ce-2",
      output: "competing_explanations",
      criterion: "Uncertainties from uncertain-grade edges are listed without forced narrative collapse",
      howToJudge:
        "Review pack.uncertainties; response-heterogeneity and ADA monitoring edges must remain hypothesized/uncertain where graded that way.",
      status: "ready_for_human",
      relatedClaimIds: ["HSI-C-RA-005", "HSI-C-RA-008", "HSI-C-RA-009"],
    },
    {
      id: "ex-1",
      output: "expert_shortlist",
      criterion: "Gaps / hypotheses are reviewable and autoApproved=false",
      howToJudge: "Every expertShortlist item must have autoApproved=false; Gate C pending rows included (allowed under fixture).",
      status: "ready_for_human",
      relatedClaimIds: pathwayClaims,
    },
    {
      id: "ex-2",
      output: "expert_shortlist",
      criterion: "Partner can reject items without KG pollution",
      howToJudge: "Confirm REL map + Gate C checklist never auto-approve; rejections are success signal.",
      status: "ready_for_human",
      relatedClaimIds: [],
    },
    {
      id: "x-1",
      output: "cross_cutting",
      criterion: "Exports clearly label scopeLocked=true; lockedPilot=false until legalBinding; fixture partnerSigned must carry isHypothetical / TEST FIXTURE banner (no fake MoU)",
      howToJudge: "MANIFEST + pack + Discovery Centre meta must show status=scope_locked, scopeLocked=true, lockedPilot=false; if partnerSigned=true require agreementKind=hypothetical_test_only.",
      status: "ready_for_human",
      relatedClaimIds: [],
    },
    {
      id: "x-2",
      output: "cross_cutting",
      criterion: "Named partner confirms disease + question wording (flip partnerSigned)",
      howToJudge: namedPartnerConfirmed
        ? `Named partner ${lock.partner?.id} (${lock.partner?.label}) confirmed; partnerSigned=${lock.partnerSigned}; legalBinding=${lock.legalBinding}; lockedPilot=${lock.lockedPilot}. MoU operator-asserted — still not CDS.`
        : "Blocked until outreach produces a confirmed row in ISI_PILOT_PARTNER_SHORTLIST.md and partnerSigned flips under legalBinding.",
      status: namedPartnerConfirmed ? "ready_for_human" : "blocked_on_partner",
      relatedClaimIds: [],
    },
    {
      id: "x-3",
      output: "cross_cutting",
      criterion: "Agree numeric success thresholds (partner-scoped edges, competing frames, LOINC claims, Gate C pending policy)",
      howToJudge: thresholdsSetForTest
        ? `Fixture thresholds set_for_test (source=${thresholds.thresholdSource}): minPartnerScopedEdges=${thresholds.numeric.minPartnerScopedEdges}, minCompetingExplanations=${thresholds.numeric.minCompetingExplanations}, minLoincLinkedClaims=${thresholds.numeric.minLoincLinkedClaims}, gateCPendingAllowed=${thresholds.numeric.gateCPendingAllowed}, acceptanceOverallAllowed=${thresholds.numeric.acceptanceOverallAllowed}. Real partner must re-agree (replaceWithPartnerAgreedThresholds=true).`
        : thresholdsPartnerAgreed
          ? `Apolo Pharma partner_agreed (source=${thresholds.thresholdSource}; partnerId=${thresholds.partnerId}; replaceWithPartnerAgreedThresholds=${thresholds.replaceWithPartnerAgreedThresholds}): minPartnerScopedEdges=${thresholds.numeric.minPartnerScopedEdges}, minCompetingExplanations=${thresholds.numeric.minCompetingExplanations}, minLoincLinkedClaims=${thresholds.numeric.minLoincLinkedClaims}, gateCPendingAllowed=${thresholds.numeric.gateCPendingAllowed}, acceptanceOverallAllowed=${thresholds.numeric.acceptanceOverallAllowed}. Operator-agreed 2026-11-01.`
          : "Fill successMetrics / stage1Thresholds with partner before formal user testing.",
      status: thresholdsSetForTest
        ? "set_for_test"
        : thresholdsPartnerAgreed
          ? "ready_for_human"
          : "blocked_on_partner",
      relatedClaimIds: [],
    },
    {
      id: "x-4",
      output: "cross_cutting",
      criterion: "Source licensing / attribution for the agreed literature set",
      howToJudge: "Scope-locked PMIDs are public PubMed locators; partner may require additional licensed corpora. See docs/HOW_TO_SOURCE_LICENSING.md.",
      status: "blocked_on_partner",
      relatedClaimIds: pathwayClaims,
    },
  ];
}

function buildSuccessMetrics(
  thresholds: Stage1RubricThresholdsBundle,
): RubricSuccessMetric[] {
  const status = thresholds.thresholdStatus;
  const n = thresholds.numeric;
  const q = thresholds.qualitativeFixturePlaceholders;
  const fixtureNote =
    status === "set_for_test"
      ? " (hypothetical_test_fixture — replace with partner-agreed)"
      : status === "pending"
        ? " (TBD — agree before user testing)"
        : status === "partner_agreed"
          ? " (partner_agreed — Apolo Pharma 2026-11-01)"
          : "";

  return [
    {
      id: "m-partner-scoped",
      metric: "Partner-scoped evidence edges",
      recordWhat: "Evidence-map rows on the locked RA/anti-TNF pathway",
      threshold: `≥ ${n.minPartnerScopedEdges}${fixtureNote}`,
      thresholdStatus: status,
      thresholdWithPartner: `≥ ${n.minPartnerScopedEdges}${fixtureNote}`,
    },
    {
      id: "m-competing",
      metric: "Competing explanations",
      recordWhat: "Distinct frames kept visible (TNF / IL-6 / ADA / serology …)",
      threshold: `≥ ${n.minCompetingExplanations}${fixtureNote}`,
      thresholdStatus: status,
      thresholdWithPartner: `≥ ${n.minCompetingExplanations}${fixtureNote}`,
    },
    {
      id: "m-loinc",
      metric: "LOINC-linked claims",
      recordWhat: "Claims with a LOINC marker wired on the pack",
      threshold: `≥ ${n.minLoincLinkedClaims}${fixtureNote}`,
      thresholdStatus: status,
      thresholdWithPartner: `≥ ${n.minLoincLinkedClaims}${fixtureNote}`,
    },
    {
      id: "m-gate-c",
      metric: "Gate C pending policy",
      recordWhat: "Pending Gate C rows during Stage 1 review",
      threshold: n.gateCPendingAllowed
        ? `pending allowed; acceptance may be ${n.acceptanceOverallAllowed}${fixtureNote}`
        : `pending not allowed${fixtureNote}`,
      thresholdStatus: status,
      thresholdWithPartner: n.gateCPendingAllowed
        ? `pending allowed; acceptance may be ${n.acceptanceOverallAllowed}${fixtureNote}`
        : `pending not allowed${fixtureNote}`,
    },
    {
      id: "m-time",
      metric: "Time saved",
      recordWhat: "Hours / days vs current lit + synthesis path for this question",
      threshold: `≥ ${q.timeSavedHoursVsBaselineMin}h vs baseline${fixtureNote}`,
      thresholdStatus: status,
      thresholdWithPartner: `≥ ${q.timeSavedHoursVsBaselineMin}h vs baseline${fixtureNote}`,
    },
    {
      id: "m-useful",
      metric: "Useful evidence",
      recordWhat: "Sources / mechanisms / biomarkers the partner keeps",
      threshold: `≥ ${q.usefulEvidenceItemsKeptMin} kept items${fixtureNote}`,
      thresholdStatus: status,
      thresholdWithPartner: `≥ ${q.usefulEvidenceItemsKeptMin} kept items${fixtureNote}`,
    },
    {
      id: "m-next",
      metric: "Better next decision",
      recordWhat: "Clearer next experiment, study design, or kill/continue call",
      threshold: q.clearerNextDecisionRequired
        ? `required${fixtureNote}`
        : `optional${fixtureNote}`,
      thresholdStatus: status,
      thresholdWithPartner: q.clearerNextDecisionRequired
        ? `required${fixtureNote}`
        : `optional${fixtureNote}`,
    },
    {
      id: "m-reject",
      metric: "Expert rejections",
      recordWhat: "What they reject — as carefully as what they accept",
      threshold: `≥ ${q.expertRejectionsRecordedMin} recorded rejection(s)${fixtureNote}`,
      thresholdStatus: status,
      thresholdWithPartner: `≥ ${q.expertRejectionsRecordedMin} recorded rejection(s)${fixtureNote}`,
    },
  ];
}

export function buildPilotReviewRubric(opts?: {
  generatedAt?: string;
  lock?: HsiPartnerLock;
  pack?: PilotEvidencePack;
  thresholds?: Stage1RubricThresholdsBundle;
}): PilotReviewRubric {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const lock = opts?.lock ?? getPartnerLock();
  const pack =
    opts?.pack ??
    buildPilotEvidencePack({
      generatedAt,
      evidenceSnapshotRef: "dist/outputs/latest/hsi-isi-export.json",
    });
  const thresholds = opts?.thresholds ?? getStage1RubricThresholds();
  const checklist = buildChecklist(lock, pack, thresholds);
  const readyForHuman = checklist.filter((c) => c.status === "ready_for_human").length;
  const blockedOnPartner = checklist.filter((c) => c.status === "blocked_on_partner").length;
  const setForTest = checklist.filter((c) => c.status === "set_for_test").length;
  const numericEval = evalPackAgainstStage1NumericThresholds(pack, thresholds.numeric);

  return {
    schemaVersion: PILOT_REVIEW_RUBRIC_SCHEMA,
    notCds: true,
    autoApproveIntoKg: false,
    generatedAt,
    partnerLock: {
      scopeLocked: lock.scopeLocked,
      partnerSigned: lock.partnerSigned,
      lockedPilot: lock.lockedPilot,
      provisionalLock: lock.provisionalLock,
      status: lock.status,
      disease: lock.disease?.label ?? "TBD",
      researchQuestion: lock.researchQuestion ?? "TBD — lock with partner",
      partnerId: lock.partner?.id ?? "TBD",
    },
    stage1Outputs: [
      { id: "1", label: "Evidence map", packField: "evidenceMap" },
      { id: "2", label: "Entity slice", packField: "entitySlice" },
      { id: "3", label: "Competing explanations + uncertainties", packField: "competingExplanations+uncertainties" },
      { id: "4", label: "Expert shortlist (gaps / hypotheses)", packField: "expertShortlist" },
    ],
    checklist,
    stage1Thresholds: thresholds,
    successMetrics: buildSuccessMetrics(thresholds),
    flipToLockedPilot: [...lock.flipRequirements],
    summary: {
      readyForHuman,
      blockedOnPartner,
      setForTest,
      packEvidenceRows: pack.summary.evidenceMapRows,
      packClaimsWithLoinc: pack.summary.claimsWithLoinc,
      numericThresholdsMet: numericEval.pass,
      thresholdSource: thresholds.thresholdSource,
      thresholdStatus: thresholds.thresholdStatus,
    },
    nextActions: [
      "Human-review checklist items marked ready_for_human against hsi-pilot-evidence-pack.md.",
      lock.isHypothetical
        ? "Keep lockedPilot=false / legalBinding=false until a real named partner confirms disease + question. Fixture partnerSigned is path-testing only (src/hypotheticalPartnerFixture.ts)."
        : `Named partner ${lock.partner?.label ?? "Apolo Pharma"} locked (lockedPilot=${lock.lockedPilot}); still not CDS / no auto Gate C.`,
      thresholds.thresholdStatus === "set_for_test"
        ? "Numeric Stage 1 thresholds are set_for_test under the hypothetical fixture — real partner must re-agree before formal user testing (replaceWithPartnerAgreedThresholds=true)."
        : thresholds.thresholdStatus === "partner_agreed"
          ? "Numeric Stage 1 thresholds are partner_agreed with Apolo Pharma (2026-11-01); keep pack depth ≥ 12/4/6."
          : "Agree success-metric thresholds before formal pilot user testing.",
      "Phase 5 complete = hsi-pilot-acceptance.* + hsi-pilot-walkthrough.md (partner-ready Stage 1 pack; licensing partnerClearedCount still open).",
      "Phase 8 (clinical R3–R5 / Akeno) needs an explicit user ask + Stage 3 gates.",
      "Do not invent CDS or auto-approve Gate C from scopeLocked / partner_agreed KPIs.",
    ],
  };
}

export function serializePilotReviewRubric(
  rubric: PilotReviewRubric = buildPilotReviewRubric(),
): string {
  return `${JSON.stringify(rubric, null, 2)}\n`;
}

export function serializePilotReviewRubricMarkdown(
  rubric: PilotReviewRubric = buildPilotReviewRubric(),
): string {
  const lines: string[] = [
    "# ISI pilot — Stage 1 review rubric",
    "",
    `Schema: \`${rubric.schemaVersion}\` · generated ${rubric.generatedAt}`,
    "",
    "> Not CDS. Not auto-approval into product KG. scopeLocked ≠ partnerSigned / lockedPilot.",
    "",
    "## Partner lock",
    "",
    `| Field | Value |`,
    `|-------|-------|`,
    `| scopeLocked | \`${rubric.partnerLock.scopeLocked}\` |`,
    `| partnerSigned | \`${rubric.partnerLock.partnerSigned}\` |`,
    `| lockedPilot | \`${rubric.partnerLock.lockedPilot}\` |`,
    `| provisionalLock | \`${rubric.partnerLock.provisionalLock}\` |`,
    `| status | \`${rubric.partnerLock.status}\` |`,
    `| disease | ${rubric.partnerLock.disease} |`,
    `| researchQuestion | ${rubric.partnerLock.researchQuestion} |`,
    `| partnerId | \`${rubric.partnerLock.partnerId}\` |`,
    "",
    "## Stage 1 four outputs",
    "",
  ];
  for (const o of rubric.stage1Outputs) {
    lines.push(`- **${o.id}. ${o.label}** — pack field \`${o.packField}\``);
  }

  lines.push("", "## Checklist", "");
  for (const c of rubric.checklist) {
    lines.push(
      `- [\`${c.status}\`] **${c.id}** (${c.output}): ${c.criterion}`,
      `  - Judge: ${c.howToJudge}`,
    );
  }

  const th = rubric.stage1Thresholds;
  lines.push(
    "",
    "## Stage 1 numeric thresholds",
    "",
    `- **thresholdSource:** \`${th.thresholdSource}\``,
    `- **thresholdStatus:** \`${th.thresholdStatus}\``,
    `- **replaceWithPartnerAgreedThresholds:** \`${th.replaceWithPartnerAgreedThresholds}\``,
    `- minPartnerScopedEdges: **${th.numeric.minPartnerScopedEdges}**`,
    `- minCompetingExplanations: **${th.numeric.minCompetingExplanations}**`,
    `- minLoincLinkedClaims: **${th.numeric.minLoincLinkedClaims}**`,
    `- gateCPendingAllowed: **${th.numeric.gateCPendingAllowed}**`,
    `- acceptanceOverallAllowed: **${th.numeric.acceptanceOverallAllowed}**`,
    "",
    "> Real partner must re-agree these numbers before formal user testing / lockedPilot.",
    "",
    "## Success metrics",
    "",
  );
  for (const m of rubric.successMetrics) {
    lines.push(
      `- [\`${m.thresholdStatus}\`] **${m.metric}** — ${m.recordWhat} · threshold: ${m.threshold}`,
    );
  }

  lines.push("", "## Flip to partnerSigned / lockedPilot (needs real partner)", "");
  for (const f of rubric.flipToLockedPilot) {
    lines.push(`- ${f}`);
  }

  lines.push(
    "",
    "## Summary",
    "",
    `- ready_for_human: ${rubric.summary.readyForHuman}`,
    `- blocked_on_partner: ${rubric.summary.blockedOnPartner}`,
    `- set_for_test: ${rubric.summary.setForTest}`,
    `- pack evidence rows: ${rubric.summary.packEvidenceRows}`,
    `- claims with LOINC: ${rubric.summary.packClaimsWithLoinc}`,
    `- numericThresholdsMet: ${rubric.summary.numericThresholdsMet}`,
    `- thresholdSource: ${rubric.summary.thresholdSource}`,
    `- thresholdStatus: ${rubric.summary.thresholdStatus}`,
    "",
    "## Next actions",
    "",
  );
  for (const a of rubric.nextActions) {
    lines.push(`- ${a}`);
  }
  lines.push("");
  return lines.join("\n");
}
