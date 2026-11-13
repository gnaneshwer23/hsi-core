/**
 * Live wiring: assembles the pieces that already exist into the dependency set `runLiveInvestigation` needs. It adds no
 * new authority. Everything with a secret or a human decision is INJECTED (policy, authorities, signer, public keys,
 * approval resolver, credentials via the environment), and nothing here reads a secret value except through the provider
 * operations' own credential callback. Building the dependencies makes no network call and sends nothing; the CLI still
 * refuses live execution and this module is exercised with mocks until the human-held items exist.
 *
 *   evidence (Europe PMC + Crossref, allow-listed) -> source integrity service (signed policy, managed signer)
 *   -> operational clearance (receipt verified against the pinned signer key, revocations honoured)
 *   -> live search + provider operations (deployment approval, model_transmission clearance, budget, pinned transport)
 */
import type {KeyObject} from "node:crypto";
import {INTEGRITY_ALLOWED_HOSTS,resolveSourceEvidence,type SourceRef} from "./researchV2/sourceEvidence";
import {createSourceIntegrityService,type ReceiptSigner} from "./researchV2/sourceIntegrityService";
import {createSourceClearanceVerifier} from "./researchV2/sourceClearanceReceipt";
import {createOperationalSourceClearance} from "./researchV2/operationalSourceClearance";
import {createHash} from "node:crypto";
import {createStagingProviderOperations,type StagingDeployment} from "./researchV2/stagingProviderOperations";
import {validateProviderConfig} from "./researchV2/providerReliability";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";
import {createStagingDeploymentApprovalVerifier,type DeploymentApprovalBinding} from "./researchV2/stagingDeploymentApproval";
import type {StagingOperationStore} from "./researchV2/stagingOperationStore";
import type {ReceiptPublisher} from "./researchV2/clearanceAuthority";
import type {PolicyAuthority,} from "./researchV2/clearancePolicy";
import type {SourceUse} from "./researchV2/clearancePolicy";
import type {SourceFetcher} from "./researchV2/sourceAdapters";
import type {FetchLike} from "./fetchLike";
import {createAllowlistedFetcher} from "./liveSearch";
import type {LiveDeploymentConfig,LiveRunConfig} from "./liveReadiness";
import type {LiveRunDeps} from "./liveRun";
import type {ContextAuditTarget} from "./evidence/contextConflictAudit";

export type LiveWiringInput={
 config:LiveRunConfig;/** The FULL integrity configuration: the run gate re-assesses it, so it must not be trimmed. */
 integrityConfig:{requestedUses:readonly string[]}&Record<string,unknown>;env:Record<string,string|undefined>;
 policy:unknown;policyAuthorities:readonly PolicyAuthority[];
 signer:ReceiptSigner;signerPublicKey:KeyObject;
 approvalAuthorities:readonly {issuer:string;keyId:string;publicKey:KeyObject}[];
 resolveApproval:(binding:Readonly<DeploymentApprovalBinding>,signal:AbortSignal)=>Promise<unknown>;
 isApprovalRevoked:(id:string,issuer:string,signal:AbortSignal)=>Promise<boolean>;
 fetcher:SourceFetcher;store:StagingOperationStore;publisher:ReceiptPublisher;
 auditDirectory:string;target:ContextAuditTarget;runsToday:()=>number;
 now?:()=>number;sleep?:(ms:number)=>Promise<void>;
 /** Test-only: replaces the pinned provider transport. Omit in real use. */
 transportFactory?:Parameters<typeof createStagingProviderOperations>[0]["transportFactory"];
};
const toStagingDeployment=(d:LiveDeploymentConfig):StagingDeployment=>({
 id:d.deploymentId,config:{providerId:d.providerId,modelId:d.modelId,endpoint:d.endpoint,timeoutMs:d.timeoutMs,maxResponseBytes:d.maxResponseBytes} as StagingDeployment["config"],
 termsRef:d.termsRef,sourcePolicyRef:d.sourcePolicyRef,maxOutputTokens:d.maxOutputTokens,inputUnitPrice:d.inputUnitPrice??1,outputUnitPrice:d.outputUnitPrice??1,budgetUnits:d.budgetUnits,
 ...(d.anthropicVersion?{anthropicVersion:d.anthropicVersion}:{}),
});

/** The configuration hash a deployment approval must bind to: the same recipe the provider operations use. */
export function stagingConfigurationHash(d:LiveDeploymentConfig):string{
 const sd=structuredClone(toStagingDeployment(d));sd.config={...validateProviderConfig(sd.config)};
 return createHash("sha256").update(canonicalEvidenceJson(sd)).digest("hex");
}

export function buildLiveRunDeps(input:LiveWiringInput):{deps:LiveRunDeps;service:ReturnType<typeof createSourceIntegrityService>;clearance:ReturnType<typeof createOperationalSourceClearance>}{
 const now=input.now??Date.now,{config}=input;
 const integrityHttp=createAllowlistedFetcher(input.fetcher,{hosts:INTEGRITY_ALLOWED_HOSTS,universe:INTEGRITY_ALLOWED_HOSTS,maxRequests:64});
 const service=createSourceIntegrityService({
  policy:input.policy,policyAuthorities:input.policyAuthorities,signer:input.signer,publisher:input.publisher,store:input.store,now,
  uses:input.integrityConfig.requestedUses as readonly SourceUse[],
  evidence:(ref:SourceRef,signal?:AbortSignal)=>resolveSourceEvidence(ref,{fetcher:integrityHttp.fetch as unknown as FetchLike,now:()=>new Date(now()),signal}),
 });
 const revoked=()=>new Set(input.store.read().filter(e=>e.type==="source_integrity_revocation").map(e=>e.receiptId as string));
 const verifier=createSourceClearanceVerifier({authorities:[{issuer:input.signer.issuer,keyId:input.signer.keyId,publicKey:input.signerPublicKey}],isRevoked:async id=>revoked().has(id),now});
 const clearance=createOperationalSourceClearance({authority:service.authority,verifier,store:input.store,now});
 const approvals=createStagingDeploymentApprovalVerifier({authorities:input.approvalAuthorities,resolveReceipt:input.resolveApproval,isRevoked:input.isApprovalRevoked,store:input.store,now});
 const all=[config.extractor,...config.verifiers];
 const envByProvider=new Map<string,string>();
 for(const d of all){const prev=envByProvider.get(d.providerId);if(prev&&prev!==d.credentialEnv)throw Error("One provider must use one credential variable");envByProvider.set(d.providerId,d.credentialEnv)}
 const ops=createStagingProviderOperations({
  enabled:true,deployments:all.map(toStagingDeployment),store:input.store,sources:clearance,
  approve:binding=>approvals.authorize(binding),
  credential:providerId=>{const name=envByProvider.get(providerId),value=name?input.env[name]:undefined;if(!value?.trim())throw Error("Provider credential unavailable");return value},
  transportFactory:input.transportFactory,
 });
 const deps:LiveRunDeps={config,integrityConfig:input.integrityConfig,env:input.env,target:input.target,auditDirectory:input.auditDirectory,
  fetcher:input.fetcher,clearance:{decide:b=>clearance.decide(b)},ops,runsToday:input.runsToday,now:()=>new Date(now()).toISOString(),sleep:input.sleep};
 return {deps,service,clearance};
}
