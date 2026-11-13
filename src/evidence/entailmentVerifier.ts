/**
 * P2: adapts independent entailment challenges to the audit runner's `verify` dependency.
 * Each unit's claim is challenged against its own passage by one or more injected verifiers (distinct identities).
 * A model's answer is never a source of truth: a "supports" verdict without a quote found in the passage is
 * downgraded to insufficient by runModelEntailment. Status is "checked_with_limitations" only when every unit was
 * challenged by every verifier and all agreed it is supported; anything else is "needs_evidence".
 */
import {createHash} from "node:crypto";
import {runModelEntailment,type EntailmentModelRunner} from "../researchV2/modelEntailment";
import type {IndependentChallenge} from "../researchV2/scientificEntailment";
import type {EvidenceClaim} from "../researchV2/passageVerification";
import type {ContextConflictAudit,ContextAuditTarget} from "./contextConflictAudit";
import type {ComparableEvidenceUnit,StructuredEvidenceComparison} from "./structuredEvidenceComparison";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";

export type EntailmentVerifierConfig={verifierId:string;modelId:string;runner:EntailmentModelRunner};
const fieldText=(unit:ComparableEvidenceUnit,field:string):string|null=>{
 const value=(unit.detailedContext?.fields as Record<string,{originalText:string|null}>|undefined)?.[field];
 return value?.originalText??null;
};
export function claimForUnit(unit:ComparableEvidenceUnit):EvidenceClaim{
 return {
  id:unit.id,sourceId:unit.evidenceSourceIds[0]!,exactQuote:(unit.detailedContext?.passageText??"").slice(0,200)||"n/a",
  subjectId:unit.subject.value,predicate:unit.findingPolarity==="opposing"?"not_"+unit.predicate:unit.predicate,objectId:unit.object.value,
  context:{diseaseIds:[],species:fieldText(unit,"species"),tissueId:fieldText(unit,"tissueCompartment"),cellId:fieldText(unit,"cellType"),method:fieldText(unit,"assay")},
 };
}
const isUnresolved=(unit:ComparableEvidenceUnit)=>unit.subject.system==="HSI-UNRESOLVED"||unit.object.system==="HSI-UNRESOLVED";

export function createEntailmentVerifier(deps:{verifiers:readonly EntailmentVerifierConfig[];onChallenges?:(challenges:readonly IndependentChallenge[])=>void}){
 const ids=deps?.verifiers?.map(v=>v.verifierId)??[];
 if(!ids.length||ids.length>5||new Set(ids).size!==ids.length||deps.verifiers.some(v=>!v.verifierId?.trim()||!v.modelId?.trim()||typeof v.runner!=="function"))throw Error("Distinct, configured verifiers required");
 return async function verify(material:Readonly<{target:ContextAuditTarget;comparisons:StructuredEvidenceComparison[];gaps:string[]}>,signal?:AbortSignal):Promise<ContextConflictAudit["verifier"]>{
  const units=new Map<string,ComparableEvidenceUnit>();
  for(const c of material.comparisons)for(const u of [c.left,c.right])units.set(u.id,u);
  if(!units.size)return {status:"not_executed",receiptId:null};
  const challenges:IndependentChallenge[]=[];let allSupported=true;
  for(const unit of units.values()){
   if(signal?.aborted)throw Error("Verification cancelled");
   if(isUnresolved(unit)){allSupported=false;continue}
   const passage=unit.detailedContext!.passageText,claim=claimForUnit(unit);
   for(const v of deps.verifiers){
    const challenge=await runModelEntailment({claim,passage,sourceId:claim.sourceId,sourceVersion:unit.detailedContext!.sourceVersion},v.verifierId,v.modelId,v.runner);
    challenges.push(challenge);if(challenge.verdict!=="supports")allSupported=false;
   }
  }
  deps.onChallenges?.(structuredClone(challenges));
  if(!allSupported||!challenges.length)return {status:"needs_evidence",receiptId:null};
  const receiptId="entailment-"+createHash("sha256").update(canonicalEvidenceJson(challenges)).digest("hex").slice(0,32);
  return {status:"checked_with_limitations",receiptId};
 };
}
