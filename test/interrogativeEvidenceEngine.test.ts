import {test,expect} from "bun:test";
import {planSscInterrogation} from "../src/interrogativeQuestionEngine";
import {interrogatePublishedSscEvidence} from "../src/interrogativeEvidenceEngine";
import {createCandidateManifest,type ReleaseClaim,type PublishedReleaseSnapshot} from "../src/graphRelease";
const claim:ReleaseClaim={id:"ssc-c1",subjectId:"cell:fibroblast",predicate:"associated_with",objectId:"disease:ssc",assertion:"A curated association statement",epistemicType:"observational_association",biologicalContext:{tissue:"skin"},status:"approved",sources:[{id:"pmid:example",licenceStatus:"metadata_only",retractionStatus:"none_reported",polarity:"supports",sourceVersion:"v1"}],reviews:[{id:"review-1",claimId:"ssc-c1",decision:"approve",reviewerPrincipal:"reviewer-1",reviewerAuthorised:true,reviewedAt:"2026-11-04T10:00:00Z"}]};
const candidate=createCandidateManifest("HSI-GR-SSC","1.0.0",[claim],"2026-11-04T11:00:00Z");
const snapshot:PublishedReleaseSnapshot={manifest:{...candidate,status:"published"},claims:[claim]};
const plan=planSscInterrogation({question:"Which SSc mechanisms should be investigated?",actorPrincipal:"researcher",createdAt:"2026-11-04T12:00:00Z",dataClass:"public_biomedical",focus:"systemic_sclerosis",release:{id:candidate.releaseId,version:candidate.releaseVersion,manifestHash:candidate.manifestHash}});
const branch=plan.branches[0]!;
test("explicit graph binding retrieves provenance but never asserts causality",()=>{
 const output=interrogatePublishedSscEvidence({plan,snapshot,bindings:[{branchId:branch.id,subjectIds:["cell:fibroblast"],objectIds:["disease:ssc"],predicates:["associated_with"],context:{tissue:"skin"}}]});
 expect(output.branches[0]?.supporting[0]?.claimId).toBe("ssc-c1");
 expect(output.branches[0]?.supporting[0]?.sourceIds).toEqual(["pmid:example"]);
 expect(output.branches[0]?.assessment).toBe("insufficient_evidence");
 expect(output.review).toBeNull();expect(output.provenance.retrievalIds.length).toBe(1);
});
test("unbound branch stays evidence-free",()=>{
 const output=interrogatePublishedSscEvidence({plan,snapshot,bindings:[]});
 expect(output.branches.every(b=>b.supporting.length===0)).toBe(true);
});
test("release mismatch and invented entity bindings fail closed",()=>{
 expect(()=>interrogatePublishedSscEvidence({plan,snapshot:{...snapshot,manifest:{...snapshot.manifest,manifestHash:"b".repeat(64)}},bindings:[]})).toThrow("release mismatch");
 const output=interrogatePublishedSscEvidence({plan,snapshot,bindings:[{branchId:branch.id,subjectIds:["cell:unknown"],objectIds:[],predicates:[],context:{}}]});
 expect(output.branches[0]?.supporting.length).toBe(0);
});
test("missing graph entity binding is rejected",()=>{
 expect(()=>interrogatePublishedSscEvidence({plan,snapshot,bindings:[{branchId:branch.id,subjectIds:[],objectIds:[],predicates:[],context:{}}]})).toThrow("explicit graph entity");
});
