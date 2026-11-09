/**
 * ISI Priority 1: public, metadata-only Europe PMC discovery.
 * No patient data, LLM inference, graph writes or claim auto-approval.
 * Results are bibliographic candidates, not evidence that a claim is supported.
 */
import type { FetchLike } from "../fetchLike";
export type LiteratureRecord = {
  source: "Europe PMC";
  sourceId: string;
  sourceType: string;
  pmid: string | null;
  pmcid: string | null;
  doi: string | null;
  title: string;
  authors: string | null;
  journal: string | null;
  publicationYear: number | null;
  abstract: string | null;
  url: string;
  retrievedAt: string;
  verificationState: "metadata_retrieved_not_claim_verified";
  reviewState: "unreviewed";
};
export type LiteraturePage = {
  query: string;
  totalHits: number;
  nextCursorMark: string | null;
  records: LiteratureRecord[];
  retrievedAt: string;
};
const ENDPOINT = "https://www.ebi.ac.uk/europepmc/webservices/rest/search";
const SSC_SCOPE = '("systemic sclerosis" OR scleroderma) AND ("T follicular helper" OR Tfh OR "IL-21" OR "B cell" OR fibrosis)';
type EpmcResult = {
  id?: unknown; source?: unknown; pmid?: unknown; pmcid?: unknown; doi?: unknown;
  title?: unknown; authorString?: unknown; journalTitle?: unknown;
  pubYear?: unknown; abstractText?: unknown;
};
function stringOrNull(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}
function publicationYear(v: unknown): number | null {
  const year = typeof v === "string" && /^\d{4}$/.test(v) ? Number(v) : null;
  return year !== null && year >= 1800 && year <= 2200 ? year : null;
}
export async function searchSscLiterature(input: {
  term?: string;
  pageSize?: number;
  cursorMark?: string;
  fetcher?: FetchLike;
  now?: () => Date;
  signal?: AbortSignal;
} = {}): Promise<LiteraturePage> {
  const term = input.term?.trim();
  if (term && (term.length > 120 || /[\x00-\x1f]/.test(term))) throw new Error("Invalid literature search term");
  const pageSize = input.pageSize ?? 20;
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new Error("Invalid literature page size");
  const cursor = input.cursorMark ?? "*";
  if (cursor.length > 256 || /[\x00-\x1f]/.test(cursor)) throw new Error("Invalid cursor");
  const query = term ? `(${SSC_SCOPE}) AND (${term.replace(/[()]/g, " ")})` : SSC_SCOPE;
  const params = new URLSearchParams({query, format:"json", resultType:"core", pageSize:String(pageSize), cursorMark:cursor});
  const response = await (input.fetcher ?? fetch)(`${ENDPOINT}?${params}`, {
    headers: {Accept:"application/json"},
    signal:input.signal,
  });
  if (!response.ok) throw new Error(`Europe PMC request failed (HTTP ${response.status})`);
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object") throw new Error("Invalid Europe PMC response");
  const body = payload as Record<string,unknown>;
  const list = body.resultList && typeof body.resultList === "object" ? (body.resultList as Record<string,unknown>).result : null;
  if (!Array.isArray(list)) throw new Error("Europe PMC result list missing");
  const retrievedAt = (input.now ?? (() => new Date()))().toISOString();
  const records = list.flatMap((item: EpmcResult): LiteratureRecord[] => {
    const sourceId = stringOrNull(item.id);
    const sourceType = stringOrNull(item.source);
    const title = stringOrNull(item.title);
    if (!sourceId || !sourceType || !title) return [];
    const pmid = stringOrNull(item.pmid);
    const pmcid = stringOrNull(item.pmcid);
    const doi = stringOrNull(item.doi);
    return [{
      source:"Europe PMC",sourceId,sourceType,pmid,pmcid,doi,title,
      authors:stringOrNull(item.authorString),
      journal:stringOrNull(item.journalTitle),
      publicationYear:publicationYear(item.pubYear),
      abstract:stringOrNull(item.abstractText),
      url:`https://europepmc.org/article/${encodeURIComponent(sourceType)}/${encodeURIComponent(sourceId)}`,
      retrievedAt,verificationState:"metadata_retrieved_not_claim_verified",reviewState:"unreviewed",
    }];
  });
  const totalHits = typeof body.hitCount === "number" && Number.isFinite(body.hitCount) ? body.hitCount : 0;
  const nextCursorMark = stringOrNull(body.nextCursorMark);
  return {query,totalHits,nextCursorMark:nextCursorMark===cursor?null:nextCursorMark,records,retrievedAt};
}
