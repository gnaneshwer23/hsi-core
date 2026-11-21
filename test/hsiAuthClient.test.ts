import type { FetchLike } from "../src/fetchLike";
import {test,expect} from "bun:test";
import {AuthSessionParseError,createHsiAuthClient,parseAuthBaseUrl,parseAuthSession} from "../site/src/lib/hsiAuthClient";
import {AUTH_ERROR_MESSAGES} from "../src/authErrors";
const response=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{"content-type":"application/json"}});
const mock=(fn:(input:unknown,init?:RequestInit)=>Promise<Response>)=>fn as FetchLike;
const valid={session:{id:"session-test",userId:"user-one",expiresAt:"2099-01-01T00:00:00.000Z"},user:{id:"user-one",email:"researcher@example.invalid",emailVerified:true}};
test("auth URL rejects insecure, credential-bearing and malformed configurations",()=>{for(const value of [undefined,"http://auth.example","https://user:password@auth.example","https://auth.example/?secret=bad","https://auth.example/#token","not-a-url"])expect(parseAuthBaseUrl(value)).toBeNull();expect(parseAuthBaseUrl("https://auth.example/api/auth/")).toBe("https://auth.example/api/auth");});
test("unconfigured auth never accepts credentials or sends a request",async()=>{let called=false;const c=createHsiAuthClient(undefined,mock(async()=>{called=true;return response({});}));expect((await c.signIn("researcher@example.invalid","dummy-not-a-real-password")).error?.code).toBe("auth_not_configured");expect(called).toBe(false);});
test("static HTML and malformed JSON cannot masquerade as auth success",async()=>{for(const r of [new Response("<html>static fallback</html>",{headers:{"content-type":"text/html"}}),new Response("{bad",{headers:{"content-type":"application/json"}})]){const c=createHsiAuthClient("https://auth.example",mock(async()=>r));expect((await c.session()).error?.code).toBe("auth_invalid_response");}});
test("expired sessions use auth_session_expired; malformed stay invalid",()=>{
 expect(parseAuthSession(null)).toBeNull();
 try{parseAuthSession({...valid,session:{...valid.session,expiresAt:"2000-01-01T00:00:00.000Z"}});expect.unreachable();}
 catch(error){expect(error).toBeInstanceOf(AuthSessionParseError);expect((error as AuthSessionParseError).code).toBe("auth_session_expired");}
 for(const value of [{},[],{...valid,session:{...valid.session,userId:"someone-else"}}]){
  expect(()=>parseAuthSession(value)).toThrow(AuthSessionParseError);
  try{parseAuthSession(value);}catch(error){expect((error as AuthSessionParseError).code).toBe("auth_invalid_response");}
 }
});
test("session() maps expired cookie to auth_session_expired, not auth_unavailable",async()=>{
 const c=createHsiAuthClient("https://auth.example",mock(async()=>response({...valid,session:{...valid.session,expiresAt:"2000-01-01T00:00:00.000Z"}})));
 const result=await c.session();
 expect(result.data).toBeNull();
 expect(result.error?.code).toBe("auth_session_expired");
 expect(result.error?.message).toBe(AUTH_ERROR_MESSAGES.AUTH_SESSION_EXPIRED);
 expect(result.error?.message).not.toMatch(/unavailable/i);
});
test("signed-out null and valid identity are separate from backend reviewer grants",async()=>{expect(await createHsiAuthClient("https://auth.example",mock(async()=>response(null))).session()).toEqual({data:null,error:null});const result=await createHsiAuthClient("https://auth.example",mock(async()=>response({...valid,roles:["scientific_reviewer"]}))).session();expect(result.data?.user.id).toBe("user-one");expect(result.data).not.toHaveProperty("roles");expect(result.data).not.toHaveProperty("scientific_reviewer");});
test("auth failures never echo arbitrary provider details or submitted passwords",async()=>{const c=createHsiAuthClient("https://auth.example",mock(async()=>response({message:"secret echoed from a provider",code:"INTERNAL_ERROR"},500)));expect(JSON.stringify(await c.signIn("researcher@example.invalid","dummy-password"))).not.toContain("secret");});
test("auth rate limits surface Retry-After wait hints without leaking provider details",async()=>{
 const limited=new Response(JSON.stringify({code:"RATE_LIMITED",message:"secret provider detail"}),{
  status:429,
  headers:{"content-type":"application/json","Retry-After":"120"},
 });
 const result=await createHsiAuthClient("https://auth.example",mock(async()=>limited)).signIn("researcher@example.invalid","dummy-password");
 expect(result.error?.code).toBe("RATE_LIMITED");
 expect(result.error?.message).toContain("Too many authentication attempts");
 expect(result.error?.message).toContain("about 2 minute");
 expect(result.error?.message).not.toContain("secret");
});
test("stalled auth settles with a timeout instead of leaving sign-in pending",async()=>{const c=createHsiAuthClient("https://auth.example",mock(async()=>await new Promise<Response>(()=>{})),10);expect((await c.session()).error?.code).toBe("auth_timeout");});
test("auth transport includes secure-session credentials and does not follow redirects",async()=>{let options:RequestInit|undefined;const c=createHsiAuthClient("https://auth.example",mock(async(_input,init)=>{options=init;return response(valid);}));await c.session();expect(options?.credentials).toBe("include");expect(options?.redirect).toBe("error");expect(options?.cache).toBe("no-store");});
