/**
 * A1.1 / SEC-01: Ask and live-investigation share research_write process/shared admission.
 * Per-user and per-IP Maps remain safety nets; Redis/Postgres (D-111) is deferred.
 */
import {beforeEach,describe,expect,test} from "bun:test";
import {handleAsk,resetAskLimiter} from "../src/server/askHandler";
import {handleLiveInvestigation,resetLiveInvestigationLimiter} from "../src/server/liveInvestigationHandler";
import {createResearchProcessAdmission,researchRouteGroup,type ResearchOperationalEvent} from "../src/server/researchRequestControls";
import {handleVercelResearch} from "../src/server/vercelResearch";

const ORIGIN="https://hsi.example";
const env={HSI_PUBLIC_ORIGIN:ORIGIN,HSI_AUTH_BASE_URL:"https://auth.example/auth"};
const COOKIE="__Secure-better-auth.session_token=abcdefghijklmnop";
const IL21="Does IL-21 signalling drive T follicular helper cells in autoimmune disease?";
const epmc={resultList:{result:[]}},oa={results:[]},ot={data:{disease:null}};
const fetcher=(async(u:any)=>new Response(JSON.stringify(String(u).includes("europepmc")?epmc:String(u).includes("openalex")?oa:ot),{status:200})) as any;
const session=()=>(async()=>new Response(JSON.stringify({session:{id:"s1",userId:"u1",expiresAt:new Date(Date.now()+3_600_000).toISOString()},user:{id:"u1",email:"a@b.co",emailVerified:true}}),{status:200,headers:{"content-type":"application/json"}})) as any;
const askReq=()=>new Request(ORIGIN+"/api/ask",{method:"POST",headers:{"content-type":"application/json",origin:ORIGIN,cookie:COOKIE,"x-forwarded-for":"10.0.0.1"},body:JSON.stringify({question:IL21})});
const liveReq=(ip="10.0.0.2")=>new Request(ORIGIN+"/api/research/live-investigation",{method:"POST",headers:{"content-type":"application/json","x-forwarded-for":ip},body:JSON.stringify({scenarioId:"il21-autoimmune"})});

beforeEach(()=>{resetAskLimiter();resetLiveInvestigationLimiter()});

describe("researchRouteGroup classification",()=>{
 test("Ask and live-investigation POST share research_write; live GET is research_read",()=>{
  expect(researchRouteGroup(askReq())).toBe("research_write");
  expect(researchRouteGroup(liveReq())).toBe("research_write");
  expect(researchRouteGroup(new Request(ORIGIN+"/api/research/live-investigation"))).toBe("research_read");
  expect(researchRouteGroup(new Request(ORIGIN+"/api/research/account"))).toBe("research_read");
 });
});

describe("cross-route process budget",()=>{
 test("Ask burst exhausts research_write before a live-investigation POST",async()=>{
  const admission=createResearchProcessAdmission({budgets:{research_write:2},windowMs:60_000});
  const controls={processAdmission:admission,emit:()=>{}};
  expect((await handleAsk(askReq(),env,{transport:session(),fetcher,controls})).status).toBe(200);
  expect((await handleAsk(askReq(),env,{transport:session(),fetcher,controls})).status).toBe(200);
  const denied=await handleLiveInvestigation(liveReq(),{},{fetcher,controls});
  expect(denied.status).toBe(429);
  expect(denied.headers.get("retry-after")).toBeTruthy();
  expect(denied.headers.get("x-request-id")).toMatch(/^[a-f0-9-]{36}$/);
 });

 test("live-investigation burst blocks Ask on the same research_write budget",async()=>{
  const admission=createResearchProcessAdmission({budgets:{research_write:2},windowMs:60_000});
  const controls={processAdmission:admission,emit:()=>{}};
  expect((await handleLiveInvestigation(liveReq("10.0.1.1"),{},{fetcher,controls})).status).toBe(200);
  expect((await handleLiveInvestigation(liveReq("10.0.1.2"),{},{fetcher,controls})).status).toBe(200);
  let authCalls=0;
  const transport=(async()=>{authCalls++;return session()()}) as any;
  const denied=await handleAsk(askReq(),env,{transport,fetcher,controls});
  expect(denied.status).toBe(429);
  expect(authCalls).toBe(0);
 });

 test("Ask, live-investigation and research account writes share one research_write bucket",async()=>{
  const admission=createResearchProcessAdmission({budgets:{research_write:2,research_read:10_000},windowMs:60_000});
  const controls={processAdmission:admission,emit:()=>{}};
  expect((await handleAsk(askReq(),env,{transport:session(),fetcher,controls})).status).toBe(200);
  expect((await handleLiveInvestigation(liveReq("10.0.2.1"),{},{fetcher,controls})).status).toBe(200);
  const research=await handleVercelResearch(new Request(ORIGIN+"/api/research/account",{method:"POST"}),{
   HSI_PUBLIC_ORIGIN:ORIGIN,
   HSI_AUTH_BASE_URL:"https://auth.example/neondb/auth",
   VITE_HSI_AUTH_BASE_URL:"https://auth.example/neondb/auth",
   HSI_DATABASE_URL:"postgresql://fixture:unused@ep-hsi-staging.c-2.eu-west-2.aws.neon.tech/neondb",
   HSI_NEON_PROJECT_ID:"hsi-neon-project",
  },{controls});
  expect(research.status).toBe(429);
 });
});

describe("shared admission fail-closed",()=>{
 test("requireShared without adapter returns 503 before Ask or live work",async()=>{
  const admission=createResearchProcessAdmission({budgets:{research_write:10_000}});
  let authCalls=0,fetchCalls=0;
  const transport=(async()=>{authCalls++;return session()()}) as any;
  const countingFetcher=(async(u:any)=>{fetchCalls++;return fetcher(u)}) as any;
  const askDenied=await handleAsk(askReq(),{...env,HSI_PILOT_REQUIRE_SHARED_LIMITER:"true"},{transport,fetcher:countingFetcher,controls:{processAdmission:admission}});
  expect(askDenied.status).toBe(503);
  expect(authCalls).toBe(0);expect(fetchCalls).toBe(0);
  const liveDenied=await handleLiveInvestigation(liveReq(),{HSI_PILOT_REQUIRE_SHARED_LIMITER:"true"},{fetcher:countingFetcher,controls:{processAdmission:admission}});
  expect(liveDenied.status).toBe(503);expect(fetchCalls).toBe(0);
 });

 test("shared admission denial rate-limits Ask before auth",async()=>{
  const admission=createResearchProcessAdmission({budgets:{research_write:10_000}});
  let authCalls=0;
  const transport=(async()=>{authCalls++;return session()()}) as any;
  const events:ResearchOperationalEvent[]=[];
  const denied=await handleAsk(askReq(),env,{transport,fetcher,controls:{
   processAdmission:admission,
   sharedAdmission:async()=>({allowed:false,retryAfterSeconds:17}),
   emit:e=>events.push(e),
  }});
  expect(denied.status).toBe(429);
  expect(denied.headers.get("retry-after")).toBe("17");
  expect(authCalls).toBe(0);
  expect(events[0]).toMatchObject({routeGroup:"research_write",admission:"rate_limited",limiterScope:"shared_and_process"});
 });
});
