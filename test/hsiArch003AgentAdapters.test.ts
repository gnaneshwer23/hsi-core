import {test,expect} from "bun:test";
import {createSscPlannerExecutor,createSscContradictionExecutor,type HsiInvestigationArtifactSink} from "../src/hsiArch003AgentAdapters";
import type {InterrogativeInvestigation} from "../src/interrogativeContracts";
import type {FalsificationReport} from "../src/interrogativeFalsificationEngine";
test("ARCH-003 adapters reuse deterministic engines and never approve a claim",async()=>{
 let draft:InterrogativeInvestigation|null=null;let report:FalsificationReport|null=null;
 const sink:HsiInvestigationArtifactSink={
  saveDraft:async d=>{draft=d;return "draft-ref"},
  loadDraft:async ref=>{if(ref!=="draft-ref"||!draft)throw Error("No draft");return draft},
  saveFalsification:async r=>{report=r;return "falsification-ref"}
 };
 const planner=createSscPlannerExecutor({sink,plan:{question:"Which SSc mechanisms require investigation?",actorPrincipal:"researcher-1",createdAt:"2026-11-04T12:00:00Z",dataClass:"public_biomedical",focus:"systemic_sclerosis",release:{id:"HSI-GR-SSC",version:"1.0.0",manifestHash:"a".repeat(64)}}});
 const context={investigationId:"inv-1",taskId:"plan",role:"question_planner" as const,dependencies:{},signal:new AbortController().signal,assertTool:()=>{}};
 expect((await planner(context)).outputRef).toBe("draft-ref");
 expect(draft!.state).toBe("draft");expect(draft!.review).toBeNull();
 const analyst=createSscContradictionExecutor({sink,draftRef:"draft-ref"});
 expect((await analyst({...context,role:"contradiction_analyst"})).outputRef).toBe("falsification-ref");
 expect(report!.limitations.length).toBeGreaterThan(0);
});
