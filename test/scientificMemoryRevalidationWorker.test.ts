import {test,expect} from "bun:test";
import {createRevalidationWorker,type RevalidationLease} from "../src/scientificMemoryRevalidationWorker";
import type {createProvenanceCapture} from "../src/scientificMemoryProvenanceCapture";
const gateway={} as ReturnType<typeof createProvenanceCapture>;
const lease:RevalidationLease={jobId:"fixture-job",leaseId:"fixture-lease",doi:"10.1234/fixture-paper",version:"v1",pmid:"123",priorQuarantine:true};
test("idle does not call providers",async()=>{const worker=createRevalidationWorker({claim:async()=>null,commit:async()=>{throw Error("unexpected");},fail:async()=>{throw Error("unexpected");}},gateway);expect(await worker.runOnce()).toBe("idle");});
test("invalid identity requests failure without commit",async()=>{let failed=0;const worker=createRevalidationWorker({claim:async()=>({...lease,pmid:"0"}),commit:async()=>{throw Error("unexpected");},fail:async()=>{failed++;}},gateway);expect(await worker.runOnce()).toBe("retry_requested");expect(failed).toBe(1);});
test("provider failure and unavailable failure store require recovery",async()=>{const worker=createRevalidationWorker({claim:async()=>lease,commit:async()=>{throw Error("unexpected");},fail:async()=>{throw Error("unavailable");}},gateway);expect(await worker.runOnce()).toBe("recovery_required");});
