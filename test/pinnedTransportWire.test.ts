import {describe,expect,it} from "bun:test";
import {EventEmitter} from "node:events";
import {Readable} from "node:stream";
import type {request as httpsRequestType} from "node:https";
import {createPinnedProviderTransport} from "../src/researchV2/pinnedProviderTransport";
import {createProviderRunner,type ProviderConfig} from "../src/researchV2/providerReliability";

// Contract tests for what the transport hands to node:https and how it turns the response back. They cannot reach a real
// provider (the address pin refuses loopback, so a local TLS server is impossible without weakening the guard); they assert
// the connection options and response handling instead. A real provider call remains un-exercised.
const config:ProviderConfig={providerId:"anthropic",modelId:"synthetic",endpoint:"https://api.anthropic.com/v1/messages",timeoutMs:2000,maxResponseBytes:512};
const payload={instruction:"Synthetic instruction",claim:"A associates with B",passage:"Synthetic evidence only"};
const PUBLIC=async()=>[{address:"8.8.8.8",family:4}];
type Call={url:URL;opts:Record<string,unknown>;body:string|null};
function fake(response:{status:number;headers?:Record<string,string|string[]>;chunks?:string[]}|Error){
 const calls:Call[]=[];
 const request=((url:URL,opts:Record<string,unknown>,cb:(res:unknown)=>void)=>{
  const req=new EventEmitter() as EventEmitter&{end:(b:string)=>void};
  req.end=body=>{calls.push({url,opts,body});queueMicrotask(()=>{
   if(response instanceof Error)return req.emit("error",response);
   cb(Object.assign(Readable.from((response.chunks??["{}"]).map(c=>Buffer.from(c))),{statusCode:response.status,headers:{"content-type":"application/json",...(response.headers??{})}}));
  })};
  return req;
 }) as unknown as typeof httpsRequestType;
 return {calls,request};
}
const encode=()=>({body:JSON.stringify({m:"x"}),headers:{"x-api-key":"K","content-type":"application/json"}});
const ctx=()=>({signal:new AbortController().signal,redirect:"error" as const});

describe("pinned transport: connection contract",()=>{
 it("connects with TLS verification, the original hostname, the pinned family and address, no agent, and a correct content-length",async()=>{
  const f=fake({status:200}),t=createPinnedProviderTransport(encode,PUBLIC,f.request);
  const res=await t(config,payload,ctx());expect(res.status).toBe(200);
  const c=f.calls[0]!,o=c.opts as {method:string;agent:unknown;servername:string;rejectUnauthorized:boolean;family:number;lookup:Function;headers:Record<string,string>;signal:AbortSignal};
  expect(c.url.hostname).toBe("api.anthropic.com");expect(o.method).toBe("POST");expect(o.agent).toBe(false);expect(o.servername).toBe("api.anthropic.com");expect(o.rejectUnauthorized).toBe(true);expect(o.family).toBe(4);
  expect(o.headers["content-length"]).toBe(String(Buffer.byteLength(c.body!)));expect(o.headers["x-api-key"]).toBe("K");
  // the lookup is pinned: it returns the accepted address for the original host only
  o.lookup("api.anthropic.com",{},(e:Error|null,a:string,fam:number)=>{expect(e).toBeNull();expect(a).toBe("8.8.8.8");expect(fam).toBe(4)});
  o.lookup("evil.example",{},(e:Error|null)=>expect(e).toBeInstanceOf(Error));
 });
 it("refuses an unapproved endpoint before any DNS lookup or connection",async()=>{
  let dns=0;const f=fake({status:200}),t=createPinnedProviderTransport(encode,async()=>{dns++;return [{address:"8.8.8.8",family:4}]},f.request);
  await expect(t({...config,endpoint:"https://evil.example/v1/messages"},payload,ctx())).rejects.toThrow("Unapproved provider endpoint");expect(dns).toBe(0);expect(f.calls.length).toBe(0);
 });
 it("refuses a non-error redirect policy and a pre-aborted signal, with no connection",async()=>{
  const f=fake({status:200}),t=createPinnedProviderTransport(encode,PUBLIC,f.request),ac=new AbortController();ac.abort();
  await expect(t(config,payload,{signal:new AbortController().signal,redirect:"follow" as never})).rejects.toThrow();
  await expect(t(config,payload,{signal:ac.signal,redirect:"error"})).rejects.toThrow();expect(f.calls.length).toBe(0);
 });
 it("refuses server-controlled framing headers, an empty body and an oversize body, with no connection",async()=>{
  const f=fake({status:200});
  const framing:Record<string,string>[]=[{host:"x"},{"Content-Length":"1"},{connection:"keep-alive"},{"transfer-encoding":"chunked"},{"proxy-authorization":"x"}];
  for(const headers of framing)
   await expect(createPinnedProviderTransport(()=>({body:"{}",headers}),PUBLIC,f.request)(config,payload,ctx())).rejects.toThrow("framing");
  await expect(createPinnedProviderTransport(()=>({body:"",headers:{}}),PUBLIC,f.request)(config,payload,ctx())).rejects.toThrow("wire body");
  await expect(createPinnedProviderTransport(()=>({body:"x".repeat(65537),headers:{}}),PUBLIC,f.request)(config,payload,ctx())).rejects.toThrow("wire body");
  expect(f.calls.length).toBe(0);
 });
 it("does not let the encoder mutate the validated config or payload it was handed",async()=>{
  const f=fake({status:200});let threw=false;
  const t=createPinnedProviderTransport((c,p)=>{try{(c as {endpoint:string}).endpoint="https://evil.example";(p as {passage:string}).passage="x"}catch{threw=true}return encode()},PUBLIC,f.request);
  await t(config,payload,ctx());expect(threw).toBe(true);expect(f.calls[0]!.url.hostname).toBe("api.anthropic.com");
 });
});

describe("pinned transport: response contract (through the provider runner)",()=>{
 const run=(response:Parameters<typeof fake>[0])=>createProviderRunner(config,createPinnedProviderTransport(encode,PUBLIC,fake(response).request))(payload);
 it("returns parsed JSON for a 200 with a JSON content type",async()=>{expect(await run({status:200,chunks:['{"ok":','true}']})).toEqual({ok:true})});
 it("joins repeated response headers and exposes status",async()=>{
  const res=await createPinnedProviderTransport(encode,PUBLIC,fake({status:429,headers:{"x-multi":["a","b"]}}).request)(config,payload,ctx());
  expect(res.status).toBe(429);expect(res.headers.get("x-multi")).toBe("a, b");
 });
 it("fails closed on non-2xx, a non-JSON content type and an oversize body",async()=>{
  await expect(run({status:500})).rejects.toThrow("Provider request failed");
  await expect(run({status:302,headers:{location:"https://evil.example"}})).rejects.toThrow("Provider request failed");
  await expect(run({status:200,headers:{"content-type":"text/html"}})).rejects.toThrow("JSON response required");
  await expect(run({status:200,chunks:["{\"a\":\""+"x".repeat(600)+"\"}"]})).rejects.toThrow("byte limit");
 });
 it("surfaces a connection error without hanging",async()=>{await expect(run(new Error("ECONNRESET"))).rejects.toThrow()});
});
