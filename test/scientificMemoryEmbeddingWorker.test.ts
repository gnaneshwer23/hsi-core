import {describe,expect,test} from "bun:test";
import {createScientificEmbeddingFixtureWorker} from "../src/scientificMemoryEmbeddingWorker";
const job={tenant_id:"a",scope_id:"s",record_id:"00000000-0000-4000-8000-000000000001",version:1,lease_id:"00000000-0000-4000-8000-000000000002",body:"synthetic memory"};
describe("scientific embedding fixture worker",()=>{
 test("claims and completes with parameterized vector",async()=>{
  const calls:{query:string;params:unknown[]}[]=[];
  const worker=createScientificEmbeddingFixtureWorker({async unsafe(query,params){calls.push({query,params});return calls.length===1?[job]:[{ok:true}];}});
  expect(await worker.runOnce()).toBe("succeeded");
  expect(calls[1]?.query).toContain("finish_embedding");
  expect(calls[1]?.params.slice(0,5)).toEqual(["a","s",job.record_id,1,job.lease_id]);
  expect(JSON.parse(String(calls[1]?.params[5]))).toHaveLength(8);
 });
 test("idle and lost lease",async()=>{
  expect(await createScientificEmbeddingFixtureWorker({async unsafe(){return [];}}).runOnce()).toBe("idle");
  expect(await createScientificEmbeddingFixtureWorker({async unsafe(q){return q.includes("claim_embedding")?[job]:[{ok:false}];}}).runOnce()).toBe("lease_lost");
 });
 test("invalid body reports bounded failure without content",async()=>{
  const worker=createScientificEmbeddingFixtureWorker({async unsafe(q,p){if(q.includes("claim_embedding"))return [{...job,body:" "}];expect(q).toContain("fail_embedding");expect(p[5]).toBe(false);expect(p).toHaveLength(6);return [{ok:true}];}});
  expect(await worker.runOnce()).toBe("failure_reported");
 });
 test("ambiguous completion failure does not report provider failure",async()=>{
  let calls=0;
  const worker=createScientificEmbeddingFixtureWorker({async unsafe(){if(++calls===1)return [job];throw Error("private error");}});
  expect(await worker.runOnce()).toBe("unavailable");expect(calls).toBe(2);
 });
 test("recovery bounds",async()=>{
  const worker=createScientificEmbeddingFixtureWorker({async unsafe(q,p){expect(q).toContain("recover_embedding_jobs");expect(p).toEqual([25]);return [{count:2}];}});
  expect(await worker.recover()).toBe(2);
  await expect(worker.recover(101)).rejects.toThrow("Invalid recovery limit");
 });
});
