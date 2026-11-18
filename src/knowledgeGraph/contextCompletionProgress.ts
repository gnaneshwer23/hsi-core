/**
 * Browser-safe D-01 context-completion fill progress.
 * Does not import node:crypto — digest sealing stays in contextCompletionSheet.ts / CLI.
 */

export const CONTEXT_COMPLETION_SCHEMA = "hsi-context-completion-sheet-1" as const;
export const NOT_REPORTED = "not_reported" as const;

export type ContextCompletionValue = string | typeof NOT_REPORTED | null;

export type ContextCompletionRow = {
  edgeId: string;
  proposed: {
    tissue: ContextCompletionValue;
    population: ContextCompletionValue;
    design: ContextCompletionValue;
  };
};

export type ContextCompletionProgressInput = {
  schemaVersion: typeof CONTEXT_COMPLETION_SCHEMA;
  mappedAgainst: string;
  slice: "D-01";
  autoPromotion: false;
  scientificApproval: false;
  rows: readonly ContextCompletionRow[];
};

export type ContextCompletionProgress = {
  rowCount: number;
  tissueProposed: number;
  populationProposed: number;
  designProposed: number;
  rowsWithAnyProposal: number;
  rowsUntouched: number;
  autoPromotion: false;
  scientificApproval: false;
  mappedAgainst: string;
  slice: "D-01";
};

/** Accept a sealed repo artifact for UI fill counts without re-hashing (CLI/tests still seal). */
export function acceptSealedSheetForUi(value: unknown): ContextCompletionProgressInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw Error("Context completion sheet must be an object");
  }
  const s = value as Record<string, unknown>;
  if (s.schemaVersion !== CONTEXT_COMPLETION_SCHEMA) {
    throw Error("Unsupported context completion schemaVersion");
  }
  if (s.slice !== "D-01") throw Error("Only the D-01 slice sheet is accepted");
  if (s.autoPromotion !== false || s.scientificApproval !== false) {
    throw Error("Context completion sheet cannot claim promotion or scientific approval");
  }
  if (typeof s.mappedAgainst !== "string" || !/^[a-f0-9]{64}$/.test(s.mappedAgainst)) {
    throw Error("mappedAgainst must be a graph version");
  }
  if (!Array.isArray(s.rows) || s.rows.length > 500) throw Error("rows must be a bounded array");
  const rows: ContextCompletionRow[] = [];
  for (const raw of s.rows) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw Error("Malformed completion row");
    const r = raw as Record<string, unknown>;
    if (typeof r.edgeId !== "string" || !r.edgeId.trim()) throw Error("edgeId required");
    const proposed = r.proposed as Record<string, unknown> | undefined;
    if (!proposed || typeof proposed !== "object") throw Error("proposed required");
    for (const f of ["tissue", "population", "design"] as const) {
      const v = proposed[f];
      if (!(v === null || (typeof v === "string" && v.length <= 300))) {
        throw Error(`proposed.${f} invalid`);
      }
    }
    rows.push({
      edgeId: r.edgeId,
      proposed: {
        tissue: proposed.tissue as ContextCompletionValue,
        population: proposed.population as ContextCompletionValue,
        design: proposed.design as ContextCompletionValue,
      },
    });
  }
  return {
    schemaVersion: CONTEXT_COMPLETION_SCHEMA,
    mappedAgainst: s.mappedAgainst,
    slice: "D-01",
    autoPromotion: false,
    scientificApproval: false,
    rows,
  };
}

/** Read-only fill progress for curator honesty. Never implies review or promotion. */
export function summarizeContextCompletionProgress(
  sheet: ContextCompletionProgressInput,
): ContextCompletionProgress {
  let tissueProposed = 0;
  let populationProposed = 0;
  let designProposed = 0;
  let rowsWithAnyProposal = 0;
  for (const row of sheet.rows) {
    const t = row.proposed.tissue !== null;
    const p = row.proposed.population !== null;
    const d = row.proposed.design !== null;
    if (t) tissueProposed += 1;
    if (p) populationProposed += 1;
    if (d) designProposed += 1;
    if (t || p || d) rowsWithAnyProposal += 1;
  }
  return {
    rowCount: sheet.rows.length,
    tissueProposed,
    populationProposed,
    designProposed,
    rowsWithAnyProposal,
    rowsUntouched: sheet.rows.length - rowsWithAnyProposal,
    autoPromotion: false,
    scientificApproval: false,
    mappedAgainst: sheet.mappedAgainst,
    slice: "D-01",
  };
}
