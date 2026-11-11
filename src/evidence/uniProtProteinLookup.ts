/**
 * UniProtKB entry metadata for governed research navigation.
 * Retrieval is not evidence of mechanism, target validity or rights clearance.
 * https://rest.uniprot.org/uniprotkb/{accession}.json
 */
import type {FetchLike} from "../fetchLike";
import {validateHsiOntologyIdentifier} from "../hsiOntologyRegistry";

export const UNIPROT_REST_BASE = "https://rest.uniprot.org/uniprotkb";
export type UniProtProteinMetadata = {
  provider: "uniprotkb"; accession: string; proteinName: string;
  organismScientificName: string | null; organismTaxonId: number | null;
  geneNames: readonly string[]; entryType: string | null;
  url: string; retrievedAt: string;
  verificationState: "metadata_retrieved_not_claim_verified";
  reviewState: "unreviewed"; scientificApproval: false;
  graphPromotable: false; claimSupport: false;
};
export type UniProtLookupResult =
  | {ok: true; protein: UniProtProteinMetadata}
  | {ok: false; reason: "invalid_id" | "provider_error" | "invalid_response" | "network_error"; detail: string};

const MAX_BYTES = 200_000;
export function assertUniProtAccession(value: string): string {
  const id = value.trim().toUpperCase();
  validateHsiOntologyIdentifier("UniProt", id);
  return id;
}

export async function lookupUniProtProtein(input: {
  accession: string; fetcher?: FetchLike; retrievedAt?: string;
}): Promise<UniProtLookupResult> {
  let accession: string;
  try { accession = assertUniProtAccession(input.accession); }
  catch { return {ok:false, reason:"invalid_id", detail:"Invalid UniProt accession"}; }
  const fetcher = input.fetcher ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetcher(`${UNIPROT_REST_BASE}/${encodeURIComponent(accession)}.json`,
      {headers:{Accept:"application/json"},signal:controller.signal});
    if (!response.ok) return {ok:false,reason:"provider_error",detail:`HTTP ${response.status}`};
    const length = Number(response.headers.get("content-length") ?? "0");
    if (length > MAX_BYTES) return {ok:false,reason:"invalid_response",detail:"Response too large"};
    const body = await response.text();
    if (body.length > MAX_BYTES) return {ok:false,reason:"invalid_response",detail:"Response too large"};
    let parsed: unknown;
    try {parsed = JSON.parse(body);} catch {return {ok:false,reason:"invalid_response",detail:"Invalid JSON"};}
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {ok:false,reason:"invalid_response",detail:"Invalid record"};
    const data = parsed as Record<string,unknown>;
    const returned = data.primaryAccession;
    const description = data.proteinDescription as Record<string,unknown> | undefined;
    const recommended = description?.recommendedName as Record<string,unknown> | undefined;
    const submitted = Array.isArray(description?.submissionNames) ? description.submissionNames[0] as Record<string,unknown> : undefined;
    const fullName = (recommended?.fullName ?? submitted?.fullName) as Record<string,unknown> | undefined;
    const proteinName = fullName?.value;
    if (returned !== accession || typeof proteinName !== "string" || !proteinName.trim() || proteinName.length > 500)
      return {ok:false,reason:"invalid_response",detail:"Accession or protein name mismatch"};
    const organism = data.organism as Record<string,unknown> | undefined;
    const organismScientificName = typeof organism?.scientificName === "string" ? organism.scientificName : null;
    const organismTaxonId = typeof organism?.taxonId === "number" && Number.isInteger(organism.taxonId) ? organism.taxonId : null;
    const genes = Array.isArray(data.genes) ? data.genes : [];
    const geneNames = genes.flatMap((gene:unknown) => {
      if (!gene || typeof gene !== "object" || Array.isArray(gene)) return [];
      const value = (gene as {geneName?:{value?:unknown}}).geneName?.value;
      return typeof value === "string" && value.length <= 100 ? [value] : [];
    }).slice(0,20);
    return {ok:true,protein:{
      provider:"uniprotkb",accession,proteinName:proteinName.trim(),
      organismScientificName,organismTaxonId,geneNames,entryType:typeof data.entryType === "string" ? data.entryType : null,
      url:`https://www.uniprot.org/uniprotkb/${accession}/entry`,
      retrievedAt:input.retrievedAt ?? new Date().toISOString(),
      verificationState:"metadata_retrieved_not_claim_verified",reviewState:"unreviewed",
      scientificApproval:false,graphPromotable:false,claimSupport:false,
    }};
  } catch {
    return {ok:false,reason:"network_error",detail:"UniProt request failed or timed out"};
  } finally {clearTimeout(timeout);}
}
