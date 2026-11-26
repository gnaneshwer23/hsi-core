/**
 * LEA-03 immersive workspace: the Gut–Immune–Brain axis environment.
 * Pure data and derivations over the illustrative atlas. Every relation keeps the atlas's own status;
 * nothing here is verified, reviewed or a finding. Positions are a stylised layout, not anatomy.
 */
import {
 ATLAS_PATHWAYS,STATUS_ORDER,edgeById,entityById,type AtlasEdge,type AtlasEntity,type AtlasStatus,
} from "../components/atlas/atlasData";
import type {ObjectiveId,DomainKey} from "../../../../src/onboarding/scientificOnboarding";

export type Scale="organism"|"organ"|"cell"|"molecule";
export const SCALES:readonly {id:Scale;label:string}[]=[
 {id:"organism",label:"Organism"},{id:"organ",label:"Organ and tissue"},{id:"cell",label:"Cell"},{id:"molecule",label:"Molecule"},
];
export type Layer="mechanisms"|"evidence"|"conflicts"|"gaps";
export const LAYERS:readonly {id:Layer;label:string;note:string}[]=[
 {id:"mechanisms",label:"Mechanisms",note:"Every candidate relation, coloured by evidence status."},
 {id:"evidence",label:"Evidence",note:"Nodes coloured by the weakest status among their relations."},
 {id:"conflicts",label:"Conflicts",note:"Only unresolved conflicts stand out; everything else recedes."},
 {id:"gaps",label:"Research gaps",note:"Hypotheses and associations: where evidence is thin."},
];

const PATHWAYS=["treg","gutbrain","trp"];
export const ENV_EDGE_IDS=[...new Set(ATLAS_PATHWAYS.filter(p=>PATHWAYS.includes(p.id)).flatMap(p=>p.edges))];
export const ENV_EDGES:AtlasEdge[]=ENV_EDGE_IDS.map(id=>edgeById[id]!);
export const ENV_ENTITY_IDS=[...new Set(ENV_EDGES.flatMap(e=>[e.from,e.to]))];
export const ENV_ENTITIES:AtlasEntity[]=ENV_ENTITY_IDS.map(id=>entityById[id]!);

const SCALE_OF:Record<string,Scale>={
 microbiota:"organism",ibd:"organism",pd:"organism",
 barrier:"organ",bbb:"organ",neuroinf:"organ",
 treg:"cell",microglia:"cell",
 butyrate:"molecule",trp:"molecule",il10:"molecule",il6:"molecule",
};
export const scaleOf=(id:string):Scale=>SCALE_OF[id]??"molecule";

/** Stylised 3D layout: gut below, immune system around the middle, brain above. Units are arbitrary. */
const POS:Record<string,[number,number,number]>={
 microbiota:[-1.9,-1.7,0.3],butyrate:[-0.9,-1.5,1.0],trp:[-2.5,-0.8,-0.7],barrier:[0,-0.9,0.2],ibd:[1.9,-1.6,-0.3],
 treg:[0,0.05,1.0],il10:[1.4,0.2,0.6],il6:[-1.3,0.2,-0.5],bbb:[0.4,1.0,-0.3],microglia:[-0.9,1.7,0.5],neuroinf:[0.9,1.8,0.0],pd:[2.0,1.2,-0.9],
};
export const posOf=(id:string):[number,number,number]=>POS[id]??[0,0,0];
export function centroidOfScale(s:Scale|null):[number,number,number]{
 const ids=ENV_ENTITY_IDS.filter(i=>!s||scaleOf(i)===s);
 if(!ids.length)return [0,0,0];
 const sum=ids.reduce((a,i)=>{const p=posOf(i);return [a[0]+p[0],a[1]+p[1],a[2]+p[2]] as [number,number,number]},[0,0,0] as [number,number,number]);
 return [sum[0]/ids.length,sum[1]/ids.length,sum[2]/ids.length];
}

export const STATUS_RANK:Record<AtlasStatus,number>={supported:0,association:1,hypothesis:2,contested:3};
export function weakestInEnv(id:string):AtlasStatus|null{
 const rel=ENV_EDGES.filter(e=>e.from===id||e.to===id);
 if(!rel.length)return null;
 return rel.reduce((w,e)=>STATUS_RANK[e.status]>STATUS_RANK[w]?e.status:w,rel[0]!.status);
}

export type Relation={edge:AtlasEdge;other:AtlasEntity;direction:"out"|"in"};
export function relationsIn(id:string):Relation[]{
 return ENV_EDGES.filter(e=>e.from===id||e.to===id).map(edge=>({edge,direction:edge.from===id?"out" as const:"in" as const,other:entityById[edge.from===id?edge.to:edge.from]!}));
}
export function neighboursOf(id:string):Set<string>{return new Set(relationsIn(id).map(r=>r.other.id))}

/** What is emphasised for a layer, scale and selection. Everything else is dimmed, never removed. */
export type Emphasis={entities:Set<string>;edges:Set<string>};
export function emphasis(layer:Layer,scale:Scale|null,selected:string|null,pinned:Emphasis|null):Emphasis{
 if(pinned&&(pinned.entities.size||pinned.edges.size))return pinned;
 let edges=ENV_EDGES;
 if(layer==="conflicts")edges=edges.filter(e=>e.status==="contested");
 if(layer==="gaps")edges=edges.filter(e=>e.status==="hypothesis"||e.status==="association");
 let entities=new Set(edges.flatMap(e=>[e.from,e.to]));
 if(layer==="mechanisms"||layer==="evidence")entities=new Set(ENV_ENTITY_IDS);
 if(scale)entities=new Set([...entities].filter(i=>scaleOf(i)===scale));
 if(selected){
  const n=neighboursOf(selected);
  entities=new Set([selected,...n]);
  edges=ENV_EDGES.filter(e=>e.from===selected||e.to===selected);
 }
 return {entities,edges:new Set(edges.map(e=>e.id))};
}

export type Landscape={status:AtlasStatus;count:number}[];
export const evidenceLandscape=():Landscape=>STATUS_ORDER.map(s=>({status:s,count:ENV_EDGES.filter(e=>e.status===s).length}));
export const gapEdges=()=>ENV_EDGES.filter(e=>e.status==="hypothesis"||e.status==="contested");

/** Synthetic, labelled in the interface. No dates are claimed to be real. */
export const MEMORY_TIMELINE:readonly {when:string;kind:"Investigation"|"Evidence version"|"Decision"|"Correction"|"Observation";text:string}[]=[
 {when:"Sample day 1",kind:"Investigation",text:"Asked whether butyrate changes intestinal barrier function."},
 {when:"Sample day 3",kind:"Evidence version",text:"Two findings recorded that disagree; marked as an unresolved conflict."},
 {when:"Sample day 5",kind:"Decision",text:"Treat the barrier effect as open until dose and timing are compared."},
 {when:"Sample day 8",kind:"Correction",text:"A relation downgraded from supported to association after a context check."},
 {when:"Sample day 12",kind:"Observation",text:"Planned experiment noted: vary dose at fixed timing in one model."},
];
export const RECENT_INVESTIGATIONS:readonly string[]=[
 "Butyrate and barrier function","Microbial metabolites and microglia","IL-6 and the blood–brain barrier",
];

/* ------------------------------------------------------------- companion */

export type CompanionTurn={id:string;question:string;needs:"selection"|"none";build:(selected:string|null)=>{answer:string[];highlight:Emphasis;layer?:Layer}};
const rel=(id:string)=>relationsIn(id);
const label=(id:string)=>entityById[id]!.label;
const line=(e:AtlasEdge)=>`${label(e.from)} → ${label(e.to)}`;
export const COMPANION:readonly CompanionTurn[]=[
 {id:"why-conflict",question:"Why is this contested?",needs:"selection",build:sel=>{
  const c=sel?rel(sel).filter(r=>r.edge.status==="contested"):[];
  if(!sel||!c.length)return {answer:[sel?`${label(sel)} has no unresolved conflict in this environment.`:"Select an entity first."],highlight:{entities:new Set(sel?[sel]:[]),edges:new Set()}};
  return {answer:c.flatMap(r=>[`${line(r.edge)}: ${r.edge.basis}`,`Unresolved: ${r.edge.unresolved??"not stated"}`]),highlight:{entities:new Set([sel,...c.map(r=>r.other.id)]),edges:new Set(c.map(r=>r.edge.id))},layer:"conflicts"};
 }},
 {id:"what-connects",question:"What is it connected to?",needs:"selection",build:sel=>{
  if(!sel)return {answer:["Select an entity first."],highlight:{entities:new Set(),edges:new Set()}};
  const r=rel(sel);
  return {answer:r.length?r.map(x=>`${line(x.edge)} (${x.edge.status})`):[`${label(sel)} has no relations in this environment.`],highlight:{entities:new Set([sel,...r.map(x=>x.other.id)]),edges:new Set(r.map(x=>x.edge.id))}};
 }},
 {id:"thin",question:"Where is the evidence thinnest?",needs:"none",build:()=>{
  const g=ENV_EDGES.filter(e=>e.status==="hypothesis");
  return {answer:g.map(e=>`${line(e)}: ${e.basis}`),highlight:{entities:new Set(g.flatMap(e=>[e.from,e.to])),edges:new Set(g.map(e=>e.id))},layer:"gaps"};
 }},
 {id:"trace-barrier",question:"Trace the gut barrier to the brain.",needs:"none",build:()=>{
  const path=["e-bar-il6","e-il6-bbb","e-bbb-mg","e-mg-ni"].filter(id=>edgeById[id]);
  return {answer:[...path.map(id=>`${line(edgeById[id]!)} (${edgeById[id]!.status})`),"A chain is only as strong as its weakest link: here that is a hypothesis."],highlight:{entities:new Set(path.flatMap(id=>[edgeById[id]!.from,edgeById[id]!.to])),edges:new Set(path)},layer:"mechanisms"};
 }},
];

export type Initial={layer:Layer;scale:Scale|null;matchesDomain:boolean};
const ENV_DOMAINS:DomainKey[]=["immunology","microbiome","neuroscience"];
/** The answers choose where the environment opens: a conflict goal opens the conflicts layer, a gap goal the gaps layer. */
export function initialView(domain:DomainKey|null,objectives:readonly ObjectiveId[]):Initial{
 const layer:Layer=objectives.includes("conflicts")?"conflicts":objectives.includes("gaps")||objectives.includes("hypotheses")?"gaps":"mechanisms";
 return {layer,scale:null,matchesDomain:!domain||ENV_DOMAINS.includes(domain)};
}
export const ENTITY_COUNT=ENV_ENTITIES.length;
