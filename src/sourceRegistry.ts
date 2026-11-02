import { createHash } from "node:crypto";
import type { HsiEdge } from "./schema";
import { asRecord as record, parseSourceMetadata, parseSourceRegistryStructure, parseTimestamp, revisionPayload } from "./sourceRegistrySchema";

import type { SourceRegistry, RegistrySource } from "./sourceRegistrySchema";
export type { SourceMetadata, SourceRevision, RegistrySource, SourceRegistry } from "./sourceRegistrySchema";

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

export function importSourceMetadata(registry: SourceRegistry, input: unknown) {
  const envelope = record(input);
  if (Object.keys(envelope).some((key) => !["schemaVersion", "provider", "retrievedAt", "records"].includes(key))) throw new Error("Unknown import field");
  if (envelope.schemaVersion !== "hsi-source-metadata-import-1") throw new Error("Unsupported source import version");
  if (envelope.provider !== "manual_metadata" && envelope.provider !== "europe_pmc") throw new Error("Unsupported provider");
  const provider = envelope.provider;
  const retrievedAt = parseTimestamp(envelope.retrievedAt);
  if (!Array.isArray(envelope.records) || envelope.records.length > 5000) throw new Error("Expected at most 5000 metadata records");
  const next = parseSourceRegistry(registry);
  const seen = new Set<string>();
  const quarantined: { index: number; reason: string }[] = [];
  let added = 0;
  let unchanged = 0;
  envelope.records.forEach((raw, index) => {
    try {
      const row = record(raw);
      if (Object.keys(row).some((key) => !["pmid", "title", "doi", "publishedAt", "licence", "retractionStatus"].includes(key))) throw new Error("Unknown metadata field; public metadata only");
      if (typeof row.pmid !== "string" || !/^\d{1,9}$/.test(row.pmid)) throw new Error("Invalid PMID");
      if (seen.has(row.pmid)) throw new Error("Duplicate PMID in import batch");
      seen.add(row.pmid);
      const source = next.sources.find((item) => item.pmid === row.pmid);
      if (!source) throw new Error("PMID is outside the registered seed corpus");
      const { pmid: _pmid, ...fields } = row;
      const metadata = parseSourceMetadata(fields);
      const id = createHash("sha256").update(revisionPayload({ provider, metadata })).digest("hex");
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
  const registry = parseSourceRegistryStructure(value);
  for (const source of registry.sources) {
    for (const revision of source.revisions) {
      const expected = createHash("sha256").update(revisionPayload(revision)).digest("hex");
      if (expected !== revision.id) throw new Error("Invalid source revision or content hash");
    }
  }
  return registry;
}
