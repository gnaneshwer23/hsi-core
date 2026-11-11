import {describe,expect,test} from "bun:test";
import {handleGovernedEvidenceApi} from "../src/server/governedEvidenceApi";
import type {AuthenticatedEvidenceService} from "../src/evidence/authenticatedEvidenceService";
const origin="https://hsi.example.test";
const url=origin+"/api/research/evidence/review";
const decisionId="12345678-1234-4123-8123-123456789abc";
const body={snapshotId:"evidence.sha256."+"a".repeat(64),decision:"accepted",decisionId,notes:"Reviewed"};
function request(payload:unknown=body,headers:Record<string,string>={}){
 return new Request(url,{method:"POST",headers:{origin,"content-type":"application/json",...headers},body:JSON.stringify(payload)});
}
describe("P1.12.4 governed evidence HTTP boundary",()=>{
 test("fails closed before authentication or service invocation when disabled",async()=>{
  let called=false;
  const service={submit:async()=>{called=true;throw Error()},review:async()=>{called=true;throw Error()}} as unknown as AuthenticatedEvidenceService;
  const response=await handleGovernedEvidenceApi(request(),{enabled:false,allowedOrigin:origin,authenticate:async()=>{called=true;return "token"},service});
  expect(response.status).toBe(503);expect(called).toBe(false);
 });
 test("rejects cross-origin POST before authentication",async()=>{
  let called=false;
  const response=await handleGovernedEvidenceApi(request(body,{origin:"https://evil.example.test"}),{enabled:true,allowedOrigin:origin,authenticate:async()=>{called=true;return "token"},service:{} as AuthenticatedEvidenceService});
  expect(response.status).toBe(403);expect(called).toBe(false);
 });
 test("rejects unauthenticated review",async()=>{
  const response=await handleGovernedEvidenceApi(request(),{enabled:true,allowedOrigin:origin,authenticate:async()=>null,service:{} as AuthenticatedEvidenceService});
  expect(response.status).toBe(401);
 });
 test("passes only server token and validated review fields to service",async()=>{
  let seen:unknown;
  const service={review:async(input:unknown)=>{seen=input;return {snapshotId:body.snapshotId,status:"accepted",reviewDecisionId:decisionId}}} as AuthenticatedEvidenceService;
  const response=await handleGovernedEvidenceApi(request({...body,organizationId:"forged",roles:["research_admin"]}),{enabled:true,allowedOrigin:origin,authenticate:async()=>"server-token",service});
  expect(response.status).toBe(200);
  expect(seen).toEqual({sessionToken:"server-token",snapshotId:body.snapshotId,decision:"accepted",decisionId,notes:"Reviewed"});
 });
 test("rejects invalid review without invoking service",async()=>{
  let called=false;
  const response=await handleGovernedEvidenceApi(request({...body,decisionId:"bad"}),{enabled:true,allowedOrigin:origin,authenticate:async()=>{called=true;return "token"},service:{} as AuthenticatedEvidenceService});
  expect(response.status).toBe(400);expect(called).toBe(false);
 });
});
