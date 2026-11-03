/** Browser/server shared validation. Hash verification is supplied by each runtime. */
export type SourceMetadata = { title: string; doi: string | null; publishedAt: string | null; licence: string | null; retractionStatus: "retracted" | "corrected" | "not_checked" };
export type SourceRevision = { id: string; provider: "manual_metadata" | "europe_pmc"; retrievedAt: string; metadata: SourceMetadata };
export type RegistrySource = { id: string; pmid: string; claimIds: string[]; revisions: SourceRevision[] };
export type SourceRegistry = { schemaVersion: "hsi-source-registry-1"; notCds: true; containsPhi: false; claimSupport: "not_assessed"; sources: RegistrySource[] };

export function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected an object");
  return value as Record<string, unknown>;
}
function keys(row: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(row).some((key) => !allowed.includes(key))) throw new Error("Unknown field in public source metadata");
}
function text(value: unknown, nullable = false): string | null {
  if (nullable && value === null) return null;
  if (typeof value !== "string" || !value.trim() || value.length > 4000) throw new Error("Invalid metadata text");
  return value.trim();
}
function validDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function parseTimestamp(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !validDate(value.slice(0, 10)) || !Number.isFinite(Date.parse(value))) throw new Error("Invalid retrieval timestamp");
  return value;
}
export function parseSourceMetadata(value: unknown): SourceMetadata {
  const row = asRecord(value);
  keys(row, ["title", "doi", "publishedAt", "licence", "retractionStatus"]);
  const doi = text(row.doi, true);
  if (doi && !/^10\.\d{4,9}\/\S+$/.test(doi)) throw new Error("Invalid DOI");
  const publishedAt = text(row.publishedAt, true);
  if (publishedAt && !validDate(publishedAt)) throw new Error("Invalid publication date");
  if (!["retracted", "corrected", "not_checked"].includes(String(row.retractionStatus))) throw new Error("Explicit retraction status is required");
  return { title: text(row.title)!, doi, publishedAt, licence: text(row.licence, true), retractionStatus: row.retractionStatus as SourceMetadata["retractionStatus"] };
}
export function revisionPayload(revision: Pick<SourceRevision, "provider" | "metadata">): string {
  return JSON.stringify({ provider: revision.provider, metadata: revision.metadata });
}
export function parseSourceRegistryStructure(value: unknown): SourceRegistry {
  const root = asRecord(value);
  keys(root, ["schemaVersion", "notCds", "containsPhi", "claimSupport", "sources"]);
  if (root.schemaVersion !== "hsi-source-registry-1" || root.notCds !== true || root.containsPhi !== false || root.claimSupport !== "not_assessed" || !Array.isArray(root.sources) || root.sources.length > 5000) throw new Error("Invalid source registry envelope");
  const seen = new Set<string>();
  let revisions = 0;
  const sources = root.sources.map((raw): RegistrySource => {
    const source = asRecord(raw);
    keys(source, ["id", "pmid", "claimIds", "revisions"]);
    if (typeof source.pmid !== "string" || !/^\d{1,9}$/.test(source.pmid) || source.id !== `pmid:${source.pmid}` || seen.has(source.pmid)) throw new Error("Invalid or duplicate source identity");
    seen.add(source.pmid);
    if (!Array.isArray(source.claimIds) || source.claimIds.length > 5000 || source.claimIds.some((id) => typeof id !== "string" || !/^HSI-C-[A-Z0-9-]+$/.test(id)) || new Set(source.claimIds).size !== source.claimIds.length || !Array.isArray(source.revisions) || source.revisions.length > 1000) throw new Error("Invalid source links or revisions");
    let previous = -Infinity;
    const history = source.revisions.map((rawRevision): SourceRevision => {
      if (++revisions > 10000) throw new Error("Registry revision limit exceeded");
      const revision = asRecord(rawRevision);
      keys(revision, ["id", "provider", "retrievedAt", "metadata"]);
      if (typeof revision.id !== "string" || !/^[a-f0-9]{64}$/.test(revision.id) || (revision.provider !== "manual_metadata" && revision.provider !== "europe_pmc")) throw new Error("Invalid source revision");
      const retrievedAt = parseTimestamp(revision.retrievedAt);
      if (Date.parse(retrievedAt) < previous) throw new Error("Source history must be chronological");
      previous = Date.parse(retrievedAt);
      return { id: revision.id, provider: revision.provider, retrievedAt, metadata: parseSourceMetadata(revision.metadata) };
    });
    return { id: source.id as string, pmid: source.pmid, claimIds: [...source.claimIds] as string[], revisions: history };
  });
  return { schemaVersion: "hsi-source-registry-1", notCds: true, containsPhi: false, claimSupport: "not_assessed", sources };
}
