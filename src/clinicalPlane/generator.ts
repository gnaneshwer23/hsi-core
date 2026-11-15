/**
 * Seeded synthetic cohort generator for the clinical plane demonstrations.
 *
 * What it is: a deterministic generator (same spec, same cohort, byte for byte) that produces profiles with condition-shaped
 * age, sex, BMI, HbA1c, hs-CRP and medications, and deliberate missing data so "not enough information" is exercised.
 * What it is not: epidemiology. Every parameter below is an ILLUSTRATIVE value chosen so demonstrations behave sensibly. None is
 * calibrated to a real population or study, and nothing generated here is evidence about any real disease or person.
 * Why it exists: the 200-profile validation dataset has 10 profiles per condition, so small-group protection hides most results,
 * and its values are not condition-consistent (for example type 2 diabetes profiles average an HbA1c of 5.6%).
 * Ids use the SYN-G prefix and are treated as identifiers by the release gate, like SYN-P ids.
 */
import type {PlanePatient} from "./phenotype";

export const GENERATOR_VERSION="hsi-synthetic-generator-1" as const;
export type GeneratorSpec={seed:number;n:number};
export const MAX_GENERATED=20_000;
export const DEFAULT_SPEC:GeneratorSpec={seed:20261115,n:5000};

type Profile={condition:string;weight:number;age:[number,number];female:number;bmi:[number,number];hba1c:[number,number];crp:[number,number];meds:[string,number][]};
/** Illustrative parameters. Means and spreads are demonstration values, not estimates. */
export const PROFILES:Profile[]=[
 {condition:"Type 2 diabetes",weight:8,age:[62,10],female:.45,bmi:[31,5],hba1c:[7.9,1.2],crp:[3,.9],meds:[["Metformin",.8],["SGLT2 inhibitor",.3],["GLP-1 receptor agonist",.25],["Statin",.5]]},
 {condition:"Type 1 diabetes",weight:3,age:[35,13],female:.48,bmi:[25,4],hba1c:[8,1.3],crp:[1.5,.8],meds:[["Lifestyle programme",.3]]},
 {condition:"Prediabetes",weight:6,age:[55,11],female:.5,bmi:[29,4],hba1c:[5.9,.25],crp:[2.5,.8],meds:[["Metformin",.2],["Lifestyle programme",.5]]},
 {condition:"Obesity",weight:8,age:[48,13],female:.55,bmi:[36,5],hba1c:[5.6,.4],crp:[3.5,.9],meds:[["GLP-1 receptor agonist",.25],["Lifestyle programme",.5],["Statin",.2]]},
 {condition:"MASH",weight:3,age:[54,11],female:.45,bmi:[33,5],hba1c:[6.2,.8],crp:[3,.9],meds:[["Vitamin E",.2],["Statin",.4],["Lifestyle programme",.4]]},
 {condition:"Crohn's disease",weight:3,age:[38,14],female:.5,bmi:[24,4],hba1c:[5.4,.35],crp:[6,1],meds:[["Biologic",.3],["TNF inhibitor",.25],["Corticosteroid",.2],["Nutritional support",.15]]},
 {condition:"Ulcerative colitis",weight:3,age:[42,14],female:.45,bmi:[25,4],hba1c:[5.4,.35],crp:[4.5,1],meds:[["Mesalamine",.6],["Biologic",.2],["Corticosteroid",.15]]},
 {condition:"IBS",weight:5,age:[41,14],female:.65,bmi:[25,4.5],hba1c:[5.4,.35],crp:[1.5,.7],meds:[["Low-FODMAP diet",.4],["Probiotic",.3]]},
 {condition:"Coeliac disease",weight:2,age:[40,15],female:.65,bmi:[24,4],hba1c:[5.3,.35],crp:[1.5,.7],meds:[["Nutritional support",.3]]},
 {condition:"Rheumatoid arthritis",weight:5,age:[56,12],female:.72,bmi:[27,5],hba1c:[5.7,.5],crp:[7,1],meds:[["Methotrexate",.6],["Biologic",.25],["TNF inhibitor",.2],["IL-6 inhibitor",.1],["Corticosteroid",.3]]},
 {condition:"Systemic lupus erythematosus",weight:2,age:[40,13],female:.88,bmi:[26,5],hba1c:[5.5,.4],crp:[4,1],meds:[["Corticosteroid",.5],["Biologic",.15]]},
 {condition:"Multiple sclerosis",weight:3,age:[43,11],female:.72,bmi:[26,5],hba1c:[5.4,.35],crp:[1.5,.7],meds:[["Disease-modifying therapy",.6],["Rehabilitation programme",.25]]},
 {condition:"Alzheimer's disease",weight:3,age:[77,7],female:.6,bmi:[25,4],hba1c:[5.7,.45],crp:[2.5,.8],meds:[["Cholinesterase inhibitor",.6],["Statin",.3]]},
 {condition:"Parkinson's disease",weight:3,age:[71,8],female:.4,bmi:[25,4],hba1c:[5.6,.4],crp:[2,.8],meds:[["Levodopa",.75],["Rehabilitation programme",.2]]},
 {condition:"Major depressive disorder",weight:7,age:[42,14],female:.65,bmi:[27,5],hba1c:[5.5,.4],crp:[2.5,.9],meds:[["SSRI",.5],["SNRI",.15],["Psychological therapy",.35],["Cognitive therapy",.2]]},
 {condition:"Anxiety disorders",weight:6,age:[37,13],female:.65,bmi:[26,5],hba1c:[5.4,.35],crp:[2,.8],meds:[["SSRI",.35],["Psychological therapy",.35],["Cognitive therapy",.25],["Sleep intervention",.15]]},
 {condition:"Migraine",weight:5,age:[38,12],female:.75,bmi:[25,4.5],hba1c:[5.4,.35],crp:[1.8,.8],meds:[["CGRP inhibitor",.15],["Sleep intervention",.15]]},
 {condition:"Asthma",weight:6,age:[36,17],female:.55,bmi:[27,5],hba1c:[5.5,.4],crp:[2.5,.9],meds:[["Inhaled corticosteroid",.6],["Biologic",.08]]},
 {condition:"Atopic dermatitis",weight:4,age:[30,16],female:.55,bmi:[25,5],hba1c:[5.4,.35],crp:[2.2,.9],meds:[["Topical corticosteroid",.6],["Antihistamine",.3],["Biologic",.08]]},
 {condition:"Long COVID",weight:3,age:[46,13],female:.62,bmi:[27,5],hba1c:[5.5,.4],crp:[2.8,.9],meds:[["Pacing programme",.3],["Rehabilitation programme",.2]]},
];
/** Deliberate missingness, as fractions of profiles. Exercises the "not enough information" path. */
export const MISSING={hba1c:.04,crp:.03,bmi:.02,age:.01,sex:.005};

function mulberry32(seed:number){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
export function generateCohort(spec:GeneratorSpec=DEFAULT_SPEC):PlanePatient[]{
 if(!Number.isInteger(spec.seed)||spec.seed<0||spec.seed>0xffffffff||!Number.isInteger(spec.n)||spec.n<1||spec.n>MAX_GENERATED)throw Error("Invalid generator spec");
 const rnd=mulberry32(spec.seed),normal=()=>{const u=Math.max(rnd(),1e-12),v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
 const total=PROFILES.reduce((s,p)=>s+p.weight,0),r1=(x:number)=>Math.round(x*10)/10,r2=(x:number)=>Math.round(x*100)/100;
 const pick=()=>{let x=rnd()*total;for(const p of PROFILES){x-=p.weight;if(x<0)return p}return PROFILES[PROFILES.length-1]!};
 const out:PlanePatient[]=[];
 for(let i=0;i<spec.n;i++){
  const p=pick(),age=Math.min(95,Math.max(18,Math.round(p.age[0]+normal()*p.age[1]))),female=rnd()<p.female;
  const bmi=Math.min(60,Math.max(15,r1(p.bmi[0]+normal()*p.bmi[1])));
  const hb0=Math.min(14,Math.max(4,p.hba1c[0]+normal()*p.hba1c[1])),hbTrend=(rnd()-.5)*.3;
  const crp0=Math.exp(Math.log(p.crp[0])+normal()*p.crp[1]*.6),crpTrend=(rnd()-.5)*.3;
  const labs:PlanePatient["labs"]=[];
  const noHb=rnd()<MISSING.hba1c,noCrp=rnd()<MISSING.crp;
  for(let v=1;v<=5;v++){
   if(!noHb)labs.push({test:"HbA1c",visit:v,value:r2(Math.min(14,Math.max(4,hb0+hbTrend*(v-1)+normal()*.15)))});
   if(!noCrp)labs.push({test:"hs-CRP",visit:v,value:r2(Math.min(120,Math.max(.1,crp0*(1+crpTrend*(v-1))*Math.exp(normal()*.15))))});
  }
  const meds=p.meds.filter(([,pr])=>rnd()<pr).map(([m])=>m);
  out.push({id:"SYN-G-"+String(i+1).padStart(6,"0"),condition:p.condition,age:rnd()<MISSING.age?null:age,sex:rnd()<MISSING.sex?null:female?"female":"male",bmi:rnd()<MISSING.bmi?null:bmi,labs,medications:meds});
 }
 return out;
}
export const GENERATOR_NOTICE="Generated by a seeded generator with illustrative parameters. Not calibrated to any real population, not evidence about any disease or person.";
