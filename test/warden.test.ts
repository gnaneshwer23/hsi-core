import {expect,test} from "bun:test";
import {createWarden,WardenRefusal,WARDEN_CEILINGS} from "../src/warden";

const limits={maxModelCalls:2,maxRunsPerDay:3,maxRequestsPerWindow:2,windowMs:1000};
const make=(over:Record<string,unknown>={})=>createWarden({limits,killed:()=>false,runsToday:()=>0,...over} as never);
const code=(f:()=>void)=>{try{f();return "ok"}catch(e){return e instanceof WardenRefusal?e.code:"other"}};

test("model budget is spent before a call and refuses when exhausted",()=>{
 const w=make();expect(code(()=>w.spendModelCall())).toBe("ok");expect(code(()=>w.spendModelCall())).toBe("ok");
 expect(code(()=>w.spendModelCall())).toBe("model_budget");expect(w.snapshot().modelCallsRemaining).toBe(0);
});
test("kill switch refuses runs, model calls and requests; an unreadable switch fails closed",()=>{
 const w=make({killed:()=>true});for(const f of [()=>w.admitRun(),()=>w.spendModelCall(),()=>w.admitRequest()])expect(code(f)).toBe("kill_switch");
 const u=make({killed:()=>{throw Error("x")}});expect(code(()=>u.admitRun())).toBe("unreadable_state");
 expect(code(()=>make({killed:()=>undefined}).admitRun())).toBe("kill_switch");
});
test("daily cap and unreadable run counter",()=>{
 expect(code(()=>make({runsToday:()=>2}).admitRun())).toBe("ok");expect(code(()=>make({runsToday:()=>3}).admitRun())).toBe("daily_cap");
 for(const bad of [()=>NaN,()=>-1,()=>{throw Error("x")},()=>"1"])expect(code(()=>make({runsToday:bad}).admitRun())).toBe("unreadable_state");
});
test("sliding window rate limit recovers after the window",()=>{
 let t=0;const w=make({now:()=>t});
 expect(code(()=>w.admitRequest())).toBe("ok");expect(code(()=>w.admitRequest())).toBe("ok");expect(code(()=>w.admitRequest())).toBe("rate_limit");
 t=1000;expect(code(()=>w.admitRequest())).toBe("ok");
});
test("limits cannot be raised past ceilings or mutated after construction",()=>{
 expect(()=>make({limits:{...limits,maxModelCalls:WARDEN_CEILINGS.maxModelCalls+1}})).toThrow();
 expect(()=>make({limits:{...limits,maxRunsPerDay:0}})).toThrow();expect(()=>make({limits:{...limits,windowMs:1.5}})).toThrow();
 const w=make();expect(()=>{(w.limits as {maxModelCalls:number}).maxModelCalls=99}).toThrow();
});
