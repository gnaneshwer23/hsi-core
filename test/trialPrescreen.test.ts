import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {emptyAudit,verifyAudit} from "../src/clinicalPlane/auditChain";
import {evaluateCohort,validateDefinition} from "../src/clinicalPlane/phenotype";
import {release,type Approval,type ReleasedAggregate,type ReleaseRequest} from "../src/clinicalPlane/releaseGate";
import {LABELS,TRIALS,summarisePrescreen,trialById,trialDefinition} from "../src/clinicalPlane/trials";
import {loadSyntheticPatients} from "../src/clinicalPlane/syntheticSource";

const GV=(JSON.parse(readFileSync("research/domain-graph/graph.v1.json","utf8")) as {version:string}).version;
const patients=loadSyntheticPatients("site/public/research/validation/v0.1");
const NOW="2026-11-15T12:00:00Z",ok:Approval={approverId:"reviewer-1",role:"release_reviewer",decision:"approve",at:NOW};
const released=(id:string)=>{
 const t=trialById(id)!,def=trialDefinition(t,GV),{aggregate}=evaluateCohort(def,patients);
 const req:ReleaseRequest={definitionId:def.id,requestedBy:"researcher-1",purpose:"Illustrative synthetic pre-screening",dataClass:"synthetic"};
 const r=release({request:req,graphVersion:GV,aggregate,approval:ok,audit:emptyAudit(),now:NOW});if(!r.ok)throw Error(r.reason);
 return {t,aggregate,r,summary:summarisePrescreen(r.finding.aggregate,t)};
};
const strings=(v:unknown):string[]=>typeof v==="string"?[v]:Array.isArray(v)?v.flatMap(strings):v&&typeof v==="object"?Object.values(v).flatMap(strings):[];

describe("trial fixtures",()=>{
 test("both trials are valid computable definitions with human-review items kept apart",()=>{
  expect(TRIALS.length).toBeGreaterThanOrEqual(2);
  for(const t of TRIALS){expect(validateDefinition(trialDefinition(t,GV)).ok).toBe(true);expect(t.humanReview.length).toBeGreaterThan(0);expect(t.origin).toBe("synthetic_illustrative");expect(t.note).toContain("not a real study")}
 });
});

describe("pre-screening over the 200 synthetic profiles",()=>{
 test("a trial with enough matches releases counts; categories partition the evaluated profiles",()=>{
  const {aggregate,summary,r}=released("trial:synthetic-metabolic-addon-illustrative");
  expect(aggregate.counts.matched+aggregate.counts.excluded+aggregate.counts.indeterminate).toBe(200);
  expect(summary.categories.map(c=>c.label)).toEqual([LABELS.possible,LABELS.not,LABELS.insufficient]);
  expect(summary.categories[0]!.count).toBe(aggregate.counts.matched);expect(summary.feasibility.possible).toBe(aggregate.counts.matched);expect(summary.feasibility.text).toContain("not an enrolment forecast");
  expect(summary.humanReview).toContain("Able to give informed consent");expect(summary.notes[0]).toContain("still needs a person");
  const b=summary.blockers;for(let i=1;i<b.length;i++)expect(b[i-1]!.count).toBeGreaterThanOrEqual(b[i]!.count);
  expect(b[0]!.label).toContain("HbA1c");expect(verifyAudit(r.audit)).toBeNull();
 });
 test("a small trial group is suppressed: no count and no feasibility figure is invented",()=>{
  const {summary,r}=released("trial:synthetic-ra-biologic-naive-illustrative");
  expect(summary.categories[0]!.count).toBeNull();expect(summary.feasibility.possible).toBeNull();expect(summary.feasibility.text).toContain("hidden to protect small groups");
  expect(Object.values(r.finding.aggregate.matchedBySex).every(v=>v===null)).toBe(true);
  expect(summary.notes.join(" ")).toContain("hidden because the group is smaller than 10");
 });
 test("the output never calls anyone simply eligible",()=>{
  for(const id of TRIALS.map(t=>t.id)){
   const {summary}=released(id);
   const text=strings(summary).join(" | ").replace(/possibly[ -]eligible/gi,"").replace(/not eligible/gi,"");
   expect(/\beligible\b/i.test(text)).toBe(false);
  }
  expect(Object.keys(LABELS).sort()).toEqual(["insufficient","not","possible"]);
 });
 test("summarising a released aggregate never fills a hidden value",()=>{
  const t=trialById(TRIALS[0]!.id)!;
  const r:ReleasedAggregate={schema:"hsi-released-cohort-aggregate-1",definitionId:t.id,dataClass:"synthetic",smallCellThreshold:10,counts:{evaluated:200,matched:null,excluded:null,indeterminate:30},
   attrition:[{kind:"include",label:"A",counts:{met:null,notMet:null,unknown:0}},{kind:"exclude",label:"B",counts:{met:25,notMet:175,unknown:0}}],matchedBySex:{},matchedByCondition:{},labSummary:[],suppression:{cellsSuppressed:3,complementary:0,totalsWithheld:[]}};
  const s=summarisePrescreen(r,t);
  expect(s.categories.map(c=>c.count)).toEqual([null,null,30]);expect(s.blockers).toEqual([{label:"B",kind:"exclude",count:25}]);expect(s.blockersWithheld).toBe(1);
 });
 test("unknown trial ids are not found",()=>{expect(trialById("trial:nope")).toBeNull()});
});
