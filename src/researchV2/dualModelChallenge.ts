/** Executes two separately injected models, then applies existing fail-closed adjudication. */
import type {EvidenceClaim,PassageResult} from "./passageVerification";
import type {EntailmentModelRunner} from "./modelEntailment";
import {runModelEntailment} from "./modelEntailment";
import {adjudicateClaim,type Adjudication,type IndependentChallenge} from "./scientificEntailment";
export interface ModelVerifier {verifierId:string;modelId:string;runner:EntailmentModelRunner;}
export interface DualModelResult {challenges:IndependentChallenge[];adjudication:Adjudication;modelIndependenceVerified:false;scientificAccuracyCalibrated:false;}
export async function executeDualModelChallenge(claim:EvidenceClaim,passage:string,receipt:PassageResult,first:ModelVerifier,second:ModelVerifier):Promise<DualModelResult>{
 if(!first||!second||first.verifierId===second.verifierId||first.modelId===second.modelId||first.runner===second.runner||receipt.claimId!==claim.id||receipt.sourceId!==claim.sourceId)throw Error("Distinct verifier configurations required");
 const input={claim,passage,sourceId:claim.sourceId};
 const settled=await Promise.allSettled([runModelEntailment(input,first.verifierId,first.modelId,first.runner),runModelEntailment(input,second.verifierId,second.modelId,second.runner)]);
 const challenges=settled.map((r,i):IndependentChallenge=>r.status==="fulfilled"?r.value:{claimId:claim.id,verifierId:i===0?first.verifierId:second.verifierId,modelOrMethod:i===0?first.modelId:second.modelId,verdict:"not_assessed",evidenceSpan:null,reason:"Verifier execution failed",independentEvidenceSourceIds:[]});
 return {challenges,adjudication:adjudicateClaim(receipt,challenges),modelIndependenceVerified:false,scientificAccuracyCalibrated:false};
}
