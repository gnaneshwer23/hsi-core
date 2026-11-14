import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {parseDomainBundle} from "../src/knowledgeGraph/domainGraph";
import {buildInvestigationRecord,buildSelectionContext} from "../src/knowledgeGraph/graphAgents";
import {createGraphWorkspace,type UnsafeSql} from "../src/db/graphWorkspaceStore";
import type {CandidateMappingsFile} from "../src/ontology/mappingReview";

const g=parseDomainBundle(JSON.parse(readFileSync("research/domain-graph/graph.v1.json","utf8")));
const file=JSON.parse(readFileSync("research/ontology/candidate-mappings.v1.json","utf8")) as CandidateMappingsFile;
const cand=g.edges.filter(e=>e.kind==="source_candidate");
const rec=(q:string)=>buildInvestigationRecord(g,buildSelectionContext(g,{investigationId:"inv-unit-001",graphVersion:g.version,question:q,edgeIds:[cand[0]!.id,cand[1]!.id]}));
const TOKEN_A="tokenAAAAAAAAAAAAAAAA",TOKEN_B="tokenBBBBBBBBBBBBBBBB";

/** In-memory stand-in for the six procedures: owner comes from the token, never from a parameter. */
function fakeDb(){
 const owners:Record<string,string>={[TOKEN_A]:"A",[TOKEN_B]:"B"};
 const inv:any[]=[],recs:any[]=[],calls:string[]=[];
 const who=(t:unknown)=>{const o=owners[String(t)];if(!o)throw Error("Invalid authenticated session");return o};
 const sql:UnsafeSql={async unsafe(q,p=[]){
  const fn=/public\.(hsi_graph_\w+)/.exec(q)![1]!;calls.push(fn);const o=who(p[0]);
  if(fn==="hsi_graph_save_investigation"){inv.push({owner:o,investigationId:p[1],revision:p[2],graphVersion:p[3],digest:p[4],previousDigest:p[5],record:p[6],savedAt:new Date().toISOString(),reviewStatus:"unreviewed"});return [{r:p[2]}]}
  if(fn==="hsi_graph_list_investigations"){const mine=inv.filter(x=>x.owner===o);const ids=[...new Set(mine.map(x=>x.investigationId))];return [{r:ids.map(id=>{const l=mine.filter(x=>x.investigationId===id).sort((a,b)=>b.revision-a.revision)[0];return {investigationId:id,latestRevision:l.revision,savedAt:l.savedAt,question:l.record.context.question,graphVersion:l.graphVersion}})}]}
  if(fn==="hsi_graph_get_investigation"){const x=inv.find(i=>i.owner===o&&i.investigationId===p[1]&&i.revision===p[2]);return [{r:x?{...x}:null}]}
  if(fn==="hsi_graph_record_recommendation"){recs.push({owner:o,conceptId:p[1],revision:p[2],decision:p[3],ontologyPrefix:p[4],ontologyRelease:p[5],ontologyTermId:p[6],reason:p[7],reviewerLabel:p[8],reviewerVerified:true,candidatesDigest:p[9],digest:p[10],previousDigest:p[11],decidedAt:p[12]});return [{r:p[2]}]}
  if(fn==="hsi_graph_list_recommendations")return [{r:recs.filter(x=>x.owner===o).sort((a,b)=>a.conceptId.localeCompare(b.conceptId)||a.revision-b.revision)}];
  if(fn==="hsi_graph_ontology_lookup")return [{r:[]}];
  throw Error("unknown call "+fn);
 }};
 return {sql,inv,recs,calls};
}

describe("graph workspace adapter",()=>{
 test("refuses a malformed session token before any call",()=>{
  const db=fakeDb();expect(()=>createGraphWorkspace(db.sql,"short")).toThrow("session token");expect(db.calls).toEqual([]);
 });
 test("saves, no-ops on an identical record, chains a second revision, and passes the record as an object",async()=>{
  const db=fakeDb(),w=createGraphWorkspace(db.sql,TOKEN_A);
  const r1=await w.investigations.save(g,rec("What does the graph record here?"));expect(r1.status).toBe("saved");
  expect(typeof db.inv[0].record).toBe("object");expect(db.inv[0].previousDigest).toBeNull();
  expect((await w.investigations.save(g,rec("What does the graph record here?"))).status).toBe("unchanged");
  const r2=await w.investigations.save(g,rec("A different question about this pair?"));
  expect(r2.status==="saved"&&r2.saved.revision===2&&r2.saved.previousDigest===(r1.status==="saved"?r1.saved.digest:"")).toBe(true);
  expect((await w.investigations.list())[0]).toMatchObject({investigationId:"inv-unit-001",latestRevision:2});
 });
 test("never sends an owner or principal parameter; the token is always the first argument",async()=>{
  const db=fakeDb(),w=createGraphWorkspace(db.sql,TOKEN_A);await w.investigations.save(g,rec("What does the graph record here?"));await w.investigations.list();
  const seen:unknown[][]=[];const spy:UnsafeSql={unsafe:(q,p)=>{seen.push(p??[]);return db.sql.unsafe(q,p)}};
  await createGraphWorkspace(spy,TOKEN_A).investigations.list();expect(seen.every(p=>p[0]===TOKEN_A)).toBe(true);expect(JSON.stringify(seen)).not.toContain('"owner');
 });
 test("another session sees nothing; a forged token fails at the database",async()=>{
  const db=fakeDb();await createGraphWorkspace(db.sql,TOKEN_A).investigations.save(g,rec("What does the graph record here?"));
  const b=createGraphWorkspace(db.sql,TOKEN_B);expect(await b.investigations.list()).toEqual([]);expect(await b.investigations.get("inv-unit-001",1)).toBeNull();
  await expect(createGraphWorkspace(db.sql,"forgedtokenforgedtoken").investigations.list()).rejects.toThrow("Invalid authenticated session");
 });
 test("refuses to return a record whose digest or approval flag was altered in the database",async()=>{
  const db=fakeDb(),w=createGraphWorkspace(db.sql,TOKEN_A);await w.investigations.save(g,rec("What does the graph record here?"));
  db.inv[0].record={...db.inv[0].record,context:{...db.inv[0].record.context,question:"Edited underneath the application"}};
  await expect(w.investigations.get("inv-unit-001",1)).rejects.toThrow("digest");
  db.inv[0].reviewStatus="approved";await expect(w.investigations.get("inv-unit-001",1)).rejects.toThrow("approval");
 });
 test("records recommendations with the term's release, chains revisions, and keeps them unverified and unapproved",async()=>{
  const db=fakeDb(),w=createGraphWorkspace(db.sql,TOKEN_A),m=file.mappings.find(x=>x.candidates.length>0)!;
  const input={conceptId:m.conceptId,decision:"accept_candidate" as const,ontologyId:m.candidates[0]!.id,reason:"Label and definition match the concept.",reviewerLabel:"Curator A"};
  const d1=await w.recommendations.record(file,input);expect(d1.status).toBe("saved");
  const row=db.recs[0];expect(row.ontologyPrefix).toBe(m.candidates[0]!.id.split(":")[0]);expect(row.ontologyRelease).toBe(file.ontologies.find(o=>o.prefix===row.ontologyPrefix)!.release);
  expect((await w.recommendations.record(file,input)).status).toBe("unchanged");
  const d2=await w.recommendations.record(file,{...input,decision:"reject_candidate",reason:"On reflection the term is broader than the concept."});expect(d2.decision.revision).toBe(2);
  const listed=(await w.recommendations.list(file)).get(m.conceptId)!;
  expect(listed.length).toBe(2);expect(listed.every(x=>x.decision.exactMappingApproved===false&&x.decision.status==="curator_recommendation_unverified"&&x.identityVerifiedByServer)).toBe(true);
  expect((await createGraphWorkspace(db.sql,TOKEN_B).recommendations.list(file)).size).toBe(0);
 });
 test("refuses stored recommendations that were edited or whose chain is broken",async()=>{
  const db=fakeDb(),w=createGraphWorkspace(db.sql,TOKEN_A),m=file.mappings.find(x=>x.candidates.length>0)!;
  const input={conceptId:m.conceptId,decision:"accept_candidate" as const,ontologyId:m.candidates[0]!.id,reason:"Label and definition match the concept.",reviewerLabel:"Curator A"};
  await w.recommendations.record(file,input);await w.recommendations.record(file,{...input,decision:"defer",ontologyId:null,reason:"Need the definition checked first."});
  db.recs[0].reason="Edited after recording by hand.";await expect(w.recommendations.list(file)).rejects.toThrow("digest");
  db.recs[0].reason=input.reason;db.recs[1].previousDigest="0".repeat(64);await expect(w.recommendations.list(file)).rejects.toThrow("digest");
 });
 test("the module is not imported by any runtime entry point",()=>{
  const {execSync}=require("node:child_process") as typeof import("node:child_process");
  const hits=execSync("grep -rl graphWorkspaceStore src site/src site/api scripts --include=*.ts --include=*.tsx || true",{encoding:"utf8"}).split("\n").filter(Boolean);
  expect(hits.sort()).toEqual(["scripts/verify-graph-workspace-local.ts"]);
 });
});
