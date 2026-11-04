import {test,expect} from "bun:test";
import {planSscInterrogation} from "../src/interrogativeQuestionEngine";
import {validateInterrogativeInvestigation,INTERROGATION_LIMITS} from "../src/interrogativeContracts";
const input={question:"What mechanisms might contribute to systemic sclerosis fibrosis?",actorPrincipal:"researcher-1",createdAt:"2026-11-04T15:00:00Z",dataClass:"public_biomedical" as const,focus:"systemic_sclerosis" as const,release:{id:"HSI-GR-SSC-1",version:"1.0.0",manifestHash:"a".repeat(64)}};
test("SSc plan is bounded, deterministic and contract-valid",()=>{
 const a=planSscInterrogation(input),b=planSscInterrogation(input);
 expect(a).toEqual(b);expect(()=>validateInterrogativeInvestigation(a)).not.toThrow();
 expect(a.questions.length).toBeLessThanOrEqual(INTERROGATION_LIMITS.maxQuestions);
 expect(a.branches.length).toBeLessThanOrEqual(INTERROGATION_LIMITS.maxBranches);
});
test("all candidates are unvalidated and ask falsification questions",()=>{
 const p=planSscInterrogation(input);
 expect(p.questions.filter(q=>q.purpose==="falsify").length).toBe(p.branches.length);
 expect(p.branches.every(b=>b.classification==="unvalidated_hypothesis"&&b.supporting.length===0&&b.opposing.length===0&&b.assessment==="insufficient_evidence"&&b.falsificationTest.length>0)).toBe(true);
 expect(p.state).toBe("draft");expect(p.review).toBeNull();
});
test("invalid input and unsupported disease scope fail closed",()=>{
 expect(()=>planSscInterrogation({...input,question:" "})).toThrow();
 expect(()=>planSscInterrogation({...input,focus:"other" as "systemic_sclerosis"})).toThrow();
 expect(()=>planSscInterrogation({...input,dataClass:"synthetic" as "public_biomedical"})).toThrow();
});
