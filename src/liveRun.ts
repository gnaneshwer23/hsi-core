/**
 * Composed live run: SCOUT (live search) -> AEGIS (source clearance) -> LANTERN (span-grounded extraction) ->
 * PARALLAX (context comparison) -> VERITAS (independent entailment) in one run. It is a composer only: every external
 * (fetcher, clearance decider, provider operations, audit directory) is injected, so this module holds no credential,
 * reaches no network itself and decides nothing about rights. It refuses unless BOTH readiness gates report ready,
 * the kill switch is clear and the daily run cap allows it, and a run-wide model call budget is spent before any call.
 * Output is never approved and never graph-promotable.
 */
import {assessLiveReadiness,renderReadiness,LIVE_HARD_LIMITS,type LiveRunConfig} from "./liveReadiness";
import {assessSourceIntegrityReadiness} from "./sourceIntegrityReadiness";
import {createLiveSearch,createLiveAuthorizePassage,type ClearanceDecider} from "./liveSearch";
import {createProviderBackedRunners,type ProviderOperations,type VerifierDeployment} from "./liveModels";
import {createContextConflictAuditRunner,renderContextConflictAudit,type ContextAuditTarget,type ContextConflictAudit} from "./evidence/contextConflictAudit";
import {createModelEvidenceExtractor,type ExtractionRejection} from "./evidence/modelEvidenceExtraction";
import {createEntailmentVerifier} from "./evidence/entailmentVerifier";
import {createAuditFileStore} from "./evidence/auditFileStore";
import type {IndependentChallenge} from "./researchV2/scientificEntailment";

export const LIVE_NOTICE="LIVE RUN: retrieved open-access passages and model outputs under an approved clearance policy. Not an approved scientific result, not consensus and not promotable. Human scientific review is required.";
export type LiveRunResult={mode:"live";notice:string;audit:ContextConflictAudit;entailments:IndependentChallenge[];rejections:ExtractionRejection[];modelCalls:number;brief:string};
export type LiveRunRefusal={mode:"live";refused:true;reasons:string[];report:string};
export type LiveRunDeps={
 config:unknown;integrityConfig:unknown;env:Record<string,string|undefined>;
 target:ContextAuditTarget;auditDirectory:string;
 fetcher:Parameters<typeof createLiveSearch>[0]["fetcher"];clearance:ClearanceDecider;ops:ProviderOperations;
 /** Runs already started today (from the operation store); the cap is enforced here, counted by the caller. */
 runsToday:()=>number;
 now?:()=>string;sleep?:(ms:number)=>Promise<void>;signal?:AbortSignal;
};

export function checkLiveRunGate(deps:Pick<LiveRunDeps,"config"|"integrityConfig"|"env"|"runsToday">):LiveRunRefusal|null{
 const reasons:string[]=[],reports:string[]=[];
 const live=assessLiveReadiness(deps.config,deps.env),integrity=assessSourceIntegrityReadiness(deps.integrityConfig,deps.env);
 if(!live.ready){reasons.push("live readiness: "+live.blocking.map(i=>i.id).join(", "));reports.push(renderReadiness(live))}
 if(!integrity.ready){reasons.push("source integrity readiness: "+integrity.blocking.map(i=>i.id).join(", "));reports.push(renderReadiness(integrity))}
 const limits=(deps.config as LiveRunConfig|undefined)?.limits;
 if(limits&&typeof limits.killSwitchEnv==="string"&&deps.env[limits.killSwitchEnv]?.trim())reasons.push("kill switch engaged");
 if(limits&&deps.runsToday()>=Math.min(limits.maxRunsPerDay,LIVE_HARD_LIMITS.maxRunsPerDay))reasons.push("daily run cap reached");
 return reasons.length?{mode:"live",refused:true,reasons,report:reports.join("\n\n")}:null;
}

export async function runLiveInvestigation(deps:LiveRunDeps):Promise<LiveRunResult|LiveRunRefusal>{
 const refusal=checkLiveRunGate(deps);if(refusal)return refusal;
 return composeLiveRun(deps);
}

/** Composition only, with NO readiness gate. Exported so tests can exercise the pipeline with mocks; production callers use runLiveInvestigation. */
export async function composeLiveRun(deps:LiveRunDeps):Promise<LiveRunResult>{
 const config=deps.config as LiveRunConfig,limits=config.limits;
 const verifierDeployments:VerifierDeployment[]=config.verifiers.map((v,i)=>({verifierId:"verifier-"+(i+1),deploymentId:v.deploymentId}));
 const runners=createProviderBackedRunners({ops:deps.ops,extractorDeploymentId:config.extractor.deploymentId,verifierDeployments,maxModelCalls:Math.min(limits.maxModelCallsPerRun,LIVE_HARD_LIMITS.maxModelCallsPerRun),signal:deps.signal});
 const rejections:ExtractionRejection[]=[],entailments:IndependentChallenge[]=[];
 const killed=()=>!!deps.env[limits.killSwitchEnv]?.trim();
 const search=createLiveSearch({fetcher:deps.fetcher,clearance:deps.clearance,maxArticlesPerIntent:limits.maxArticlesPerIntent,maxHitsPerIntent:limits.maxHitsPerIntent,now:deps.now,sleep:deps.sleep});
 const store=createAuditFileStore(deps.auditDirectory);
 const extract=createModelEvidenceExtractor({runner:async r=>{if(killed())throw Error("Kill switch engaged");return runners.extraction(r)},onRejection:r=>rejections.push(r)});
 const verify=createEntailmentVerifier({verifiers:verifierDeployments.map(v=>({verifierId:v.verifierId,modelId:v.deploymentId,runner:runners.entailment(v.verifierId)})),onChallenges:c=>entailments.push(...c)});
 const runner=createContextConflictAuditRunner({enabled:true,now:deps.now,search:async(t,intent,signal)=>{if(killed())throw Error("Kill switch engaged");return search(t,intent,signal)},authorizePassage:createLiveAuthorizePassage(deps.clearance),extract,verify,append:(artifact,previous)=>store.append(artifact,previous)});
 const previous=await store.latest(deps.target.investigationId);
 const audit=await runner.run(deps.target,previous??undefined);
 const brief=["# "+LIVE_NOTICE,"",renderContextConflictAudit(audit,"markdown"),"","## Independent entailment challenges",
  ...(entailments.length?entailments.map(c=>`- ${c.claimId} / ${c.verifierId}: ${c.verdict}`):["- none recorded"]),"","## Extraction rejections (failure ledger)",
  ...(rejections.length?rejections.map(r=>`- ${r.hitId} / ${r.field}: ${r.reason}`):["- none"]),"","Human scientific review is required. Not approved, not promotable."].join("\n");
 return {mode:"live",notice:LIVE_NOTICE,audit,entailments,rejections,modelCalls:runners.calls(),brief};
}
