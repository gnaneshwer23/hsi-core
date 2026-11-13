import {describe,expect,test} from "bun:test";
import {createHash,generateKeyPairSync} from "node:crypto";
import {mkdir,mkdtemp,readFile,rm,writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {DEMO_NOTICE,DEMO_SCENARIOS,buildDemoPolicy,demoAuthority,demoFetcher,demoKeyPair,type DemoScenario} from "../src/sourceIntegrityDemo";
import {MAX_POLICY_WINDOW_MS,policySigningText,signPolicy,validatePolicyStructure,verifyPolicyApproval,type ClearancePolicy,type SourceUse} from "../src/researchV2/clearancePolicy";
import {INTEGRITY_ALLOWED_HOSTS,parseCrossrefNotices,parseLicenceLabel,parseLicenceUrl,resolveSourceEvidence,type SourceEvidence} from "../src/researchV2/sourceEvidence";
import {assessSource,expandUses,REASON_CODES} from "../src/researchV2/sourceIntegrityAssessor";
import {createInProcessSigner,createSourceIntegrityService,parseSourceRef} from "../src/researchV2/sourceIntegrityService";
import {createFileReceiptPublisher,createFileSourceAuthority} from "../src/researchV2/clearanceAuthority";
import {createSourceClearanceVerifier,type SourceClearanceReceipt} from "../src/researchV2/sourceClearanceReceipt";
import {createOperationalSourceClearance} from "../src/researchV2/operationalSourceClearance";
import {openStagingOperationStore} from "../src/researchV2/stagingOperationStore";
import {createStagingProviderOperations,type StagingDeployment} from "../src/researchV2/stagingProviderOperations";
import {createAllowlistedFetcher,createLiveSearch} from "../src/liveSearch";
import {assessSourceIntegrityReadiness} from "../src/sourceIntegrityReadiness";
import {verifyRevocation} from "../src/researchV2/clearanceSigning";
import type {ContextAuditTarget} from "../src/evidence/contextConflictAudit";

const sha=(s:string)=>createHash("sha256").update(s).digest("hex");
const NOW=Date.parse("2026-11-13T12:00:00Z");
const USES:SourceUse[]=["model_transmission","storage","display","comparison","export"];
const scenario=(id:string)=>DEMO_SCENARIOS.find(s=>s.id===id)!;
const approver=demoKeyPair(),signerKeys=demoKeyPair();
const policy=(over:Partial<Parameters<typeof buildDemoPolicy>[0]>={})=>buildDemoPolicy({now:NOW,privateKey:approver.privateKey,...over});
const authorities=[demoAuthority(approver.publicKey)];
const evidenceFor=(s:DemoScenario,now=NOW)=>resolveSourceEvidence(s.ref,{fetcher:demoFetcher(s),now:()=>new Date(now)});
const decide=async(id:string,over:{policy?:ClearancePolicy|null;failure?:{code:never;detail:string}|null;uses?:SourceUse[];now?:number}={})=>assessSource({evidence:await evidenceFor(scenario(id)),uses:over.uses??USES,policy:over.policy===undefined?policy():over.policy,policyFailure:(over.failure as never)??null,now:over.now??NOW});

describe("1-2. identity resolution and licence evidence for specific uses",()=>{
 test("licence URLs and labels normalise conservatively; an unversioned label is never promoted to a versioned licence",()=>{
  expect(parseLicenceUrl("http://creativecommons.org/licenses/by/4.0/")).toEqual({family:"cc-by",version:"4.0"});
  expect(parseLicenceUrl("https://creativecommons.org/licenses/by-nc-nd/3.0")).toEqual({family:"cc-by-nc-nd",version:"3.0"});
  expect(parseLicenceUrl("https://creativecommons.org/publicdomain/zero/1.0/").family).toBe("cc0");
  expect(parseLicenceUrl("https://publisher.example/terms")).toEqual({family:"publisher-specific",version:null});
  expect(parseLicenceUrl("https://creativecommons.org/licenses/by-xx/4.0/").family).toBe("unknown");
  expect(parseLicenceLabel("cc by")).toBe("cc-by");expect(parseLicenceLabel("CC BY-NC-SA")).toBe("cc-by-nc-sa");expect(parseLicenceLabel("cc0")).toBe("cc0");
  expect(parseLicenceLabel("all rights reserved")).toBeNull();expect(parseLicenceLabel(null)).toBeNull();expect(parseLicenceLabel("cc by-zz")).toBeNull();
 });
 test("a matched record resolves DOI, PMID, PMCID and title from one provider record, with a stable evidence hash",async()=>{
  const a=await evidenceFor(scenario("permissive-cc-by")),b=await evidenceFor(scenario("permissive-cc-by"));
  expect(a.identity).toMatchObject({status:"matched",pmid:"90000001",pmcid:"PMC9000001",doi:"10.9999/synthetic.001"});
  expect(a.licence).toMatchObject({status:"ok",family:"cc-by",version:"4.0"});expect(a.evidenceHash).toBe(b.evidenceHash);expect(a.providers).toEqual({europe_pmc:"ok",crossref:"ok"});
  const byDoi=await resolveSourceEvidence({doi:"10.9999/synthetic.001"},{fetcher:demoFetcher(scenario("permissive-cc-by")),now:()=>new Date(NOW)});expect(byDoi.identity.status).toBe("matched");
  const byPmcid=await resolveSourceEvidence({pmcid:"PMC9000001"},{fetcher:demoFetcher(scenario("permissive-cc-by")),now:()=>new Date(NOW)});expect(byPmcid.identity.status).toBe("matched");
 });
 test("licence outcomes: label only, conflict, TDM only, missing and publisher terms are distinguished",async()=>{
  expect((await evidenceFor(scenario("label-only"))).licence).toMatchObject({status:"label_only",family:"cc-by",version:null});
  expect((await evidenceFor(scenario("ambiguous-rights"))).licence.status).toBe("conflict");
  expect((await evidenceFor(scenario("tdm-only"))).licence.status).toBe("tdm_only");
  expect((await evidenceFor(scenario("missing-licence"))).licence.status).toBe("missing");
  expect((await evidenceFor(scenario("restricted-publisher"))).licence).toMatchObject({status:"ok",family:"publisher-specific"});
 });
 test("requested uses expand to include retrieval and full-text processing, and unknown uses are refused",()=>{
  expect(expandUses(["model_transmission"])).toEqual(["retrieval","full_text_processing","model_transmission"]);
  expect(expandUses(["retrieval"])).toEqual(["retrieval"]);expect(()=>expandUses([])).toThrow();expect(()=>expandUses(["sell" as never])).toThrow();
 });
});

describe("3. retraction, correction and expression-of-concern status",()=>{
 test("notices from Crossref and Europe PMC are detected; silence from one provider is not 'clear'",async()=>{
  expect(parseCrossrefNotices(JSON.stringify({message:{"updated-by":[{type:"Retraction"},{type:"withdrawal"},{type:"correction"},{type:"expression_of_concern"},{type:"other"}]}}))?.map(n=>n.type)).toEqual(["retraction","retraction","correction","expression_of_concern"]);
  expect(parseCrossrefNotices(JSON.stringify({message:{}}))).toEqual([]);expect(parseCrossrefNotices("not json")).toBeNull();expect(parseCrossrefNotices(JSON.stringify({message:{"updated-by":"x"}}))).toBeNull();
  expect((await evidenceFor(scenario("retracted"))).integrity).toMatchObject({retraction:"retracted"});
  expect((await evidenceFor(scenario("corrected"))).integrity).toMatchObject({retraction:"clear",correction:"corrected"});
  expect((await evidenceFor(scenario("expression-of-concern"))).integrity.expressionOfConcern).toBe("flagged");
  const clean=(await evidenceFor(scenario("permissive-cc-by"))).integrity;expect(clean).toMatchObject({retraction:"clear",correction:"none",expressionOfConcern:"none"});
  const outage=(await evidenceFor(scenario("crossref-outage"))).integrity;expect(outage).toMatchObject({retraction:"unknown",correction:"unknown",expressionOfConcern:"unknown"});
 });
 test("provider outages and unresolved identities stay typed and never read as clean",async()=>{
  expect((await evidenceFor(scenario("europepmc-outage"))).providers.europe_pmc).toBe("unavailable");
  expect((await evidenceFor(scenario("crossref-outage"))).providers.crossref).toBe("unavailable");
  expect((await evidenceFor(scenario("unknown-source"))).identity.status).toBe("unresolved");
  expect((await evidenceFor(scenario("identity-conflict"))).identity.status).toBe("conflict");
 });
 test("evidence fetching is confined to the integrity host list",async()=>{
  const seen:string[]=[];
  const guarded=createAllowlistedFetcher((async(u:unknown)=>{seen.push(String(u));return demoFetcher(scenario("permissive-cc-by"))(u as never,undefined)}) as never,{maxRequests:8,hosts:INTEGRITY_ALLOWED_HOSTS,universe:INTEGRITY_ALLOWED_HOSTS});
  await resolveSourceEvidence(scenario("permissive-cc-by").ref,{fetcher:guarded.fetch as never,now:()=>new Date(NOW)});
  expect(seen.every(u=>INTEGRITY_ALLOWED_HOSTS.includes(new URL(u).hostname))).toBe(true);
  await expect(guarded.fetch("https://evil.example/x")).rejects.toThrow();
  expect(()=>createAllowlistedFetcher((async()=>new Response()) as never,{maxRequests:2,hosts:["evil.example"],universe:INTEGRITY_ALLOWED_HOSTS})).toThrow();
 });
});

describe("4. deterministic, versioned, human-approved policy",()=>{
 test("a policy signed by a pinned approver verifies; any change, wrong key, expiry, early use or revocation fails closed",async()=>{
  const p=policy(),ok=await verifyPolicyApproval(p,{authorities,now:NOW});expect(ok.ok).toBe(true);
  const code=async(x:unknown,o:{now?:number;isRevoked?:()=>Promise<boolean>;authorities?:typeof authorities}={})=>{const r=await verifyPolicyApproval(x,{authorities:o.authorities??authorities,now:o.now??NOW,isRevoked:o.isRevoked});return r.ok?"ok":r.code};
  const tampered=structuredClone(p);tampered.rules.maxEvidenceAgeMs=3600_001;expect(await code(tampered)).toBe("POLICY_NOT_AUTHORISED");
  expect(await code({...p,approval:{...p.approval,approvedBy:"Someone Else"}})).toBe("POLICY_NOT_AUTHORISED");
  expect(await code(p,{authorities:[demoAuthority(demoKeyPair().publicKey)]})).toBe("POLICY_NOT_AUTHORISED");expect(await code(p,{authorities:[]})).toBe("POLICY_NOT_AUTHORISED");
  expect(await code(p,{now:Date.parse(p.expiresAt)+1})).toBe("POLICY_EXPIRED");expect(await code(p,{now:Date.parse(p.effectiveFrom)-1})).toBe("POLICY_NOT_EFFECTIVE");
  expect(await code(p,{isRevoked:async()=>true})).toBe("POLICY_REVOKED");expect(await code(p,{isRevoked:async()=>{throw Error("down")}})).toBe("POLICY_REVOKED");
  expect(await code({...p,schemaVersion:"x"})).toBe("POLICY_INVALID");expect(await code(null)).toBe("POLICY_INVALID");
  expect(policySigningText(p)).toBe(policySigningText(structuredClone(p)));
 });
 test("hard rules cannot be written into a policy: restricted licences authorise retrieval only, windows are bounded, uses never overlap",()=>{
  const k=generateKeyPairSync("ed25519").privateKey,sign=(mut:(p:any)=>void)=>{const p=structuredClone(policy()) as any;mut(p);const {approval,...rest}=p;const {signature:_s,...a}=approval;return ()=>signPolicy({...rest,approval:a},k)};
  expect(sign(p=>{p.rules.licences.find((r:any)=>r.family==="publisher-specific").authorisedUses.push("storage")})).toThrow("retrieval only");
  expect(sign(p=>{p.rules.licences.push({family:"unknown",authorisedUses:["retrieval","export"],prohibitedUses:[],acceptUnversionedLabel:false})})).toThrow();
  expect(sign(p=>{p.rules.licences.push({family:"all-rights-reserved",authorisedUses:["model_transmission"],prohibitedUses:[],acceptUnversionedLabel:false})})).toThrow();
  expect(sign(p=>{p.rules.licences[1].prohibitedUses.push("storage")})).toThrow("both authorised and prohibited");
  expect(sign(p=>{p.rules.licences.push({...p.rules.licences[0]})})).toThrow("duplicate");
  expect(sign(p=>{p.rules.licences[0].authorisedUses=["storage"]})).toThrow("retrieval");
  expect(sign(p=>{p.expiresAt=new Date(Date.parse(p.effectiveFrom)+MAX_POLICY_WINDOW_MS+1).toISOString()})).toThrow("90 days");
  expect(sign(p=>{p.rules.receiptValidityMs=86_400_001})).toThrow("24 hours");expect(sign(p=>{p.rules.requiredProviders=[]})).toThrow();expect(sign(p=>{p.rules.correction="ignore"})).toThrow();
  expect(()=>validatePolicyStructure({})).toThrow();
 });
});

describe("5-6. CLEAR, REVIEW or BLOCK with reason codes; CLEAR only for pre-authorised combinations",()=>{
 const expected:[string,string,string[]][]=[
  ["permissive-cc-by","CLEAR",["CLEAR_PRE_AUTHORISED"]],["permissive-cc0","CLEAR",["CLEAR_PRE_AUTHORISED"]],
  ["restricted-publisher","REVIEW",["USE_NOT_AUTHORISED"]],["noncommercial","BLOCK",["USE_PROHIBITED"]],
  ["missing-licence","REVIEW",["LICENCE_MISSING"]],["ambiguous-rights","REVIEW",["LICENCE_CONFLICT"]],["label-only","REVIEW",["LICENCE_LABEL_ONLY"]],["tdm-only","REVIEW",["LICENCE_TDM_ONLY"]],
  ["retracted","BLOCK",["RETRACTED"]],["corrected","REVIEW",["CORRECTION_NOTICE"]],["expression-of-concern","REVIEW",["EXPRESSION_OF_CONCERN"]],
 ];
 for(const [id,decision,codes] of expected)test(`${id}: ${decision}`,async()=>{
  const d=await decide(id);expect(d.decision as string).toBe(decision);expect(d.reasonCodes as string[]).toEqual(codes);expect(d.reasons.length).toBe(codes.length);
  expect(d.grantedUses).toEqual(decision==="CLEAR"?expandUses(USES):[]);expect(d.evidenceHash).toMatch(/^[a-f0-9]{64}$/);expect(d.policy?.approvalRef).toBe("demo:not-a-real-approval");
 });
 test("provider outages, unresolved or conflicting identity and unknown sources are REVIEW, never CLEAR",async()=>{
  for(const id of ["crossref-outage","europepmc-outage","identity-conflict","unknown-source"]){const d=await decide(id);expect(d.decision).toBe("REVIEW");expect(d.reasonCodes).not.toContain("CLEAR_PRE_AUTHORISED")}
  expect((await decide("crossref-outage")).reasonCodes).toContain("PROVIDER_UNAVAILABLE");expect((await decide("europepmc-outage")).reasonCodes).toContain("PROVIDER_UNAVAILABLE");
  expect((await decide("identity-conflict")).reasonCodes).toContain("IDENTITY_CONFLICT");expect((await decide("unknown-source")).reasonCodes).toContain("IDENTITY_UNRESOLVED");
 });
 test("a narrower request can be CLEAR where a broader one is not; the same licence prohibits only what the policy prohibits",async()=>{
  expect((await decide("noncommercial",{uses:["storage","display","comparison"]})).decision).toBe("CLEAR");
  expect((await decide("noncommercial",{uses:["storage","export"]})).decision).toBe("BLOCK");
  expect((await decide("restricted-publisher",{uses:["retrieval"]})).decision).toBe("CLEAR");
  expect((await decide("restricted-publisher",{uses:["display"]})).decision).toBe("REVIEW");
 });
 test("only the policy's own review-or-block choices can move; a policy cannot weaken retraction or prohibited use",async()=>{
  const k=generateKeyPairSync("ed25519"),resign=(mut:(p:any)=>void)=>{const p=structuredClone(policy()) as any;mut(p);const {approval,...rest}=p;const {signature:_s,...a}=approval;return signPolicy({...rest,approval:a},approver.privateKey)};
  expect((await decide("corrected",{policy:resign(p=>{p.rules.correction="block"})})).decision).toBe("BLOCK");
  expect((await decide("expression-of-concern",{policy:resign(p=>{p.rules.expressionOfConcern="block"})})).decision).toBe("BLOCK");
  expect((await decide("tdm-only",{policy:resign(p=>{p.rules.tdmOnly="block"})})).decision).toBe("BLOCK");
  expect((await decide("label-only",{policy:resign(p=>{p.rules.licences.find((r:any)=>r.family==="cc-by").acceptUnversionedLabel=true})})).decision).toBe("CLEAR");
  expect((await decide("retracted")).decision).toBe("BLOCK");expect(k).toBeTruthy();
 });
 test("unapproved, expired, revoked or invalid policies BLOCK every source, including otherwise clearable ones",async()=>{
  for(const code of ["POLICY_NOT_AUTHORISED","POLICY_EXPIRED","POLICY_NOT_EFFECTIVE","POLICY_REVOKED","POLICY_INVALID"]){
   const d=await decide("permissive-cc-by",{policy:null,failure:{code:code as never,detail:"x"}});expect(d.decision).toBe("BLOCK");expect(d.reasonCodes as string[]).toEqual([code]);expect(d.grantedUses).toEqual([]);
  }
 });
 test("stale or future-dated evidence is REVIEW; CLEAR expires no later than the policy, the receipt window or the evidence age limit",async()=>{
  const p=policy(),ev=await evidenceFor(scenario("permissive-cc-by"));
  expect(assessSource({evidence:ev,uses:USES,policy:p,policyFailure:null,now:NOW+p.rules.maxEvidenceAgeMs+1}).reasonCodes).toContain("EVIDENCE_STALE");
  expect(assessSource({evidence:ev,uses:USES,policy:p,policyFailure:null,now:NOW-1}).reasonCodes).toContain("EVIDENCE_STALE");
  const ok=assessSource({evidence:ev,uses:USES,policy:p,policyFailure:null,now:NOW});
  expect(Date.parse(ok.expiresAt!)).toBeLessThanOrEqual(Math.min(NOW+p.rules.receiptValidityMs,Date.parse(p.expiresAt),NOW+p.rules.maxEvidenceAgeMs));
  expect(assessSource({evidence:null,uses:USES,policy:p,policyFailure:null,now:NOW}).decision).toBe("REVIEW");
 });
 test("decisions are deterministic and use only declared reason codes",async()=>{
  for(const s of DEMO_SCENARIOS){const a=await decide(s.id),b=await decide(s.id);expect(a).toEqual(b);expect(a.reasonCodes.every(c=>(REASON_CODES as readonly string[]).includes(c))).toBe(true)}
 });
});

async function harness(opts:{policy?:unknown;scenarios?:Map<string,DemoScenario>;now?:{t:number}}={}){
 const dir=await mkdtemp(join(tmpdir(),"hsi-int-")),now=opts.now??{t:NOW};
 const store=await openStagingOperationStore(join(dir,"journal.jsonl")),publishDir=join(dir,"published"),publisher=createFileReceiptPublisher(publishDir);
 let signs=0;const base=createInProcessSigner({issuer:"demo:integrity-service",keyId:"demo-signer",privateKey:signerKeys.privateKey});
 const signer={...base,async sign(t:string){signs++;return base.sign(t)}};
 const service=createSourceIntegrityService({policy:opts.policy??policy(),policyAuthorities:authorities,uses:USES,now:()=>now.t,signer,publisher,store,
  evidence:ref=>{const s=opts.scenarios?.get(ref.pmid??"")??DEMO_SCENARIOS.find(x=>x.ref.pmid===ref.pmid)!;return resolveSourceEvidence(ref,{fetcher:demoFetcher(s),now:()=>new Date(now.t)})}});
 await mkdir(publishDir,{recursive:true});
 await writeFile(join(publishDir,"authority.json"),JSON.stringify({schemaVersion:"hsi-clearance-authority-1",issuer:"demo:integrity-service",keyId:"demo-signer",publicKeyPem:signerKeys.publicKey.export({type:"spki",format:"pem"}).toString()}));
 return {dir,store,service,publisher,publishDir,now,signs:()=>signs,close:async()=>{await store.close();await rm(dir,{recursive:true,force:true})}};
}
const PASSAGE="Synthetic passage text for source integrity tests only, containing no real findings.";
const claimFor=(pmid:string,passage=PASSAGE)=>({sourceId:"pmid:"+pmid,sourceVersion:"v1",ref:{pmid},passageSha256:sha(passage)});
const verifierFor=(now:{t:number})=>createSourceClearanceVerifier({authorities:[{issuer:"demo:integrity-service",keyId:"demo-signer",publicKey:signerKeys.publicKey}],isRevoked:async()=>false,requiredActions:["storage"],now:()=>now.t});

describe("7-9. receipts, restricted signing, expiry, revocation and re-evaluation",()=>{
 test("a CLEAR decision yields a receipt the existing verifier accepts, bound to the passage digest, policy and evidence",async()=>{
  const h=await harness();
  try{
   const r=await h.service.issueReceipt(claimFor("90000001"));
   expect(r.decision.decision).toBe("CLEAR");const receipt=r.receipt!;
   expect(receipt.schemaVersion).toBe("hsi-source-clearance-1");expect([...receipt.permittedActions].sort()).toEqual([...USES].sort());expect(receipt.licenceId).toBe("CC-BY-4.0");expect(receipt.canonicalId).toBe("PMID:90000001");
   expect(receipt.attribution).toContain("demo-policy:v1");expect(receipt.attribution).toContain("policy-digest:");expect(receipt.attribution).toContain("evidence:");
   expect(Date.parse(receipt.expiresAt)-Date.parse(receipt.checkedAt)).toBeLessThanOrEqual(12*3600_000);
   const v=verifierFor(h.now);
   expect(await v.authorize({receipt,sourceId:receipt.sourceId,sourceVersion:"v1",passage:PASSAGE,requiredActions:USES as never})).toBe(true);
   expect(await v.authorize({receipt,sourceId:receipt.sourceId,sourceVersion:"v1",passage:PASSAGE+" altered",requiredActions:USES as never})).toBe(false);
  }finally{await h.close()}
 });
 test("REVIEW and BLOCK decisions issue no receipt and publish nothing; an unapproved policy issues nothing for any source",async()=>{
  const h=await harness();
  try{
   for(const s of DEMO_SCENARIOS.filter(x=>!["permissive-cc-by","permissive-cc0","identity-conflict"].includes(x.id)))expect((await h.service.issueReceipt(claimFor(s.ref.pmid!))).receipt).toBeNull();
   expect(await h.publisher.getReceipt("pmid:90000009","v1",sha(PASSAGE))).toBeNull();expect(h.signs()).toBe(0);
  }finally{await h.close()}
  const rogue=await harness({policy:buildDemoPolicy({now:NOW,privateKey:generateKeyPairSync("ed25519").privateKey})});
  try{const r=await rogue.service.issueReceipt(claimFor("90000001"));expect(r.receipt).toBeNull();expect(r.decision.reasonCodes).toEqual(["POLICY_NOT_AUTHORISED"]);expect(rogue.signs()).toBe(0)}finally{await rogue.close()}
 });
 test("the service holds no private key: it only hands bytes to a signer, and refuses a malformed signature",async()=>{
  const h=await harness();
  try{
   const src=await readFile(new URL("../src/researchV2/sourceIntegrityService.ts",import.meta.url),"utf8");
   expect(/BEGIN (?:EC |ED25519 )?PRIVATE KEY/.test(src)).toBe(false);expect(/process\.env/.test(src)).toBe(false);
   const bad=createSourceIntegrityService({policy:policy(),policyAuthorities:authorities,uses:USES,now:()=>NOW,signer:{issuer:"demo:integrity-service",keyId:"demo-signer",sign:async()=>"short"},publisher:h.publisher,store:h.store,
    evidence:ref=>evidenceFor(DEMO_SCENARIOS.find(x=>x.ref.pmid===ref.pmid)!)});
   await expect(bad.issueReceipt(claimFor("90000001"))).rejects.toThrow();
   expect(await h.publisher.getReceipt("pmid:90000001","v1",sha(PASSAGE))).toBeNull();
  }finally{await h.close()}
 });
 test("forged receipts are rejected: wrong key, altered fields and replay for another passage",async()=>{
  const h=await harness();
  try{
   const {receipt}=await h.service.issueReceipt(claimFor("90000001")),v=verifierFor(h.now),ok=(r:unknown,p=PASSAGE)=>v.authorize({receipt:r,sourceId:"pmid:90000001",sourceVersion:"v1",passage:p,requiredActions:USES as never});
   expect(await ok(receipt)).toBe(true);
   for(const [k,val] of [["licenceId","CC0"],["canonicalId","PMID:1"],["expiresAt","2099-01-01T00:00:00.000Z"],["permittedActions",[...USES,"extra"]],["sourceVersion","v2"]] as const)expect(await ok({...receipt,[k]:val})).toBe(false);
   const other=createInProcessSigner({issuer:"demo:integrity-service",keyId:"demo-signer",privateKey:generateKeyPairSync("ed25519").privateKey});
   const forged={...receipt!,signature:await other.sign("anything")};expect(await ok(forged)).toBe(false);expect(await ok(receipt,"another passage")).toBe(false);
  }finally{await h.close()}
 });
 test("an existing valid receipt is reused rather than re-signed; it is replaced near expiry or when the evidence changes",async()=>{
  const h=await harness();
  try{
   const a=await h.service.issueReceipt(claimFor("90000001")),b=await h.service.issueReceipt(claimFor("90000001"));
   expect(b.receipt!.id).toBe(a.receipt!.id);expect(h.signs()).toBe(1);
   h.now.t=NOW+11.95*3600_000;
   const c=await h.service.issueReceipt(claimFor("90000001"));
   expect(c.decision.decision==="CLEAR"?c.receipt!.id!==a.receipt!.id:true).toBe(true);
  }finally{await h.close()}
 });
 test("receipts expire at the policy and receipt window limits, and an expired one is no longer accepted",async()=>{
  const h=await harness();
  try{
   const {receipt}=await h.service.issueReceipt(claimFor("90000001")),v=verifierFor(h.now);
   h.now.t=Date.parse(receipt!.expiresAt)+1;
   expect(await v.authorize({receipt,sourceId:"pmid:90000001",sourceVersion:"v1",passage:PASSAGE,requiredActions:USES as never})).toBe(false);
   const near=await harness({policy:policy({windowDays:0.0003})});
   try{const r=await near.service.issueReceipt(claimFor("90000001"));expect(r.receipt).toBeNull();expect(r.decision.decision==="REVIEW"||r.decision.decision==="BLOCK").toBe(true)}finally{await near.close()}
  }finally{await h.close()}
 });
 test("revocation publishes an authority-signed entry and records it in the journal without secrets or passage text",async()=>{
  const h=await harness();
  try{
   const {receipt}=await h.service.issueReceipt(claimFor("90000001"));
   const rev=await h.service.revoke(receipt!.id,"Manual revocation by the policy owner");
   expect(verifyRevocation(rev,signerKeys.publicKey)).toBe(true);
   const lines=(await readFile(join(h.publishDir,"revocations.jsonl"),"utf8")).trim().split("\n");expect(JSON.parse(lines[0]!).receiptId).toBe(receipt!.id);
   const journal=await readFile(join(h.dir,"journal.jsonl"),"utf8");expect(journal).toContain("source_integrity_revocation");expect(journal).not.toContain(PASSAGE);expect(journal).not.toMatch(/PRIVATE KEY/);
  }finally{await h.close()}
 });
 test("re-evaluation revokes receipts after a new retraction, a changed licence, an outage, or a superseded policy, and leaves unchanged ones alone",async()=>{
  const retracted:DemoScenario={...scenario("permissive-cc-by"),epmc:{record:{...(scenario("permissive-cc-by").epmc.record as object),isRetracted:"Y"}},crossref:{...scenario("permissive-cc-by").crossref,updatedBy:[{type:"retraction"}]}};
  const restricted:DemoScenario={...scenario("permissive-cc-by"),epmc:{record:{...(scenario("permissive-cc-by").epmc.record as object),license:null}},crossref:{licence:[{URL:"https://publisher.example/terms","content-version":"vor"}]}};
  const outage:DemoScenario={...scenario("permissive-cc-by"),crossref:{status:503}};
  for(const [label,changed,codes] of [["retraction",retracted,"RETRACTED"],["licence",restricted,"USE_NOT_AUTHORISED"],["outage",outage,"PROVIDER_UNAVAILABLE"]] as const){
   const swap=new Map<string,DemoScenario>(),h=await harness({scenarios:swap});
   try{
    const {receipt}=await h.service.issueReceipt(claimFor("90000001"));
    expect((await h.service.reevaluate()).revoked).toEqual([]);
    swap.set("90000001",changed);h.now.t+=1;
    const re=await h.service.reevaluate();
    expect(re.revoked.map(x=>x.receiptId),label).toEqual([receipt!.id]);expect(re.revoked[0]!.reasonCodes).toContain(codes);
    expect((await h.service.reevaluate()).revoked).toEqual([]);
   }finally{await h.close()}
  }
  const h=await harness();
  try{
   const {receipt}=await h.service.issueReceipt(claimFor("90000001"));
   const v2=createSourceIntegrityService({policy:policy({version:2}),policyAuthorities:authorities,uses:USES,now:()=>h.now.t,signer:createInProcessSigner({issuer:"demo:integrity-service",keyId:"demo-signer",privateKey:signerKeys.privateKey}),publisher:h.publisher,store:h.store,evidence:ref=>evidenceFor(DEMO_SCENARIOS.find(x=>x.ref.pmid===ref.pmid)!)});
   const re=await v2.reevaluate();expect(re.revoked.map(x=>x.receiptId)).toEqual([receipt!.id]);expect(re.revoked[0]!.reasonCodes).toEqual(["POLICY_SUPERSEDED"]);
  }finally{await h.close()}
 });
});

describe("10. the clearance decision gates the retrieval path and model processing",()=>{
 async function chain(h:Awaited<ReturnType<typeof harness>>){
  const fa=await createFileSourceAuthority({publishDir:h.publishDir,policyRef:"unused"});
  const verifier=createSourceClearanceVerifier({authorities:[{issuer:"demo:integrity-service",keyId:"demo-signer",publicKey:signerKeys.publicKey}],isRevoked:async(id,issuer)=>fa.isRevoked(id,issuer),requiredActions:["storage"],now:()=>h.now.t});
  return createOperationalSourceClearance({authority:h.service.authority,verifier,store:h.store,now:()=>h.now.t});
 }
 const xml=(p:string)=>`<article><body><sec><title>Results</title><p>${p}</p></sec></body></article>`;
 const target:ContextAuditTarget={investigationId:"integrity-chain",diseaseScope:"gut-immune-metabolic",question:"How might gut microbial metabolites influence immune signalling?",release:{id:"r",version:"1",manifestHash:sha("r")}};
 const P1="In a synthetic study, gut microbial metabolites were associated with immune signalling in colonic cells (flow cytometry, n=10).";
 const network=(pmcid:string,text:string):typeof fetch=>(async(u:unknown)=>String(u).includes("/search?")?new Response(JSON.stringify({resultList:{result:[{pmcid,isOpenAccess:"Y",title:"Synthetic",pmid:"9"+pmcid.slice(3),doi:"10.9/x"}]}})):new Response(xml(text),{status:200,headers:{"content-type":"application/xml"}})) as never;
 test("live search yields a hit only for a source the integrity service cleared; REVIEW, BLOCK, an unapproved policy and a revocation yield none",async()=>{
  // map the Europe PMC id used by live search onto a synthetic scenario record
  for(const [id,expectHit] of [["permissive-cc-by",true],["restricted-publisher",false],["retracted",false],["noncommercial",false],["missing-licence",false]] as const){
   const s=scenario(id),h=await harness({scenarios:new Map([["x",s]])});
   // route the live-search source id (europepmc:PMC…) to this scenario by pmcid
   const svc=createSourceIntegrityService({policy:policy(),policyAuthorities:authorities,uses:["storage","display","comparison","export"],now:()=>h.now.t,signer:createInProcessSigner({issuer:"demo:integrity-service",keyId:"demo-signer",privateKey:signerKeys.privateKey}),publisher:h.publisher,store:h.store,evidence:ref=>resolveSourceEvidence({pmid:s.ref.pmid},{fetcher:demoFetcher(s),now:()=>new Date(h.now.t)})});
   try{
    const op=createOperationalSourceClearance({authority:svc.authority,verifier:createSourceClearanceVerifier({authorities:[{issuer:"demo:integrity-service",keyId:"demo-signer",publicKey:signerKeys.publicKey}],isRevoked:async()=>false,requiredActions:["storage"],now:()=>h.now.t}),store:h.store,now:()=>h.now.t});
    const search=createLiveSearch({fetcher:network(String((s.epmc.record as {pmcid:string}).pmcid),P1),clearance:{decide:b=>op.decide(b)},sleep:async()=>{},now:()=>new Date(h.now.t).toISOString()});
    const out=await search(target,"support");
    expect(out.hits.length>0,id).toBe(expectHit);if(!expectHit)expect(out.status).toBe("partial");
   }finally{await h.close()}
  }
 });
 test("model transmission needs a receipt that permits it: a CC BY source passes the provider gate, a non-commercial source never does",async()=>{
  const result={verdict:"supports",evidenceSpan:"Synthetic passage",reason:"stated"};
  const response=()=>Response.json({id:"resp_fixture",model:"fixture-model-a",status:"completed",usage:{input_tokens:10,output_tokens:10},output:[{type:"message",status:"completed",content:[{type:"output_text",text:JSON.stringify(result)}]}]},{headers:{"x-request-id":"req_fixture"}});
  const text="Synthetic passage for the provider gate.";
  for(const [id,allowed] of [["permissive-cc-by",true],["noncommercial",false]] as const){
   const s=scenario(id),h=await harness({scenarios:new Map([[s.ref.pmid!,s]])}),op=await chain(h);
   try{
    const deployment:StagingDeployment={id:"fixture-openai",config:{providerId:"openai",modelId:"fixture-model-a",endpoint:"https://api.openai.com/v1/responses",timeoutMs:1000,maxResponseBytes:4096},termsRef:"fixture-terms",sourcePolicyRef:"demo-policy:v1",maxOutputTokens:64,inputUnitPrice:1,outputUnitPrice:1,budgetUnits:1_000_000};
    let sent=0;
    const ops=createStagingProviderOperations({enabled:true,deployments:[deployment],store:h.store,sources:op,approve:async()=>true,credential:()=>"TEST_ONLY_SECRET",transportFactory:encode=>async(c,p)=>{sent++;encode(c,p);return response()}});
    const run=()=>ops.run({deploymentId:"fixture-openai",source:{receipt:null,sourceId:"pmid:"+s.ref.pmid,sourceVersion:"v1",passage:text},payload:{instruction:"Return the schema only.",claim:"A relates to B",passage:text}});
    if(allowed){expect((await run()).result.verdict).toBe("supports");expect(sent).toBe(1)}
    else{await expect(run()).rejects.toThrow("Source not cleared");expect(sent).toBe(0)}
   }finally{await h.close()}
  }
 });
 test("a manual revocation sticks: the source is held, nothing is re-issued or cleared until a human releases the hold",async()=>{
  const h=await harness(),op=await chain(h);
  try{
   const b={receipt:null,sourceId:"pmid:90000001",sourceVersion:"v1",passage:PASSAGE,requiredActions:["storage","display"] as const};
   expect((await op.decide(b)).state).toBe("cleared");
   const {receipt}=await h.service.issueReceipt(claimFor("90000001"));await h.service.revoke(receipt!.id,"Revoked by policy owner");
   expect(await (await createFileSourceAuthority({publishDir:h.publishDir,policyRef:"p"})).isRevoked(receipt!.id,"demo:integrity-service")).toBe(true);
   h.now.t+=1;
   const held=await h.service.issueReceipt(claimFor("90000001"));expect(held.receipt).toBeNull();expect(held.decision).toMatchObject({decision:"BLOCK",reasonCodes:["REVOKED"]});
   expect((await op.decide(b)).state).not.toBe("cleared");
   expect((await h.service.authority.lookup({sourceId:"pmid:90000001",sourceVersion:"v1",passageSha256:sha(PASSAGE)},new AbortController().signal)).state).toBe("revoked");
   await expect(h.service.releaseHold({pmid:"90000001"},"short")).rejects.toThrow();
   await h.service.releaseHold({pmid:"90000001"},"Reviewed by the policy owner after a licence check");
   const again=await h.service.issueReceipt(claimFor("90000001"));expect(again.decision.decision).toBe("CLEAR");expect(again.receipt!.id).not.toBe(receipt!.id);
   // automatic re-evaluation revocations do not hold: only decisions that are no longer CLEAR stop issuance
   const journal=await readFile(join(h.dir,"journal.jsonl"),"utf8");expect(journal).toContain("source_integrity_hold_released");expect(journal).not.toContain(PASSAGE);
  }finally{await h.close()}
 });
 test("source identifiers are parsed strictly; anything else is unknown and never cleared",async()=>{
  expect(parseSourceRef("europepmc:PMC123")).toEqual({pmcid:"PMC123"});expect(parseSourceRef("pmid:42")).toEqual({pmid:"42"});expect(parseSourceRef("doi:10.1/x")).toEqual({doi:"10.1/x"});
  for(const bad of ["","europepmc:123","pmid:0","doi:abc","http://x"])expect(parseSourceRef(bad)).toBeNull();
  const h=await harness();
  try{expect((await h.service.authority.lookup({sourceId:"mystery:1",sourceVersion:"v1",passageSha256:sha(PASSAGE)},new AbortController().signal)).state).toBe("unknown")}finally{await h.close()}
 });
});

describe("12. existing gates are preserved; readiness and demonstration",()=>{
 test("readiness lists what humans must still provide and lists only human-held items once the signing adapter exists",()=>{
  const none=assessSourceIntegrityReadiness(undefined,{});expect(none.ready).toBe(false);expect(Object.keys(none.byOwner)).not.toContain("engineering");expect(Object.keys(none.byOwner)).toEqual(expect.arrayContaining(["source-policy owner","security signer"]));
  const full=assessSourceIntegrityReadiness({policyFile:"/etc/hsi/policy.json",policyApprovalRef:"approval:2026-11-13",policyApprover:{issuer:"approver:owner",keyId:"k1",publicKeyEnv:"HSI_POLICY_APPROVER_KEY"},signer:{serviceRef:"kms:key/abc",issuer:"svc",keyId:"k2"},requestedUses:["storage"]},{HSI_POLICY_APPROVER_KEY:"-----pem-----"});
  expect(full.blocking.map(i=>i.id)).toEqual([]);expect(full.ready).toBe(true);expect(JSON.stringify(full)).not.toContain("-----pem-----");
 });
 test("the demonstration labels itself synthetic, runs without a network, and prints the expected decisions",async()=>{
  const p=Bun.spawn(["bun","scripts/assess-source.ts","--json"],{cwd:join(import.meta.dir,".."),stdout:"pipe",stderr:"pipe"});
  const out=JSON.parse(await new Response(p.stdout).text()) as {notice:string;results:{scenario:string;decision?:string;reasonCodes?:string[]}[]};await p.exited;
  expect(out.notice).toBe(DEMO_NOTICE);expect(p.exitCode).toBe(0);
  const by=Object.fromEntries(out.results.map(r=>[r.scenario,r]));
  expect(by["permissive-cc-by"]!.decision).toBe("CLEAR");expect(by["retracted"]!.decision).toBe("BLOCK");expect(by["policy-not-approved"]!.reasonCodes).toEqual(["POLICY_NOT_AUTHORISED"]);
  expect((by["re-evaluation-after-retraction"] as unknown as {revoked:unknown[]}).revoked).toHaveLength(1);
  const bad=Bun.spawn(["bun","scripts/assess-source.ts","--scenario","nope"],{cwd:join(import.meta.dir,".."),stdout:"pipe",stderr:"pipe"});await bad.exited;expect(bad.exitCode).toBe(2);
 });
});
