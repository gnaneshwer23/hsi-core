import {describe,expect,test} from "bun:test";
import {addEntry,createEntry,edit,fromRunHypothesis,LIMITS,missingForTest,parseLedger,recordOutcome,setStatus,type LedgerEntry} from "../src/investigation/hypothesisLedger";

const T="2026-11-15T10:00:00Z";
const full={statement:"Blocking IL-21 reduces Tfh expansion in systemic sclerosis cells.",prediction:"Lower Tfh fraction after blockade",experiment:"Ex vivo blockade with matched controls",falsifier:"No change in Tfh fraction versus control",origin:{kind:"researcher" as const}};
const mk=(o:Record<string,unknown>={}):LedgerEntry=>{const r=createEntry({...full,...o} as never,T);if(!r.ok)throw Error(r.error);return r.entry};

describe("create",()=>{
 test("requires a real statement; clips long fields; entries are always unvalidated and proposed",()=>{
  expect(createEntry({statement:"short",origin:{kind:"researcher"}},T).ok).toBe(false);
  const e=mk({statement:"x".repeat(900)+" valid",rationale:"r".repeat(2000)});
  expect(e.statement.length).toBeLessThanOrEqual(LIMITS.statement);expect(e.rationale.length).toBeLessThanOrEqual(LIMITS.field);
  expect(e.status).toBe("proposed");expect(e.outcome).toBe("none");expect(e.unvalidated).toBe(true);expect(e.history[0]!.type).toBe("created");
 });
 test("researcher ids are stable and case-insensitive; model ids depend on the run, not the text",()=>{
  expect(mk().id).toBe(mk({statement:full.statement.toUpperCase()}).id);
  const m=(h:string)=>createEntry({...full,origin:{kind:"model_proposal",scenarioId:"s",runHash:h,proposalId:"h1",proposedBy:"v"}},T);
  const a=m("run1"),b=m("run2"),c=m("run1");expect(a.ok&&b.ok&&c.ok&&a.entry.id!==b.entry.id&&a.entry.id===c.entry.id).toBe(true);
 });
 test("duplicates are not added twice; the cap is enforced",()=>{
  const e=mk(),l1=addEntry({},e);expect(l1.added).toBe(true);expect(addEntry(l1.ledger,e).added).toBe(false);
  let l:Record<string,LedgerEntry>={};for(let i=0;i<LIMITS.entries;i++)l[String(i)]={...e,id:"hyp:"+i};
  const r=addEntry(l,mk({statement:"A brand new hypothesis about something else entirely"}));expect(r.added).toBe(false);expect(r.error).toContain("at most");
 });
});

describe("rules",()=>{
 test("testing needs a prediction, an experiment and a falsifier",()=>{
  const bare=mk({prediction:"",experiment:"",falsifier:""});expect(missingForTest(bare)).toEqual(["a prediction","an experiment","a falsifier"]);
  const r=setStatus(bare,"testing",T);expect(r.ok).toBe(false);if(!r.ok)expect(r.error).toContain("falsifier");
  expect(setStatus(mk(),"testing",T).ok).toBe(true);
  expect(setStatus(bare,"parked",T).ok).toBe(true);
 });
 test("an outcome needs testing status and a real note, and is labelled the researcher's observation",()=>{
  const e=mk(),testing=(setStatus(e,"testing",T) as {entry:LedgerEntry}).entry;
  expect(recordOutcome(e,"consistent","Saw a lower Tfh fraction in 3 of 4 donors",T).ok).toBe(false);
  const short=recordOutcome(testing,"consistent","ok",T);expect(short.ok).toBe(false);if(!short.ok)expect(short.error).toContain("not a validation");
  expect(recordOutcome(testing,"none","Saw a lower Tfh fraction in 3 of 4 donors",T).ok).toBe(false);
  const ok=recordOutcome(testing,"inconclusive","Too few donors to tell either way",T);expect(ok.ok&&ok.entry.outcome).toBe("inconclusive");
 });
 test("history records each change and is capped",()=>{
  let e=mk();for(let i=0;i<150;i++)e=edit(e,{limits:"l"+i},T);
  expect(e.history.length).toBe(LIMITS.history);expect(edit(e,{linkedGapIds:["gap:a","gap:a","gap:b"]},T).linkedGapIds).toEqual(["gap:a","gap:b"]);
  expect(edit(e,{cohortDefinitionId:"phenotype:x"},T).history.at(-1)!.type).toBe("linked");
 });
 test("status never claims validation: there is no validated status or outcome",()=>{
  expect(setStatus(mk(),"validated" as never,T).ok).toBe(false);expect(recordOutcome((setStatus(mk(),"testing",T) as {entry:LedgerEntry}).entry,"proven" as never,"A long enough note here",T).ok).toBe(false);
 });
});

describe("from a run",()=>{
 const run={scenarioId:"il21",briefHash:"abc",candidates:[{id:"c1",sourceId:"s1"},{id:"c2",sourceId:"s2"},{id:"c3",sourceId:"s3"}]};
 const h={id:"h1",statement:"IL-21 drives Tfh expansion in SSc",rationale:"r",prediction:"p",experiment:"e",falsifier:"f",limits:"l",citedClaimIds:["c1","c3"],generatedBy:{verifier:"openai-a",model:"m1"}};
 test("keeps the proposal text, cites its claims and their sources, and records the proposer",()=>{
  const r=fromRunHypothesis(run,h,T,["rg:il21:x"]);expect(r.ok).toBe(true);if(!r.ok)return;
  expect(r.entry.statement).toBe(h.statement);expect(r.entry.citedSourceIds).toEqual(["s1","s3"]);expect(r.entry.linkedGapIds).toEqual(["rg:il21:x"]);
  expect(r.entry.origin).toMatchObject({kind:"model_proposal",proposedBy:"openai-a (m1)"});
 });
});

describe("parseLedger",()=>{
 test("drops hostile or malformed data and re-applies the testing rule",()=>{
  expect(parseLedger(null)).toEqual({});expect(parseLedger("{bad")).toEqual({});expect(parseLedger("[]")).toEqual({});expect(parseLedger("x".repeat(2_000_000))).toEqual({});
  const bare=mk({statement:"A hypothesis with no test plan stated at all",prediction:"",experiment:"",falsifier:""});
  const raw=JSON.stringify({a:{...mk(),status:"testing",outcome:"consistent",outcomeNote:"n".repeat(900)},b:{...bare,status:"testing"},c:{statement:"x"},d:5,e:{...mk({statement:"Another well formed hypothesis statement"}),status:"validated",unvalidated:false}});
  const p=parseLedger(raw),vals=Object.values(p);
  expect(vals).toHaveLength(3);
  expect(vals.every(v=>v.unvalidated===true)).toBe(true);
  expect(vals.find(v=>!v.falsifier)!.status).toBe("proposed");
  expect(vals.find(v=>v.outcomeNote.length>0)!.outcomeNote.length).toBe(LIMITS.note);
  expect(vals.find(v=>v.statement.startsWith("Another"))!.status).toBe("proposed");
 });
 test("round-trips a valid ledger",()=>{
  const e=mk(),l=addEntry({},e).ledger;expect(Object.values(parseLedger(JSON.stringify(l)))[0]).toEqual(e);
 });
});
