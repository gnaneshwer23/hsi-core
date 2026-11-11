import {describe,expect,test} from "bun:test";
import {authenticateEvidenceRequest} from "../src/server/authenticateEvidenceRequest";
const token="t".repeat(32);
const config={authBaseUrl:"https://auth.example.test",publicOrigin:"https://hsi.example.test",databaseUrl:"postgresql://unused"};
const request=new Request("https://hsi.example.test/api/research/health");
const provider={session:{id:"session-id",userId:"researcher-1",expiresAt:new Date(Date.now()+60000).toISOString()},user:{id:"researcher-1",email:"researcher@example.test",emailVerified:true}};
function deps(overrides:Record<string,unknown>={}){
 return {providerSession:async()=>provider,resolveToken:async()=>token,
 authenticateSession:async()=>({principalId:"researcher-1",authenticated:true as const,roles:["researcher"]}),...overrides};
}
describe("P1.12.2 provider verified evidence request",()=>{
 test("requires matching provider and database identity with server tenant",async()=>{
  const result=await authenticateEvidenceRequest({request,config,resolveOrganisation:async()=>"org-a",dependencies:deps()});
  expect(result).not.toBeNull();
  expect(await result!.gateway.verifySession(result!.sessionToken)).toEqual({
   subjectId:"researcher-1",sessionId:"session-id",organizationId:"org-a",roles:["researcher"],
  });
  expect(await result!.gateway.verifySession("different-token-value-long-enough")).toBeNull();
 });
 test("rejects provider/database user mismatch",async()=>{
  const result=await authenticateEvidenceRequest({request,config,resolveOrganisation:async()=>"org-a",
   dependencies:deps({authenticateSession:async()=>({principalId:"other-user",authenticated:true,roles:["researcher"]})})});
  expect(result).toBeNull();
 });
 test("rejects unverified email and never resolves token",async()=>{
  let called=false;
  const result=await authenticateEvidenceRequest({request,config,resolveOrganisation:async()=>"org-a",
   dependencies:deps({providerSession:async()=>({...provider,user:{...provider.user,emailVerified:false}}),resolveToken:async()=>{called=true;return token}})});
  expect(result).toBeNull();expect(called).toBe(false);
 });
 test("rejects missing organisation membership",async()=>{
  const result=await authenticateEvidenceRequest({request,config,resolveOrganisation:async()=>null,dependencies:deps()});
  expect(result).toBeNull();
 });
 test("rejects absent provider session",async()=>{
  const result=await authenticateEvidenceRequest({request,config,resolveOrganisation:async()=>"org-a",
   dependencies:deps({providerSession:async()=>null})});
  expect(result).toBeNull();
 });
});
