import { describe, expect, test } from "bun:test";
import { buildImmuneMechanismDossier } from "../src/immuneMechanismInvestigation";
import { RESEARCH_CONTRACT_VERSION } from "../src/researchContracts";

const provenance = { product: "isi" as const, datasetId: "ssc-source", version: "1", retrievedAt: "2026-11-05T00:00:00Z" };
const fixture = {
  schemaVersion: RESEARCH_CONTRACT_VERSION, containsPhi: false, clinicalAdvice: false, kgWrite: false,
  context: { id: "ctx", question: "What is the evidence for macrophage TGF-beta signalling in SSc?", conceptIds: ["cell", "disease"], dataClass: "public_real", purpose: "research_only", containsPhi: false, provenance },
  sources: [{ id: "source", title: "Source-linked study", kind: "publication", dataClass: "public_real", pmid: "123", doi: null, url: "https://pubmed.ncbi.nlm.nih.gov/123/", licence: { status: "permitted", identifier: null, passageUsePermitted: true }, provenance }],
  passages: [{ id: "passage", sourceId: "source", sourceVersion: "1", text: "Study excerpt for a test fixture.", locator: "abstract", dataClass: "public_real", sha256: null }],
  entities: [
    { id: "cell", label: "Macrophage", type: "cell", dataClass: "public_real", provenance },
    { id: "disease", label: "Systemic sclerosis", type: "disease", dataClass: "public_real", provenance },
  ],
  relationships: [{ id: "rel", subjectId: "cell", predicate: "associated_with", objectId: "disease", dataClass: "public_real", context: { species: "human", experimentalSystem: "in_vitro", tissueId: null, assay: null, timepoint: null }, provenance }],
  claims: [{ id: "claim", statement: "A study reports an association.", relationshipId: "rel", passageIds: ["passage"], dataClass: "public_real", support: "unassessed", assessmentKind: "unassessed", curation: "unreviewed", review: null }],
  runs: [],
};
describe("P1.2 mechanism dossier", () => {
  test("preserves provenance and does not approve unreviewed evidence", () => {
    const result = buildImmuneMechanismDossier(fixture);
    expect(result.status).toBe("research_draft");
    expect(result.edges[0]?.evidenceStatus).toBe("unreviewed_or_insufficient");
    expect(result.edges[0]?.evidence[0]?.sources[0]?.pmid).toBe("123");
    expect(result.edges[0]?.context.species).toBe("human");
    expect(result.kgWrite).toBe(false);
  });
  test("rejects unknown relationship selection", () => {
    expect(() => buildImmuneMechanismDossier(fixture, ["not-present"])).toThrow();
  });
  test("rejects PHI and clinical advice", () => {
    expect(() => buildImmuneMechanismDossier({ ...fixture, containsPhi: true })).toThrow();
    expect(() => buildImmuneMechanismDossier({ ...fixture, clinicalAdvice: true })).toThrow();
  });
});
