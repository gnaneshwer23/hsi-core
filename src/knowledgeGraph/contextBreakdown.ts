/**
 * Evidence by context. A pooled figure such as "12 studies" hides that the records come from different species,
 * tissues, populations and designs. This breaks the candidate records for a relationship or a concept into strata,
 * counts distinct sources per stratum, shows how many records report a negative finding, and says which context
 * fields are missing. It never produces a score, never calls a stratum "supporting", and lists what it cannot assess.
 */
import type {DomainBundle,DomainEdge} from "./domainGraph";

export const CONTEXT_FIELDS=["model","tissue","population","design"] as const;
export type ContextField=(typeof CONTEXT_FIELDS)[number];
export const NOT_ASSESSED=Object.freeze(["effect_size","independence_of_replication","retraction_status","study_quality"] as const);

export type StratumKey={model:string;tissue:string|null;population:string|null;design:string};
export type Stratum={
 key:StratumKey;recordIds:string[];sourceIds:string[];studyCount:number;recordsWithoutSource:number;
 predicates:string[];negativeFindings:number;reportedFindings:number;
 /** reported = no negative finding; negative = all negative; mixed = both. Never "supports". */
 direction:"reported"|"negative"|"mixed";
 missingFields:ContextField[];conditions:string[];
};
export type ContextBreakdown={
 schemaVersion:"hsi-context-breakdown-1";graphVersion:string;
 scope:{kind:"pair";subjectId:string;objectId:string}|{kind:"concept";nodeId:string};
 strata:Stratum[];
 totals:{records:number;studies:number;strata:number;negativeFindings:number;recordsWithoutSource:number;openQuestions:number};
 /** Records missing each context field. A high count means the pooled picture is not trustworthy. */
 missing:Record<ContextField,number>;
 /** Share of records with every context field present, or null when there are no records. */
 completeContextShare:number|null;
 summary:string;
 notAssessed:readonly string[];
 caveats:string[];
 scientificApproval:false;causalConclusionAllowed:false;
};

const MODEL_LABEL:Record<string,string>={human_in_vivo:"human in vivo",human_ex_vivo:"human ex vivo",human_cell_line:"human cell line",mouse:"mouse",rodent:"rodent",mixed:"mixed systems",unspecified:"unspecified system"};
const label=(m:string)=>MODEL_LABEL[m]??m.replaceAll("_"," ");
const norm=(s:string|null)=>s===null?null:s.trim().replace(/\s+/g," ")||null;
const keyOf=(e:DomainEdge):StratumKey=>({model:e.model,tissue:norm(e.tissue),population:norm(e.population),design:norm(e.design)??"unspecified design"});
const keyString=(k:StratumKey)=>JSON.stringify([k.model,k.tissue?.toLowerCase()??null,k.population?.toLowerCase()??null,k.design.toLowerCase()]);
const missingOf=(k:StratumKey):ContextField[]=>CONTEXT_FIELDS.filter(f=>f==="model"?k.model==="unspecified":f==="design"?k.design==="unspecified design":k[f]===null);

export function summariseStrata(strata:readonly Stratum[]):string{
 const studies=new Set(strata.flatMap(s=>s.sourceIds));
 if(strata.length===0)return "No source-linked candidate records for this scope.";
 const byModel=new Map<string,Set<string>>();
 for(const s of strata){const set=byModel.get(s.key.model)??new Set<string>();s.sourceIds.forEach(id=>set.add(id));byModel.set(s.key.model,set)}
 const parts=[...byModel.entries()].sort((a,b)=>b[1].size-a[1].size||a[0].localeCompare(b[0])).map(([m,set])=>`${set.size} ${label(m)}`);
 return `${studies.size} ${studies.size===1?"source":"sources"} in ${strata.length} ${strata.length===1?"context":"contexts"}: ${parts.join(", ")}.`;
}

function build(g:DomainBundle,edges:DomainEdge[],scope:ContextBreakdown["scope"],openQuestions:number):ContextBreakdown{
 const by=new Map<string,{key:StratumKey;edges:DomainEdge[]}>();
 for(const e of edges){const k=keyOf(e),ks=keyString(k),cur=by.get(ks);if(cur)cur.edges.push(e);else by.set(ks,{key:k,edges:[e]})}
 const strata:Stratum[]=[...by.values()].map(({key,edges:es})=>{
  const sourceIds=[...new Set(es.map(e=>e.sourceId).filter((s):s is string=>s!==null))].sort();
  const negative=es.filter(e=>e.negated).length;
  return {key,recordIds:es.map(e=>e.id).sort(),sourceIds,studyCount:sourceIds.length,recordsWithoutSource:es.filter(e=>e.sourceId===null).length,
   predicates:[...new Set(es.map(e=>e.predicate))].sort(),negativeFindings:negative,reportedFindings:es.length-negative,
   direction:(negative===0?"reported":negative===es.length?"negative":"mixed") as Stratum["direction"],missingFields:missingOf(key),conditions:[...new Set(es.flatMap(e=>e.conditions))].sort()};
 }).sort((a,b)=>b.studyCount-a.studyCount||b.recordIds.length-a.recordIds.length||keyString(a.key).localeCompare(keyString(b.key)));
 const missing=Object.fromEntries(CONTEXT_FIELDS.map(f=>[f,edges.filter(e=>missingOf(keyOf(e)).includes(f)).length])) as Record<ContextField,number>;
 const complete=edges.filter(e=>missingOf(keyOf(e)).length===0).length;
 const allStudies=new Set(edges.map(e=>e.sourceId).filter((s):s is string=>s!==null));
 const caveats:string[]=["Counts are distinct source identifiers. Sources may share cohorts, so independent replication is not established.","Every record is an unreviewed candidate; this breakdown organises them, it does not weigh or validate them."];
 if(edges.length&&strata.every(s=>s.missingFields.includes("model")))caveats.push("No record states its study system, so these contexts cannot be told apart.");
 else if(edges.length&&missing.model>0)caveats.push(`${missing.model} of ${edges.length} records do not state their study system.`);
 if(strata.length===1&&edges.length>1)caveats.push("All records fall in one context; a different context may behave differently.");
 if(openQuestions>0)caveats.push(`${openQuestions} unresolved research ${openQuestions===1?"question is":"questions are"} recorded for this scope and not counted as evidence.`);
 return {schemaVersion:"hsi-context-breakdown-1",graphVersion:g.version,scope,strata,
  totals:{records:edges.length,studies:allStudies.size,strata:strata.length,negativeFindings:edges.filter(e=>e.negated).length,recordsWithoutSource:edges.filter(e=>e.sourceId===null).length,openQuestions},
  missing,completeContextShare:edges.length?complete/edges.length:null,summary:summariseStrata(strata),notAssessed:NOT_ASSESSED,caveats,scientificApproval:false,causalConclusionAllowed:false};
}

/** Candidate records between two concepts, in either direction. */
export function breakdownForPair(g:DomainBundle,subjectId:string,objectId:string):ContextBreakdown{
 if(!g.nodes.some(n=>n.id===subjectId)||!g.nodes.some(n=>n.id===objectId))throw Error("Unknown concept");
 const between=g.edges.filter(e=>(e.subjectId===subjectId&&e.objectId===objectId)||(e.subjectId===objectId&&e.objectId===subjectId));
 return build(g,between.filter(e=>e.kind==="source_candidate"),{kind:"pair",subjectId,objectId},between.filter(e=>e.kind==="research_gap").length);
}
/** Every candidate record that touches a concept. */
export function breakdownForConcept(g:DomainBundle,nodeId:string):ContextBreakdown{
 if(!g.nodes.some(n=>n.id===nodeId))throw Error("Unknown concept");
 const touching=g.edges.filter(e=>e.subjectId===nodeId||e.objectId===nodeId);
 return build(g,touching.filter(e=>e.kind==="source_candidate"),{kind:"concept",nodeId},touching.filter(e=>e.kind==="research_gap").length);
}
export function exportBreakdown(b:ContextBreakdown){return {...b,exportedFor:"hsi-context-breakdown-1"}}
