import {describe,expect,it} from "bun:test";
import {beginRun,EMPTY_FUNNEL,finishRun,MAX_RUNS,parseFunnel,reach,summarize} from "../site/src/lib/onboardingFunnel";

describe("onboarding funnel (local only)",()=>{
 it("starts a run at step 1 and keeps only the day",()=>{
  const {funnel,index}=beginRun(EMPTY_FUNNEL,"2026-11-16");
  expect(funnel.runs[index]).toEqual({day:"2026-11-16",reached:1,done:false});
 });
 it("records the furthest step and never moves backwards",()=>{
  let {funnel,index}=beginRun(EMPTY_FUNNEL,"2026-11-16");
  funnel=reach(funnel,index,3);funnel=reach(funnel,index,2);
  expect(funnel.runs[index]!.reached).toBe(3);
  expect(reach(funnel,index,9)).toBe(funnel);
 });
 it("marks a finished run and summarises where runs stop",()=>{
  let f=EMPTY_FUNNEL;
  const a=beginRun(f,"2026-11-16");f=reach(a.funnel,a.index,2);
  const b=beginRun(f,"2026-11-16");f=finishRun(b.funnel,b.index);
  const c=beginRun(f,"2026-11-17");f=c.funnel;
  expect(summarize(f)).toEqual({runs:3,done:1,byStep:[3,2,1,1]});
 });
 it("caps stored runs and ignores malformed or foreign data",()=>{
  let f=EMPTY_FUNNEL;for(let i=0;i<MAX_RUNS+5;i++)f=beginRun(f,"2026-11-16").funnel;
  expect(f.runs.length).toBe(MAX_RUNS);
  expect(parseFunnel("not json").runs).toEqual([]);
  expect(parseFunnel(JSON.stringify({v:1,runs:[{day:"x",reached:9,done:true,name:"A"},{day:"2026-11-16",reached:2,done:false,name:"A"}]})).runs).toEqual([{day:"2026-11-16",reached:2,done:false}]);
 });
});
