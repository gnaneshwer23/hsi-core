import {test,expect} from "bun:test";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import corpus from "../research/coverage/catalogue.v1.json";
import protocols from "../research/coverage/protocols.v1.json";
import {HSI_T2D_IMMUNO_SEED_EDGES} from "../src/seed/t2dImmunoMetabolic";
import {buildResearchCoverage,coverageReviewPacket} from "../src/evidence/buildResearchCoverage";
import {coverageCanonical,prepareRegistrySnapshot,verifyResearchCoverageCatalogue,coverageReadiness,assessResearchDesign,verifyRegistrySnapshot,assessRegistryTopicRelevance,exportCoverageProtocol,type ResearchCoverageCatalogue,type ResearchDesignProfile,type RegistrySnapshot,type CoveragePack} from "../src/researchCoverage";
const catalogue=corpus as ResearchCoverageCatalogue;
const digest=async(s:string)=>createHash("sha256").update(s).digest("hex"),hash=(s:string)=>createHash("sha256").update(s).digest("hex");
const clone=<T>(v:T):T=>structuredClone(v);
const pack=(id="t2d-inflammatory-context")=>catalogue.packs.find(p=>p.id===id)!;
function profile(p:CoveragePack):ResearchDesignProfile{return {schemaVersion:"hsi-research-design-profile-1",dataClass:"research_design_metadata",species:"human",sampleContext:"matched",timepoint:"specified",variables:p.variables.map(v=>({variableId:v.id,availability:"available",unit:v.unit,methodSpecified:true}))}}
function registry():RegistrySnapshot{
 const body={schemaVersion:"hsi-public-registry-snapshot-1" as const,origin:"operator_supplied_unverified" as const,scope:"public_registry_metadata" as const,containsPhi:false as const,retrievedAt:"2026-11-01T00:00:00Z",records:[{nctId:"NCT99990001",title:"Engineering fixture only; not a registered study assertion",conditions:["Type 2 Diabetes"],status:"RECRUITING" as const,lastUpdateDate:"2026-10-31",url:"https://clinicaltrials.gov/study/NCT99990001"}]};return {...body,version:hash(coverageCanonical(body))};
}
const asOf="2026-11-05T12:00:00Z";
test("three source-bound drafts are reproducible without fabricating disease evidence",async()=>{
 const rebuilt=buildResearchCoverage({protocols,edges:HSI_T2D_IMMUNO_SEED_EDGES,inputs:catalogue.inputs,registry:null});expect(rebuilt).toEqual(catalogue);expect(await verifyResearchCoverageCatalogue(catalogue,digest)).toEqual(catalogue);
 expect(catalogue.packs).toHaveLength(3);expect(catalogue.registry).toBeNull();for(const p of catalogue.packs){const r=coverageReadiness(p);expect(r.approvedClaims).toBe(0);expect(r.directSupportingPassages).toBe(0);expect(r.releaseEligible).toBe(false);expect(r.gates.every(g=>g.reviewer===null&&g.state==="pending")).toBe(true)}
});
test("background citations cannot silently become Crohn’s/MS/diabetes-specific approved edges",()=>{
 for(const p of catalogue.packs)for(const b of p.background){expect(b.supportsIndication).toBe(false);expect(b.rights).toBe("unverified");expect(b.passageText).toBeNull();expect(b.relation).toBe("background_context_only")}
 expect(pack().background[0]!.contextNote).toContain("Not a T2D edge");
 const bad=clone(protocols);bad.protocols[0]!.backgroundEdgeIds=["HSI-E-INVENTED-001"];expect(()=>buildResearchCoverage({protocols:bad,edges:HSI_T2D_IMMUNO_SEED_EDGES,inputs:catalogue.inputs,registry:null})).toThrow("Unknown");
});
test("altered catalogue, source hash, promoted flag or invented passage fail closed",async()=>{
 for(const mutate of [(x:any)=>x.packs[0].question="Altered question",(x:any)=>x.inputs[0].sha256="a".repeat(64),(x:any)=>x.packs[0].releaseEligible=true,(x:any)=>x.packs[0].background[0].passageText="Invented quote",(x:any)=>x.packs[0].background[0].supportsIndication=true]){const c=clone(catalogue);mutate(c);await expect(verifyResearchCoverageCatalogue(c,digest)).rejects.toThrow()}
});
test("input hashes and pinned archives match current declared source bytes",()=>{
 for(const i of catalogue.inputs)expect(hash(readFileSync(i.path,"utf8"))).toBe(i.sha256);
 for(const directory of ["research/coverage","site/public/research/coverage"]){expect(JSON.parse(readFileSync(`${directory}/versions/${catalogue.version}.json`,"utf8"))).toEqual(catalogue)}
});
test("no missing data is treated as a negative biological fact or clinical exclusion",()=>{
 const p=profile(pack());p.species="unknown";p.sampleContext="unknown";p.timepoint="unknown";p.variables=[];const r=assessResearchDesign(pack(),p);expect(r.assessments.every(a=>a.state==="unknown")).toBe(true);expect(r.contextStatus).toBe("requires_investigator_review");expect(r.patientEligibilityAssessed).toBe(false);expect(r.releaseEligible).toBe(false);
});
test("LOINC hint/unit mismatches are ambiguous; no HbA1c or glucose conversion is inferred",()=>{
 const p=profile(pack());p.variables[0]!.unit="mmol/mol";expect(assessResearchDesign(pack(),p).assessments[0]!.state).toBe("ambiguous");p.variables[1]!.unit="mmol/L";expect(assessResearchDesign(pack(),p).assessments[1]!.state).toBe("ambiguous");
});
test("unmapped lab assay/units and absent method/timepoint require review",()=>{
 const gut=pack("crohns-mucosal-context");expect(assessResearchDesign(gut,profile(gut)).assessments[0]!.state).toBe("requires_investigator_review");const p=profile(pack());p.timepoint="unknown";expect(assessResearchDesign(pack(),p).assessments.every(a=>a.state==="requires_investigator_review")).toBe(true);
});
test("complete metadata and wrong species never clear scientific gates",()=>{
 const p=profile(pack()),r=assessResearchDesign(pack(),p);expect(r.recordedVariables).toBe(4);expect(r.releaseEligible).toBe(false);p.species="mouse";expect(assessResearchDesign(pack(),p).contextStatus).toBe("requires_investigator_review");expect(coverageReadiness(pack()).gates.every(g=>g.state==="pending")).toBe(true);
});
test("patient fields, values, foreign variables, arbitrary units and duplicate observations rejected",()=>{
 for(const change of [(p:any)=>p.patientId="denied",(p:any)=>p.variables[0].value=100,(p:any)=>p.variables[0].variableId="foreign-variable",(p:any)=>p.variables[0].unit="arbitrary-text",(p:any)=>p.variables.push(p.variables[0]),(p:any)=>p.dataClass="clinical_patient"]){const p=profile(pack());change(p);expect(()=>assessResearchDesign(pack(),p)).toThrow()}
});
test("protocol identifiers are syntax hints and unapproved exact mapping assertions are rejected",()=>{
 for(const mutate of [(p:any)=>p.disease.mapping="reviewed_exact",(p:any)=>p.disease.mondoId="MADEUP:1",(p:any)=>p.variables[0].identifier.value="fake",(p:any)=>p.variables[0].mapping="reviewed_exact"]){const c=clone(catalogue);mutate(c.packs[2]);expect(()=>coverageReviewPacket(c)).toThrow();expect(()=>buildResearchCoverage({protocols:{schemaVersion:"hsi-coverage-protocols-1",protocols:[(({background,status,scientificReview,releaseEligible,graphPromotable,...p})=>p)(c.packs[2]!)]},edges:HSI_T2D_IMMUNO_SEED_EDGES,inputs:catalogue.inputs,registry:null})).toThrow()}
});
test("no supplied registry snapshot is not reported as an empty successful live search",async()=>{
 const r=await assessRegistryTopicRelevance(pack(),null,asOf,digest);expect(r.status).toBe("not_imported");expect(r.liveRegistryQueried).toBe(false);expect(r.patientEligibilityAssessed).toBe(false);expect(r.confirmedEligible).toBe(false);
});
test("registry term overlap is exact, context-only and never participant eligibility",async()=>{
 const s=registry(),r=await assessRegistryTopicRelevance(pack(),s,asOf,digest);expect(r.status).toBe("supplied_snapshot_only");expect(r.results[0]).toMatchObject({conditionTermOverlap:true,eligibilityAssessed:false,confirmedEligible:false,criterionState:"requires_investigator_review",snapshotStale:false});
 expect((await assessRegistryTopicRelevance(pack("crohns-mucosal-context"),s,asOf,digest)).results[0]!.conditionTermOverlap).toBe(false);
});
test("registry status does not override stale metadata or investigator review",async()=>{
 const r=await assessRegistryTopicRelevance(pack(),registry(),"2027-01-05T00:00:00Z",digest);expect(r.results[0]!.snapshotStale).toBe(true);expect(r.results[0]!.recordUpdateOld).toBe(true);expect(r.results[0]!.criterionState).toBe("requires_investigator_review");expect(r.confirmedEligible).toBe(false);
 const {version,...body}=registry();body.records[0]!.status="ENROLLING_BY_INVITATION";const invitation={...body,version:hash(coverageCanonical(body))};expect((await assessRegistryTopicRelevance(pack(),invitation,asOf,digest)).results[0]!.reportedStatus).toBe("ENROLLING_BY_INVITATION");
});
test("registry hashes, dates, IDs, source URLs, future snapshots and patient fields are checked",async()=>{
 for(const mutate of [(s:any)=>s.records[0].url="https://invalid.example/study",(s:any)=>s.records[0].nctId="fake",(s:any)=>s.records[0].lastUpdateDate="2026-02-31",(s:any)=>s.records[0].patientId="denied",(s:any)=>s.records.push(s.records[0]),(s:any)=>s.records[0].conditions=["Changed"],(s:any)=>s.origin="live_verified_registry"]){const s=registry();mutate(s);await expect(verifyRegistrySnapshot(s,digest)).rejects.toThrow()}
 await expect(assessRegistryTopicRelevance(pack(),registry(),"2026-10-01T00:00:00Z",digest)).rejects.toThrow("Future");await expect(assessRegistryTopicRelevance(pack(),registry(),"2026-11-05T24:00:00Z",digest)).rejects.toThrow("UTC");
});
test("pinned draft exports reproduce their source bindings and never clear a review gate",async()=>{
 const a=await exportCoverageProtocol(catalogue,pack().id,digest),b=await exportCoverageProtocol(catalogue,pack().id,digest);expect(a).toEqual(b);expect(await digest(a.content)).toBe(a.sha256);const exported=JSON.parse(a.content);expect(exported.catalogueVersion).toBe(catalogue.version);expect(exported.notForScientificClaim).toBe(true);expect(exported.graphPublicationApproved).toBe(false);expect(exported.readiness.gates.every((g:any)=>g.reviewer===null)).toBe(true);await expect(exportCoverageProtocol(catalogue,"unknown-pack",digest)).rejects.toThrow("Unknown");
});
test("no RA/SSc corpus, seed or legacy indication stub is promoted by coverage preparation",()=>{
 const before=JSON.stringify(HSI_T2D_IMMUNO_SEED_EDGES);buildResearchCoverage({protocols,edges:HSI_T2D_IMMUNO_SEED_EDGES,inputs:catalogue.inputs,registry:null});expect(JSON.stringify(HSI_T2D_IMMUNO_SEED_EDGES)).toBe(before);expect(catalogue.packs.every(p=>!["rheumatoid_arthritis","systemic_sclerosis"].includes(p.id))).toBe(true);
});

test("operator preparation accepts only bounded public registry records and preserves unverified provenance",async()=>{
 const s=registry(),input={schemaVersion:"hsi-public-registry-input-1",containsPhi:false,retrievedAt:s.retrievedAt,records:s.records};const made=await prepareRegistrySnapshot(input,digest);expect(made).toEqual(s);expect(made.origin).toBe("operator_supplied_unverified");await expect(prepareRegistrySnapshot({...input,patientFacts:{}},digest)).rejects.toThrow();await expect(prepareRegistrySnapshot({...input,containsPhi:true},digest)).rejects.toThrow();
});
