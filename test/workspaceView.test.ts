import {describe,expect,test} from "bun:test";
import {buildGraph,bucketOf,counts,filterCandidates,headline,pairKey,stageRail,yearOf} from "../site/src/lib/workspaceView";

const cand=(id:string,subject:string,object:string,polarity:string,verification:string)=>({id,subject,object,polarity,verification,contexts:[],direction:"x",sentence:"s",sourceId:"s"+id}) as any;
const run:any={entities:["IL-21","Tfh","B cells","Fibrosis"],records:[{sourceId:"s1"},{sourceId:"s2"}],
 candidates:[cand("1","IL-21","Tfh","supporting","agree_directional"),cand("2","IL-21","Tfh","uncertain","not_run"),cand("3","IL-21","B cells","opposing","agree_directional"),cand("4","IL-21","B cells","supporting","agree_directional"),cand("5","IL-21","Fibrosis","uncertain","disputed")],
 events:[{stage:"scoped",status:"ok",detail:"a"},{stage:"searched",status:"partial",detail:"b"},{stage:"retrieved",status:"ok",detail:"c"},{stage:"challenged",status:"skipped",detail:"d"},{stage:"hypothesised",status:"skipped",detail:"e"}]};

describe("workspace view logic",()=>{
 test("buckets and counts are derived from the candidates",()=>{
  expect(counts(run)).toEqual({supporting:2,opposing:1,nodirection:1,unchecked:1});
  expect(bucketOf(run.candidates[1])).toBe("unchecked");
  expect(headline(run)).toMatchObject({sources:2,candidates:5,findings:3,checked:4,contradictions:2});
 });
 test("filters combine a bucket with a graph relationship",()=>{
  expect(filterCandidates(run.candidates,{bucket:"all",pair:null}).length).toBe(5);
  expect(filterCandidates(run.candidates,{bucket:"supporting",pair:null}).map((c:any)=>c.id)).toEqual(["1","4"]);
  expect(filterCandidates(run.candidates,{bucket:"all",pair:pairKey({subject:"IL-21",object:"B cells"})}).map((c:any)=>c.id)).toEqual(["3","4"]);
 });
 test("graph edges aggregate checked directions and mark disagreement as disputed; unlinked entities stay visible but unlinked",()=>{
  const g=buildGraph(run),e=Object.fromEntries(g.edges.map(x=>[x.to,x]));
  expect(e["Tfh"]).toMatchObject({state:"supporting",candidates:2,checked:1});
  expect(e["B cells"]!.state).toBe("disputed");
  expect(e["Fibrosis"]!.state).toBe("unassessed");
  expect(g.nodes.find(n=>n.id==="IL-21")!.centre).toBe(true);
  const none=buildGraph({...run,entities:[...run.entities,"STAT3"]});expect(none.nodes.find(n=>n.id==="STAT3")!.linked).toBe(false);
 });
 test("the stage rail reflects recorded events only, takes the worst status per stage, and never invents progress",()=>{
  const r=stageRail(run,false),by=Object.fromEntries(r.map(x=>[x.key,x.state]));
  expect(by).toMatchObject({plan:"done",retrieve:"partial",connect:"pending",compare:"pending",verify:"skipped",hypothesise:"skipped",brief:"pending"});
  expect(stageRail(null,false).every(s=>s.state==="pending")).toBe(true);
  const running=stageRail(null,true);expect(running.every(s=>s.state==="running"&&s.detail.includes("server"))).toBe(true);
 });
 test("year falls back to n.d.",()=>{expect(yearOf("2020-05-01")).toBe("2020");expect(yearOf(null)).toBe("n.d.");expect(yearOf("x")).toBe("n.d.")});
});
