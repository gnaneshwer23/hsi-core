/** Generated ephemeral TEST owners/keys are engineering fixtures, not real release authorities. */
import {test,expect} from "bun:test";
import {generateKeyPairSync,sign} from "node:crypto";
import {PILOT_RELEASE_GATES,PILOT_OPERATING_OBJECTIVES,pilotReleaseSigningText,verifyPilotReleasePacket,assessPilotSoak,createPilotHealth,deliverPilotAlerts,type PilotReleasePacket,type PilotSoakWindow} from "../src/operations/pilotRelease";
import {opsHash} from "../src/operations/pilotOperationsStore";
import {opsFixture} from "./fixtures/pilotOperations";
const at=Date.parse("2026-11-12T12:00:00Z");
function signedFixture(){
 const keys=(["security","scientific","operations"] as const).map(role=>({role,ownerRef:"TEST_ONLY_"+role,keyId:"TEST_KEY_"+role,...generateKeyPairSync("ed25519")}));
 const binding={artifactSha:"a".repeat(40),artifactDigest:opsHash("artifact"),configurationHash:opsHash("config"),quotaPolicyHash:opsHash("quota"),invitationCohortHash:opsHash("cohort")};
 const packet:PilotReleasePacket={schemaVersion:"hsi-pilot-release-1",id:"release-TEST_ONLY",...binding,objectivesHash:opsHash(PILOT_OPERATING_OBJECTIVES),issuedAt:new Date(at-1000).toISOString(),expiresAt:new Date(at+60000).toISOString(),gates:Object.fromEntries(PILOT_RELEASE_GATES.map(g=>[g,opsHash(g)])) as PilotReleasePacket["gates"],humanReviewEveryMaterialBrief:true,humanReviewEveryGraphPromotion:true,clinicalUse:false,signatures:[]};
 packet.signatures=keys.map(k=>({role:k.role,ownerRef:k.ownerRef,keyId:k.keyId,signature:sign(null,Buffer.from(pilotReleaseSigningText(packet)),k.privateKey).toString("base64url")}));
 const policy={...binding,owners:keys.map(({privateKey,...publicPart})=>publicPart),verifyEvidence:async()=>true,now:()=>at};return {packet,policy};
}
test("exact tested artifact, three independent named signatures and independently verified live gates are required",async()=>{
 const {packet,policy}=signedFixture(),valid=await verifyPilotReleasePacket(packet,policy);expect(valid.pilotScopeAuthorized).toBe(true);expect(valid.scientificApproval).toBe(false);expect(valid.graphPromotionApproved).toBe(false);
 await expect(verifyPilotReleasePacket(packet,{...policy,artifactSha:"b".repeat(40)})).rejects.toThrow("Exact");await expect(verifyPilotReleasePacket(packet,{...policy,verifyEvidence:async()=>false})).rejects.toThrow("Live release evidence");await expect(verifyPilotReleasePacket(packet,{...policy,now:()=>at+60000})).rejects.toThrow("expired");
 const altered=structuredClone(packet);altered.humanReviewEveryMaterialBrief=false as never;await expect(verifyPilotReleasePacket(altered,policy)).rejects.toThrow();const swapped=structuredClone(packet);swapped.gates.p0_b=opsHash("altered");await expect(verifyPilotReleasePacket(swapped,policy)).rejects.toThrow("signature");
 const self=structuredClone(packet);self.signatures[1]!.ownerRef=self.signatures[0]!.ownerRef;await expect(verifyPilotReleasePacket(self,policy)).rejects.toThrow("independent");
});
function windows():PilotSoakWindow[]{return Array.from({length:336},(_,n)=>({startedAt:at+n*3600000,endedAt:at+(n+1)*3600000,authorizedRequests:200,successfulAuthorizedRequests:199,correctlyDeniedRequests:1000,unknownClassification:0,authorizedReadRequests:3,acceptedJobRequests:2,readLatencyMs:[100,200,300],acceptedJobAckMs:[100,200],acceptedInvestigations:2,completedInvestigations:1,reviewCorrections:1,usefulnessRatings:[4],evidenceHash:opsHash("TEST-window-"+n)}))}
test("14-day telemetry separates authorized success, correct denials, job completion and usefulness",async()=>{
 const r=await assessPilotSoak(windows(),opsHash("TEST-load"),async()=>true);expect(r.engineeringObjectivesMet).toBe(true);expect(r.successRate).toBe(0.995);expect(r.authorizedRequests).toBe(67200);expect(r.investigations.completionRate).toBe(0.5);expect(r.pilotAuthorized).toBe(false);
 const bad=windows();bad[0]!.unknownClassification=1;bad[1]!.readLatencyMs=[2000,2000,2000];bad.splice(3,1);const failed=await assessPilotSoak(bad,opsHash("TEST-load"),async()=>true);expect(failed.engineeringObjectivesMet).toBe(false);expect(failed.blockers.some(b=>b.includes("coverage"))).toBe(true);expect(failed.blockers.some(b=>b.includes("Unclassified"))).toBe(true);
 await expect(assessPilotSoak(windows(),opsHash("TEST-load"),async()=>false)).rejects.toThrow("Trusted");
});
test("liveness/configuration never claim authenticated database readiness",async()=>{
 let authenticated=false,connections=0;const health=createPilotHealth({configuration:()=>true,operationsReady:()=>true,authenticate:async()=>authenticated,databaseReady:async()=>{connections++;return true}});
 expect((await health(new Request("https://hsi.test/api/research/live"))).status).toBe(200);expect((await health(new Request("https://hsi.test/api/research/configuration"))).status).toBe(200);expect(connections).toBe(0);expect((await health(new Request("https://hsi.test/api/research/ready"))).status).toBe(401);authenticated=true;expect((await health(new Request("https://hsi.test/api/research/ready"))).status).toBe(200);expect(connections).toBe(1);
});
test("alert delivery needs verified transport and owner acknowledgement; no real messages sent",async()=>{
 const f=opsFixture();try{const id=f.store.recordSignal("clearance_failed",opsHash("TEST-evidence"));let delivered=0;
 const send=async()=>{delivered++;return {deliveryReceipt:"TEST-delivery",acknowledgementReceipt:null}};await expect(deliverPilotAlerts(f.store,send,async()=>false)).rejects.toThrow("Independent");expect(f.store.alerts()[0]!.delivery_receipt).toBeNull();expect((await deliverPilotAlerts(f.store,send,async()=>true)).unacknowledged).toBe(1);
 await deliverPilotAlerts(f.store,async()=>({deliveryReceipt:"TEST-delivery",acknowledgementReceipt:"TEST-owner-ack"}),async()=>true);expect(f.store.alerts()[0]!.id).toBe(id);expect(f.store.alerts()[0]!.acknowledgement_receipt).toBe("TEST-owner-ack");
 }finally{f.close()}
});
