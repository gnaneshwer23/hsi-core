/** HSI Agent Intelligence Phase 1: policy and metadata contracts only.
 * This file does not execute models, call tools or grant access.
 */
export const HSI_AGENT_CONTRACT_VERSION="hsi-agent-manifest-1" as const;
export const HSI_AGENT_ROLES=["question_planner","entity_resolver","evidence_retriever","graph_reasoner","interrogator","contradiction_analyst","hypothesis_generator","claim_verifier","safety_policy_gate"] as const;
export type HsiAgentRole=typeof HSI_AGENT_ROLES[number];
export const HSI_TOOL_IDS=["ontology.lookup","graph.query","literature.search","evidence.get","trial.search","hypothesis.create","policy.check","patient.context.get","brief.export"] as const;
export type HsiToolId=typeof HSI_TOOL_IDS[number];
export type HsiDataClass="public_biomedical"|"licensed_partner"|"synthetic_demo"|"identifiable_clinical";
export type HsiEpistemicKind="established_evidence"|"association"|"computational_inference"|"unvalidated_hypothesis";
export type HsiEvidenceAssessment="supported"|"partially_supported"|"contested"|"context_limited"|"inconclusive"|"insufficient_evidence";
export type HsiReviewStatus="draft"|"awaiting_review"|"approved"|"revision_requested"|"rejected";
export type HsiPublicationStatus="not_eligible"|"eligible"|"published"|"superseded";
export type HsiAgentManifest={
 schemaVersion:typeof HSI_AGENT_CONTRACT_VERSION;
 role:HsiAgentRole;version:string;inputSchemaId:string;outputSchemaId:string;
 promptVersion:string;modelVersion:string;allowedTools:readonly HsiToolId[];
 maxToolCalls:number;maxQuestions:number;maxDepth:number;timeoutMs:number;
 dataClasses:readonly Exclude<HsiDataClass,"identifiable_clinical">[];
};
export const HSI_ROLE_TOOL_ALLOWLIST:Readonly<Record<HsiAgentRole,readonly HsiToolId[]>>={
 question_planner:[],entity_resolver:["ontology.lookup","graph.query"],
 evidence_retriever:["literature.search","evidence.get","trial.search"],
 graph_reasoner:["graph.query","evidence.get"],
 interrogator:["graph.query","evidence.get","ontology.lookup"],
 contradiction_analyst:["literature.search","evidence.get","graph.query"],
 hypothesis_generator:["graph.query","evidence.get","hypothesis.create"],
 claim_verifier:["evidence.get","graph.query","literature.search"],
 safety_policy_gate:["policy.check"]
};
const isOneOf=(x:string,items:readonly string[])=>items.includes(x);
export function validateHsiAgentManifest(m:HsiAgentManifest):void{
 if(!m||m.schemaVersion!==HSI_AGENT_CONTRACT_VERSION||!isOneOf(m.role,HSI_AGENT_ROLES))throw Error("Unknown agent manifest");
 if(!/^\d+\.\d+\.\d+$/.test(m.version)||!m.inputSchemaId?.trim()||!m.outputSchemaId?.trim()||!m.promptVersion?.trim()||!m.modelVersion?.trim())throw Error("Versioned schemas and model/prompt provenance required");
 if(!Number.isInteger(m.maxToolCalls)||m.maxToolCalls<0||m.maxToolCalls>100||!Number.isInteger(m.maxQuestions)||m.maxQuestions<0||m.maxQuestions>24||!Number.isInteger(m.maxDepth)||m.maxDepth<0||m.maxDepth>4||!Number.isInteger(m.timeoutMs)||m.timeoutMs<100||m.timeoutMs>120000)throw Error("Invalid bounded execution budget");
 if(!Array.isArray(m.allowedTools)||new Set(m.allowedTools).size!==m.allowedTools.length||m.allowedTools.some(t=>!isOneOf(t,HSI_ROLE_TOOL_ALLOWLIST[m.role])))throw Error("Unregistered or unauthorised tool");
 if(!Array.isArray(m.dataClasses)||!m.dataClasses.length||m.dataClasses.some(d=>!["public_biomedical","licensed_partner","synthetic_demo"].includes(d)))throw Error("Forbidden data class");
}
export function assertHsiToolPermission(m:HsiAgentManifest,tool:HsiToolId,dataClass:HsiDataClass):void{
 validateHsiAgentManifest(m);
 if(dataClass==="identifiable_clinical"||!m.dataClasses.includes(dataClass as Exclude<HsiDataClass,"identifiable_clinical">)||!m.allowedTools.includes(tool)||!isOneOf(tool,HSI_ROLE_TOOL_ALLOWLIST[m.role]))throw Error("HSI agent tool access denied");
}
export type HsiAgentRunEnvelope={
 schemaVersion:"hsi-agent-run-1";investigationId:string;runId:string;
 manifest:HsiAgentManifest;graphRelease:{id:string;version:string;manifestHash:string};
 dataClass:Exclude<HsiDataClass,"identifiable_clinical">;
 status:"created"|"running"|"completed"|"blocked"|"failed"|"cancelled";
 /** Legacy success records do not prove external execution. New orchestrator receipts mark checks explicitly. */
 toolCallEvidence?:"authorization_checks_only";
 toolCalls:readonly {tool:HsiToolId;invocationId:string;status:"authorized"|"success"|"denied"|"failed"}[];
 startedAt:string;completedAt:string|null;
};
export function validateHsiAgentRunEnvelope(e:HsiAgentRunEnvelope):void{
 if(!e||e.schemaVersion!=="hsi-agent-run-1")throw Error("Invalid run schema");
 validateHsiAgentManifest(e.manifest);
 if(!e.investigationId?.trim()||!e.runId?.trim()||!e.graphRelease?.id?.trim()||!/^\d+\.\d+\.\d+$/.test(e.graphRelease.version)||!/^[a-f0-9]{64}$/.test(e.graphRelease.manifestHash))throw Error("Invalid run identity or graph provenance");
 if(!e.manifest.dataClasses.includes(e.dataClass)||!Number.isFinite(Date.parse(e.startedAt))||(e.completedAt!==null&&!Number.isFinite(Date.parse(e.completedAt))))throw Error("Invalid run context");
 if(e.toolCallEvidence!==undefined&&e.toolCallEvidence!=="authorization_checks_only")throw Error("Invalid tool evidence meaning");
 if(!Array.isArray(e.toolCalls)||e.toolCalls.length>e.manifest.maxToolCalls||new Set(e.toolCalls.map(c=>c.invocationId)).size!==e.toolCalls.length||e.toolCalls.some(c=>!c||!c.invocationId?.trim()||!isOneOf(c.tool,HSI_TOOL_IDS)||!["authorized","success","denied","failed"].includes(c.status)||(!isOneOf(c.tool,e.manifest.allowedTools)&&c.status!=="denied")||(c.status==="authorized"&&e.toolCallEvidence!=="authorization_checks_only")||(c.status==="success"&&e.toolCallEvidence==="authorization_checks_only")))throw Error("Invalid tool authorization trace");
 if(!["created","running","completed","blocked","failed","cancelled"].includes(e.status))throw Error("Invalid run status");
 const terminal=["completed","blocked","failed","cancelled"].includes(e.status);
 if(terminal&&e.completedAt===null||!terminal&&e.completedAt!==null||e.completedAt!==null&&Date.parse(e.completedAt)<Date.parse(e.startedAt))throw Error("Invalid run completion time");
}
