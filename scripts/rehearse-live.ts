/** Offline rehearsal of the live path. Usage: bun scripts/rehearse-live.ts
 * Uses throwaway keys, a fake KMS client, a synthetic network and synthetic provider responses. No cloud, no network, nothing real. */
import {rehearse} from "../src/liveRehearsal";
const report=await rehearse();
console.log("# "+report.notice);
for(const s of report.steps)console.log(`${s.ok?"PASS":"FAIL"}  ${s.name}: ${s.detail}`);
console.log(report.ok?"\nRehearsal passed: the real loader and guarded execute path interlock.":"\nRehearsal FAILED.");
process.exit(report.ok?0:1);
export {};
