import {test,expect} from "bun:test";
import {executeResearchGateway,type GatewayDependencies} from "../src/p1ResearchGateway";
import type {PublishedReleaseSnapshot} from "../src/graphRelease";
const snapshot:PublishedReleaseSnapshot={
 manifest:{schemaVersion:"hsi-graph-release-1",releaseId:"HSI-GR-TEST",releaseVersion:"1.0.0",
 generatedAt:"2026-11-04T00:00:00Z",claimIds:[],manifestHash:"a".repeat(64),status:"published"},
 claims:[]};
const actor={principalId:"scientist-1",authenticated:true as const,roles:["researcher"]};
function deps():GatewayDependencies{
 return {authenticate:async()=>actor,
 loadVerifiedRelease:async()=>({snapshot,verifiedBy:"hsi_authoritative_store"}),
 saveRun:async({runId})=>({id:runId,stored:true})};
}
test("gateway records a bounded investigation and returns distinct execution IDs",async()=>{
 const input={question:"Which SSc pathways have approved evidence?",releaseVersion:"1.0.0",dataClass:"public_biomedical" as const};
 const a=await executeResearchGateway(input,deps());
 const b=await executeResearchGateway(input,deps());
 expect(a.runId).not.toBe(b.runId);
 expect(a.investigation.status).toBe("insufficient_evidence");
 expect(a.investigation.id).toBe(b.investigation.id);
});
test("gateway rejects unauthenticated callers before reading graph",async()=>{
 let loaded=false;const d=deps();
 d.authenticate=async()=>null;
 d.loadVerifiedRelease=async()=>{loaded=true;throw Error("must not load")};
 await expect(executeResearchGateway({question:"SSc?",releaseVersion:"1.0.0",dataClass:"public_biomedical"},d)).rejects.toThrow();
 expect(loaded).toBe(false);
});
test("gateway rejects unverified or mismatched releases",async()=>{
 const d=deps();
 d.loadVerifiedRelease=async()=>({snapshot,verifiedBy:"unverified" as "hsi_authoritative_store"});
 await expect(executeResearchGateway({question:"SSc?",releaseVersion:"1.0.0",dataClass:"public_biomedical"},d)).rejects.toThrow("Authoritative");
});
test("gateway fails closed on persistence failure",async()=>{
 const d=deps();d.saveRun=async()=>{throw Error("DB unavailable")};
 await expect(executeResearchGateway({question:"SSc?",releaseVersion:"1.0.0",dataClass:"public_biomedical"},d)).rejects.toThrow("DB unavailable");
});
