import {test,expect} from "bun:test";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {parseQuestionDesignBank,prepareResearchReadiness,QUESTION_DESIGN_CATEGORIES} from "../src/researchReadiness";
import {canonicalGraphContext} from "../src/investigationGraphContext";
import {PROMPT_VERSION,SOURCE_SELECTION_INSTRUCTIONS} from "../src/scientificEvaluation";
const value=JSON.parse(readFileSync(new URL("../evaluation/research-readiness/questions.draft.json",import.meta.url),"utf8")),digest=async(s:string)=>createHash("sha256").update(s).digest("hex");
test("50-question design spans eight categories without inventing expert ground truth",async()=>{
 const bank=parseQuestionDesignBank(value),r=await prepareResearchReadiness(value,digest);expect(bank.cases).toHaveLength(50);
 expect(r.readiness.categoryCoverage).toHaveLength(QUESTION_DESIGN_CATEGORIES.length);expect(r.readiness.categoryCoverage.every(c=>c.cases>0)).toBe(true);
 expect(r.readiness.independentlyLabelledCases).toBe(0);expect(r.readiness.scientificMetrics).toBeNull();expect(r.readiness.modelActivationAllowed).toBe(false);
 expect(r.packets[0]!.rows.every(r=>r.expectedOutcome===null&&r.acceptableAnswer===null&&r.annotator===null&&r.sourcePacketHash===null)).toBe(true);expect(r.packets[0]!.authorityVerified).toBe(false);
});
test("preparation binds case/bank/prompt hashes deterministically and separates two pending SME slots",async()=>{
 const a=await prepareResearchReadiness(value,digest),b=await prepareResearchReadiness(value,digest);expect(a).toEqual(b);
 expect(a.packets.map(p=>p.annotatorSlot)).toEqual(["a","b"]);expect(a.packets[0]!.bankHash).toBe(await digest(canonicalGraphContext(value)));
 const changed=structuredClone(value);changed.cases[0].question+=" Which limitations apply?";const c=await prepareResearchReadiness(changed,digest);expect(c.readiness.bankHash).not.toBe(a.readiness.bankHash);expect(c.packets[0]!.rows[0]!.caseHash).not.toBe(a.packets[0]!.rows[0]!.caseHash);
 expect(a.registry.methods[0]!.promptVersion).toBe(PROMPT_VERSION);expect(a.registry.methods[0]!.promptHash).toBe(await digest(SOURCE_SELECTION_INSTRUCTIONS));expect(a.registry.candidateModel.provider).toBeNull();expect(a.registry.candidateModel.costBudgetUsd).toBeNull();
});
for(const type of ["labels","source","partition","duplicate","missing_category","wrong_scope","extra","confidence"] as const)test("draft bank rejects unsupported readiness claims: "+type,()=>{
 const b=structuredClone(value);
 if(type==="labels")b.cases[0].acceptable_answer="Established mechanism";
 if(type==="source")b.cases[0].expected_evidence_ids=["invented-source"];
 if(type==="partition")b.cases[0].partition="held_out";
 if(type==="duplicate")b.cases[1].question=b.cases[0].question;
 if(type==="missing_category")for(const c of b.cases)if(c.category==="trial_relevance")c.category="evidence_retrieval";
 if(type==="wrong_scope")b.cases[0].indication="diabetes";
 if(type==="extra")b.cases[0].approved=true;
 if(type==="confidence")b.scientificGroundTruthEstablished=true;
 expect(()=>parseQuestionDesignBank(b)).toThrow();
});
test("committed pending artifacts match the current design bank and baseline instructions",async()=>{
 const r=await prepareResearchReadiness(value,digest),files=[["annotator-a.pending.json",r.packets[0]],["annotator-b.pending.json",r.packets[1]],["readiness.json",r.readiness],["method-registry.json",r.registry]] as const;
 for(const [file,expected] of files)expect(JSON.parse(readFileSync(new URL("../evaluation/research-readiness/"+file,import.meta.url),"utf8"))).toEqual(expected);
});
