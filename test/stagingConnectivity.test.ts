import {test,expect} from "bun:test";
import {createStagingConnectivity,type ConnectivityRequest} from "../src/researchV2/stagingConnectivity";
const batch=():ConnectivityRequest[]=>["a","b"].map(deploymentId=>({deploymentId,source:{sourceId:"source",sourceVersion:"v1",passage:"Synthetic evidence",receipt:null},payload:{instruction:"Return JSON",claim:"Synthetic claim",passage:"Synthetic evidence"}}));
function fixture(enabled=true){
 let calls=0,lookups=0,deny=false,denySecond=false,fail=false;
 const service=createStagingConnectivity({enabled,sources:{decide:async()=>{lookups++;return {state:deny||denySecond&&lookups===2?"revoked":"cleared",policyRef:"fixture",receipt:{permittedActions:["model_transmission"]} as any}}},providers:{run:async()=>{calls++;if(fail)throw Error("uncertain operation");return {runId:"run",providerRequestId:"req",responseId:"response",usage:{inputTokens:1,outputTokens:1},result:{},scientificApproval:false,graphPromotable:false} as any}}});
 return {service,get calls(){return calls},get lookups(){return lookups},deny(){deny=true},denySecond(){denySecond=true},fail(){fail=true}};
}
test("disabled or malformed/duplicate later request causes zero authority/provider calls",async()=>{
 const f=fixture(false);await expect(f.service.execute(batch())).rejects.toThrow("disabled");expect(f.lookups).toBe(0);
 for(const mutate of [(b:ConnectivityRequest[])=>{b[1]!.payload.passage="mismatch"},(b:ConnectivityRequest[])=>{b[1]!.deploymentId="a"}]){
  const x=fixture(),b=batch();mutate(b);await expect(x.service.execute(b)).rejects.toThrow();expect(x.lookups).toBe(0);expect(x.calls).toBe(0);
 }
});
test("clearance denial and cancellation prevent all provider calls",async()=>{
 const f=fixture();f.deny();await expect(f.service.execute(batch())).rejects.toThrow("clearance denied");expect(f.calls).toBe(0);
 const c=new AbortController();c.abort();await expect(f.service.execute(batch(),c.signal)).rejects.toThrow("cancelled");expect(f.calls).toBe(0);
});
test("returns only execution references; fixture completion never grants acceptance",async()=>{
 const f=fixture(),r=await f.service.execute(batch());expect(f.lookups).toBe(2);expect(f.calls).toBe(2);expect(r.receipts).toHaveLength(2);expect(r.liveAcceptance).toBe(false);expect(r.scientificApproval).toBe(false);expect(JSON.stringify(r)).not.toContain("Synthetic");
});
test("uncertain first dispatch stops without retrying or dispatching second deployment",async()=>{
 const f=fixture();f.fail();await expect(f.service.execute(batch())).rejects.toThrow("uncertain");expect(f.calls).toBe(1);
});

test("denied second source prevents dispatch to either deployment",async()=>{
 const f=fixture();f.denySecond();await expect(f.service.execute(batch())).rejects.toThrow("clearance denied");expect(f.lookups).toBe(2);expect(f.calls).toBe(0);
});
