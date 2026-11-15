import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {buildGapRegister,evidenceChangedSince,parseTracking,recordStatus,type GapTracking} from "../src/knowledgeGraph/gapRegister";
import type {DomainBundle} from "../src/knowledgeGraph/domainGraph";

const bundle=JSON.parse(readFileSync("research/domain-graph/graph.v1.json","utf8")) as DomainBundle;
const reg=buildGapRegister(bundle);
describe("gap register build",()=>{
 test("one entry per recorded gap, sorted by priority, all carrying the graph version",()=>{
  expect(reg).toHaveLength(bundle.gaps.length);
  for(let i=1;i<reg.length;i++)expect(reg[i-1]!.priority.score).toBeGreaterThanOrEqual(reg[i]!.priority.score);
  expect(reg.every(r=>r.graphVersion===bundle.version)).toBe(true);
 });
 test("priority factors sum to the score and are labelled an ordering aid",()=>{
  for(const r of reg){expect(r.priority.factors.reduce((s,f)=>s+f.points,0)).toBe(r.priority.score);expect(r.priority.note).toContain("not a measure of scientific importance")}
 });
 test("uncertainty always states that nothing is reviewed; names resolved; no model text added",()=>{
  for(const r of reg){expect(r.uncertainty.reasons[0]).toContain("scientifically reviewed");expect(r.subject.name).not.toBe("");expect(r.candidateExperiments).toHaveLength(1)}
 });
 test("touching evidence only comes from candidate edges that touch a gap concept",()=>{
  const byId=new Map(bundle.edges.map(e=>[e.id,e]));
  for(const r of reg)for(const t of [...r.touching,...r.opposing]){
   const e=byId.get(t.edgeId)!;expect(e.kind).toBe("source_candidate");
   expect([e.subjectId,e.objectId].some(x=>x===r.subject.id||x===r.object.id)).toBe(true);
  }
 });
 test("a synthetic gap with human evidence and a direct edge is moderate; without is high",()=>{
  const b:DomainBundle={...bundle,nodes:[{id:"a",name:"A",kind:"k",aliases:[],domains:[]},{id:"b",name:"B",kind:"k",aliases:[],domains:[]}],
   gaps:[{id:"g",subjectId:"a",objectId:"b",question:"q",missing:"m",domains:["x"],conditions:[],nextStudy:"n"}],
   edges:[{...bundle.edges.find(e=>e.kind==="source_candidate")!,id:"e1",subjectId:"a",objectId:"b",model:"human_in_vivo",negated:false}]};
  expect(buildGapRegister(b)[0]!.uncertainty.level).toBe("moderate");
  expect(buildGapRegister({...b,edges:[{...b.edges[0]!,model:"mouse"}]})[0]!.uncertainty.level).toBe("high");
 });
});
describe("tracking",()=>{
 const e=reg[0]!;
 test("records status with graph version and evidence count; trims note; caps history",()=>{
  let t:GapTracking={};
  t=recordStatus(t,e,"investigating","2026-11-15T10:00:00Z","  "+"n".repeat(400));
  expect(t[e.id]!.status).toBe("investigating");expect(t[e.id]!.history[0]!.note!.length).toBe(300);expect(t[e.id]!.history[0]!.graphVersion).toBe(bundle.version);
  for(let i=0;i<80;i++)t=recordStatus(t,e,"open","2026-11-15T10:00:0"+(i%10)+"Z");
  expect(t[e.id]!.history.length).toBe(50);
 });
 test("rejects an unknown status",()=>{expect(recordStatus({},e,"done" as never,"x")).toEqual({})});
 test("detects changed evidence since the last recorded status",()=>{
  const t=recordStatus({},e,"open","2026-11-15T10:00:00Z");
  expect(evidenceChangedSince(t,e).changed).toBe(false);
  const more={...e,touching:[...e.touching,e.touching[0] ?? {edgeId:"x",sourceId:null,predicate:"p",assertion:"a",model:"mouse" as const,design:"d",limitations:"l",reviewStatus:"u"}]};
  const c=evidenceChangedSince(t,more);expect(c.changed).toBe(true);expect(c.to).toBe(c.from!+1);
  expect(evidenceChangedSince({},e).changed).toBe(false);
 });
 test("parseTracking drops malformed, oversized and hostile input",()=>{
  expect(parseTracking(null)).toEqual({});expect(parseTracking("{bad")).toEqual({});expect(parseTracking("[]")).toEqual({});expect(parseTracking("x".repeat(600_000))).toEqual({});
  const good=JSON.stringify({a:{status:"open",history:[{at:"t",status:"open",graphVersion:"v",touchingCount:2},{at:1,status:"open"}]},b:{status:"evil",history:[]},c:5});
  const p=parseTracking(good);expect(Object.keys(p)).toEqual(["a"]);expect(p.a!.history).toHaveLength(1);
 });
});
