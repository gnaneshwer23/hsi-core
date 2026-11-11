import {expect,it} from "bun:test";
import {prepareContradictionSnapshot,validateIndependentContradictionReview} from "../src/db/scientificContradictionLedger";
import type {MechanismEvidenceLead} from "../src/evidence/contextualMechanismComparison";
const mk=(id:string):MechanismEvidenceLead=>({id,sourceReference:id,proteinAccession:"P1",
 pathwayStableId:"R1",direction:"supports",context:{disease:"RA",tissue:"blood",cellType:"Tfh",
 species:"human",experimentalSystem:"flow cytometry",intervention:"none",endpoint:"abundance"},
 sourceVerified:false,scientificApproval:false});
const inp=(id:string)=>({kind:"mechanism" as const,lead:mk(id),
 proof:{sourceId:id,sourceUrl:"https://example.org/"+id,sourceLocator:"Methods",
 evidenceRecordIds:[id],submitterId:"author"}});
it("prepares non-promotable cross-disease-neutral snapshot with provenance",()=>{
 const s=prepareContradictionSnapshot({id:"d1",tenantId:"research-a",submittedBy:"author",
  left:inp("paper-a"),right:inp("paper-b")});
 expect(s.classification).toBe("cannot_compare");
 expect(s.sourceEvidenceIds).toEqual(["paper-a","paper-b"]);
 expect(s.scientificConclusion).toBe(false);
 expect(s.reviewStatus).toBe("pending");
});
it("rejects self review",()=>{
 expect(()=>validateIndependentContradictionReview({submittedBy:"a",reviewerPrincipal:"a",
 decision:"approved",rationale:"reason",sourceLocator:"Methods"})).toThrow();
});
it("rejects identity mismatches",()=>{
 expect(()=>prepareContradictionSnapshot({id:"d1",tenantId:"research-a",submittedBy:"other",
 left:inp("paper-a"),right:inp("paper-b")})).toThrow();
});
