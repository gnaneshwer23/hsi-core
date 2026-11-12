import {test,expect} from "bun:test";
import {createBenchmarkCurationService,validateCurationRecord,type CurationRecord,type CurationAssessment} from "../src/evidence/benchmarkCuration";
const h="a".repeat(64);
const a:CurationAssessment={conflict:"insufficient_evidence",answerability:"abstain",rationale:"SYNTHETIC_PRIVATE_RATIONALE",expectedBehavior:["Report missing evidence"],provenanceCriteria:["Exact spans"],safetyCriteria:["No promotion"]};
function fixture(){
 let record:CurationRecord={schemaVersion:"hsi-private-benchmark-curation-1",id:"case-1",slotId:"IMMUNO-ssc-01",version:1,domain:"ssc",caseHash:h,authorRef:"author",assessors:["rater-a","rater-b"],adjudicatorRef:"adjudicator",sourcePacketRef:"vault/synthetic",sourceClearanceHash:h,assessments:[],adjudication:null},revision=0,active=true,current=true;
 const store={load:async()=>({record:structuredClone(record),revision:String(revision)}),compareAndSwap:async(_id:string,rev:string,next:CurationRecord)=>{if(rev!==String(revision))return false;record=structuredClone(next);revision++;return true;}};
 const deps={enabled:true,store,authenticate:async(s:string)=>s==="invalid"?null:s,grant:async(p:string)=>({principalRef:p,active,consented:true,domains:["ssc" as const],conflictFreeCaseHashes:[h]}),sourceCurrent:async()=>current};
 const service=createBenchmarkCurationService(deps);
 const submit=(actor:string,assessment=a)=>service.submit(actor,"case-1",{caseHash:h,requestId:"request-"+actor,assessment});
 return {deps,service,submit,get record(){return structuredClone(record)},revoke(){active=false},retract(){current=false}};
}
test("default disablement, unknown session, cross-assignment and wrong-domain grants deny access",async()=>{
 const f=fixture();await expect(createBenchmarkCurationService({...f.deps,enabled:undefined}).view("rater-a","case-1")).rejects.toThrow("disabled");
 for(const actor of ["invalid","outsider"])await expect(f.service.view(actor,"case-1")).rejects.toThrow("unavailable");
 await expect(createBenchmarkCurationService({...f.deps,grant:async p=>({principalRef:p,active:true,consented:true,domains:["ra"],conflictFreeCaseHashes:[h]})}).view("rater-a","case-1")).rejects.toThrow("unavailable");
});
test("two assessments are blind; author and peer cannot read gold, adjudicator waits for both locks",async()=>{
 const f=fixture();await f.submit("rater-a");
 for(const actor of ["rater-b","author","adjudicator"])await expect(f.service.readAssessment(actor,"case-1","rater-a")).rejects.toThrow("Blind");
 const v=await f.service.view("rater-b","case-1");expect(JSON.stringify(v)).not.toContain(a.rationale);
 await f.submit("rater-b");expect((await f.service.readAssessment("adjudicator","case-1","rater-a")).assessment.rationale).toBe(a.rationale);
 await expect(f.service.readAssessment("rater-b","case-1","rater-a")).rejects.toThrow("Blind");
});
test("self-review, wrong-case hashes and conflicted/unconsented assignments are denied",async()=>{
 const f=fixture();await expect(f.submit("author")).rejects.toThrow("assessor");
 await expect(f.service.submit("rater-a","case-1",{caseHash:"b".repeat(64),requestId:"r",assessment:a})).rejects.toThrow();
 for(const property of ["consented","conflictFreeCaseHashes"] as const){const svc=createBenchmarkCurationService({...f.deps,grant:async p=>({...await f.deps.grant(p),[property]:property==="consented"?false:[]})});await expect(svc.view("rater-a","case-1")).rejects.toThrow();}
 const r=f.record;r.adjudicatorRef="rater-a";expect(()=>validateCurationRecord(r)).toThrow("assignment");
});
test("assessment retry is idempotent and immutable; concurrent writes cannot overwrite",async()=>{
 const f=fixture();const results=await Promise.allSettled([f.submit("rater-a"),f.submit("rater-a")]);expect(results.some(r=>r.status==="fulfilled")).toBe(true);expect(f.record.assessments).toHaveLength(1);
 const receipt=await f.submit("rater-a");expect(receipt.immutable).toBe(true);await expect(f.submit("rater-a",{...a,rationale:"Changed"})).rejects.toThrow("locked");
});
test("independent adjudication binds both commitments, records agreement with different rationale, never freezes",async()=>{
 const f=fixture(),input={caseHash:h,requestId:"adj-1",decision:"agreed" as const,rationale:"Synthetic independent agreement"};
 await expect(f.service.adjudicate("adjudicator","case-1",input)).rejects.toThrow("two locked");await f.submit("rater-a");await f.submit("rater-b",{...a,rationale:"Distinct independent rationale"});
 await expect(f.service.adjudicate("author","case-1",input)).rejects.toThrow();const r=await f.service.adjudicate("adjudicator","case-1",input);expect(r.freezeApproved).toBe(false);expect(r.scientificApproval).toBe(false);expect(await f.service.adjudicate("adjudicator","case-1",input)).toEqual(r);
 await expect(f.service.adjudicate("adjudicator","case-1",{...input,rationale:"Silent overwrite"})).rejects.toThrow("immutable");
});
test("disagreement cannot be relabeled agreement; revocation/retraction block subsequent access",async()=>{
 const f=fixture();await f.submit("rater-a");await f.submit("rater-b",{...a,conflict:"consistent",answerability:"answer"});
 await expect(f.service.adjudicate("adjudicator","case-1",{caseHash:h,requestId:"adj",decision:"agreed",rationale:"bad"})).rejects.toThrow("resolved");f.revoke();await expect(f.service.view("rater-a","case-1")).rejects.toThrow();
 const g=fixture();g.retract();await expect(g.submit("rater-a")).rejects.toThrow();expect(g.record.assessments).toHaveLength(0);
});
test("stalled authority is bounded without storing an assessment",async()=>{
 const f=fixture(),svc=createBenchmarkCurationService({...f.deps,timeoutMs:100,grant:async()=>new Promise(()=>{})});await expect(svc.view("rater-a","case-1")).rejects.toThrow("deadline");expect(f.record.assessments).toHaveLength(0);
});

test("private authoring workbook preserves canonical 120 slots/context without fabricated completion",async()=>{
 const {buildImmunoProtocol}=await import("../src/evidence/immunoBenchmark"),{DETAILED_CONTEXT_FIELDS}=await import("../src/evidence/passageLinkedContext"),{validatePrivateDraftWorkbook}=await import("../src/evidence/benchmarkCuration");
 const p=buildImmunoProtocol();const draft={schemaVersion:"hsi-immuno-authoring-drafts-1",canonicalProtocolHash:p.protocolHash,status:"DRAFT_AUTHORING_ONLY",caseCount:120,adjudicatedCount:0,clearedSourceCount:0,scientificApproval:false,approvedWorkspace:null,holdoutEligible:false,cases:p.slots.map(s=>({...s,status:"MODEL_AUTHORED_DRAFT_NOT_GOLD",draftQuestion:"SYNTHETIC ONLY "+s.slotId,gold:null,expertAssessments:[],adjudication:null,eligibleForLockedEvaluation:false,contextFieldsToExtract:[...DETAILED_CONTEXT_FIELDS],sources:[],clearanceReceipts:[]}))};
 expect(validatePrivateDraftWorkbook(draft).adjudicatedCases).toBe(0);
 for(const change of [(d:typeof draft)=>{d.cases[0]!.contextFieldsToExtract.pop()},(d:typeof draft)=>{d.cases[0]!.eligibleForLockedEvaluation=true},(d:typeof draft)=>{d.cases[1]!.slotId=d.cases[0]!.slotId},(d:typeof draft)=>{d.adjudicatedCount=120}]){const d=structuredClone(draft);change(d);expect(()=>validatePrivateDraftWorkbook(d)).toThrow();}
});

test("source refresh receives only clearance binding, never blinded labels or identities",async()=>{
 const f=fixture();await f.submit("rater-a");let observed:unknown;const svc=createBenchmarkCurationService({...f.deps,sourceCurrent:async b=>{observed=b;return true}});await svc.view("rater-b","case-1");expect(Object.keys(observed as object).sort()).toEqual(["caseHash","domain","id","sourceClearanceHash","sourcePacketRef","version"]);expect(JSON.stringify(observed)).not.toContain(a.rationale);expect(JSON.stringify(observed)).not.toContain("rater-a");
});
