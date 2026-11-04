import {test,expect} from "bun:test";
import {handleInterrogativeApi} from "../src/server/interrogativeApi";
import {parseResearchAccountAccess} from "../src/researchAccount";
import {loadResearchAccount} from "../src/db/researchAccountStore";
import {checkResearchAccount} from "../site/src/lib/researchAccountClient";
const id="hsi-interrogative-example-12345678";
const principalId="verified-provider-user";
const cookie="__Secure-better-auth.session_token=example-session-token-long-enough";
const base="https://hsi.example/api/research/account";
const pending={principalId,researcher:false,scientificReviewer:false,investigations:[]};
const services={load:async()=>({}),submit:async()=>({}),review:async()=>({}),account:async()=>pending};
const mock=(fn:(...args:Parameters<typeof fetch>)=>ReturnType<typeof fetch>)=>fn as typeof fetch;
test("account endpoint requires a backend cookie, not a browser principal or role header",async()=>{
 let calls=0;
 const r=await handleInterrogativeApi(new Request(base,{headers:{"x-principal-id":principalId,"x-role":"research_admin"}}),{...services,account:async()=>{calls++;return pending}});
 expect(r.status).toBe(401);expect(calls).toBe(0);
});
test("verified identity without grants is reported as pending with no records",async()=>{
 let seen:string|null=null;
 const r=await handleInterrogativeApi(new Request(base,{headers:{cookie}}),{...services,account:async input=>{seen=input.serverSessionToken;return pending}});
 expect(r.status).toBe(200);expect(seen).toBe("example-session-token-long-enough");expect(await r.json()).toEqual(pending);
 expect(r.headers.get("cache-control")).toBe("no-store");expect(r.headers.get("vary")).toBe("Cookie");
});
test("account checks never provision roles and reject POST",async()=>{
 const r=await handleInterrogativeApi(new Request(base,{method:"POST",headers:{cookie,"content-type":"application/json"},body:JSON.stringify({role:"research_admin"})}),services);
 expect(r.status).toBe(405);
});
test("missing backend identity and unavailable database are distinct safe responses",async()=>{
 const req=()=>new Request(base,{headers:{cookie}});
 expect((await handleInterrogativeApi(req(),{...services,account:async()=>null})).status).toBe(401);
 const failed=await handleInterrogativeApi(req(),{...services,account:async()=>{throw Error("secret database credential")}});
 expect(failed.status).toBe(503);expect(await failed.text()).not.toContain("secret");
});
test("missing sessions fail closed before account database access",async()=>{
 expect(await loadResearchAccount({serverSessionToken:null,databaseUrl:"postgresql://invalid"})).toBeNull();
});
test("account response rejects mismatched identity, ungranted records and inappropriate reviewer actions",()=>{
 expect(()=>parseResearchAccountAccess(pending,"other-user")).toThrow();
 expect(()=>parseResearchAccountAccess({...pending,investigations:[{id,state:"draft",canReview:false}]},principalId)).toThrow();
 expect(()=>parseResearchAccountAccess({...pending,researcher:true,investigations:[{id,state:"awaiting_scientific_review",canReview:true}]},principalId)).toThrow();
 expect(()=>parseResearchAccountAccess({...pending,scientificReviewer:true,investigations:[{id,state:"reviewed",canReview:true}]},principalId)).toThrow();
 const a=parseResearchAccountAccess({...pending,researcher:true,roles:["research_admin"],token:"not-exposed",investigations:[{id,state:"draft",canReview:false,otherUser:"not-exposed"}]},principalId);
 expect(a.investigations).toEqual([{id,state:"draft",canReview:false}]);expect(a).not.toHaveProperty("token");expect(a).not.toHaveProperty("roles");
});
test("client distinguishes provider login from backend session or routing failures",async()=>{
 expect((await checkResearchAccount(principalId,mock(async()=>new Response(null,{status:401})))).kind).toBe("session_required");
 expect((await checkResearchAccount(principalId,mock(async()=>new Response(null,{status:503})))).kind).toBe("unavailable");
 expect((await checkResearchAccount(principalId,mock(async()=>new Response("<html>static fallback</html>",{headers:{"content-type":"text/html"}})))).kind).toBe("invalid_response");
 expect((await checkResearchAccount(principalId,mock(async()=>Response.json({...pending,principalId:"other"})))).kind).toBe("invalid_response");
 expect((await checkResearchAccount(principalId,mock(async()=>Response.json(pending)))).kind).toBe("ready");
});
test("account checks time out and use same-origin uncached credentials",async()=>{
 expect((await checkResearchAccount(principalId,mock(()=>new Promise(()=>{})),10)).kind).toBe("timeout");
 let init:RequestInit|undefined;
 await checkResearchAccount(principalId,mock(async(_url,options)=>{init=options;return Response.json(pending)}));
 expect(init?.credentials).toBe("same-origin");expect(init?.cache).toBe("no-store");expect(init?.redirect).toBe("error");
});
