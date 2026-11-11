import {describe,expect,test} from "bun:test";
import {evaluateEvidenceStagingGate} from "../scripts/inspect-evidence-staging-gate";
const tables=[
 {name:"hsi_research_evidence_snapshots",rls:true,force:true},
 {name:"hsi_research_evidence_review_events",rls:true,force:true},
];
const role={rolsuper:false,rolbypassrls:false,rolcanlogin:true};
describe("P1.12.5 staging evidence security gate",()=>{
 test("accepts pinned staging with dedicated login, FORCE RLS and policies",()=>{
  expect(evaluateEvidenceStagingGate({stagingPinned:true,role,tables,policyCount:5}).readyForLiveTests).toBe(true);
 });
 test("blocks current NOLOGIN role",()=>{
  const result=evaluateEvidenceStagingGate({stagingPinned:true,role:{...role,rolcanlogin:false},tables,policyCount:5});
  expect(result.roleNonPrivileged).toBe(true);
  expect(result.readyForLiveTests).toBe(false);
 });
 test("blocks owner or bypass RLS role",()=>{
  for(const unsafe of [{...role,rolsuper:true},{...role,rolbypassrls:true}]){
   expect(evaluateEvidenceStagingGate({stagingPinned:true,role:unsafe,tables,policyCount:5}).readyForLiveTests).toBe(false);
  }
 });
 test("blocks unpinned branch and missing FORCE RLS",()=>{
  expect(evaluateEvidenceStagingGate({stagingPinned:false,role,tables,policyCount:5}).readyForLiveTests).toBe(false);
  expect(evaluateEvidenceStagingGate({stagingPinned:true,role,tables:[{...tables[0],force:false},tables[1]],policyCount:5}).readyForLiveTests).toBe(false);
 });
 test("blocks missing role or policies",()=>{
  expect(evaluateEvidenceStagingGate({stagingPinned:true,tables,policyCount:5}).readyForLiveTests).toBe(false);
  expect(evaluateEvidenceStagingGate({stagingPinned:true,role,tables,policyCount:0}).readyForLiveTests).toBe(false);
 });
});
