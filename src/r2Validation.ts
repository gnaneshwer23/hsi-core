/**
 * Phase 7 — R2 validation depth for the scope-locked RA / anti-TNF question.
 *
 * Research intelligence only: hypothesis cards, validation status, literature /
 * evidence-mapping tests, and ranked gaps with next-experiment prompts.
 * Grounded in existing competing explanations, seed edges, and PMIDs.
 * Not clinical protocols, not Akeno, not patient CDS, not trial matching.
 */
import { HSI_T2D_IMMUNO_SEED_EDGES } from "./seed/t2dImmunoMetabolic";
import { getPartnerLock, type HsiPartnerLock } from "./partnerLock";
import {
  buildPilotEvidencePack,
  type PilotEvidencePack,
  type PilotExplanationSlot,
  type PilotExpertItem,
} from "./pilotEvidencePack";
import { buildSchemaGapReport, type HsiSchemaGapReport } from "./gapReport";
import type { HsiGrade } from "./grades";
import type { HsiEdge } from "./schema";

export const R2_VALIDATION_SCHEMA = "hsi-r2-validation-1" as const;

export type R2ValidationStatus =
  | "untested"
  | "supported"
  | "refuted"
  | "gap";

export type R2LiteratureTestKind =
  | "literature_reconciliation"
  | "evidence_mapping"
  | "scope_decision"
  | "assay_axis_review"
  | "grade_hardening";

export type R2LiteratureTest = {
  id: string;
  kind: R2LiteratureTestKind;
  /** Research-level prompt — not a fabricated clinical protocol. */
  prompt: string;
  relatedClaimIds: string[];
  relatedPmids: string[];
  notClinicalProtocol: true;
};

export type R2HypothesisCard = {
  id: string;
  label: string;
  sourceExplanationId: string;
  validationStatus: R2ValidationStatus;
  statusRationale: string;
  relatedClaimIds: string[];
  relatedEdgeIds: string[];
  groundingPmids: string[];
  evidenceGrades: Partial<Record<HsiGrade, number>>;
  literatureTests: R2LiteratureTest[];
  autoApproved: false;
  notCds: true;
};

export type R2RankedGap = {
  id: string;
  rank: number;
  priority: "high" | "medium" | "low";
  title: string;
  why: string;
  nextExperimentPrompt: string;
  relatedClaimIds: string[];
  relatedPmids: string[];
  source: "expert_shortlist" | "competing_explanations" | "schema_gap" | "serology_tension";
  notClinicalProtocol: true;
};

export type R2ValidationBundle = {
  schemaVersion: typeof R2_VALIDATION_SCHEMA;
  phase: "7";
  targetRelease: "R2";
  notCds: true;
  noPatientLevelActions: true;
  autoApproveIntoKg: false;
  generatedAt: string;
  disease: string;
  researchQuestion: string;
  scopeLocked: boolean;
  partnerSigned: boolean;
  lockedPilot: boolean;
  framing: "ASK → MAP → REVIEW → VALIDATE";
  hypothesisCards: R2HypothesisCard[];
  rankedGaps: R2RankedGap[];
  summary: {
    hypothesisCards: number;
    byStatus: Record<R2ValidationStatus, number>;
    rankedGaps: number;
    literatureTests: number;
    groundingPmidCount: number;
  };
  linkedArtifacts: {
    pilotEvidencePackJson: string;
    gapReportJson: string;
    partnerLockJson: string;
    gateCChecklistJson: string;
  };
  boundary: string[];
  nextActions: string[];
};

function edgesForClaims(claimIds: string[]): HsiEdge[] {
  const set = new Set(claimIds);
  return HSI_T2D_IMMUNO_SEED_EDGES.filter((e) => set.has(e.claimId));
}

function gradeCounts(edges: HsiEdge[]): Partial<Record<HsiGrade, number>> {
  const out: Partial<Record<HsiGrade, number>> = {};
  for (const e of edges) {
    const g = e.hsiGrade;
    out[g] = (out[g] ?? 0) + 1;
  }
  return out;
}

function pmidsForEdges(edges: HsiEdge[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of edges) {
    const pmid = e.provenance?.pmid?.trim();
    if (pmid && !seen.has(pmid)) {
      seen.add(pmid);
      out.push(pmid);
    }
  }
  return out;
}

type CardSpec = {
  explanationId: string;
  cardId: string;
  validationStatus: R2ValidationStatus;
  statusRationale: string;
  literatureTests: Omit<R2LiteratureTest, "notClinicalProtocol">[];
};

/** Hand-authored status + research tests — claim/PMID sets still come from pack slots. */
const RA_CARD_SPECS: CardSpec[] = [
  {
    explanationId: "expl-ra-tnf-centric",
    cardId: "hyp-card-tnf-centric",
    validationStatus: "supported",
    statusRationale:
      "Seed pathway supports TNF as a contributory RA inflammatory axis and anti-TNF + MTX clinical benefit (RA-001/003/006/012). Response heterogeneity itself remains open — supported pathway ≠ uniform response prediction.",
    literatureTests: [
      {
        id: "lt-tnf-1",
        kind: "evidence_mapping",
        prompt:
          "Map which retained claims under the TNF-centric frame survive expert Gate C without overclaiming tissue specificity (esp. macrophage→TNF PMID 2993897 vs RA synovial histology).",
        relatedClaimIds: ["HSI-C-RA-001", "HSI-C-RA-006"],
        relatedPmids: ["11244034", "2993897"],
      },
      {
        id: "lt-tnf-2",
        kind: "grade_hardening",
        prompt:
          "Reconcile ATTRACT / Lipsky combo-therapy background (PMID 10622295 / 11087881) with the response-heterogeneity question — keep benefit evidence separate from subgroup predictors.",
        relatedClaimIds: ["HSI-C-RA-003", "HSI-C-RA-012"],
        relatedPmids: ["11087881", "10622295"],
      },
    ],
  },
  {
    explanationId: "expl-ra-multi-cytokine",
    cardId: "hyp-card-il6-axis",
    validationStatus: "supported",
    statusRationale:
      "IL-6 contributes to RA inflammatory tone (RA-004) and anti-TNF inadequate responders can still benefit from IL-6R blockade in trial populations (RA-005, PMID 18625622). Framing is supported as a competing axis; causal universality stays uncertain (teaching=hypothesized on RA-005).",
    literatureTests: [
      {
        id: "lt-il6-1",
        kind: "literature_reconciliation",
        prompt:
          "Re-check S-P-O for RA-005: related_axis (anti-TNF inadequate responders → IL-6R blockade) vs any stronger causal map — curator must reject silent promotion before Gate C.",
        relatedClaimIds: ["HSI-C-RA-004", "HSI-C-RA-005"],
        relatedPmids: ["18625622"],
      },
      {
        id: "lt-il6-2",
        kind: "evidence_mapping",
        prompt:
          "List what additional public literature would be required to harden (or refute) IL-6-axis enrichment among inadequate anti-TNF responders — research mapping only, not a protocol to enrol patients.",
        relatedClaimIds: ["HSI-C-RA-005"],
        relatedPmids: ["18625622"],
      },
    ],
  },
  {
    explanationId: "expl-ra-ada-immunogenicity",
    cardId: "hyp-card-ada",
    validationStatus: "supported",
    statusRationale:
      "Infliximab ADA / trough literature anchors secondary non-response via immunogenicity (RA-007/008; PMID 16508927 / 17133559). Supported as a competing frame — agent generalisation and partner monitoring scope remain open (gap adjacent).",
    literatureTests: [
      {
        id: "lt-ada-1",
        kind: "assay_axis_review",
        prompt:
          "Annotate which ADA / trough claims are infliximab-weighted and must not be over-generalised to all anti-TNF agents at Gate C (seeds already flag this).",
        relatedClaimIds: ["HSI-C-RA-007", "HSI-C-RA-008"],
        relatedPmids: ["16508927", "17133559"],
      },
      {
        id: "lt-ada-2",
        kind: "scope_decision",
        prompt:
          "With the future named partner: decide whether ADA / trough monitoring is in-scope for the Stage 1 question or deferred — literature anchors only until then.",
        relatedClaimIds: ["HSI-C-RA-007", "HSI-C-RA-008"],
        relatedPmids: ["16508927", "17133559"],
      },
    ],
  },
  {
    explanationId: "expl-ra-acpa-subgroup",
    cardId: "hyp-card-serology",
    validationStatus: "gap",
    statusRationale:
      "Contested serology frame: Potter cohort association (RA-009, PMID 18375541) vs Lv meta-analysis no reliable RF/ACPA response prediction (RA-010, PMID 24586782). Workup biomarker role (RA-002/011) is separate. Status=gap until expert decides inclusion-axis vs background context — not a silent predictor.",
    literatureTests: [
      {
        id: "lt-sero-1",
        kind: "literature_reconciliation",
        prompt:
          "Keep RA-009 vs RA-010 disagreement visible in any brief: document what each PMID does and does not support for anti-TNF response prediction.",
        relatedClaimIds: ["HSI-C-RA-009", "HSI-C-RA-010"],
        relatedPmids: ["18375541", "24586782"],
      },
      {
        id: "lt-sero-2",
        kind: "scope_decision",
        prompt:
          "Clarify with partner whether RF/ACPA status is an inclusion axis for the research question or only background serology (LOINC 53031-9 / 11572-5) — do not invent predictive CDS rules.",
        relatedClaimIds: ["HSI-C-RA-002", "HSI-C-RA-009", "HSI-C-RA-010", "HSI-C-RA-011"],
        relatedPmids: ["10662881", "18375541", "24586782", "20699241"],
      },
    ],
  },
];

/** Explicit predictive claim under serology — meta-analysis leans refuted for reliable prediction. */
const PREDICTIVE_SEROLOGY_CARD = {
  id: "hyp-card-serology-predictor",
  label:
    "RF/ACPA status as a reliable predictor of clinical response to anti-TNF (strong predictive claim)",
  sourceExplanationId: "expl-ra-acpa-subgroup",
  validationStatus: "refuted" as const,
  statusRationale:
    "Lv et al. meta-analysis (PMID 24586782 / RA-010) does not support RF or anti-CCP as a reliable anti-TNF response predictor. Potter cohort association (RA-009) remains visible as contested observational signal — not sufficient to keep the strong predictive claim as supported.",
  relatedClaimIds: ["HSI-C-RA-009", "HSI-C-RA-010"],
  claimIds: ["HSI-C-RA-009", "HSI-C-RA-010"],
  literatureTests: [
    {
      id: "lt-pred-1",
      kind: "literature_reconciliation" as const,
      prompt:
        "Treat 'reliable predictor' language as refuted for Stage 1 synthesis unless new partner-licensed evidence overturns PMID 24586782 — retain RA-009 as contested association only.",
      relatedClaimIds: ["HSI-C-RA-009", "HSI-C-RA-010"],
      relatedPmids: ["18375541", "24586782"],
      notClinicalProtocol: true as const,
    },
  ],
};

function buildHypothesisCards(
  explanations: PilotExplanationSlot[],
): R2HypothesisCard[] {
  const byId = new Map(explanations.map((e) => [e.id, e]));
  const cards: R2HypothesisCard[] = [];

  for (const spec of RA_CARD_SPECS) {
    const slot = byId.get(spec.explanationId);
    if (!slot) continue;
    const edges = edgesForClaims(slot.relatedClaimIds);
    cards.push({
      id: spec.cardId,
      label: slot.label,
      sourceExplanationId: slot.id,
      validationStatus: spec.validationStatus,
      statusRationale: spec.statusRationale,
      relatedClaimIds: [...slot.relatedClaimIds],
      relatedEdgeIds: edges.map((e) => e.id),
      groundingPmids: pmidsForEdges(edges),
      evidenceGrades: gradeCounts(edges),
      literatureTests: spec.literatureTests.map((t) => ({
        ...t,
        notClinicalProtocol: true as const,
      })),
      autoApproved: false,
      notCds: true,
    });
  }

  const predEdges = edgesForClaims(PREDICTIVE_SEROLOGY_CARD.claimIds);
  cards.push({
    id: PREDICTIVE_SEROLOGY_CARD.id,
    label: PREDICTIVE_SEROLOGY_CARD.label,
    sourceExplanationId: PREDICTIVE_SEROLOGY_CARD.sourceExplanationId,
    validationStatus: PREDICTIVE_SEROLOGY_CARD.validationStatus,
    statusRationale: PREDICTIVE_SEROLOGY_CARD.statusRationale,
    relatedClaimIds: [...PREDICTIVE_SEROLOGY_CARD.relatedClaimIds],
    relatedEdgeIds: predEdges.map((e) => e.id),
    groundingPmids: pmidsForEdges(predEdges),
    evidenceGrades: gradeCounts(predEdges),
    literatureTests: PREDICTIVE_SEROLOGY_CARD.literatureTests,
    autoApproved: false,
    notCds: true,
  });

  return cards;
}

function buildRankedGaps(opts: {
  expertShortlist: PilotExpertItem[];
  gap: HsiSchemaGapReport;
  lock: HsiPartnerLock;
}): R2RankedGap[] {
  const pathwayClaims = new Set(opts.lock.seedPathway?.primaryClaimIds ?? []);
  const gaps: Omit<R2RankedGap, "rank">[] = [];

  gaps.push({
    id: "rgap-serology-tension",
    priority: "high",
    title: "RF/ACPA response-prediction disagreement remains unresolved",
    why: "RA-009 (association) vs RA-010 (meta-analysis no reliable prediction) must stay visible; predictive claim is treated as refuted for synthesis.",
    nextExperimentPrompt:
      "Produce a one-page literature reconciliation note citing PMID 18375541 and 24586782 only — flag what would overturn the 'not a reliable predictor' stance without inventing new PMIDs.",
    relatedClaimIds: ["HSI-C-RA-009", "HSI-C-RA-010"],
    relatedPmids: ["18375541", "24586782"],
    source: "serology_tension",
    notClinicalProtocol: true,
  });

  gaps.push({
    id: "rgap-il6-enrichment",
    priority: "high",
    title: "IL-6-axis enrichment among anti-TNF inadequate responders needs sharper mapping",
    why: "Working hypothesis hyp-ra-response-het + RA-005 remain hypothesized/uncertain; competing TNF-only narratives must not be collapsed.",
    nextExperimentPrompt:
      "Evidence-map public literature that strengthens or weakens IL-6 enrichment among inadequate anti-TNF responders, anchored to PMID 18625622 claim IDs — research brief, not a patient enrolment protocol.",
    relatedClaimIds: ["HSI-C-RA-003", "HSI-C-RA-004", "HSI-C-RA-005"],
    relatedPmids: ["18625622", "11087881"],
    source: "competing_explanations",
    notClinicalProtocol: true,
  });

  gaps.push({
    id: "rgap-ada-scope",
    priority: "medium",
    title: "ADA / trough monitoring scope vs Stage 1 question still undecided",
    why: "RA-007/008 are literature anchors; partner must decide in-scope vs deferred before synthesis treats ADA as required for the locked question.",
    nextExperimentPrompt:
      "Draft a scope-decision checklist for ADA/trough (infliximab-weighted PMIDs 16508927 / 17133559) — include / defer / out-of-scope — for named-partner confirmation.",
    relatedClaimIds: ["HSI-C-RA-007", "HSI-C-RA-008"],
    relatedPmids: ["16508927", "17133559"],
    source: "expert_shortlist",
    notClinicalProtocol: true,
  });

  const hypItems = opts.expertShortlist.filter((i) => i.kind === "hypothesis" || i.kind === "gap");
  for (const item of hypItems.slice(0, 3)) {
    if (gaps.some((g) => g.title.includes(item.id) || g.id.includes(item.id))) continue;
    gaps.push({
      id: `rgap-shortlist-${item.id}`,
      priority: "medium",
      title: item.text.slice(0, 120) + (item.text.length > 120 ? "…" : ""),
      why: `From pack expert shortlist \`${item.id}\` (autoApproved=false).`,
      nextExperimentPrompt: `Expert challenge for ${item.id}: reject, refine, or attach additional claim IDs — never auto-approve into KG.`,
      relatedClaimIds: [...item.relatedClaimIds],
      relatedPmids: pmidsForEdges(edgesForClaims(item.relatedClaimIds)),
      source: "expert_shortlist",
      notClinicalProtocol: true,
    });
  }

  const raSchemaGaps = opts.gap.gaps.filter(
    (g) =>
      pathwayClaims.has(g.claimId) ||
      g.claimId.includes("-RA-") ||
      (g.domain === "autoimmunity" && /tnf|rheumatoid|acpa|ada|il-?6/i.test(g.assertion)),
  );
  for (const g of raSchemaGaps.slice(0, 4)) {
    gaps.push({
      id: `rgap-schema-${g.claimId}`,
      priority: "low",
      title: `Schema / mapping gap on ${g.claimId}`,
      why: `Missing: ${g.missing.join(", ") || "unspecified"} · grade=${g.hsiGrade}`,
      nextExperimentPrompt: `Fill mapping gap for ${g.claimId} (${g.assertion.slice(0, 100)}) without inventing REL ids or PMIDs.`,
      relatedClaimIds: [g.claimId],
      relatedPmids: pmidsForEdges(edgesForClaims([g.claimId])),
      source: "schema_gap",
      notClinicalProtocol: true,
    });
  }

  const priorityWeight = { high: 0, medium: 1, low: 2 } as const;
  gaps.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);

  return gaps.map((g, i) => ({ ...g, rank: i + 1 }));
}

export function buildR2ValidationBundle(opts?: {
  generatedAt?: string;
  lock?: HsiPartnerLock;
  pack?: PilotEvidencePack;
  gap?: HsiSchemaGapReport;
}): R2ValidationBundle {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const lock = opts?.lock ?? getPartnerLock();
  const pack =
    opts?.pack ??
    buildPilotEvidencePack({
      generatedAt,
      evidenceSnapshotRef: "dist/outputs/latest/hsi-isi-export.json",
      lock,
    });
  const gap = opts?.gap ?? buildSchemaGapReport({ generatedAt });

  const raExplanations = pack.competingExplanations.filter(
    (e) => e.id.startsWith("expl-ra-") && !e.id.includes("sle"),
  );
  const hypothesisCards = buildHypothesisCards(raExplanations);
  const rankedGaps = buildRankedGaps({
    expertShortlist: pack.expertShortlist,
    gap,
    lock,
  });

  const byStatus: Record<R2ValidationStatus, number> = {
    untested: 0,
    supported: 0,
    refuted: 0,
    gap: 0,
  };
  for (const c of hypothesisCards) {
    byStatus[c.validationStatus] += 1;
  }

  const pmidSet = new Set<string>();
  for (const c of hypothesisCards) {
    for (const p of c.groundingPmids) pmidSet.add(p);
  }

  const literatureTests = hypothesisCards.reduce(
    (n, c) => n + c.literatureTests.length,
    0,
  );

  return {
    schemaVersion: R2_VALIDATION_SCHEMA,
    phase: "7",
    targetRelease: "R2",
    notCds: true,
    noPatientLevelActions: true,
    autoApproveIntoKg: false,
    generatedAt,
    disease: lock.disease?.label ?? pack.disease,
    researchQuestion: lock.researchQuestion ?? pack.researchQuestion,
    scopeLocked: lock.scopeLocked,
    partnerSigned: lock.partnerSigned,
    lockedPilot: lock.lockedPilot,
    framing: "ASK → MAP → REVIEW → VALIDATE",
    hypothesisCards,
    rankedGaps,
    summary: {
      hypothesisCards: hypothesisCards.length,
      byStatus,
      rankedGaps: rankedGaps.length,
      literatureTests,
      groundingPmidCount: pmidSet.size,
    },
    linkedArtifacts: {
      pilotEvidencePackJson: "hsi-pilot-evidence-pack.json",
      gapReportJson: "hsi-gap-report.json",
      partnerLockJson: "hsi-partner-lock.json",
      gateCChecklistJson: "gate-c-checklist.json",
    },
    boundary: [
      "Research intelligence only — not diagnostic / not for clinical use",
      "Literature tests and next-experiment prompts are evidence-mapping / reconciliation tasks — not fabricated clinical protocols",
      "No patient CDS, eligibility automation, trial matching, or Akeno workflows",
      "autoApproveIntoKg=false — hypothesis cards never enter product KG without human Gate C",
      "Phase 8 HSI translation substrate ships separately (hsi-translation-handoff.*) — clinicalActive=false; Akeno product still external",
    ],
    nextActions: [
      "Review hypothesis cards on site `/discovery` VALIDATE tab against competing explanations.",
      "Run high-priority ranked-gap literature reconciliations before collapsing frames.",
      "Keep partnerSigned=false until flipRequirements are met.",
      "Review Phase 8 TRANSLATE tab candidates as HITL-only scaffolding — not live CDS.",
    ],
  };
}

export function serializeR2Validation(
  bundle: R2ValidationBundle = buildR2ValidationBundle(),
): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function serializeR2ValidationMarkdown(
  bundle: R2ValidationBundle = buildR2ValidationBundle(),
): string {
  const lines: string[] = [
    "# HSI R2 validation (Phase 7)",
    "",
    `Schema: \`${bundle.schemaVersion}\` · generated ${bundle.generatedAt}`,
    "",
    "> Not CDS. Research-level hypothesis / gap validation only. Literature tests are not clinical protocols. Phase 8 clinical / Akeno = explicit ask + Stage 3 gates.",
    "",
    "## Scope",
    "",
    `| Field | Value |`,
    `|-------|-------|`,
    `| disease | ${bundle.disease} |`,
    `| researchQuestion | ${bundle.researchQuestion} |`,
    `| scopeLocked | \`${bundle.scopeLocked}\` |`,
    `| partnerSigned | \`${bundle.partnerSigned}\` |`,
    `| lockedPilot | \`${bundle.lockedPilot}\` |`,
    `| framing | ${bundle.framing} |`,
    "",
    "## Summary",
    "",
    `- Hypothesis cards: ${bundle.summary.hypothesisCards}`,
    `- Status counts: supported=${bundle.summary.byStatus.supported}, gap=${bundle.summary.byStatus.gap}, refuted=${bundle.summary.byStatus.refuted}, untested=${bundle.summary.byStatus.untested}`,
    `- Ranked gaps: ${bundle.summary.rankedGaps}`,
    `- Literature tests: ${bundle.summary.literatureTests}`,
    `- Grounding PMIDs: ${bundle.summary.groundingPmidCount}`,
    "",
    "## Hypothesis cards",
    "",
  ];

  for (const c of bundle.hypothesisCards) {
    lines.push(
      `### \`${c.id}\` — ${c.label}`,
      "",
      `- **status:** \`${c.validationStatus}\``,
      `- **source:** \`${c.sourceExplanationId}\``,
      `- **rationale:** ${c.statusRationale}`,
      `- **claims:** ${c.relatedClaimIds.map((id) => `\`${id}\``).join(", ")}`,
      `- **PMIDs:** ${c.groundingPmids.join(", ") || "—"}`,
      `- **autoApproved:** \`${c.autoApproved}\``,
      "",
      "Literature / evidence tests:",
      "",
    );
    for (const t of c.literatureTests) {
      lines.push(`- **${t.kind}** (\`${t.id}\`): ${t.prompt}`);
    }
    lines.push("");
  }

  lines.push("## Ranked gaps", "");
  for (const g of bundle.rankedGaps) {
    lines.push(
      `### #${g.rank} · ${g.priority} · \`${g.id}\``,
      "",
      `**${g.title}**`,
      "",
      `- why: ${g.why}`,
      `- next experiment: ${g.nextExperimentPrompt}`,
      `- claims: ${g.relatedClaimIds.map((id) => `\`${id}\``).join(", ") || "—"}`,
      `- PMIDs: ${g.relatedPmids.join(", ") || "—"}`,
      "",
    );
  }

  lines.push("## Boundary", "");
  for (const b of bundle.boundary) {
    lines.push(`- ${b}`);
  }
  lines.push("", "## Next actions", "");
  for (const a of bundle.nextActions) {
    lines.push(`- ${a}`);
  }
  lines.push("");
  return lines.join("\n");
}
