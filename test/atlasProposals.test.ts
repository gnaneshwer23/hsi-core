import {expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {runFixtureInvestigation} from "../src/investigationRunner";
import {assertProposalOnly,proposeEdgesFromAudit} from "../src/atlasProposals";
import {REQUIRED_CONTEXT} from "../src/evidence/canonicalContextualEdge";

const fixture=JSON.parse(readFileSync(new URL("../research/runner-fixtures/gut-immune-metabolic-crossdomain.v1.json",import.meta.url),"utf8"));
const audit=async()=>(await runFixtureInvestigation({fixture})).audit;
const urls=(a:Awaited<ReturnType<typeof audit>>)=>Object.fromEntries(a.units.flatMap(u=>u.evidenceSourceIds).map(id=>[id,"https://example.org/fixture/"+id]));

test("units become draft, non-promotable, synthetic-marked proposals with reported context only where the passage reported it",async()=>{
 const a=await audit(),b=proposeEdgesFromAudit({audit:a,submitterId:"atlas:proposer",sourceUrls:urls(a)});
 expect(b.proposals.length).toBe(a.units.length);expect(b.refused).toEqual([]);expect(b.graphPromotable).toBe(false);
 for(const p of b.proposals){
  expect(p.edge.review.state).toBe("draft");expect(p.edge.synthetic).toBe(true);expect(p.graphPromotable).toBe(false);
  expect(p.edge.context.disease.status).toBe("not_reported");expect(p.edge.context.denominator.status).toBe("not_reported");
  for(const k of REQUIRED_CONTEXT){const v=p.edge.context[k];if(v.status==="reported")expect(v.sourceLocator).toBeTruthy();else expect(v.value).toBeNull()}
  expect(p.edge.limitations.join(" ")).toContain("not causal");
 }
 expect(b.proposals.some(p=>p.edge.context.species.status==="reported")).toBe(true);
});
test("a unit with no https source URL is refused, not padded",async()=>{
 const a=await audit(),b=proposeEdgesFromAudit({audit:a,submitterId:"atlas:proposer",sourceUrls:{}});
 expect(b.proposals).toEqual([]);expect(b.refused.length).toBe(a.units.length);expect(b.refused[0]!.reasons).toContain("provenance");
});
test("proposals are deterministic and tamper-evident; only untouched drafts pass the storage guard",async()=>{
 const a=await audit(),mk=()=>proposeEdgesFromAudit({audit:a,submitterId:"atlas:proposer",sourceUrls:urls(a)});
 expect(mk().proposals.map(p=>p.proposalHash)).toEqual(mk().proposals.map(p=>p.proposalHash));
 const p=mk().proposals[0]!;expect(()=>assertProposalOnly(p)).not.toThrow();
 expect(()=>assertProposalOnly({...p,edge:{...p.edge,review:{state:"approved"}}})).toThrow();
 expect(()=>assertProposalOnly({...p,edge:{...p.edge,predicate:"causes"}})).toThrow("altered");
});
test("a reviewer-like identity cannot be the proposer",async()=>{
 const a=await audit();expect(()=>proposeEdgesFromAudit({audit:a,submitterId:"reviewer:1",sourceUrls:urls(a)})).toThrow();
 expect(()=>proposeEdgesFromAudit({audit:a,submitterId:"",sourceUrls:{}})).toThrow();
});
