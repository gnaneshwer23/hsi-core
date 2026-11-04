import {test,expect} from "bun:test";
import {runHsiAgentOrchestration,type HsiAgentTask} from "../src/hsiAgentOrchestrator";
import {HSI_ROLE_TOOL_ALLOWLIST,type HsiAgentRole,type HsiAgentManifest} from "../src/hsiAgentIntelligenceContracts";
const manifest=(role:HsiAgentRole):HsiAgentManifest=>({schemaVersion:"hsi-agent-manifest-1",role,version:"1.0.0",inputSchemaId:"input-v1",outputSchemaId:"output-v1",promptVersion:"none",modelVersion:"deterministic-1",allowedTools:[...HSI_ROLE_TOOL_ALLOWLIST[role]],maxToolCalls:3,maxQuestions:12,maxDepth:4,timeoutMs:1000,dataClasses:["public_biomedical"]});
const graphRelease={id:"HSI-GR-SSC",version:"1.0.0",manifestHash:"a".repeat(64)};
const tasks:HsiAgentTask[]=[{id:"plan",manifest:manifest("question_planner"),dependsOn:[]},{id:"graph",manifest:manifest("graph_reasoner"),dependsOn:["plan"]}];
const base={investigationId:"inv-123",graphRelease,dataClass:"public_biomedical" as const,now:()=>"2026-11-04T12:00:00Z"};
test("orchestration executes dependencies in order and pins provenance",async()=>{
 const order:string[]=[];
 const r=await runHsiAgentOrchestration({...base,tasks,executors:{question_planner:async c=>{order.push(c.taskId);return {status:"completed",outputRef:"plan-ref",reason:null}},graph_reasoner:async c=>{order.push(c.taskId);c.assertTool("graph.query");return {status:"completed",outputRef:"graph-ref",reason:null}}}});
 expect(order).toEqual(["plan","graph"]);expect(r.status).toBe("completed");expect(r.runs).toHaveLength(2);expect(r.runs[1]?.toolCalls[0]?.tool).toBe("graph.query");expect(r.runs[1]?.graphRelease.manifestHash).toBe(graphRelease.manifestHash);
});
test("missing executor blocks dependents",async()=>{
 const r=await runHsiAgentOrchestration({...base,tasks,executors:{graph_reasoner:async()=>({status:"completed",outputRef:"never",reason:null})}});
 expect(r.status).toBe("blocked");expect(r.results.graph?.status).toBe("blocked");
});
test("tool permission denial fails closed",async()=>{
 const r=await runHsiAgentOrchestration({...base,tasks:[tasks[0]!],executors:{question_planner:async c=>{c.assertTool("patient.context.get");return {status:"completed",outputRef:"unsafe",reason:null}}}});
 expect(r.status).toBe("failed");expect(r.runs[0]?.toolCalls[0]?.status).toBe("denied");
});
test("cyclic tasks are rejected before any execution",async()=>{
 await expect(runHsiAgentOrchestration({...base,tasks:[{...tasks[0]!,dependsOn:["graph"]},tasks[1]!],executors:{}})).rejects.toThrow("Cyclic");
});
test("cancelled workflow does not invoke executors",async()=>{
 const controller=new AbortController();controller.abort();
 const r=await runHsiAgentOrchestration({...base,tasks,executors:{},signal:controller.signal});
 expect(r.status).toBe("cancelled");expect(r.runs).toHaveLength(0);
});
