/**
 * LEA-04J: the NEXUS dock in the graph workspace. It gathers a bounded selection from the workspace and runs the
 * existing deterministic graph agents (src/knowledgeGraph/graphAgents.ts) over exactly that selection. It adds no
 * reasoning of its own: every answer comes from those agents, is a candidate finding, and cannot change the graph.
 * Model-backed interpretation stays off, and the dock says why.
 */
import {SELECTION_LIMITS,type AgentName} from "../knowledgeGraph/graphAgents";
import type {GraphModel} from "./assertionView";
import type {ModeId} from "./modes";

export type DockSelection={nodeIds:readonly string[];edgeIds:readonly string[]};
export const EMPTY_DOCK:DockSelection={nodeIds:[],edgeIds:[]};

export const MODEL_INTERPRETATION={enabled:false as const,reason:"Interpretation by a language model is not enabled. It needs an approved model deployment and evaluation; until then NEXUS runs only deterministic checks over the graph."};

/** Adds to the selection within the agents' limits. Nothing is silently dropped: a refusal says what did not fit. */
export function addToDock(sel:DockSelection,add:{nodeIds?:readonly string[];edgeIds?:readonly string[]}):{selection:DockSelection;refused:string|null}{
 const nodes=[...new Set([...sel.nodeIds,...(add.nodeIds??[])])],edges=[...new Set([...sel.edgeIds,...(add.edgeIds??[])])];
 const over:string[]=[];
 if(nodes.length>SELECTION_LIMITS.maxNodes)over.push(`${nodes.length-SELECTION_LIMITS.maxNodes} concept${nodes.length-SELECTION_LIMITS.maxNodes>1?"s":""} (limit ${SELECTION_LIMITS.maxNodes})`);
 if(edges.length>SELECTION_LIMITS.maxEdges)over.push(`${edges.length-SELECTION_LIMITS.maxEdges} relationship${edges.length-SELECTION_LIMITS.maxEdges>1?"s":""} (limit ${SELECTION_LIMITS.maxEdges})`);
 if(over.length)return {selection:sel,refused:`Not added: it would exceed the selection limit by ${over.join(" and ")}. Remove something first.`};
 return {selection:{nodeIds:nodes,edgeIds:edges},refused:null};
}
export const removeFromDock=(sel:DockSelection,id:string):DockSelection=>({nodeIds:sel.nodeIds.filter(x=>x!==id),edgeIds:sel.edgeIds.filter(x=>x!==id)});

export type AgentReadiness={agent:AgentName;action:string;ready:boolean;why:string};
/** Whether each agent has what it needs. An agent that is not ready is not run; the reason is shown instead. */
export function agentReadiness(sel:DockSelection):AgentReadiness[]{
 const n=sel.nodeIds.length,e=sel.edgeIds.length,any=n+e>0;
 return [
  {agent:"PARALLAX",action:"Compare the selected findings",ready:e>=2,why:e>=2?`Compares ${e} relationships pairwise for comparability.`:"Add at least two relationships to compare."},
  {agent:"VANTAGE",action:"Separate gaps from coverage limits",ready:any,why:any?"Lists recorded questions and coverage gaps around the selection.":"Add a concept or a relationship."},
  {agent:"HELIX",action:"List candidate chains",ready:n===2,why:n===2?"Lists directed association chains between the two concepts.":"Add exactly two concepts."},
 ];
}

/** A starting question for the mode, which the person can change. It is phrased as a question about the graph, never a claim. */
export function suggestedQuestion(mode:ModeId,sel:DockSelection,model:GraphModel):string{
 const name=(id:string)=>model.nodes.get(id)?.name??id;
 if(mode==="contradiction"&&sel.edgeIds.length>=2)return "Are these findings comparable, and if so, do they disagree?";
 if(sel.nodeIds.length===2)return `What does the graph record between ${name(sel.nodeIds[0]!)} and ${name(sel.nodeIds[1]!)}?`;
 if(mode==="gap"||mode==="hypothesis"||mode==="experimental")return "Which questions does the graph record here, and what has it not captured?";
 return "What does the graph record about this selection?";
}

/** A deterministic, schema-valid investigation id for the selection, so the same selection gives the same record. */
export function dockInvestigationId(graphVersion:string,sel:DockSelection):string{
 let h=2166136261;const s=[...sel.nodeIds].sort().join("|")+"#"+[...sel.edgeIds].sort().join("|");
 for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
 return `nexus-${graphVersion.slice(0,8)}-${(h>>>0).toString(16).padStart(8,"0")}`;
}
