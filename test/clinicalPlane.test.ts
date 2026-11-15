import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {appendAudit,emptyAudit,verifyAudit} from "../src/clinicalPlane/auditChain";
import {evaluateCohort,validateDefinition,type PhenotypeDefinition,type PlanePatient} from "../src/clinicalPlane/phenotype";
import {applySuppression,findRowLevel,release,suppressPartition,SMALL_CELL_THRESHOLD,type Approval,type RefusalReason,type ReleaseRequest} from "../src/clinicalPlane/releaseGate";
import {diabetesGlycaemicResponse,raisedHbA1cAdults} from "../src/clinicalPlane/definitions";
import {loadSyntheticPatients} from "../src/clinicalPlane/syntheticSource";

const GV=(JSON.parse(readFileSync("research/domain-graph/graph.v1.json","utf8")) as {version:string}).version;
const def=diabetesGlycaemicResponse(GV);
const P=(id:string,o:Partial<PlanePatient>={}):PlanePatient=>({id,condition:"Type 2 diabetes",age:60,sex:"female",bmi:30,labs:[{test:"HbA1c",visit:1,value:8},{test:"HbA1c",visit:2,value:7.5}],medications:[],...o});
const NOW="2026-11-15T12:00:00Z";
const req:ReleaseRequest={definitionId:def.id,requestedBy:"researcher-1",purpose:"Illustrative synthetic cohort exploration",dataClass:"synthetic"};
const ok:Approval={approverId:"reviewer-1",role:"release_reviewer",decision:"approve",at:NOW};
const many=(n:number,o:Partial<PlanePatient>={})=>Array.from({length:n},(_,i)=>P("p"+o.sex+i+Math.random().toString(36).slice(2,6),o));

describe("definition validation",()=>{
 test("accepts the illustrative definition",()=>{expect(validateDefinition(def).ok).toBe(true)});
 test("rejects wrong schema, empty include, bad ranges, unknown kinds, bad origin",()=>{
  expect(validateDefinition({...def,schema:"x"}).ok).toBe(false);
  expect(validateDefinition({...def,include:[]}).ok).toBe(false);
  expect(validateDefinition({...def,include:[{kind:"age",min:50,max:20}]}).ok).toBe(false);
  expect(validateDefinition({...def,include:[{kind:"genome",x:1}]}).ok).toBe(false);
  expect(validateDefinition({...def,origin:{...def.origin,graphVersion:"nothex"}}).ok).toBe(false);
  expect(validateDefinition({...def,include:[{kind:"lab",test:"HbA1c",op:"=~",value:1,at:"latest"}]}).ok).toBe(false);
 });
});

describe("cohort evaluation",()=>{
 test("tri-state: missing data is indeterminate, never silently excluded",()=>{
  const ps=[P("a"),P("b",{labs:[]}),P("c",{condition:"Obesity"}),P("d",{medications:["GLP-1 receptor agonist"]}),P("e",{age:null})];
  const {aggregate:a,matchedIds}=evaluateCohort(def,ps);
  expect(matchedIds).toEqual(["a"]);expect(a.counts).toEqual({evaluated:5,matched:1,excluded:2,indeterminate:2});
  expect(a.counts.matched+a.counts.excluded+a.counts.indeterminate).toBe(a.counts.evaluated);
  const hba=a.attrition.find(r=>r.label.startsWith("HbA1c"))!;expect(hba.counts.unknown).toBe(1);
 });
 test("latest lab uses the highest visit, not the first",()=>{
  const down=P("x",{labs:[{test:"HbA1c",visit:1,value:9},{test:"HbA1c",visit:3,value:6.2}]});
  expect(evaluateCohort(def,[down]).aggregate.counts.matched).toBe(0);
 });
 test("a broader definition over the 200 synthetic profiles releases real strata and a lab summary that pass the small-cell rules",()=>{
  const d=raisedHbA1cAdults(GV),ps=loadSyntheticPatients("site/public/research/validation/v0.1");
  const {aggregate:a}=evaluateCohort(d,ps);expect(a.counts.matched).toBeGreaterThanOrEqual(SMALL_CELL_THRESHOLD);
  const r=release({request:{...req,definitionId:d.id},graphVersion:GV,aggregate:a,approval:ok,audit:emptyAudit(),now:NOW});
  expect(r.ok).toBe(true);if(!r.ok)return;
  expect(r.finding.aggregate.counts.matched).toBe(a.counts.matched);expect(r.finding.aggregate.labSummary[0]!.median).not.toBeNull();
  for(const v of Object.values(r.finding.aggregate.matchedBySex))expect(v===null||v>=SMALL_CELL_THRESHOLD).toBe(true);
 });
 test("on the repository's 200 synthetic profiles the partition is complete and the aggregate carries no identifiers",()=>{
  const ps=loadSyntheticPatients("site/public/research/validation/v0.1");expect(ps).toHaveLength(200);
  const {aggregate:a,matchedIds}=evaluateCohort(def,ps);
  expect(a.counts.evaluated).toBe(200);expect(a.counts.matched+a.counts.excluded+a.counts.indeterminate).toBe(200);
  expect(matchedIds.every(i=>/^SYN-P-\d{6}$/.test(i))).toBe(true);
  expect(findRowLevel(a)).toBeNull();
 });
});

describe("small-cell suppression",()=>{
 test("small cells are suppressed with complementary suppression so hidden values sum to at least k",()=>{
  const r=suppressPartition({female:25,male:4,other:30,x:6});expect(r.cells.male).toBeNull();expect(r.cells.x).toBeNull();expect(r.cells.female).toBe(25);expect(r.cells.other).toBe(30);
  const one=suppressPartition({a:3,b:50,c:40});expect(one.cells.a).toBeNull();expect(one.cells.b).toBeNull();expect(one.cells.c).toBe(40);expect(one.complementary).toBe(1);
  expect(suppressPartition({a:0,b:30}).cells).toEqual({a:0,b:30});expect(suppressPartition({a:25,b:10}).cells).toEqual({a:25,b:10});
 });
 test("property: for any partition no small non-zero cell is released and hidden values sum to at least k (or everything is hidden)",()=>{
  let seed=7;const rnd=()=>(seed=(seed*1103515245+12345)&0x7fffffff)/0x7fffffff;
  for(let i=0;i<2000;i++){
   const n=1+Math.floor(rnd()*6),cells:Record<string,number>={};for(let j=0;j<n;j++)cells["c"+j]=Math.floor(rnd()*(rnd()<.5?12:80));
   const r=suppressPartition(cells),k=SMALL_CELL_THRESHOLD;
   for(const [key,v] of Object.entries(r.cells))if(v!==null&&cells[key]!>0)expect(cells[key]!>=k).toBe(true);
   const hiddenSum=Object.entries(r.cells).filter(([,v])=>v===null).reduce((t,[key])=>t+cells[key]!,0),anyHidden=Object.values(r.cells).some(v=>v===null);
   if(anyHidden){const rest=Object.entries(cells).filter(([key,v])=>r.cells[key]!==null&&v>0).length;expect(hiddenSum>=k||rest===0).toBe(true)}
  }
 });
 test("a suppressed count cannot be recovered by subtraction from a disclosed total",()=>{
  const ps=[...many(30,{sex:"female"}),...many(6,{sex:"female",condition:"Obesity"}),...many(3,{sex:"male",labs:[]})];
  const {aggregate}=evaluateCohort(def,ps);const rel=applySuppression(aggregate);
  expect(rel.counts.evaluated).toBe(39);expect(rel.counts.indeterminate).toBeNull();
  const hidden=Object.entries(rel.counts).filter(([key,v])=>v===null&&key!=="evaluated").reduce((t,[key])=>t+(aggregate.counts as Record<string,number>)[key]!,0);
  expect(hidden).toBeGreaterThanOrEqual(SMALL_CELL_THRESHOLD);
 });
 test("when matched is below the threshold every stratum and the lab summary are withheld",()=>{
  const {aggregate}=evaluateCohort(def,[...many(7,{sex:"female"}),...many(60,{sex:"male",condition:"Obesity"})]);const rel=applySuppression(aggregate);
  expect(rel.counts.matched).toBeNull();expect(Object.values(rel.matchedBySex).every(v=>v===null)).toBe(true);
  expect(rel.labSummary.every(l=>l.median===null&&l.p25===null)).toBe(true);expect(rel.suppression.totalsWithheld).toContain("strata");
 });
 test("fewer than k evaluated releases nothing at all",()=>{
  const {aggregate}=evaluateCohort(def,many(5,{sex:"female"}));const rel=applySuppression(aggregate);
  expect(Object.values(rel.counts).every(v=>v===null)).toBe(true);expect(rel.attrition.every(r=>Object.values(r.counts).every(v=>v===null))).toBe(true);
 });
 test("exactly the threshold is released",()=>{
  const {aggregate}=evaluateCohort(def,many(SMALL_CELL_THRESHOLD,{sex:"female"}));const rel=applySuppression(aggregate);
  expect(rel.counts.matched).toBe(10);expect(rel.labSummary[0]!.median).not.toBeNull();
 });
});

describe("release gate",()=>{
 const {aggregate}=evaluateCohort(def,[...many(40,{sex:"female"}),...many(30,{sex:"male"})]);
 const go=(over:Record<string,unknown>={})=>release({request:req,graphVersion:GV,aggregate,approval:ok,audit:emptyAudit(),now:NOW,...over} as never);
 test("a valid release carries honesty flags, a digest and an audit entry that verifies",()=>{
  const r=go();expect(r.ok).toBe(true);if(!r.ok)return;
  expect(r.finding.flags).toEqual({containsPhi:false,rowLevel:false,clinicalAdvice:false,scientificApproval:false,syntheticData:true});
  expect(r.finding.aggregateDigest).toMatch(/^[a-f0-9]{64}$/);expect(verifyAudit(r.audit)).toBeNull();expect(r.audit.entries.at(-1)!.action).toBe("release_approved");
  expect(findRowLevel(r.finding)).toBeNull();
 });
 test("requires approval, a different person, an authorised role and an approve decision; every refusal is audited",()=>{
  const cases:[Record<string,unknown>,RefusalReason][]=[
   [{approval:null},"approval_required"],[{approval:{...ok,approverId:"researcher-1"}},"same_person"],[{approval:{...ok,role:"researcher"}},"role_not_authorised"],[{approval:{...ok,decision:"reject"}},"approval_rejected"],
  ];
  for(const [over,reason] of cases){const r=go(over);expect(r.ok).toBe(false);if(r.ok)return;expect(r.reason).toBe(reason);expect(r.audit.entries.at(-1)!.action).toBe("release_refused");expect(verifyAudit(r.audit)).toBeNull()}
 });
 test("real data is refused until the ADR enables it",()=>{
  const r=go({request:{...req,dataClass:"real"}});expect(r.ok).toBe(false);if(!r.ok)expect(r.reason).toBe("real_data_not_enabled");
 });
 test("attempting to move row-level data up fails, whatever the shape",()=>{
  for(const bad of [{...aggregate,matchedIds:["SYN-P-000001"]},{...aggregate,matchedBySex:{...aggregate.matchedBySex,"SYN-P-000007":1}},{...aggregate,note:"patient 4857261234 matched"},{...aggregate,contact:"a@b.co"},{...aggregate,rows:[]}]){
   const r=go({aggregate:bad});expect(r.ok).toBe(false);if(!r.ok)expect(r.reason).toBe("row_level_payload");
  }
 });
 test("PHI markers and bad requests are refused",()=>{
  const r1=go({request:{...req,purpose:"find the NHS number for these people"}});expect(r1.ok).toBe(false);if(!r1.ok)expect(r1.reason).toBe("phi_marker");
  const r2=go({request:{...req,purpose:"x"}});expect(r2.ok).toBe(false);if(!r2.ok)expect(r2.reason).toBe("invalid_request");
  const r3=go({request:{...req,definitionId:"other"}});expect(r3.ok).toBe(false);if(!r3.ok)expect(r3.reason).toBe("invalid_request");
 });
 test("the released aggregate for the same input has a stable digest",()=>{
  const a=go(),b=go();expect(a.ok&&b.ok&&a.finding.aggregateDigest===b.finding.aggregateDigest).toBe(true);
 });
});

describe("audit chain",()=>{
 const e=(n:number)=>({at:"2026-11-15T12:00:0"+n+"Z",actor:"a",action:"x",subject:"s",detail:"d"+n});
 test("verifies, then detects edits, deletions and reordering",()=>{
  let l=emptyAudit();for(let i=0;i<4;i++)l=appendAudit(l,e(i));
  expect(verifyAudit(l)).toBeNull();
  expect(verifyAudit({entries:l.entries.map((x,i)=>i===1?{...x,detail:"changed"}:x)})).toBe(2);
  expect(verifyAudit({entries:l.entries.filter((_,i)=>i!==1)})).toBe(3);
  expect(verifyAudit({entries:[l.entries[1]!,l.entries[0]!,...l.entries.slice(2)]})).toBe(2);
 });
 test("append does not mutate the previous log",()=>{const a=appendAudit(emptyAudit(),e(1));const b=appendAudit(a,e(2));expect(a.entries).toHaveLength(1);expect(b.entries).toHaveLength(2)});
});
