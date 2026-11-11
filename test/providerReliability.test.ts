import {describe,it,expect} from "bun:test";
import {createProviderRunner,validateProviderConfig,type ProviderConfig} from "../src/researchV2/providerReliability";
const config:ProviderConfig={providerId:"openai",modelId:"test-deployment",endpoint:"https://api.openai.com/v1/responses",timeoutMs:1000,maxResponseBytes:256};
const payload={instruction:"Verify",claim:"A is associated with B",passage:"Synthetic evidence only."};
describe("provider execution boundary",()=>{
 it("rejects private IPv4/IPv6, arbitrary hosts, URL tricks and provider mismatches",()=>{
  for(const endpoint of ["https://172.16.0.1/v1","https://[::1]/v1","https://[fc00::1]/v1","https://169.254.169.254/","https://127.1/","https://2130706433/","https://example.org/v1","https://api.openai.com.evil.test/v1/responses","https://api.openai.com/v1/responses?url=x","https://user@api.openai.com/v1/responses","https://api.openai.com/v1/../v1/responses"]){expect(()=>validateProviderConfig({...config,endpoint})).toThrow();}
  expect(()=>validateProviderConfig({...config,providerId:"anthropic"})).toThrow();
 });
 it("passes explicit redirect denial and a deadline signal and snapshots config",async()=>{
  const mutable={...config};const runner=createProviderRunner(mutable,async(c,p,options)=>{
   expect(c.endpoint).toBe(config.endpoint);expect(p).toEqual(payload);expect(options.redirect).toBe("error");expect(options.signal.aborted).toBe(false);
   return Response.json({verdict:"insufficient"});
  });mutable.endpoint="https://[::1]/";expect(await runner(payload)).toEqual({verdict:"insufficient"});
 });
 it("cancels oversized streamed bodies even with missing or false content length",async()=>{
  for(const headers of [new Headers({"content-type":"application/json"}),new Headers({"content-type":"application/json","content-length":"1"})]){
   let cancelled=false;const runner=createProviderRunner(config,async()=>new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array(257));},cancel(){cancelled=true}}),{headers}));
   await expect(runner(payload)).rejects.toThrow("byte limit");expect(cancelled).toBe(true);
  }
 });
 it("rejects redirect, HTTP errors, non-JSON, malformed JSON and non-object JSON",async()=>{
  for(const response of [new Response(null,{status:302,headers:{location:"https://127.0.0.1/"}}),new Response(null,{status:429}),new Response("{}"),new Response("bad",{headers:{"content-type":"application/json"}}),Response.json([])]){
   await expect(createProviderRunner(config,async()=>response)(payload)).rejects.toThrow();
  }
 });
 it("times out even if the injected transport ignores cancellation",async()=>{
  let signal:AbortSignal|undefined;
  const runner=createProviderRunner(config,async(_c,_p,options)=>{signal=options.signal;return new Promise<Response>(()=>{});});
  await expect(runner(payload)).rejects.toThrow("deadline");expect(signal?.aborted).toBe(true);
 });
 it("keeps the deadline active while consuming a stalled body",async()=>{
  let cancelled=false;
  const runner=createProviderRunner(config,async()=>new Response(new ReadableStream({cancel(){cancelled=true}}),{headers:{"content-type":"application/json"}}));
  await expect(runner(payload)).rejects.toThrow("deadline");expect(cancelled).toBe(true);
 });
 it("rejects oversized requests before invoking transport",async()=>{
  let calls=0;const runner=createProviderRunner(config,async()=>{calls++;return Response.json({})});
  await expect(runner({...payload,passage:"x".repeat(3001)})).rejects.toThrow();expect(calls).toBe(0);
 });
});
