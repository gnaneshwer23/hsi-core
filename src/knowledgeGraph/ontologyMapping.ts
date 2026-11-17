/**
 * KG-02 slice 1: the contract for mapping snapshot-local concepts to external ontology identifiers, and a verifier.
 * A mapping is a claim with a relation type, evidence and a review status. It never changes the graph, and nothing here
 * assumes two identifiers are equivalent. No mapping data is supplied by this slice.
 */
import type {DomainBundle} from './domainGraph';

export const NAMESPACES=['HGNC','UNIPROT','MONDO','HP','CL','UBERON','CHEBI','CHEMBL','REACTOME','GO'] as const;
export type Namespace=(typeof NAMESPACES)[number];
/** SKOS-style relations. `exact` is the strongest claim and the only one that may be a reviewed primary mapping. */
export const RELATIONS=['exact','close','broad','narrow','related'] as const;
export type Relation=(typeof RELATIONS)[number];
export const EVIDENCE_METHODS=['exact_label','synonym','identifier_given','manual'] as const;
export type EvidenceMethod=(typeof EVIDENCE_METHODS)[number];
export const REVIEW_STATUSES=['candidate','reviewed','rejected'] as const;
export type ReviewStatus=(typeof REVIEW_STATUSES)[number];

/** Identifier syntax per namespace. Syntax only: it does not prove the identifier exists or means what is claimed. */
export const IDENTIFIER_PATTERNS:Record<Namespace,RegExp>={
 HGNC:/^HGNC:\d{1,6}$/,
 UNIPROT:/^(?:[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9](?:[A-Z][A-Z0-9]{2}[0-9]){1,2})$/,
 MONDO:/^MONDO:\d{7}$/,
 HP:/^HP:\d{7}$/,
 CL:/^CL:\d{7}$/,
 UBERON:/^UBERON:\d{7}$/,
 CHEBI:/^CHEBI:\d{1,7}$/,
 CHEMBL:/^CHEMBL\d{1,9}$/,
 REACTOME:/^R-HSA-\d{1,8}$/,
 GO:/^GO:\d{7}$/,
};

export type OntologyVersion={namespace:Namespace;version:string;retrievedAt:string;licence:string};
export type Reviewer={name:string;role:string;/** false for an interim or owner review: it must never be presented as independent. */independent:boolean};
export type OntologyMapping={
 id:string;conceptId:string;namespace:Namespace;identifier:string;label:string;relation:Relation;
 evidence:{method:EvidenceMethod;note:string};
 reviewStatus:ReviewStatus;mappedBy:string;mappedAt:string;
 reviewer:Reviewer|null;reviewedAt:string|null;rejectionReason:string|null;
};
export type OntologyMappingFile={
 schemaVersion:'hsi-ontology-mappings-1';
 /** The graph version the mappings were made against. Informational; dangling concept ids are still rejected. */
 mappedAgainst:string;
 ontologies:OntologyVersion[];
 mappings:OntologyMapping[];
 digest:string;
};

const KEYS={file:['schemaVersion','mappedAgainst','ontologies','mappings','digest'],ontology:['namespace','version','retrievedAt','licence'],mapping:['id','conceptId','namespace','identifier','label','relation','evidence','reviewStatus','mappedBy','mappedAt','reviewer','reviewedAt','rejectionReason'],evidence:['method','note'],reviewer:['name','role','independent']};
const isObj=(v:unknown):v is Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v);
const text=(v:unknown,max:number):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
const isoDate=(v:unknown):v is string=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}(?:T[\d:.]+Z)?$/.test(v)&&!Number.isNaN(Date.parse(v));
const sameKeys=(o:Record<string,unknown>,keys:readonly string[])=>Object.keys(o).length===keys.length&&keys.every(k=>k in o);

/** Stable text form used for the digest: fixed key order, the digest field excluded. */
export function canonicalMappingText(file:Omit<OntologyMappingFile,'digest'>|OntologyMappingFile):string{
 const {schemaVersion,mappedAgainst,ontologies,mappings}=file;
 const sorted=[...mappings].sort((a,b)=>a.id.localeCompare(b.id));
 return JSON.stringify({schemaVersion,mappedAgainst,ontologies:[...ontologies].sort((a,b)=>a.namespace.localeCompare(b.namespace)),mappings:sorted});
}
export async function ontologyMappingDigest(file:OntologyMappingFile|Omit<OntologyMappingFile,'digest'>,sha256Hex:(s:string)=>Promise<string>):Promise<string>{
 return sha256Hex(canonicalMappingText(file));
}

/** Returns every problem found; an empty list means the file satisfies the contract. It does not judge whether a mapping is scientifically right. */
export async function verifyOntologyMappings(input:unknown,graph:Pick<DomainBundle,'nodes'>,sha256Hex:(s:string)=>Promise<string>):Promise<string[]>{
 const errors:string[]=[];
 if(!isObj(input)||!sameKeys(input,KEYS.file))return ['File must be an object with exactly: '+KEYS.file.join(', ')];
 const f=input as unknown as OntologyMappingFile;
 if(f.schemaVersion!=='hsi-ontology-mappings-1')errors.push('Unsupported schemaVersion');
 if(typeof f.mappedAgainst!=='string'||!/^[a-f0-9]{64}$/.test(f.mappedAgainst))errors.push('mappedAgainst must be a 64-character graph version');
 if(!Array.isArray(f.ontologies)||!Array.isArray(f.mappings))return [...errors,'ontologies and mappings must be arrays'];
 const pinned=new Map<string,OntologyVersion>(),nodeIds=new Set(graph.nodes.map(n=>n.id));
 for(const o of f.ontologies){
  if(!isObj(o)||!sameKeys(o,KEYS.ontology)){errors.push('Malformed ontology version entry');continue}
  if(!(NAMESPACES as readonly string[]).includes(o.namespace))errors.push('Unknown namespace '+String(o.namespace));
  if(!text(o.version,80))errors.push(`Ontology ${String(o.namespace)} must pin a version`);
  if(!isoDate(o.retrievedAt))errors.push(`Ontology ${String(o.namespace)} needs a retrievedAt date`);
  if(!text(o.licence,120))errors.push(`Ontology ${String(o.namespace)} must record its licence`);
  if(pinned.has(o.namespace))errors.push(`Ontology ${o.namespace} is listed twice`);
  pinned.set(o.namespace,o);
 }
 const ids=new Set<string>(),triples=new Set<string>(),reviewedExact=new Map<string,string>();
 for(const m of f.mappings){
  if(!isObj(m)||!sameKeys(m,KEYS.mapping)){errors.push('Malformed mapping record');continue}
  const at=`Mapping ${String(m.id)}`;
  if(!text(m.id,120))errors.push('Mapping id missing');else if(ids.has(m.id))errors.push(`${at}: duplicate id`);else ids.add(m.id);
  if(!nodeIds.has(m.conceptId))errors.push(`${at}: concept ${String(m.conceptId)} is not in the graph`);
  const ns=(NAMESPACES as readonly string[]).includes(m.namespace)?m.namespace as Namespace:null;
  if(!ns)errors.push(`${at}: unknown namespace ${String(m.namespace)}`);
  else{
   if(!IDENTIFIER_PATTERNS[ns].test(String(m.identifier)))errors.push(`${at}: ${String(m.identifier)} is not a valid ${ns} identifier`);
   if(!pinned.has(ns))errors.push(`${at}: ${ns} has no pinned ontology version`);
  }
  if(!text(m.label,200))errors.push(`${at}: label missing`);
  if(!(RELATIONS as readonly string[]).includes(m.relation))errors.push(`${at}: unknown relation`);
  if(!isObj(m.evidence)||!sameKeys(m.evidence,KEYS.evidence)||!(EVIDENCE_METHODS as readonly string[]).includes(m.evidence.method as string)||!text(m.evidence.note,500))errors.push(`${at}: evidence needs a method and a note`);
  if(!text(m.mappedBy,120)||!isoDate(m.mappedAt))errors.push(`${at}: mappedBy and mappedAt are required`);
  const key=`${m.conceptId}|${m.namespace}|${m.identifier}`;
  if(triples.has(key))errors.push(`${at}: the same concept, namespace and identifier is mapped twice`);triples.add(key);
  const status=m.reviewStatus as string;
  if(!(REVIEW_STATUSES as readonly string[]).includes(status))errors.push(`${at}: unknown reviewStatus`);
  const hasReviewer=m.reviewer!==null;
  if(status==='candidate'&&(hasReviewer||m.reviewedAt!==null||m.rejectionReason!==null))errors.push(`${at}: a candidate must have no reviewer, review date or rejection reason`);
  if(status==='reviewed'){
   const r=m.reviewer;
   if(!isObj(r)||!sameKeys(r,KEYS.reviewer)||!text(r.name,120)||!text(r.role,120)||typeof r.independent!=='boolean')errors.push(`${at}: a reviewed mapping needs a reviewer with name, role and independent true or false`);
   if(!isoDate(m.reviewedAt))errors.push(`${at}: a reviewed mapping needs reviewedAt`);
   if(m.rejectionReason!==null)errors.push(`${at}: a reviewed mapping cannot carry a rejection reason`);
   if(m.relation==='exact'){const k=`${m.conceptId}|${m.namespace}`,prev=reviewedExact.get(k);if(prev)errors.push(`${at}: concept ${String(m.conceptId)} already has a reviewed exact ${String(m.namespace)} mapping (${prev}); record the ambiguity as candidates`);else reviewedExact.set(k,String(m.id))}
  }
  if(status==='rejected'&&!text(m.rejectionReason,500))errors.push(`${at}: a rejected mapping needs a reason`);
 }
 const expected=await sha256Hex(canonicalMappingText(f));
 if(f.digest!==expected)errors.push('digest does not match the content');
 return errors;
}
