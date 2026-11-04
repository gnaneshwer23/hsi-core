import {test,expect} from "bun:test";
import {planSscInterrogation} from "../src/interrogativeQuestionEngine";
import {adaptInterrogativeInvestigationMetadata,describeHsiAgentCompatibility} from "../src/hsiAgentCompatibility";
import {HSI_ROLE_TOOL_ALLOWLIST} from "../src/hsiAgentIntelligenceContracts";
test("legacy ARCH-003 investigation remains unchanged after metadata adaptation",()=>{
 const i=planSscInterrogation({question:"Which SSc mechanisms require investigation?",actorPrincipal:"researcher-1",createdAt:"2026-11-04T12:00:00Z",dataClass:"public_biomedical",focus:"systemic_sclerosis",release:{id:"HSI-GR-SSC",version:"1.0.0",manifestHash:"a".repeat(64)}});
 const before=JSON.stringify(i);const a=adaptInterrogativeInvestigationMetadata(i);
 expect(JSON.stringify(i)).toBe(before);
 expect(a.originalSchemaVersion).toBe(i.schemaVersion);
 expect(a.graphRelease).toEqual(i.release);
 expect(a.originalFingerprint).toMatch(/^[a-f0-9]{64}$/);
 expect(a.agentRuns).toEqual([]);
 expect(a.compatibility).toBe("metadata_only");
});
test("agent manifest description never implies a live runtime",()=>{
 const role="interrogator" as const;
 const m={schemaVersion:"hsi-agent-manifest-1" as const,role,version:"1.0.0",inputSchemaId:"in-1",outputSchemaId:"out-1",promptVersion:"none",modelVersion:"deterministic",allowedTools:[...HSI_ROLE_TOOL_ALLOWLIST[role]],maxToolCalls:10,maxQuestions:12,maxDepth:4,timeoutMs:10000,dataClasses:["public_biomedical" as const]};
 expect(describeHsiAgentCompatibility(m).runtime).toBe("not_activated");
});
