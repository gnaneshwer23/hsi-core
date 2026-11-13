/**
 * Live rehearsal: runs the REAL production loader and the REAL guarded --execute path end to end against throwaway
 * material, with no cloud and no network. Keys are generated here; the "Cloud KMS" client signs with a throwaway key; the
 * "network" is a router over synthetic sources; the "provider" returns Anthropic-shaped responses. Everything between
 * (signed policy on disk, pinned public keys from the environment, signed deployment approvals on disk, a private
 * operation store, receipts signed through the managed signer, clearance verification, the durable job, provider
 * operations with their budget and credential handling) is the real code. It proves the wiring; it proves nothing about
 * science, and nothing it produces is evidence.
 */
import {createHash,generateKeyPairSync,sign,type KeyObject} from "node:crypto";
import {chmodSync,mkdirSync,mkdtempSync,readdirSync,readFileSync,rmSync,statSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {runLiveExecute,makeFileDepsLoader,type ExecuteOptions} from "./liveExecute";
import {runLivePreflight} from "./livePreflight";
import {stagingConfigurationHash} from "./liveWiring";
import {crc32c,type CloudKmsClient} from "./researchV2/cloudKmsSigner";
import {stagingApprovalSigningText,type StagingDeploymentApproval} from "./researchV2/stagingDeploymentApproval";
import {buildDemoPolicy,demoFetcher,DEMO_SCENARIOS} from "./sourceIntegrityDemo";
import {DETAILED_CONTEXT_FIELDS} from "./evidence/passageLinkedContext";
import {EXTRACTION_INSTRUCTION} from "./evidence/modelEvidenceExtraction";
import type {LiveDeploymentConfig} from "./liveReadiness";
import type {ProviderWireEncoder} from "./researchV2/pinnedProviderTransport";

export type RehearsalStep={name:string;ok:boolean;detail:string};
export type RehearsalReport={ok:boolean;steps:RehearsalStep[];notice:string};
export const REHEARSAL_NOTICE="REHEARSAL: throwaway keys, a fake KMS client, a synthetic network and synthetic provider responses. This proves the wiring only. Nothing here is evidence, approval or a real clearance.";
const SECRET="REHEARSAL-SECRET-PROVIDER-KEY";
const G1="In a synthetic mouse study, gut microbial metabolites were positively associated with immune signalling in colonic regulatory T cells after 7 days (flow cytometry, n=10).";
const G2="In a synthetic human cohort, gut microbial metabolites were not associated with immune signalling in circulating monocytes (ELISA, n=40).";
const QUOTES:Record<string,{claim:string;polarity:string;fields:Record<string,string>}>={
 [G1]:{claim:"gut microbial metabolites were positively associated with immune signalling",polarity:"supporting",fields:{species:"mouse",tissueCompartment:"colonic",cellType:"regulatory T cells",timing:"after 7 days",assay:"flow cytometry",sampleSize:"n=10"}},
 [G2]:{claim:"gut microbial metabolites were not associated with immune signalling",polarity:"opposing",fields:{species:"human",tissueCompartment:"circulating",cellType:"monocytes",assay:"ELISA",sampleSize:"n=40"}},
};
const extractionFor=(p:string)=>{const q=QUOTES[p]!;return {
 claim:{subject:{system:"FIXTURE",value:"gut-microbial-metabolites",label:"Gut microbial metabolites"},predicate:"associated_with",object:{system:"FIXTURE",value:"immune-signalling",label:"Immune signalling"},polarity:q.polarity,quote:q.claim},
 context:Object.fromEntries(DETAILED_CONTEXT_FIELDS.map(f=>[f,q.fields[f]?{quote:q.fields[f],status:null,reason:null}:{quote:null,status:"not_reported",reason:"Not stated in this passage."}])),note:null};};
const sha=(t:string)=>createHash("sha256").update(t).digest("hex");
const xml=(p:string)=>`<article><body><sec><title>Results</title><p>${p}</p></sec></body></article>`;

function syntheticNetwork(log:string[]){
 const scenario=(n:number)=>DEMO_SCENARIOS[n-1]!;
 return (async(input:unknown,init?:unknown)=>{
  const url=String(input);log.push(url);
  if(url.includes("/europepmc/webservices/rest/search")){
   const q=decodeURIComponent(new URL(url).searchParams.get("query")??""),m=/PMCID:PMC900000(\d)/.exec(q);
   if(m)return demoFetcher(scenario(Number(m[1])))(input as never,init as never);
   const oppose=q.includes("no association");
   return new Response(JSON.stringify({resultList:{result:[{pmcid:oppose?"PMC9000002":"PMC9000001",isOpenAccess:"Y",title:"Synthetic",pmid:oppose?"90000002":"90000001",doi:oppose?"10.9999/synthetic.002":"10.9999/synthetic.001"}]}}));
  }
  if(url.includes("/fullTextXML")){const id=/rest\/(PMC\d+)\/fullTextXML/.exec(url)?.[1];return new Response(xml(id==="PMC9000001"?G1:G2),{headers:{"content-type":"application/xml"}})}
  if(url.startsWith("https://api.crossref.org/works/")){const n=Number(/synthetic\.00(\d)/.exec(decodeURIComponent(url))?.[1]);return demoFetcher(scenario(n))(input as never,init as never)}
  return new Response("",{status:404});
 }) as never;
}
const dep=(id:string,model:string):LiveDeploymentConfig=>({deploymentId:id,providerId:"anthropic",modelId:model,endpoint:"https://api.anthropic.com/v1/messages",timeoutMs:20000,maxResponseBytes:60000,termsRef:"terms:rehearsal",sourcePolicyRef:"demo-policy:v1",maxOutputTokens:1024,budgetUnits:10_000_000,credentialEnv:"HSI_REHEARSAL_PROVIDER_KEY",anthropicVersion:"2023-06-01"});
const pemOf=(k:KeyObject)=>k.export({type:"spki",format:"pem"}).toString();
function walk(dir:string):string[]{return readdirSync(dir).flatMap(n=>{const f=join(dir,n);return statSync(f).isDirectory()?walk(f):[f]})}

export async function rehearse():Promise<RehearsalReport>{
 const steps:RehearsalStep[]=[],step=(name:string,ok:boolean,detail:string)=>steps.push({name,ok,detail});
 const root=mkdtempSync(join(tmpdir(),"hsi-rehearsal-"));chmodSync(root,0o700);
 const NOW=Date.now(),approver=generateKeyPairSync("ed25519"),signerKeys=generateKeyPairSync("ed25519"),approvalKeys=generateKeyPairSync("ed25519");
 const KEY_VERSION="projects/rehearsal-0000/locations/europe-west2/keyRings/rehearsal/cryptoKeys/clearance/cryptoKeyVersions/1";
 const opsErrors:string[]=[],net:string[]=[],providerCalls:{n:number;sawCredentialHeader:boolean}={n:0,sawCredentialHeader:false},kmsCalls={n:0};
 try{
  const extractor=dep("rh-ext","rehearsal-extractor"),verifiers=[dep("rh-va","rehearsal-verifier-a"),dep("rh-vb","rehearsal-verifier-b")];
  const storeDir=join(root,"ops");mkdirSync(join(storeDir,"approvals"),{recursive:true});chmodSync(storeDir,0o700);
  writeFileSync(join(root,"policy.json"),JSON.stringify(buildDemoPolicy({now:NOW,privateKey:approver.privateKey})));
  for(const d of [extractor,...verifiers]){
   const unsigned:Omit<StagingDeploymentApproval,"signature">={schemaVersion:"hsi-staging-deployment-approval-1",id:"approval-"+d.deploymentId,issuer:"approver:rehearsal",keyId:"approval-key",environment:"isolated_staging",deploymentId:d.deploymentId,configurationHash:stagingConfigurationHash(d),termsRef:d.termsRef,sourcePolicyRef:d.sourcePolicyRef,checkedAt:new Date(NOW-60_000).toISOString(),expiresAt:new Date(NOW+3_600_000).toISOString()};
   writeFileSync(join(storeDir,"approvals",`${d.deploymentId}.json`),JSON.stringify({...unsigned,signature:sign(null,Buffer.from(stagingApprovalSigningText(unsigned)),approvalKeys.privateKey).toString("base64url")}));
  }
  const config={environment:"isolated_staging",sourcePolicy:{ownerRef:"owner:rehearsal",termsRef:"terms:rehearsal",policyRef:"demo-policy:v1",allowedHosts:["www.ebi.ac.uk"]},sourceAuthority:{issuer:"demo:integrity-service",keyIds:["demo-signer"]},
   deploymentApproval:{issuer:"approver:rehearsal",keyId:"approval-key",publicKeyEnv:"HSI_REHEARSAL_APPROVAL_KEY"},extractor,verifiers,
   limits:{maxArticlesPerIntent:2,maxHitsPerIntent:4,maxModelCallsPerRun:30,maxRunsPerDay:5,killSwitchEnv:"HSI_REHEARSAL_KILL"},
   review:{normalizerReviewRef:"review:rehearsal-n",questionReviewRef:"review:rehearsal-q",extractionTaskReviewRef:"review:rehearsal-e"},operationStore:{path:join(storeDir,"ops.jsonl")}};
  const integrity={policyFile:join(root,"policy.json"),policyApprovalRef:"approval:rehearsal",policyApprover:{issuer:"demo:policy-approver",keyId:"demo-key",publicKeyEnv:"HSI_REHEARSAL_POLICY_KEY"},
   signer:{serviceRef:"gcpkms:rehearsal/clearance",issuer:"demo:integrity-service",keyId:"demo-signer",keyVersionName:KEY_VERSION,publicKeyEnv:"HSI_REHEARSAL_SIGNER_KEY"},requestedUses:["storage","display","comparison","export","model_transmission"]};
  const env={HSI_REHEARSAL_POLICY_KEY:pemOf(approver.publicKey),HSI_REHEARSAL_SIGNER_KEY:pemOf(signerKeys.publicKey),HSI_REHEARSAL_APPROVAL_KEY:pemOf(approvalKeys.publicKey),HSI_REHEARSAL_PROVIDER_KEY:SECRET};
  const files:Record<string,unknown>={"config.json":config,"integrity.json":integrity};

  const pre=await runLivePreflight({config,integrityConfig:integrity,env,now:()=>NOW});
  step("preflight passes on the rehearsal material",pre.ready,pre.ready?"all checks pass":"open: "+pre.blocking.map(c=>c.id).join(", "));

  const kms:CloudKmsClient={async asymmetricSign(req){kmsCalls.n++;const sig=new Uint8Array(sign(null,Buffer.from(req.data),signerKeys.privateKey));return [{name:req.name,signature:sig,signatureCrc32c:{value:crc32c(sig)},verifiedDataCrc32c:crc32c(req.data)===Number(req.dataCrc32c.value)}]}};
  const transportFactory=(encode:ProviderWireEncoder)=>(async(config:never,payload:{instruction:string;claim:string;passage:string})=>{
   providerCalls.n++;const wire=encode(config,payload);providerCalls.sawCredentialHeader=wire.headers["x-api-key"]===SECRET;
   const extraction=payload.instruction===EXTRACTION_INSTRUCTION;
   const body=extraction?extractionFor(payload.passage):{verdict:"supports",evidenceSpan:QUOTES[payload.passage]!.claim,reason:"The passage states this directly."};
   return Response.json({id:"msg_"+providerCalls.n,model:(config as {modelId:string}).modelId,usage:{input_tokens:200,output_tokens:100},stop_reason:"end_turn",content:[{type:"text",text:JSON.stringify(body)}]},{headers:{"x-request-id":"req_rehearsal_"+providerCalls.n}});
  }) as never;
  const opts:ExecuteOptions={configPath:"config.json",integrityConfigPath:"integrity.json",question:"How might gut microbial metabolites influence immune signalling?",scope:"gut-immune-metabolic",reviewer:"user:rehearsal-reviewer",outDir:join(root,"out")};
  const ioFor=(typed:string|null|"auto")=>({env,now:()=>NOW,readJson:(p:string)=>{if(!(p in files))throw Error("missing");return files[p]},
   confirm:async(prompt:string)=>typed==="auto"?`EXECUTE ${/EXECUTE (live-[a-f0-9]{16})/.exec(prompt)![1]}`:typed,
   loadDeps:async(ctx:Parameters<ReturnType<typeof makeFileDepsLoader>>[0])=>{
    const loaded=await makeFileDepsLoader({kmsClient:kms,fetcher:syntheticNetwork(net),transportFactory})(ctx),run=loaded.deps.ops.run.bind(loaded.deps.ops);
    // Diagnostic only: keep the provider operations' own (generic) refusal reasons so a failed rehearsal says why.
    (loaded.deps.ops as {run:typeof run}).run=async input=>{try{return await run(input)}catch(e){opsErrors.push(e instanceof Error?e.message:"error");throw e}};
    return loaded;
   }});

  const refused=await runLiveExecute(opts,ioFor(null));
  step("no terminal means no run",!refused.ok&&providerCalls.n===0&&kmsCalls.n===0,"refused before loading anything");
  const out=await runLiveExecute(opts,ioFor("auto"));
  step("a confirmed run completes through the real loader",out.ok&&out.job==="completed",out.ok?`job ${out.jobId} ${out.job}`:out.refusals.join("; "));
  if(out.ok&&out.outputDir){
   const packet=JSON.parse(readFileSync(join(out.outputDir,"review-packet.json"),"utf8"));
   const brief=readFileSync(join(out.outputDir,"brief.md"),"utf8");
   step("two grounded evidence units from two cleared sources",packet.units.length===2&&!brief.includes("not grounded")&&!packet.flags.some((f:{code:string})=>f.code==="extraction_rejected"),`${packet.units.length} units, extraction grounded in the passages`);
   step("receipts were signed through the (fake) KMS and published",kmsCalls.n>0&&readdirSync(join(storeDir,"published","receipts")).length>=2,`${kmsCalls.n} KMS signs, ${readdirSync(join(storeDir,"published","receipts")).length} receipts`);
   step("provider calls ran with approvals verified from disk and the credential used",providerCalls.n===6&&providerCalls.sawCredentialHeader,`${providerCalls.n} provider calls${opsErrors.length?`; provider operations refused: ${[...new Set(opsErrors)].join(" | ")}`:""}`);
   const proposals=JSON.parse(readFileSync(join(out.outputDir,"atlas-proposals.json"),"utf8")),vantage=JSON.parse(readFileSync(join(out.outputDir,"vantage.json"),"utf8"));
   step("ATLAS drafts and VANTAGE gaps are written, unapproved and unvalidated",proposals.proposals.length===2&&proposals.proposals.every((p:{edge:{review:{state:string}};graphPromotable:boolean})=>p.edge.review.state==="draft"&&p.graphPromotable===false)&&proposals.graphPromotable===false&&vantage.gaps.length>0&&vantage.followUps.every((f:{status:string;approved:boolean})=>f.status==="unvalidated_proposal"&&f.approved===false),`${proposals.proposals.length} draft proposals, ${vantage.gaps.length} gaps, ${vantage.followUps.length} follow-up(s)`);
   step("outputs are unapproved and non-promotable",packet.scientificApproval===false&&packet.graphPromotable===false&&packet.humanReview==="required","flags false, human review required");
   step("only allow-listed hosts were contacted",net.every(u=>["www.ebi.ac.uk","api.crossref.org"].includes(new URL(u).hostname)),`${net.length} requests`);
   const leaked=walk(root).filter(f=>{try{return readFileSync(f,"utf8").includes(SECRET)}catch{return false}});
   step("the provider credential appears in no file written",leaked.length===0,leaked.length?`found in ${leaked.length} file(s)`:"not found in any file");
   const again=await runLiveExecute(opts,ioFor("auto"));
   step("a completed job is not re-run",again.ok&&again.job==="already_completed"&&providerCalls.n===6,"second execute reported already_completed");
  }
 }catch(e){step("rehearsal raised an unexpected error",false,e instanceof Error?e.message.slice(0,200):"error")}
 finally{rmSync(root,{recursive:true,force:true})}
 return {ok:steps.every(s=>s.ok),steps,notice:REHEARSAL_NOTICE};
}
