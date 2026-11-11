import {describe, expect, test} from "bun:test";
import {reactomePathwayDraftNode, resolveReactomePathwayDraft} from "../src/evidence/reactomeOntologyBridge";
import {validateHsiGraphNode} from "../src/livingHealthKnowledgeGraph";
import type {ReactomePathwayMetadata} from "../src/evidence/reactomePathwayLookup";

const pathway: ReactomePathwayMetadata = {
  provider:"reactome", stableId:"R-HSA-199420", displayName:"Apoptosis",
  speciesName:"Homo sapiens", url:"https://reactome.org/content/detail/R-HSA-199420",
  retrievedAt:"2026-11-10T00:00:00.000Z",
  verificationState:"metadata_retrieved_not_claim_verified", reviewState:"unreviewed",
  scientificApproval:false, graphPromotable:false, claimSupport:false,
};

describe("Reactome draft ontology bridge", () => {
  test("creates valid governed draft with unreviewed identifier", () => {
    const node = reactomePathwayDraftNode(pathway);
    expect(() => validateHsiGraphNode(node)).not.toThrow();
    expect(node.reviewState).toBe("draft");
    expect(node.visibility).toBe("governed_research");
    expect(node.sourceIdentifiers[0]?.mapping).toBe("unreviewed");
  });
  test("does not invent reviewed identity or persist graph", () => {
    const result = resolveReactomePathwayDraft(pathway, []);
    expect(result.resolution.status).toBe("unresolved");
    expect(result.needsHumanReview).toBe(true);
    expect(result.graphPromotable).toBe(false);
  });
});
