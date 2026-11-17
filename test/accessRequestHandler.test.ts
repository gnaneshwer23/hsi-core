import {beforeEach,describe,expect,test} from "bun:test";
import {accessRequestDeliveryConfigured,handleAccessRequest,resetAccessRequestLimiter} from "../src/server/accessRequestHandler";

beforeEach(()=>resetAccessRequestLimiter());

const post=(b:unknown,h:Record<string,string>={})=>new Request("https://hsi.example/api/access-requests",{method:"POST",headers:{"content-type":"application/json",origin:"https://hsi.example",...h},body:JSON.stringify(b)});
const Q="How might cytokine signalling vary across tissues in research models?";

describe("access request delivery config",()=>{
 test("requires a valid https webhook or a valid resend recipient",()=>{
  expect(accessRequestDeliveryConfigured({})).toBe(false);
  expect(accessRequestDeliveryConfigured({HSI_ACCESS_REQUEST_WEBHOOK_URL:"http://insecure.example"})).toBe(false);
  expect(accessRequestDeliveryConfigured({HSI_ACCESS_REQUEST_WEBHOOK_URL:"https://not a url"})).toBe(false);
  expect(accessRequestDeliveryConfigured({HSI_ACCESS_REQUEST_WEBHOOK_URL:"https://hooks.example/access"})).toBe(true);
  expect(accessRequestDeliveryConfigured({HSI_ACCESS_REQUEST_TO:"not-an-email",RESEND_API_KEY:"re_test"})).toBe(false);
  expect(accessRequestDeliveryConfigured({HSI_ACCESS_REQUEST_TO:"owner@example.com",RESEND_API_KEY:"re_test"})).toBe(true);
  expect(accessRequestDeliveryConfigured({HSI_ACCESS_REQUEST_TO:"owner@example.com",RESEND_API_KEY:"",HSI_ACCESS_REQUEST_RESEND_API_KEY:"re_alias"})).toBe(true);
 });
});

describe("access request handler",()=>{
 test("GET reports whether delivery is configured",async()=>{
  expect(await (await handleAccessRequest(new Request("https://hsi.example/api/access-requests"),{})).json()).toMatchObject({deliveryConfigured:false});
  expect(await (await handleAccessRequest(new Request("https://hsi.example/api/access-requests"),{HSI_ACCESS_REQUEST_WEBHOOK_URL:"https://hooks.example/x"})).json()).toMatchObject({deliveryConfigured:true});
 });

 test("fails closed when delivery is not configured and never claims sent",async()=>{
  const r=await handleAccessRequest(post({question:Q}),{HSI_PUBLIC_ORIGIN:"https://hsi.example"});
  expect(r.status).toBe(503);
  expect(await r.json()).toMatchObject({code:"ACCESS_REQUEST_NOT_CONFIGURED"});
 });

 test("delivers via webhook and rejects foreign origin / PHI-shaped questions",async()=>{
  const bodies:string[]=[];
  const fetcher=(async(_u:any,init:any)=>{bodies.push(String(init.body));return new Response(null,{status:200})}) as any;
  const env={HSI_PUBLIC_ORIGIN:"https://hsi.example",HSI_ACCESS_REQUEST_WEBHOOK_URL:"https://hooks.example/access",HSI_ACCESS_REQUEST_WEBHOOK_TOKEN:"secret"};
  expect((await handleAccessRequest(post({question:Q},{origin:"https://evil.example"}),env,{fetcher})).status).toBe(403);
  expect((await handleAccessRequest(post({question:"Patient NHS number 943 476 5919 needs access"}),env,{fetcher})).status).toBe(400);
  expect((await handleAccessRequest(post({question:Q,domain:"contains NHS number 123"}),env,{fetcher})).status).toBe(400);
  const ok=await handleAccessRequest(post({question:Q,email:"r@example.com",domain:"immune"}),env,{fetcher});
  expect(ok.status).toBe(200);expect(await ok.json()).toMatchObject({providerAccepted:true,delivered:true});
  expect(bodies[0]).toContain(Q);expect(bodies[0]).not.toContain("secret");
 });

 test("honeypot accepts without calling the provider",async()=>{
  let calls=0;const fetcher=(async()=>{calls++;return new Response(null,{status:200})}) as any;
  const r=await handleAccessRequest(post({question:Q,company_website:"https://spam.example"}),{HSI_PUBLIC_ORIGIN:"https://hsi.example",HSI_ACCESS_REQUEST_WEBHOOK_URL:"https://hooks.example/x"},{fetcher});
  expect(r.status).toBe(202);expect(calls).toBe(0);
 });

 test("rejects oversized bodies before provider work",async()=>{
  let calls=0;const fetcher=(async()=>{calls++;return new Response(null,{status:200})}) as any;
  const huge=new Request("https://hsi.example/api/access-requests",{
   method:"POST",
   headers:{"content-type":"application/json",origin:"https://hsi.example","content-length":"4001"},
   body:"x".repeat(4001),
  });
  expect((await handleAccessRequest(huge,{HSI_PUBLIC_ORIGIN:"https://hsi.example",HSI_ACCESS_REQUEST_WEBHOOK_URL:"https://hooks.example/x"},{fetcher})).status).toBe(413);
  expect(calls).toBe(0);
 });

 test("uses the non-empty Resend alias when the primary key is blank",async()=>{
  let auth="";
  const fetcher=(async(_u:any,init:any)=>{auth=String(init.headers.authorization);return new Response(null,{status:200})}) as any;
  const env={HSI_PUBLIC_ORIGIN:"https://hsi.example",HSI_ACCESS_REQUEST_TO:"owner@example.com",RESEND_API_KEY:"",HSI_ACCESS_REQUEST_RESEND_API_KEY:"re_alias"};
  const r=await handleAccessRequest(post({question:Q}),env,{fetcher});
  expect(r.status).toBe(200);expect(auth).toBe("Bearer re_alias");
 });

 test("dedupes identical retries within the hour",async()=>{
  let calls=0;const fetcher=(async()=>{calls++;return new Response(null,{status:200})}) as any;
  const env={HSI_PUBLIC_ORIGIN:"https://hsi.example",HSI_ACCESS_REQUEST_WEBHOOK_URL:"https://hooks.example/x"};
  expect((await handleAccessRequest(post({question:Q}),env,{fetcher})).status).toBe(200);
  const again=await handleAccessRequest(post({question:Q}),env,{fetcher});
  expect(again.status).toBe(200);
  expect(await again.json()).toMatchObject({providerAccepted:true});
  expect(calls).toBe(1);
 });
});
