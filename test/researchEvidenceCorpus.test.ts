import {test,expect} from "bun:test";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {buildResearchEvidenceCorpus,buildEvidenceReviewPacket,CORPUS_INPUT_PATHS} from "../src/evidence/buildResearchEvidenceCorpus";
import {canonicalEvidenceJson,parseResearchEvidenceCorpus,verifyResearchEvidenceCorpus,assessWorkingEvidence} from "../src/evidence/researchEvidenceCorpus";
const read=(p:string)=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const inputs=()=>({ra:read(CORPUS_INPUT_PATHS.ra),ssc:read(CORPUS_INPUT_PATHS.ssc),verification:read(CORPUS_INPUT_PATHS.verification)});
const digest=async(text:string)=>createHash("sha256").update(text).digest("hex");
test("bounded corpus preserves real import passages and distinguishes unresolved SSc locators",async()=>{
 const corpus=buildResearchEvidenceCorpus(inputs());expect((await verifyResearchEvidenceCorpus(corpus,digest)).version).toBe(corpus.version);
 const report=assessWorkingEvidence(corpus);expect(report.counts).toEqual({sources:5,claims:7,textPassages:8,locatorOnly:5,eligibleClaims:0});
 for(const c of corpus.claims){expect(corpus.sources.find(s=>s.id===c.sourceId)?.disease).toBe(c.disease);expect(c.status).toBe("unreviewed_candidate");}
 for(const p of corpus.passages.filter(p=>p.sourceId.startsWith("pmid:3")||p.sourceId==="pmid:29514998")){expect(p.text).toBeNull();expect(p.sha256).toBeNull();expect(p.sourceVersion).toBeNull()}
 for(const s of corpus.sources.filter(s=>s.disease==="systemic_sclerosis")){expect(s.identityStatus).toBe("repository_metadata_unverified");expect(s.rights.licenceUrl).toBeNull();expect(s.retrievedAt).toBeNull()}
});
test("RA candidate assertions quote the imported Results rather than inventing graph support",()=>{
 const corpus=buildResearchEvidenceCorpus(inputs());const original=inputs().ra;
 for(const c of corpus.claims.filter(c=>c.disease==="rheumatoid_arthritis")){
  const p=original.passages.find((p:{id:string})=>p.id===c.passageIds[0]);expect(c.assertion).toBe(p.text);expect(c.passageIds).toHaveLength(2);
 }
 expect(corpus.claims.find(c=>c.id.endsWith("META-RESULTS"))!.context.assay).toBeNull();
});
test("import receipts never satisfy human rights, correction or scientific review",()=>{
 const report=assessWorkingEvidence(buildResearchEvidenceCorpus(inputs()));
 expect(report.status).toBe("blocked_pending_human_review");expect(report.graphPromotable).toBe(false);
 for(const c of report.claims){expect(c.releaseEligible).toBe(false);expect(c.reasons).toContain("human_rights_clearance_required");expect(c.reasons).toContain("current_correction_check_required");expect(c.reasons).toContain("independent_scientific_review_required")}
 for(const c of report.claims.filter(c=>c.disease==="systemic_sclerosis")){expect(c.reasons).toContain("licence_evidence_missing");expect(c.reasons).toContain("supporting_passage_not_available")}
});
test("metadata and context changes produce a new content-addressed corpus without approval",()=>{
 const first=buildResearchEvidenceCorpus(inputs()),next=inputs();next.ssc.claims[0].limitations+=" Additional source review needed.";
 const second=buildResearchEvidenceCorpus(next);expect(first.version).not.toBe(second.version);expect(second.graphPromotable).toBe(false);
 expect(buildResearchEvidenceCorpus(inputs())).toEqual(first);
 const changed=inputs();changed.ssc.claims[0].context="Population and assay require extraction";
 const updated=buildResearchEvidenceCorpus(changed).claims.find(c=>c.id==="HSI-C-SSC-001")!;expect(updated.context.population).toBeNull();expect(updated.context.assay).toBeNull();
});
test("corpus and passage hashes fail closed on tampering, even when outer hash is recomputed",async()=>{
 const corpus=buildResearchEvidenceCorpus(inputs());corpus.passages[0]!.text+=" forged addition";
 await expect(verifyResearchEvidenceCorpus(corpus,digest)).rejects.toThrow();
 const {version,...body}=corpus;corpus.version=await digest(canonicalEvidenceJson(body));
 await expect(verifyResearchEvidenceCorpus(corpus,digest)).rejects.toThrow();
});
test("duplicate identifiers, dangling passage joins and cross-disease source transfer are rejected",()=>{
 const variants=[(c:ReturnType<typeof buildResearchEvidenceCorpus>)=>{c.sources.push(c.sources[0]!)},(c:ReturnType<typeof buildResearchEvidenceCorpus>)=>{c.claims[0]!.passageIds=["missing"]},(c:ReturnType<typeof buildResearchEvidenceCorpus>)=>{c.claims[0]!.sourceId="pmid:30760472"},(c:ReturnType<typeof buildResearchEvidenceCorpus>)=>{c.claims[0]!.disease="systemic_sclerosis"}];
 for(const mutate of variants){const corpus=buildResearchEvidenceCorpus(inputs());mutate(corpus);expect(()=>parseResearchEvidenceCorpus(corpus)).toThrow()}
});
test("self-declared approvals and reclassified source rights cannot be smuggled into the contract",()=>{
 const corpus=buildResearchEvidenceCorpus(inputs());
 expect(()=>parseResearchEvidenceCorpus({...corpus,graphPromotable:true})).toThrow();
 expect(()=>parseResearchEvidenceCorpus({...corpus,rightsCleared:true})).toThrow();
 const upgraded=structuredClone(corpus);Object.assign(upgraded.sources[0]!.rights,{status:"human_cleared",reviewer:"self"});expect(()=>parseResearchEvidenceCorpus(upgraded)).toThrow();
 const fabricated=structuredClone(corpus);const locator=fabricated.passages.find(p=>p.text===null)!;Object.assign(locator,{text:"Uncleared abstract content",sha256:"a".repeat(64)});expect(()=>parseResearchEvidenceCorpus(fabricated)).toThrow();
 const identifying=structuredClone(corpus);identifying.claims[0]!.context.notes="Patient name and NHS number are included here";expect(()=>parseResearchEvidenceCorpus(identifying)).toThrow();
});
test("SSc source mismatch and invalid RA receipts stop catalogue generation",()=>{
 const wrong=inputs();wrong.ssc.claims[0].doi="10.1234/unrelated";expect(()=>buildResearchEvidenceCorpus(wrong)).toThrow("identity mismatch");
 const fixture=inputs();fixture.ra.sources[0].dataClass="synthetic";expect(()=>buildResearchEvidenceCorpus(fixture)).toThrow();
});
test("review preparation is version-bound, unassigned and cannot grant authority",()=>{
 const corpus=buildResearchEvidenceCorpus(inputs()),packet=buildEvidenceReviewPacket(corpus);
 expect(packet.corpusVersion).toBe(corpus.version);expect(packet.grantsAuthority).toBe(false);expect(packet.publishesGraph).toBe(false);
 expect(packet.sources).toHaveLength(5);expect(packet.claims).toHaveLength(7);
 for(const s of packet.sources){expect(s.rights.assignedPrincipal).toBeNull();expect(s.rights.decision).toBeNull();expect(s.integrity.checkedAt).toBeNull()}
 for(const c of packet.claims){expect(c.recordId).toBeNull();expect(c.decision).toBeNull();expect(c.evidenceReviewed).toEqual([])}
});
test("committed public copies and readiness/packet are reproducible from the canonical inputs",()=>{
 const corpus=buildResearchEvidenceCorpus(inputs());
 for(const dir of ["research/evidence-corpus","site/public/research/evidence-corpus"]){
  expect(read(dir+"/corpus.v1.json")).toEqual(corpus);expect(read(dir+"/readiness.v1.json")).toEqual(assessWorkingEvidence(corpus));expect(read(dir+"/review-packet.v1.json")).toEqual(buildEvidenceReviewPacket(corpus));
 }
});
