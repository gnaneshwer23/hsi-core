import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {INVESTIGATION_SCOPES,isInvestigationScopeId,reviewerScopeFor,scopeIdForDisease} from "../src/investigationScope";
import {HSI_REVIEWER_SCOPES,reviewerScopeForDisease} from "../src/db/reviewerAuthority";
import {createContextConflictAuditRunner,validateContextConflictAudit,type ContextAuditSearch,type ContextAuditTarget,type ContextConflictAudit} from "../src/evidence/contextConflictAudit";
import {contextUnit,fixtureHash} from "./fixtures/contextConflictAudit";

describe("investigation scope registry",()=>{
 test("ids are unique and registered scopes are recognised; anything else is not",()=>{
  const ids=INVESTIGATION_SCOPES.map(s=>s.id);expect(new Set(ids).size).toBe(ids.length);
  for(const id of ids)expect(isInvestigationScopeId(id)).toBe(true);
  for(const bad of ["sle","immunology","*","","SSC",null,undefined,42,{}])expect(isInvestigationScopeId(bad)).toBe(false);
 });
 test("legacy disease mapping is unchanged and unknown diseases never fall through",()=>{
  expect(scopeIdForDisease("systemic_sclerosis")).toBe("ssc");expect(scopeIdForDisease("rheumatoid_arthritis")).toBe("ra");
  for(const d of ["sle","immunology","*",null,undefined,7])expect(scopeIdForDisease(d)).toBeNull();
  expect(reviewerScopeForDisease("systemic_sclerosis")).toBe("ssc");expect(reviewerScopeForDisease("sle")).toBeNull();
 });
 test("reviewer authority is never widened by registering a scope",()=>{
  expect(reviewerScopeFor("ssc")).toBe("ssc");expect(reviewerScopeFor("ra")).toBe("ra");
  expect(reviewerScopeFor("gut-immune-metabolic")).toBeNull();
  for(const s of INVESTIGATION_SCOPES)if(s.reviewerScope!==null)expect(HSI_REVIEWER_SCOPES).toContain(s.reviewerScope);
 });
 test("engine-path files no longer hard-code the ssc|ra union",()=>{
  const files=["src/evidence/contextConflictAudit.ts","src/evidence/contextAuditArchive.ts","src/evidence/contextAuditReview.ts","src/researchOutcome.ts","src/server/contextAuditArchiveService.ts"];
  for(const f of files){const text=readFileSync(new URL("../"+f,import.meta.url),"utf8");
   expect(/['"]ssc['"]\s*\|\s*['"]ra['"]/.test(text)).toBe(false);expect(/\[\s*['"]ssc['"]\s*,\s*['"]ra['"]\s*\]/.test(text)).toBe(false);
   expect(/systemic_sclerosis['"]\s*\?\s*['"]ssc/.test(text)).toBe(false)}
 });
});

describe("the same audit engine runs under a cross-domain scope",()=>{
 const target:ContextAuditTarget={investigationId:"synthetic-cross-domain",diseaseScope:"gut-immune-metabolic",
  question:"How might gut microbial metabolites influence immune signalling and insulin resistance?",
  release:{id:"synthetic-release",version:"1",manifestHash:fixtureHash("release")}};
 function runner(stored:ContextConflictAudit[]){
  const colon=contextUnit("colon",{species:"mouse",tissueCompartment:"colon",cellType:"regulatory T cell",experimentalSystem:"in vivo"});
  const serum=contextUnit("serum",{species:"human",tissueCompartment:"serum",cellType:"monocyte",experimentalSystem:"cohort sample"});
  return createContextConflictAuditRunner({enabled:true,
   search:async(_t,intent)=>{const f=intent==="support"?colon:serum;return {intent,status:"completed_bounded",queriedAt:"2026-11-13T12:00:00Z",queryHash:fixtureHash(intent),sourceIds:[f.source.id],hits:[{id:f.unit.id,source:f.source,passage:f.passage,clearanceReceiptId:f.unit.detailedContext!.clearanceReceiptId}]} satisfies ContextAuditSearch},
   authorizePassage:async()=>true,
   extract:async hit=>structuredClone((hit.source.id===colon.source.id?colon:serum).unit),
   verify:async()=>({status:"checked_with_limitations",receiptId:"synthetic-verifier-receipt"}),
   append:async a=>{stored.push(structuredClone(a))}});
 }
 test("runs, records the registered scope and stays non-promotable with human review required",async()=>{
  const stored:ContextConflictAudit[]=[];const audit=await runner(stored).run(target);
  validateContextConflictAudit(audit);
  expect(audit.diseaseScope).toBe("gut-immune-metabolic");expect(stored).toHaveLength(1);
  expect(audit.humanReview.status).toBe("required");expect(audit.scientificApproval).toBe(false);expect(audit.graphPromotable).toBe(false);expect(audit.consensusEstablished).toBe(false);
  expect(audit.report[0]!.classification).not.toBe("consistent");
 });
 test("an unregistered scope is rejected before any search",async()=>{
  const stored:ContextConflictAudit[]=[];
  await expect(runner(stored).run({...target,diseaseScope:"sle" as unknown as ContextAuditTarget["diseaseScope"]})).rejects.toThrow();expect(stored).toEqual([]);
 });
});
