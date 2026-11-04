/** Phase 1 compatibility adapter. No agent execution or database mutation. */
import {createHash} from "node:crypto";
import {validateInterrogativeInvestigation,type InterrogativeInvestigation} from "./interrogativeContracts";
import {HSI_AGENT_CONTRACT_VERSION,validateHsiAgentManifest,type HsiAgentManifest,type HsiAgentRole,type HsiAgentRunEnvelope} from "./hsiAgentIntelligenceContracts";
export type HsiLegacyInvestigationAdapter={
 schemaVersion:"hsi-agent-legacy-adapter-1";
 investigationId:string;originalSchemaVersion:string;originalFingerprint:string;
 graphRelease:{id:string;version:string;manifestHash:string};
 roles:readonly HsiAgentRole[];agentRuns:readonly HsiAgentRunEnvelope[];
 compatibility:"metadata_only";limitations:readonly string[];
};
export function adaptInterrogativeInvestigationMetadata(i:InterrogativeInvestigation):HsiLegacyInvestigationAdapter{
 validateInterrogativeInvestigation(i);
 const canonical=(x:unknown):string=>Array.isArray(x)?"["+x.map(canonical).join(",")+"]":x&&typeof x==="object"?"{"+Object.entries(x as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+":"+canonical(v)).join(",")+"}":JSON.stringify(x)??"null";
 const hash=createHash("sha256").update(canonical(i)).digest("hex");
 return {schemaVersion:"hsi-agent-legacy-adapter-1",investigationId:i.id,originalSchemaVersion:i.schemaVersion,originalFingerprint:hash,graphRelease:{...i.release},roles:["question_planner","interrogator","graph_reasoner","contradiction_analyst"],agentRuns:[],compatibility:"metadata_only",limitations:["Existing ARCH-003 provenance is preserved; legacy agent runs are not rewritten as verified executions","No model, tool or scientific claim is inferred from legacy records"]};
}
export function describeHsiAgentCompatibility(m:HsiAgentManifest):{contractVersion:typeof HSI_AGENT_CONTRACT_VERSION;role:HsiAgentRole;runtime:"not_activated";allowedTools:readonly string[]}{
 validateHsiAgentManifest(m);
 return {contractVersion:HSI_AGENT_CONTRACT_VERSION,role:m.role,runtime:"not_activated",allowedTools:[...m.allowedTools]};
}
