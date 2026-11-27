/**
 * LEA-04B: a contextual assertion view over the published graph's edges.
 * Every context field is explicit: a value, or "not stated" with the reason. Nothing is inferred, filled in or
 * promoted. A candidate stays a candidate; no assertion in the published graph is reviewed or approved.
 */
import type {DomainBundle,DomainEdge,DomainNode,DomainSource} from "../knowledgeGraph/domainGraph";
import {domainsOf,type HsiDomain} from "./domainMap";

/** Why a value is absent. They differ: one is a gap in the source, the other a gap in what HSI records. */
export type NotStatedReason="not_stated_in_source"|"not_recorded_in_graph_schema";
export type Stated<T>={state:"stated";value:T}|{state:"not_stated";reason:NotStatedReason};
const stated=<T,>(v:T):Stated<T>=>({state:"stated",value:v});
const absent=(reason:NotStatedReason="not_stated_in_source"):Stated<never>=>({state:"not_stated",reason});
const orAbsent=(v:string|null|undefined)=>v&&v.trim()?stated(v.trim()):absent();

export type AssertionContext={
 species:Stated<string>;modelSystem:Stated<string>;tissue:Stated<string>;population:Stated<string>;
 assay:Stated<string>;timepoint:Stated<string>;intervention:Stated<string>;endpoint:Stated<string>;
 /** The published graph has no field for these. They are listed so their absence is visible, not hidden. */
 cellType:Stated<string>;diseaseState:Stated<string>;dose:Stated<string>;duration:Stated<string>;
};
export const CONTEXT_KEYS=["species","modelSystem","tissue","population","assay","timepoint","intervention","endpoint","cellType","diseaseState","dose","duration"] as const;
export type ContextKey=(typeof CONTEXT_KEYS)[number];
export const CONTEXT_LABEL:Record<ContextKey,string>={
 species:"Species",modelSystem:"Model system",tissue:"Tissue",population:"Population",assay:"Method",timepoint:"Timepoint",intervention:"Intervention",endpoint:"Endpoint",
 cellType:"Cell type",diseaseState:"Disease state",dose:"Dose",duration:"Duration",
};
/** Keys the published schema can carry; the rest are always not recorded. */
export const RECORDABLE:readonly ContextKey[]=["species","modelSystem","tissue","population","assay","timepoint","intervention","endpoint"];

const MODEL:Record<string,{species:string|null;system:string|null}>={
 human_in_vivo:{species:"Human",system:"In vivo"},human_ex_vivo:{species:"Human",system:"Ex vivo"},human_cell_line:{species:"Human",system:"Cell line"},
 mouse:{species:"Mouse",system:"Mouse model"},rodent:{species:"Rodent (species not specified)",system:"Rodent model"},mixed:{species:null,system:"Mixed models"},unspecified:{species:null,system:null},
};

export type AssertionStatus={
 /** Always a candidate today: the published graph holds no reviewed or approved assertion. */
 level:"candidate";review:"unreviewed";confidence:"not_calibrated";verification:"source_not_verified";approved:false;
};

export type GraphAssertionView={
 id:string;
 subject:{id:string;name:string;kind:string};object:{id:string;name:string;kind:string};
 /** The source's own wording, shown as reported. It is not a statement that HSI has established the relationship. */
 predicate:string;reportedAs:string;negated:boolean;
 /** The statement as recorded for this relationship, shown as recorded. */
 statement:string;
 domains:HsiDomain[];
 context:AssertionContext;
 contextCompleteness:{stated:number;recordable:number};
 evidence:{sourceId:string|null;doi:string|null;pmid:string|null;identity:DomainSource["identityStatus"]|null;rights:DomainSource["rights"]|null;passage:"not_available"|"locator_only"|"text_recorded"};
 limitations:string;scopeWarnings:readonly string[];
 status:AssertionStatus;
 graphVersion:string;
};

const pretty=(s:string)=>s.replaceAll("_"," ");
const STATUS:AssertionStatus={level:"candidate",review:"unreviewed",confidence:"not_calibrated",verification:"source_not_verified",approved:false};

function passageState(src:DomainSource|undefined):GraphAssertionView["evidence"]["passage"]{
 if(!src||!src.passages.length)return "not_available";
 return src.passages.some(p=>p.text)?"text_recorded":"locator_only";
}

export function toAssertionView(e:DomainEdge,nodes:ReadonlyMap<string,DomainNode>,sources:ReadonlyMap<string,DomainSource>,graphVersion:string):GraphAssertionView{
 const s=nodes.get(e.subjectId),o=nodes.get(e.objectId),src=e.sourceId?sources.get(e.sourceId):undefined;
 const m=MODEL[e.model]??MODEL.unspecified!;
 const context:AssertionContext={
  species:m.species?stated(m.species):absent(),modelSystem:m.system?stated(m.system):absent(),
  tissue:orAbsent(e.tissue),population:orAbsent(e.population),assay:orAbsent(e.assay),timepoint:orAbsent(e.timepoint),intervention:orAbsent(e.intervention),endpoint:orAbsent(e.outcome),
  cellType:absent("not_recorded_in_graph_schema"),diseaseState:absent("not_recorded_in_graph_schema"),dose:absent("not_recorded_in_graph_schema"),duration:absent("not_recorded_in_graph_schema"),
 };
 const have=RECORDABLE.filter(k=>context[k].state==="stated").length;
 const sd=domainsOf([...(s?.domains??[]),...e.domains],s?.kind).domains;
 const od=domainsOf(o?.domains??[],o?.kind).domains;
 return {
  id:e.id,
  subject:{id:e.subjectId,name:s?.name??e.subjectId,kind:s?.kind??"unknown"},object:{id:e.objectId,name:o?.name??e.objectId,kind:o?.kind??"unknown"},
  predicate:e.predicate,reportedAs:pretty(e.predicate),negated:e.negated,statement:e.assertion,
  domains:[...new Set([...sd,...od])],
  context,contextCompleteness:{stated:have,recordable:RECORDABLE.length},
  evidence:{sourceId:e.sourceId,doi:src?.doi??null,pmid:src?.pmid??null,identity:src?.identityStatus??null,rights:src?.rights??null,passage:passageState(src)},
  limitations:e.limitations,scopeWarnings:e.scopeWarnings,
  status:STATUS,graphVersion,
 };
}

export type GraphModel={
 version:string;parentVersion:string|null;
 nodes:ReadonlyMap<string,DomainNode>;
 assertions:readonly GraphAssertionView[];
 gaps:DomainBundle["gaps"];questions:DomainBundle["questions"];
 sources:ReadonlyMap<string,DomainSource>;
 nodeDomains:ReadonlyMap<string,{domains:HsiDomain[];unmappedTags:string[]}>;
 /** The verified bundle the model was built from, kept so the existing context-breakdown contracts can run over full records. */
 bundle:DomainBundle;
};

/** Candidate relationships only. Recorded research gaps are kept apart so they cannot be mistaken for findings. */
export function buildGraphModel(b:DomainBundle):GraphModel{
 const nodes=new Map(b.nodes.map(n=>[n.id,n])),sources=new Map(b.sources.map(s=>[s.id,s]));
 return {
  version:b.version,parentVersion:b.parentVersion,nodes,sources,
  assertions:b.edges.filter(e=>e.kind==="source_candidate").map(e=>toAssertionView(e,nodes,sources,b.version)),
  gaps:b.gaps,questions:b.questions,
  nodeDomains:new Map(b.nodes.map(n=>[n.id,domainsOf(n.domains,n.kind)])),
  bundle:b,
 };
}
