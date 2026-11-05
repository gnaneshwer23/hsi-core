/** P0 ISI -> HSI read-only graph release intake.
 * Accepts immunecity kg.json v0.3 as an external, untrusted scientific source.
 * This is a staging/curation adapter, NOT an approved HSI graph release.
 */
import {createHash} from "node:crypto";
export type IsiRawNode={id:string;node_type:string;name:string;source_refs?:string[];evidence_status?:string;version?:string};
export type IsiRawEdge={id:string;subject_id:string;object_id:string;relation:string;source_refs?:string[];reference?:string;evidence_status?:string;context?:string;location?:string;version?:string};
export type IsiGraphRelease={version:string;nodes:IsiRawNode[];relationships:IsiRawEdge[];stats?:{total_nodes?:number;total_relationships?:number}};
export type IsiStagedGraph={
 schemaVersion:"hsi-isi-staged-graph-1";sourceProduct:"immunecity";sourceVersion:string;sourceHash:string;
 nodes:{id:string;sourceId:string;label:string;kind:string;sourceRefs:string[];reviewState:"unreviewed";canonicalHsiId:null}[];
 relationships:{id:string;sourceId:string;subjectId:string;objectId:string;predicate:string;sourceRefs:string[];sourceEvidenceStatus:string;context:string|null;location:string|null;reviewState:"unreviewed";graphPromotable:false}[];
 ontologyQueue:{isiId:string;label:string;kind:string;status:"mapping_required"}[];
 rejected:{sourceId:string;reason:string}[];
 graphPromotable:false;autoApprove:false;containsPhi:false;
};
const validId=(s:unknown):s is string=>typeof s==="string"&&/^[A-Za-z][A-Za-z0-9_-]{0,80}$/.test(s);
const refs=(xs:unknown)=>Array.isArray(xs)?[...new Set(xs.filter((x):x is string=>typeof x==="string"&&!!x.trim()&&x!=="TO_BE_CURATED"))].sort():[];
export function stageIsiGraphRelease(raw:IsiGraphRelease):IsiStagedGraph{
 if(!raw||raw.version!=="0.3"||!Array.isArray(raw.nodes)||!Array.isArray(raw.relationships))throw Error("Unsupported ISI graph release");
 if(raw.stats&&(raw.stats.total_nodes!==raw.nodes.length||raw.stats.total_relationships!==raw.relationships.length))throw Error("ISI graph inventory mismatch");
 const ids=new Set<string>(),rels=new Set<string>(),rejected: IsiStagedGraph["rejected"]=[];
 const nodes: IsiStagedGraph["nodes"]=[];
 for(const n of raw.nodes){
  if(!validId(n.id)||!n.name?.trim()||!n.node_type?.trim()||ids.has(n.id)){rejected.push({sourceId:String(n.id),reason:"invalid_or_duplicate_node"});continue}
  ids.add(n.id);nodes.push({id:"isi:"+n.id,sourceId:n.id,label:n.name,kind:n.node_type,sourceRefs:refs(n.source_refs),reviewState:"unreviewed",canonicalHsiId:null});
 }
 const relationships: IsiStagedGraph["relationships"]=[];
 for(const e of raw.relationships){
  if(!validId(e.id)||rels.has(e.id)||!ids.has(e.subject_id)||!ids.has(e.object_id)||!e.relation?.trim()){rejected.push({sourceId:String(e.id),reason:"invalid_duplicate_or_dangling_relationship"});continue}
  rels.add(e.id);relationships.push({id:"isi:"+e.id,sourceId:e.id,subjectId:"isi:"+e.subject_id,objectId:"isi:"+e.object_id,predicate:e.relation,sourceRefs:refs([...(e.source_refs??[]),...(e.reference?[e.reference]:[])]),sourceEvidenceStatus:e.evidence_status??"UNKNOWN",context:e.context||null,location:e.location||null,reviewState:"unreviewed",graphPromotable:false});
 }
 const sourceHash=createHash("sha256").update(JSON.stringify(raw)).digest("hex");
 return {schemaVersion:"hsi-isi-staged-graph-1",sourceProduct:"immunecity",sourceVersion:raw.version,sourceHash,nodes,relationships,ontologyQueue:nodes.map(n=>({isiId:n.sourceId,label:n.label,kind:n.kind,status:"mapping_required" as const})),rejected,graphPromotable:false,autoApprove:false,containsPhi:false};
}
