/** B-02: deterministic, scoped biomedical entity resolution over public bibliographic metadata.
 * No graph promotion, clinical inference, or automatic synonym guessing.
 */
import type {ResearchSource} from "./researchContracts";
export type BiomedicalKind="cell"|"cytokine"|"process"|"disease";
export type OntologyTerm={id:string;label:string;kind:BiomedicalKind;aliases:readonly string[]};
export type EntityMention={sourceId:string;termId:string;label:string;kind:BiomedicalKind;matchedText:string;start:number;end:number;resolution:"exact_label"|"curated_alias"};
export const SSC_TERMS:readonly OntologyTerm[]=[
 {id:"MONDO:0005100",label:"systemic sclerosis",kind:"disease",aliases:["scleroderma"]},
 {id:"CL:0002038",label:"T follicular helper cell",kind:"cell",aliases:["Tfh cell","Tfh cells"]},
 {id:"IL21",label:"interleukin-21",kind:"cytokine",aliases:["IL-21"]},
 {id:"CL:0000236",label:"B cell",kind:"cell",aliases:["B cells"]},
 {id:"GO:0048143",label:"astrocyte activation",kind:"process",aliases:[]}
];
const escapeRegExp=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
export function resolveBibliographicEntities(sources:readonly ResearchSource[],terms:readonly OntologyTerm[]=SSC_TERMS):EntityMention[]{
 const result:EntityMention[]=[];
 const seen=new Set<string>();
 for(const source of sources){
  if(source.dataClass!=="public_real"||source.kind!=="publication")throw Error("B-02 accepts public publication metadata only");
  for(const term of terms){
   if(!/^[A-Za-z][A-Za-z0-9_:-]{1,80}$/.test(term.id)||!term.label.trim())throw Error("Invalid curated ontology term");
   for(const [i,alias] of [term.label,...term.aliases].entries()){
    if(alias.length<2)throw Error("Invalid alias");
    const re=new RegExp("(?<![\\p{L}\\p{N}])"+escapeRegExp(alias)+"(?![\\p{L}\\p{N}])","giu");
    for(const match of source.title.matchAll(re)){
     const start=match.index??0,end=start+match[0].length,key=[source.id,term.id,start,end].join(":");
     if(seen.has(key))continue;seen.add(key);
     result.push({sourceId:source.id,termId:term.id,label:term.label,kind:term.kind,matchedText:match[0],start,end,resolution:i===0?"exact_label":"curated_alias"});
    }
   }
  }
 }
 return result.sort((a,b)=>a.sourceId.localeCompare(b.sourceId)||a.start-b.start||a.termId.localeCompare(b.termId));
}
