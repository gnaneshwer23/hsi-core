/** Demonstration of the Source Integrity & Clearance service on SYNTHETIC fixtures only (no network, throwaway key, demo policy).
 * Usage: bun scripts/assess-source.ts [--scenario <id>] [--json]
 * It shows decisions with reason codes, receipts issued for CLEAR sources, what happens under an unapproved policy, and
 * re-evaluation revoking receipts after a retraction. Nothing here is a human policy approval or authority to process a real source.
 */
import {mkdtemp} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createHash} from "node:crypto";
import {DEMO_NOTICE,DEMO_SCENARIOS,buildDemoPolicy,demoAuthority,demoFetcher,demoKeyPair,type DemoScenario} from "../src/sourceIntegrityDemo";
import {resolveSourceEvidence,type SourceRef} from "../src/researchV2/sourceEvidence";
import {createInProcessSigner,createSourceIntegrityService} from "../src/researchV2/sourceIntegrityService";
import {createFileReceiptPublisher} from "../src/researchV2/clearanceAuthority";
import {openStagingOperationStore} from "../src/researchV2/stagingOperationStore";

const args=process.argv.slice(2),only=args.includes("--scenario")?args[args.indexOf("--scenario")+1]:undefined,json=args.includes("--json");
const scenarios=DEMO_SCENARIOS.filter(s=>!only||s.id===only);
if(!scenarios.length){console.error(`Unknown scenario. Available: ${DEMO_SCENARIOS.map(s=>s.id).join(", ")}`);process.exit(2)}
const now=Date.now(),approver=demoKeyPair(),signerKeys=demoKeyPair(),stranger=demoKeyPair();
const USES=["model_transmission","storage","display","comparison","export"] as const;
const scenarioFor=(ref:SourceRef,list:readonly DemoScenario[]=DEMO_SCENARIOS)=>list.find(s=>(ref.pmid&&s.ref.pmid===ref.pmid)||false)??list.find(s=>s.ref.pmid===ref.pmid);
async function build(policy:unknown,override?:Map<string,DemoScenario>){
 const dir=await mkdtemp(join(tmpdir(),"hsi-integrity-demo-"));
 const store=await openStagingOperationStore(join(dir,"journal.jsonl"));
 const service=createSourceIntegrityService({policy,policyAuthorities:[demoAuthority(approver.publicKey)],uses:USES,now:()=>now,
  evidence:ref=>{const s=override?.get(ref.pmid??"")??scenarioFor(ref)!;return resolveSourceEvidence(ref,{fetcher:demoFetcher(s),now:()=>new Date(now)})},
  signer:createInProcessSigner({issuer:"demo:integrity-service",keyId:"demo-signer",privateKey:signerKeys.privateKey}),publisher:createFileReceiptPublisher(join(dir,"published")),store});
 return {service,store};
}
const digest=(s:string)=>createHash("sha256").update(`synthetic passage for ${s}`).digest("hex");
const policy=buildDemoPolicy({now,privateKey:approver.privateKey});
const out:unknown[]=[];
if(!json)console.log(`${DEMO_NOTICE}\n`);
{
 const {service,store}=await build(policy);
 if(!json)console.log(`== Decisions under the demo policy (uses: ${USES.join(", ")}) ==`);
 for(const s of scenarios){
  const r=await service.issueReceipt({sourceId:`pmid:${s.ref.pmid}`,sourceVersion:"v1",ref:s.ref,passageSha256:digest(s.id)});
  out.push({scenario:s.id,decision:r.decision.decision,reasonCodes:r.decision.reasonCodes,receiptId:r.receipt?.id??null});
  if(!json)console.log(`${s.id.padEnd(24)} ${r.decision.decision.padEnd(7)} ${r.decision.reasonCodes.join(",").padEnd(60)} ${r.receipt?`receipt ${r.receipt.id} [${r.receipt.permittedActions.join(",")}]`:""}`);
 }
 await store.close();
}
if(!only){
 const rogue=buildDemoPolicy({now,privateKey:stranger.privateKey});
 const {service,store}=await build(rogue);
 const r=await service.issueReceipt({sourceId:"pmid:90000001",sourceVersion:"v1",ref:{pmid:"90000001"},passageSha256:digest("x")});
 out.push({scenario:"policy-not-approved",decision:r.decision.decision,reasonCodes:r.decision.reasonCodes});
 if(!json)console.log(`\n== A policy not signed by a pinned approver ==\npermissive-cc-by under an unapproved policy: ${r.decision.decision} ${r.decision.reasonCodes.join(",")}; receipt: ${r.receipt?"issued":"none"}`);
 await store.close();
 // Re-evaluation: issue under the first policy, then the source is retracted upstream.
 const retracted:DemoScenario={...DEMO_SCENARIOS[0]!,epmc:{record:{...(DEMO_SCENARIOS[0]!.epmc.record as object),isRetracted:"Y",pubTypeList:{pubType:["Retracted Publication"]}}},crossref:{...DEMO_SCENARIOS[0]!.crossref,updatedBy:[{type:"retraction"}]}};
 const swap=new Map<string,DemoScenario>();
 const {service:svc,store:st}=await build(policy,swap);
 const issued=await svc.issueReceipt({sourceId:"pmid:90000001",sourceVersion:"v1",ref:{pmid:"90000001"},passageSha256:digest("y")});
 swap.set("90000001",retracted);
 const re=await svc.reevaluate();
 out.push({scenario:"re-evaluation-after-retraction",issued:issued.receipt?.id??null,revoked:re.revoked});
 if(!json)console.log(`\n== Re-evaluation ==\nreceipt issued: ${issued.receipt?.id}; upstream retraction appears; re-evaluation revoked: ${re.revoked.map(x=>`${x.receiptId} (${x.reasonCodes.join(",")})`).join("; ")||"nothing"}`);
 await st.close();
}
if(json)console.log(JSON.stringify({notice:DEMO_NOTICE,results:out},null,1));
