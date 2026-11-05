import {test,expect} from "bun:test";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {adaptSyntheticValidationDataset,normalizeSyntheticTable,VALIDATION_TABLES,patientValidationBundle,conditionValidationBundle,verifyValidationBundles,buildValidationBrief,renderValidationBrief,recordValidationReview,validationTrialContext,type ValidationTable} from "../src/syntheticValidationDataset";
import {VALIDATION_CATALOGUE_SHA256} from "../src/validation/generatedValidationIndex";
import {validateReleasedEvidence} from "../src/investigationGraphContext";
import {released} from "./fixtures/investigationGraphContext";
const root=new URL("../research/validation/v0.1/input/",import.meta.url);
const raw=Object.fromEntries(VALIDATION_TABLES.map(t=>[t,JSON.parse(readFileSync(new URL("hsi_synthetic_"+t+".json",root),"utf8"))])) as Record<ValidationTable,unknown>;
const d=adaptSyntheticValidationDataset(raw),p=patientValidationBundle(d,"SYN-P-000001"),c=conditionValidationBundle(d,p.patient.condition);
const sha=(s:string|Buffer)=>createHash("sha256").update(s).digest("hex");
test("audit verifies original counts, all joins, nine CSV pairs and duplicate trials receipt",()=>{
 expect(Object.values(d).reduce((s,a)=>s+a.length,0)).toBe(20000);expect(d.lab_results).toHaveLength(13000);expect(d.trials).toHaveLength(300);
 const conditions=[...new Set(d.patients.map(p=>p.condition))];expect(conditions).toHaveLength(20);
 for(const condition of conditions){expect(d.patients.filter(p=>p.condition===condition)).toHaveLength(10);expect(d.evidence.filter(p=>p.condition===condition)).toHaveLength(50);expect(d.hypotheses.filter(p=>p.condition===condition)).toHaveLength(25)}
 const receipt=JSON.parse(readFileSync(new URL("../upload-receipt.json",root),"utf8"));
 expect(receipt.csv_json_parity).toHaveLength(9);expect(receipt.csv_json_parity.every((p:{equivalent:boolean})=>p.equivalent)).toBe(true);
 for(const r of receipt.files)if(!r.duplicate_of){const bytes=readFileSync(new URL(r.file,root));expect(sha(bytes)).toBe(r.sha256);expect(bytes.byteLength).toBe(r.bytes)}else expect(r.sha256).toBe(sha(readFileSync(new URL(r.duplicate_of,root))));
});
test("normalization preserves originals and adds all 18,500 missing claim guards",()=>{
 let missing=0;for(const t of VALIDATION_TABLES){for(const row of raw[t] as Array<Record<string,unknown>>)if(!("scientific_claim_allowed" in row))missing++;expect(d[t].every(r=>r.data_class==="synthetic"&&r.scientific_claim_allowed===false)).toBe(true)}
 expect(missing).toBe(18500);expect((raw.patients as Array<Record<string,unknown>>)[0]).not.toHaveProperty("scientific_claim_allowed");expect(d.patients[0]).toHaveProperty("scientific_claim_allowed",false);
});
test("profiles are correctly joined and visit dates are not fabricated for sidecars",()=>{
 for(const patient of d.patients){const bundle=patientValidationBundle(d,patient.patient_id);expect(bundle.lab_results).toHaveLength(65);expect(bundle.medications).toHaveLength(5);expect(new Set(bundle.lab_results.map(l=>l.date)).size).toBe(5);expect(bundle.microbiome.every(r=>r.patient_id===patient.patient_id)).toBe(true)}
 expect(p.immune_profiles[0]).not.toHaveProperty("date");expect(p.lab_results[0]).not.toHaveProperty("reference_range");expect(p.medications[0]).not.toHaveProperty("dose");
 expect(verifyValidationBundles(p,c).profile).toEqual(p);
});
for(const kind of ["real","promoted","unexpected_identifier","duplicate","orphan","invalid_number","invalid_date","invalid_visit","wrong_condition"] as const)test("rejects malformed fixture input: "+kind,()=>{
 const changed=structuredClone(raw) as Record<ValidationTable,Array<Record<string,unknown>>>;
 if(kind==="real")changed.patients[0]!.data_class="public_real";
 if(kind==="promoted")changed.evidence[0]!.evidence_status="supported";
 if(kind==="unexpected_identifier")changed.patients[0]!.email="real@example.invalid";
 if(kind==="duplicate")changed.patients.push(changed.patients[0]!);
 if(kind==="orphan")changed.lab_results[0]!.patient_id="SYN-P-999999";
 if(kind==="invalid_number")changed.lab_results[0]!.value=Infinity;
 if(kind==="invalid_date")changed.lab_results[0]!.date="2026-02-30";
 if(kind==="invalid_visit")changed.wearables[0]!.visit=6;
 if(kind==="wrong_condition")changed.trials[0]!.condition="unrecognised condition";
 expect(()=>adaptSyntheticValidationDataset(changed)).toThrow();
});
test("every table rejects an explicit scientific claim grant",()=>{
 for(const t of VALIDATION_TABLES){const changed=structuredClone(raw[t]) as Array<Record<string,unknown>>;changed[0]!.scientific_claim_allowed=true;expect(()=>normalizeSyntheticTable(t,changed)).toThrow()}
});
test("network shards must retain normalized guards and the correct profile/condition binding",()=>{
 const wrong=structuredClone(c);wrong.condition="Wrong condition";expect(()=>verifyValidationBundles(p,wrong)).toThrow();
 const changed=structuredClone(p);delete (changed.lab_results[0] as Partial<typeof changed.lab_results[number]>).scientific_claim_allowed;expect(()=>verifyValidationBundles(changed,c)).toThrow();
});
test("trial overlap never assesses eligibility or promotes recruiting status",()=>{
 const rows=validationTrialContext(p,c);expect(rows).toHaveLength(15);expect(rows.every(t=>t.eligibility==="unknown_missing_criteria"&&!t.enrolmentAllowed&&!t.confirmedEligible&&!t.scientific_claim_allowed)).toBe(true);
 expect(rows.some(t=>t.sharedBiomarkers.length>0)).toBe(true);
});
test("review rehearsal rejects self-review, scientific approval and excessive history",()=>{
 const request={actor:"demo-reviewer",author:"demo-author",outcome:"checked_for_ui_test",rationale:"The UI and source limitations were examined as test fixtures."};
 expect(()=>recordValidationReview({...request,actor:"demo-author"},[])).toThrow();expect(()=>recordValidationReview({...request,outcome:"supported"},[])).toThrow();expect(()=>recordValidationReview({...request,outcome:"approve"},[])).toThrow();expect(()=>recordValidationReview({...request,rationale:"Patient name and NHS number must never be part of this fixture."},[])).toThrow();
 const log=[];for(let n=0;n<20;n++)log.push(recordValidationReview(request,log));expect(()=>recordValidationReview(request,log)).toThrow();
 const brief=buildValidationBrief(p,c,log);expect(brief.hypotheses.every(h=>h.review_status==="pending"&&h.evidence_status==="ai_draft")).toBe(true);expect(brief.actualResearchReview).toBe("not_performed");expect(brief.contextMap.causalEdges).toEqual([]);
});
test("export reproduces the guarded observations and refuses forged scientific/eligibility content",()=>{
 const b=buildValidationBrief(p,c),json=renderValidationBrief(b,"json"),md=renderValidationBrief(b,"markdown");expect(JSON.parse(json)).toEqual(b);expect(md).toContain("Synthetic software-validation");expect(md).toContain("Reference intervals");expect(md).toContain("eligibility unknown");
 const changed=structuredClone(b);changed.trials[0]!.confirmedEligible=true as false;expect(()=>renderValidationBrief(changed,"json")).toThrow();
 const forged=structuredClone(b);forged.hypotheses[0]!.evidence_status="supported" as "ai_draft";expect(()=>renderValidationBrief(forged,"markdown")).toThrow();
 expect(b.confidence.value).toBeNull();expect(b.generatedByModel).toBe(false);
});
test("synthetic source data cannot enter an approved released-evidence context",()=>{
 const value=released();value.bundle.context.dataClass="synthetic";expect(()=>validateReleasedEvidence(value)).toThrow();
 expect(()=>validateReleasedEvidence({release:value.release,disease:"systemic_sclerosis",bundle:p,studyContexts:{},epistemicTypes:{}} as unknown as Parameters<typeof validateReleasedEvidence>[0])).toThrow();
});
test("static fixture assets and catalogue are pinned to committed hashes; route rewrite is exact",()=>{
 const dir=new URL("../site/public/research/validation/v0.1/",import.meta.url),catalogue=JSON.parse(readFileSync(new URL("catalogue.json",dir),"utf8"));
 expect(sha(readFileSync(new URL("catalogue.json",dir)))).toBe(VALIDATION_CATALOGUE_SHA256);
 expect(catalogue.patients).toHaveLength(200);expect(catalogue.conditions).toHaveLength(20);
 for(const entry of [...catalogue.patients,...catalogue.conditions,catalogue.audit]){const bytes=readFileSync(new URL(entry.file,dir));expect(sha(bytes)).toBe(entry.sha256);expect(bytes.byteLength).toBe(entry.bytes)}
 const config=JSON.parse(readFileSync(new URL("../site/vercel.json",import.meta.url),"utf8"));expect(config.rewrites).toContainEqual({source:"/research/validation",destination:"/index.html"});expect(config.rewrites.some((r:{source:string})=>r.source==="/research/validation/:path*")).toBe(false);
});

test("record-level lineage uses original file/row/key and never invents generation metadata",()=>{
 const normalized=adaptSyntheticValidationDataset(raw,{sourceHashes:Object.fromEntries(VALIDATION_TABLES.map(t=>[t,sha(readFileSync(new URL("hsi_synthetic_"+t+".json",root)))]))});
 for(const table of VALIDATION_TABLES){
  const sourceHash=sha(readFileSync(new URL("hsi_synthetic_"+table+".json",root)));
  normalized[table].forEach((r,i)=>{
   expect(r.validation_provenance.sourceFile).toBe("hsi_synthetic_"+table+".json");expect(r.validation_provenance.sourceRow).toBe(i+1);
   expect(r.validation_provenance.sourceFileSha256).toBe(sourceHash);
   expect(r.validation_provenance.generatorVersion).toBeNull();expect(r.validation_provenance.generationDate).toBeNull();
  });
 }
 const bundle=patientValidationBundle(normalized,"SYN-P-000002"),condition=conditionValidationBundle(normalized,bundle.patient.condition);
 expect(bundle.patient.validation_provenance.sourceRow).toBe(2);expect(verifyValidationBundles(bundle,condition).profile.patient.validation_provenance.sourceRow).toBe(2);
});
test("forged or missing normalized lineage is refused before export",()=>{
 for(const mutation of ["generation","key","file","missing"]){
  const changed=structuredClone(p),lineage=changed.patient.validation_provenance;
  if(mutation==="generation")(lineage as {generationDate:unknown}).generationDate="2026-11-05";
  if(mutation==="key")lineage.sourceRecordKey="SYN-P-999999";
  if(mutation==="file")lineage.sourceFile="real-ehr.json";
  if(mutation==="missing")delete (changed.patient as Partial<typeof changed.patient>).validation_provenance;
  expect(()=>verifyValidationBundles(changed,c)).toThrow();
 }
});
