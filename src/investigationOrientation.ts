/**
 * P2: pathway orientation for an investigation question. When a question names proteins, list the Reactome
 * pathways that contain them (#305) so the investigation can start from entities and pathways and the search can
 * be widened across domains. This is a navigation aid only: Reactome listing a protein in a pathway is curated
 * metadata, not evidence that the protein drives that pathway in any tissue, cell state or disease, and nothing
 * here supports a claim, enters the audit, or can be promoted. A failed lookup is recorded and never blocks the audit.
 */
import type {FetchLike} from "./fetchLike";
import type {HsiGraphNode} from "./livingHealthKnowledgeGraph";
import {lookupReactomePathwaysForUniProt} from "./evidence/reactomePathwayLookup";
import {reactomeProteinPathwayDraftNodes} from "./evidence/reactomeOntologyBridge";

export type OrientationEntity={label:string;uniprot:string};
export type OrientationEntityResult={
 label:string;accession:string;status:"listed"|"unavailable";
 pathways:{stableId:string;displayName:string;url:string}[];truncated:boolean;reason:string|null;
};
export type PathwayOrientation={
 schemaVersion:"hsi-pathway-orientation-1";entities:OrientationEntityResult[];searchTerms:string[];draftNodes:HsiGraphNode[];
 membershipInterpretation:"listed_by_provider_not_context_specific";navigationOnly:true;claimSupport:false;graphPromotable:false;
};
const MAX_ENTITIES=8,MAX_TERMS=8,MAX_TERM_CHARS=120;
const safeText=(s:string)=>typeof s==="string"&&s.trim().length>0&&s.length<=MAX_TERM_CHARS&&!/[<>\u0000-\u001f]/.test(s);

export function validateOrientationEntities(entities:unknown):OrientationEntity[]{
 if(!Array.isArray(entities)||entities.length>MAX_ENTITIES)throw Error("At most "+MAX_ENTITIES+" orientation entities");
 const accessions=new Set<string>();
 return entities.map(e=>{
  if(!e||typeof e!=="object"||Object.keys(e).sort().join(",")!=="label,uniprot"||!safeText((e as OrientationEntity).label)||typeof (e as OrientationEntity).uniprot!=="string")throw Error("Invalid orientation entity");
  const accession=(e as OrientationEntity).uniprot.trim().toUpperCase();
  if(accessions.has(accession))throw Error("Duplicate orientation entity");accessions.add(accession);
  return {label:(e as OrientationEntity).label.trim(),uniprot:accession};
 });
}

export async function orientByPathways(input:{entities:readonly OrientationEntity[];fetcher?:FetchLike;taxonId?:number;maxPathwaysPerEntity?:number;retrievedAt?:string}):Promise<PathwayOrientation>{
 const entities=validateOrientationEntities(input.entities),results:OrientationEntityResult[]=[],nodes=new Map<string,HsiGraphNode>();
 for(const entity of entities){
  // Sequential on purpose: one polite request at a time, and one failure never stops the others.
  const out=await lookupReactomePathwaysForUniProt({accession:entity.uniprot,taxonId:input.taxonId,maxPathways:input.maxPathwaysPerEntity??10,fetcher:input.fetcher,retrievedAt:input.retrievedAt});
  if(!out.ok){results.push({label:entity.label,accession:entity.uniprot,status:"unavailable",pathways:[],truncated:false,reason:out.reason+": "+out.detail});continue}
  for(const node of reactomeProteinPathwayDraftNodes(out.result))if(!nodes.has(node.id))nodes.set(node.id,node);
  results.push({label:entity.label,accession:out.result.accession,status:"listed",truncated:out.result.truncated,reason:null,
   pathways:out.result.pathways.map(p=>({stableId:p.stableId,displayName:p.displayName,url:p.url}))});
 }
 const orientation:PathwayOrientation={schemaVersion:"hsi-pathway-orientation-1",entities:results,searchTerms:[],draftNodes:[...nodes.values()],
  membershipInterpretation:"listed_by_provider_not_context_specific",navigationOnly:true,claimSupport:false,graphPromotable:false};
 orientation.searchTerms=buildSearchTerms("",orientation);
 return orientation;
}

/** Terms a live search can use to widen a question across domains: entity labels first, then pathway names. */
export function buildSearchTerms(question:string,orientation:PathwayOrientation,max=MAX_TERMS):string[]{
 const seen=new Set<string>(),out:string[]=[];
 const add=(t:string)=>{const key=t.trim().toLowerCase();if(!safeText(t)||seen.has(key)||out.length>=Math.min(max,MAX_TERMS))return;seen.add(key);out.push(t.trim())};
 if(question)add(question.slice(0,MAX_TERM_CHARS));
 for(const e of orientation.entities)if(e.status==="listed")add(e.label);
 for(const e of orientation.entities)for(const p of e.pathways)add(p.displayName);
 return out;
}
