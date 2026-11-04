/** ARCH-002: metadata-only Europe PMC ingestion. No claim approval, no full-text storage. */
import { createHash } from "node:crypto";

export const SSC_INITIAL_PMIDS = ["30760472","29514998","33175976","21314428","16339522"] as const;
export type EvidenceMetadata = {
 id: string; source_kind: "publication"; external_id: string; title: string;
 source_url: string; doi: string | null; pmid: string; licence_status: "metadata_only";
 retraction_status: "unknown" | "none_reported" | "corrected" | "retracted";
 retrieved_at: string; metadata: { provider: "europe_pmc"; journal: string | null; published: string | null; recordHash: string };
};
export function parseEuropePmcMetadata(pmid: string, raw: unknown, retrievedAt: string): EvidenceMetadata {
 if (!/^\d{1,9}$/.test(pmid)) throw new Error("Invalid PMID");
 if (!raw || typeof raw !== "object") throw new Error("Invalid provider response");
 const envelope = raw as { resultList?: { result?: unknown[] } };
 const result = envelope.resultList?.result;
 if (!Array.isArray(result) || result.length !== 1) throw new Error("Expected exactly one Europe PMC record");
 const record = result[0] as Record<string, unknown>;
 if (!record || String(record.id) !== pmid || record.source !== "MED") throw new Error("Provider identity mismatch");
 const title = record.title;
 if (typeof title !== "string" || !title.trim() || title.length > 2000) throw new Error("Missing/invalid title");
 const doi = typeof record.doi === "string" && /^10\.\d{4,9}\/\S+$/.test(record.doi) ? record.doi : null;
 const journal = typeof record.journalTitle === "string" ? record.journalTitle : null;
 const published = typeof record.firstPublicationDate === "string" ? record.firstPublicationDate : null;
 const status = record.isRetracted === "Y" ? "retracted" : "unknown";
 const recordHash = createHash("sha256").update(JSON.stringify({pmid,title,doi,journal,published,status})).digest("hex");
 return {id:`pmid:${pmid}`,source_kind:"publication",external_id:pmid,title:title.trim(),source_url:`https://europepmc.org/article/MED/${pmid}`,doi,pmid,licence_status:"metadata_only",retraction_status:status,retrieved_at:retrievedAt,metadata:{provider:"europe_pmc",journal,published,recordHash}};
}
export async function fetchEuropePmcMetadata(pmid: string, fetcher: typeof fetch = fetch): Promise<EvidenceMetadata> {
 if (!/^\d{1,9}$/.test(pmid)) throw new Error("Invalid PMID");
 const url = new URL("https://www.ebi.ac.uk/europepmc/webservices/rest/search");
 url.searchParams.set("query",`EXT_ID:${pmid} AND SRC:MED`);
 url.searchParams.set("format","json");
 url.searchParams.set("pageSize","2");
 const response = await fetcher(url.toString(),{headers:{"Accept":"application/json"},signal:AbortSignal.timeout(12000)});
 if (!response.ok) throw new Error(`Europe PMC returned HTTP ${response.status}`);
 const body = await response.text();
 if (body.length > 200000) throw new Error("Oversized provider response");
 return parseEuropePmcMetadata(pmid,JSON.parse(body),new Date().toISOString());
}
