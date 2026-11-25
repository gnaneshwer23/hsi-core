/** Offline applicability ranking. Relevance is not evidence quality or scientific approval. */
import {rankScientificMemory,type MemoryRankCandidate} from "./scientificMemoryRanking";
export const contextFields=["species","tissue","cellType","population","assay","intervention","timepoint","studyDesign"] as const;
export type ContextField=typeof contextFields[number];
export type ScientificContext=Partial<Record<ContextField,string|null>>;
export interface ContextCandidate extends MemoryRankCandidate {
 context:ScientificContext;
 provenance:{sourceId:string;sourceVersion:string;locator:string}[];
}
const normalize=(s:string)=>s.normalize("NFKC").trim().toLowerCase().replace(/\s+/g," ");
function validateContext(c:ScientificContext){
 if(!c||typeof c!=="object"||Array.isArray(c))throw Error("Invalid scientific context");
 for(const [k,v] of Object.entries(c))if(!contextFields.includes(k as ContextField)||(v!==null&&(typeof v!=="string"||!v.trim()||v.length>250)))throw Error("Invalid scientific context");
}
export function rankScientificContext(query:ScientificContext,candidates:readonly ContextCandidate[],limit=10){
 validateContext(query);
 if(!Number.isInteger(limit)||limit<1||limit>100||candidates.length>1000)throw Error("Invalid context ranking bounds");
 const byId=new Map(candidates.map(c=>[c.id,c]));
 // Validate all candidates, including those without a retrieval match.
 for(const c of candidates){
  validateContext(c.context);
  if(!Array.isArray(c.provenance)||c.provenance.length>50||c.provenance.some(p=>!p||[p.sourceId,p.sourceVersion,p.locator].some(s=>typeof s!=="string"||!s.trim()||s.length>1000)))throw Error("Invalid provenance");
 }
 // Rank in batches only after global duplicate validation; preserve raw fusion scores.
 const seen=new Set<string>();
 for(const c of candidates){const id=c.id.toLowerCase();if(seen.has(id))throw Error("Duplicate candidate");seen.add(id);}
 const ranked=candidates.flatMap(c=>rankScientificMemory([c],1)).map(r=>{
  const c=byId.get(r.id)!;
  const matches:ContextField[]=[],mismatches:ContextField[]=[],unknown:ContextField[]=[];
  for(const k of contextFields){
   const q=query[k],v=c.context[k];
   if(q==null)continue;
   if(v==null)unknown.push(k);
   else if(normalize(q)===normalize(v))matches.push(k);
   else mismatches.push(k);
  }
  const applicability=mismatches.length?"different_context":unknown.length?"context_incomplete":matches.length?"matching_context":"context_not_requested";
  return {...r,applicability,matches,mismatches,unknown,provenance:c.provenance.map(p=>({...p})),provenanceStatus:c.provenance.length?"references_present_not_verified":"references_missing",scientificClaimAllowed:false as const};
 });
 // Conservative ordering, not a calibrated probability. Keep disagreements visible.
 return ranked.sort((a,b)=>a.mismatches.length-b.mismatches.length||a.unknown.length-b.unknown.length||b.matches.length-a.matches.length||b.score-a.score||(a.id<b.id?-1:a.id>b.id?1:0)).slice(0,limit);
}
