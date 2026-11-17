import {beforeEach,describe,expect,test} from "bun:test";
import {accessRequestDeliveryConfigured,handleAccessRequest,resetAccessRequestLimiter} from "../src/server/accessRequestHandler";

beforeEach(()=>resetAccessRequestLimiter());

const post=(b:unknown,h:Record<string,string>={})=>new Request("https://hsi.example/api/access-requests",{method:"POST",headers:{"content-type":"application/json",origin:"https://hsi.example",...h},body:JSON.stringify(b)});
const Q="How might cytokine signalling vary across tissues in research models?";

describe("access request delivery config",()=>{
 test("requires webhook https or resend+to",()=>{
  expect(accessRequestDeliveryConfigured({})).toBe(false);
  expect(accessRequestDeliveryConfigured({HSI_ACCESS_REQUEST_WEBHOOK_URL:"http://insecure.example"})).toBe(false);
  expect(accessRequestDeliveryConfigured({HSI_ACCESS_REQUEST_WEBHOOK_URL:"https://hooks.example/access"})).toBe(true);
  expect(accessRequestDeliveryConfigured({HSI_ACCESS_REQUEST_TO:"owner@example.com",RESEND_API_KEY:"re_test"})).toBe(true);
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
  const ok=await handleAccessRequest(post({question:Q,email:"r@example.com",domain:"immune"}),env,{fetcher});
  expect(ok.status).toBe(200);expect(await ok.json()).toMatchObject({delivered:true});
  expect(bodies[0]).toContain(Q);expect(bodies[0]).not.toContain("secret");
 });

 test("honeypot accepts without calling the provider",async()=>{
  let calls=0;const fetcher=(async()=>{calls++;return new Response(null,{status:200})}) as any;
  const r=await handleAccessRequest(post({question:Q,company_website:"https://spam.example"}),{HSI_PUBLIC_ORIGIN:"https://hsi.example",HSI_ACCESS_REQUEST_WEBHOOK_URL:"https://hooks.example/x"},{fetcher});
  expect(r.status).toBe(202);expect(calls).toBe(0);
 });
});
