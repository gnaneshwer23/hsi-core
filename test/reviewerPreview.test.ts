import {describe,expect,it} from "bun:test";
import {
 EMPTY_DRAFT,LIFECYCLE,MIN_RATIONALE,QUEUE,blockers,claimById,completeness,contextGaps,decided,disagreementCount,hasDisagreement,needsAttention,pendingCount,record,sourceCheckCount,type LogEntry,
} from "../site/src/landing-v2/workspace/reviewLogic";

const ok="x".repeat(MIN_RATIONALE);

describe("reviewer preview logic",()=>{
 it("builds a synthetic queue from the atlas with honest context gaps",()=>{
  expect(QUEUE.length).toBeGreaterThanOrEqual(5);
  expect(contextGaps(claimById["RC-1"]!)).toContain("Dose or exposure");
  expect(completeness(claimById["RC-5"]!)).toEqual({have:5,of:5});
  expect(completeness(claimById["RC-4"]!).have).toBe(1);
  expect(QUEUE.every(c=>c.statement.includes("→"))).toBe(true);
 });
 it("detects disagreement and what needs attention",()=>{
  expect(hasDisagreement(claimById["RC-1"]!)).toBe(true);
  expect(hasDisagreement(claimById["RC-5"]!)).toBe(false);
  expect(needsAttention(claimById["RC-5"]!)).toBe(false);
  expect(needsAttention(claimById["RC-4"]!)).toBe(true);
  expect(disagreementCount()).toBe(QUEUE.filter(hasDisagreement).length);
  expect(sourceCheckCount()).toBe(QUEUE.length); // correction and retraction checks are not connected for any claim
 });
 it("requires a decision, and a rationale unless abstaining",()=>{
  const c=claimById["RC-5"]!;
  expect(blockers(c,EMPTY_DRAFT)).toEqual(["Choose a decision."]);
  expect(blockers(c,{...EMPTY_DRAFT,decision:"reject"}).length).toBe(1);
  expect(blockers(c,{...EMPTY_DRAFT,decision:"reject",rationale:ok})).toEqual([]);
  expect(blockers(c,{...EMPTY_DRAFT,decision:"abstain"})).toEqual([]);
 });
 it("an approval is blocked by unacknowledged context gaps and disagreement; other decisions are not",()=>{
  const c=claimById["RC-1"]!;
  const approve={...EMPTY_DRAFT,decision:"approve" as const,rationale:ok};
  expect(blockers(c,approve).length).toBe(2);
  expect(blockers(c,{...approve,ackGaps:true}).length).toBe(1);
  expect(blockers(c,{...approve,ackGaps:true,ackDisagreement:true})).toEqual([]);
  expect(blockers(c,{...EMPTY_DRAFT,decision:"revise",rationale:ok})).toEqual([]);
  expect(blockers(claimById["RC-5"]!,approve)).toEqual([]); // complete context, no disagreement
 });
 it("the log is append-only, numbered, snapshots the gaps, and refuses blocked decisions",()=>{
  const c=claimById["RC-1"]!;
  let log:readonly LogEntry[]=[];
  expect(record(log,c,{...EMPTY_DRAFT,decision:"approve",rationale:ok})).toBe(log);
  log=record(log,c,{decision:"approve",rationale:ok,ackGaps:true,ackDisagreement:true});
  expect(log).toHaveLength(1);
  expect(log[0]).toMatchObject({n:1,claimId:"RC-1",decision:"approve",disagreement:true,version:2});
  expect(log[0]!.gaps).toContain("Dose or exposure");
  const before=log;
  log=record(log,claimById["RC-5"]!,{...EMPTY_DRAFT,decision:"abstain"});
  expect([...log].slice(0,1)).toEqual([...before]);expect(log[1]!.n).toBe(2);
  expect(decided(log,"RC-1")).toBe("approve");expect(decided(log,"RC-2")).toBeNull();
  expect(pendingCount(log)).toBe(QUEUE.length-2);
 });
 it("a later decision on a claim supersedes the displayed one without erasing the earlier",()=>{
  const c=claimById["RC-2"]!;
  let log:readonly LogEntry[]=[];
  log=record(log,c,{...EMPTY_DRAFT,decision:"revise",rationale:ok});
  log=record(log,c,{...EMPTY_DRAFT,decision:"reject",rationale:ok});
  expect(log).toHaveLength(2);expect(decided(log,"RC-2")).toBe("reject");
 });
 it("promotion is not available in the lifecycle",()=>{
  expect(LIFECYCLE.map(l=>l.id)).toEqual(["candidate","review","adjudicated","promoted"]);
  expect(LIFECYCLE.at(-1)!.note).toContain("Not available");
 });
});
