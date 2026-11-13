import {expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {runFixtureInvestigation} from "../src/investigationRunner";
import {buildReviewPacket,checkReviewerEligibility,renderReviewPacket} from "../src/reviewPacket";

const fixture=(n:string)=>JSON.parse(readFileSync(new URL("../research/runner-fixtures/"+n+".v1.json",import.meta.url),"utf8"));
const run=async()=>{const r=await runFixtureInvestigation({fixture:fixture("gut-immune-metabolic-crossdomain")});return buildReviewPacket({audit:r.audit,entailments:r.entailments,rejections:r.rejections})};
const ok={principal:"user:reviewer-1",scopes:["gut-immune-metabolic"],authenticated:true,declaredConflict:false,principalsInvolved:["user:author"]};

test("packet is deterministic, hashed and never an approval",async()=>{
 const a=await run(),b=await run();
 expect(a.packetHash).toBe(b.packetHash);expect(a.packetHash).toMatch(/^[a-f0-9]{64}$/);
 expect(a.scientificApproval).toBe(false);expect(a.graphPromotable).toBe(false);expect(a.humanReview).toBe("required");
 expect(a.units.length).toBe(2);expect(renderReviewPacket(a)).toContain("Not approved");
});
test("a changed audit changes the packet hash",async()=>{
 const r=await runFixtureInvestigation({fixture:fixture("gut-immune-metabolic-crossdomain")});
 const p1=buildReviewPacket({audit:r.audit}),p2=buildReviewPacket({audit:{...r.audit,question:r.audit.question+" extra"}});
 expect(p1.packetHash).not.toBe(p2.packetHash);
});
test("verifier disagreement and extraction rejections are flagged",async()=>{
 const r=await runFixtureInvestigation({fixture:fixture("gut-immune-metabolic-crossdomain")});
 const e=r.entailments;const claim=e[0]!.claimId;
 const split=[{...e[0]!,verdict:"supports"},{...e[0]!,verifierId:"other",verdict:"contradicts"}] as never;
 const p=buildReviewPacket({audit:r.audit,entailments:split,rejections:[{hitId:"h1",field:"claim",reason:"quote not found"}]});
 expect(p.flags.map(f=>f.code)).toContain("verifier_disagreement");expect(p.flags.find(f=>f.code==="verifier_disagreement")!.ref).toBe(claim);
 expect(p.flags.map(f=>f.code)).toContain("extraction_rejected");
});
test("reviewer eligibility: scoped, authenticated, independent, no conflict, not a system principal",async()=>{
 const p={...await run(),reviewerScopeAvailable:true};
 expect(checkReviewerEligibility(p,ok)).toEqual([]);
 expect(checkReviewerEligibility(p,{...ok,authenticated:false})).toContain("reviewer is not authenticated");
 expect(checkReviewerEligibility(p,{...ok,scopes:["ssc"]}).join()).toContain("not scoped");
 expect(checkReviewerEligibility(p,{...ok,principalsInvolved:["user:reviewer-1"]}).join()).toContain("involved");
 expect(checkReviewerEligibility(p,{...ok,declaredConflict:true}).join()).toContain("conflict");
 expect(checkReviewerEligibility(p,{...ok,principal:"system:worker"}).join()).toContain("system principal");
});
test("a scope with no accepted reviewer authority is flagged and cannot be routed",async()=>{
 const p=await run();
 expect(p.reviewerScopeAvailable).toBe(false); // no human has been appointed for this scope
 expect(p.flags.map(f=>f.code)).toContain("no_reviewer_authority");
 expect(checkReviewerEligibility(p,ok).join()).toContain("no reviewer authority");
});
