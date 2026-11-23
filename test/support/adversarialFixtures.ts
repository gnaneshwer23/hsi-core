/** Builders for planted-failure fixtures. All text is synthetic. Used by the adversarial agent tests and the probe script. */
import type {RunnerFixture} from "../../src/investigationRunner";

export type Ctx={species:string;system:string;tissue:string;cell:string;state:string;phenotype:string;stage:string;intervention:string;dose:string;timing:string;assay:string;readout:string;n:string;cohort:string;controls:string;uncertainty:string;estimand:string};
export const BASE:Ctx={species:"human",system:"primary cultures",tissue:"synovial tissue",cell:"fibroblasts",state:"activated state",phenotype:"fibrotic phenotype",stage:"early stage",intervention:"antagonist treatment",dose:"10 nM",timing:"after 7 days",assay:"flow cytometry",readout:"surface marker intensity",n:"n=40",cohort:"cohort A",controls:"vehicle controls",uncertainty:"95% CI reported",estimand:"mean difference"};

export const passageFor=(c:Ctx,negated:boolean,subj="Cytokine Beta",obj="Cell Type Gamma")=>
 `In ${c.species} ${c.system} from ${c.tissue}, ${c.cell} in an ${c.state} with ${c.phenotype} at ${c.stage} after ${c.intervention} at ${c.dose} ${c.timing}, ${subj} signalling was ${negated?"not ":""}associated with activation of ${obj}, measured by ${c.assay} as ${c.readout} (${c.n}, ${c.cohort}, ${c.controls}, ${c.uncertainty}, ${c.estimand}).`;

const ent=(v:string,l:string)=>({system:"FIXTURE",value:v,label:l});
export const FIELD_QUOTES=(c:Ctx):Record<string,string>=>({species:c.species,experimentalSystem:c.system,tissueCompartment:c.tissue,cellType:c.cell,cellState:c.state,phenotype:c.phenotype,diseaseStage:c.stage,intervention:c.intervention,dose:c.dose,timing:c.timing,assay:c.assay,readout:c.readout,sampleSize:c.n,cohort:c.cohort,controls:c.controls,uncertainty:c.uncertainty,estimand:c.estimand});

export type Planted={
 id:string;ctx?:Partial<Ctx>;negated?:boolean;
 /** Passage text override (defaults to the template). */ text?:string;
 /** Claim polarity the (recorded) model asserts. */ polarity?:"supporting"|"opposing"|"uncertain";
 claimQuote?:string;predicate?:string;contextQuotes?:Record<string,string|undefined>;label?:string;
 verdicts?:{a:string;b:string};evidenceSpan?:string|null;
};
export function buildFixture(id:string,support:Planted[],oppose:Planted[]):RunnerFixture{
 const extraction:Record<string,unknown>={},entA:Record<string,unknown>={},entB:Record<string,unknown>={};
 const mk=(p:Planted)=>{
  const c={...BASE,...p.ctx},text=p.text??passageFor(c,p.negated??false);
  const neg=p.negated??false;
  const defaultQuote=`Cytokine Beta signalling was ${neg?"not ":""}associated with activation of Cell Type Gamma`;
  const quotes={...FIELD_QUOTES(c),...(p.contextQuotes??{})};
  const context:Record<string,unknown>={};
  for(const [k,v] of Object.entries(quotes))if(v!==undefined)context[k]={quote:v};
  extraction[p.id]={claim:{subject:ent("cytokine-beta-signalling",p.label??"Cytokine Beta signalling"),predicate:p.predicate??"associated_with",object:ent("cell-type-gamma-activation","Cell Type Gamma activation"),polarity:p.polarity??(neg?"opposing":"supporting"),quote:p.claimQuote??defaultQuote},context,note:null};
  const span=p.evidenceSpan===undefined?defaultQuote:p.evidenceSpan;
  entA[p.id]={verdict:p.verdicts?.a??"supports",evidenceSpan:span,reason:"Recorded verdict."};
  entB[p.id]={verdict:p.verdicts?.b??"supports",evidenceSpan:span,reason:"Recorded verdict."};
  return {id:p.id,title:"Planted case "+p.id,locator:"Synthetic ¶1",text};
 };
 return {schemaVersion:"hsi-runner-fixture-1",id,scope:"ssc",question:"What evidence connects Cytokine Beta signalling and Cell Type Gamma activation?",
  notice:"Synthetic planted-failure fixture for engineering verification only. Not evidence.",
  searches:{support:support.map(mk),oppose:oppose.map(mk)},recorded:{extraction,entailment:{"verifier-a":entA,"verifier-b":entB}}};
}
