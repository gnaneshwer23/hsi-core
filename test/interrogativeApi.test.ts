import {test,expect} from "bun:test";
import {handleInterrogativeApi} from "../src/server/interrogativeApi";
const id="hsi-interrogative-example-12345678";
const services={load:async()=>({id}),submit:async()=>({state:"awaiting_scientific_review"}),review:async()=>({outcome:"reject"})};
const base="https://hsi.example/api/research/interrogative/"+id;
const cookie="__Secure-better-auth.session_token=example-session-token-long-enough";
const collection="https://hsi.example/api/research/investigations";
const createRequest={question:"SSc fibrosis mechanisms?",releaseId:"ssc-release",requestId:"a65bd046-cccd-4dda-a957-b8fbb169e062"};
test("brief exports are authenticated attachments with exact hashes and no HTML fallback",async()=>{
 const url=base+"/brief?format=markdown",brief=async()=>({content:"# Research brief\n",hash:"a".repeat(64),packageHash:"b".repeat(64),mime:"text/markdown; charset=utf-8",filename:id+"-aaaaaaaaaaaa.md"});
 expect((await handleInterrogativeApi(new Request(url),{...services,brief})).status).toBe(401);
 const response=await handleInterrogativeApi(new Request(url,{headers:{cookie}}),{...services,brief});expect(response.status).toBe(200);expect(response.headers.get("x-hsi-content-sha256")).toBe("a".repeat(64));expect(response.headers.get("cache-control")).toBe("no-store");expect(response.headers.get("content-disposition")).toContain("attachment;");expect(await response.text()).toBe("# Research brief\n");
 expect((await handleInterrogativeApi(new Request(base+"/brief?format=html",{headers:{cookie}}),{...services,brief})).status).toBe(400);
 const denied=await handleInterrogativeApi(new Request(url,{headers:{cookie}}),{...services,brief:async()=>{throw Error("private database credentials")}});expect(denied.status).toBe(403);expect(await denied.text()).not.toContain("private");
});
test("revision routes require origin/JSON and a bounded body before invoking the backend",async()=>{
 const url=base+"/revision";let called=false;const revise=async()=>{called=true;return {id}};
 for(const [headers,body,status] of [[{origin:"https://evil.example","content-type":"application/json"},"{}",403],[{origin:"https://hsi.example","content-type":"text/plain"},"{}",415],[{origin:"https://hsi.example","content-type":"application/json"},"x".repeat(13000),413]] as const){expect((await handleInterrogativeApi(new Request(url,{method:"POST",headers:{cookie,...headers},body}),{...services,revise})).status).toBe(status)}
 expect(called).toBe(false);expect((await handleInterrogativeApi(new Request(url,{method:"POST",headers:{cookie,origin:"https://hsi.example","content-type":"application/json"},body:"{}"}),{...services,revise})).status).toBe(201);
});
test("review queue is GET-only, authenticated, cursor bounded and cannot accept an identity filter",async()=>{
 const url="https://hsi.example/api/research/scientific-review/queue",queue=async()=>({items:[],nextCursor:null,history:[]});
 expect((await handleInterrogativeApi(new Request(url),{...services,queue})).status).toBe(401);
 expect((await handleInterrogativeApi(new Request(url+"?principal=other",{headers:{cookie}}),{...services,queue})).status).toBe(400);
 expect((await handleInterrogativeApi(new Request(url,{method:"POST",headers:{cookie}}),{...services,queue})).status).toBe(405);
 expect((await handleInterrogativeApi(new Request(url,{headers:{cookie}}),{...services,queue})).status).toBe(200);
});
test("submission never accepts caller-supplied package or reviewer fields",async()=>{
 const response=await handleInterrogativeApi(new Request(base+"/submit-review",{method:"POST",headers:{cookie,origin:"https://hsi.example","content-type":"application/json"},body:JSON.stringify({packageHash:"forged"})}),services);expect(response.status).toBe(400);
});
test("graph contexts require a verified cookie, accept GET/empty POST only and redact failures",async()=>{
 const url=base+"/graph-context";let captures=0;
 const graphContext=async(input:{capture:boolean})=>{if(input.capture)captures++;return {status:"not_captured",canCapture:true,context:null}};
 expect((await handleInterrogativeApi(new Request(url),{...services,graphContext})).status).toBe(401);
 expect((await handleInterrogativeApi(new Request(url,{headers:{cookie}}),{...services,graphContext})).status).toBe(200);
 for(const [body,status] of [["{}",200],[JSON.stringify({release:"forged"}),400],["x".repeat(65),413]] as const){
  expect((await handleInterrogativeApi(new Request(url,{method:"POST",headers:{cookie,origin:"https://hsi.example","content-type":"application/json"},body}),{...services,graphContext})).status).toBe(status);
 }
 expect(captures).toBe(1);
 const failed=await handleInterrogativeApi(new Request(url,{headers:{cookie}}),{...services,graphContext:async()=>{throw Error("private source credentials")}});expect(failed.status).toBe(403);expect(await failed.text()).not.toContain("private");
});
test("graph context capture refuses cross-origin, non-JSON and client query overrides",async()=>{
 const url=base+"/graph-context",graphContext=async()=>{throw Error("must not run")};
 expect((await handleInterrogativeApi(new Request(url,{method:"POST",headers:{cookie,origin:"https://other.example","content-type":"application/json"},body:"{}"}),{...services,graphContext})).status).toBe(403);
 expect((await handleInterrogativeApi(new Request(url,{method:"POST",headers:{cookie,origin:"https://hsi.example","content-type":"text/plain"},body:"{}"}),{...services,graphContext})).status).toBe(415);
 expect((await handleInterrogativeApi(new Request(url+"?release=forged",{headers:{cookie}}),{...services,graphContext})).status).toBe(400);
});
test("workspace routes require authentication and redact backend errors",async()=>{
 let called=false;const workspace=async()=>{called=true;throw Error("secret database password")};
 expect((await handleInterrogativeApi(new Request(collection),{...services,workspace})).status).toBe(401);expect(called).toBe(false);
 const r=await handleInterrogativeApi(new Request(collection,{headers:{cookie}}),{...services,workspace});expect(r.status).toBe(403);expect(await r.text()).not.toContain("secret");
});
test("workspace list permits only a bounded valid cursor, never an owner override",async()=>{
 const workspace=async()=>({items:[],nextCursor:null});
 for(const suffix of ["?principal=someone-else","?cursor=invalid","?cursor=null&cursor=null"]){
  expect((await handleInterrogativeApi(new Request(collection+suffix,{headers:{cookie}}),{...services,workspace})).status).toBe(400);
 }
 const response=await handleInterrogativeApi(new Request(collection,{headers:{cookie}}),{...services,workspace});expect(response.status).toBe(200);expect(response.headers.get("cache-control")).toBe("no-store");
});
test("creation enforces same origin, JSON, body size and server-owned fields",async()=>{
 let calls=0;const create=async()=>{calls++;return {id,created:true}};
 const post=(headers:Record<string,string>,body=JSON.stringify(createRequest))=>handleInterrogativeApi(new Request(collection,{method:"POST",headers:{cookie,origin:"https://hsi.example","content-type":"application/json",...headers},body}),{...services,create});
 expect((await post({origin:"https://evil.example"})).status).toBe(403);
 expect((await post({"content-type":"text/plain"})).status).toBe(415);
 expect((await post({"content-type":"application/jsonp"})).status).toBe(415);
 expect((await post({},"x".repeat(5000))).status).toBe(413);
 expect((await post({},"{bad-json")).status).toBe(400);
 expect((await post({},JSON.stringify({...createRequest,actorPrincipal:"admin"}))).status).toBe(400);
 expect(calls).toBe(0);expect((await post({})).status).toBe(201);expect(calls).toBe(1);
});
test("creation passes only the validated request and trusted cookie; idempotent retry is HTTP 200",async()=>{
 const response=await handleInterrogativeApi(new Request(collection,{method:"POST",headers:{cookie,origin:"https://hsi.example","content-type":"application/json"},body:JSON.stringify(createRequest)}),{...services,create:async args=>{
  expect(args.serverSessionToken).toBe("example-session-token-long-enough");expect(args.request).toEqual(createRequest);return {id,created:false};
 }});expect(response.status).toBe(200);expect(await response.json()).toEqual({id,created:false});
});
test("GET requires secure cookie session",async()=>{
 const r=await handleInterrogativeApi(new Request(base),services);
 expect(r.status).toBe(401);
});
test("authenticated same-origin GET calls authorised loader",async()=>{
 const r=await handleInterrogativeApi(new Request(base,{headers:{cookie}}),services);
 expect(r.status).toBe(200);expect(r.headers.get("cache-control")).toBe("no-store");
});
test("cross-origin review submission is denied",async()=>{
 const r=await handleInterrogativeApi(new Request(base+"/submit-review",{method:"POST",headers:{cookie,origin:"https://attacker.example","content-type":"application/json"},body:"{}"}),services);
 expect(r.status).toBe(403);
});
test("JSON same-origin submission routes to trusted backend",async()=>{
 const r=await handleInterrogativeApi(new Request(base+"/submit-review",{method:"POST",headers:{cookie,origin:"https://hsi.example","content-type":"application/json"},body:"{}"}),services);
 expect(r.status).toBe(200);
});
test("API never accepts arbitrary paths or exposes internal errors",async()=>{
 const r=await handleInterrogativeApi(new Request(base,{headers:{cookie}}),{...services,load:async()=>{throw Error("secret database url")}});
 expect(r.status).toBe(403);expect(await r.text()).not.toContain("secret");
});

test("GET cannot execute review submission",async()=>{
 const r=await handleInterrogativeApi(new Request(base+"/submit-review",{headers:{cookie}}),services);
 expect(r.status).toBe(405);
});
test("POST cannot execute read endpoint",async()=>{
 const r=await handleInterrogativeApi(new Request(base,{method:"POST",headers:{cookie,origin:"https://hsi.example","content-type":"application/json"},body:"{}"}),services);
 expect(r.status).toBe(405);
});
test("malformed decision JSON returns a safe client error",async()=>{
 const r=await handleInterrogativeApi(new Request(base+"/decision",{method:"POST",headers:{cookie,origin:"https://hsi.example","content-type":"application/json"},body:"{not-json"}),services);
 expect(r.status).toBe(400);
});

test("review decisions reject missing authentication before service invocation",async()=>{
 let called=false;
 const r=await handleInterrogativeApi(new Request(base+"/decision",{method:"POST",headers:{origin:"https://hsi.example","content-type":"application/json"},body:JSON.stringify({investigationId:id})}),{...services,review:async()=>{called=true;return {}}});
 expect(r.status).toBe(401);expect(called).toBe(false);
});
test("review decisions reject cross-origin requests without calling backend",async()=>{
 let called=false;
 const r=await handleInterrogativeApi(new Request(base+"/decision",{method:"POST",headers:{cookie,origin:"https://attacker.example","content-type":"application/json"},body:JSON.stringify({investigationId:id})}),{...services,review:async()=>{called=true;return {}}});
 expect(r.status).toBe(403);expect(called).toBe(false);
});
test("review decisions reject investigation ID mismatches",async()=>{
 let called=false;
 const r=await handleInterrogativeApi(new Request(base+"/decision",{method:"POST",headers:{cookie,origin:"https://hsi.example","content-type":"application/json"},body:JSON.stringify({investigationId:"hsi-interrogative-other-12345678"})}),{...services,review:async()=>{called=true;return {}}});
 expect(r.status).toBe(400);expect(called).toBe(false);
});
test("review decisions reject non-JSON content types",async()=>{
 const r=await handleInterrogativeApi(new Request(base+"/decision",{method:"POST",headers:{cookie,origin:"https://hsi.example","content-type":"text/plain"},body:"{}"}),services);
 expect(r.status).toBe(415);
});
test("review decisions reject oversized payloads",async()=>{
 const r=await handleInterrogativeApi(new Request(base+"/decision",{method:"POST",headers:{cookie,origin:"https://hsi.example","content-type":"application/json"},body:JSON.stringify({investigationId:id,padding:"x".repeat(21000)})}),services);
 expect(r.status).toBe(413);
});
test("trusted decision backend denial never leaks internal details",async()=>{
 const r=await handleInterrogativeApi(new Request(base+"/decision",{method:"POST",headers:{cookie,origin:"https://hsi.example","content-type":"application/json"},body:JSON.stringify({investigationId:id})}),{...services,review:async()=>{throw Error("private neon database credentials")}});
 expect(r.status).toBe(403);expect(await r.text()).not.toContain("private neon");
});
test("same-origin decision request reaches trusted service, not browser authority",async()=>{
 let received:unknown=null;
 const decision={investigationId:id,reviewerPrincipal:"untrusted-client-value"};
 const r=await handleInterrogativeApi(new Request(base+"/decision",{method:"POST",headers:{cookie,origin:"https://hsi.example","content-type":"application/json"},body:JSON.stringify(decision)}),{...services,review:async(input)=>{received=input;return {decisionId:"review-test",outcome:"reject"}}});
 expect(r.status).toBe(200);
 expect((received as {serverSessionToken:string;decision:{investigationId:string}}).serverSessionToken).toBe("example-session-token-long-enough");
 expect((received as {decision:{investigationId:string}}).decision.investigationId).toBe(id);
 // Reviewer principal must be independently verified by authenticatedScientificReviewStore.
});

test("review history requires an authenticated cookie",async()=>{
 let called=false;
 const r=await handleInterrogativeApi(new Request("https://hsi.example/api/research/scientific-review/history"),{...services,history:async()=>{called=true;return {items:[]}}});
 expect(r.status).toBe(401);expect(called).toBe(false);
});
test("review history is GET-only",async()=>{
 const r=await handleInterrogativeApi(new Request("https://hsi.example/api/research/scientific-review/history",{method:"POST",headers:{cookie,origin:"https://hsi.example"}}),{...services,history:async()=>({items:[]})});
 expect(r.status).toBe(405);
});
test("review history routes to trusted reviewer-scoped service",async()=>{
 let token="";
 const r=await handleInterrogativeApi(new Request("https://hsi.example/api/research/scientific-review/history",{headers:{cookie}}),{...services,history:async input=>{token=input.serverSessionToken??"";return {items:[]}}});
 expect(r.status).toBe(200);expect(token).toBe("example-session-token-long-enough");expect(r.headers.get("cache-control")).toBe("no-store");
});
test("review history backend errors are redacted",async()=>{
 const r=await handleInterrogativeApi(new Request("https://hsi.example/api/research/scientific-review/history",{headers:{cookie}}),{...services,history:async()=>{throw Error("private database secret")}});
 expect(r.status).toBe(403);expect(await r.text()).not.toContain("private database");
});

test("SSc graph API requires session and valid node",async()=>{
 const url="https://hsi.example/api/research/graph/ssc?node=ssc:tfh";
 expect((await handleInterrogativeApi(new Request(url),services)).status).toBe(401);
 expect((await handleInterrogativeApi(new Request("https://hsi.example/api/research/graph/ssc?node=bad%20node",{headers:{cookie}}),services)).status).toBe(400);
});
test("SSc graph API only permits read methods",async()=>{
 const r=await handleInterrogativeApi(new Request("https://hsi.example/api/research/graph/ssc?node=ssc:tfh",{method:"POST",headers:{cookie,origin:"https://hsi.example"}}),{...services,graph:async()=>({nodes:[],relationships:[]})});
 expect(r.status).toBe(405);
});
test("SSc graph API delegates trusted cookie identity to governed service",async()=>{
 let seen="";
 const r=await handleInterrogativeApi(new Request("https://hsi.example/api/research/graph/ssc?node=ssc:tfh",{headers:{cookie}}),{...services,graph:async input=>{seen=input.nodeId;return {nodes:[],relationships:[]}}});
 expect(r.status).toBe(200);expect(seen).toBe("ssc:tfh");
});
test("SSc graph API does not leak database errors",async()=>{
 const r=await handleInterrogativeApi(new Request("https://hsi.example/api/research/graph/ssc?node=ssc:tfh",{headers:{cookie}}),{...services,graph:async()=>{throw Error("private database secret")}});
 expect(r.status).toBe(403);expect(await r.text()).not.toContain("private database");
});
