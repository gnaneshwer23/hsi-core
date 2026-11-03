import { test, expect } from "bun:test";
import { readFileSync } from "node:fs";
import {
  RA_DEMO_RELEASE_ID,
  RA_DEMO_SOURCE_IDS,
  RA_DEMO_MIRROR_OF,
  parseRaDemoEvidenceRelease,
  buildRaDemoEvidenceBundle,
  raDemoEvidenceReadiness,
  raDemoEvidenceReleaseListing,
} from "../src/raDemoEvidenceRelease";
import { createCorpusRetrievalProvider, createInvestigationService, createMemoryInvestigationStore } from "../src/investigationService";
import { raEvidenceReadiness } from "../src/raEvidenceRelease";
import pending from "../research/ra-anti-tnf/release.json";
import demo from "../research/ra-anti-tnf-demo/release.json";

test("committed demo release is available and clearly non-scientific", () => {
  const readiness = raDemoEvidenceReadiness(demo);
  expect(readiness.available).toBe(true);
  expect(readiness.notForScientificClaim).toBe(true);
  expect(readiness.corpusKind).toBe("demo_fixture");
  const release = parseRaDemoEvidenceRelease(demo);
  expect(release.releaseId).toBe(RA_DEMO_RELEASE_ID);
  expect(release.sources.map((s) => s.id)).toEqual([...RA_DEMO_SOURCE_IDS]);
  expect(release.sources.every((s) => s.pmid === null && s.kind === "synthetic_fixture")).toBe(true);
  expect(release.honesty.some((line) => line.includes("18375541"))).toBe(true);
  expect(raDemoEvidenceReleaseListing(demo).title).toContain("DEMO");
});

test("pending real release stays unavailable beside the demo corpus", () => {
  expect(raEvidenceReadiness(pending).available).toBe(false);
  expect(raDemoEvidenceReadiness(demo).available).toBe(true);
});

test("demo bundle retrieves passages without inventing claims or real PMID locators", async () => {
  const bundle = buildRaDemoEvidenceBundle(demo);
  expect(bundle.context.dataClass).toBe("synthetic");
  expect(bundle.passages.length).toBeGreaterThanOrEqual(2);
  expect(bundle.claims).toHaveLength(0);
  expect(bundle.relationships.map((r) => r.id).sort()).toEqual(Object.keys(RA_DEMO_MIRROR_OF).filter((k) => k.startsWith("SYN-REL")).sort());
  const token = Symbol("demo");
  const service = createInvestigationService({
    store: createMemoryInvestigationStore(),
    providers: { retrieval: createCorpusRetrievalProvider() },
    authorize: async (credential) => {
      if (credential !== token) throw new Error("denied");
      return { id: "demo-reviewer", role: "reviewer" };
    },
  });
  const started = await service.start("demo-fixture-run", bundle, token);
  expect(started.payloads.retrieval!.passageIds.length).toBeGreaterThanOrEqual(2);
  expect(started.bundle.sources.every((s) => s.dataClass === "synthetic")).toBe(true);
});

test("demo README and worksheet templates stay honest", () => {
  const readme = readFileSync("research/ra-anti-tnf-demo/README.md", "utf8");
  expect(readme).toContain("not_for_scientific_claim");
  expect(readme).toContain("awaiting_verified_source_import");
  expect(readme).not.toMatch(/licence-cleared real PMID/i);
  const worksheet = JSON.parse(readFileSync("research/ra-anti-tnf/context-annotation-worksheet-v1.json", "utf8"));
  expect(worksheet.rows).toEqual([]);
  expect(worksheet.status).toBe("template_only_no_expert_labels");
});
