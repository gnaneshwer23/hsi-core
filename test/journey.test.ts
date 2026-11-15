import {describe,expect,test} from "bun:test";
import {GAP_REGISTER_KEY,STEPS,progressFor,readBrowserRecord} from "../site/src/lib/journey";
import {addCohortObservation,addEntry,addTargetPick,createEntry,edit,type Ledger} from "../src/investigation/hypothesisLedger";

const T="2026-11-15T10:00:00Z",mem=(o:Record<string,string>)=>({getItem:(k:string)=>o[k]??null});
const mk=(statement:string)=>{const r=createEntry({statement,origin:{kind:"researcher"},prediction:"p",experiment:"e",falsifier:"f"},T);if(!r.ok)throw Error();return r.entry};

describe("journey steps",()=>{
 test("eight steps in order, each with a link, an honest status and what it does not show",()=>{
  expect(STEPS.map(s=>s.n)).toEqual([1,2,3,4,5,6,7,8]);
  for(const s of STEPS){expect(s.to.startsWith("/")).toBe(true);expect(s.doesNot.length).toBeGreaterThan(20);expect(s.status.label.length).toBeGreaterThan(5)}
  const all=STEPS.map(s=>s.proves+" "+s.doesNot+" "+s.status.label).join(" ");
  expect(/\bvalidated\b|\bproven\b|recommend(?:ed|s)? treatment|diagnos/i.test(all.replace(/not validated|Nothing is validated|not recommendations|or recommendations/gi,""))).toBe(false);
 });
 test("steps that use synthetic data say so; step 1 and 5 say the model is off",()=>{
  for(const id of ["patients","trials"])expect(STEPS.find(s=>s.id===id)!.status.label.toLowerCase()).toContain("synthetic");
  expect(STEPS.find(s=>s.id==="investigate")!.status.label).toContain("model check off");expect(STEPS.find(s=>s.id==="hypotheses")!.status.label).toContain("(off)");
 });
});

describe("progress comes only from what this browser holds",()=>{
 test("an empty browser shows todo or untracked everywhere, never done",()=>{
  const p=progressFor(readBrowserRecord(mem({})));
  for(const k of Object.keys(p))expect(p[Number(k)]!.state).not.toBe("done");
  expect(p[2]!.state).toBe("untracked");expect(p[7]!.state).toBe("untracked");
 });
 test("malformed or hostile storage is ignored",()=>{
  const r=readBrowserRecord(mem({"hsi-hypothesis-ledger-v1":"{bad","hsi-live-investigation-v1":"x".repeat(3_000_000),[GAP_REGISTER_KEY]:"[]","hsi-run-gaps-v1":"null"}));
  expect(r).toEqual({savedRun:false,gapStatuses:0,ledgerEntries:0,withCohortObservation:0,withTargets:0,linkedToGaps:0,loopClosed:0});
  expect(readBrowserRecord({getItem:()=>{throw Error("blocked")}}).ledgerEntries).toBe(0);
 });
 test("a full loop is recognised from real records",()=>{
  let e=edit(mk("Higher butyrate exposure improves glycaemic control in type 2 diabetes"),{linkedGapIds:["gap:a"],cohortDefinitionId:"phenotype:x"},T);
  const o=addCohortObservation(e,{definitionId:"phenotype:x",definitionTitle:"t",graphVersion:"b".repeat(64),aggregateDigest:"a".repeat(64),evaluated:200,matched:78,dataClass:"synthetic"},T);if(!o.ok)throw Error(o.error);e=o.entry;
  const t=addTargetPick(e,{ensemblId:"ENSG00000000001",symbol:"X",diseaseId:"MONDO_0005100",diseaseName:"d",score:.5,retrievedAt:T,reason:"A sufficiently long reason"},T);if(!t.ok)throw Error(t.error);e=t.entry;
  const ledger:Ledger=addEntry({},e).ledger,plain=addEntry(ledger,mk("A second hypothesis with nothing attached to it")).ledger;
  const rec=readBrowserRecord(mem({"hsi-hypothesis-ledger-v1":JSON.stringify(plain),[GAP_REGISTER_KEY]:JSON.stringify({g:{status:"open",history:[]}}),"hsi-run-gaps-v1":JSON.stringify({h:{status:"investigating",history:[]}}),"hsi-live-investigation-v1":JSON.stringify({scenarioId:"s",candidates:[]})}));
  expect(rec).toEqual({savedRun:true,gapStatuses:2,ledgerEntries:2,withCohortObservation:1,withTargets:1,linkedToGaps:1,loopClosed:1});
  const p=progressFor(rec);expect([1,3,4,5,6,8].every(k=>p[k]!.state==="done")).toBe(true);expect(p[8]!.text).toContain("links a gap");expect(p[3]!.text).toContain("2 gaps");
 });
});
