/** ARCH-002 / Phase 3.2: governed ontology namespace registry and conservative
 * cross-domain entity resolution. Registry entries describe identifier syntax,
 * NOT evidence that a mapping is scientifically valid.
 */
import type {HsiGraphNode} from "./livingHealthKnowledgeGraph";
export type HsiOntologyNamespace={
 prefix:string;label:string;uriBase:string;identifierPattern:RegExp;
 domain:"biology"|"clinical"|"trial"|"publication"|"microbiome";
};
export const HSI_ONTOLOGY_NAMESPACES:readonly HsiOntologyNamespace[]=[
 {prefix:"HGNC",label:"HGNC gene identifiers",uriBase:"https://identifiers.org/hgnc:",identifierPattern:/^HGNC:[1-9][0-9]*$/,domain:"biology"},
 {prefix:"UniProt",label:"UniProt accession",uriBase:"https://identifiers.org/uniprot:",identifierPattern:/^[A-NR-Z][0-9][A-Z0-9]{3}[0-9](?:-[1-9][0-9]*)?$|^[OPQ][0-9][A-Z0-9]{3}[0-9](?:-[1-9][0-9]*)?$|^[A-NR-Z][0-9][A-Z0-9]{8}[0-9](?:-[1-9][0-9]*)?$/,domain:"biology"},
 {prefix:"GO",label:"Gene Ontology",uriBase:"https://identifiers.org/GO:",identifierPattern:/^GO:[0-9]{7}$/,domain:"biology"},
 {prefix:"Reactome",label:"Reactome pathways",uriBase:"https://reactome.org/content/detail/",identifierPattern:/^R-[A-Z]{3}-[0-9]+$/,domain:"biology"},
 {prefix:"MONDO",label:"MONDO disease ontology",uriBase:"https://identifiers.org/MONDO:",identifierPattern:/^MONDO:[0-9]{7}$/,domain:"biology"},
 {prefix:"UBERON",label:"Uberon anatomy ontology",uriBase:"https://identifiers.org/UBERON:",identifierPattern:/^UBERON:[0-9]{7}$/,domain:"biology"},
 {prefix:"CL",label:"Cell Ontology",uriBase:"https://identifiers.org/CL:",identifierPattern:/^CL:[0-9]{7}$/,domain:"biology"},
 {prefix:"LOINC",label:"LOINC codes",uriBase:"https://loinc.org/",identifierPattern:/^[0-9]{1,7}-[0-9]$/,domain:"clinical"},
 {prefix:"NCT",label:"ClinicalTrials.gov study identifiers",uriBase:"https://clinicaltrials.gov/study/",identifierPattern:/^NCT[0-9]{8}$/,domain:"trial"},
 {prefix:"PMID",label:"PubMed publication identifiers",uriBase:"https://pubmed.ncbi.nlm.nih.gov/",identifierPattern:/^[1-9][0-9]*$/,domain:"publication"}
] as const;
export type HsiOntologyMapping={from:{system:string;value:string};to:{system:string;value:string};relation:"exact"|"broad"|"narrow"|"related";sourceRef:string;reviewDecisionId:string|null;version:string};
export type HsiResolution={status:"resolved"|"ambiguous"|"unresolved";canonicalId:string|null;candidates:readonly string[];reason:string};
const key=(system:string,value:string)=>JSON.stringify([system,value]);
export function validateHsiOntologyIdentifier(system:string,value:string,registry:readonly HsiOntologyNamespace[]=HSI_ONTOLOGY_NAMESPACES):void{
 const namespace=registry.find(x=>x.prefix===system);
 if(!namespace||!namespace.identifierPattern.test(value))throw Error("Unknown or invalid ontology identifier");
}
export function validateHsiOntologyMapping(mapping:HsiOntologyMapping):void{
 validateHsiOntologyIdentifier(mapping.from.system,mapping.from.value);
 validateHsiOntologyIdentifier(mapping.to.system,mapping.to.value);
 if(!mapping.sourceRef.trim()||!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(mapping.version))throw Error("Mapping provenance and version required");
 if(mapping.relation==="exact"&&!mapping.reviewDecisionId?.trim())throw Error("Exact cross-ontology mapping requires human review");
 if(mapping.from.system===mapping.to.system&&mapping.from.value===mapping.to.value)throw Error("Self mapping is redundant");
}
export function resolveHsiOntologyIdentity(input:{system:string;value:string;nodes:readonly HsiGraphNode[];mappings?:readonly HsiOntologyMapping[];includeRestricted?:boolean}):HsiResolution{
 validateHsiOntologyIdentifier(input.system,input.value);
 const candidates=new Set<string>();
 const query=key(input.system,input.value);
 for(const node of input.nodes){
  if(node.visibility==="restricted_clinical"&&!input.includeRestricted)continue;
  if(node.sourceIdentifiers.some(x=>x.mapping==="exact"&&key(x.system,x.value)===query))candidates.add(node.id);
 }
 for(const mapping of input.mappings??[]){
  validateHsiOntologyMapping(mapping);
  if(mapping.relation!=="exact")continue;
  const target=key(mapping.from.system,mapping.from.value)===query?mapping.to:key(mapping.to.system,mapping.to.value)===query?mapping.from:null;
  if(!target)continue;
  for(const node of input.nodes){
   if(node.visibility==="restricted_clinical"&&!input.includeRestricted)continue;
   if(node.sourceIdentifiers.some(x=>x.mapping==="exact"&&key(x.system,x.value)===key(target.system,target.value)))candidates.add(node.id);
  }
 }
 const ids=[...candidates].sort();
 return ids.length===1?{status:"resolved",canonicalId:ids[0]!,candidates:ids,reason:"unique reviewed exact identifier"}:
  ids.length>1?{status:"ambiguous",canonicalId:null,candidates:ids,reason:"identifier collision; human resolution required"}:
  {status:"unresolved",canonicalId:null,candidates:[],reason:"no reviewed exact identity"};
}
