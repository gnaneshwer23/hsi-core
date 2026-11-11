/**
 * Reactome pathway metadata adapter.
 * Research navigation only: returned pathways are unreviewed metadata, never
 * evidence of causality, clinical validity or permission to promote graph edges.
 * https://reactome.org/ContentService/
 */
import type {FetchLike} from "../fetchLike";

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
    const length = Number(response.headers.get("content-length") ?? "0");
    if (length > MAX_BYTES) return {ok: false, reason: "invalid_response", detail: "Response exceeds size limit"};
    const body = await response.text();
    if (body.length > MAX_BYTES) return {ok: false, reason: "invalid_response", detail: "Response exceeds size limit"};
    let data: unknown;
    try { data = JSON.parse(body); }
    catch { return {ok: false, reason: "invalid_response", detail: "Invalid JSON"}; }
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
    return {ok: true, pathway: {
      provider: "reactome", stableId, displayName: name.trim(), speciesName,
      url: `https://reactome.org/content/detail/${stableId}`,
      retrievedAt: input.retrievedAt ?? new Date().toISOString(),
      verificationState: "metadata_retrieved_not_claim_verified",
      reviewState: "unreviewed", scientificApproval: false, graphPromotable: false, claimSupport: false,
    }};
  } catch {
    return {ok: false, reason: "network_error", detail: "Reactome request failed or timed out"};
  } finally { clearTimeout(timeout); }
}
