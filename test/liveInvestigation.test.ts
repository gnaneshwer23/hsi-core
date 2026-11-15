import {describe,expect,test} from "bun:test";
import {BudgetExceeded,createAnthropicRunner,createBudget,createOpenAiRunner,providerStatus} from "../src/modelProviders";
import {searchEuropePmc,searchOpenAlex} from "../src/evidence/liveSources";
import {renderLiveBriefMarkdown,runLiveInvestigation} from "../src/investigation/liveRun";
import {LIVE_SCENARIOS} from "../src/investigation/scenarios";
import {handleLiveInvestigation,resetLiveInvestigationLimiter} from "../src/server/liveInvestigationHandler";

const SENT="Serum IL-21 was increased in patients with systemic sclerosis and promoted T follicular helper cell expansion.";
const epmc={resultList:{result:[{id:"111",source:"MED",pmid:"111",doi:"10.1/abc",title:"IL-21 in systemic sclerosis",abstractText:"<p>"+SENT+"</p>",firstPublicationDate:"2020-01-02",pubTypeList:{pubType:["Journal Article"]}}]}};
const oa={results:[{id:"https://openalex.org/W1",doi:"https://doi.org/10.1/abc",title:"IL-21 in systemic sclerosis",publication_date:"2020-01-02",ids:{pmid:"https://pubmed.ncbi.nlm.nih.gov/111"},is_retracted:false,abstract_inverted_index:{"IL-21":[0],"matters":[1]},type:"article"}]};
const ot={data:{disease:{id:"X",name:"systemic scleroderma",associatedTargets:{rows:[{target:{id:"ENSG1",approvedSymbol:"IL21R"},score:0.4}]}}}};
const ok=(b:unknown)=>new Response(JSON.stringify(b),{status:200});
function fakeFetch(opts:{oaFails?:boolean}={}){
 const calls:string[]=[];
 const f=(async(u:any)=>{const url=String(u);calls.push(url);
  if(url.includes("europepmc"))return ok(epmc);
  if(url.includes("openalex"))return opts.oaFails?new Response("no",{status:500}):ok(oa);
  if(url.includes("opentargets"))return ok(ot);
  return new Response("?",{status:404});}) as any;
 return {f,calls};
}
const now=()=>"2026-11-15T10:00:00.000Z";
const slot=(id:string,verdict:string)=>({verifierId:id,modelId:id+"-model",runner:async()=>({verdict,reason:"r",evidenceSpan:verdict==="insufficient"?null:SENT.slice(0,20)})});

describe("model providers",()=>{
 test("unset keys report not configured and constructing a runner throws",()=>{
  const s=providerStatus({});expect(s.every(x=>!x.configured)).toBe(true);
  expect(()=>createOpenAiRunner({env:{},budget:createBudget()})).toThrow("not configured");
  expect(providerStatus({OPENAI_API_KEY:"k"})[0]!.reason).toContain("HSI_OPENAI_MODEL");
 });
 test("openai runner keeps the key out of the body, parses JSON, records usage and retries 429",async()=>{
  let n=0,seen:any;
  const f=(async(_u:any,init:any)=>{n++;seen=init;return n===1?new Response("",{status:429}):ok({choices:[{message:{content:'```json\n{"verdict":"supports","reason":"r","evidenceSpan":null}\n```'}}],usage:{prompt_tokens:10,completion_tokens:5}})}) as any;
  const budget=createBudget({maxCalls:2,maxInputChars:5000,maxOutputTokens:50,usdPer1kInput:1,usdPer1kOutput:2});
  const r=createOpenAiRunner({env:{OPENAI_API_KEY:"sk-secret",HSI_OPENAI_MODEL:"m1"},budget,fetcher:f,sleeper:async()=>{}});
  const out:any=await r({instruction:"I",claim:"c",passage:"p"});
  expect(out.verdict).toBe("supports");expect(n).toBe(2);
  expect(String(seen.body)).not.toContain("sk-secret");expect(budget.usage().usd).toBeCloseTo(0.02);
 });
 test("anthropic runner uses the messages API and budgets refuse extra calls",async()=>{
  let url="";
  const f=(async(u:any)=>{url=String(u);return ok({content:[{type:"text",text:'{"verdict":"insufficient","reason":"r","evidenceSpan":null}'}],usage:{input_tokens:3,output_tokens:2}})}) as any;
  const budget=createBudget({maxCalls:1,maxInputChars:5000,maxOutputTokens:50});
  const r=createAnthropicRunner({env:{ANTHROPIC_API_KEY:"k",HSI_ANTHROPIC_MODEL:"m2"},budget,fetcher:f,sleeper:async()=>{}});
  await r({instruction:"I",claim:"c",passage:"p"});expect(url).toContain("anthropic.com");
  await expect(r({instruction:"I",claim:"c",passage:"p"})).rejects.toBeInstanceOf(BudgetExceeded);
  expect(budget.usage().usd).toBeNull();
 });
});

describe("live sources",()=>{
 test("Europe PMC and OpenAlex keep provenance and never claim verification",async()=>{
  const {f}=fakeFetch();
  const [a]=await searchEuropePmc('"IL-21"',5,f,now);const [b]=await searchOpenAlex("IL-21",5,f,now);
  expect(a!.abstract).toBe(SENT);expect(a!.doi).toBe("10.1/abc");expect(a!.retraction).toBe("not_flagged_by_provider");
  expect(b!.pmid).toBe("111");expect(b!.abstract).toBe("IL-21 matters");
  for(const r of [a!,b!]){expect(r.verificationState).toBe("metadata_retrieved_not_claim_verified");expect(r.licenceStatus).toBe("not_assessed");expect(r.retrievedAt).toBe(now())}
 });
 test("a failed provider throws instead of returning an empty list",async()=>{
  const {f}=fakeFetch({oaFails:true});await expect(searchOpenAlex("IL-21",5,f,now)).rejects.toThrow("HTTP 500");
 });
});

describe("live investigation run",()=>{
 const scenario=LIVE_SCENARIOS["il21-autoimmune"]!;
 test("without models: failed searches stay visible, directions stay unassessed, nothing is approved",async()=>{
  const {f}=fakeFetch({oaFails:true});
  const r=await runLiveInvestigation({scenario,fetcher:f,now});
  expect(r.searches.filter(s=>s.provider==="openalex").every(s=>s.status==="failed")).toBe(true);
  expect(r.searches.filter(s=>s.provider==="europe-pmc").every(s=>s.status==="ok")).toBe(true);
  expect(r.records.length).toBe(1);
  const c=r.candidates.find(x=>x.relationId==="il21-tfh")!;
  expect(c.state).toBe("extracted_candidate");expect(c.polarityBasis).toBe("not_assessed");expect(c.polarity).toBe("uncertain");expect(c.verification).toBe("not_run");
  expect(r.verification.status).toBe("not_configured");
  expect(r.flags).toEqual({scientificApproval:false,graphPromotable:false,consensusEstablished:false,humanReview:"required",clinicalAdvice:false,containsPhi:false});
  expect(r.gaps.some(g=>g.includes("Search failed: openalex"))).toBe(true);
  expect(r.gaps.some(g=>g.includes("directions were not assessed"))).toBe(true);
  expect(r.events.map(e=>e.stage)).toEqual(["scoped","searched","retrieved","mapped","compared","challenged","brief"]);
  expect(r.events.find(e=>e.stage==="challenged")!.status).toBe("skipped");
  expect(renderLiveBriefMarkdown(r)).toContain("Candidate-only");
 });
 test("two models: agreement supports, a contradiction is disputed, insufficient abstains",async()=>{
  const {f}=fakeFetch();
  const both=await runLiveInvestigation({scenario,fetcher:f,now,verifiers:[slot("openai","supports"),slot("anthropic","supports")]});
  expect(both.candidates[0]!.verification).toBe("both_support");expect(both.candidates[0]!.polarity).toBe("supporting");
  expect(both.verification.independence).toBe("separate_providers_unverified");
  const dis=await runLiveInvestigation({scenario,fetcher:f,now,verifiers:[slot("openai","supports"),slot("anthropic","contradicts")]});
  expect(dis.candidates[0]!.verification).toBe("disputed");expect(dis.candidates[0]!.polarity).toBe("opposing");
  const abst=await runLiveInvestigation({scenario,fetcher:f,now,verifiers:[slot("openai","insufficient"),slot("anthropic","supports")]});
  expect(both.gaps.some(g=>g.includes("does not establish consensus"))).toBe(true);
  expect(abst.candidates[0]!.verification).toBe("insufficient_abstain");expect(abst.candidates[0]!.polarity).toBe("uncertain");
 });
 test("a model failure is recorded, not hidden",async()=>{
  const {f}=fakeFetch();
  const bad={verifierId:"anthropic",modelId:"m",runner:async()=>{throw Error("boom")}};
  const r=await runLiveInvestigation({scenario,fetcher:f,now,verifiers:[slot("openai","supports"),bad]});
  expect(r.candidates[0]!.verification).toBe("check_failed");expect(r.verification.status).toBe("partial");
 });
 test("PHI-shaped question is refused",async()=>{
  await expect(runLiveInvestigation({scenario:{...scenario,question:"Patient John Smith NHS number 943 476 5919 DOB 01/02/1970"},fetcher:fakeFetch().f,now})).rejects.toThrow();
 });
});

describe("live investigation endpoint",()=>{
 const post=(b:unknown,h:Record<string,string>={})=>new Request("https://x.test/api/research/live-investigation",{method:"POST",headers:{"content-type":"application/json","x-forwarded-for":"1.2.3.4",...h},body:JSON.stringify(b)});
 test("GET lists scenarios and reports the model step off by default; no secrets leak",async()=>{
  const r=await handleLiveInvestigation(new Request("https://x.test/api/research/live-investigation"),{OPENAI_API_KEY:"sk-secret"});
  const t=await r.text();expect(t).toContain("il21-autoimmune");expect(t).not.toContain("sk-secret");
 });
 test("rejects unknown scenarios, free-text prompts, foreign origins and bad content types",async()=>{
  resetLiveInvestigationLimiter();
  expect((await handleLiveInvestigation(post({scenarioId:"nope"}),{})).status).toBe(404);
  expect((await handleLiveInvestigation(post({question:"anything"}),{})).status).toBe(404);
  expect((await handleLiveInvestigation(post({scenarioId:"il21-autoimmune"},{origin:"https://evil.test"}),{HSI_PUBLIC_ORIGIN:"https://x.test"})).status).toBe(403);
  expect((await handleLiveInvestigation(new Request("https://x.test/a",{method:"POST",body:"x"}),{})).status).toBe(415);
 });
 test("runs retrieval-only by default and rate limits",async()=>{
  resetLiveInvestigationLimiter();const {f}=fakeFetch();
  const r=await handleLiveInvestigation(post({scenarioId:"il21-autoimmune"}),{},{fetcher:f});
  const b:any=await r.json();expect(r.status).toBe(200);expect(b.verification.status).toBe("not_configured");expect(b.verification.reason).toContain("disabled");
  for(let i=0;i<4;i++)await handleLiveInvestigation(post({scenarioId:"il21-autoimmune"}),{},{fetcher:f});
  expect((await handleLiveInvestigation(post({scenarioId:"il21-autoimmune"}),{},{fetcher:f})).status).toBe(429);
 });
 test("enabled model step with one provider missing says which",async()=>{
  resetLiveInvestigationLimiter();
  const r=await handleLiveInvestigation(post({scenarioId:"il21-autoimmune"}),{HSI_LIVE_MODEL_STEP_ENABLED:"true",OPENAI_API_KEY:"k",HSI_OPENAI_MODEL:"m"},{fetcher:fakeFetch().f});
  const b:any=await r.json();expect(b.verification.reason).toContain("anthropic");
 });
});
