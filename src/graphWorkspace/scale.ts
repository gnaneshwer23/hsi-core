/**
 * LEA-04D: biological scale for multiscale navigation. The published graph records no scale field, so the level of a
 * concept is derived from its concept type through a stated, versioned table. A type with no honest level stays
 * unplaced and is reported as "scale not recorded"; nothing is guessed from a concept's name.
 */
import type {GraphAssertionView} from "./assertionView";

export const SCALE_MAP_VERSION="1.0.0" as const;

/** Biological levels, from the whole organism down to molecules. */
export type BioLevel="organism"|"tissue"|"cell"|"molecule";
/** Concepts that have no biological level: either their type carries none, or the type is not a biological entity. */
export type Unplaced="not_recorded"|"not_biological";
export type ScaleBand=BioLevel|Unplaced;

export const BIO_LEVELS:readonly {key:BioLevel;label:string}[]=[
 {key:"organism",label:"Organism"},{key:"tissue",label:"Organ and tissue"},{key:"cell",label:"Cell and microbe"},{key:"molecule",label:"Molecule"},
];
export const SCALE_BANDS:readonly {key:ScaleBand;label:string}[]=[
 ...BIO_LEVELS,
 {key:"not_biological",label:"Not a biological level"},
 {key:"not_recorded",label:"Scale not recorded"},
];
export const bandLabel=(b:ScaleBand)=>SCALE_BANDS.find(x=>x.key===b)!.label;
export const isLevel=(b:ScaleBand):b is BioLevel=>b!=="not_recorded"&&b!=="not_biological";

/** Concept type to band. A type absent from this table is "scale not recorded". */
export const KIND_TO_SCALE:Readonly<Record<string,ScaleBand>>={
 disease:"organism",phenotype:"organism",outcome:"organism",
 organ:"tissue",tissue:"tissue",
 "cell state":"cell","cell type":"cell","microbial community":"cell",
 metabolite:"molecule","metabolite class":"molecule","metabolite mixture":"molecule",cytokine:"molecule",pathway:"molecule",gene:"molecule",protein:"molecule",
 intervention:"not_biological",medication:"not_biological","research process":"not_biological",
 /* The generic type says nothing about level. */
 "biological concept":"not_recorded",
};

export type ScalePlacement={band:ScaleBand;kind:string;mapVersion:typeof SCALE_MAP_VERSION;
 /** How the band was reached, for the inspector. */
 basis:"concept_type"|"type_not_in_map"};
export function scaleOfKind(kind:string):ScalePlacement{
 const b=KIND_TO_SCALE[kind];
 return b?{band:b,kind,mapVersion:SCALE_MAP_VERSION,basis:"concept_type"}:{band:"not_recorded",kind,mapVersion:SCALE_MAP_VERSION,basis:"type_not_in_map"};
}
export const bandOf=(kind:string)=>scaleOfKind(kind).band;

/** Does this relationship touch any of the given bands? Used as a filter; it never changes a status. */
export const touchesBands=(a:GraphAssertionView,bands:readonly ScaleBand[])=>bands.includes(bandOf(a.subject.kind))||bands.includes(bandOf(a.object.kind));

export type BandCount={band:ScaleBand;concepts:number;relationships:number};
/** Concepts and relationships per band over the given assertions. A relationship counts once in each band it touches. */
export function scaleCoverage(xs:readonly GraphAssertionView[]):BandCount[]{
 const concepts=new Map<ScaleBand,Set<string>>(),rels=new Map<ScaleBand,number>();
 for(const a of xs){
  const seen=new Set<ScaleBand>();
  for(const c of [a.subject,a.object]){const b=bandOf(c.kind);(concepts.get(b)??concepts.set(b,new Set()).get(b)!).add(c.id);seen.add(b)}
  for(const b of seen)rels.set(b,(rels.get(b)??0)+1);
 }
 return SCALE_BANDS.map(({key})=>({band:key,concepts:concepts.get(key)?.size??0,relationships:rels.get(key)??0}));
}

export type CrossScaleRow={from:BioLevel;to:BioLevel;relationships:number;assertionIds:string[]};
/** Relationships whose two concepts sit at different biological levels. Unplaced concepts are never counted as crossing. */
export function crossScaleLinks(xs:readonly GraphAssertionView[]):CrossScaleRow[]{
 const order=BIO_LEVELS.map(l=>l.key);
 const m=new Map<string,CrossScaleRow>();
 for(const a of xs){
  const s=bandOf(a.subject.kind),o=bandOf(a.object.kind);
  if(!isLevel(s)||!isLevel(o)||s===o)continue;
  const [from,to]=order.indexOf(s)<order.indexOf(o)?[s,o]:[o,s];
  const k=`${from}|${to}`,r=m.get(k)??{from,to,relationships:0,assertionIds:[]};
  r.relationships++;r.assertionIds.push(a.id);m.set(k,r);
 }
 return [...m.values()].sort((x,y)=>order.indexOf(x.from)-order.indexOf(y.from)||order.indexOf(x.to)-order.indexOf(y.to));
}

/** The share of relationships with both concepts placed at a level, so the view can say how much of it a scale view can show. */
export function placedShare(xs:readonly GraphAssertionView[]){
 const both=xs.filter(a=>isLevel(bandOf(a.subject.kind))&&isLevel(bandOf(a.object.kind))).length;
 const none=xs.filter(a=>!isLevel(bandOf(a.subject.kind))&&!isLevel(bandOf(a.object.kind))).length;
 return {total:xs.length,bothPlaced:both,onePlaced:xs.length-both-none,nonePlaced:none};
}

/** Height of each band in the 3D view. Levels are stacked organism above molecule; unplaced bands sit apart below a gap. */
export const BAND_HEIGHT:Readonly<Record<ScaleBand,number>>={organism:1.2,tissue:0.4,cell:-0.4,molecule:-1.2,not_biological:-2.4,not_recorded:-3.2};

/**
 * 3D positions from the deterministic 2D layout: the plane position is kept, so 2D and 3D agree on where a concept
 * is, and the height is its band. Same input, same output.
 */
export function layout3D(positions:ReadonlyMap<string,readonly [number,number]>,bandOfId:(id:string)=>ScaleBand,spread=6):Map<string,[number,number,number]>{
 const out=new Map<string,[number,number,number]>();
 for(const [id,[x,y]] of positions)out.set(id,[(x-0.5)*spread,BAND_HEIGHT[bandOfId(id)],(y-0.5)*spread*0.7]);
 return out;
}
