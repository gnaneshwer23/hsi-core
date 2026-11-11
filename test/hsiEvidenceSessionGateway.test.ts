import {describe,expect,test} from "bun:test";
import {createHsiEvidenceSessionGateway} from "../src/server/hsiEvidenceSessionGateway";

const token="s".repeat(24);
const valid={sessionId:"verified-session",actor:{principalId:"researcher-1",authenticated:true as const,roles:["researcher","scientific_reviewer"]}};
describe("P1.12.1 evidence session gateway",()=>{
 test("accepts server-verified identity and server-resolved tenant",async()=>{
  const gateway=createHsiEvidenceSessionGateway({
   verifyProviderSession:async()=>valid,resolveOrganisation:async()=> "org-a",
  });
  expect(await gateway.verifySession(token)).toEqual({subjectId:"researcher-1",sessionId:"verified-session",organizationId:"org-a",roles:["researcher","scientific_reviewer"]});
 });
 test("rejects missing/invalid session before provider lookup",async()=>{
  let calls=0;
  const gateway=createHsiEvidenceSessionGateway({verifyProviderSession:async()=>{calls++;return valid},resolveOrganisation:async()=> "org-a"});
  expect(await gateway.verifySession("short")).toBeNull();
  expect(await gateway.verifySession("x".repeat(5000))).toBeNull();
  expect(calls).toBe(0);
 });
 test("fails closed without server membership",async()=>{
  const gateway=createHsiEvidenceSessionGateway({verifyProviderSession:async()=>valid,resolveOrganisation:async()=>null});
  expect(await gateway.verifySession(token)).toBeNull();
 });
 test("fails closed on unverified or unprivileged identity",async()=>{
  const gateway=createHsiEvidenceSessionGateway({verifyProviderSession:async()=>({sessionId:"id",actor:{principalId:"user",authenticated:true,roles:["viewer"]}}),resolveOrganisation:async()=> "org-a"});
  expect(await gateway.verifySession(token)).toBeNull();
 });
 test("rejects unsafe organisation scope",async()=>{
  const gateway=createHsiEvidenceSessionGateway({verifyProviderSession:async()=>valid,resolveOrganisation:async()=> "org-a'; DROP TABLE evidence;"});
  expect(await gateway.verifySession(token)).toBeNull();
 });
});
