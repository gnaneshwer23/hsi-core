/**
 * P1.6 — Curator UX scaffolding inside hsi-core.
 *
 * Richer gap analysis + Gate C pending/decision markdown from existing packs.
 * Compatible with immunecity Gate C queue decision shape (`090d7ea`).
 *
 * Honesty:
 * - Does NOT invent completed Apolo review outcomes
 * - Does NOT flip hsiGrade / auto-approve
 * - When no human decisions are supplied → "awaiting partner review session"
 * - Gate C approve/reject/defer stays human-only on ISI autumn-snow
 */
import {
  buildSchemaGapReport,
  type HsiMappingGap,
  type HsiSchemaGapReport,
} from "./gapReport";
import {
  buildGateCChecklist,
  type GateCChecklistBundle,
  type GateCChecklistRow,
} from "./gateCChecklist";
import { getPartnerLock } from "./partnerLock";

export const CURATOR_UX_SCHEMA = "hsi-curator-ux-1" as const;

/** Matches immunecity `GATE_C_DECISIONS` / autumn-snow `hsi_gate_c_decisions`. */
export const CURATOR_GATE_C_DECISIONS = ["approve", "reject", "defer"] as const;
export type CuratorGateCDecisionKind = (typeof CURATOR_GATE_C_DECISIONS)[number];

export const CURATOR_GATE_C_STATUSES = [
  "pending",
  "in_review",
  "human_approved",
  "human_rejected",
  "deferred",
] as const;
export type CuratorGateCStatus = (typeof CURATOR_GATE_C_STATUSES)[number];

/**
 * Human Gate C decision row — shape-compatible with immunecity
 * `GateCStoredDecision` / `hsi_gate_c_decisions` (ISI autumn-snow only).
 */
export type CuratorGateCDecision = {
  edgeId: string;
  status: CuratorGateCStatus;
  decision: CuratorGateCDecisionKind | null;
  reviewerNote: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  isiRelationshipId: string | null;
  pmid: string | null;
  autoApprove: false;
  hsiGradeFlipped: false;
};

export type CuratorQueueItem = {
  claimId: string;
  edgeId: string;
  isiRelationshipId: string | null;
  matchKind: string | null;
  mappingStatus: string | null;
  publishStatus: string;
  effectiveStatus: CuratorGateCStatus;
  decision: CuratorGateCDecisionKind | null;
  pmid: string | null;
  doi: string | null;
  spoNote: string | null;
  assertion: string | null;
  rationale: string | null;
  reviewerNote: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  actionable: boolean;
  autoApprove: false;
  mayFlipHsiGrade: false;
  notCds: true;
};

export type CuratorGapBucket = {
  missingKey: HsiMappingGap["missing"][number];
  count: number;
  edgeIds: string[];
};

export type CuratorUxBundle = {
  schemaVersion: typeof CURATOR_UX_SCHEMA;
  notCds: true;
  autoApproveIntoKg: false;
  mayFlipHsiGrade: false;
  generatedAt: string;
  partner: {
    id: string | null;
    label: string | null;
    lockedPilot: boolean;
    partnerSigned: boolean;
  };
  partnerReviewSession: {
    status:
      | "awaiting_partner_review_session"
      | "hypothetical_fixture_imported"
      | "decisions_imported";
    note: string;
    humanDecisionCount: number;
    inventedOutcomes: false;
    /** Loud when decisions came from P1.7 hypothetical schema fixture / dry-run. */
    isHypothetical: boolean;
    notProductionApproved: true;
    productionApproved: false;
    isiNeonTarget: "autumn-snow";
    hsiNeonTarget: "red-wave";
  };
  gapAnalysis: {
    schemaVersion: HsiSchemaGapReport["schemaVersion"];
    summary: HsiSchemaGapReport["summary"];
    gapRowCount: number;
    buckets: CuratorGapBucket[];
    bridgeShortlist: HsiSchemaGapReport["bridgeShortlist"];
    gaps: HsiMappingGap[];
  };
  gateCQueue: {
    items: CuratorQueueItem[];
    pendingCount: number;
    decidedCount: number;
    actionableCount: number;
    unmappedCount: number;
    translationCandidates: number;
    modelProposals: number;
    neonTarget: "autumn-snow";
  };
  honesty: string[];
  nextActions: string[];
};

function decisionToStatus(decision: CuratorGateCDecisionKind): CuratorGateCStatus {
  if (decision === "approve") return "human_approved";
  if (decision === "reject") return "human_rejected";
  return "deferred";
}

function statusToDecision(status: CuratorGateCStatus): CuratorGateCDecisionKind | null {
  if (status === "human_approved") return "approve";
  if (status === "human_rejected") return "reject";
  if (status === "deferred") return "defer";
  return null;
}

/** Refuse any decision that claims auto-approve or grade flip. */
export function assertSafeCuratorDecision(
  d: CuratorGateCDecision,
): CuratorGateCDecision {
  if (d.autoApprove !== false) {
    throw new Error("Curator UX refuses autoApprove=true Gate C decisions.");
  }
  if (d.hsiGradeFlipped !== false) {
    throw new Error("Curator UX refuses hsiGradeFlipped=true decisions.");
  }
  return d;
}

/** Publish rows that are Gate C pending with a mapped REL (immunecity-compatible). */
export function listCuratorPublishPendingRows(
  rows: readonly GateCChecklistRow[],
): GateCChecklistRow[] {
  return rows.filter((r) => {
    if (r.autoApprove) return false;
    if (r.gateCStatus === "unmapped") return false;
    if (r.gateCStatus !== "pending" && r.gateCStatus !== "not_started") return false;
    return Boolean(r.isiRelationshipId);
  });
}

/**
 * Merge published checklist with optional human decisions.
 * Empty decisions → all actionable pending (awaiting partner session).
 */
export function buildCuratorGateCQueue(
  checklist: GateCChecklistBundle,
  decisions: readonly CuratorGateCDecision[] = [],
): CuratorUxBundle["gateCQueue"] {
  for (const d of decisions) assertSafeCuratorDecision(d);
  const rows = listCuratorPublishPendingRows(checklist.rows);
  const byEdge = new Map(decisions.map((d) => [d.edgeId, d]));
  const items: CuratorQueueItem[] = rows.map((r) => {
    const stored = byEdge.get(r.edgeId);
    const effectiveStatus: CuratorGateCStatus = stored?.status ?? "pending";
    const decision = stored?.decision ?? statusToDecision(effectiveStatus);
    const actionable =
      effectiveStatus === "pending" || effectiveStatus === "in_review";
    return {
      claimId: r.claimId,
      edgeId: r.edgeId,
      isiRelationshipId: r.isiRelationshipId,
      matchKind: r.matchKind ?? null,
      mappingStatus: r.mappingStatus ?? null,
      publishStatus: r.gateCStatus,
      effectiveStatus,
      decision,
      pmid: r.pmid,
      doi: r.doi,
      spoNote: r.spoNote ?? null,
      assertion: r.assertion ?? null,
      rationale: r.rationale ?? null,
      reviewerNote: stored?.reviewerNote ?? null,
      reviewedBy: stored?.reviewedBy ?? null,
      reviewedAt: stored?.reviewedAt ?? null,
      actionable,
      autoApprove: false,
      mayFlipHsiGrade: false,
      notCds: true,
    };
  });

  items.sort((a, b) => {
    if (a.actionable !== b.actionable) return a.actionable ? -1 : 1;
    return a.edgeId.localeCompare(b.edgeId);
  });

  return {
    items,
    pendingCount: items.filter((i) => i.actionable).length,
    decidedCount: items.filter((i) => !i.actionable).length,
    actionableCount: items.filter((i) => i.actionable).length,
    unmappedCount: checklist.summary.unmapped,
    translationCandidates: checklist.summary.translationCandidates,
    modelProposals: checklist.summary.modelProposals,
    neonTarget: "autumn-snow",
  };
}

function bucketGaps(gaps: readonly HsiMappingGap[]): CuratorGapBucket[] {
  const keys: HsiMappingGap["missing"][number][] = [
    "isi_relationship_id",
    "aksh_node_id",
    "durable_locator",
    "loinc_marker",
    "gate_c_approved",
  ];
  return keys.map((missingKey) => {
    const matched = gaps.filter((g) => g.missing.includes(missingKey));
    return {
      missingKey,
      count: matched.length,
      edgeIds: matched.map((g) => g.edgeId).slice(0, 24),
    };
  });
}

export function buildCuratorUxBundle(opts?: {
  generatedAt?: string;
  gap?: HsiSchemaGapReport;
  gateC?: GateCChecklistBundle;
  /** Optional human decisions from ISI autumn-snow — never invent. */
  decisions?: readonly CuratorGateCDecision[];
  /**
   * P1.7 — when true, decisions are schema/dry-run fixtures only.
   * Status becomes `hypothetical_fixture_imported` (never production Apolo).
   */
  decisionsAreHypothetical?: boolean;
}): CuratorUxBundle {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const gap = opts?.gap ?? buildSchemaGapReport({ generatedAt });
  const gateC = opts?.gateC ?? buildGateCChecklist({ generatedAt });
  const decisions = opts?.decisions ?? [];
  for (const d of decisions) assertSafeCuratorDecision(d);

  const lock = getPartnerLock();
  const queue = buildCuratorGateCQueue(gateC, decisions);
  const humanDecisionCount = decisions.length;
  const awaiting = humanDecisionCount === 0;
  const isHypothetical = Boolean(opts?.decisionsAreHypothetical) && !awaiting;
  const sessionStatus = awaiting
    ? ("awaiting_partner_review_session" as const)
    : isHypothetical
      ? ("hypothetical_fixture_imported" as const)
      : ("decisions_imported" as const);

  return {
    schemaVersion: CURATOR_UX_SCHEMA,
    notCds: true,
    autoApproveIntoKg: false,
    mayFlipHsiGrade: false,
    generatedAt,
    partner: {
      id: lock.partner?.id ?? null,
      label: lock.partner?.label ?? null,
      lockedPilot: lock.lockedPilot,
      partnerSigned: lock.partnerSigned,
    },
    partnerReviewSession: {
      status: sessionStatus,
      note: awaiting
        ? "No human Gate C decisions supplied — awaiting partner review session. Do not invent approve/reject/defer outcomes."
        : isHypothetical
          ? `Imported ${humanDecisionCount} HYPOTHETICAL schema fixture decision(s) — NOT production-approved; NOT an Apolo Pharma Gate C session. Does not flip hsiGrade; autoApprove=false.`
          : `Imported ${humanDecisionCount} human decision(s) from ISI autumn-snow shape — does not flip hsiGrade; autoApprove=false.`,
      humanDecisionCount,
      inventedOutcomes: false,
      isHypothetical,
      notProductionApproved: true,
      productionApproved: false,
      isiNeonTarget: "autumn-snow",
      hsiNeonTarget: "red-wave",
    },
    gapAnalysis: {
      schemaVersion: gap.schemaVersion,
      summary: gap.summary,
      gapRowCount: gap.gaps.length,
      buckets: bucketGaps(gap.gaps),
      bridgeShortlist: gap.bridgeShortlist,
      gaps: gap.gaps,
    },
    gateCQueue: queue,
    honesty: [
      "Not CDS. autoApproveIntoKg=false. mayFlipHsiGrade=false.",
      "hsiGrade ≠ Gate C decision ≠ teachingStatus — never collapse axes.",
      "HSI Neon red-wave holds substrate + pending placeholders only; human approve/reject/defer writes stay on ISI autumn-snow (immunecity queue).",
      "Curator UX scaffolding does not invent completed Apolo review outcomes.",
      isHypothetical
        ? "P1.7 hypothetical fixture import — productionApproved=false; replace with live autumn-snow export after partner session."
        : "productionApproved=false until operator asserts a live autumn-snow partner export (HSI never self-certifies).",
      "Model proposals and translation candidates remain pending drafts only.",
      "Compatible with immunecity Gate C queue (`090d7ea`) decision shape.",
    ],
    nextActions: [
      awaiting
        ? "Run a real Apolo Pharma Gate C review session on immunecity `/hsi/discovery` REVIEW (approve/reject/defer) — then `bun run curator-ux --decisions <export>` (dry-run first with --dry-run)."
        : isHypothetical
          ? "Replace hypothetical fixture with a real autumn-snow decisions export before claiming partner Gate C complete."
          : "Re-check decided rows for S-P-O honesty before any product KG promote; never flip hsiGrade from checklist alone.",
      "Close high-leverage gap buckets (unmapped REL, missing LOINC, durable locator) without inventing maps.",
      "Keep Gate C human-only — refuse auto-approve and shared Neon.",
      "CDS stays closed until curationReview=approved AND hsiGrade=established.",
    ],
  };
}

/** Richer gap markdown for curators (also used as publish `hsi-gap-report.md`). */
export function serializeRichGapReportMarkdown(
  report: HsiSchemaGapReport = buildSchemaGapReport(),
): string {
  const s = report.summary;
  const buckets = bucketGaps(report.gaps);
  const lines: string[] = [
    "# HSI schema gap report (curator)",
    "",
    `Schema: \`${report.schemaVersion}\` · generated ${report.generatedAt}`,
    "",
    "**Not CDS.** Mapping / schema gaps only — never invent REL-* / aksh: ids / LOINC binds.",
    "",
    "## Summary",
    "",
    `- Seed edges: ${s.seedEdges}`,
    `- Bridge candidates: ${s.bridgeCandidates}`,
    `- Claims mapped to ISI REL: ${s.claimsMappedToIsi}`,
    `- Claims mapped to Aksh node: ${s.claimsMappedToAksh}`,
    `- Claims with durable locator: ${s.claimsWithDurableLocator}`,
    `- Gap rows: ${report.gaps.length}`,
    `- Grades: established=${s.gradeCounts.established}, uncertain=${s.gradeCounts.uncertain}, unexplored=${s.gradeCounts.unexplored}`,
    `- LOINC linked claims: ${s.loinc.claimsWithLoincMarker}`,
    `- Domains in use: ${s.domainsInUse.join(", ") || "—"}`,
    `- Edge types in use: ${s.edgeTypesInUse.length}`,
    "",
    "## Gap buckets (by missing slot)",
    "",
    "| Missing | Count | Sample edges |",
    "|---------|------:|--------------|",
  ];

  for (const b of buckets) {
    const sample =
      b.edgeIds.length === 0
        ? "—"
        : b.edgeIds
            .slice(0, 6)
            .map((id) => `\`${id}\``)
            .join(", ");
    lines.push(`| \`${b.missingKey}\` | ${b.count} | ${sample} |`);
  }

  lines.push(
    "",
    "## ISI REL mapping",
    "",
    `- Suggestions: ${report.isiRelMapping.suggestions}`,
    `- With REL id: ${report.isiRelMapping.withRelId}`,
    `- Unmapped: ${report.isiRelMapping.unmapped}`,
    `- Curated (HSI-side): ${report.isiRelMapping.curated}`,
    `- autoApproveIntoKg: ${report.isiRelMapping.autoApproveIntoKg}`,
    "",
    "## Aksh node mapping",
    "",
    `- T2D mapped: ${report.akshNodeMapping.t2dSeedsMapped}/${report.akshNodeMapping.t2dSeedsTotal}`,
    `- autoApplyToEhr: ${report.akshNodeMapping.autoApplyToEhr}`,
    `- anyCdsSurfacableOnSeedEdges: ${report.akshNodeMapping.anyCdsSurfacableOnSeedEdges}`,
    "",
    "## Bridge shortlist",
    "",
  );

  for (const b of report.bridgeShortlist) {
    lines.push(
      `- \`${b.edgeId}\` → ${b.suggestedIsiRelationshipId ?? "unmapped"} (${b.matchKind}): ${b.subjectLabel} → ${b.objectLabel}`,
    );
  }

  lines.push(
    "",
    "## Gap rows (curator backlog)",
    "",
    "| Edge | Domain | Grade | Missing | Assertion (short) |",
    "|------|--------|-------|---------|-------------------|",
  );

  for (const g of report.gaps.slice(0, 40)) {
    const short =
      g.assertion.length > 72 ? `${g.assertion.slice(0, 69)}…` : g.assertion;
    lines.push(
      `| \`${g.edgeId}\` | ${g.domain} | ${g.hsiGrade} | ${g.missing.join(", ")} | ${short} |`,
    );
  }
  if (report.gaps.length > 40) {
    lines.push("", `_… ${report.gaps.length - 40} more gap rows in JSON._`);
  }

  lines.push("", "## Next actions", "");
  for (const a of report.nextActions) {
    lines.push(`- ${a}`);
  }
  lines.push("");
  return lines.join("\n");
}

/** Richer Gate C markdown — pending + optional human decisions. */
export function serializeRichGateCChecklistMarkdown(
  checklist: GateCChecklistBundle = buildGateCChecklist(),
  decisions: readonly CuratorGateCDecision[] = [],
  opts?: { decisionsAreHypothetical?: boolean },
): string {
  const queue = buildCuratorGateCQueue(checklist, decisions);
  const awaiting = decisions.length === 0;
  const hypothetical = Boolean(opts?.decisionsAreHypothetical) && !awaiting;
  const unmapped = checklist.rows.filter((r) => r.gateCStatus === "unmapped");

  const lines: string[] = [
    "# Gate C human checklist (curator)",
    "",
    `Schema: \`${checklist.schemaVersion}\` · generated ${checklist.generatedAt}`,
    "",
    "**Not CDS. autoApproveIntoKg=false. mayFlipHsiGrade=false.**",
    "Neon approve+supports is human-only in ISI product Neon (**autumn-snow**) — never HSI red-wave.",
    "Compatible with immunecity Gate C queue (`090d7ea`).",
    "",
    awaiting
      ? "> **Awaiting partner review session** — no human approve/reject/defer decisions imported. Do not invent completed Apolo outcomes."
      : hypothetical
        ? `> **Hypothetical schema fixture** imported: **${decisions.length}** row(s) — NOT production-approved; NOT an Apolo session. Grades are **not** flipped.`
        : `> Human decisions imported: **${decisions.length}** (autumn-snow shape). Grades are **not** flipped by this checklist. productionApproved=false unless operator asserts live export.`,
    "",
    "## Summary",
    "",
    `- Curated/accepted with REL: ${checklist.summary.curatedWithRel}`,
    `- Gate C publish pending: ${checklist.summary.pendingGateC}`,
    `- Queue actionable (pending/in_review): ${queue.actionableCount}`,
    `- Queue decided (human): ${queue.decidedCount}`,
    `- Unmapped (no invented REL): ${checklist.summary.unmapped}`,
    `- Rows with PMID: ${checklist.summary.withPmid}`,
    `- Translation candidates: ${checklist.summary.translationCandidates}`,
    `- Model proposals: ${checklist.summary.modelProposals}`,
    "",
    "## Gate C queue (mapped REL)",
    "",
    "| Edge | ISI REL | PMID | S-P-O | Publish | Effective | Decision | Reviewer |",
    "|------|---------|------|-------|---------|-----------|----------|----------|",
  ];

  for (const r of queue.items) {
    const reviewer = r.reviewedBy
      ? `${r.reviewedBy}${r.reviewedAt ? ` @ ${r.reviewedAt}` : ""}`
      : awaiting
        ? "—"
        : "—";
    lines.push(
      `| \`${r.edgeId}\` | \`${r.isiRelationshipId ?? "—"}\` | ${r.pmid ?? "—"} | ${r.spoNote ?? "—"} | ${r.publishStatus} | **${r.effectiveStatus}** | ${r.decision ?? "—"} | ${reviewer} |`,
    );
  }

  lines.push(
    "",
    "## Honest unmapped gaps",
    "",
    "| Edge | Reason |",
    "|------|--------|",
  );
  for (const r of unmapped) {
    const short = r.rationale.length > 80 ? `${r.rationale.slice(0, 77)}…` : r.rationale;
    lines.push(`| \`${r.edgeId}\` | ${short} |`);
  }

  lines.push(
    "",
    "## Phase 8 translation candidates (HITL · not for clinical use)",
    "",
    `Candidates: ${checklist.summary.translationCandidates} · hitlRequired=${checklist.summary.translationHitlRequired} · cdsSurfacable=${checklist.summary.translationCdsSurfacable}`,
    "",
    "| Candidate | Clinic | LOINC | Grade | Teaching | Status | autoApprove |",
    "|-----------|--------|-------|-------|----------|--------|-------------|",
  );
  for (const t of checklist.translationCandidates) {
    lines.push(
      `| \`${t.candidateId}\` | ${t.clinicLabel ?? "—"} (\`${t.akshNodeId ?? "—"}\`) | ${t.loinc ?? "—"} | ${t.hsiGrade} | ${t.teachingStatus} | **${t.status}** | \`${t.autoApprove}\` |`,
    );
  }

  lines.push(
    "",
    "## Model proposals (pending · never auto-approve)",
    "",
    `Proposals: ${checklist.summary.modelProposals} · pending=${checklist.summary.modelProposalsPending} · autoApprove=${checklist.summary.modelProposalsAutoApprove}`,
    "",
    "| Proposal | S — P — O | Teaching (suggested) | Evidence hints | Status | autoApprove |",
    "|----------|-----------|----------------------|----------------|--------|-------------|",
  );
  for (const p of checklist.modelProposals) {
    const hints = p.evidenceHints.slice(0, 3).join("; ");
    lines.push(
      `| \`${p.proposalId}\` | ${p.proposedSubject} — ${p.proposedPredicate} — ${p.proposedObject} | ${p.suggestedTeachingStatus} | ${hints} | **${p.gateCStatus}** | \`${p.autoApprove}\` |`,
    );
  }

  lines.push("", "## Instructions", "");
  for (const i of checklist.instructions) {
    lines.push(`- ${i}`);
  }
  lines.push("");
  return lines.join("\n");
}

/** Combined curator briefing markdown. */
export function serializeCuratorUxMarkdown(
  bundle: CuratorUxBundle = buildCuratorUxBundle(),
): string {
  const g = bundle.gapAnalysis;
  const q = bundle.gateCQueue;
  const lines: string[] = [
    "# HSI curator UX briefing",
    "",
    `Schema: \`${bundle.schemaVersion}\` · generated ${bundle.generatedAt}`,
    "",
    `Partner: ${bundle.partner.label ?? "unnamed"} (\`${bundle.partner.id ?? "—"}\`) · lockedPilot=${bundle.partner.lockedPilot} · partnerSigned=${bundle.partner.partnerSigned}`,
    "",
    `**${bundle.partnerReviewSession.status}** — ${bundle.partnerReviewSession.note}`,
    "",
    "## Honesty",
    "",
  ];
  for (const h of bundle.honesty) lines.push(`- ${h}`);

  lines.push(
    "",
    "## Gap analysis snapshot",
    "",
    `- Gap rows: ${g.gapRowCount}`,
    `- Seed edges: ${g.summary.seedEdges}`,
    `- ISI mapped claims: ${g.summary.claimsMappedToIsi}`,
    `- Aksh mapped claims: ${g.summary.claimsMappedToAksh}`,
    `- LOINC linked: ${g.summary.loinc.claimsWithLoincMarker}`,
    "",
    "| Missing slot | Count |",
    "|--------------|------:|",
  );
  for (const b of g.buckets) {
    lines.push(`| \`${b.missingKey}\` | ${b.count} |`);
  }

  lines.push(
    "",
    "## Gate C queue snapshot",
    "",
    `- Actionable pending: ${q.actionableCount}`,
    `- Human decided: ${q.decidedCount}`,
    `- Unmapped: ${q.unmappedCount}`,
    `- Translation candidates: ${q.translationCandidates}`,
    `- Model proposals: ${q.modelProposals}`,
    `- Neon target for decisions: **${q.neonTarget}** (not red-wave)`,
    "",
    "### Actionable rows",
    "",
    "| Edge | REL | PMID | Status |",
    "|------|-----|------|--------|",
  );
  for (const item of q.items.filter((i) => i.actionable)) {
    lines.push(
      `| \`${item.edgeId}\` | \`${item.isiRelationshipId ?? "—"}\` | ${item.pmid ?? "—"} | **${item.effectiveStatus}** |`,
    );
  }

  const decided = q.items.filter((i) => !i.actionable);
  if (decided.length > 0) {
    lines.push(
      "",
      "### Decided rows (imported)",
      "",
      "| Edge | Decision | Status | Reviewer |",
      "|------|----------|--------|----------|",
    );
    for (const item of decided) {
      lines.push(
        `| \`${item.edgeId}\` | ${item.decision ?? "—"} | **${item.effectiveStatus}** | ${item.reviewedBy ?? "—"} |`,
      );
    }
  } else {
    lines.push(
      "",
      "_No decided rows — awaiting partner review session._",
    );
  }

  lines.push("", "## Next actions", "");
  for (const a of bundle.nextActions) lines.push(`- ${a}`);
  lines.push(
    "",
    "## Artifacts",
    "",
    "- `hsi-gap-report.md` / `.json` — richer gap buckets + backlog",
    "- `gate-c-checklist.md` / `.json` — queue + translation + model proposals",
    "- `hsi-curator-ux.md` / `.json` — this briefing",
    "- Site: `/curator` · Discovery REVIEW · immunecity `/hsi/discovery`",
    "",
  );
  return lines.join("\n");
}

export function serializeCuratorUx(
  bundle: CuratorUxBundle = buildCuratorUxBundle(),
): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

/** Parse optional decisions JSON (immunecity-compatible); refuse unsafe flags. */
export function parseCuratorGateCDecisions(raw: unknown): CuratorGateCDecision[] {
  if (!Array.isArray(raw)) {
    throw new Error("Gate C decisions must be a JSON array.");
  }
  const out: CuratorGateCDecision[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const edgeId = String(r.edgeId ?? r.edge_id ?? "").trim();
    if (!edgeId) continue;
    const statusRaw = String(r.status ?? "pending");
    const status = (CURATOR_GATE_C_STATUSES as readonly string[]).includes(statusRaw)
      ? (statusRaw as CuratorGateCStatus)
      : "pending";
    const decisionRaw = r.decision == null ? null : String(r.decision);
    const decision =
      decisionRaw &&
      (CURATOR_GATE_C_DECISIONS as readonly string[]).includes(decisionRaw)
        ? (decisionRaw as CuratorGateCDecisionKind)
        : statusToDecision(status);
    const d: CuratorGateCDecision = {
      edgeId,
      status,
      decision,
      reviewerNote:
        typeof r.reviewerNote === "string"
          ? r.reviewerNote
          : typeof r.reviewer_note === "string"
            ? r.reviewer_note
            : null,
      reviewedBy:
        typeof r.reviewedBy === "string"
          ? r.reviewedBy
          : typeof r.reviewed_by === "string"
            ? r.reviewed_by
            : null,
      reviewedAt:
        typeof r.reviewedAt === "string"
          ? r.reviewedAt
          : typeof r.reviewed_at === "string"
            ? r.reviewed_at
            : null,
      isiRelationshipId:
        typeof r.isiRelationshipId === "string"
          ? r.isiRelationshipId
          : typeof r.isi_relationship_id === "string"
            ? r.isi_relationship_id
            : null,
      pmid: typeof r.pmid === "string" ? r.pmid : null,
      autoApprove: false,
      hsiGradeFlipped: false,
    };
    if (r.autoApprove === true || r.auto_approve === true) {
      throw new Error(`Decision for ${edgeId} claims autoApprove — refused.`);
    }
    if (r.hsiGradeFlipped === true || r.hsi_grade_flipped === true) {
      throw new Error(`Decision for ${edgeId} claims hsiGradeFlipped — refused.`);
    }
    out.push(assertSafeCuratorDecision(d));
  }
  return out;
}

// Re-export helper for status mapping tests / consumers.
export { decisionToStatus as curatorDecisionToStatus };
