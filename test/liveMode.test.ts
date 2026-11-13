import {describe,expect,test} from "bun:test";
import {createHash} from "node:crypto";
import {ENGINEERING_GAPS,LIVE_ALLOWED_HOSTS,LIVE_HARD_LIMITS,assessLiveReadiness,renderReadiness,type LiveRunConfig} from "../src/liveReadiness";
import {buildLiveQueries,createAllowlistedFetcher,createLiveAuthorizePassage,createLiveSearch,planLiveRequests,questionTerms,type ClearanceDecider} from "../src/liveSearch";
import {createContextConflictAuditRunner,type ContextAuditTarget,type ContextConflictAudit} from "../src/evidence/contextConflictAudit";
import {buildPassageLinkedContext} from "../src/evidence/passageLinkedContext";
import {createModelEvidenceExtractor} from "../src/evidence/modelEvidenceExtraction";
import {createEntailmentVerifier} from "../src/evidence/entailmentVerifier";
import type {SourceClearanceReceipt} from "../src/researchV2/sourceClearanceReceipt";

const sha=(s:string)=>createHash("sha256").update(s).digest("hex");
const deployment=(id:string,over:Record<string,unknown>={})=>({deploymentId:id,providerId:"anthropic",anthropicVersion:"2023-06-01",modelId:"model-"+id,endpoint:"https://api.anthropic.com/v1/messages",timeoutMs:20000,maxResponseBytes:32768,termsRef:"terms:"+id,sourcePolicyRef:"policy:public-oa-v1",maxOutputTokens:1024,budgetUnits:1000000,credentialEnv:"HSI_TEST_KEY_"+id.toUpperCase(),...over});
const validConfig=():LiveRunConfig=>({
 environment:"isolated_staging",
 sourcePolicy:{ownerRef:"owner:source-policy",termsRef:"terms:europepmc-oa",policyRef:"policy:public-oa-v1",allowedHosts:["www.ebi.ac.uk"]},
 sourceAuthority:{issuer:"authority:independent",keyIds:["key-1"]},
 deploymentApproval:{issuer:"approver:security",keyId:"key-a",publicKeyEnv:"HSI_APPROVAL_PUBLIC_KEY"},
 extractor:deployment("ext") as never,verifiers:[deployment("va"),deployment("vb")] as never,
 limits:{maxArticlesPerIntent:3,maxHitsPerIntent:6,maxModelCallsPerRun:40,maxRunsPerDay:5,killSwitchEnv:"HSI_LIVE_KILL"},
 review:{normalizerReviewRef:"review:normalizer-1",questionReviewRef:"review:question-1",extractionTaskReviewRef:"review:extraction-1"},
 operationStore:{path:"/var/hsi/ops.jsonl"},
});
const env={HSI_APPROVAL_PUBLIC_KEY:"-----pem-----",HSI_TEST_KEY_EXT:"SECRET-VALUE-EXT",HSI_TEST_KEY_VA:"SECRET-VALUE-VA",HSI_TEST_KEY_VB:"SECRET-VALUE-VB"};
const open=(config:unknown,e:Record<string,string|undefined>=env)=>assessLiveReadiness(config,e).blocking.map(i=>i.id);

describe("live readiness gate",()=>{
 test("nothing configured: not ready, every owner listed, never throws",()=>{
  for(const bad of [undefined,null,"x",42,[],{}]){const r=assessLiveReadiness(bad,{});expect(r.ready).toBe(false);expect(r.blocking.length).toBeGreaterThan(5);expect(Object.keys(r.byOwner)).toContain("source-policy owner")}
 });
 test("a fully populated configuration is still NOT ready while engineering gaps remain, and only those remain (the source authority tool and the extraction task now exist)",()=>{
  const r=assessLiveReadiness(validConfig(),env);
  expect(open(validConfig())).toEqual([]);
  expect(r.ready).toBe(true);expect(ENGINEERING_GAPS.sourceAuthorityService.implemented).toBe(true);expect(ENGINEERING_GAPS.extractionTask.implemented).toBe(true);expect(ENGINEERING_GAPS.liveRunPath.implemented).toBe(true);
  expect(r.items.filter(i=>i.heldBy!=="engineering").every(i=>i.status==="met")).toBe(true);
 });
 test("each human-held requirement fails closed when wrong",()=>{
  const mut=(f:(c:any)=>void,e:Record<string,string|undefined>=env)=>{const c=validConfig() as any;f(c);return open(c,e)};
  expect(mut(c=>{c.sourcePolicy.allowedHosts=["www.ebi.ac.uk","evil.example"]})).toContain("source-hosts");
  expect(mut(c=>{c.sourcePolicy.allowedHosts=[]})).toContain("source-hosts");
  expect(mut(c=>{c.sourcePolicy.policyRef="x y z"})).toContain("source-policy-owner");
  expect(mut(c=>{c.environment="production"})).toContain("environment");
  expect(mut(()=>{},{...env,NODE_ENV:"production"})).toContain("environment");
  expect(mut(c=>{c.extractor.endpoint="https://evil.example/v1/messages"})).toContain("extractor-provider");
  expect(mut(c=>{c.extractor.sourcePolicyRef="policy:other"})).toContain("extractor-terms");
  expect(mut(c=>{c.extractor.maxOutputTokens=999999})).toContain("extractor-budget");
  expect(mut(()=>{},{...env,HSI_TEST_KEY_EXT:undefined})).toContain("extractor-credential");
  expect(mut(()=>{},{...env,HSI_APPROVAL_PUBLIC_KEY:undefined})).toContain("deployment-approval-authority");
  expect(mut(c=>{c.verifiers=[deployment("va")]})).toContain("verifiers-independent");
  expect(mut(c=>{c.verifiers=[deployment("va"),deployment("va")]})).toContain("verifiers-independent");
  expect(mut(c=>{c.verifiers=[deployment("ext"),deployment("vb")]})).toContain("verifiers-independent");
  expect(mut(c=>{c.limits.maxHitsPerIntent=LIVE_HARD_LIMITS.maxHitsPerIntent+1})).toContain("limits");
  expect(mut(()=>{},{...env,HSI_LIVE_KILL:"true"})).toContain("limits");
  expect(mut(c=>{delete c.review.questionReviewRef})).toContain("question-review");
  expect(mut(c=>{delete c.review.normalizerReviewRef})).toContain("normalizer-review");
  expect(mut(c=>{delete c.review.extractionTaskReviewRef})).toContain("extraction-task-review");
  expect(mut(c=>{c.operationStore.path=""})).toContain("operation-store");
 });
 test("only the names of environment variables appear in output, never their values",()=>{
  const text=renderReadiness(assessLiveReadiness(validConfig(),env))+JSON.stringify(assessLiveReadiness(validConfig(),env));
  expect(text).not.toContain("SECRET-VALUE");expect(text).not.toContain("-----pem-----");
 });
 test("the host list is the code-reviewed list",()=>{expect([...LIVE_ALLOWED_HOSTS]).toEqual(["www.ebi.ac.uk","reactome.org"])});
});

describe("live search query planning",()=>{
 test("terms keep short key words like gut, drop filler words, and extras never narrow the query",()=>{
  expect(questionTerms("How might gut microbial metabolites influence immune signalling and insulin resistance?")).toEqual(["gut","microbial","metabolites","immune"]);
  const q=buildLiveQueries("How might gut microbial metabolites influence immune signalling?",["Cytokine B","Synthetic metabolic signalling"]);
  expect(q.support).toContain("OPEN_ACCESS:y");expect(q.support).not.toContain("cytokine");expect(q.scoreTerms).toContain("cytokine b");
  expect(q.oppose).toContain('"no association"');expect(()=>buildLiveQueries("How might this?")).toThrow();
 });
 test("the plan states exactly what would be requested and that nothing is sent to a model by search",()=>{
  const plan=planLiveRequests("How might gut microbial metabolites influence immune signalling?",{maxArticlesPerIntent:2});
  expect(plan.requests).toHaveLength(2);expect(plan.maxRequests).toBe(6);expect(plan.transmitsToModels).toBe(false);
  for(const r of plan.requests)expect(new URL(r.url).hostname).toBe("www.ebi.ac.uk");
  expect(()=>planLiveRequests("gut microbial metabolites",{maxArticlesPerIntent:99})).toThrow();
 });
});

describe("allow-listed fetcher",()=>{
 const ok:typeof fetch=(async()=>new Response("{}")) as never;
 test("only https on allowed hosts, with a hard request budget and no redirects",async()=>{
  let init:RequestInit|undefined;const f=createAllowlistedFetcher(async(_u,i)=>{init=i;return new Response("{}")},{maxRequests:2});
  await f.fetch("https://www.ebi.ac.uk/europepmc/webservices/rest/search?q=1");expect(init?.redirect).toBe("error");
  await expect(f.fetch("http://www.ebi.ac.uk/x")).rejects.toThrow();
  await expect(f.fetch("https://evil.example/x")).rejects.toThrow();
  await expect(f.fetch("https://user:pw@www.ebi.ac.uk/x")).rejects.toThrow();
  await f.fetch("https://reactome.org/ContentService/x");await expect(f.fetch("https://www.ebi.ac.uk/x")).rejects.toThrow("budget");
  expect(()=>createAllowlistedFetcher(ok as never,{maxRequests:1,hosts:["evil.example"]})).toThrow();expect(()=>createAllowlistedFetcher(ok as never,{maxRequests:0})).toThrow();
 });
});

const PASS1="In a synthetic mouse cohort, gut microbial metabolites were associated with immune signalling in colonic regulatory T cells after seven days (flow cytometry, n=10).";
const PASS2="In a synthetic human cohort, gut microbial metabolites were not associated with immune signalling in circulating monocytes (ELISA, n=40).";
const xml=(p:string)=>`<article><body><sec><title>Results</title><p>${p}</p></sec></body></article>`;
const searchBody=(pmcids:string[],oa="Y")=>JSON.stringify({resultList:{result:pmcids.map(id=>({pmcid:id,isOpenAccess:oa,title:"Synthetic title "+id,pmid:"1"+id.slice(3),doi:"10.1/"+id}))}});
function network(map:Record<string,string>,log:string[]=[]):typeof fetch{
 return (async(input:unknown)=>{const url=String(input);log.push(url);
  if(url.includes("/search?")){const intent=url.includes("no+association")?"oppose":"support";return new Response(map["search-"+intent]??searchBody([]),{status:200})}
  const id=/rest\/(PMC\d+)\/fullTextXML/.exec(url)?.[1];const body=id?map[id]:undefined;
  return body===undefined?new Response("",{status:404}):new Response(body,{status:200,headers:{"content-type":"application/xml"}});
 }) as never;
}
const receiptFor=(sourceId:string,passage:string,over:Partial<SourceClearanceReceipt>={}):SourceClearanceReceipt=>({schemaVersion:"hsi-source-clearance-1",id:"receipt-"+sha(passage).slice(0,12),issuer:"authority:independent",keyId:"key-1",sourceId,sourceVersion:"v",canonicalId:sourceId,passageSha256:sha(passage),permittedActions:["storage","display","comparison","export"],licenceId:"CC-BY-4.0",attribution:"synthetic",identity:"matched",rights:"verified",retraction:"clear",checkedAt:"2026-11-13T00:00:00Z",expiresAt:"2026-11-14T00:00:00Z",signature:"s",...over});
const clearing=(state="cleared",over:Partial<SourceClearanceReceipt>={}):ClearanceDecider=>({decide:async b=>({state,policyRef:"policy:public-oa-v1",receipt:state==="cleared"?receiptFor(b.sourceId,b.passage,over):null})});
const target:ContextAuditTarget={investigationId:"live-mock",diseaseScope:"gut-immune-metabolic",question:"How might gut microbial metabolites influence immune signalling?",release:{id:"r",version:"1",manifestHash:sha("r")}};
const instant=async()=>{};

describe("live search (mocked network, independent clearance)",()=>{
 const map={"search-support":searchBody(["PMC101"]),"search-oppose":searchBody(["PMC202"]),PMC101:xml(PASS1),PMC202:xml(PASS2)};
 test("a paragraph becomes a hit only when the authority cleared it; licence and receipt come from the receipt",async()=>{
  const log:string[]=[];
  const search=createLiveSearch({fetcher:network(map,log),clearance:clearing(),sleep:instant,now:()=>"2026-11-13T12:00:00Z"});
  const s=await search(target,"support");
  expect(s.status).toBe("completed_bounded");expect(s.hits).toHaveLength(1);
  const hit=s.hits[0]!;expect(hit.source.licence).toEqual({status:"permitted",identifier:"CC-BY-4.0",passageUsePermitted:true});
  expect(hit.clearanceReceiptId).toBe("receipt-"+sha(PASS1).slice(0,12));expect(hit.passage.sha256).toBe(sha(PASS1));
  expect(()=>buildPassageLinkedContext({source:hit.source,passage:hit.passage,clearanceReceiptId:hit.clearanceReceiptId,extractions:{}})).not.toThrow();
  expect(log.every(u=>new URL(u).hostname==="www.ebi.ac.uk")).toBe(true);expect(log.length).toBeLessThanOrEqual(planLiveRequests(target.question).maxRequests);
 });
 test("uncleared, retracted, withdrawn or digest-mismatched passages never become hits and make the search partial",async()=>{
  for(const state of ["unknown","retracted","withdrawn","expired","revoked","identifier_conflict"]){
   const s=await createLiveSearch({fetcher:network(map),clearance:clearing(state),sleep:instant})(target,"support");expect(s.hits).toEqual([]);expect(s.status).toBe("partial");
  }
  const mismatch=await createLiveSearch({fetcher:network(map),clearance:clearing("cleared",{passageSha256:sha("other")}),sleep:instant})(target,"support");expect(mismatch.hits).toEqual([]);
  const narrow=await createLiveSearch({fetcher:network(map),clearance:clearing("cleared",{permittedActions:["display"]}),sleep:instant})(target,"support");expect(narrow.hits).toEqual([]);
  const throwing=await createLiveSearch({fetcher:network(map),clearance:{decide:async()=>{throw Error("authority down")}},sleep:instant})(target,"support");expect(throwing.hits).toEqual([]);expect(throwing.status).toBe("partial");
 });
 test("no open-access results is an explicit empty search; a failed search throws so the engine records provider_unavailable",async()=>{
  const none=await createLiveSearch({fetcher:network({"search-support":searchBody(["PMC9"],"N")}),clearance:clearing(),sleep:instant})(target,"support");
  expect(none.status).toBe("successful_empty");expect(none.hits).toEqual([]);
  const down=(async()=>new Response("",{status:503})) as never;
  await expect(createLiveSearch({fetcher:down,clearance:clearing(),sleep:instant})(target,"support")).rejects.toThrow();
  await expect(createLiveSearch({fetcher:(async()=>new Response("{}",{status:200})) as never,clearance:clearing(),sleep:instant})(target,"support")).rejects.toThrow();
  const aborted=new AbortController();aborted.abort();await expect(createLiveSearch({fetcher:network(map),clearance:clearing(),sleep:instant})(target,"support",aborted.signal)).rejects.toThrow();
 });
 test("a full text that cannot be fetched makes the search partial but keeps other articles",async()=>{
  const s=await createLiveSearch({fetcher:network({"search-support":searchBody(["PMC101","PMC303"]),PMC101:xml(PASS1)}),clearance:clearing(),sleep:instant})(target,"support");
  expect(s.hits).toHaveLength(1);expect(s.status).toBe("partial");
 });
 test("limits are validated and the hit cap is enforced",async()=>{
  expect(()=>createLiveSearch({fetcher:network(map),clearance:clearing(),maxArticlesPerIntent:99})).toThrow();
  const many=searchBody(["PMC101","PMC102"]);const two=await createLiveSearch({fetcher:network({"search-support":many,PMC101:xml(PASS1),PMC102:xml(PASS1+" Second.")}),clearance:clearing(),maxHitsPerIntent:1,sleep:instant})(target,"support");
  expect(two.hits).toHaveLength(1);expect(two.status).toBe("partial");
 });
 test("authorizePassage rechecks the same receipt, digest and every required action",async()=>{
  const s=await createLiveSearch({fetcher:network(map),clearance:clearing(),sleep:instant})(target,"support"),hit=s.hits[0]!;
  const actions=["storage","display","comparison","export"] as const;
  expect(await createLiveAuthorizePassage(clearing())(hit,actions)).toBe(true);
  expect(await createLiveAuthorizePassage(clearing("retracted"))(hit,actions)).toBe(false);
  expect(await createLiveAuthorizePassage(clearing("cleared",{id:"another-receipt"}))(hit,actions)).toBe(false);
  expect(await createLiveAuthorizePassage({decide:async()=>{throw Error("x")}})(hit,actions)).toBe(false);
 });
});

describe("live search inside the real audit runner (mock network, mock models)",()=>{
 test("runs end to end: cleared passages, grounded extraction, entailment, append; nothing leaves the allow-list",async()=>{
  const log:string[]=[],stored:ContextConflictAudit[]=[];
  const map={"search-support":searchBody(["PMC101"]),"search-oppose":searchBody(["PMC202"]),PMC101:xml(PASS1),PMC202:xml(PASS2)};
  const clearance=clearing();
  const quote=(p:string)=>p.slice(0,40);
  const runner=createContextConflictAuditRunner({enabled:true,
   search:createLiveSearch({fetcher:network(map,log),clearance,sleep:instant,now:()=>"2026-11-13T12:00:00Z"}),
   authorizePassage:createLiveAuthorizePassage(clearance),
   extract:createModelEvidenceExtractor({runner:async req=>({claim:{subject:{system:"FIXTURE",value:"gut-metabolites",label:null},predicate:"associated_with",object:{system:"FIXTURE",value:"immune-signalling",label:null},polarity:req.passage===PASS1?"supporting":"opposing",quote:quote(req.passage)},context:{species:{quote:req.passage.includes("mouse")?"mouse":"human"}},note:null})}),
   verify:createEntailmentVerifier({verifiers:["va","vb"].map(id=>({verifierId:id,modelId:"mock-"+id,runner:async req=>({verdict:"supports",evidenceSpan:quote(req.passage),reason:"stated"})}))}),
   append:async a=>{stored.push(structuredClone(a))}});
  const audit=await runner.run(target);
  expect(audit.units).toHaveLength(2);expect(audit.verifier.status).toBe("checked_with_limitations");expect(stored).toHaveLength(1);
  expect(audit.scientificApproval).toBe(false);expect(audit.graphPromotable).toBe(false);expect(audit.humanReview.status).toBe("required");
  for(const u of audit.units){const f=u.detailedContext!.fields.species;expect(f.status).toBe("reported");expect(u.detailedContext!.passageText.slice(f.span!.start,f.span!.end)).toBe(f.originalText!)}
  expect(log.length).toBeGreaterThan(0);expect(log.every(u=>new URL(u).hostname==="www.ebi.ac.uk")).toBe(true);
 });
});
