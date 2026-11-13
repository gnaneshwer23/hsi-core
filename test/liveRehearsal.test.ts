import {expect,test} from "bun:test";
import {rehearse} from "../src/liveRehearsal";

test("the offline rehearsal passes: the real loader and guarded execute path interlock end to end",async()=>{
 const r=await rehearse();
 const failed=r.steps.filter(s=>!s.ok).map(s=>`${s.name}: ${s.detail}`);
 expect(failed).toEqual([]);expect(r.ok).toBe(true);expect(r.steps.length).toBeGreaterThanOrEqual(10);expect(r.notice).toContain("proves the wiring only");
});
