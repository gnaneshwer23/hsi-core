import {describe,it,expect} from "bun:test";
import {handleInterrogativeApi} from "../src/server/interrogativeApi";
import {handleLiveEvidenceApi,type LiveApiDependencies} from "../src/liveEvidenceApi";
const base="https://hsi.example/api/research/live-investigations";
const cookie="better-auth.session_token="+"x".repeat(32);
const request=(method="GET",body?:unknown,headers:Record<string,string>={})=>new Request(base,{method,headers:{"cookie":cookie,...(body?{"origin":"https://hsi.example","content-type":"application/json"}:{}),...headers},body:body?JSON.stringify(body):undefined});
const deps:LiveApiDependencies={authenticate:async()=>({principalId:"owner-1",roles:["researcher"],authenticated:true}),database:async()=>{throw Error("DB should not be reached")},writesEnabled:false};
describe("A-01 authenticated live evidence API",()=>{
 it("existing research API fails closed until live adapter is explicitly injected",async()=>{
  const result=await handleInterrogativeApi(new Request(base),{} as Parameters<typeof handleInterrogativeApi>[1]);
  expect(result.status).toBe(503);
 });
 it("rejects anonymous requests",async()=>expect((await handleLiveEvidenceApi(new Request(base),deps)).status).toBe(401));
 it("requires verified research authorization",async()=>expect((await handleLiveEvidenceApi(request(),{...deps,authenticate:async()=>({principalId:"owner-1",roles:[],authenticated:true})})).status).toBe(403));
 it("fails closed when staging writes are not enabled",async()=>expect((await handleLiveEvidenceApi(request(),deps)).status).toBe(503));
 it("rejects client-provided identity or evidence",async()=>{
  const enabled={...deps,writesEnabled:true};
  const response=await handleLiveEvidenceApi(request("POST",{question:"How do immune cells interact?",requestId:"11111111-1111-4111-8111-111111111111",ownerId:"attacker"}),enabled);
  expect(response.status).toBe(400);
 });
 it("requires same origin for cookie-authenticated writes",async()=>{
  const response=await handleLiveEvidenceApi(request("POST",{question:"How do immune cells interact?",requestId:"11111111-1111-4111-8111-111111111111"},{"origin":"https://attacker.example"}),{...deps,writesEnabled:true});
  expect(response.status).toBe(403);
 });
});
