/** The full benchmark is a persistent worker plan, not a long Vercel HTTP invocation. */
import {authorizeImmunoLockedRun} from "../evidence/immunoBenchmarkAcceptance";
import {IMMUNO_CONFIGURATIONS} from "../evidence/immunoBenchmarkScoring";
import {opsHash,validateOpsPlan,type OpsPlan,type OpsStep} from "./pilotOperationsStore";
export async function prepareImmunoWorkerPlan(input:Parameters<typeof authorizeImmunoLockedRun>[0],options:{
 investigationId:string;artifactSha:string;configurationHash:string;planRef:string;clearanceBatchRef:string;
 configurationCap:{inputTokens:number;outputTokens:number;costMicros:number};
},authority:{authorize:Parameters<typeof authorizeImmunoLockedRun>[1];resolveModels:(configuration:(typeof IMMUNO_CONFIGURATIONS)[number],configurationHash:string)=>Promise<readonly string[]>;authorizeCaps:(binding:Readonly<{budgetPolicyHash:string;capsHash:string;executionBindingsHash:string}>)=>Promise<boolean>}){
 options=structuredClone(options);const locked=await authorizeImmunoLockedRun(input,authority.authorize),caps=options.configurationCap;
 const models=new Map<string,readonly string[]>();for(const configuration of IMMUNO_CONFIGURATIONS){const refs=[...await authority.resolveModels(configuration,locked.lock.configurations[configuration].configurationHash)];if(refs.length!==(configuration==="deterministic_current_baseline"?0:configuration==="single_verifier"?1:2)||new Set(refs).size!==refs.length)throw Error("Approved independent verifier model bindings required");models.set(configuration,refs)}
 if(await authority.authorizeCaps({budgetPolicyHash:locked.lock.budgetPolicyHash,capsHash:opsHash(caps),executionBindingsHash:opsHash({models:Object.fromEntries(models),configurations:locked.lock.configurations})})!==true)throw Error("Locked per-investigation budget policy required");
 const steps:OpsStep[]=[];
 for(const c of locked.cases.filter(c=>c.partition==="held_out"))for(const configuration of IMMUNO_CONFIGURATIONS){
  const base=opsHash({caseId:c.caseId,configuration,freeze:locked.freeze.freezeHash}),executionCount=configuration==="dual_verifier"?2:1;
  for(let n=0;n<executionCount;n++){const model=configuration!=="deterministic_current_baseline";steps.push({id:`execute-${base}-${n+1}`,kind:model?"model":"tool",inputRef:`task:${base}:${n+1}`,toolRef:model?null:"deterministic-current-baseline",modelRef:model?models.get(configuration)![n]!:null,sourceReleaseRef:locked.lock.retrievalPolicyHash,clearanceRef:options.clearanceBatchRef,maxInputTokens:model?Math.floor(caps.inputTokens/executionCount)+(n===executionCount-1?caps.inputTokens%executionCount:0):0,maxOutputTokens:model?Math.floor(caps.outputTokens/executionCount)+(n===executionCount-1?caps.outputTokens%executionCount:0):0,maxCostMicros:model?Math.floor(caps.costMicros/executionCount)+(n===executionCount-1?caps.costMicros%executionCount:0):0,maxAttempts:2})}
  steps.push({id:"assess-"+base,kind:"verification",inputRef:"assessment-task:"+base,toolRef:"independent-output-assessment",modelRef:null,sourceReleaseRef:locked.lock.retrievalPolicyHash,clearanceRef:options.clearanceBatchRef,maxInputTokens:0,maxOutputTokens:0,maxCostMicros:0,maxAttempts:1});
 }
 steps.push({id:"aggregate-report",kind:"report",inputRef:"freeze:"+locked.freeze.freezeHash,toolRef:"immuno-redacted-report",modelRef:null,sourceReleaseRef:locked.lock.retrievalPolicyHash,clearanceRef:options.clearanceBatchRef,maxInputTokens:0,maxOutputTokens:0,maxCostMicros:0,maxAttempts:1});
 const plan:OpsPlan={investigationId:options.investigationId,artifactSha:options.artifactSha,configurationHash:options.configurationHash,planRef:options.planRef,freezeHash:locked.freeze.freezeHash,maxTokens:steps.reduce((n,s)=>n+s.maxInputTokens+s.maxOutputTokens,0),maxCostMicros:steps.reduce((n,s)=>n+s.maxCostMicros,0),steps};
 validateOpsPlan(plan);return plan;
}
