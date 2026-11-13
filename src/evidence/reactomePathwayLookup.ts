/**
 * Reactome pathway metadata adapter.
 * Research navigation only: returned pathways are unreviewed metadata, never
 * evidence of causality, clinical validity or permission to promote graph edges.
 * https://reactome.org/ContentService/
 */
import type {FetchLike} from "../fetchLike";
import {assertUniProtAccession} from "./uniProtProteinLookup";

export const REACTOME_CONTENT_SERVICE = "https://reactome.org/ContentService";
export type ReactomePathwayMetadata = {
  provider: "reactome";
  stableId: string;
  displayName: string;
  speciesName: string | null;
  url: string;
  retrievedAt: string;
  verificationState: "metadata_retrieved_not_claim_verified";
  reviewState: "unreviewed";
  scientificApproval: false;
  graphPromotable: false;
  claimSupport: false;
};
export type ReactomeLookupResult =
  | {ok: true; pathway: ReactomePathwayMetadata}
  | {ok: false; reason: "invalid_id" | "provider_error" | "invalid_response" | "network_error"; detail: string};

const MAX_BYTES = 100_000;
export function assertReactomeStableId(value: string): string {
  const id = value.trim().toUpperCase();
  if (!/^R-[A-Z]{3}-[0-9]{1,15}$/.test(id)) throw new Error("Invalid Reactome stable ID");
  return id;
}

type BoundedJson = {ok: true; data: unknown} | {ok: false; detail: string};
/** Shared by every Reactome call: size cap (header and body) and JSON parse, failing closed. */
async function readBoundedJson(response: Response, maxBytes: number): Promise<BoundedJson> {
  const length = Number(response.headers.get("content-length") ?? "0");
  if (length > maxBytes) return {ok: false, detail: "Response exceeds size limit"};
  const body = await response.text();
  if (body.length > maxBytes) return {ok: false, detail: "Response exceeds size limit"};
  try { return {ok: true, data: JSON.parse(body)}; }
  catch { return {ok: false, detail: "Invalid JSON"}; }
}

function pathwayMetadata(stableId: string, displayName: string, speciesName: string | null, retrievedAt: string): ReactomePathwayMetadata {
  return {
    provider: "reactome", stableId, displayName, speciesName,
    url: `https://reactome.org/content/detail/${stableId}`,
    retrievedAt,
    verificationState: "metadata_retrieved_not_claim_verified",
    reviewState: "unreviewed", scientificApproval: false, graphPromotable: false, claimSupport: false,
  };
}

export async function lookupReactomePathway(input: {
  stableId: string;
  fetcher?: FetchLike;
  retrievedAt?: string;
}): Promise<ReactomeLookupResult> {
  let stableId: string;
  try { stableId = assertReactomeStableId(input.stableId); }
  catch { return {ok: false, reason: "invalid_id", detail: "Invalid Reactome stable ID"}; }
  const fetcher = input.fetcher ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetcher(
      `${REACTOME_CONTENT_SERVICE}/data/query/${encodeURIComponent(stableId)}`,
      {headers: {Accept: "application/json"}, signal: controller.signal},
    );
    if (!response.ok) return {ok: false, reason: "provider_error", detail: `HTTP ${response.status}`};
    const parsed = await readBoundedJson(response, MAX_BYTES);
    if (!parsed.ok) return {ok: false, reason: "invalid_response", detail: parsed.detail};
    const data = parsed.data;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return {ok: false, reason: "invalid_response", detail: "Invalid Reactome record"};
    }
    const record = data as Record<string, unknown>;
    const returnedId = typeof record.stId === "string" ? record.stId.toUpperCase() : "";
    const name = record.displayName;
    const schemaClass = record.schemaClass;
    if (returnedId !== stableId || typeof name !== "string" || !name.trim() || name.length > 500 ||
      (schemaClass !== "Pathway" && schemaClass !== "TopLevelPathway")) {
      return {ok: false, reason: "invalid_response", detail: "Pathway identity or type mismatch"};
    }
    const species = Array.isArray(record.species) ? record.species[0] : record.species;
    const speciesName = species && typeof species === "object" && !Array.isArray(species) &&
      typeof (species as {displayName?: unknown}).displayName === "string"
      ? (species as {displayName: string}).displayName : null;
    return {ok: true, pathway: pathwayMetadata(stableId, name.trim(), speciesName, input.retrievedAt ?? new Date().toISOString())};
  } catch {
    return {ok: false, reason: "network_error", detail: "Reactome request failed or timed out"};
  } finally { clearTimeout(timeout); }
}

const MAX_LIST_BYTES = 500_000;
const MAX_PATHWAYS_CAP = 200;
export type ReactomePathwaysForProtein = {
  provider: "reactome";
  accession: string;
  taxonId: number;
  pathways: ReactomePathwayMetadata[];
  /** True when the provider returned more pathways than `maxPathways`. */
  truncated: boolean;
  retrievedAt: string;
  /** Reactome lists pathways that contain the protein. That is curated metadata, not evidence the protein drives a pathway in any tissue, cell state or disease. */
  membershipInterpretation: "listed_by_provider_not_context_specific";
  reviewState: "unreviewed";
  graphPromotable: false;
  claimSupport: false;
};
export type ReactomePathwaysForProteinResult =
  | {ok: true; result: ReactomePathwaysForProtein}
  | {ok: false; reason: "invalid_id" | "provider_error" | "invalid_response" | "network_error"; detail: string};

/**
 * Entity-to-pathway orientation: which Reactome pathways list this UniProt protein?
 * Lets a question that names a protein (for example IL-21) start from pathways instead of requiring a
 * pathway ID up front. Reuses the same bounds, identity checks and non-promotable flags as the ID lookup.
 */
export async function lookupReactomePathwaysForUniProt(input: {
  accession: string;
  taxonId?: number;
  maxPathways?: number;
  fetcher?: FetchLike;
  retrievedAt?: string;
}): Promise<ReactomePathwaysForProteinResult> {
  let accession: string;
  try { accession = assertUniProtAccession(input.accession); }
  catch { return {ok: false, reason: "invalid_id", detail: "Invalid UniProt accession"}; }
  const taxonId = input.taxonId ?? 9606;
  const maxPathways = input.maxPathways ?? 50;
  if (!Number.isInteger(taxonId) || taxonId < 1 || taxonId > 99_999_999 ||
    !Number.isInteger(maxPathways) || maxPathways < 1 || maxPathways > MAX_PATHWAYS_CAP) {
    return {ok: false, reason: "invalid_id", detail: "Invalid taxon or pathway limit"};
  }
  const fetcher = input.fetcher ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetcher(
      `${REACTOME_CONTENT_SERVICE}/data/mapping/UniProt/${encodeURIComponent(accession)}/pathways?species=${taxonId}`,
      {headers: {Accept: "application/json"}, signal: controller.signal},
    );
    if (!response.ok) return {ok: false, reason: "provider_error", detail: `HTTP ${response.status}`};
    const parsed = await readBoundedJson(response, MAX_LIST_BYTES);
    if (!parsed.ok) return {ok: false, reason: "invalid_response", detail: parsed.detail};
    if (!Array.isArray(parsed.data) || parsed.data.length > 2_000) {
      return {ok: false, reason: "invalid_response", detail: "Invalid Reactome pathway list"};
    }
    const retrievedAt = input.retrievedAt ?? new Date().toISOString();
    const seen = new Set<string>();
    const pathways: ReactomePathwayMetadata[] = [];
    for (const item of parsed.data) {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return {ok: false, reason: "invalid_response", detail: "Invalid Reactome pathway record"};
      }
      const record = item as Record<string, unknown>;
      let stableId: string;
      try { stableId = assertReactomeStableId(typeof record.stId === "string" ? record.stId : ""); }
      catch { return {ok: false, reason: "invalid_response", detail: "Pathway identity mismatch"}; }
      const name = record.displayName;
      if (typeof name !== "string" || !name.trim() || name.length > 500 ||
        (record.schemaClass !== "Pathway" && record.schemaClass !== "TopLevelPathway")) {
        return {ok: false, reason: "invalid_response", detail: "Pathway identity or type mismatch"};
      }
      if (seen.has(stableId)) continue;
      seen.add(stableId);
      const speciesName = typeof record.speciesName === "string" && record.speciesName.length <= 200 ? record.speciesName : null;
      pathways.push(pathwayMetadata(stableId, name.trim(), speciesName, retrievedAt));
    }
    return {ok: true, result: {
      provider: "reactome", accession, taxonId,
      pathways: pathways.slice(0, maxPathways), truncated: pathways.length > maxPathways, retrievedAt,
      membershipInterpretation: "listed_by_provider_not_context_specific",
      reviewState: "unreviewed", graphPromotable: false, claimSupport: false,
    }};
  } catch {
    return {ok: false, reason: "network_error", detail: "Reactome request failed or timed out"};
  } finally { clearTimeout(timeout); }
}
