/** ARCH-002 Phase 3.6: evidence-preserving cross-domain source adapters.
 * No external ingestion, publication, or patient data access. Every relationship
 * remains a governed research draft until scientific review and graph release.
 */
import {validateHsiLogicalGraph,type HsiGraphNode,type HsiGraphRelationship} from "./livingHealthKnowledgeGraph";
export type HsiCrossDomainSource="microbiome"|"metabolomics"|"immune_assay"|"trial_registry";
export type HsiCrossDomainInput={
 source:HsiCrossDomainSource;sourceRecordId:string;sourceVersion:string;retrievedAt:string;
 subject:{id:string;kind:string;label:string};object:{id:string;kind:string;label:string};
 predicate:"ASSOCIATED_WITH"|"MEASURED_BY"|"PARTICIPATES_IN"|"EVALUATED_IN";
 evidenceIds:readonly string[];context:Readonly<Record<string,string>>;
 classification:"reported_association"|"computational_inference"|"hypothesis";
};
export type HsiCrossDomainDraft={nodes:HsiGraphNode[];relationships:HsiGraphRelationship[];warnings:string[]};
const validId=/^[A-Za-z0-9][A-Za-z0-9._:-]{1,127}$/;
const iso=(v:string)=>/^\d{4}-\d{2}-\d{2}T/.test(v)&&Number.isFinite(Date.parse(v));
function layer(source:HsiCrossDomainSource):HsiGraphNode["layer"]{
 return source==="trial_registry"?"biomedical_evidence":"gut_immune_metabolic";
}
export function adaptHsiCrossDomainRecord(input:HsiCrossDomainInput):HsiCrossDomainDraft{
 if(!validId.test(input.sourceRecordId)||!/^\d+\.\d+\.\d+$/.test(input.sourceVersion)||!iso(input.retrievedAt))throw Error("Invalid cross-domain source provenance");
 if(!validId.test(input.subject.id)||!validId.test(input.object.id)||input.subject.id===input.object.id)throw Error("Invalid cross-domain entities");
 if(!input.subject.kind.trim()||!input.object.kind.trim()||!input.subject.label.trim()||!input.object.label.trim())throw Error("Incomplete cross-domain entities");
 if(!input.evidenceIds.length||input.evidenceIds.some(x=>!x.trim())||new Set(input.evidenceIds).size!==input.evidenceIds.length)throw Error("Cross-domain evidence references required");
 if(Object.values(input.context).some(x=>typeof x!=="string"||!x.trim()))throw Error("Invalid biological context");
 if(input.source==="trial_registry"&&input.predicate!=="EVALUATED_IN")throw Error("Trial registry may only draft evaluation relationships");
 if(input.source!=="trial_registry"&&input.predicate==="EVALUATED_IN")throw Error("Evaluation predicate requires trial source");
 const graphLayer=layer(input.source);
 const provenance=[input.source+":"+input.sourceRecordId+"@"+input.sourceVersion];
 const nodes:HsiGraphNode[]=[input.subject,input.object].map(n=>({
  schemaVersion:"hsi-lhkg-node-1",id:n.id,layer:graphLayer,kind:n.kind,preferredLabel:n.label,aliases:[],sourceIdentifiers:[],version:input.sourceVersion,
  visibility:"governed_research",reviewState:"draft",sourceProvenance:provenance
 }));
 const relationship:HsiGraphRelationship={
  schemaVersion:"hsi-lhkg-edge-1",id:input.sourceRecordId,subjectId:input.subject.id,objectId:input.object.id,
  predicate:input.predicate,layer:graphLayer,
  epistemicType:input.classification==="reported_association"?"association":input.classification==="hypothesis"?"unvalidated_hypothesis":"computational_inference",
  visibility:"governed_research",reviewState:"draft",sourceEvidenceIds:input.evidenceIds,version:input.sourceVersion,
  context:{...input.context,sourceType:input.source,sourceRecordId:input.sourceRecordId,retrievedAt:input.retrievedAt},causalClaim:false
 };
 validateHsiLogicalGraph(nodes,[relationship]);
 return {nodes,relationships:[relationship],warnings:["Source record converted to unapproved research draft; no causal inference or patient-level claim","Evidence IDs require authoritative dossier, rights and reviewer validation before release"]};
}
export type HsiCrossDomainQuery={startId:string;maxHops:1|2|3;allowedLayers:readonly ("human_biology"|"gut_immune_metabolic"|"biomedical_evidence")[];limit:number};
export function traverseHsiCrossDomainDraftGraph(input:{nodes:readonly HsiGraphNode[];relationships:readonly HsiGraphRelationship[];query:HsiCrossDomainQuery}):{nodeIds:string[];relationshipIds:string[]}{
 const {nodes,relationships,query}=input;
 validateHsiLogicalGraph(nodes,relationships);
 if(!validId.test(query.startId)||!Number.isInteger(query.limit)||query.limit<1||query.limit>100||query.allowedLayers.length===0||query.allowedLayers.some(x=>!["human_biology","gut_immune_metabolic","biomedical_evidence"].includes(x)))throw Error("Invalid cross-domain query");
 const byId=new Map(nodes.map(n=>[n.id,n]));
 if(!byId.has(query.startId))throw Error("Unknown query start node");
 const allowed=new Set<string>(query.allowedLayers);
 const permitted=(id:string)=>{const n=byId.get(id);return !!n&&allowed.has(n.layer)&&n.visibility==="governed_research"};
 if(!permitted(query.startId))throw Error("Start node outside governed research scope");
 const visited=new Set([query.startId]),edgeIds=new Set<string>();let frontier=[query.startId];
 for(let hop=0;hop<query.maxHops;hop++){
  const next:string[]=[];
  for(const edge of relationships){
   if(!allowed.has(edge.layer)||edge.visibility!=="governed_research"||edge.reviewState==="rejected"||edge.reviewState==="retired")continue;
   const neighbor=frontier.includes(edge.subjectId)?edge.objectId:frontier.includes(edge.objectId)?edge.subjectId:null;
   if(!neighbor||!permitted(neighbor)||edgeIds.has(edge.id))continue;
   if(edgeIds.size>=query.limit)break;
   edgeIds.add(edge.id);
   if(!visited.has(neighbor)){visited.add(neighbor);next.push(neighbor)}
  }
  frontier=next;if(!frontier.length||edgeIds.size>=query.limit)break;
 }
 return {nodeIds:[...visited],relationshipIds:[...edgeIds]};
}
