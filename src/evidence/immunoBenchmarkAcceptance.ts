/** Preregistered engineering gate. A passing computation still needs independent scientific acceptance. */
import {IMMUNO_DIMENSIONS,buildImmunoProtocol,benchmarkDigest,assertImmunoSplits,type ImmunoCase, type prepareImmunoFreeze} from "./immunoBenchmark";
import {IMMUNO_CONFIGURATIONS,type ImmunoConfiguration,type ImmunoObservation,type ImmunoExecutionFailure,reportImmunoEvaluation} from "./immunoBenchmarkScoring";
export type ImmunoFreeze=Awaited<ReturnType<typeof prepareImmunoFreeze>>;
export const REQUIRED_QUALITY_METRICS=[...IMMUNO_DIMENSIONS.map(d=>"score."+d),"supportPrecision","falsePositiveRateAmongGoldUnsupported","retrievalRecall","contextFieldAccuracy","missingnessPrecision","missingnessRecall","appropriateAnswerOrAbstain","conflictMacroF1"];
export type ImmunoThresholdPolicy={version:string;releaseConfigurations:("single_verifier"|"dual_verifier")[];disputeRule:"resolve_or_replace_before_freeze";scopes:{scope:string;metrics:{metric:string;minimum:number|null;maximum:number|null;minimumCases:number;basis:"point"|"lower95"|"upper95";notApplicableReason:string|null}[]}[]};
export function validateImmunoThresholds(policy:ImmunoThresholdPolicy,cases:readonly ImmunoCase[]){
 const scopes=["overall",...new Set(cases.flatMap(c=>["layer:"+c.layer,"domain:"+c.domain,"risk:"+c.risk]))];
 if(!Array.isArray(policy.releaseConfigurations)||!policy.releaseConfigurations.length||new Set(policy.releaseConfigurations).size!==policy.releaseConfigurations.length||policy.releaseConfigurations.some(c=>!["single_verifier","dual_verifier"].includes(c))||!policy.version?.trim()||policy.disputeRule!=="resolve_or_replace_before_freeze"||policy.scopes.length!==scopes.length||new Set(policy.scopes.map(s=>s.scope)).size!==scopes.length||policy.scopes.some(s=>!scopes.includes(s.scope)))throw Error("Every risk/layer/domain requires a preregistered threshold or justified applicability rule");
 for(const s of policy.scopes){if(s.metrics.length!==REQUIRED_QUALITY_METRICS.length||new Set(s.metrics.map(m=>m.metric)).size!==REQUIRED_QUALITY_METRICS.length)throw Error("Eight quality dimensions and required error metrics must be separate");for(const m of s.metrics){
  if(!REQUIRED_QUALITY_METRICS.includes(m.metric)||!["point","lower95","upper95"].includes(m.basis)||!Number.isSafeInteger(m.minimumCases)||m.minimumCases<1||m.minimum!==null&&!Number.isFinite(m.minimum)||m.maximum!==null&&!Number.isFinite(m.maximum)||m.minimum!==null&&m.maximum!==null&&m.minimum>m.maximum)throw Error("Invalid numeric quality floor/error budget");
  const max=m.metric.startsWith("score.")?5:1;if([m.minimum,m.maximum].some(v=>v!==null&&(v<0||v>max)))throw Error("Quality threshold outside metric range");
  if(m.notApplicableReason!==null){if(!m.notApplicableReason.trim()||m.minimum!==null||m.maximum!==null)throw Error("Non-applicability requires a reason and no invented score");}
  else if(m.minimum===null&&m.maximum===null)throw Error("Unapproved empty threshold");
  if(s.scope==="overall"&&m.metric.startsWith("score.")&&m.notApplicableReason!==null)throw Error("All eight overall dimensions must be measured");
 }}
}
export type ImmunoRunLock={freezeHash:string;thresholdPolicyHash:string;retrievalPolicyHash:string;budgetPolicyHash:string;
 approvalReceiptHash:string;lockedAt:string;executionNotBefore:string;
 configurations:Record<ImmunoConfiguration,{deploymentRef:string;configurationHash:string}>};
/** Pure preflight before any provider callback. All approvals are independently verified, never caller flags. */
export async function authorizeImmunoLockedRun(input:{freeze:ImmunoFreeze;cases:readonly ImmunoCase[];policy:ImmunoThresholdPolicy;lock:ImmunoRunLock},authorize:(binding:Readonly<{freeze:ImmunoFreeze;lock:ImmunoRunLock}>)=>Promise<boolean>){
 const value=structuredClone(input),{freeze,cases,policy,lock}=value;assertImmunoSplits(cases);validateImmunoThresholds(policy,cases.filter(c=>c.partition==="held_out"));
 const {freezeHash,...body}=freeze;
 if(freezeHash!==benchmarkDigest(body)||freeze.finalCaseCount!==120||freeze.protocolHash!==buildImmunoProtocol().protocolHash||lock.freezeHash!==freezeHash||lock.thresholdPolicyHash!==benchmarkDigest(policy)||freeze.thresholdPolicyHash!==lock.thresholdPolicyHash||cases.length!==freeze.caseCommitments.length||cases.some(c=>!freeze.caseCommitments.some(row=>row.caseId===c.caseId&&row.caseHash===benchmarkDigest(c)&&row.goldHash===c.gold.sha256&&row.partition===c.partition)))throw Error("Frozen inventory or thresholds changed");
 if(![lock.approvalReceiptHash,lock.retrievalPolicyHash,lock.budgetPolicyHash].every(h=>/^[a-f0-9]{64}$/.test(h))||!Number.isFinite(Date.parse(lock.lockedAt))||!Number.isFinite(Date.parse(lock.executionNotBefore))||Date.parse(lock.executionNotBefore)<Date.parse(lock.lockedAt)||Object.keys(lock.configurations).sort().join()!==[...IMMUNO_CONFIGURATIONS].sort().join()||Object.values(lock.configurations).some(c=>!c.deploymentRef?.trim()||!/^[a-f0-9]{64}$/.test(c.configurationHash)))throw Error("Complete preregistered run lock required");
 if(await authorize({freeze:structuredClone(freeze),lock:structuredClone(lock)})!==true)throw Error("P0-B/P1-A, freeze chronology, current rights and scientific approvals must be independently verified");
 return value;
}
/** Model callbacks receive no gold, expert context annotation, rationale, expected behavior or reviewer identity. */
export function createImmunoLockedEvaluator(deps:{enabled?:boolean;
 authorize:Parameters<typeof authorizeImmunoLockedRun>[1];
 evaluate:(task:Readonly<{caseId:string;question:string;taskType:ImmunoCase["taskType"];configuration:ImmunoConfiguration;configurationHash:string;retrievalPolicyHash:string;budgetPolicyHash:string;freezeHash:string}>,signal:AbortSignal)=>Promise<unknown>;
 assess:(caseValue:Readonly<ImmunoCase>,raw:unknown,configuration:ImmunoConfiguration,signal:AbortSignal)=>Promise<ImmunoObservation>;
 verifyAssessment:Parameters<typeof reportImmunoEvaluation>[2]["verifyAssessment"];
 now?:()=>number;timeoutMs?:number;
}){
 const {evaluate,assess,authorize,verifyAssessment}=deps,enabled=deps.enabled===true,now=deps.now??Date.now,timeoutMs=deps.timeoutMs??1_800_000;
 if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1000||timeoutMs>14_400_000)throw Error("Bounded evaluation deadline required");
 const execute=async(input:Parameters<typeof authorizeImmunoLockedRun>[0],signal:AbortSignal)=>{
  if(!enabled)throw Error("Final immunology evaluation disabled");if(signal.aborted)throw Error("Evaluation cancelled");
  const {cases,freeze,lock}=await authorizeImmunoLockedRun(input,authorize);
  if(signal.aborted||now()<Date.parse(lock.executionNotBefore))throw Error("Run lock not yet effective or evaluation cancelled");
  const rows:ImmunoObservation[]=[],executionFailures:ImmunoExecutionFailure[]=[];
  for(const c of cases.filter(c=>c.partition==="held_out"))for(const configuration of IMMUNO_CONFIGURATIONS){
   if(signal.aborted)throw Error("Evaluation cancelled");
   let raw:unknown;try{raw=await evaluate({caseId:c.caseId,question:c.researchQuestion,taskType:c.taskType,configuration,configurationHash:lock.configurations[configuration].configurationHash,retrievalPolicyHash:lock.retrievalPolicyHash,budgetPolicyHash:lock.budgetPolicyHash,freezeHash:freeze.freezeHash},signal);}catch{if(signal.aborted)throw Error("Evaluation cancelled");executionFailures.push({caseId:c.caseId,configuration,stage:"execution",code:"completion_unknown"});continue}
   if(signal.aborted)throw Error("Evaluation cancelled");let row:ImmunoObservation;try{row=structuredClone(await assess(structuredClone(c),raw,configuration,signal));}catch{if(signal.aborted)throw Error("Evaluation cancelled");executionFailures.push({caseId:c.caseId,configuration,stage:"assessment",code:"assessment_unavailable"});continue}
   if(row.caseId!==c.caseId||row.configuration!==configuration||row.budgetPolicyHash!==lock.budgetPolicyHash){executionFailures.push({caseId:c.caseId,configuration,stage:"assessment",code:"invalid_case_binding"});continue}rows.push(row);
  }
  if(signal.aborted)throw Error("Evaluation cancelled");return reportImmunoEvaluation(cases.filter(c=>c.partition==="held_out"),rows,{verifyAssessment},executionFailures);
 };
 return {async run(input:Parameters<typeof authorizeImmunoLockedRun>[0],signal:AbortSignal){
  const controller=new AbortController(),abort=()=>controller.abort();signal.addEventListener("abort",abort,{once:true});let timer:ReturnType<typeof setTimeout>|undefined;
  try{if(signal.aborted)throw Error("Evaluation cancelled");return await Promise.race([execute(input,controller.signal),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error("Evaluation deadline exceeded"))},timeoutMs);controller.signal.addEventListener("abort",()=>reject(Error("Evaluation cancelled")),{once:true})})]);}
  finally{if(timer)clearTimeout(timer);signal.removeEventListener("abort",abort);controller.abort();}
 }};
}
/** Returns unmet criteria, never scientific approval. A quality mean cannot erase a hard gate. */
export async function assessImmunoAcceptance(input:{report:Awaited<ReturnType<typeof reportImmunoEvaluation>>;policy:ImmunoThresholdPolicy;cases:readonly ImmunoCase[];freeze:ImmunoFreeze},verify:(binding:Readonly<{reportHash:string;freezeHash:string;policyHash:string}>)=>Promise<boolean>){
 const {report,policy,cases,freeze}=structuredClone(input);validateImmunoThresholds(policy,cases);
 const {reportHash,...body}=report;
 if(reportHash!==benchmarkDigest(body)||benchmarkDigest(policy)!==freeze.thresholdPolicyHash||await verify({reportHash,freezeHash:freeze.freezeHash,policyHash:benchmarkDigest(policy)})!==true)throw Error("Independent locked-run/report/policy binding required");
 const blockers:string[]=[];
 if(cases.length!==120||report.providedCaseCount!==120||new Set(cases.map(c=>c.slotId)).size!==120)blockers.push("120 final independently adjudicated cases are not accounted for");
 const point=(g:typeof report.configurations[number]["overall"],metric:string):number|null=>{
  if(metric.startsWith("score."))return g.scores[metric.slice(6)]?.mean??null;
  if(metric==="conflictMacroF1")return g.conflicts.macroF1;
  const v=g[metric as keyof typeof g];return v&&typeof v==="object"&&"value" in v?v.value as number|null:null;
 };
 for(const arm of report.configurations){
  if(arm.missingCaseIds.length)blockers.push(arm.configuration+": missing case observations");
  if(arm.hardGateFailures.provenance.length||arm.hardGateFailures.sourceRights.length||arm.hardGateFailures.criticalSafetyIsolationPromotion.length)blockers.push(arm.configuration+": hard-gate failures");
  if(!policy.releaseConfigurations.some(c=>c===arm.configuration))continue;
  for(const scope of policy.scopes){const group=scope.scope==="overall"?arm.overall:arm.subgroups[scope.scope];if(!group){blockers.push(arm.configuration+": missing subgroup "+scope.scope);continue}for(const m of scope.metrics){if(m.notApplicableReason!==null)continue;
   const interval=group.uncertainty.intervals[m.metric],value=m.basis==="point"?point(group,m.metric):interval?.[m.basis==="lower95"?0:1]??null;
   const scoredN=m.metric.startsWith("score.")?group.scores[m.metric.slice(6)]?.n??0:group.caseCount;
   if(scoredN<m.minimumCases||value===null||m.minimum!==null&&value<m.minimum||m.maximum!==null&&value>m.maximum)blockers.push(`${arm.configuration}: ${scope.scope}: ${m.metric} unmet/undefined (n=${scoredN})`);
  }}
 }
 return {engineeringCriteriaMet:blockers.length===0,blockers,scientificAcceptance:"PENDING_INDEPENDENT_REVIEW",scientificApproval:false,graphPromotable:false};
}
