/** Phase 3.2: product-owned read-only governed graph query boundary.
 * Caller must authenticate the principal before invoking this service.
 * No network transport, credentials, PHI, graph writes or approval mutations.
 */
import {validateHsiLogicalGraph,type HsiGraphNode,type HsiGraphRelationship,type HsiGraphVisibility} from "./livingHealthKnowledgeGraph";
export const GOVERNED_GRAPH_READ_VERSION="hsi-governed-graph-read-1" as const;
export type GraphReadPrincipal={id:string;tenantId:string;role:"public"|"researcher"|"reviewer"|"clinician";authenticated:boolean};
export type GraphReadRequest={seedId:string;depth?:number;maxEdges?:number;includeDraft?:boolean;tenantId:string};
export type GraphReadResult={schemaVersion:typeof GOVERNED_GRAPH_READ_VERSION;seedId:string;nodes:HsiGraphNode[];relationships:HsiGraphRelationship[];truncated:boolean;version:string;readOnly:true};
export interface GovernedGraphSnapshot {version:string;tenantId:string|null;nodes:readonly HsiGraphNode[];relationships:readonly HsiGraphRelationship[]}
export class GraphReadDenied extends Error {constructor(){super("Graph read denied")}}
function deny():never{throw new GraphReadDenied()}
const key=/^[A-Za-z0-9][A-Za-z0-9:_.-]{0,127}$/;
function visible(scope:HsiGraphVisibility,p:GraphReadPrincipal,s:GovernedGraphSnapshot){
 if(scope==="public_biomedical")return true;
 if(!p.authenticated||p.role==="public"||s.tenantId!==p.tenantId)return false;
 if(scope==="governed_research")return p.role==="researcher"||p.role==="reviewer";
 return p.role==="clinician";
}
export function readGovernedGraph(snapshot:GovernedGraphSnapshot,principal:GraphReadPrincipal,request:GraphReadRequest):GraphReadResult{
 if(!principal||!request||!principal.id||!principal.tenantId||!key.test(request.seedId)||!request.tenantId||request.tenantId!==principal.tenantId)deny();
 if(!/^\d+\.\d+\.\d+$/.test(snapshot.version)||!snapshot.tenantId&&!snapshot.nodes.every(n=>n.visibility==="public_biomedical"))deny();
 if(snapshot.tenantId!==null&&snapshot.tenantId!==principal.tenantId)deny();
 if(request.depth!==undefined&&(!Number.isInteger(request.depth)||request.depth<0||request.depth>3))deny();
 if(request.maxEdges!==undefined&&(!Number.isInteger(request.maxEdges)||request.maxEdges<1||request.maxEdges>120))deny();
 if(request.includeDraft&&(!principal.authenticated||!["researcher","reviewer"].includes(principal.role)))deny();
 validateHsiLogicalGraph(snapshot.nodes,snapshot.relationships);
 const canSeeNode=(n:HsiGraphNode)=>visible(n.visibility,principal,snapshot)&&(n.reviewState==="approved"||(request.includeDraft===true&&n.visibility==="governed_research"&&["draft","in_review"].includes(n.reviewState)));
 const eligibleNodes=new Map(snapshot.nodes.filter(canSeeNode).map(n=>[n.id,n]));
 if(!eligibleNodes.has(request.seedId))deny();
 const edges=snapshot.relationships.filter(e=>visible(e.visibility,principal,snapshot)&&eligibleNodes.has(e.subjectId)&&eligibleNodes.has(e.objectId)&&(e.reviewState==="approved"||(request.includeDraft===true&&e.visibility==="governed_research"&&["draft","in_review"].includes(e.reviewState))));
 const depth=request.depth??1,maxEdges=request.maxEdges??48;
 const visited=new Set([request.seedId]),chosen:HsiGraphRelationship[]=[];
 let frontier=[request.seedId],truncated=false;
 for(let step=0;step<depth&&frontier.length;step++){
  const next:string[]=[];
  for(const id of frontier){
   for(const e of edges){
    if(e.subjectId!==id&&e.objectId!==id||chosen.some(x=>x.id===e.id))continue;
    if(chosen.length>=maxEdges){truncated=true;break}
    chosen.push(e);
    for(const nodeId of [e.subjectId,e.objectId])if(!visited.has(nodeId)){visited.add(nodeId);next.push(nodeId)}
   }
   if(truncated)break;
  }
  if(truncated)break;
  frontier=next;
 }
 return {schemaVersion:GOVERNED_GRAPH_READ_VERSION,seedId:request.seedId,nodes:[...visited].map(id=>eligibleNodes.get(id)!),relationships:chosen,truncated,version:snapshot.version,readOnly:true};
}
