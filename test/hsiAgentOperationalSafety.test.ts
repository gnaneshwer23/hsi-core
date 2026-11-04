import {test,expect} from "bun:test";
import {runHsiAgentOrchestration} from "../src/hsiAgentOrchestrator";
import {HSI_ROLE_TOOL_ALLOWLIST,type HsiAgentManifest} from "../src/hsiAgentIntelligenceContracts";
const manifest:HsiAgentManifest={schemaVersion:"hsi-agent-manifest-1",role:"question_planner",version:"1.0.0",inputSchemaId:"input-v1",outputSchemaId:"output-v1",promptVersion:"none",modelVersion:"deterministic-1",allowedTools:[...HSI_ROLE_TOOL_ALLOWLIST.question_planner],maxToolCalls:1,maxQuestions:12,maxDepth:4,timeoutMs:25,dataClasses:["public_biomedical"]};
const base={investigationId:"e2e-1",tasks:[{id:"plan",manifest,dependsOn:[]}],graphRelease:{id:"release-1",version:"1.0.0",manifestHash:"a".repeat(64)},dataClass:"public_biomedical" as const};
test("timeout propagates abort to cooperative executor",async()=>{
 let signal:AbortSignal|undefined;
 const r=await runHsiAgentOrchestration({...base,executors:{question_planner:async c=>{
  signal=c.signal;
  await new Promise<void>(resolve=>{if(c.signal.aborted)return resolve();c.signal.addEventListener("abort",()=>resolve(),{once:true})});
  throw Error("Cancelled");
 }}});
 expect(signal?.aborted).toBe(true);expect(r.status).toBe("failed");expect(r.results.plan?.outputRef).toBeNull();
});
test("upstream abort prevents dispatch",async()=>{
 const controller=new AbortController();controller.abort();let calls=0;
 const r=await runHsiAgentOrchestration({...base,signal:controller.signal,executors:{question_planner:async()=>{calls++;return {status:"completed",outputRef:"unsafe",reason:null}}}});
 expect(calls).toBe(0);expect(r.status).toBe("cancelled");
});
