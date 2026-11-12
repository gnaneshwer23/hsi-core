import {test,expect} from "bun:test";
import {prepareControlledExpansion,type ExpansionRequest} from "../src/expansion/controlledExpansion";
import {opsHash} from "../src/operations/pilotOperationsStore";
const request:ExpansionRequest={pilotReleasePacketHash:opsHash("TEST-release"),pilotEvidenceHash:opsHash("TEST-pilot"),pilotFailureLedgerHash:opsHash("TEST-ledger"),scopes:[{domain:"sle",sourcePackRef:"TEST-SLE-pack",sourcePackVersion:"2",manifestHash:opsHash("TEST-manifest"),scopedReviewerGrantRef:"TEST-SLE-tenant-grant"}],trialContextRequested:true,communityRequested:false,clinicalPhiRequested:false};
const authority={loadAcceptedPilot:async()=>({receiptRef:"TEST-actual-acceptance",observedFailures:[{id:"TEST-failure",resolutionReceipt:"TEST-resolution"}]}),verifyPilotAndResolutions:async()=>true,verifyScope:async()=>true};
test("P2 requires actual accepted pilot and resolved observed failures; merged code alone cannot authorize it",async()=>{
 await expect(prepareControlledExpansion(request,{...authority,verifyPilotAndResolutions:async()=>false})).rejects.toThrow("P1-C actual");await expect(prepareControlledExpansion(request,{...authority,loadAcceptedPilot:async()=>({receiptRef:"TEST-merged-PR",observedFailures:[{id:"TEST-unresolved",resolutionReceipt:null}]})})).rejects.toThrow("Every observed");
 const candidate=await prepareControlledExpansion(request,authority);expect(candidate.agentCountIncrease).toBe(0);expect(candidate.plannerEnabled).toBe(false);expect(candidate.productionPromotionPerformed).toBe(false);expect(candidate.graphPromotable).toBe(false);
});
test("an SSc role cannot authorize another source pack/domain and community needs actual moderation evidence",async()=>{
 await expect(prepareControlledExpansion(request,{...authority,verifyScope:async scope=>scope.domain==="ssc"})).rejects.toThrow("scoped authority");await expect(prepareControlledExpansion({...request,communityRequested:true},authority)).rejects.toThrow("moderation");await expect(prepareControlledExpansion({...request,clinicalPhiRequested:true as never},authority)).rejects.toThrow("research-only");
 const c=await prepareControlledExpansion({...request,communityRequested:true},{...authority,verifyCommunityOperations:async()=>true});expect(c.communityLaunched).toBe(false);expect(c.clinicalPhiEnabled).toBe(false);
});

test("governed trial attach reuses registry-only projection with no eligibility/efficacy decision",async()=>{
 const {readFileSync}=await import("node:fs"),{attachTranslationalTrialFromCtgovStudy,buildTranslationalLandscapeSnapshot}=await import("../src/evidence/translationalEvidenceAttach"),{prepareGovernedTrialContext}=await import("../src/expansion/controlledExpansion");
 const study=JSON.parse(readFileSync(import.meta.dir+"/../research/domain-graph/living-evidence/fixtures/ctgov.nct01030861.json","utf8")),record=attachTranslationalTrialFromCtgovStudy({nctId:"NCT01030861",study,responseIdentity:opsHash("TEST-response"),retrievedAt:"2026-11-12T12:00:00Z"}),snapshot=buildTranslationalLandscapeSnapshot({origin:"fixture_replay",generatedAt:"2026-11-12T12:00:00Z",asOf:"2026-11-12T12:00:00Z",records:[record]});
 const input={investigationId:"TEST-investigation",sourceReleaseRef:"TEST-release",candidateHash:opsHash("TEST-expansion"),snapshot};await expect(prepareGovernedTrialContext(input,async()=>false)).rejects.toThrow("authority");const attached=await prepareGovernedTrialContext(input,async()=>true);expect(attached.eligibilityAssessed).toBe(false);expect(attached.section.confirmedEligible).toBe(false);expect(attached.section.relevanceScope).toBe("preliminary_research_only");expect(attached.graphPromotable).toBe(false);
});
