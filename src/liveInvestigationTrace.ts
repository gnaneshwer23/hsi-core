/**
 * A-01: evidence-safe live retrieval trace for an arbitrary question.
 * No persistence, source-text rights, scientific claim, model inference or graph write.
 * The output conforms to existing research contracts; durable backend integration follows.
 */
import {randomUUID} from "node:crypto";
import {retrievePubmedBibliography,type PubmedResult} from "./scientificPubmedRetrieval";
import {parseResearchBundle,parseResearchContext,researchRunState,type ResearchBundle,type ResearchRunEvent,type ResearchRun} from "./researchContracts";
export type LiveInvestigationTrace={id:string;question:string;createdAt:string;status:"retrieved"|"no_results";bibliography:PubmedResult;bundle:ResearchBundle;limitations:string[];persistence:"not_persisted";reviewStatus:"unreviewed"};
export async function createLiveInvestigationTrace(question:string,fetcher:typeof fetch=fetch,signal?:AbortSignal):Promise<LiveInvestigationTrace>{
 const bibliography=await retrievePubmedBibliography(question,fetcher,signal);
 const now=bibliography.retrievedAt, runId="run-"+randomUUID(), contextId="context-"+randomUUID();
 const provenance={product:"hsi" as const,datasetId:"pubmed",version:"eutils-bibliography-v1",retrievedAt:now};
 const context=parseResearchContext({id:contextId,question:bibliography.query,conceptIds:[],dataClass:"public_real",purpose:"research_only",containsPhi:false,provenance});
 const event=(sequence:number,stage:"context"|"retrieval",status:"started"|"completed",outputRefs:string[]):ResearchRunEvent=>({
  id:"event-"+randomUUID(),sequence,stage,status,at:now,provider:{id:stage==="context"?"hsi-question":"pubmed-eutils",version:"1"},execution:"deterministic",actorRef:null,modelRef:null,inputRefs:[],outputRefs,reason:null
 });
 const events=[event(1,"context","started",[]),event(2,"context","completed",[contextId]),event(3,"retrieval","started",[]),event(4,"retrieval","completed",["bibliography-"+runId])];
 const run:ResearchRun={id:runId,contextId,dataClass:"public_real",createdAt:now,artifacts:[
  {id:contextId,kind:"context_snapshot",version:"1",sha256:null,producedByEventId:events[1]!.id},
  {id:"bibliography-"+runId,kind:"retrieval_result",version:"1",sha256:null,producedByEventId:events[3]!.id}
 ],history:events};
 const sources=bibliography.hits.map(hit=>({id:"pmid-"+hit.pmid,title:hit.title,kind:"publication" as const,dataClass:"public_real" as const,pmid:hit.pmid,doi:null,url:hit.url,licence:{status:"unknown" as const,identifier:null,passageUsePermitted:false},provenance:{...provenance,datasetId:"pubmed-"+hit.pmid}}));
 const bundle=parseResearchBundle({schemaVersion:"hsi-research-contract-1",containsPhi:false,clinicalAdvice:false,kgWrite:false,context,sources,passages:[],entities:[],relationships:[],claims:[],runs:[run]});
 if(researchRunState(bundle.runs[0]!)!=="running")throw new Error("Unexpected research trace state");
 return {id:runId,question:bibliography.query,createdAt:now,status:bibliography.status,bibliography,bundle,limitations:["Bibliography is a discovery lead, not verified scientific evidence.","No abstract passages were persisted or licensed for reuse.","No mechanisms, contradictions, hypotheses, scientific review or graph writes were executed.","This response is not durably persisted. Database-backed resume and recovery remain a separate integration gate."],persistence:"not_persisted",reviewStatus:"unreviewed"};
}
