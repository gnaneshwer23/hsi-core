import {DEPARTMENT_TAGS} from './departments';
import type {DomainBundle} from './domainGraph';

/** Navigation taxonomy only. Domain tags are recorded annotations, never ontology equivalence or scientific approval. */
export const ATLAS_DEPARTMENTS = [
  {id:'immunology',label:'Immunology',description:'Cells, signalling and immune regulation.',recordedDomains:DEPARTMENT_TAGS.immunology},
  {id:'neuroscience',label:'Neuroscience',description:'Neural systems and immune interactions.',recordedDomains:DEPARTMENT_TAGS.neuroscience},
  {id:'microbiome',label:'Microbiome',description:'Microbial communities and host response.',recordedDomains:DEPARTMENT_TAGS.microbiome},
  {id:'metabolism',label:'Metabolism',description:'Metabolic pathways and inflammation.',recordedDomains:DEPARTMENT_TAGS.metabolism},
  {id:'genomics-multi-omics',label:'Genomics & Multi-omics',description:'Molecular evidence across biological scales.',recordedDomains:DEPARTMENT_TAGS['genomics-multi-omics']},
  {id:'human-physiology',label:'Human Physiology',description:'Mechanisms across tissues and systems.',recordedDomains:DEPARTMENT_TAGS['human-physiology']},
] as const;
export type AtlasDepartmentId=typeof ATLAS_DEPARTMENTS[number]['id'];
export function atlasDepartment(id:string){return ATLAS_DEPARTMENTS.find(d=>d.id===id)}
export function validAtlasDepartment(id:string|undefined){return !id||!!atlasDepartment(id)}
export function atlasDepartmentMatches(domains:readonly string[],id:string){const d=atlasDepartment(id);return !!d&&domains.some(tag=>(d.recordedDomains as readonly string[]).includes(tag))}

/** Subsets retain original canonical records and identifiers, including cross-domain endpoints. No node duplication or inference. */
export function projectAtlasDepartment(bundle:DomainBundle,id:string){
  if(!validAtlasDepartment(id))return {nodes:[],edges:[]};
  if(!id)return {nodes:bundle.nodes,edges:bundle.edges};
  const edges=bundle.edges.filter(e=>atlasDepartmentMatches(e.domains,id));
  const endpoints=new Set(edges.flatMap(e=>[e.subjectId,e.objectId]));
  return {nodes:bundle.nodes.filter(n=>endpoints.has(n.id)||atlasDepartmentMatches(n.domains,id)),edges};
}
export function atlasDepartmentCoverage(bundle:DomainBundle){return ATLAS_DEPARTMENTS.map(d=>{
  const view=projectAtlasDepartment(bundle,d.id);
  return {...d,entities:view.nodes.length,relationships:view.edges.length,sourceCandidates:view.edges.filter(e=>e.kind==='source_candidate').length,independentlyReviewed:0 as const};
})}
/** Data-derived condition catalogue. No disease hierarchy, phenotype equivalence or external ontology IDs are guessed. */
export function atlasDiseaseContexts(bundle:DomainBundle){return [...new Set(bundle.edges.flatMap(e=>e.conditions))].sort().map(label=>({label,relationshipIds:bundle.edges.filter(e=>e.conditions.includes(label)).map(e=>e.id),ontologyStatus:'not_mapped' as const,ontologyIdentifiers:[]}))}

/** Bounded literal lookup over represented labels/aliases, condition annotations and bibliographic metadata.
 * A match is navigation, not ontology resolution, source clearance or support for a scientific claim.
 */
export function searchAtlasRecords(bundle:DomainBundle,query:string){
  if(query.length>200)throw Error('Atlas search exceeds query budget');
  const term=query.normalize('NFKC').trim().toLowerCase();
  const match=(value:string|null)=>!!value&&value.normalize('NFKC').toLowerCase().includes(term);
  if(!term)return {entityIds:bundle.nodes.map(n=>n.id),relationshipIds:bundle.edges.map(e=>e.id),sourceIds:bundle.sources.map(s=>s.id)};
  const entityIds=bundle.nodes.filter(n=>[n.id,n.name,...n.aliases].some(match)).map(n=>n.id);
  const sourceIds=bundle.sources.filter(s=>[s.id,s.title,s.doi,s.pmid].some(match)).map(s=>s.id);
  const entities=new Set(entityIds),sources=new Set(sourceIds);
  const relationshipIds=bundle.edges.filter(e=>entities.has(e.subjectId)||entities.has(e.objectId)||!!e.sourceId&&sources.has(e.sourceId)||match(e.id)||e.conditions.some(match)).map(e=>e.id);
  return {entityIds,relationshipIds,sourceIds};
}
