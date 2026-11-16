/**
 * KG-02 slice 2: propose a real entity type for concepts the graph only calls "biological concept".
 * Proposals are produced by stated, ordered name rules. They are NOT applied to the graph, they are not calibrated, and every
 * proposal needs a person to accept, change or reject it. A concept that matches no rule stays unclassified.
 */
import type {DomainBundle,DomainNode} from './domainGraph';

export const ENTITY_TYPES=[
 'cell_type','cytokine_or_mediator','receptor','autoantibody_or_antibody','pathway','biological_process','phenotype_or_state','disease',
 'clinical_measurement','drug_or_therapy','intervention_procedure','microorganism','microbial_metabolite','anatomical_structure','exposure','study_context','unclassified',
] as const;
export type EntityType=(typeof ENTITY_TYPES)[number];

export type TypingRule={id:string;type:EntityType;pattern:RegExp;reason:string};
/** Ordered: the first rule that matches decides the proposal; every other matching rule is recorded as an alternative. */
export const TYPING_RULES:readonly TypingRule[]=[
 {id:'R01',type:'study_context',pattern:/\bcohort\b/i,reason:'Names a study cohort, not a biological entity'},
 {id:'R02',type:'clinical_measurement',pattern:/^(hba1c|fasting plasma glucose|hs-crp)\b|time-in-range|\bmonitoring\b/i,reason:'Names a laboratory or monitoring measurement'},
 {id:'R03',type:'autoantibody_or_antibody',pattern:/antibod|rheumatoid factor\b|\(ana\)/i,reason:'Names an antibody or autoantibody'},
 {id:'R04',type:'intervention_procedure',pattern:/nerve stimulat|stimulator|stimulation\b/i,reason:'Names a stimulation intervention'},
 {id:'R05',type:'drug_or_therapy',pattern:/\btherapy\b|\bblockade\b|\binhibitors?\b|\bagonists?\b|\bantagonist\b|teplizumab|rituximab|methotrexate|glucocorticoids|checkpoint/i,reason:'Names a drug, drug class or therapy'},
 {id:'R06',type:'pathway',pattern:/\bpathway\b|\breflex\b|communication axis|\baxis\b/i,reason:'Names a signalling pathway, reflex or axis'},
 {id:'R07',type:'biological_process',pattern:/\b(release|synthesis|biosynthesis|trafficking|recruitment|differentiation|programme|activity|signalling|conditioning|exhaustion|responses|surveillance|reactivity)\b|barrier function|reperfusion tnf response/i,reason:'Names a process rather than an entity'},
 {id:'R08',type:'receptor',pattern:/receptor\b|^pd-1$|\bgpr\d+|\bnachr\b|subunit/i,reason:'Names a receptor'},
 {id:'R10',type:'cytokine_or_mediator',pattern:/^il-\d+$|^baff \(|^cxcl\d+ \(|interleukin/i,reason:'Names a cytokine, chemokine or soluble mediator'},
 {id:'R09',type:'cell_type',pattern:/\bt cells?\b|\bb cells?\b|-cell\b(?!\s+(injury|dysfunction))|plasmablast|microglia|helper cells|tfh|macrophage\b(?!\s+tnf)/i,reason:'Names a cell population'},
 {id:'R11',type:'microbial_metabolite',pattern:/metabolites|catabolites/i,reason:'Names microbial metabolites'},
 {id:'R12',type:'microorganism',pattern:/bacteria|clostridi|virus|\bebv\b|microbiota|filamentous|fibre-responsive/i,reason:'Names a microorganism or microbial community'},
 {id:'R13',type:'anatomical_structure',pattern:/^(spleen|splenic nerve)\b|\bbarrier\b|tight junctions/i,reason:'Names an anatomical structure'},
 {id:'R14',type:'exposure',pattern:/endotoxin exposure|^systemic infection\b/i,reason:'Names an exposure'},
 {id:'R15',type:'disease',pattern:/^systemic sclerosis$|inflammatory bowel disease|psoriasis|\bdiabetes\b|\blada\b/i,reason:'Names a disease'},
 {id:'R16',type:'phenotype_or_state',pattern:/fibrosis|hyperglyc|phenotype|heterogeneity|treatment response|susceptibility|adverse events|comorbidity|progression|dysfunction|injury|inflammation|\btone\b|inflammatory/i,reason:'Names a phenotype, clinical state or response'},
];

export type TypingProposal={
 conceptId:string;name:string;currentKind:string;proposedType:EntityType;ruleId:string|null;reason:string;
 /** Other types whose rules also matched. A non-empty list means the name is ambiguous and needs particular care. */
 alternatives:{type:EntityType;ruleId:string}[];
 confidence:'uncalibrated';status:'proposed';
};
export type TypingProposalFile={schemaVersion:'hsi-concept-typing-1';mappedAgainst:string;rulesVersion:string;proposals:TypingProposal[];digest:string};
export const RULES_VERSION='rules-1';

/** Only concepts that the graph calls "biological concept" are typed; every other kind already says what it is. */
export function proposeConceptTypes(nodes:readonly Pick<DomainNode,'id'|'name'|'kind'>[]):TypingProposal[]{
 return nodes.filter(n=>n.kind==='biological concept').map(n=>{
  const hits=TYPING_RULES.filter(r=>r.pattern.test(n.name)),first=hits[0];
  const alts=hits.slice(1).filter(h=>h.type!==first?.type).map(h=>({type:h.type,ruleId:h.id}));
  return {conceptId:n.id,name:n.name,currentKind:n.kind,proposedType:first?.type??'unclassified',ruleId:first?.id??null,reason:first?.reason??'No rule matched this name',alternatives:alts,confidence:'uncalibrated' as const,status:'proposed' as const};
 }).sort((a,b)=>a.conceptId.localeCompare(b.conceptId));
}

export function canonicalTypingText(f:Omit<TypingProposalFile,'digest'>|TypingProposalFile):string{
 return JSON.stringify({schemaVersion:f.schemaVersion,mappedAgainst:f.mappedAgainst,rulesVersion:f.rulesVersion,proposals:[...f.proposals].sort((a,b)=>a.conceptId.localeCompare(b.conceptId))});
}

/** Structural check of a proposal file. It does not judge whether a proposed type is right. */
export async function verifyTypingProposals(input:unknown,graph:Pick<DomainBundle,'nodes'>,sha256Hex:(s:string)=>Promise<string>):Promise<string[]>{
 const errors:string[]=[],isObj=(v:unknown):v is Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v);
 const FILE=['schemaVersion','mappedAgainst','rulesVersion','proposals','digest'],P=['conceptId','name','currentKind','proposedType','ruleId','reason','alternatives','confidence','status'];
 if(!isObj(input)||Object.keys(input).length!==FILE.length||!FILE.every(k=>k in input))return ['File must have exactly: '+FILE.join(', ')];
 const f=input as unknown as TypingProposalFile;
 if(f.schemaVersion!=='hsi-concept-typing-1')errors.push('Unsupported schemaVersion');
 if(f.rulesVersion!==RULES_VERSION)errors.push('rulesVersion does not match the rules in code; regenerate the proposals');
 if(!Array.isArray(f.proposals))return [...errors,'proposals must be an array'];
 const byId=new Map(graph.nodes.map(n=>[n.id,n])),seen=new Set<string>(),ruleIds=new Set(TYPING_RULES.map(r=>r.id));
 for(const p of f.proposals){
  if(!isObj(p)||Object.keys(p).length!==P.length||!P.every(k=>k in p)){errors.push('Malformed proposal');continue}
  const node=byId.get(p.conceptId);
  if(!node)errors.push(`${String(p.conceptId)}: not in the graph`);else if(node.kind!==p.currentKind)errors.push(`${p.conceptId}: currentKind does not match the graph`);
  if(seen.has(p.conceptId))errors.push(`${p.conceptId}: proposed twice`);seen.add(p.conceptId);
  if(!(ENTITY_TYPES as readonly string[]).includes(p.proposedType))errors.push(`${p.conceptId}: unknown type`);
  if(p.ruleId!==null&&!ruleIds.has(p.ruleId))errors.push(`${p.conceptId}: unknown rule`);
  if(p.proposedType==='unclassified'!==(p.ruleId===null))errors.push(`${p.conceptId}: unclassified must be exactly the proposals with no rule`);
  if(p.confidence!=='uncalibrated'||p.status!=='proposed')errors.push(`${p.conceptId}: proposals must be uncalibrated and in status proposed`);
 }
 for(const n of graph.nodes)if(n.kind==='biological concept'&&!seen.has(n.id))errors.push(`${n.id}: a biological concept has no proposal`);
 if(f.digest!==await sha256Hex(canonicalTypingText(f)))errors.push('digest does not match the content');
 return errors;
}
