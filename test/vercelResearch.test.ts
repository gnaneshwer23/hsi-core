import {test,expect} from "bun:test";
import {handleVercelResearch,readResearchDeploymentConfig} from "../src/server/vercelResearch";
import {providerCookies} from "../src/server/neonAuthGateway";
import {createHsiAuthClient} from "../site/src/lib/hsiAuthClient";
const origin="https://hsi.example";
const env={HSI_DATABASE_URL:"postgresql://test:never-used@ep-sweet-hill-zasb0lni.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require",HSI_NEON_PROJECT_ID:"red-wave-06625195",HSI_PUBLIC_ORIGIN:origin,HSI_AUTH_BASE_URL:"https://provider.example.invalid/neondb/auth"};
const cookie="__Secure-neon-auth.session_token=signed-test-cookie.signature; unrelated=must-not-leave-hsi";
const identity={session:{id:"provider-session-id",userId:"provider-user-id",expiresAt:"2099-01-01T00:00:00Z",token:"never-send-to-browser"},user:{id:"provider-user-id",email:"test@example.invalid",emailVerified:true,role:"untrusted-provider-role"}};
const transport=(fn:(...args:Parameters<typeof fetch>)=>ReturnType<typeof fetch>)=>fn as typeof fetch;
const req=(path:string,init:RequestInit={})=>new Request(origin+path,init);
const post=(path:string,body:unknown={})=>req(path,{method:"POST",headers:{origin,"content-type":"application/json",cookie},body:JSON.stringify(body)});
const noCalls=transport(async()=>{throw Error("Unexpected outbound request")});
test("Vercel health reports missing configuration without querying a DB or echoing credentials",async()=>{
 const missing=await handleVercelResearch(req("/api/research/health"),{}, {transport:noCalls});
 expect(missing.status).toBe(503);expect((await missing.json()).missing).toContain("HSI_DATABASE_URL");
 const configured=await handleVercelResearch(req("/api/research/health"),env,{transport:noCalls});
 expect(await configured.json()).toEqual({service:"hsi-research",status:"configuration_validated",writesEnabled:false,publicOrigin:origin,requestOrigin:origin,originMatches:true,authUrlsMatch:true,databaseConnectionTested:false});
 expect(configured.headers.get("cache-control")).toBe("no-store");
 expect(readResearchDeploymentConfig({...env,HSI_DATABASE_URL:"postgresql://secret@attacker.example/neondb"}).ok).toBe(false);
 expect(readResearchDeploymentConfig({...env,HSI_AUTH_BASE_URL:origin+"/api/auth"}).ok).toBe(false);
});
test("health catches www/non-www mismatch without querying the provider or exposing private configuration",async()=>{
 const r=await handleVercelResearch(new Request("https://www.hsi.example/api/research/health"),env,{transport:noCalls});
 expect(r.status).toBe(503);
 const body=await r.json();expect(body.status).toBe("origin_mismatch");expect(body.publicOrigin).toBe(origin);expect(body.requestOrigin).toBe("https://www.hsi.example");expect(body.originMatches).toBe(false);
 expect(JSON.stringify(body)).not.toContain("never-used");expect(JSON.stringify(body)).not.toContain("provider.example.invalid");
});
test("gateway configuration and deployment-origin denials have safe actionable client errors",async()=>{
 const cases=[{url:origin,settings:{},code:"AUTH_GATEWAY_NOT_CONFIGURED"},{url:"https://www.hsi.example",settings:env,code:"DEPLOYMENT_ORIGIN_MISMATCH"}];
 for(const c of cases){
  const client=createHsiAuthClient(env.HSI_AUTH_BASE_URL,transport(async()=>handleVercelResearch(new Request(c.url+"/api/auth/sign-up/email",{method:"POST",headers:{origin:c.url,"content-type":"application/json"},body:JSON.stringify({name:"Test",email:"test@example.invalid",password:"test-only-password"})}),c.settings,{transport:noCalls})),8000,"same-origin");
  const result=await client.signUp("Test","test@example.invalid","test-only-password");expect(result.error?.code).toBe(c.code);expect(result.error?.message).not.toBe("Authentication request was denied.");expect(JSON.stringify(result)).not.toContain("test-only-password");
 }
});
test("wrong public origin and arbitrary routes fail closed before any provider call",async()=>{
 expect((await handleVercelResearch(new Request("https://attacker.example/api/research/account",{headers:{"x-forwarded-host":"hsi.example"}}),env,{transport:noCalls})).status).toBe(403);
 expect((await handleVercelResearch(req("/api/research/arbitrary"),env,{transport:noCalls})).status).toBe(404);
 expect((await handleVercelResearch(req("/api/auth/admin/grant"),env,{transport:noCalls})).status).toBe(404);
});
test("auth writes require exact origin and JSON before forwarding credentials",async()=>{
 expect((await handleVercelResearch(req("/api/auth/sign-in/email",{method:"POST",headers:{origin:"https://attacker.example","content-type":"application/json"},body:"{}"}),env,{transport:noCalls})).status).toBe(403);
 expect((await handleVercelResearch(req("/api/auth/sign-in/email",{method:"POST",headers:{origin,"content-type":"text/plain"},body:"{}"}),env,{transport:noCalls})).status).toBe(415);
 expect((await handleVercelResearch(post("/api/auth/sign-up/email",{email:"test@example.invalid",password:"secret",name:42}),env,{transport:noCalls})).status).toBe(400);
});
test("signup gateway forwards only credential fields, fixes callback origin and makes cookies host-only",async()=>{
 let outgoing:Record<string,unknown>={};let sentCookie="";
 const response=await handleVercelResearch(post("/api/auth/sign-up/email",{name:"Test",email:"test@example.invalid",password:"test-only-password",role:"research_admin",callbackURL:"https://attacker.example"}),env,{transport:transport(async(url,init)=>{
  expect(String(url)).toBe(env.HSI_AUTH_BASE_URL+"/sign-up/email");outgoing=JSON.parse(String(init?.body));sentCookie=new Headers(init?.headers).get("cookie")??"";
  expect(init?.redirect).toBe("error");expect(init?.cache).toBe("no-store");
  return Response.json({token:"never-send-to-browser",user:identity.user},{headers:{"set-cookie":"__Secure-neon-auth.session_token=signed; Domain=provider.example.invalid; Path=/neondb/auth; Secure; HttpOnly; SameSite=None; Max-Age=3600"}});
 })});
 expect(response.status).toBe(200);expect(outgoing).toEqual({name:"Test",email:"test@example.invalid",password:"test-only-password",callbackURL:origin+"/sign-in"});
 expect(sentCookie).not.toContain("unrelated");const body=await response.json();expect(body).not.toHaveProperty("token");expect(body.user).not.toHaveProperty("role");
 const setCookie=response.headers.getSetCookie()[0]!;expect(setCookie).toContain("Path=/;");expect(setCookie).toContain("HttpOnly");expect(setCookie).toContain("Secure");expect(setCookie).toContain("SameSite=Lax");expect(setCookie).not.toContain("Domain=");
});
test("get-session keeps session tokens out of browser JSON and strips provider roles",async()=>{
 const response=await handleVercelResearch(req("/api/auth/get-session",{headers:{cookie}}),env,{transport:transport(async()=>Response.json(identity))});
 const body=await response.json();expect(body.session).not.toHaveProperty("token");expect(body.user).not.toHaveProperty("role");expect(body.session.userId).toBe(identity.user.id);
});
test("provider failures cannot become HTML auth success or expose provider secrets",async()=>{
 const html=await handleVercelResearch(req("/api/auth/get-session"),env,{transport:transport(async()=>new Response("secret html",{headers:{"content-type":"text/html"}}))});expect(html.status).toBe(502);expect(await html.text()).not.toContain("secret");
 const denied=await handleVercelResearch(post("/api/auth/sign-in/email",{email:"test@example.invalid",password:"test-only"}),env,{transport:transport(async()=>Response.json({code:"INVALID_EMAIL_OR_PASSWORD",message:"sensitive upstream detail"},{status:401}))});
 expect(await denied.json()).toEqual({code:"INVALID_EMAIL_OR_PASSWORD"});
});
test("research access resolves provider-verified IDs to a DB token and ignores browser role or raw-token claims",async()=>{
 let resolved=false,seen:string|null=null;
 const r=await handleVercelResearch(req("/api/research/account",{headers:{cookie,"x-principal-id":"attacker","x-role":"research_admin"}}),env,{
  transport:transport(async()=>Response.json(identity)),resolveToken:async input=>{resolved=true;expect(input.sessionId).toBe(identity.session.id);expect(input.userId).toBe(identity.user.id);return "database-token-long-enough"},
  services:{load:async()=>({}),submit:async()=>({}),review:async()=>({}),account:async input=>{seen=input.serverSessionToken;return {principalId:identity.user.id,researcher:false,scientificReviewer:false,investigations:[]}}}
 });
 expect(r.status).toBe(200);expect(resolved).toBe(true);expect(seen).toBe("database-token-long-enough");expect((await r.json()).researcher).toBe(false);
});
test("missing or unverified sessions never reach a DB token lookup or a research service",async()=>{
 let lookups=0;const resolveToken=async()=>{lookups++;return "should-not-be-used"};
 expect((await handleVercelResearch(req("/api/research/account"),env,{transport:noCalls,resolveToken})).status).toBe(401);
 expect((await handleVercelResearch(req("/api/research/account",{headers:{cookie}}),env,{transport:transport(async()=>Response.json({...identity,user:{...identity.user,emailVerified:false}})),resolveToken})).status).toBe(401);
 expect(lookups).toBe(0);
});
test("provider/database branch mismatch fails closed",async()=>{
 const r=await handleVercelResearch(req("/api/research/account",{headers:{cookie}}),env,{transport:transport(async()=>Response.json(identity)),resolveToken:async()=>null});expect(r.status).toBe(401);
});
test("research writes remain disabled unless explicitly enabled for the confirmed staging target",async()=>{
 const path="/api/research/interrogative/hsi-interrogative-example-12345678/submit-review";
 expect((await handleVercelResearch(post(path),env,{transport:noCalls})).status).toBe(403);
 const staging=readResearchDeploymentConfig({...env,HSI_RESEARCH_WRITES_ENABLED:"true",HSI_NEON_BRANCH_ID:"br-rough-snow-zagxbvjp"});expect(staging.ok&&staging.writesEnabled).toBe(true);
 const production=readResearchDeploymentConfig({...env,HSI_DATABASE_URL:env.HSI_DATABASE_URL.replace("ep-sweet-hill-zasb0lni","ep-restless-dew-zas989pv"),HSI_RESEARCH_WRITES_ENABLED:"true",HSI_NEON_BRANCH_ID:"br-rough-snow-zagxbvjp"});expect(production.ok&&production.writesEnabled).toBe(false);
});
test("cookie gateway forwards only recognised auth cookies",()=>{
 expect(providerCookies(req("/",{headers:{cookie}}))).toBe("__Secure-neon-auth.session_token=signed-test-cookie.signature");
});
test("browser transport uses same-origin auth routes while preserving approved-provider validation",async()=>{
 let seen="";const c=createHsiAuthClient(env.HSI_AUTH_BASE_URL,transport(async url=>{seen=String(url);return Response.json(null)}),8000,"same-origin");
 expect((await c.session()).error).toBeNull();expect(seen).toBe("/api/auth/get-session");
 const disabled=createHsiAuthClient("postgresql://invalid",noCalls,8000,"same-origin");expect((await disabled.session()).error?.code).toBe("auth_not_configured");
});

test("configuration rejects a trailing full stop in the Neon endpoint and mismatched browser/server auth URLs",()=>{
 const neon="https://ep-sweet-hill-zasb0lni.neonauth.c-2.eu-west-2.aws.neon.tech/neondb/auth";
 for(const serverUrl of [neon+".",neon+".\u00a0",neon+"/wrong"]){
  const c=readResearchDeploymentConfig({...env,HSI_AUTH_BASE_URL:serverUrl,VITE_HSI_AUTH_BASE_URL:neon});expect(c.ok).toBe(false);expect(c.authUrlsMatch).toBe(false);
 }
 expect(readResearchDeploymentConfig({...env,HSI_AUTH_BASE_URL:neon,VITE_HSI_AUTH_BASE_URL:neon}).ok).toBe(true);
 expect(readResearchDeploymentConfig({...env,HSI_AUTH_BASE_URL:neon,VITE_HSI_AUTH_BASE_URL:"https://different.example/auth"}).ok).toBe(false);
});
test("Neon proxy marker is server-owned and wrapped provider errors retain only recognised codes",async()=>{
 const response=await handleVercelResearch(post("/api/auth/sign-in/email",{email:"test@example.invalid",password:"test-password"}),env,{transport:transport(async(_url,init)=>{
  expect(new Headers(init?.headers).get("x-neon-auth-middleware")).toBe("true");
  return Response.json({error:{code:"invalid_email_or_password",message:"must never be echoed"}},{status:401});
 })});
 expect(await response.json()).toEqual({code:"INVALID_EMAIL_OR_PASSWORD"});
});
test("auth diagnostics use only anonymous GET and never return provider identity or cookies",async()=>{
 let cookieSent:string|null="not-checked";
 const response=await handleVercelResearch(req("/api/auth/diagnostics",{headers:{cookie}}),env,{transport:transport(async(_url,init)=>{cookieSent=new Headers(init?.headers).get("cookie");expect(init?.method).toBe("GET");return Response.json(null,{headers:{"set-cookie":"secret-do-not-forward=value"}})})});
 expect(cookieSent).toBeNull();expect(response.headers.get("set-cookie")).toBeNull();expect(await response.json()).toEqual({service:"hsi-auth",status:"provider_reachable",providerHttpStatus:200,credentialsTested:false,databaseConnectionTested:false});
 const unexpected=await handleVercelResearch(req("/api/auth/diagnostics"),env,{transport:transport(async()=>Response.json(identity))});expect(unexpected.status).toBe(502);expect(await unexpected.text()).not.toContain(identity.user.email);
 expect((await handleVercelResearch(post("/api/auth/diagnostics"),env,{transport:noCalls})).status).toBe(405);
});
test("unknown upstream codes cannot echo provider details or hide the HTTP rejection status",async()=>{
 const client=createHsiAuthClient(env.HSI_AUTH_BASE_URL,transport(async()=>handleVercelResearch(post("/api/auth/sign-in/email",{email:"test@example.invalid",password:"test-password"}),env,{transport:transport(async()=>Response.json({code:"secret-or-arbitrary-code",message:"password-value"},{status:403}))})),8000,"same-origin");
 const result=await client.signIn("test@example.invalid","test-password");expect(result.error?.message).toContain("HTTP 403");expect(result.error?.code).toBe("AUTH_PROVIDER_REJECTED");expect(JSON.stringify(result)).not.toContain("secret-or-arbitrary-code");expect(JSON.stringify(result)).not.toContain("password-value");
});
