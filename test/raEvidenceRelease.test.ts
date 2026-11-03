import { test, expect } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { RA_SOURCE_IDENTITIES, RA_QUESTION, parseRaEvidenceRelease, raEvidenceReadiness, buildRaEvidenceBundle } from "../src/raEvidenceRelease";
import graph from "../research/ra-anti-tnf/graph-context.json";
import pending from "../research/ra-anti-tnf/release.json";
import { parseResearchBundle } from "../src/researchContracts";
import { createInvestigationService, createCorpusRetrievalProvider, createMemoryInvestigationStore } from "../src/investigationService";
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const canonical = (value: unknown) => JSON.stringify(value, (_key, row) => row && typeof row === "object" && !Array.isArray(row) ? Object.fromEntries(Object.entries(row).sort(([a],[b]) => a < b ? -1 : a > b ? 1 : 0)) : row);
function seal(value: any) { const { version: _, ...content } = value; value.version = digest(canonical(content)); return value; }
/** Structural fixture ONLY: registered real identifiers exercise joins; no actual article text, author or licence observation is asserted. Never exported to product data. */
function structureFixture() {
  const sources: any[] = [], passages: any[] = [], receipts: any[] = [], candidates: any[] = [];
  for (const identity of RA_SOURCE_IDENTITIES) {
    const sourceId = `PMID-${identity.pmid}`, text = "Fixture-only rheumatoid workflow text. Not a quotation or scientific finding.";
    const retrievedAt = "2026-11-03T00:00:00Z", xmlHash = digest(`TEST-XML-${identity.pmid}`);
    const query = new URLSearchParams({ query: `EXT_ID:${identity.pmid} AND SRC:MED`, format: "json", resultType: "core", pageSize: "2" });
    const metadataUrl = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?${query}`, xmlUrl = `https://www.ebi.ac.uk/europepmc/webservices/rest/${identity.pmcid}/fullTextXML`;
    const proof = (url: string, sha256: string) => ({ url, responseUrl: url, status: 200, sha256, retrievedAt });
    const licenceUrl = "https://creativecommons.org/licenses/by/4.0/";
    sources.push({ id: sourceId, title: "Structural fixture author; not the publication's author — Structural contract fixture, not retrieved publication metadata", kind: "publication", dataClass: "public_real", pmid: identity.pmid, doi: identity.doi, url: `https://europepmc.org/articles/${identity.pmcid}`, licence: { status: "permitted", identifier: licenceUrl, passageUsePermitted: true }, provenance: { product: "hsi", datasetId: "ra-anti-tnf-source-release", version: xmlHash, retrievedAt } });
    passages.push({ id: `${sourceId}-ABSTRACT-1`, sourceId, sourceVersion: xmlHash, text, locator: "/article/front/article-meta/abstract[1]/p[1]; XML itertext with whitespace collapsed", dataClass: "public_real", sha256: digest(text) });
    receipts.push({ sourceId, pmcid: identity.pmcid, metadata: proof(metadataUrl, digest("TEST-METADATA")), articleXml: proof(xmlUrl, xmlHash), authors: ["Structural fixture author; not the publication's author"], articleTitle: "Structural contract fixture, not retrieved publication metadata", licenceUrl, licenceNotice: "Fixture only; not a recorded rights observation", normalization: "xml_itertext_whitespace_collapse" });
    candidates.push({ sourceId, passageIds: [`${sourceId}-ABSTRACT-1`], plannedRole: identity.role, studyDesign: "unassessed", claimSupport: "unassessed", scientificReview: "unreviewed", graphMapping: "related_context_only" });
  }
  return seal({ schemaVersion: "hsi-ra-evidence-release-1", protocolId: "ra-anti-tnf-response", protocolVersion: "1", question: RA_QUESTION, containsPhi: false, clinicalAdvice: false, kgWrite: false, scientificReview: "unreviewed", sources, passages, receipts, candidates });
}
test("committed RA release stays unavailable until primary-source import succeeds", () => {
  expect(raEvidenceReadiness(pending).available).toBe(false);
  expect(() => parseRaEvidenceRelease(pending)).toThrow();
  expect(() => buildRaEvidenceBundle(parseResearchBundle(graph), pending)).toThrow();
});
test("registered corpus retains both source roles and leaves scientific support unassessed", () => {
  const release = parseRaEvidenceRelease(structureFixture());
  expect(release.candidates.map((c) => c.plannedRole)).toEqual(["cohort_candidate", "meta_analysis_candidate"]);
  expect(release.candidates.every((c) => c.claimSupport === "unassessed" && c.graphMapping === "related_context_only")).toBe(true);
});
test("NC/unknown rights, altered passages and source-identity drift are rejected", () => {
  for (const change of [
    (r: any) => { r.sources[0].licence.identifier = "https://creativecommons.org/licenses/by-nc/4.0/"; },
    (r: any) => { r.sources[0].licence.status = "unknown"; },
    (r: any) => { r.passages[0].text = "tampered text"; },
    (r: any) => { r.receipts[0].pmcid = "PMC-WRONG"; },
    (r: any) => { r.sources[0].doi = "10.0000/wrong"; },
    (r: any) => { r.receipts[0].articleXml.responseUrl = "https://attacker.example/source"; },
    (r: any) => { r.receipts[0].licenceNotice = "Non-commercial use only"; },
  ]) { const r = structureFixture(); change(r); seal(r); expect(() => parseRaEvidenceRelease(r)).toThrow(); }
});
test("automatic promotion and unsupported study-design assertions are rejected", () => {
  for (const change of [
    (r: any) => { r.scientificReview = "approved"; }, (r: any) => { r.candidates[0].claimSupport = "supports"; },
    (r: any) => { r.candidates[1].studyDesign = "validated_meta_analysis"; },
    (r: any) => { r.candidates[0].graphMapping = "exact_relationship_support"; },
    (r: any) => { r.containsPhi = true; }, (r: any) => { r.candidates[0].passageIds = ["missing-passage"]; },
  ]) { const r = structureFixture(); change(r); seal(r); expect(() => parseRaEvidenceRelease(r)).toThrow(); }
});
test("release fingerprint binds every source, attribution and receipt", () => {
  const r = structureFixture(); r.receipts[0].authors = ["changed attribution"];
  expect(() => parseRaEvidenceRelease(r)).toThrow();
});
test("serology-response passages do not become graph claims about anti-TNF efficacy", async () => {
  const bundle = buildRaEvidenceBundle(parseResearchBundle(graph), structureFixture());
  expect(bundle.claims).toHaveLength(0);
  expect(bundle.relationships.map((r) => r.id)).toEqual(graph.relationships.map((r) => r.id));
  const token = Symbol("fixture"); const service = createInvestigationService({ store: createMemoryInvestigationStore(), providers: { retrieval: createCorpusRetrievalProvider() }, authorize: async (credential) => { if (credential !== token) throw new Error("denied"); return { id: "fixture-reviewer", role: "reviewer" }; } });
  const result = await service.start("contract-fixture-only", bundle, token);
  expect(result.payloads.retrieval!.passageIds).toHaveLength(2);
  expect(result.payloads.hypothesis!.candidates).toHaveLength(0);
  expect(result.payloads.contradictions!.groups.every((g) => !g.supportingClaimIds.length && !g.opposingClaimIds.length)).toBe(true);
});
test("the preregistered protocol is consistent with the implementation and source candidates", () => {
  const protocol = JSON.parse(readFileSync("research/ra-anti-tnf/protocol.json", "utf8"));
  expect(protocol.question).toBe(RA_QUESTION);
  expect(protocol.sources.map((s: any) => ({ pmid: s.pmid, pmcid: s.pmcid, doi: s.doi, role: s.role }))).toEqual([...RA_SOURCE_IDENTITIES]);
});
