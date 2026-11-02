/**
 * P1.7 — Honest Gate C decisions import / dry-run tooling.
 *
 * Unblocks the partner Apolo review session workflow without inventing
 * production approvals. Compatible with immunecity autumn-snow
 * `hsi_gate_c_decisions` / `GateCStoredDecision` (`090d7ea`).
 *
 * Honesty:
 * - Empty / awaiting template never invents approve/reject/defer
 * - Hypothetical schema fixtures are loudly `isHypothetical` +
 *   `notProductionApproved` / `productionApproved=false`
 * - Dry-run validates only — does not rewrite publish packs as approved
 * - Never autoApprove / never flip hsiGrade
 * - Hypothetical imports never claim `decisions_imported` (real partner path)
 */
import {
  CURATOR_GATE_C_DECISIONS,
  CURATOR_GATE_C_STATUSES,
  assertSafeCuratorDecision,
  buildCuratorGateCQueue,
  parseCuratorGateCDecisions,
  type CuratorGateCDecision,
  type CuratorGateCDecisionKind,
  type CuratorGateCStatus,
} from "./curatorUx";
import { buildGateCChecklist } from "./gateCChecklist";

export const GATE_C_DECISIONS_IMPORT_SCHEMA =
  "hsi-gate-c-decisions-import-1" as const;

export type GateCDecisionsImportKind =
  | "awaiting_empty"
  | "hypothetical_schema_fixture"
  | "partner_export";

export type GateCDecisionsImportEnvelope = {
  schemaVersion: typeof GATE_C_DECISIONS_IMPORT_SCHEMA;
  kind: GateCDecisionsImportKind;
  /** Loud: schema / dry-run fixture — not a live Apolo session export. */
  isHypothetical: boolean;
  notProductionApproved: true;
  productionApproved: false;
  inventedApoloOutcomes: false;
  autoApprove: false;
  mayFlipHsiGrade: false;
  notCds: true;
  neonTarget: "autumn-snow";
  hsiNeonTarget: "red-wave";
  note: string;
  generatedAt: string;
  decisions: CuratorGateCDecision[];
};

export type GateCDecisionsDryRunReport = {
  schemaVersion: "hsi-gate-c-decisions-dry-run-1";
  ok: boolean;
  dryRun: true;
  wroteArtifacts: false;
  envelope: {
    kind: GateCDecisionsImportKind | "raw_array";
    isHypothetical: boolean;
    notProductionApproved: true;
    productionApproved: false;
    inventedApoloOutcomes: false;
  };
  decisionCount: number;
  byDecision: Record<CuratorGateCDecisionKind | "null", number>;
  byStatus: Partial<Record<CuratorGateCStatus, number>>;
  matchedPendingEdges: number;
  unmatchedEdgeIds: string[];
  refusedAutoApprove: false;
  refusedGradeFlip: false;
  partnerReviewSessionWouldBe:
    | "awaiting_partner_review_session"
    | "hypothetical_fixture_imported"
    | "decisions_imported";
  honesty: string[];
  nextActions: string[];
};

function emptyDecisionRow(edgeId: string): CuratorGateCDecision {
  return assertSafeCuratorDecision({
    edgeId,
    status: "pending",
    decision: null,
    reviewerNote: null,
    reviewedBy: null,
    reviewedAt: null,
    isiRelationshipId: null,
    pmid: null,
    autoApprove: false,
    hsiGradeFlipped: false,
  });
}

/**
 * Empty awaiting template — partner session not run yet.
 * Safe default for `--export-template`.
 */
export function buildAwaitingGateCDecisionsTemplate(opts?: {
  generatedAt?: string;
}): GateCDecisionsImportEnvelope {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  return {
    schemaVersion: GATE_C_DECISIONS_IMPORT_SCHEMA,
    kind: "awaiting_empty",
    isHypothetical: false,
    notProductionApproved: true,
    productionApproved: false,
    inventedApoloOutcomes: false,
    autoApprove: false,
    mayFlipHsiGrade: false,
    notCds: true,
    neonTarget: "autumn-snow",
    hsiNeonTarget: "red-wave",
    note:
      "Empty Gate C decisions template — awaiting live Apolo Pharma review on immunecity `/hsi/discovery` REVIEW. Replace `decisions` with autumn-snow export rows only after a real human session. Do not invent approve/reject/defer.",
    generatedAt,
    decisions: [],
  };
}

/**
 * Schema fixture for dry-run / CI — demonstrates approve/reject/defer shape
 * with loud hypothetical banners. reviewedBy is never an Apolo signature.
 * Import path must treat as `hypothetical_fixture_imported`, never production.
 */
export function buildHypotheticalGateCDecisionsFixture(opts?: {
  generatedAt?: string;
  /** Optional real pending edge ids to demonstrate merge; still hypothetical. */
  edgeIds?: readonly string[];
}): GateCDecisionsImportEnvelope {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const checklist = buildGateCChecklist({ generatedAt });
  const pending = checklist.rows
    .filter((r) => r.gateCStatus === "pending" && r.isiRelationshipId)
    .slice(0, 3);
  const ids =
    opts?.edgeIds && opts.edgeIds.length > 0
      ? [...opts.edgeIds].slice(0, 3)
      : pending.map((r) => r.edgeId);

  const [a, b, c] = [
    ids[0] ?? "HSI-E-FIXTURE-EXAMPLE-1",
    ids[1] ?? "HSI-E-FIXTURE-EXAMPLE-2",
    ids[2] ?? "HSI-E-FIXTURE-EXAMPLE-3",
  ];

  const rowMeta = (edgeId: string) => {
    const r = pending.find((p) => p.edgeId === edgeId);
    return {
      isiRelationshipId: r?.isiRelationshipId ?? null,
      pmid: r?.pmid ?? null,
    };
  };

  const decisions: CuratorGateCDecision[] = [
    assertSafeCuratorDecision({
      edgeId: a,
      status: "deferred",
      decision: "defer",
      reviewerNote:
        "HYPOTHETICAL SCHEMA FIXTURE — not a partner decision; dry-run only.",
      reviewedBy: "hypothetical-fixture-not-a-partner-signature",
      reviewedAt: generatedAt,
      ...rowMeta(a),
      autoApprove: false,
      hsiGradeFlipped: false,
    }),
    assertSafeCuratorDecision({
      edgeId: b,
      status: "human_rejected",
      decision: "reject",
      reviewerNote:
        "HYPOTHETICAL SCHEMA FIXTURE — demonstrates reject shape; NOT Apolo-approved.",
      reviewedBy: "hypothetical-fixture-not-a-partner-signature",
      reviewedAt: generatedAt,
      ...rowMeta(b),
      autoApprove: false,
      hsiGradeFlipped: false,
    }),
    // Approve shape is shown for schema completeness but remains hypothetical —
    // partnerReviewSession stays hypothetical_fixture_imported, never production.
    assertSafeCuratorDecision({
      edgeId: c,
      status: "human_approved",
      decision: "approve",
      reviewerNote:
        "HYPOTHETICAL SCHEMA FIXTURE — approve *shape* only; productionApproved=false; not a live Apolo Gate C outcome.",
      reviewedBy: "hypothetical-fixture-not-a-partner-signature",
      reviewedAt: generatedAt,
      ...rowMeta(c),
      autoApprove: false,
      hsiGradeFlipped: false,
    }),
  ];

  return {
    schemaVersion: GATE_C_DECISIONS_IMPORT_SCHEMA,
    kind: "hypothetical_schema_fixture",
    isHypothetical: true,
    notProductionApproved: true,
    productionApproved: false,
    inventedApoloOutcomes: false,
    autoApprove: false,
    mayFlipHsiGrade: false,
    notCds: true,
    neonTarget: "autumn-snow",
    hsiNeonTarget: "red-wave",
    note:
      "Hypothetical schema fixture for curator-ux --dry-run / CI. Demonstrates immunecity-compatible decision rows. NOT production-approved. NOT an Apolo Pharma Gate C session. Do not treat human_approved rows as partner-signed.",
    generatedAt,
    decisions,
  };
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

export type ParsedGateCDecisionsImport = {
  envelope: Omit<GateCDecisionsImportEnvelope, "decisions"> & {
    decisions: CuratorGateCDecision[];
  };
  decisions: CuratorGateCDecision[];
  rawArray: boolean;
};

/**
 * Parse decisions JSON — array (legacy) or P1.7 envelope.
 * Refuses autoApprove / hsiGradeFlipped. Hypothetical flag is sticky from envelope.
 */
export function parseGateCDecisionsImport(raw: unknown): ParsedGateCDecisionsImport {
  if (Array.isArray(raw)) {
    const decisions = parseCuratorGateCDecisions(raw);
    const generatedAt = new Date().toISOString();
    return {
      rawArray: true,
      decisions,
      envelope: {
        schemaVersion: GATE_C_DECISIONS_IMPORT_SCHEMA,
        kind: "partner_export",
        isHypothetical: false,
        notProductionApproved: true,
        productionApproved: false,
        inventedApoloOutcomes: false,
        autoApprove: false,
        mayFlipHsiGrade: false,
        notCds: true,
        neonTarget: "autumn-snow",
        hsiNeonTarget: "red-wave",
        note:
          "Raw decisions array (legacy). Treat as partner_export only when rows came from a live autumn-snow session — this parser cannot verify provenance.",
        generatedAt,
        decisions,
      },
    };
  }

  const doc = asRecord(raw);
  if (!doc) {
    throw new Error("Gate C decisions import must be a JSON array or envelope object.");
  }

  if (doc.autoApprove === true || doc.auto_approve === true) {
    throw new Error("Decisions envelope claims autoApprove — refused.");
  }
  if (doc.mayFlipHsiGrade === true || doc.may_flip_hsi_grade === true) {
    throw new Error("Decisions envelope claims mayFlipHsiGrade — refused.");
  }
  if (doc.productionApproved === true || doc.production_approved === true) {
    throw new Error(
      "Decisions envelope claims productionApproved=true — refused (HSI never self-certifies production Gate C).",
    );
  }
  if (doc.inventedApoloOutcomes === true || doc.invented_apolo_outcomes === true) {
    throw new Error("Decisions envelope claims inventedApoloOutcomes — refused.");
  }

  const list = Array.isArray(doc.decisions) ? doc.decisions : null;
  if (!list) {
    throw new Error("Decisions envelope requires a `decisions` array.");
  }
  const decisions = parseCuratorGateCDecisions(list);

  const kindRaw = String(doc.kind ?? "partner_export");
  const kind: GateCDecisionsImportKind =
    kindRaw === "awaiting_empty" ||
    kindRaw === "hypothetical_schema_fixture" ||
    kindRaw === "partner_export"
      ? kindRaw
      : "partner_export";

  const isHypothetical =
    doc.isHypothetical === true ||
    kind === "hypothetical_schema_fixture" ||
    decisions.some(
      (d) =>
        (d.reviewedBy ?? "").includes("hypothetical-fixture") ||
        (d.reviewerNote ?? "").toUpperCase().includes("HYPOTHETICAL SCHEMA FIXTURE"),
    );

  if (kind === "awaiting_empty" && decisions.length > 0) {
    throw new Error("awaiting_empty envelope must have decisions=[].");
  }

  const generatedAt =
    typeof doc.generatedAt === "string"
      ? doc.generatedAt
      : new Date().toISOString();

  const envelope: GateCDecisionsImportEnvelope = {
    schemaVersion: GATE_C_DECISIONS_IMPORT_SCHEMA,
    kind,
    isHypothetical,
    notProductionApproved: true,
    productionApproved: false,
    inventedApoloOutcomes: false,
    autoApprove: false,
    mayFlipHsiGrade: false,
    notCds: true,
    neonTarget: "autumn-snow",
    hsiNeonTarget: "red-wave",
    note:
      typeof doc.note === "string"
        ? doc.note
        : isHypothetical
          ? "Hypothetical Gate C decisions import — not production-approved."
          : "Gate C decisions import envelope.",
    generatedAt,
    decisions,
  };

  return { rawArray: false, decisions, envelope };
}

export function resolvePartnerReviewSessionStatus(opts: {
  decisionCount: number;
  isHypothetical: boolean;
}): "awaiting_partner_review_session" | "hypothetical_fixture_imported" | "decisions_imported" {
  if (opts.decisionCount === 0) return "awaiting_partner_review_session";
  if (opts.isHypothetical) return "hypothetical_fixture_imported";
  return "decisions_imported";
}

/** Validate / summarise without writing curator artifacts. */
export function dryRunGateCDecisionsImport(
  raw: unknown,
  opts?: { generatedAt?: string },
): GateCDecisionsDryRunReport {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const parsed = parseGateCDecisionsImport(raw);
  const { decisions, envelope, rawArray } = parsed;
  const checklist = buildGateCChecklist({ generatedAt });
  const queue = buildCuratorGateCQueue(checklist, decisions);
  const pendingIds = new Set(
    checklist.rows
      .filter((r) => r.gateCStatus === "pending" && r.isiRelationshipId)
      .map((r) => r.edgeId),
  );
  const unmatchedEdgeIds = decisions
    .map((d) => d.edgeId)
    .filter((id) => !pendingIds.has(id));

  const byDecision: Record<CuratorGateCDecisionKind | "null", number> = {
    approve: 0,
    reject: 0,
    defer: 0,
    null: 0,
  };
  const byStatus: Partial<Record<CuratorGateCStatus, number>> = {};
  for (const d of decisions) {
    byDecision[d.decision ?? "null"] += 1;
    byStatus[d.status] = (byStatus[d.status] ?? 0) + 1;
  }

  const partnerReviewSessionWouldBe = resolvePartnerReviewSessionStatus({
    decisionCount: decisions.length,
    isHypothetical: envelope.isHypothetical,
  });

  return {
    schemaVersion: "hsi-gate-c-decisions-dry-run-1",
    ok: true,
    dryRun: true,
    wroteArtifacts: false,
    envelope: {
      kind: rawArray ? "raw_array" : envelope.kind,
      isHypothetical: envelope.isHypothetical,
      notProductionApproved: true,
      productionApproved: false,
      inventedApoloOutcomes: false,
    },
    decisionCount: decisions.length,
    byDecision,
    byStatus,
    matchedPendingEdges: decisions.length - unmatchedEdgeIds.length,
    unmatchedEdgeIds,
    refusedAutoApprove: false,
    refusedGradeFlip: false,
    partnerReviewSessionWouldBe,
    honesty: [
      "Dry-run only — no curator UX / publish packs rewritten.",
      "productionApproved stays false; HSI never self-certifies live Apolo outcomes.",
      "autoApprove=false; mayFlipHsiGrade=false; not CDS.",
      envelope.isHypothetical
        ? "isHypothetical=true — queue merge would be hypothetical_fixture_imported, not a partner session."
        : decisions.length === 0
          ? "Empty decisions — still awaiting partner review session."
          : "Non-hypothetical rows present — only use after a live autumn-snow export; provenance is operator responsibility.",
      `Queue preview: actionable=${queue.actionableCount}, decided=${queue.decidedCount}.`,
    ],
    nextActions: [
      decisions.length === 0
        ? "Run live Apolo Gate C on immunecity `/hsi/discovery` REVIEW, export autumn-snow decisions, then `bun run curator-ux --decisions <file>` (without --dry-run)."
        : envelope.isHypothetical
          ? "Replace hypothetical fixture with a real autumn-snow export before claiming partner review complete."
          : "Re-run without --dry-run to write curator UX briefing; never flip hsiGrade from decisions alone.",
      "Keep Gate C human-only on ISI autumn-snow; HSI red-wave holds pending placeholders only.",
    ],
  };
}

export function serializeGateCDecisionsEnvelope(
  envelope: GateCDecisionsImportEnvelope,
): string {
  return `${JSON.stringify(envelope, null, 2)}\n`;
}

/** Allowed decision/status vocab (documentation + tests). */
export const GATE_C_DECISIONS_IMPORT_VOCAB = {
  decisions: CURATOR_GATE_C_DECISIONS,
  statuses: CURATOR_GATE_C_STATUSES,
} as const;

export { emptyDecisionRow };
