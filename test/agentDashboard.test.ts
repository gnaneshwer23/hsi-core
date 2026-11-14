import {expect,test} from "bun:test";
import {intelligenceCapabilities} from "../site/src/lib/intelligenceCollective";
import {AGENT_STATE,agentSummary,PIPELINE} from "../site/src/lib/agentDashboard";

test("every capability has a dashboard state and none claims a live run or acceptance",()=>{
 for(const c of intelligenceCapabilities)expect(AGENT_STATE[c.slug]).toBeDefined();
 const s=agentSummary();
 expect(s.capabilities).toBe(intelligenceCapabilities.length);
 expect(s.liveRuns).toBe(0);expect(s.independentlyAccepted).toBe(0);
 expect(s.disabled).toBe(1);
});
test("the dashboard cannot drift from the maturity records",()=>{
 // If a record starts to claim a real run or an accepted state, this must be revisited deliberately.
 for(const c of intelligenceCapabilities)expect(c.maturity).not.toMatch(/\b(is|was|has been|been) (independently )?accepted\b|real live run completed|accepted by an independent/i);
 expect(PIPELINE.length).toBe(5);
});
