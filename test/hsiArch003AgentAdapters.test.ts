import {test,expect} from "bun:test";
import {
  createSscPlannerExecutor,
  createSscContradictionExecutor,
  createGapVerificationExecutor,
  createSscHypothesisGeneratorExecutor,
  createSafetyPolicyGateExecutor,
  type HsiInvestigationArtifactSink,
} from "../src/hsiArch003AgentAdapters";
import type {InterrogativeInvestigation} from "../src/interrogativeContracts";
import type {FalsificationReport} from "../src/interrogativeFalsificationEngine";
import type {GapVerificationOutcomeSection} from "../src/evidence/gapVerification";
import type {HypothesisRegistry} from "../src/evidence/hypothesisRegistry";
import {projectLivingEvidenceForOutcome} from "../src/evidence/livingEvidenceExpansion";
test("ARCH-003 adapters reuse deterministic engines and never approve a claim",async()=>{
 let draft:InterrogativeInvestigation|null=null;let report:FalsificationReport|null=null;let gaps:GapVerificationOutcomeSection|null=null;let hyps:HypothesisRegistry|null=null;
 const sink:HsiInvestigationArtifactSink={
  saveDraft:async d=>{draft=d;return "draft-ref"},
  loadDraft:async ref=>{if(ref!=="draft-ref"||!draft)throw Error("No draft");return draft},
  saveFalsification:async r=>{report=r;return "falsification-ref"},
  saveGapVerification:async r=>{gaps=r;return "gap-ref"},
  saveHypothesisRegistry:async r=>{hyps=r;return "hypothesis-ref"},
 };
 const planner=createSscPlannerExecutor({sink,plan:{question:"Which SSc mechanisms require investigation?",actorPrincipal:"researcher-1",createdAt:"2026-11-04T12:00:00Z",dataClass:"public_biomedical",focus:"systemic_sclerosis",release:{id:"HSI-GR-SSC",version:"1.0.0",manifestHash:"a".repeat(64)}}});
 const context={investigationId:"inv-1",taskId:"plan",role:"question_planner" as const,dependencies:{},signal:new AbortController().signal,assertTool:()=>{}};
 expect((await planner(context)).outputRef).toBe("draft-ref");
 expect(draft!.state).toBe("draft");expect(draft!.review).toBeNull();
 const analyst=createSscContradictionExecutor({sink,draftRef:"draft-ref"});
 expect((await analyst({...context,role:"contradiction_analyst"})).outputRef).toBe("falsification-ref");
 expect(report!.limitations.length).toBeGreaterThan(0);
 const verifier=createGapVerificationExecutor({sink,gapInput:{
  asOf:"2026-11-08T17:45:00.000Z",
  branches:draft!.branches.map(b=>({id:b.id,assessment:b.assessment,supportingClaimIds:[],opposingClaimIds:[],missingEvidence:b.missingEvidence,uncertainty:b.uncertainty})),
  claimContexts:[],
  localSourcePmids:[],
  contradictions:{recordedOpposingClaimIds:[],searchStatus:"not_recorded"},
  livingEvidence:projectLivingEvidenceForOutcome({sourcePmids:[],snapshot:null}),
 }});
 expect((await verifier({...context,role:"claim_verifier",assertTool:(tool)=>{expect(tool).toBe("evidence.get")}})).outputRef).toBe("gap-ref");
 expect(gaps!.honesty.scientificallyValidated).toBe(false);expect(gaps!.items.length).toBeGreaterThan(0);
 const hypothesize=createSscHypothesisGeneratorExecutor({sink,draftRef:"draft-ref",investigationId:"inv-1",now:()=>"2026-11-21T22:00:00Z"});
 expect((await hypothesize({...context,role:"hypothesis_generator",assertTool:(tool)=>{expect(tool).toBe("hypothesis.create")}})).outputRef).toBe("hypothesis-ref");
 expect(hyps!.records.every(r=>r.lifecycle==="proposed")).toBe(true);
 const policy=createSafetyPolicyGateExecutor({dataClass:"public_biomedical"});
 const policyOut=await policy({...context,role:"safety_policy_gate",assertTool:(tool)=>{expect(tool).toBe("policy.check")}});
 expect(policyOut.outputRef).toContain("policy-cleared");
 expect(policyOut.status).toBe("completed");
});
