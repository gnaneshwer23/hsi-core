import {describe, expect, test} from "bun:test";
import {reactomePathwayDraftNode, reactomeProteinPathwayDraftNodes, resolveReactomePathwayDraft} from "../src/evidence/reactomeOntologyBridge";
import {validateHsiGraphNode} from "../src/livingHealthKnowledgeGraph";
import type {ReactomePathwayMetadata, ReactomePathwaysForProtein} from "../src/evidence/reactomePathwayLookup";

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

describe("Reactome protein-pathway listing bridge", () => {
  const listing: ReactomePathwaysForProtein = {
    provider:"reactome", accession:"Q9HBE4", taxonId:9606,
    pathways:[pathway, {...pathway, stableId:"R-HSA-9020958", displayName:"Interleukin-21 signaling"}],
    truncated:false, retrievedAt:"2026-11-13T00:00:00.000Z",
    membershipInterpretation:"listed_by_provider_not_context_specific",
    reviewState:"unreviewed", graphPromotable:false, claimSupport:false,
  };
  test("maps every listed pathway to a valid draft node via the single-pathway mapper", () => {
    const nodes = reactomeProteinPathwayDraftNodes(listing);
    expect(nodes.map(n => n.id)).toEqual(["pathway.reactome.R-HSA-199420", "pathway.reactome.R-HSA-9020958"]);
    for (const node of nodes) { expect(() => validateHsiGraphNode(node)).not.toThrow(); expect(node.reviewState).toBe("draft"); }
  });
  test("refuses a listing that claims to be reviewed or promotable", () => {
    expect(() => reactomeProteinPathwayDraftNodes({...listing, graphPromotable:true as unknown as false})).toThrow();
    expect(() => reactomeProteinPathwayDraftNodes({...listing, reviewState:"approved" as unknown as "unreviewed"})).toThrow();
  });
});
