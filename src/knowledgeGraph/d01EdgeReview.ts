/**
 * Local D-01 edge-review recommendations (Track C2 soft-land).
 * Accept / reject / revise / insufficient — never promotes edges, never sets
 * scientificClaimAllowed, never writes the published graph. Device-local only.
 */
import {rejectPhiPayload} from "../cdsPhiBoundary";
import {canonicalEvidenceJson} from "../evidence/researchEvidenceCorpus";
import {looksIdentifying} from "../identifyingText";
import {browserStore as baseBrowserStore,memoryStore,type KeyValueStore} from "./investigationStore";

export type {KeyValueStore};
export {memoryStore};

export const D01_EDGE_REVIEW_SCHEMA = "hsi-d01-edge-review-sheet-1" as const;
export const D01_EDGE_DECISION_SCHEMA = "hsi-d01-edge-decision-1" as const;

export type D01EdgeReviewDecision = "accept_candidate" | "reject_candidate" | "revise" | "insufficient";

export type D01EdgeReviewRow = {
  edgeId: string;
  subject: string;
  object: string;
  predicate: string;
  sourceId: string | null;
  domains: string[];
  conditions: string[];
  model: string;
  current: {tissue: string | null; population: string | null; design: string};
  proposed: {tissue: string | null; population: string | null; design: string | null};
  note: string;
};

export type D01EdgeReviewSheet = {
  schemaVersion: "hsi-context-completion-sheet-1";
  mappedAgainst: string;
  slice: "D-01";
  rows: D01EdgeReviewRow[];
};

export type D01EdgeDecision = {
  schemaVersion: typeof D01_EDGE_DECISION_SCHEMA;
  edgeId: string;
  subject: string;
  object: string;
  predicate: string;
  decision: D01EdgeReviewDecision;
  reason: string;
  reviewerLabel: string;
  reviewerVerified: false;
  decidedAt: string;
  revision: number;
  previousDigest: string | null;
  digest: string;
  sheetMappedAgainst: string;
  status: "curator_recommendation_unverified";
  scientificClaimAllowed: false;
  graphPromotion: false;
  autoPromotion: false;
};

export type D01EdgeDecisionInput = {
  edgeId: string;
  decision: D01EdgeReviewDecision;
  reason: string;
  reviewerLabel: string;
};

export const REASON_LIMITS = Object.freeze({min: 10, max: 500});
export const DECISION_LABEL: Record<D01EdgeReviewDecision, string> = {
  accept_candidate: "Recommend accepting",
  reject_candidate: "Recommend rejecting",
  revise: "Recommend revise",
  insufficient: "Insufficient evidence",
};
export const DECISION_DONE: Record<D01EdgeReviewDecision, string> = {
  accept_candidate: "Recommended for acceptance",
  reject_candidate: "Recommended for rejection",
  revise: "Recommended for revision",
  insufficient: "Marked insufficient",
};

const PREFIX = "hsi-d01-edge:";
const DECISIONS: ReadonlySet<string> = new Set([
  "accept_candidate",
  "reject_candidate",
  "revise",
  "insufficient",
]);
const keyOf = (edgeId: string, rev: number) => `${PREFIX}${edgeId}:${String(rev).padStart(6, "0")}`;
const sha = async (text: string) =>
  [...new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export const sheetDigest = (sheet: D01EdgeReviewSheet) =>
  sha(canonicalEvidenceJson({mappedAgainst: sheet.mappedAgainst, slice: sheet.slice, rows: sheet.rows}));

const parse = (raw: string | null): D01EdgeDecision | null => {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as D01EdgeDecision;
    return v && v.schemaVersion === D01_EDGE_DECISION_SCHEMA ? v : null;
  } catch {
    return null;
  }
};
const withoutDigest = (d: D01EdgeDecision) => {
  const {digest: _d, ...rest} = d;
  return rest;
};

function revisionsOf(store: KeyValueStore, edgeId: string): number[] {
  const head = `${PREFIX}${edgeId}:`;
  return store
    .keys()
    .filter((k) => k.startsWith(head) && /^\d{6}$/.test(k.slice(head.length)))
    .map((k) => Number(k.slice(head.length)))
    .sort((a, b) => a - b);
}

export function acceptSheetForReview(value: unknown): D01EdgeReviewSheet {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw Error("D-01 edge review sheet must be an object");
  }
  const s = value as Record<string, unknown>;
  if (s.schemaVersion !== "hsi-context-completion-sheet-1") {
    throw Error("Unsupported context completion schemaVersion");
  }
  if (s.slice !== "D-01") throw Error("Only the D-01 slice sheet is accepted");
  if (typeof s.mappedAgainst !== "string" || !/^[a-f0-9]{64}$/.test(s.mappedAgainst)) {
    throw Error("mappedAgainst must be a graph version");
  }
  if (!Array.isArray(s.rows) || s.rows.length === 0 || s.rows.length > 500) {
    throw Error("rows must be a non-empty bounded array");
  }
  const rows: D01EdgeReviewRow[] = [];
  const seen = new Set<string>();
  for (const raw of s.rows) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw Error("Malformed review row");
    const r = raw as Record<string, unknown>;
    if (typeof r.edgeId !== "string" || !r.edgeId.trim() || r.edgeId.length > 220) {
      throw Error("edgeId required");
    }
    if (seen.has(r.edgeId)) throw Error(`Duplicate edgeId ${r.edgeId}`);
    seen.add(r.edgeId);
    if (typeof r.subject !== "string" || typeof r.object !== "string" || typeof r.predicate !== "string") {
      throw Error("row labels required");
    }
    if (!(r.sourceId === null || typeof r.sourceId === "string")) throw Error("sourceId invalid");
    if (typeof r.model !== "string" || typeof r.note !== "string") throw Error("model/note required");
    if (!Array.isArray(r.domains) || !Array.isArray(r.conditions)) throw Error("domains/conditions required");
    const current = r.current as Record<string, unknown> | undefined;
    const proposed = r.proposed as Record<string, unknown> | undefined;
    if (!current || !proposed) throw Error("current/proposed required");
    rows.push({
      edgeId: r.edgeId,
      subject: r.subject,
      object: r.object,
      predicate: r.predicate,
      sourceId: r.sourceId as string | null,
      domains: r.domains as string[],
      conditions: r.conditions as string[],
      model: r.model,
      current: {
        tissue: (current.tissue as string | null) ?? null,
        population: (current.population as string | null) ?? null,
        design: String(current.design ?? ""),
      },
      proposed: {
        tissue: (proposed.tissue as string | null) ?? null,
        population: (proposed.population as string | null) ?? null,
        design: (proposed.design as string | null) ?? null,
      },
      note: r.note,
    });
  }
  return {
    schemaVersion: "hsi-context-completion-sheet-1",
    mappedAgainst: s.mappedAgainst,
    slice: "D-01",
    rows,
  };
}

export function validateDecision(sheet: D01EdgeReviewSheet, i: D01EdgeDecisionInput): D01EdgeReviewRow {
  const row = sheet.rows.find((x) => x.edgeId === i.edgeId);
  if (!row) throw Error("Unknown edge");
  if (!DECISIONS.has(i.decision)) throw Error("Unknown decision");
  const reason = i.reason.trim();
  if (reason.length < REASON_LIMITS.min || reason.length > REASON_LIMITS.max) {
    throw Error(`A reason of ${REASON_LIMITS.min} to ${REASON_LIMITS.max} characters is required`);
  }
  if (!rejectPhiPayload({textBlobs: [reason]}).ok || looksIdentifying(reason)) {
    throw Error("The reason appears to contain personal or clinical identifiers and cannot be recorded");
  }
  if (!/^[\p{L}\p{N} .'_-]{2,60}$/u.test(i.reviewerLabel.trim())) {
    throw Error("Enter a reviewer label of 2 to 60 letters, numbers or . ' _ - characters");
  }
  return row;
}

export async function composeDecision(
  sheet: D01EdgeReviewSheet,
  i: D01EdgeDecisionInput,
  last: D01EdgeDecision | null,
  now: () => Date = () => new Date(),
): Promise<{status: "saved" | "unchanged"; decision: D01EdgeDecision}> {
  const row = validateDecision(sheet, i);
  const reason = i.reason.trim();
  const label = i.reviewerLabel.trim();
  if (last && last.decision === i.decision && last.reason === reason && last.reviewerLabel === label) {
    return {status: "unchanged", decision: last};
  }
  const base: Omit<D01EdgeDecision, "digest"> = {
    schemaVersion: D01_EDGE_DECISION_SCHEMA,
    edgeId: row.edgeId,
    subject: row.subject,
    object: row.object,
    predicate: row.predicate,
    decision: i.decision,
    reason,
    reviewerLabel: label,
    reviewerVerified: false,
    decidedAt: now().toISOString(),
    revision: (last?.revision ?? 0) + 1,
    previousDigest: last?.digest ?? null,
    sheetMappedAgainst: sheet.mappedAgainst,
    status: "curator_recommendation_unverified",
    scientificClaimAllowed: false,
    graphPromotion: false,
    autoPromotion: false,
  };
  return {status: "saved", decision: {...base, digest: await sha(canonicalEvidenceJson(base))}};
}

export async function recordDecision(
  sheet: D01EdgeReviewSheet,
  store: KeyValueStore,
  i: D01EdgeDecisionInput,
  now: () => Date = () => new Date(),
): Promise<{status: "saved" | "unchanged"; decision: D01EdgeDecision}> {
  validateDecision(sheet, i);
  const revs = revisionsOf(store, i.edgeId);
  const last = revs.length ? parse(store.get(keyOf(i.edgeId, revs[revs.length - 1]!))) : null;
  if (revs.length && !last) throw Error("The latest recorded decision is unreadable; refusing to extend the history");
  const r = await composeDecision(sheet, i, last, now);
  if (r.status === "saved") store.create(keyOf(i.edgeId, r.decision.revision), JSON.stringify(r.decision));
  return r;
}

export function history(store: KeyValueStore, edgeId: string): D01EdgeDecision[] {
  return revisionsOf(store, edgeId)
    .map((r) => parse(store.get(keyOf(edgeId, r))))
    .filter((d): d is D01EdgeDecision => d !== null);
}

export const latestDecisions = (sheet: D01EdgeReviewSheet, store: KeyValueStore): Map<string, D01EdgeDecision> => {
  const out = new Map<string, D01EdgeDecision>();
  for (const row of sheet.rows) {
    const h = history(store, row.edgeId);
    if (h.length) out.set(row.edgeId, h[h.length - 1]!);
  }
  return out;
};

export async function verifyDecisions(sheet: D01EdgeReviewSheet, store: KeyValueStore): Promise<string[]> {
  const problems: string[] = [];
  const ids = new Set(sheet.rows.map((r) => r.edgeId));
  for (const row of sheet.rows) {
    const h = history(store, row.edgeId);
    let prev: string | null = null;
    for (const [i, d] of h.entries()) {
      if (d.revision !== i + 1) problems.push(`${row.edgeId}: revision numbering is not contiguous`);
      if ((await sha(canonicalEvidenceJson(withoutDigest(d)))) !== d.digest) {
        problems.push(`${row.edgeId}: revision ${d.revision} does not match its digest`);
      }
      if (d.previousDigest !== prev) problems.push(`${row.edgeId}: revision ${d.revision} breaks the chain`);
      if (
        d.scientificClaimAllowed !== false ||
        d.graphPromotion !== false ||
        d.autoPromotion !== false ||
        d.status !== "curator_recommendation_unverified"
      ) {
        problems.push(`${row.edgeId}: revision ${d.revision} claims approval or promotion`);
      }
      if (d.sheetMappedAgainst !== sheet.mappedAgainst) {
        problems.push(`${row.edgeId}: revision ${d.revision} mapped against a different graph version`);
      }
      prev = d.digest;
    }
  }
  for (const key of store.keys()) {
    if (!key.startsWith(PREFIX)) continue;
    const edgeId = key.slice(PREFIX.length).replace(/:\d{6}$/, "");
    if (!ids.has(edgeId)) problems.push(`${edgeId}: decision refers to an edge not on the sheet`);
  }
  return problems;
}

export type D01EdgeDecisionExport = {
  schemaVersion: "hsi-d01-edge-decisions-export-1";
  exportedAt: string;
  sheetDigest: string;
  mappedAgainst: string;
  slice: "D-01";
  counts: {
    edges: number;
    decided: number;
    accept_candidate: number;
    reject_candidate: number;
    revise: number;
    insufficient: number;
    pending: number;
  };
  decisions: D01EdgeDecision[];
  statement: string;
};

export async function exportDecisions(
  sheet: D01EdgeReviewSheet,
  store: KeyValueStore,
  now: () => Date = () => new Date(),
): Promise<D01EdgeDecisionExport> {
  const problems = await verifyDecisions(sheet, store);
  if (problems.length) throw Error("Decisions failed verification: " + problems.join("; "));
  const latest = latestDecisions(sheet, store);
  const all = sheet.rows.flatMap((r) => history(store, r.edgeId));
  const n = (d: D01EdgeReviewDecision) => [...latest.values()].filter((x) => x.decision === d).length;
  return {
    schemaVersion: "hsi-d01-edge-decisions-export-1",
    exportedAt: now().toISOString(),
    sheetDigest: await sheetDigest(sheet),
    mappedAgainst: sheet.mappedAgainst,
    slice: "D-01",
    counts: {
      edges: sheet.rows.length,
      decided: latest.size,
      accept_candidate: n("accept_candidate"),
      reject_candidate: n("reject_candidate"),
      revise: n("revise"),
      insufficient: n("insufficient"),
      pending: sheet.rows.length - latest.size,
    },
    decisions: all,
    statement:
      "Curator recommendations by self-declared, unverified reviewers on D-01 source-candidate edges. None promotes a relationship, sets scientificClaimAllowed, or changes the published graph. Independent dual review is still required before any release.",
  };
}

/** Device-local storage under this module's own key prefix; null when the browser blocks it. */
export const browserStore = (storage?: Storage): KeyValueStore | null => baseBrowserStore(storage, PREFIX);
