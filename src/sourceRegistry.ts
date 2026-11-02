import { createHash } from "node:crypto";
import type { HsiEdge } from "./schema";

export type SourceMetadata = {
  title: string;
  doi: string | null;
  publishedAt: string | null;
  licence: string | null;
  retractionStatus: "retracted" | "corrected" | "not_checked";
};
export type SourceRevision = {
  id: string;
  provider: "manual_metadata" | "europe_pmc";
  retrievedAt: string;
  metadata: SourceMetadata;
};
export type RegistrySource = {
  id: string;
  pmid: string;
  claimIds: string[];
  revisions: SourceRevision[];
};
export type SourceRegistry = {
  schemaVersion: "hsi-source-registry-1";
  notCds: true;
  containsPhi: false;
  claimSupport: "not_assessed";
  sources: RegistrySource[];
};

/** Source existence, metadata retrieval and exact claim support are separate facts. */
export function createSourceRegistry(edges: readonly HsiEdge[]): SourceRegistry {
  const sources = new Map<string, RegistrySource>();
  for (const edge of edges) {
    const pmid = edge.provenance.pmid;
    if (!pmid || !/^\d{1,9}$/.test(pmid)) continue;
    const source = sources.get(pmid) ?? { id: `pmid:${pmid}`, pmid, claimIds: [], revisions: [] };
    if (!source.claimIds.includes(edge.claimId)) source.claimIds.push(edge.claimId);
    sources.set(pmid, source);
  }
  return { schemaVersion: "hsi-source-registry-1", notCds: true, containsPhi: false, claimSupport: "not_assessed", sources: [...sources.values()].sort((a, b) => a.pmid.localeCompare(b.pmid)) };
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected an object");
  return value as Record<string, unknown>;
}
function text(value: unknown, nullable = false): string | null {
  if (nullable && (value === null || value === undefined)) return null;
  if (typeof value !== "string" || !value.trim() || value.length > 4000) throw new Error("Invalid metadata text");
  return value.trim();
}
function timestamp(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(Date.parse(value))) throw new Error("Invalid retrieval timestamp");
  return value;
}

export function importSourceMetadata(registry: SourceRegistry, input: unknown) {
  const envelope = record(input);
  if (Object.keys(envelope).some((key) => !["schemaVersion", "provider", "retrievedAt", "records"].includes(key))) throw new Error("Unknown import field");
  if (envelope.schemaVersion !== "hsi-source-metadata-import-1") throw new Error("Unsupported source import version");
  if (envelope.provider !== "manual_metadata" && envelope.provider !== "europe_pmc") throw new Error("Unsupported provider");
  const provider = envelope.provider;
  const retrievedAt = timestamp(envelope.retrievedAt);
  if (!Array.isArray(envelope.records) || envelope.records.length > 5000) throw new Error("Expected at most 5000 metadata records");
  const next = structuredClone(registry);
  const quarantined: { index: number; reason: string }[] = [];
  let added = 0;
  let unchanged = 0;
  envelope.records.forEach((raw, index) => {
    try {
      const row = record(raw);
      if (Object.keys(row).some((key) => !["pmid", "title", "doi", "publishedAt", "licence", "retractionStatus"].includes(key))) throw new Error("Unknown metadata field; public metadata only");
      if (typeof row.pmid !== "string" || !/^\d{1,9}$/.test(row.pmid)) throw new Error("Invalid PMID");
      const source = next.sources.find((item) => item.pmid === row.pmid);
      if (!source) throw new Error("PMID is outside the registered seed corpus");
      const doi = text(row.doi, true);
      if (doi && !/^10\.\d{4,9}\/\S+$/.test(doi)) throw new Error("Invalid DOI");
      const publishedAt = text(row.publishedAt, true);
      if (publishedAt && (!/^\d{4}-\d{2}-\d{2}$/.test(publishedAt) || new Date(publishedAt).toISOString().slice(0, 10) !== publishedAt)) throw new Error("Invalid publication date");
      if (!["retracted", "corrected", "not_checked"].includes(String(row.retractionStatus))) throw new Error("Explicit retraction status is required; never assume a source is current");
      const metadata: SourceMetadata = { title: text(row.title)!, doi, publishedAt, licence: text(row.licence, true), retractionStatus: row.retractionStatus as SourceMetadata["retractionStatus"] };
      const id = createHash("sha256").update(JSON.stringify({ provider, metadata })).digest("hex");
      if (source.revisions.at(-1)?.id === id) { unchanged++; return; }
      const previous = source.revisions.at(-1);
      if (previous && Date.parse(retrievedAt) < Date.parse(previous.retrievedAt)) throw new Error("Stale metadata must not replace a newer source revision");
      source.revisions.push({ id, provider, retrievedAt, metadata });
      added++;
    } catch (error) {
      // Do not retain raw rejected content or potential identifiers in quarantine logs.
      quarantined.push({ index, reason: error instanceof Error ? error.message : "Invalid source metadata" });
    }
  });
  return { registry: next, added, unchanged, quarantined };
}

export function parseSourceRegistry(value: unknown): SourceRegistry {
  const root = record(value);
  if (Object.keys(root).some((key) => !["schemaVersion", "notCds", "containsPhi", "claimSupport", "sources"].includes(key))) throw new Error("Unknown registry field");
  if (root.schemaVersion !== "hsi-source-registry-1" || root.notCds !== true || root.containsPhi !== false || root.claimSupport !== "not_assessed" || !Array.isArray(root.sources)) throw new Error("Invalid source registry envelope");
  const seen = new Set<string>();
  for (const raw of root.sources) {
    const source = record(raw);
    if (Object.keys(source).some((key) => !["id", "pmid", "claimIds", "revisions"].includes(key))) throw new Error("Unknown source field");
    if (typeof source.pmid !== "string" || !/^\d{1,9}$/.test(source.pmid) || source.id !== `pmid:${source.pmid}` || seen.has(source.pmid)) throw new Error("Invalid or duplicate source identity");
    seen.add(source.pmid);
    if (!Array.isArray(source.claimIds) || source.claimIds.some((id) => typeof id !== "string" || !/^HSI-C-[A-Z0-9-]+$/.test(id)) || !Array.isArray(source.revisions)) throw new Error("Invalid source links or revisions");
    for (const rawRevision of source.revisions) {
      const revision = record(rawRevision);
      if (Object.keys(revision).some((key) => !["id", "provider", "retrievedAt", "metadata"].includes(key))) throw new Error("Unknown revision field");
      const check = importSourceMetadata({ schemaVersion: "hsi-source-registry-1", notCds: true, containsPhi: false, claimSupport: "not_assessed", sources: [{ id: source.id as string, pmid: source.pmid, claimIds: [], revisions: [] }] }, {
        schemaVersion: "hsi-source-metadata-import-1", provider: revision.provider, retrievedAt: revision.retrievedAt, records: [{ ...record(revision.metadata), pmid: source.pmid }],
      });
      if (check.quarantined.length || check.registry.sources[0]?.revisions[0]?.id !== revision.id) throw new Error("Invalid source revision or content hash");
    }
  }
  return structuredClone(root) as SourceRegistry;
}
