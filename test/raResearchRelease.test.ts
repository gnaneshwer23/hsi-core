import { test, expect } from "bun:test";
import { readFileSync } from "node:fs";
import {
  RA_RESEARCH_RELEASE_ID,
  RA_RESEARCH_SOURCE_IDS,
  parseRaResearchEvidenceRelease,
  buildRaResearchEvidenceBundle,
  raResearchEvidenceReleaseListing,
} from "../src/raResearchEvidenceRelease";
import { RA_RELEASE_ID, raEvidenceReleaseListing, RaEvidenceUnavailableError } from "../src/raEvidenceRelease";
import pending from "../research/ra-anti-tnf/release.json";
import { createInvestigationService, createCorpusRetrievalProvider, createMemoryInvestigationStore } from "../src/investigationService";
import { investigationError } from "../src/investigationBackend";

const researchRelease = JSON.parse(readFileSync("research/ra-anti-tnf-research/release.json", "utf8"));

test("research listing is available and distinct from the rights-verified release id", () => {
  const listing = raResearchEvidenceReleaseListing(researchRelease);
  expect(listing.id).toBe(RA_RESEARCH_RELEASE_ID);
  expect(listing.id).not.toBe(RA_RELEASE_ID);
  expect(listing.readiness.available).toBe(true);
  expect(listing.description).toContain("unreviewed");
  expect(listing.description).not.toMatch(/demo|fixture|smoke/i);
  expect(raEvidenceReleaseListing(pending).readiness.available).toBe(false);
});

test("research bundle uses synthetic sources only — no PMID/DOI/URL, no claims", () => {
  const release = parseRaResearchEvidenceRelease(researchRelease);
  expect(release.notForScientificClaim).toBe(true);
  expect(release.corpusKind).toBe("research_working_set");
  const bundle = buildRaResearchEvidenceBundle(researchRelease);
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
    expect(RA_RESEARCH_SOURCE_IDS.includes(source.id as (typeof RA_RESEARCH_SOURCE_IDS)[number])).toBe(true);
  }
});

test("research investigation start retrieves passages while pending release still maps to evidence_not_ready", async () => {
  const token = Symbol("research");
  const service = createInvestigationService({
    store: createMemoryInvestigationStore(),
    providers: { retrieval: createCorpusRetrievalProvider() },
    authorize: async (credential) => {
      if (credential !== token) throw new Error("denied");
      return { id: "research-reviewer", role: "reviewer" };
    },
  });
  const bundle = buildRaResearchEvidenceBundle(researchRelease);
  const result = await service.start("research-ra-workflow", bundle, token);
  expect(result.payloads.retrieval!.passageIds.length).toBeGreaterThanOrEqual(2);
  expect(result.payloads.hypothesis!.candidates).toHaveLength(0);
  const response = investigationError(new RaEvidenceUnavailableError());
  expect(response.status).toBe(422);
});
