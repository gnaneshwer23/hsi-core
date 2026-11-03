import { test, expect } from "bun:test";
import { readFileSync } from "node:fs";
import {
  RA_DEMO_RELEASE_ID,
  RA_DEMO_SOURCE_IDS,
  parseRaDemoEvidenceRelease,
  buildRaDemoEvidenceBundle,
  raDemoEvidenceReleaseListing,
} from "../src/raDemoEvidenceRelease";
import { RA_RELEASE_ID, raEvidenceReleaseListing, RaEvidenceUnavailableError } from "../src/raEvidenceRelease";
import pending from "../research/ra-anti-tnf/release.json";
import { createInvestigationService, createCorpusRetrievalProvider, createMemoryInvestigationStore } from "../src/investigationService";
import { investigationError } from "../src/investigationBackend";

const demoRelease = JSON.parse(readFileSync("research/ra-anti-tnf-demo/release.json", "utf8"));

test("demo listing is available and distinct from the rights-verified release id", () => {
  const listing = raDemoEvidenceReleaseListing(demoRelease);
  expect(listing.id).toBe(RA_DEMO_RELEASE_ID);
  expect(listing.id).not.toBe(RA_RELEASE_ID);
  expect(listing.readiness.available).toBe(true);
  expect(listing.description).toContain("not_for_scientific_claim");
  expect(raEvidenceReleaseListing(pending).readiness.available).toBe(false);
});

test("demo bundle uses synthetic fixtures only — no PMID/DOI/URL, no claims", () => {
  const release = parseRaDemoEvidenceRelease(demoRelease);
  expect(release.notForScientificClaim).toBe(true);
  expect(release.corpusKind).toBe("demo_fixture");
  const bundle = buildRaDemoEvidenceBundle(demoRelease);
  expect(bundle.sources).toHaveLength(2);
  expect(bundle.passages.length).toBeGreaterThanOrEqual(2);
  expect(bundle.claims).toHaveLength(0);
  expect(bundle.containsPhi).toBe(false);
  expect(bundle.clinicalAdvice).toBe(false);
  expect(bundle.kgWrite).toBe(false);
  expect(bundle.context.dataClass).toBe("synthetic");
  for (const source of bundle.sources) {
    expect(source.kind).toBe("synthetic_fixture");
    expect(source.dataClass).toBe("synthetic");
    expect(source.pmid).toBeNull();
    expect(source.doi).toBeNull();
    expect(source.url).toBeNull();
    expect(RA_DEMO_SOURCE_IDS.includes(source.id as (typeof RA_DEMO_SOURCE_IDS)[number])).toBe(true);
  }
});

test("demo investigation start retrieves fixture passages while pending release still maps to evidence_not_ready", async () => {
  const token = Symbol("demo");
  const service = createInvestigationService({
    store: createMemoryInvestigationStore(),
    providers: { retrieval: createCorpusRetrievalProvider() },
    authorize: async (credential) => {
      if (credential !== token) throw new Error("denied");
      return { id: "demo-reviewer", role: "reviewer" };
    },
  });
  const bundle = buildRaDemoEvidenceBundle(demoRelease);
  const result = await service.start("demo-ra-workflow", bundle, token);
  expect(result.payloads.retrieval!.passageIds.length).toBeGreaterThanOrEqual(2);
  expect(result.payloads.hypothesis!.candidates).toHaveLength(0);
  const response = investigationError(new RaEvidenceUnavailableError());
  expect(response.status).toBe(422);
});
