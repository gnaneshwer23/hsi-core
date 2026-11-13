import {expect,test} from "bun:test";
import {checkLiveRunGate,runLiveInvestigation} from "../src/liveRun";

const target={investigationId:"live-t1",diseaseScope:"ssc" as const,question:"Does X affect Y in cells?",release:{id:"r",version:"1",manifestHash:"0".repeat(64)}};
const base=(over:Record<string,unknown>={})=>({config:{},integrityConfig:{},env:{},target,auditDirectory:"/nonexistent/hsi-audit",
 fetcher:(()=>{throw Error("network call attempted")}) as never,clearance:{decide:async()=>{throw Error("clearance consulted")}},
 ops:{run:async()=>{throw Error("model call attempted")}} as never,runsToday:()=>0,...over});

test("an unconfigured live run is refused, lists both gates, and touches nothing",async()=>{
 const r=await runLiveInvestigation(base());
 expect("refused" in r&&r.refused).toBe(true);
 if("refused" in r){expect(r.reasons.join(" ")).toContain("live readiness");expect(r.reasons.join(" ")).toContain("source integrity readiness")}
});
test("the managed signing gap alone keeps a run refused",()=>{
 const g=checkLiveRunGate(base());
 expect(g?.reasons.some(x=>x.includes("engineering-managedSigningAdapter"))).toBe(true);
});
test("engaged kill switch and exhausted daily cap are reported as reasons",()=>{
 const cfg={limits:{killSwitchEnv:"HSI_LIVE_KILL",maxRunsPerDay:2}};
 const g=checkLiveRunGate(base({config:cfg,env:{HSI_LIVE_KILL:"1"},runsToday:()=>2}));
 expect(g?.reasons).toContain("kill switch engaged");expect(g?.reasons).toContain("daily run cap reached");
});
