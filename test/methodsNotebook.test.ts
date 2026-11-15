import {describe,expect,test} from "bun:test";
import {EXPORT_NOTICE,LIM,addRecord,createRecord,exportNotebook,mergeImport,parseNotebook,removeRecord,summary,type MethodRecord} from "../src/methods/notebook";

const T="2026-11-15T10:00:00Z";
const mk=(o:Record<string,unknown>={},at=T):MethodRecord=>{const r=createRecord({technique:"Tfh differentiation with IL-21",...o} as never,at);if(!r.ok)throw Error(r.error);return r.record};

describe("createRecord",()=>{
 test("a record is always private; techniques and fields are trimmed and bounded",()=>{
  const r=mk({technique:"  Tfh   differentiation  ",deviations:[{parameter:"IL-21",published:"50 ng/mL",mine:"100 ng/mL",reason:"x".repeat(900)}]});
  expect(r.sharing).toBe("private");expect(r.technique).toBe("Tfh differentiation");expect(r.deviations[0]!.reason.length).toBe(LIM.reason);
  expect(createRecord({technique:"ab"},T).ok).toBe(false);
 });
 test("a change needs a parameter and what you did; empty rows are dropped; at most 12",()=>{
  expect(createRecord({technique:"valid technique",deviations:[{parameter:"IL-21"}]},T).ok).toBe(false);
  expect(mk({deviations:[{},{parameter:"",mine:""}]}).deviations).toEqual([]);
  expect(mk({deviations:Array.from({length:30},(_,i)=>({parameter:"p"+i,mine:"m"}))}).deviations).toHaveLength(12);
 });
 test("partly and failed need an explanation; worked does not; failures are kept",()=>{
  const bad=createRecord({technique:"valid technique",outcome:"failed",outcomeNote:"no"},T);expect(bad.ok).toBe(false);if(!bad.ok)expect(bad.error).toContain("Failures are as useful");
  expect(createRecord({technique:"valid technique",outcome:"partly"},T).ok).toBe(false);
  expect(mk({outcome:"worked"}).outcome).toBe("worked");expect(mk({outcome:"failed",outcomeNote:"Cells died after day 2 at the higher dose"}).outcome).toBe("failed");
  expect(mk({outcome:"great" as never}).outcome).toBe("unknown");
 });
 test("DOI and PMC id are validated; effort is bounded and self-reported",()=>{
  const r=mk({reference:{title:"A paper",doi:"https://doi.org/10.1000/abc.123",pmcid:"PMC1234567"},effort:{hours:12.34,costGbp:-5}});
  expect(r.reference.doi).toBe("10.1000/abc.123");expect(r.reference.pmcid).toBe("PMC1234567");expect(r.effort).toEqual({hours:12.3,costGbp:null});
  expect(mk({reference:{doi:"javascript:alert(1)",pmcid:"x"}}).reference).toEqual({title:"",doi:"",pmcid:""});
 });
});

describe("notebook",()=>{
 test("adds once, caps the size, removes",()=>{
  const r=mk(),a=addRecord({},r);expect(a.added).toBe(true);expect(addRecord(a.notebook,r).added).toBe(false);
  let n={};for(let i=0;i<LIM.records;i++)n={...n,["k"+i]:{...r,id:"mth:"+String(i).padStart(8,"0")}};
  expect(addRecord(n,mk({},"2026-11-16T00:00:00Z")).error).toContain("at most");
  expect(Object.keys(removeRecord(a.notebook,r.id))).toHaveLength(0);
 });
 test("the summary shows worked, partly and failed together, with self-reported effort and no score",()=>{
  let n=addRecord({},mk({outcome:"worked",effort:{hours:4,costGbp:100}},"2026-01-01T00:00:00Z")).notebook;
  n=addRecord(n,mk({outcome:"failed",outcomeNote:"Cells died after day 2 at the higher dose",effort:{hours:10}},"2026-01-02T00:00:00Z")).notebook;
  n=addRecord(n,mk({outcome:"partly",outcomeNote:"Worked in two of three donors",deviations:[{parameter:"p",mine:"m"}]},"2026-01-03T00:00:00Z")).notebook;
  const s=summary(n);expect(s.byOutcome).toEqual({worked:1,partly:1,failed:1,unknown:0});expect(s.selfReportedHours).toBe(14);expect(s.selfReportedCostGbp).toBe(100);expect(s.withDeviations).toBe(1);
  expect(s.effortNote).toContain("Not a saving");expect(JSON.stringify(s)).not.toMatch(/score|rating|best|rank/i);
 });
 test("export carries the confidentiality notice and round-trips; import merges without overwriting",()=>{
  const r=mk({outcome:"worked",deviations:[{parameter:"IL-21",mine:"100 ng/mL",reason:"batch potency"}]}),n=addRecord({},r).notebook,text=exportNotebook(n);
  expect(text).toContain(EXPORT_NOTICE);expect(Object.values(parseNotebook(text))[0]).toEqual(r);
  const edited=JSON.stringify({schema:"hsi-methods-notebook-1",records:[{...r,technique:"Changed on import"},{...mk({},"2026-02-02T00:00:00Z")}]});
  const m=mergeImport(n,parseNotebook(edited));expect(m.added).toBe(1);expect(m.skipped).toBe(1);expect(m.notebook[r.id]!.technique).toBe(r.technique);
 });
 test("hostile or malformed input is dropped; imported records cannot claim to be shared",()=>{
  expect(parseNotebook(null)).toEqual({});expect(parseNotebook("{bad")).toEqual({});expect(parseNotebook("x".repeat(2_000_000))).toEqual({});expect(parseNotebook("[]")).toEqual({});
  const r=mk(),bad=JSON.stringify({schema:"hsi-methods-notebook-1",records:[{...r,sharing:"public",reference:{doi:"javascript:x",title:"<img onerror=x>"}},{...r,id:"nope"},{id:"mth:00000000"},5,{...r,outcome:"failed",outcomeNote:"x",id:"mth:11111111"}]});
  const p=Object.values(parseNotebook(bad));expect(p).toHaveLength(1);expect(p[0]!.sharing).toBe("private");expect(p[0]!.reference.doi).toBe("");
 });
});
