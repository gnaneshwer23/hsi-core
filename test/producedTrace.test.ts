import {describe,expect,test} from "bun:test";
import {buildProducedTrace} from "../site/src/lib/producedTrace";
import type {LiveInvestigation} from "../src/investigation/liveRun";
import type {RadarResult} from "../src/investigation/radar";
import type {RelatedWorksResult} from "../src/evidence/openAlexRelatedWorks";

const live={
 schemaVersion:"hsi-live-investigation-1",
 mode:"live",
 scenarioId:"il21",
 question:"q",
 version:1,
 entities:["IL-21"],
 events:[
  {stage:"scoped",at:"2026-11-17T12:00:00.000Z",status:"ok",detail:"Scoped to IL-21"},
  {stage:"searched",at:"2026-11-17T12:00:01.000Z",status:"ok",detail:"Europe PMC ok"},
  {stage:"brief",at:"2026-11-17T12:00:05.000Z",status:"ok",detail:"Brief assembled"},
 ],
 searches:[{provider:"europe-pmc",context:"ra",status:"ok",count:2,error:null,query:"x"},{provider:"openalex",context:"ra",status:"failed",count:0,error:"503",query:"y"}],
 records:[],
 targets:[],
 candidates:[],
 byContext:{},
 verification:{status:"not_configured",reason:"no verifiers",checked:0,independence:null},
 hypotheses:{status:"skipped",reason:"n/a",items:[]},
 gaps:[],
 budget:null,
 flags:{scientificApproval:false,graphPromotable:false,consensusEstablished:false,humanReview:"required",clinicalAdvice:false,containsPhi:false},
 briefHash:"abc",
} as unknown as LiveInvestigation;

const radar={
 schemaVersion:"hsi-radar-1",
 generatedAt:"2026-11-17T12:00:00.000Z",
 window:{days:7,from:"2026-11-10",to:"2026-11-17"},
 topics:[{topic:"IL-21",status:"ok",error:null,newCount:3,papers:[],trend:null,trendError:null}],
 own:{status:"ok",error:null,papers:[],unresolved:[]},
 note:"Generated now from Europe PMC and OpenAlex.",
} satisfies RadarResult;

const related={
 schemaVersion:"hsi-related-works-1",
 status:"ok",
 error:null,
 seed:{title:"Seed",sourceId:"openalex:W1",url:"https://openalex.org/W1",doi:null,pmid:null,date:null,journal:null,citedBy:null,retraction:"unknown",preprint:false,relatedWorkIds:[]},
 related:[],
 unresolvedRelatedIds:[],
 note:"OpenAlex related_works metadata only.",
} satisfies RelatedWorksResult;

describe("buildProducedTrace (A5.3)",()=>{
 test("fail-closed when there is no run",()=>{
  const v=buildProducedTrace(null);
  expect(v.empty).toBe(true);
  expect(v.steps[0]).toMatch(/No run record/);
  expect(v.capabilities.some(c=>c.href==="/status")).toBe(true);
 });
 test("running does not invent stage progress",()=>{
  const v=buildProducedTrace({kind:"running"});
  expect(v.empty).toBe(false);
  expect(v.steps.join(" ")).toMatch(/when the run record returns/);
  expect(v.steps.join(" ")).not.toMatch(/Retrieve · done/i);
 });
 test("live steps come from events and searches",()=>{
  const v=buildProducedTrace({kind:"live",run:live});
  expect(v.empty).toBe(false);
  expect(v.steps.some(s=>s.includes("scoped"))).toBe(true);
  expect(v.steps.join(" ")).toMatch(/1 ok, 1 failed/);
  expect(v.steps.join(" ")).toMatch(/Scientific approval: false/);
  expect(v.capabilities.some(c=>c.id==="F-12")).toBe(true);
 });
 test("ask combines router honesty with the live record",()=>{
  const v=buildProducedTrace({
   kind:"ask",
   trace:{matchedBy:"keyword overlap",question:"q",sources:["europe-pmc","openalex"],modelCheck:"not_configured"},
   run:live,
  });
  expect(v.steps[0]).toMatch(/matched to a curated investigation/);
  expect(v.steps.join(" ")).toMatch(/europe-pmc/);
  expect(v.note).toMatch(/Agent product names are not/);
 });
 test("radar and related-works stay honest on failure",()=>{
  expect(buildProducedTrace({kind:"radar",run:radar}).steps.join(" ")).toMatch(/IL-21/);
  const miss=buildProducedTrace({kind:"related-works",run:{...related,status:"seed_not_found",error:"missing",seed:null}});
  expect(miss.empty).toBe(true);
  expect(miss.steps[0]).toMatch(/missing|not found/i);
 });
});
