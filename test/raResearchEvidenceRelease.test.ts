import { test, expect } from "bun:test";
import { readFileSync } from "node:fs";
import {
  RA_RESEARCH_RELEASE_ID,
  RA_RESEARCH_SOURCE_IDS,
  RA_RESEARCH_MIRROR_OF,
  parseRaResearchEvidenceRelease,
  buildRaResearchEvidenceBundle,
  raResearchEvidenceReadiness,
  raResearchEvidenceReleaseListing,
} from "../src/raResearchEvidenceRelease";
import { createCorpusRetrievalProvider, createInvestigationService, createMemoryInvestigationStore } from "../src/investigationService";
import { raEvidenceReadiness } from "../src/raEvidenceRelease";
import pending from "../research/ra-anti-tnf/release.json";
import research from "../research/ra-anti-tnf-research/release.json";

test("committed research release is available and clearly non-scientific", () => {
  const readiness = raResearchEvidenceReadiness(research);
  expect(readiness.available).toBe(true);
  expect(readiness.notForScientificClaim).toBe(true);
  expect(readiness.corpusKind).toBe("research_working_set");
  const release = parseRaResearchEvidenceRelease(research);
  expect(release.releaseId).toBe(RA_RESEARCH_RELEASE_ID);
  expect(release.sources.map((s) => s.id)).toEqual([...RA_RESEARCH_SOURCE_IDS]);
  expect(release.sources.every((s) => s.pmid === null && s.kind === "synthetic_fixture")).toBe(true);
  expect(release.honesty.some((line) => line.includes("18375541"))).toBe(true);
  expect(raResearchEvidenceReleaseListing(research).title).toBe("RA / anti-TNF research corpus");
  expect(raResearchEvidenceReleaseListing(research).title).not.toMatch(/demo/i);
});

test("pending real release stays unavailable beside the research corpus", () => {
  expect(raEvidenceReadiness(pending).available).toBe(false);
  expect(raResearchEvidenceReadiness(research).available).toBe(true);
});

test("research bundle retrieves passages without inventing claims or real PMID locators", async () => {
  const bundle = buildRaResearchEvidenceBundle(research);
  expect(bundle.context.dataClass).toBe("synthetic");
  expect(bundle.passages.length).toBeGreaterThanOrEqual(2);
  expect(bundle.claims).toHaveLength(0);
  expect(bundle.relationships.map((r) => r.id).sort()).toEqual(Object.keys(RA_RESEARCH_MIRROR_OF).filter((k) => k.startsWith("SYN-REL")).sort());
  const token = Symbol("research");
  const service = createInvestigationService({
    store: createMemoryInvestigationStore(),
    providers: { retrieval: createCorpusRetrievalProvider() },
    authorize: async (credential) => {
      if (credential !== token) throw new Error("denied");
      return { id: "research-reviewer", role: "reviewer" };
    },
  });
  const started = await service.start("research-working-set-run", bundle, token);
  expect(started.payloads.retrieval!.passageIds.length).toBeGreaterThanOrEqual(2);
  expect(started.bundle.sources.every((s) => s.dataClass === "synthetic")).toBe(true);
});

test("research README and worksheet templates stay honest", () => {
  const readme = readFileSync("research/ra-anti-tnf-research/README.md", "utf8");
  expect(readme).toContain("notForScientificClaim");
  expect(readme).toContain("awaiting_verified_source_import");
  expect(readme).not.toMatch(/licence-cleared real PMID/i);
  expect(readme).not.toMatch(/\bDEMO\b/);
  const worksheet = JSON.parse(readFileSync("research/ra-anti-tnf/context-annotation-worksheet-v1.json", "utf8"));
  expect(worksheet.rows).toEqual([]);
  expect(worksheet.status).toBe("template_only_no_expert_labels");
});
