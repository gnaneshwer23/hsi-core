import {describe, expect, it} from "bun:test";
import {CANONICAL_EDGE_SCHEMA_VERSION, REQUIRED_CONTEXT, compareCanonicalEdges, validateCanonicalEdge, type CanonicalEvidenceEdge} from "../src/evidence/canonicalContextualEdge";

const context = () => Object.fromEntries(REQUIRED_CONTEXT.map(key => [key, {
  status: "reported", value: key + "-value", sourceLocator: "Methods §1",
}])) as CanonicalEvidenceEdge["context"];
function fixture(id: string, direction: CanonicalEvidenceEdge["direction"] = "supports"): CanonicalEvidenceEdge {
  return {
    schemaVersion: CANONICAL_EDGE_SCHEMA_VERSION, id, subjectId: "Tfh", predicate: "ASSOCIATED_WITH", objectId: "SSc",
    direction, context: context(), submitterId: "researcher-a", synthetic: true, limitations: [],
    provenance: {sourceId: "synthetic-" + id, sourceUrl: "https://example.org/fixture",
      sourceLocator: "fixture:1", evidenceRecordIds: ["fixture-record"], extractionMethod: "synthetic"},
    review: {state: "draft"},
  };
}
describe("P0.1 canonical evidence edge", () => {
  it("keeps fully contextual synthetic draft valid without scientific approval", () => {
    expect(validateCanonicalEdge(fixture("a"))).toEqual([]);
  });
  it("does not treat an absent denominator as agreement", () => {
    const a = fixture("a"), b = fixture("b", "opposes");
    b.context.denominator = {status: "not_reported", value: null};
    expect(compareCanonicalEdges(a,b).classification).toBe("cannot_compare");
    expect(compareCanonicalEdges(a,b).missing).toContain("denominator");
  });
  it("detects parent gate divergence before claiming conflict", () => {
    const a = fixture("a"), b = fixture("b", "opposes");
    b.context.parentGate = {status:"reported",value:"CD4+CXCR5+",sourceLocator:"Methods §2"};
    expect(compareCanonicalEdges(a,b).classification).toBe("context_explained_divergence");
    expect(compareCanonicalEdges(a,b).mismatched).toContain("parentGate");
  });
  it("identifies only a candidate conflict when full context matches", () => {
    expect(compareCanonicalEdges(fixture("a"),fixture("b","opposes")).classification).toBe("candidate_conflict");
  });
  it("blocks synthetic approval and same-submitter reviewer", () => {
    const a = fixture("a");
    a.review = {state:"approved",reviewerId:"researcher-a",reviewedAt:"2026-11-11T00:00:00Z",independentOfSubmitter:true};
    const errors = validateCanonicalEdge(a);
    expect(errors).toContain("synthetic_cannot_approve");
    expect(errors).toContain("independent_review_required");
  });
  it("blocks approval with missing context even if independent reviewer exists", () => {
    const a = fixture("a");
    a.synthetic = false;
    a.provenance.extractionMethod = "human";
    a.context.timepoint = {status:"not_reported",value:null};
    a.review = {state:"approved",reviewerId:"reviewer-b",reviewedAt:"2026-11-11T00:00:00Z",independentOfSubmitter:true};
    expect(validateCanonicalEdge(a)).toContain("approval_missing_context.timepoint");
  });
});
