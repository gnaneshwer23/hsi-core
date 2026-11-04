/** P1 governed scientific investigation contracts; no automatic evidence promotion. */
export type DataClass="public_biomedical"|"synthetic"|"licensed_partner"|"patient_identifiable_clinical";
export type ScientificState="not_curated"|"no_direct_evidence_identified"|"context_limited"|"supported"|"partially_supported"|"contested"|"inconclusive"|"approved_curated"|"rejected";
export type AgentRole="evidence_investigator"|"mechanism_investigator"|"contradiction_investigator"|"gap_investigator"|"hypothesis_investigator";
export type AgentRegistryEntry={
 id:string;role:AgentRole;version:string;intendedUse:string;
 permittedTools:readonly string[];modelProvider:string;modelVersion:string;promptVersion:string;
 evaluationId:string|null;approvedForExecution:boolean;maxCostUsd:number;
};
export type InvestigationProvenance={
 runId:string;actorId:string;dataClass:DataClass;question:string;releaseId:string;
 sourceIds:readonly string[];agentId:string;agentVersion:string;modelVersion:string;
 promptVersion:string;toolCalls:readonly string[];costUsd:number;
 scientificState:ScientificState;humanReviewId:string|null;output:string;
};
export function validateAgentExecution(entry:AgentRegistryEntry,request:{role:AgentRole;tools:readonly string[];budgetUsd:number;dataClass:DataClass}):void{
 if(!entry.approvedForExecution||!entry.evaluationId)throw Error("Agent has no approved evaluation");
 if(entry.role!==request.role)throw Error("Agent role mismatch");
 if(!entry.id||!entry.version||!entry.intendedUse||!entry.modelProvider||!entry.modelVersion||!entry.promptVersion)throw Error("Incomplete agent registry");
 if(!Number.isFinite(request.budgetUsd)||request.budgetUsd<0||request.budgetUsd>entry.maxCostUsd)throw Error("Agent budget exceeded");
 if(request.tools.some(t=>!entry.permittedTools.includes(t)))throw Error("Tool not authorised");
 if(request.dataClass==="patient_identifiable_clinical")throw Error("Patient data not permitted in research agent");
 if(request.dataClass==="synthetic")throw Error("Synthetic data not eligible for evidence-bearing research");
}
export function validateResearchRecord(run:InvestigationProvenance):void{
 if(!run.runId||!run.actorId||!run.question.trim()||!run.releaseId||!run.agentId||
 !run.agentVersion||!run.modelVersion||!run.promptVersion||!run.output.trim())throw Error("Missing run provenance");
 if(!Number.isFinite(run.costUsd)||run.costUsd<0)throw Error("Invalid run cost");
 if(run.dataClass==="patient_identifiable_clinical"||run.dataClass==="synthetic")throw Error("Research data class not permitted");
 if(run.scientificState==="approved_curated"&&!run.humanReviewId)throw Error("Scientific approval requires human review");
 if(run.scientificState==="approved_curated"&&!run.sourceIds.length)throw Error("Scientific approval requires evidence sources");
}
export function mayPublishResearchOutput(run:InvestigationProvenance):false{
 validateResearchRecord(run);
 // Run metadata cannot independently authenticate a reviewer or authorise publication.
 return false;
}
