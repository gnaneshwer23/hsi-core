/**
 * HSI-BENCH-IMMUNO v1.1 proposal: two additional case profiles and their objective scorers.
 *   translation_pair             a preclinical claim paired with what happened in humans (including failures)
 *   pooled_claim_decomposition   a pooled claim that must be split by species, tissue, subset and design
 * These are structure and scoring only. No case content, gold label or expert identity lives here; real cases are
 * authored and adjudicated by scientists in the access-controlled vault described in P1_B_IMMUNO_BENCHMARK_ACCEPTANCE.md.
 */
export type HumanOutcome="supported"|"failed"|"mixed"|"harmful"|"not_tested";
export type TranslationLabel="translated"|"failed_translation"|"partial_translation"|"harmful_translation"|"untested";
export type Direction="supports"|"opposes"|"null"|"mixed";

export type TranslationPairProfile={
 profile:"translation_pair";slotId:string;
 preclinical:{claim:string;species:string;modelSystem:string;tissue:string;intervention:string;readout:string;evidenceIds:string[]};
 human:{claim:string;population:string;design:"randomised_trial"|"observational"|"mechanistic_human"|"none";outcome:HumanOutcome;evidenceIds:string[]};
 /** Contexts in which the preclinical claim is expected to hold, and where it is not. Required for any non-"supported" outcome. */
 contextBoundary:string[];
 translationLabel:TranslationLabel;
};
export const deriveTranslationLabel=(o:HumanOutcome):TranslationLabel=>({supported:"translated",failed:"failed_translation",mixed:"partial_translation",harmful:"harmful_translation",not_tested:"untested"} as const)[o];

const txt=(s:unknown,max=2000):s is string=>typeof s==="string"&&s.trim().length>0&&s.length<=max;
const ids=(a:unknown):a is string[]=>Array.isArray(a)&&a.length>0&&a.length<=64&&a.every(x=>txt(x,200))&&new Set(a).size===a.length;
const SLOT=/^IMMUNO-[a-z_]+-\d{2}$/;

export function validateTranslationPair(p:TranslationPairProfile):void{
 if(p.profile!=="translation_pair"||!SLOT.test(p.slotId))throw Error("Invalid translation-pair slot");
 const pre=p.preclinical;
 for(const k of ["claim","species","modelSystem","tissue","intervention","readout"] as const)if(!txt(pre[k]))throw Error(`Preclinical ${k} is required`);
 if(!ids(pre.evidenceIds))throw Error("Preclinical evidence ids are required and must be unique");
 if(!txt(p.human.claim)||!txt(p.human.population))throw Error("Human claim and population are required");
 if(p.human.outcome==="not_tested"){
  if(p.human.design!=="none"||p.human.evidenceIds.length)throw Error("A not-tested human outcome has no design or evidence");
 }else{
  if(p.human.design==="none")throw Error("A tested human outcome needs a study design");
  if(!ids(p.human.evidenceIds))throw Error("Human evidence ids are required and must be unique");
 }
 if(p.human.outcome!=="supported"&&p.human.outcome!=="not_tested"&&!(Array.isArray(p.contextBoundary)&&p.contextBoundary.length>0&&p.contextBoundary.every(x=>txt(x,500))))throw Error("A failed, mixed or harmful translation must state its context boundary");
 if(p.translationLabel!==deriveTranslationLabel(p.human.outcome))throw Error("Translation label does not match the human outcome");
}

export type StratumKey={species:string;tissue:string;populationSubset:string|null;diseaseStage:string|null;design:string};
export type Stratum={key:StratumKey;direction:Direction;evidenceIds:string[]};
export type PooledClaimProfile={profile:"pooled_claim_decomposition";slotId:string;pooledClaim:string;strata:Stratum[]};
export const strataKey=(k:StratumKey)=>JSON.stringify([k.species,k.tissue,k.populationSubset,k.diseaseStage,k.design].map(v=>v===null?null:v.trim().toLowerCase()));

export function validatePooledClaim(p:PooledClaimProfile):void{
 if(p.profile!=="pooled_claim_decomposition"||!SLOT.test(p.slotId)||!txt(p.pooledClaim))throw Error("Invalid pooled-claim profile");
 if(!Array.isArray(p.strata)||p.strata.length<2||p.strata.length>24)throw Error("A pooled claim needs 2 to 24 strata; a single stratum is not a pooled claim");
 const seen=new Set<string>(),allEvidence=new Set<string>();
 for(const s of p.strata){
  if(!txt(s.key.species,120)||!txt(s.key.tissue,120)||!txt(s.key.design,120))throw Error("Each stratum needs species, tissue and design");
  const k=strataKey(s.key);if(seen.has(k))throw Error("Duplicate stratum");seen.add(k);
  if(!["supports","opposes","null","mixed"].includes(s.direction))throw Error("Unknown stratum direction");
  if(!ids(s.evidenceIds))throw Error("Each stratum needs unique evidence ids");
  for(const e of s.evidenceIds){if(allEvidence.has(e))throw Error("A study may appear in only one stratum");allEvidence.add(e)}
 }
}

export type DecompositionScore={goldStrata:number;predictedStrata:number;matched:number;stratumRecall:number|null;stratumPrecision:number|null;countExact:number;directionCorrect:number;flattened:boolean;unmatchedGold:string[];unmatchedPredicted:string[]};
/** Objective scoring of a system's breakdown against the adjudicated one. Study counts, not opinions, are compared. */
export function scoreDecomposition(gold:PooledClaimProfile,predicted:{key:StratumKey;direction:Direction;studyCount:number}[]):DecompositionScore{
 validatePooledClaim(gold);
 const g=new Map(gold.strata.map(s=>[strataKey(s.key),s])),pm=new Map<string,{direction:Direction;studyCount:number}>();
 for(const p of predicted){const k=strataKey(p.key);if(pm.has(k))throw Error("Predicted breakdown repeats a stratum");pm.set(k,p)}
 let matched=0,countExact=0,directionCorrect=0;
 for(const [k,s] of g){const p=pm.get(k);if(!p)continue;matched++;if(p.studyCount===s.evidenceIds.length)countExact++;if(p.direction===s.direction)directionCorrect++}
 return {goldStrata:g.size,predictedStrata:pm.size,matched,stratumRecall:g.size?matched/g.size:null,stratumPrecision:pm.size?matched/pm.size:null,countExact,directionCorrect,
  flattened:pm.size<=1&&g.size>1,unmatchedGold:[...g.keys()].filter(k=>!pm.has(k)),unmatchedPredicted:[...pm.keys()].filter(k=>!g.has(k))};
}
