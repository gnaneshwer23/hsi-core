import {describe,expect,test} from "bun:test";
import {mkdtempSync,readFileSync,readdirSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {readFileSync as rf} from "node:fs";
import {parseDomainBundle} from "../src/knowledgeGraph/domainGraph";
import {buildInvestigationRecord,buildSelectionContext} from "../src/knowledgeGraph/graphAgents";
import {browserStore,listInvestigations,loadInvestigation,memoryStore,saveInvestigation,type KeyValueStore} from "../src/knowledgeGraph/investigationStore";
import {fileStore} from "../src/knowledgeGraph/investigationFileStore";

const g=parseDomainBundle(JSON.parse(rf("research/domain-graph/graph.v1.json","utf8")));
const cand=g.edges.filter(e=>e.kind==="source_candidate");
const rec=(id="inv-save-001",q="What does the graph record here?")=>buildInvestigationRecord(g,buildSelectionContext(g,{investigationId:id,graphVersion:g.version,question:q,edgeIds:[cand[0]!.id,cand[1]!.id]}));
const at=()=>new Date("2026-11-14T10:00:00Z");

describe("investigation store",()=>{
 test("saves a reproducible record as an unreviewed, unapproved revision and lists it",async()=>{
  const s=memoryStore(),r=await saveInvestigation(g,s,rec(),at);
  expect(r.status).toBe("saved");expect(r.saved.revision).toBe(1);expect(r.saved.previousDigest).toBeNull();
  expect(r.saved.scientificApproval).toBe(false);expect(r.saved.reviewStatus).toBe("unreviewed");
  expect(listInvestigations(s)).toEqual([{investigationId:"inv-save-001",latestRevision:1,savedAt:"2026-11-14T10:00:00.000Z",question:"What does the graph record here?",graphVersion:g.version}]);
 });
 test("saving the same record again is a no-op; a changed record adds a chained revision",async()=>{
  const s=memoryStore();await saveInvestigation(g,s,rec(),at);
  expect((await saveInvestigation(g,s,rec(),at)).status).toBe("unchanged");
  const two=await saveInvestigation(g,s,rec("inv-save-001","A different question about this pair?"),at);
  expect(two.status).toBe("saved");expect(two.saved.revision).toBe(2);
  const first=await loadInvestigation(s,"inv-save-001",1,g);expect(two.saved.previousDigest).toBe(first!.saved.digest);
  const loaded=await loadInvestigation(s,"inv-save-001",2,g);expect(loaded!.intact).toBe(true);expect(loaded!.reproducible).toBe(true);expect(loaded!.problems).toEqual([]);
 });
 test("refuses a record that does not reproduce, or a forged approval",async()=>{
  const s=memoryStore(),bad=rec();(bad.responses[0] as any).findings=[{kind:"x",title:"forged",detail:"",refs:{nodeIds:[],edgeIds:[],sourceIds:[]}}];
  await expect(saveInvestigation(g,s,bad,at)).rejects.toThrow("reproducible");
  const forged=rec();(forged as any).scientificApproval=true;
  await expect(saveInvestigation(g,s,forged,at)).rejects.toThrow();
  expect(s.keys()).toEqual([]);
 });
 test("detects tampering with stored content and a broken chain",async()=>{
  const s=memoryStore();await saveInvestigation(g,s,rec(),at);await saveInvestigation(g,s,rec("inv-save-001","Another question for this pair?"),at);
  const key=s.keys().sort()[0]!,v=JSON.parse(s.get(key)!);v.record.context.question="Edited afterwards for review";
  const tampered:KeyValueStore={get:k=>k===key?JSON.stringify(v):s.get(k),create:s.create,keys:s.keys};
  const l1=await loadInvestigation(tampered,"inv-save-001",1);expect(l1!.intact).toBe(false);expect(l1!.problems.join()).toContain("digest");
  const l2=await loadInvestigation(tampered,"inv-save-001",2);expect(l2!.intact).toBe(true);
 });
 test("never overwrites a revision",()=>{
  const s=memoryStore();s.create("hsi-inv:a:000001","x");expect(()=>s.create("hsi-inv:a:000001","y")).toThrow();
 });
 test("a record saved against one graph version is reported as not reproducible against another",async()=>{
  const s=memoryStore();await saveInvestigation(g,s,rec(),at);
  const other={...g,version:"f".repeat(64)};
  const l=await loadInvestigation(s,"inv-save-001",1,other);expect(l!.reproducible).toBe(false);expect(l!.problems.join()).toContain("Graph version");
 });
 test("rejects invalid investigation ids",async()=>{
  const r=rec();(r.context as any).investigationId="../x";
  await expect(saveInvestigation(g,memoryStore(),r,at)).rejects.toThrow();
 });
 test("file store keeps one immutable file per revision",async()=>{
  const dir=mkdtempSync(join(tmpdir(),"hsi-inv-")),s=fileStore(dir);
  await saveInvestigation(g,s,rec(),at);await saveInvestigation(g,s,rec("inv-save-001","Another question for this pair?"),at);
  expect(readdirSync(dir).length).toBe(2);
  expect(()=>s.create(s.keys()[0]!,"overwrite")).toThrow();
  const l=await loadInvestigation(fileStore(dir),"inv-save-001",2,g);expect(l!.intact&&l!.reproducible).toBe(true);
  expect(JSON.parse(readFileSync(join(dir,readdirSync(dir).sort()[0]!),"utf8")).scientificApproval).toBe(false);
 });
 test("browser adapter degrades to null when storage is blocked",()=>{
  const blocked={setItem(){throw Error("blocked")},getItem(){return null},removeItem(){},key(){return null},length:0} as unknown as Storage;
  expect(browserStore(blocked)).toBeNull();
 });
});
