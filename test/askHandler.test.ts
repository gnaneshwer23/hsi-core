import {beforeEach,describe,expect,test} from "bun:test";
import {ASK_USER_LIMIT_PER_HOUR,handleAsk,resetAskLimiter} from "../src/server/askHandler";
import {resetLiveInvestigationLimiter} from "../src/server/liveInvestigationHandler";

const ORIGIN="https://hsi.example";
const env={HSI_PUBLIC_ORIGIN:ORIGIN,HSI_AUTH_BASE_URL:"https://auth.example/auth"};
const COOKIE="__Secure-better-auth.session_token=abcdefghijklmnop";
const ask=(q:unknown,o:{cookie?:string|null;origin?:string|null;type?:string}={})=>{
 const h:Record<string,string>={"content-type":o.type??"application/json"};
 if(o.origin!==null)h.origin=o.origin??ORIGIN;if(o.cookie!==null)h.cookie=o.cookie??COOKIE;
 return new Request(ORIGIN+"/api/ask",{method:"POST",headers:h,body:JSON.stringify({question:q})});
};
const session=(over:{verified?:boolean;none?:boolean;down?:boolean;user?:string}={})=>(async()=>{
 if(over.down)return new Response("x",{status:500});
 if(over.none)return new Response("null",{status:401});
 return new Response(JSON.stringify({session:{id:"s1",userId:over.user??"u1",expiresAt:new Date(Date.now()+3_600_000).toISOString()},user:{id:over.user??"u1",email:"a@b.co",emailVerified:over.verified??true}}),{status:200,headers:{"content-type":"application/json"}});
}) as any;
const epmc={resultList:{result:[]}},oa={results:[]},ot={data:{disease:null}};
const fetcher=(async(u:any)=>new Response(JSON.stringify(String(u).includes("europepmc")?epmc:String(u).includes("openalex")?oa:ot),{status:200})) as any;
const IL21="Does IL-21 signalling drive T follicular helper cells in autoimmune disease?";

beforeEach(()=>{resetAskLimiter();resetLiveInvestigationLimiter()});

describe("ask gate",()=>{
 test("fails closed when not configured",async()=>{expect((await handleAsk(ask(IL21),{},{transport:session()})).status).toBe(503)});
 test("rejects wrong or missing origin before any auth call",async()=>{
  let called=false;const t=(async()=>{called=true;return session()()}) as any;
  expect((await handleAsk(ask(IL21,{origin:"https://evil.example"}),env,{transport:t})).status).toBe(403);
  expect((await handleAsk(ask(IL21,{origin:null}),env,{transport:t})).status).toBe(403);
  expect(called).toBe(false);
 });
 test("rejects non-JSON, oversize, bad JSON and bad question lengths",async()=>{
  expect((await handleAsk(ask(IL21,{type:"text/plain"}),env,{transport:session()})).status).toBe(415);
  expect((await handleAsk(ask("x".repeat(600)),env,{transport:session()})).status).toBe(400);
  expect((await handleAsk(ask("short"),env,{transport:session()})).status).toBe(400);
  expect((await handleAsk(ask(42),env,{transport:session()})).status).toBe(400);
 });
 test("no cookie, no session, unverified email, provider down",async()=>{
  expect((await handleAsk(ask(IL21,{cookie:null}),env,{transport:session()})).status).toBe(401);
  expect((await handleAsk(ask(IL21),env,{transport:session({none:true})})).status).toBe(401);
  expect((await handleAsk(ask(IL21),env,{transport:session({verified:false})})).status).toBe(403);
  expect((await handleAsk(ask(IL21),env,{transport:session({down:true})})).status).toBe(503);
 });
 test("a client-supplied user id or role is ignored",async()=>{
  const req=new Request(ORIGIN+"/api/ask",{method:"POST",headers:{"content-type":"application/json",origin:ORIGIN,cookie:COOKIE},body:JSON.stringify({question:IL21,userId:"admin",roles:["research_admin"]})});
  expect((await handleAsk(req,env,{transport:session({none:true})})).status).toBe(401);
 });
});

describe("ask routing",()=>{
 test("unroutable question runs nothing and costs no quota",async()=>{
  for(let i=0;i<ASK_USER_LIMIT_PER_HOUR+3;i++){
   const r=await handleAsk(ask("What is the capital of France today?"),env,{transport:session(),fetcher});
   const b:any=await r.json();expect(r.status).toBe(200);expect(b.routed).toBe(false);expect(b.available.length).toBeGreaterThan(0);
  }
 });
 test("a curated question routes, runs and returns a trace",async()=>{
  const r=await handleAsk(ask(IL21),env,{transport:session(),fetcher});const b:any=await r.json();
  expect(r.status).toBe(200);expect(b.routed).toBe(true);expect(b.scenarioId).toBe("il21-autoimmune");
  expect(b.trace.modelCheck).toBe("not_configured");expect(b.trace.sources).toContain("OpenAlex");expect(b.result).toBeDefined();
 });
 test("per-user hourly limit applies per user",async()=>{
  const env2={...env};let now=1_000_000;
  // The live handler also limits per IP (5 per 10 minutes), so vary the IP and keep the clock moving.
  const run=async(user:string,i:number)=>{resetLiveInvestigationLimiter();return handleAsk(new Request(ORIGIN+"/api/ask",{method:"POST",headers:{"content-type":"application/json",origin:ORIGIN,cookie:COOKIE,"x-forwarded-for":"10.0.0."+i},body:JSON.stringify({question:IL21})}),env2,{transport:session({user}),fetcher,now:()=>now})};
  for(let i=0;i<ASK_USER_LIMIT_PER_HOUR;i++)expect((await run("u1",i)).status).toBe(200);
  expect((await run("u1",99)).status).toBe(429);
  expect((await run("u2",100)).status).toBe(200);
  now+=3_700_000;expect((await run("u1",101)).status).toBe(200);
 });
});
