import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {exportDecisions,history,latestDecisions,memoryStore,recordDecision,verifyDecisions,type CandidateMappingsFile,type KeyValueStore} from "../src/ontology/mappingReview";

const file=JSON.parse(readFileSync("research/ontology/candidate-mappings.v1.json","utf8")) as CandidateMappingsFile;
const withCand=file.mappings.filter(m=>m.candidates.length>0),c0=withCand[0]!,c1=withCand[1]!;
const at=()=>new Date("2026-11-14T12:00:00Z");
const accept=(m=c0,reason="Label and synonym agree with the disease definition.")=>({conceptId:m.conceptId,decision:"accept_candidate" as const,ontologyId:m.candidates[0]!.id,reason,reviewerLabel:"Curator A"});

describe("curator mapping review",()=>{
 test("records a recommendation that is unverified and never an approved mapping",async()=>{
  const s=memoryStore(),r=await recordDecision(file,s,accept(),at);
  expect(r.status).toBe("saved");expect(r.decision).toMatchObject({revision:1,previousDigest:null,reviewerVerified:false,exactMappingApproved:false,status:"curator_recommendation_unverified"});
  expect(latestDecisions(file,s).get(c0.conceptId)?.decision).toBe("accept_candidate");
 });
 test("an identical decision is a no-op; a change adds a chained revision and the history is verifiable",async()=>{
  const s=memoryStore();await recordDecision(file,s,accept(),at);
  expect((await recordDecision(file,s,accept(),at)).status).toBe("unchanged");
  const second=await recordDecision(file,s,{...accept(),decision:"reject_candidate",reason:"On reflection the term is broader than the concept."},at);
  expect(second.decision.revision).toBe(2);expect(second.decision.previousDigest).toBe(history(s,c0.conceptId)[0]!.digest);
  expect(await verifyDecisions(file,s)).toEqual([]);
 });
 test("refuses unknown concepts, terms that are not candidates, missing or identifying reasons, and bad reviewer labels",async()=>{
  const s=memoryStore();
  await expect(recordDecision(file,s,{...accept(),conceptId:"concept:nope"},at)).rejects.toThrow("Unknown concept");
  await expect(recordDecision(file,s,{...accept(),ontologyId:"MONDO:9999999"},at)).rejects.toThrow("candidates");
  await expect(recordDecision(file,s,{...accept(),reason:"short"},at)).rejects.toThrow("reason");
  await expect(recordDecision(file,s,{...accept(),reason:"Seen in patient 943 476 5919 notes, so accept."},at)).rejects.toThrow("identifiers");
  await expect(recordDecision(file,s,{...accept(),reviewerLabel:"<script>"},at)).rejects.toThrow("reviewer label");
  await expect(recordDecision(file,s,{...accept(),decision:"defer"},at)).rejects.toThrow("deferral");
  const unmapped=file.mappings.find(m=>m.candidates.length===0)!;
  await expect(recordDecision(file,s,{conceptId:unmapped.conceptId,decision:"defer",ontologyId:null,reason:"Nothing to review here at all.",reviewerLabel:"Curator A"},at)).rejects.toThrow("no candidate");
  expect(s.keys()).toEqual([]);
 });
 test("deferral names no candidate",async()=>{
  const s=memoryStore(),r=await recordDecision(file,s,{conceptId:c1.conceptId,decision:"defer",ontologyId:null,reason:"Need the term definition checked first.",reviewerLabel:"Curator B"},at);
  expect(r.decision.ontologyId).toBeNull();
 });
 test("detects tampering, forged approval and a broken chain",async()=>{
  const s=memoryStore();await recordDecision(file,s,accept(),at);await recordDecision(file,s,{...accept(),reason:"A different but sufficient reason."},at);
  const key=s.keys().sort()[0]!,v=JSON.parse(s.get(key)!);v.reason="Edited after recording, no longer matching.";
  const t1:KeyValueStore={get:k=>k===key?JSON.stringify(v):s.get(k),create:s.create,keys:s.keys};
  expect((await verifyDecisions(file,t1)).join()).toContain("digest");
  const forged=JSON.parse(s.get(key)!);forged.exactMappingApproved=true;
  const t2:KeyValueStore={get:k=>k===key?JSON.stringify(forged):s.get(k),create:s.create,keys:s.keys};
  expect((await verifyDecisions(file,t2)).join()).toContain("claims approval");
  const k2=s.keys().sort()[1]!,broken=JSON.parse(s.get(k2)!);broken.previousDigest="0".repeat(64);
  const t3:KeyValueStore={get:k=>k===k2?JSON.stringify(broken):s.get(k),create:s.create,keys:s.keys};
  expect((await verifyDecisions(file,t3)).join()).toContain("breaks the chain");
 });
 test("export carries counts, the mappings digest and the no-approval statement; it refuses tampered history",async()=>{
  const s=memoryStore();await recordDecision(file,s,accept(),at);await recordDecision(file,s,{conceptId:c1.conceptId,decision:"defer",ontologyId:null,reason:"Need the term definition checked first.",reviewerLabel:"Curator B"},at);
  const e=await exportDecisions(file,s,at);
  expect(e.counts).toMatchObject({withCandidates:withCand.length,decided:2,accept_candidate:1,defer:1,pending:withCand.length-2});
  expect(e.mappingsDigest).toMatch(/^[0-9a-f]{64}$/);expect(e.decisions.every(d=>d.exactMappingApproved===false)).toBe(true);expect(e.statement).toContain("independent human review");
  const key=s.keys()[0]!,v=JSON.parse(s.get(key)!);v.reason="Tampered text after the fact.";
  await expect(exportDecisions(file,{get:k=>k===key?JSON.stringify(v):s.get(k),create:s.create,keys:s.keys},at)).rejects.toThrow("failed verification");
 });
 test("never overwrites a stored revision",()=>{const s=memoryStore();s.create("hsi-map:x:000001","a");expect(()=>s.create("hsi-map:x:000001","b")).toThrow()});
});
