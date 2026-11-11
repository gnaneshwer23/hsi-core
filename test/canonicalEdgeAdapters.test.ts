import {describe,expect,it} from "bun:test";
import {fromMechanismLead,fromContextualCandidate,fromTypedGraphEdge} from "../src/evidence/canonicalEdgeAdapters";
import {compareCanonicalEdges,REQUIRED_CONTEXT} from "../src/evidence/canonicalContextualEdge";
const proof={sourceId:"pmid:example",sourceUrl:"https://example.org/article",sourceLocator:"Methods section",evidenceRecordIds:["evidence-1"],submitterId:"researcher-a"};
const lead=(id:string,direction:"supports"|"opposes"="supports")=>({
  id,sourceReference:proof.sourceId,proteinAccession:"P1",pathwayStableId:"R1",direction,
  context:{disease:"SSc",tissue:"blood",cellType:"Tfh",species:"human",
    experimentalSystem:"flow cytometry",intervention:"none",endpoint:"cTfh abundance"},
  sourceVerified:false as const,scientificApproval:false as const,
});
describe("P0.1.2 legacy adapters",()=>{
  it("mechanism leads preserve unknown gates, denominators, assays and timepoints",()=>{
    const a=fromMechanismLead(lead("ricard"),proof);
    expect(a.review.state).toBe("draft");
    for(const key of ["parentGate","denominator","assay","timepoint"] as const)
      expect(a.context[key].status).toBe("not_reported");
    expect(compareCanonicalEdges(a,fromMechanismLead(lead("ly","opposes"),proof)).classification).toBe("cannot_compare");
  });
  it("only source-located overrides can make fields reported",()=>{
    const overrides=Object.fromEntries(REQUIRED_CONTEXT.map(key=>[key,{value:"matched",locator:"Methods §1"}]));
    const a=fromMechanismLead(lead("a"),proof,overrides);
    const b=fromMechanismLead(lead("b","opposes"),proof,overrides);
    expect(compareCanonicalEdges(a,b).classification).toBe("candidate_conflict");
    expect(a.review.state).toBe("draft");
  });
  it("rejects unlinked mechanism sources",()=>{
    expect(()=>fromMechanismLead(lead("a"),{...proof,sourceId:"wrong"})).toThrow("source mismatch");
  });
  it("typed graph cannot inherit approval or invent direction",()=>{
    const edge={id:"g1",subjectId:"Tfh",predicate:"ASSOCIATED_WITH",objectId:"SSc",
      assertionType:"reported_association",context:{disease:"SSc"},reviewStatus:"approved",
      evidenceStatus:"supported",evidenceIds:["evidence-1"],version:"2"} as const;
    const source={id:"evidence-1",sourceType:"publication",sourceId:"pmid:example",url:proof.sourceUrl,
      retrievedAt:"2026-11-11",context:{disease:"SSc"},assessment:"supported"} as const;
    const a=fromTypedGraphEdge(edge as any,source as any,proof);
    expect(a.review.state).toBe("draft");
    expect(a.direction).toBe("inconclusive");
  });
  it("candidate metadata cannot become a supported mechanistic assertion",()=>{
    const candidate={id:"c1",subject:{value:"Tfh"},predicate:"ASSOCIATED_WITH",object:{value:"SSc"},
      evidenceSourceIds:[proof.sourceId]} as any;
    const a=fromContextualCandidate(candidate,proof);
    expect(a.direction).toBe("inconclusive");
    expect(a.review.state).toBe("draft");
    expect(a.context.denominator.status).toBe("not_reported");
  });
});
