import {describe,it,expect} from "bun:test";
import {createLiveEvidenceRepository,LiveConflict,LiveDenied,LiveRetryMismatch,type LiveSql} from "../src/liveEvidenceRepository";
import {createLiveInvestigationTrace} from "../src/liveInvestigationTrace";
const requestId="11111111-1111-4111-8111-111111111111";
async function fixture(){
 let calls=0;const fetcher=(async()=>new Response(JSON.stringify(++calls===1?{esearchresult:{count:"1",idlist:["12345"]}}:{result:{"12345":{title:"Public research",authors:[{name:"A Researcher"}],fulljournalname:"Journal",pubdate:"2026"}}}))) as unknown as typeof fetch;
 return (await createLiveInvestigationTrace("How does exercise influence neural plasticity?",fetcher)).bundle;
}
describe("A-01 owner-scoped live repository",()=>{
 it("rejects unverified owner and invalid request IDs",async()=>{
  expect(()=>createLiveEvidenceRepository({} as LiveSql,"")).toThrow(LiveDenied);
  const repo=createLiveEvidenceRepository({} as LiveSql,"researcher-1");
  await expect(repo.create("not-a-uuid",await fixture())).rejects.toThrow(LiveDenied);
 });
 it("does not allow a different owner to fetch an investigation",async()=>{
  let observed:unknown[]=[];
  const db:LiveSql={query:async(sql,params)=>{observed=params;return []},transaction:async work=>work(db)};
  const repo=createLiveEvidenceRepository(db,"researcher-2");
  expect(await repo.get("hsi-live-"+"a".repeat(32))).toBeNull();
  expect(observed[0]).toBe("researcher-2");
 });
 it("does not accept fabricated claims",async()=>{
  const bundle=await fixture();bundle.claims=[{} as never];
  const db:LiveSql={query:async()=>[],transaction:async work=>work(db)};
  await expect(createLiveEvidenceRepository(db,"researcher-1").create(requestId,bundle)).rejects.toThrow();
 });
 it("returns the first immutable snapshot on same-question retry even when run IDs differ",async()=>{
  const first=await fixture(),second=await fixture();
  const row={id:"hsi-live-"+"a".repeat(32),owner_id:"researcher-1",request_id:requestId,question:first.context.question,revision:1,bundle:first,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
  let insert=0;
  const db:LiveSql={query:async(sql)=>sql.startsWith("INSERT")?(++insert===1?[row]:[]):[row],transaction:async work=>work(db)};
  const repo=createLiveEvidenceRepository(db,"researcher-1");
  expect((await repo.create(requestId,first)).created).toBe(true);
  const retry=await repo.create(requestId,second);
  expect(retry.created).toBe(false);
  expect(retry.record.bundle).toEqual(first);
 });
 it("rejects reuse of an idempotency key for a different question",async()=>{
  const first=await fixture(),second=await fixture();second.context.question="How do mitochondria regulate cellular energy?";
  const row={id:"hsi-live-"+"a".repeat(32),owner_id:"researcher-1",request_id:requestId,question:first.context.question,revision:1,bundle:first,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
  const db:LiveSql={query:async(sql)=>sql.startsWith("INSERT")?[]:[row],transaction:async work=>work(db)};
  await expect(createLiveEvidenceRepository(db,"researcher-1").create(requestId,second)).rejects.toThrow(LiveRetryMismatch);
 });
 it("rejects changing source provenance during revision",async()=>{
  const first=await fixture(),changed=structuredClone(first);changed.sources[0]!.title="Tampered title";
  const row={id:"hsi-live-"+"a".repeat(32),owner_id:"researcher-1",request_id:requestId,question:first.context.question,revision:1,bundle:first,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
  const db:LiveSql={query:async()=>[row],transaction:async work=>work(db)};
  await expect(createLiveEvidenceRepository(db,"researcher-1").revise(row.id,1,changed)).rejects.toThrow(LiveDenied);
 });
 it("requires optimistic concurrency revision",async()=>{
  const db:LiveSql={query:async()=>[],transaction:async work=>work(db)};
  await expect(createLiveEvidenceRepository(db,"researcher-1").revise("hsi-live-"+"a".repeat(32),1,await fixture())).rejects.toThrow(LiveConflict);
 });
});
