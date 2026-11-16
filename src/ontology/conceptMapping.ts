/**
 * Candidate label matches between graph concepts and ontology terms. Strictly conservative: a candidate needs a
 * normalised exact match on a label or an exact synonym. Every result is an UNREVIEWED suggestion for a curator;
 * nothing here is an approved mapping, and no graph node is changed.
 */
import type {OntologyTerm} from "./oboTerms";

export type TermTable={prefix:string;release:string;terms:OntologyTerm[]};
export type ConceptInput={id:string;name:string;aliases?:string[]};
export type MappingCandidate={ontology:string;id:string;label:string;matchedOn:"label"|"exact_synonym"|"variant_label"|"variant_synonym";matchedText:string};
export type ConceptMapping={conceptId:string;conceptName:string;status:"candidate"|"ambiguous"|"obsolete_only"|"unmapped";candidates:MappingCandidate[];obsoleteMatches:MappingCandidate[];reviewStatus:"unreviewed";exactMappingApproved:false};

export const normaliseLabel=(s:string)=>s.normalize("NFKD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[‐‑–—−]/g,"-").replace(/[^a-z0-9+\- ]+/g," ").replace(/\s+/g," ").trim();

export function buildIndex(tables:readonly TermTable[]):Map<string,{table:TermTable;term:OntologyTerm;on:"label"|"exact_synonym";text:string}[]>{
 const idx=new Map<string,{table:TermTable;term:OntologyTerm;on:"label"|"exact_synonym";text:string}[]>();
 const add=(k:string,v:{table:TermTable;term:OntologyTerm;on:"label"|"exact_synonym";text:string})=>{if(k.length<3)return;const a=idx.get(k);if(a){if(!a.some(x=>x.term.id===v.term.id))a.push(v)}else idx.set(k,[v])};
 for(const table of tables)for(const term of table.terms){
  add(normaliseLabel(term.label),{table,term,on:"label",text:term.label});
  for(const s of term.synonyms)add(normaliseLabel(s),{table,term,on:"exact_synonym",text:s});
 }
 return idx;
}
/** Conservative spelling variants of a name: parenthetical groups removed, and "cells" read as "cell". Never changes meaning. */
export function nameVariants(text:string):string[]{
 const base=normaliseLabel(text),noParen=normaliseLabel(text.replace(/\([^)]*\)/g," ")),singular=(t:string)=>t.replace(/\bcells\b/g,"cell");
 return [...new Set([noParen,singular(base),singular(noParen)].filter(v=>v&&v!==base))];
}
export type MapOptions={
 /** Only these ontology prefixes may produce a candidate for the concept. A concept absent from the map is searched everywhere. An empty list means no imported ontology serves it. */
 scope?:ReadonlyMap<string,readonly string[]>;
 /** Also accept the conservative variants above, but only when no exact match exists. */
 variants?:boolean;
};
export function mapConcepts(concepts:readonly ConceptInput[],tables:readonly TermTable[],options:MapOptions={}):ConceptMapping[]{
 const idx=buildIndex(tables);
 return concepts.map(c=>{
  const seen=new Set<string>(),live:MappingCandidate[]=[],dead:MappingCandidate[]=[],allowed=options.scope?.get(c.id);
  const take=(keys:readonly string[],variant:boolean)=>{
   for(const key of keys)for(const h of idx.get(key)??[]){
    if(allowed&&!allowed.includes(h.table.prefix))continue;
    const id=h.table.prefix+"|"+h.term.id;if(seen.has(id))continue;seen.add(id);
    const on=variant?(h.on==="label"?"variant_label":"variant_synonym"):h.on;
    const cand:MappingCandidate={ontology:h.table.prefix,id:h.term.id,label:h.term.label,matchedOn:on,matchedText:h.text};
    (h.term.obsolete?dead:live).push(cand);
   }
  };
  const names=[c.name,...(c.aliases??[])];
  if(!(allowed&&allowed.length===0)){
   take(names.map(normaliseLabel),false);
   if(options.variants&&!live.length&&!dead.length)take(names.flatMap(nameVariants),true);
  }
  live.sort((a,b)=>a.id.localeCompare(b.id));dead.sort((a,b)=>a.id.localeCompare(b.id));
  const status=live.length===1?"candidate":live.length>1?"ambiguous":dead.length?"obsolete_only":"unmapped";
  return {conceptId:c.id,conceptName:c.name,status,candidates:live,obsoleteMatches:dead,reviewStatus:"unreviewed",exactMappingApproved:false};
 });
}
