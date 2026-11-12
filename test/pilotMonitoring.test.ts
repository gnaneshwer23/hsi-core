import {test,expect} from "bun:test";
import {recordPilotMonitoring,type PilotMonitoringPolicy,type PilotMonitoringWindow} from "../src/operations/pilotMonitoring";
import {opsHash} from "../src/operations/pilotOperationsStore";
import {opsFixture} from "./fixtures/pilotOperations";
test("all six monitoring categories need approved policy and verified evidence; no invented scientific floors",async()=>{
 const f=opsFixture();try{const policy:PilotMonitoringPolicy={minimumProviderAttempts:10,minimumReviewedClaims:10,maxProviderFailureRate:0.1,maxAbstentionRate:0.2,maxFalseSupportRate:0.1,maxFalseSupportIncrease:0.05,maxQueueAgeMs:60000,maxTenantDenials:5},window:PilotMonitoringWindow={evidenceHash:opsHash("TEST_ONLY_TELEMETRY"),clearanceFailures:1,providerAttempts:10,providerFailures:3,abstentions:4,reviewedSupportPredictions:20,falseSupportPredictions:5,referenceFalseSupportRate:0.01,oldestQueueAgeMs:60001,tenantDenials:6,budgetBreaches:1};
 await expect(recordPilotMonitoring(f.store,policy,window,async()=>false)).rejects.toThrow("Approved");expect(f.store.alerts()).toHaveLength(0);const result=await recordPilotMonitoring(f.store,policy,window,async()=>true);expect(result.signalIds).toHaveLength(6);expect(new Set(f.store.alerts().map(a=>a.kind)).size).toBe(6);expect(result.scientificApproval).toBe(false);await recordPilotMonitoring(f.store,policy,window,async()=>true);expect(f.store.alerts()).toHaveLength(6);
 }finally{f.close()}
});
