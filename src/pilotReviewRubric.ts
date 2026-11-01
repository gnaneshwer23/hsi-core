/**
 * Human review rubric for the scope-locked (Phase 2) / future partner-signed pilot
 * question against Stage 1 four workflow outputs.
 *
 * Checklist + export artifact — thresholds stay TBD until a named partner agrees them.
 * Not CDS. Not auto-approval into product KG.
 */
import { getPartnerLock, type HsiPartnerLock } from "./partnerLock";
import { buildPilotEvidencePack, type PilotEvidencePack } from "./pilotEvidencePack";

export const PILOT_REVIEW_RUBRIC_SCHEMA = "hsi-pilot-review-rubric-1" as const;

export type RubricCheckStatus = "ready_for_human" | "blocked_on_partner" | "n_a_until_lock";

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
  successMetrics: Array<{
    id: string;
    metric: string;
    recordWhat: string;
    thresholdWithPartner: "TBD — agree before user testing";
  }>;
  flipToLockedPilot: string[];
  summary: {
    readyForHuman: number;
    blockedOnPartner: number;
    packEvidenceRows: number;
    packClaimsWithLoinc: number;
  };
  nextActions: string[];
};

function buildChecklist(lock: HsiPartnerLock, pack: PilotEvidencePack): RubricCheckItem[] {
  const pathwayClaims = lock.seedPathway?.primaryClaimIds ?? [];
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
      howToJudge: `Pack reports claimsWithLoinc=${pack.summary.claimsWithLoinc}; anti-CCP LOINC 53031-9 and RF LOINC 11572-5 expected on RA biomarker rows.`,
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
      howToJudge:
        "Pack competingExplanations should include expl-ra-tnf-centric, expl-ra-multi-cytokine, expl-ra-ada-immunogenicity, expl-ra-acpa-subgroup with claim IDs attached.",
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
      howToJudge: "Every expertShortlist item must have autoApproved=false; Gate C pending rows included.",
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
      criterion: "Exports clearly label scopeLocked=true with partnerSigned=false / lockedPilot=false (no fake MoU)",
      howToJudge: "MANIFEST + pack + Discovery Centre meta must show status=scope_locked, scopeLocked=true, partnerSigned=false.",
      status: "ready_for_human",
      relatedClaimIds: [],
    },
    {
      id: "x-2",
      output: "cross_cutting",
      criterion: "Named partner confirms disease + question wording (flip partnerSigned)",
      howToJudge: "Blocked until outreach produces a confirmed row in ISI_PILOT_PARTNER_SHORTLIST.md and partnerSigned flips.",
      status: "blocked_on_partner",
      relatedClaimIds: [],
    },
    {
      id: "x-3",
      output: "cross_cutting",
      criterion: "Agree numeric success thresholds (time saved, useful evidence, next decision, rejections)",
      howToJudge: "Fill successMetrics thresholds with partner before formal user testing.",
      status: "blocked_on_partner",
      relatedClaimIds: [],
    },
    {
      id: "x-4",
      output: "cross_cutting",
      criterion: "Source licensing / attribution for the agreed literature set",
      howToJudge: "Scope-locked PMIDs are public PubMed locators; partner may require additional licensed corpora.",
      status: "blocked_on_partner",
      relatedClaimIds: pathwayClaims,
    },
  ];
}

export function buildPilotReviewRubric(opts?: {
  generatedAt?: string;
  lock?: HsiPartnerLock;
  pack?: PilotEvidencePack;
}): PilotReviewRubric {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const lock = opts?.lock ?? getPartnerLock();
  const pack =
    opts?.pack ??
    buildPilotEvidencePack({
      generatedAt,
      evidenceSnapshotRef: "dist/outputs/latest/hsi-isi-export.json",
    });
  const checklist = buildChecklist(lock, pack);
  const readyForHuman = checklist.filter((c) => c.status === "ready_for_human").length;
  const blockedOnPartner = checklist.filter((c) => c.status === "blocked_on_partner").length;

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
    successMetrics: [
      {
        id: "m-time",
        metric: "Time saved",
        recordWhat: "Hours / days vs current lit + synthesis path for this question",
        thresholdWithPartner: "TBD — agree before user testing",
      },
      {
        id: "m-useful",
        metric: "Useful evidence",
        recordWhat: "Sources / mechanisms / biomarkers the partner keeps",
        thresholdWithPartner: "TBD — agree before user testing",
      },
      {
        id: "m-next",
        metric: "Better next decision",
        recordWhat: "Clearer next experiment, study design, or kill/continue call",
        thresholdWithPartner: "TBD — agree before user testing",
      },
      {
        id: "m-reject",
        metric: "Expert rejections",
        recordWhat: "What they reject — as carefully as what they accept",
        thresholdWithPartner: "TBD — agree before user testing",
      },
    ],
    flipToLockedPilot: [...lock.flipRequirements],
    summary: {
      readyForHuman,
      blockedOnPartner,
      packEvidenceRows: pack.summary.evidenceMapRows,
      packClaimsWithLoinc: pack.summary.claimsWithLoinc,
    },
    nextActions: [
      "Human-review checklist items marked ready_for_human against hsi-pilot-evidence-pack.md.",
      "Keep partnerSigned=false / lockedPilot=false until a named partner confirms disease + question.",
      "Agree success-metric thresholds before formal pilot user testing.",
      "Phase 5 complete = hsi-pilot-acceptance.* + hsi-pilot-walkthrough.md (partner-ready Stage 1 pack; partnerSigned still pending).",
      "Phase 8 (clinical R3–R5 / Akeno) needs an explicit user ask + Stage 3 gates.",
      "Do not treat scopeLocked as a signed commercial partner / MoU.",
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

  lines.push("", "## Success metrics (thresholds TBD with partner)", "");
  for (const m of rubric.successMetrics) {
    lines.push(`- **${m.metric}** — ${m.recordWhat} · threshold: ${m.thresholdWithPartner}`);
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
    `- pack evidence rows: ${rubric.summary.packEvidenceRows}`,
    `- claims with LOINC: ${rubric.summary.packClaimsWithLoinc}`,
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
