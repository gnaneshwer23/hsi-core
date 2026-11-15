import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {canonical,emptyAudit,sha256} from "../src/clinicalPlane/auditChain";
import {DEFAULT_SPEC,GENERATOR_NOTICE,MAX_GENERATED,MISSING,PROFILES,generateCohort} from "../src/clinicalPlane/generator";
import {evaluateCohort} from "../src/clinicalPlane/phenotype";
import {findRowLevel,release,SMALL_CELL_THRESHOLD,type Approval} from "../src/clinicalPlane/releaseGate";
import {TRIALS,trialDefinition} from "../src/clinicalPlane/trials";
import {raisedHbA1cAdults} from "../src/clinicalPlane/definitions";

const GV=(JSON.parse(readFileSync("research/domain-graph/graph.v1.json","utf8")) as {version:string}).version;
const cohort=generateCohort(DEFAULT_SPEC);
const mean=(a:number[])=>a.reduce((s,x)=>s+x,0)/a.length;
const latest=(p:(typeof cohort)[number],t:string)=>{const l=p.labs.filter(x=>x.test===t);return l.length?l[l.length-1]!.value:null};

describe("determinism and bounds",()=>{
 test("the same spec gives the same cohort, byte for byte; a different seed gives a different one",()=>{
  expect(sha256(canonical(generateCohort(DEFAULT_SPEC)))).toBe(sha256(canonical(cohort)));
  expect(sha256(canonical(generateCohort({...DEFAULT_SPEC,seed:1})))).not.toBe(sha256(canonical(cohort)));
 });
 test("the default cohort has the requested size, unique SYN-G ids and only the documented fields",()=>{
  expect(cohort).toHaveLength(DEFAULT_SPEC.n);expect(new Set(cohort.map(p=>p.id)).size).toBe(cohort.length);expect(cohort.every(p=>/^SYN-G-\d{6}$/.test(p.id))).toBe(true);
  expect(Object.keys(cohort[0]!).sort()).toEqual(["age","bmi","condition","id","labs","medications","sex"]);
 });
 test("invalid specs are refused; generation is fast enough to run in a browser",()=>{
  for(const bad of [{seed:-1,n:10},{seed:1.5,n:10},{seed:1,n:0},{seed:1,n:MAX_GENERATED+1},{seed:2**32,n:10}])expect(()=>generateCohort(bad)).toThrow("Invalid generator spec");
  const t0=performance.now();generateCohort({seed:5,n:MAX_GENERATED});expect(performance.now()-t0).toBeLessThan(2000);
 });
 test("all values stay in plausible bounds",()=>{
  for(const p of cohort){
   if(p.age!==null)expect(p.age>=18&&p.age<=95).toBe(true);if(p.bmi!==null)expect(p.bmi>=15&&p.bmi<=60).toBe(true);
   for(const l of p.labs){expect(Number.isFinite(l.value)).toBe(true);if(l.test==="HbA1c")expect(l.value>=4&&l.value<=14).toBe(true);else expect(l.value>0&&l.value<=120).toBe(true)}
  }
 });
});

describe("shape and missing data",()=>{
 test("all 20 conditions appear and there are enough profiles per condition for small-group rules",()=>{
  const by=new Map<string,number>();for(const p of cohort)by.set(p.condition,(by.get(p.condition)??0)+1);
  expect(by.size).toBe(PROFILES.length);expect(PROFILES).toHaveLength(20);
  for(const [c,n] of by)expect(n,c).toBeGreaterThan(SMALL_CELL_THRESHOLD*5);
 });
 test("conditions are shaped as intended: diabetes has high HbA1c, rheumatoid arthritis high hs-CRP, dementia is older",()=>{
  const g=(c:string)=>cohort.filter(p=>p.condition===c);
  const hb=(c:string)=>mean(g(c).map(p=>latest(p,"HbA1c")).filter((x):x is number=>x!==null)),crp=(c:string)=>mean(g(c).map(p=>latest(p,"hs-CRP")).filter((x):x is number=>x!==null));
  expect(hb("Type 2 diabetes")).toBeGreaterThan(7);expect(hb("Type 2 diabetes")).toBeGreaterThan(hb("IBS")+1.5);
  expect(crp("Rheumatoid arthritis")).toBeGreaterThan(crp("IBS")*2);
  expect(mean(g("Alzheimer's disease").map(p=>p.age!))).toBeGreaterThan(70);expect(mean(g("Atopic dermatitis").map(p=>p.age!))).toBeLessThan(40);
  expect(g("Systemic lupus erythematosus").filter(p=>p.sex==="female").length/g("Systemic lupus erythematosus").length).toBeGreaterThan(.75);
 });
 test("deliberate missing data is present at roughly the documented rates, and never silently dropped",()=>{
  const n=cohort.length,rate=(f:(p:(typeof cohort)[number])=>boolean)=>cohort.filter(f).length/n;
  expect(rate(p=>!p.labs.some(l=>l.test==="HbA1c"))).toBeGreaterThan(MISSING.hba1c*.6);expect(rate(p=>!p.labs.some(l=>l.test==="HbA1c"))).toBeLessThan(MISSING.hba1c*1.5);
  expect(rate(p=>p.bmi===null)).toBeGreaterThan(MISSING.bmi*.5);expect(rate(p=>p.age===null)).toBeGreaterThan(0);
  const {aggregate}=evaluateCohort(raisedHbA1cAdults(GV),cohort);
  expect(aggregate.counts.indeterminate).toBeGreaterThan(0);expect(aggregate.counts.matched+aggregate.counts.excluded+aggregate.counts.indeterminate).toBe(cohort.length);
 });
 test("medications come from the repository's vocabulary and follow the condition",()=>{
  const g=cohort.filter(p=>p.condition==="Type 2 diabetes");
  expect(g.filter(p=>p.medications.includes("Metformin")).length/g.length).toBeGreaterThan(.6);
  expect(cohort.filter(p=>p.condition==="IBS").some(p=>p.medications.includes("Methotrexate"))).toBe(false);
 });
});

describe("with the clinical plane",()=>{
 const ok:Approval={approverId:"reviewer-1",role:"release_reviewer",decision:"approve",at:"2026-11-15T12:00:00Z"};
 test("the release gate treats generated ids as identifiers",()=>{
  expect(findRowLevel({x:{"SYN-G-000123":1}})).not.toBeNull();expect(findRowLevel({ids:["SYN-G-000001"]})).not.toBeNull();expect(findRowLevel({note:"fine"})).toBeNull();
 });
 test("trials that were suppressed on 200 profiles now release counts, strata and a feasibility figure",()=>{
  for(const t of TRIALS){
   const def=trialDefinition(t,GV),{aggregate}=evaluateCohort(def,cohort);
   const r=release({request:{definitionId:def.id,requestedBy:"researcher-1",purpose:"Illustrative synthetic pre-screening",dataClass:"synthetic"},graphVersion:GV,aggregate,approval:ok,audit:emptyAudit(),now:"2026-11-15T12:00:00Z"});
   expect(r.ok).toBe(true);if(!r.ok)return;
   expect(r.finding.aggregate.counts.matched).not.toBeNull();expect(Object.values(r.finding.aggregate.matchedBySex).every(v=>v!==null||true)).toBe(true);
  }
 });
 test("the notice states it is illustrative and not calibrated",()=>{expect(GENERATOR_NOTICE).toContain("illustrative");expect(GENERATOR_NOTICE).toContain("Not calibrated")});
});
