/**
 * Aksh HITL read-only stub (P1).
 *
 * Consumer helpers that load `export:aksh-map` (or in-memory suggestions) and
 * project HITL display view-models. Mapping is **not** CDS.
 *
 * Rules (fail closed — see docs/AKSH_HITL_CONSUMPTION.md):
 * - `cdsSurfacable` is only true when `isCdsSurfacable(edge)` (approved + established).
 * - Filling `akshNodeId` never flips CDS, EHR write-back, or Gate C.
 * - Cards are read-only map pointers until safety criteria explicitly pass.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { HsiCurationReview, HsiGrade, HsiTeachingStatus } from "./grades";
import {
  AKSH_CLINIC_BY_ID,
  PROVISIONAL_AKSH_TO_DURABLE,
  akshClinicConcept,
  migrateAkshNodeId,
  type AkshClinicConcept,
  type AkshClinicKind,
} from "./mappings/akshClinicIds";
import {
  AKSH_NODE_SUGGESTIONS,
  akshNodeIdMap,
  akshSuggestionForClaim,
  listAkshNodeSuggestions,
  summarizeAkshNodeMappings,
  type AkshNodeMatchKind,
  type AkshNodeSuggestion,
  type AkshNodeSuggestionStatus,
} from "./mappings/akshNodeSuggestions";
import { linkClaimToMarker } from "./markers";
import {
  HSI_EXAMPLE_TRANSLATION_CARDS,
  HSI_T2D_IMMUNO_SEED_CLAIMS,
  HSI_T2D_IMMUNO_SEED_EDGES,
} from "./seed/t2dImmunoMetabolic";
import type { HsiClaim, HsiDomain, HsiEdge } from "./schema";
import { isCdsSurfacable } from "./validate";

/** Schema written by `bun run export:aksh-map`. */
export const AKSH_HITL_MAP_SCHEMA = "hsi-aksh-node-map-2" as const;

export type AkshHitlMapPayload = {
  schemaVersion: typeof AKSH_HITL_MAP_SCHEMA | string;
  idNamespace?: "aksh:" | string;
  notCds: boolean;
  autoSurfaceCds: boolean;
  cdsRequiresApprovedEstablished?: boolean;
  generatedAt?: string;
  summary?: ReturnType<typeof summarizeAkshNodeMappings>;
  claimToAkshNodeId: Record<string, string>;
  provisionalMigration?: Record<string, string>;
  clinicConcepts?: readonly AkshClinicConcept[];
  suggestions?: readonly AkshNodeSuggestion[];
};

/** Loaded map ready for card projection (always fail-closed on CDS). */
export type AkshHitlLoadedMap = {
  schemaVersion: string;
  idNamespace: "aksh:";
  notCds: true;
  autoSurfaceCds: false;
  cdsRequiresApprovedEstablished: true;
  claimToAkshNodeId: Record<string, string>;
  provisionalMigration: Record<string, string>;
  clinicConcepts: readonly AkshClinicConcept[];
  suggestions: readonly AkshNodeSuggestion[];
  source: "in_memory" | "export_file" | "export_object";
};

/**
 * Read-only HITL card view-model for Aksh display.
 * Never auto-applies to EHR; cdsSurfacable only from safety criteria.
 */
export type AkshHitlCardViewModel = {
  claimId: string;
  claimAssertion: string;
  edgeId: string;
  domain: HsiDomain;
  hsiGrade: HsiGrade;
  curationReview: HsiCurationReview;
  teachingStatus: HsiTeachingStatus;
  /** Durable `aksh:` id when mapped; null when deferred / unmapped. */
  akshNodeId: string | null;
  clinicKind: AkshClinicKind | null;
  clinicLabel: string | null;
  markerId: string | null;
  markerName: string | null;
  /** LOINC from marker or clinic finding concept. */
  loinc: string | null;
  /**
   * From `isCdsSurfacable(edge)` only — never forced true by map presence.
   * Seed edges stay false until approved + established.
   */
  cdsSurfacable: boolean;
  /** Hard invariant for this stub surface. */
  autoApplyToEhr: false;
  requiredClinicianAction: {
    label: string;
    rationale: string;
    requiresHitl: true;
  };
  /** map_pointer_readonly until cdsSurfacable; then cds_hitl_eligible. */
  displayMode: "map_pointer_readonly" | "cds_hitl_eligible";
  mapStatus: AkshNodeSuggestionStatus | "unknown";
  matchKind: AkshNodeMatchKind;
};

export type AkshHitlCardSummary = {
  total: number;
  withAkshNodeId: number;
  withLoinc: number;
  cdsSurfacableCount: number;
  mapPointerOnly: number;
  autoApplyToEhr: false;
  /** Reminder for consumers. */
  cdsRequiresApprovedEstablished: true;
};

const DEFAULT_EXPORT_PATH = "exports/hsi-aksh-node-map.json";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === "string" && v.trim()) out[k] = v;
  }
  return out;
}

/**
 * Normalize export JSON or in-memory modules into a fail-closed loaded map.
 * Always sets autoSurfaceCds=false / notCds=true regardless of file contents.
 */
export function normalizeAkshHitlMap(
  payload: AkshHitlMapPayload | null | undefined,
  source: AkshHitlLoadedMap["source"],
): AkshHitlLoadedMap {
  const claimToAkshNodeId = payload?.claimToAkshNodeId
    ? Object.fromEntries(
        Object.entries(payload.claimToAkshNodeId).map(([claimId, id]) => [
          claimId,
          migrateAkshNodeId(id) ?? id,
        ]),
      )
    : akshNodeIdMap();

  return {
    schemaVersion: payload?.schemaVersion ?? AKSH_HITL_MAP_SCHEMA,
    idNamespace: "aksh:",
    notCds: true,
    autoSurfaceCds: false,
    cdsRequiresApprovedEstablished: true,
    claimToAkshNodeId,
    provisionalMigration: payload?.provisionalMigration
      ? asStringRecord(payload.provisionalMigration)
      : { ...PROVISIONAL_AKSH_TO_DURABLE },
    clinicConcepts: payload?.clinicConcepts?.length
      ? payload.clinicConcepts
      : [...AKSH_CLINIC_BY_ID.values()],
    suggestions: payload?.suggestions?.length
      ? payload.suggestions
      : listAkshNodeSuggestions(),
    source,
  };
}

/** In-memory map from live hsi-core modules (no filesystem). */
export function loadAkshHitlMapInMemory(): AkshHitlLoadedMap {
  return normalizeAkshHitlMap(
    {
      schemaVersion: AKSH_HITL_MAP_SCHEMA,
      notCds: true,
      autoSurfaceCds: false,
      cdsRequiresApprovedEstablished: true,
      claimToAkshNodeId: akshNodeIdMap(),
      provisionalMigration: PROVISIONAL_AKSH_TO_DURABLE,
      clinicConcepts: [...AKSH_CLINIC_BY_ID.values()],
      suggestions: AKSH_NODE_SUGGESTIONS,
    },
    "in_memory",
  );
}

/** Parse an already-loaded export object (e.g. immunecity sync copy). */
export function loadAkshHitlMapFromObject(payload: unknown): AkshHitlLoadedMap {
  if (!isRecord(payload)) {
    throw new Error("Aksh HITL map payload must be an object");
  }
  const claimToAkshNodeId = asStringRecord(payload.claimToAkshNodeId);
  return normalizeAkshHitlMap(
    {
      schemaVersion: String(payload.schemaVersion ?? AKSH_HITL_MAP_SCHEMA),
      notCds: true,
      autoSurfaceCds: false,
      claimToAkshNodeId,
      provisionalMigration: asStringRecord(payload.provisionalMigration),
      clinicConcepts: Array.isArray(payload.clinicConcepts)
        ? (payload.clinicConcepts as AkshClinicConcept[])
        : undefined,
      suggestions: Array.isArray(payload.suggestions)
        ? (payload.suggestions as AkshNodeSuggestion[])
        : undefined,
    },
    "export_object",
  );
}

/**
 * Load `exports/hsi-aksh-node-map.json` (or custom path) produced by
 * `bun run export:aksh-map`. Falls back to in-memory if path missing and
 * `fallbackInMemory` is true (default).
 */
export function loadAkshHitlMapFromExport(
  path: string = DEFAULT_EXPORT_PATH,
  opts?: { fallbackInMemory?: boolean; cwd?: string },
): AkshHitlLoadedMap {
  const fallback = opts?.fallbackInMemory !== false;
  const absolute = resolve(opts?.cwd ?? process.cwd(), path);
  try {
    const raw = JSON.parse(readFileSync(absolute, "utf8")) as unknown;
    return loadAkshHitlMapFromObject(raw);
  } catch (err) {
    if (!fallback) throw err;
    return loadAkshHitlMapInMemory();
  }
}

function edgeForClaim(
  claimId: string,
  edges: readonly HsiEdge[] = HSI_T2D_IMMUNO_SEED_EDGES,
): HsiEdge | undefined {
  return edges.find((e) => e.claimId === claimId);
}

function claimById(
  claimId: string,
  claims: readonly HsiClaim[] = HSI_T2D_IMMUNO_SEED_CLAIMS,
): HsiClaim | undefined {
  return claims.find((c) => c.id === claimId);
}

function resolveAkshNodeId(
  claimId: string,
  map: AkshHitlLoadedMap,
): string | null {
  const fromMap = migrateAkshNodeId(map.claimToAkshNodeId[claimId] ?? null);
  if (fromMap) return fromMap;
  const suggestion = map.suggestions.find((s) => s.claimId === claimId);
  return migrateAkshNodeId(suggestion?.suggestedAkshNodeId ?? null);
}

function requiredActionFor(
  claimId: string,
  assertion: string,
  clinic: AkshClinicConcept | null,
  cdsSurfacable: boolean,
): AkshHitlCardViewModel["requiredClinicianAction"] {
  const card = HSI_EXAMPLE_TRANSLATION_CARDS.find((c) => c.claim.id === claimId);
  if (card) {
    return {
      label: card.action.label,
      rationale: card.action.rationale,
      requiresHitl: true,
    };
  }

  if (cdsSurfacable && clinic) {
    return {
      label: `Review ${clinic.label} (HITL)`,
      rationale: `Safety criteria met for graded claim — clinician confirms before any chart action. Concept ${clinic.id}.`,
      requiresHitl: true,
    };
  }

  const conceptBit = clinic ? ` Mapped clinic concept: ${clinic.label} (${clinic.id}).` : "";
  return {
    label: "Review mapped clinic concept (HITL — map pointer only)",
    rationale: `${assertion.slice(0, 160)}${assertion.length > 160 ? "…" : ""}.${conceptBit} akshNodeId is a curation pointer; CDS stays closed until approved + established.`,
    requiresHitl: true,
  };
}

/**
 * Build one read-only HITL card view-model for a claim.
 * Returns null when claim/edge is unknown.
 */
export function buildAkshHitlCard(
  claimId: string,
  opts?: {
    map?: AkshHitlLoadedMap;
    claims?: readonly HsiClaim[];
    edges?: readonly HsiEdge[];
  },
): AkshHitlCardViewModel | null {
  const map = opts?.map ?? loadAkshHitlMapInMemory();
  const claims = opts?.claims ?? HSI_T2D_IMMUNO_SEED_CLAIMS;
  const edges = opts?.edges ?? HSI_T2D_IMMUNO_SEED_EDGES;

  const claim = claimById(claimId, claims);
  const edge = edgeForClaim(claimId, edges);
  if (!claim || !edge) return null;

  const suggestion =
    map.suggestions.find((s) => s.claimId === claimId) ?? akshSuggestionForClaim(claimId);
  const akshNodeId = resolveAkshNodeId(claimId, map);
  const clinic = akshNodeId
    ? (akshClinicConcept(akshNodeId) ??
      map.clinicConcepts.find((c) => c.id === akshNodeId) ??
      null)
    : null;

  const markerLink = linkClaimToMarker(claimId, edges);
  const loinc =
    markerLink?.marker.loinc?.trim() ||
    clinic?.loinc?.trim() ||
    null;

  // Safety gate — map presence must never force true.
  const cdsSurfacable = isCdsSurfacable(edge);

  return {
    claimId: claim.id,
    claimAssertion: claim.assertion,
    edgeId: edge.id,
    domain: edge.domain,
    hsiGrade: edge.hsiGrade,
    curationReview: edge.curationReview,
    teachingStatus: edge.teachingStatus,
    akshNodeId,
    clinicKind: clinic?.kind ?? null,
    clinicLabel: clinic?.label ?? null,
    markerId: markerLink?.marker.id ?? null,
    markerName: markerLink?.marker.name ?? null,
    loinc,
    cdsSurfacable,
    autoApplyToEhr: false,
    requiredClinicianAction: requiredActionFor(
      claim.id,
      claim.assertion,
      clinic,
      cdsSurfacable,
    ),
    displayMode: cdsSurfacable ? "cds_hitl_eligible" : "map_pointer_readonly",
    mapStatus: suggestion?.status ?? "unknown",
    matchKind: suggestion?.matchKind ?? "none",
  };
}

export type ListAkshHitlCardsOptions = {
  map?: AkshHitlLoadedMap;
  /** Default true — only cards with an akshNodeId. */
  mappedOnly?: boolean;
  claims?: readonly HsiClaim[];
  edges?: readonly HsiEdge[];
};

/** Project HITL cards for Aksh UI stubs / tests. */
export function listAkshHitlCards(
  opts?: ListAkshHitlCardsOptions,
): AkshHitlCardViewModel[] {
  const map = opts?.map ?? loadAkshHitlMapInMemory();
  const mappedOnly = opts?.mappedOnly !== false;
  const claims = opts?.claims ?? HSI_T2D_IMMUNO_SEED_CLAIMS;
  const edges = opts?.edges ?? HSI_T2D_IMMUNO_SEED_EDGES;

  const out: AkshHitlCardViewModel[] = [];
  for (const claim of claims) {
    const card = buildAkshHitlCard(claim.id, { map, claims, edges });
    if (!card) continue;
    if (mappedOnly && !card.akshNodeId) continue;
    out.push(card);
  }
  return out;
}

export function summarizeAkshHitlCards(
  cards: readonly AkshHitlCardViewModel[],
): AkshHitlCardSummary {
  return {
    total: cards.length,
    withAkshNodeId: cards.filter((c) => Boolean(c.akshNodeId)).length,
    withLoinc: cards.filter((c) => Boolean(c.loinc)).length,
    cdsSurfacableCount: cards.filter((c) => c.cdsSurfacable).length,
    mapPointerOnly: cards.filter((c) => c.displayMode === "map_pointer_readonly").length,
    autoApplyToEhr: false,
    cdsRequiresApprovedEstablished: true,
  };
}

/**
 * Cards eligible for live CDS HITL surface.
 * Empty for Phase-0/P1 seeds until Gate C + established.
 */
export function listCdsEligibleAkshHitlCards(
  opts?: ListAkshHitlCardsOptions,
): AkshHitlCardViewModel[] {
  return listAkshHitlCards({ ...opts, mappedOnly: false }).filter((c) => c.cdsSurfacable);
}
