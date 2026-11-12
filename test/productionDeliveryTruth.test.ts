import {test,expect} from "bun:test";
import {readFileSync,existsSync} from "node:fs";
import {IMMUNO_DIMENSIONS,buildImmunoProtocol} from "../src/evidence/immunoBenchmark";
import {resolve} from "node:path";
test("production delivery ledger accounts for all proposals with existing file evidence and unopened future work",()=>{
 const ledger=JSON.parse(readFileSync(resolve("operations/production-delivery/implementation-truth.v1.json"),"utf8"));
 expect(ledger.items.map((r:any)=>r.proposalOrder)).toEqual([1,2,3,4,5,6,7,8,9]);expect(ledger.documentationAuthorizesRuntime).toBe(false);expect(ledger.productionPromotionAuthorized).toBe(false);expect(ledger.scientificApproval).toBe(false);
 for(const row of ledger.items){expect(row.deploymentAcceptance).toBe("not_verified");expect(row.scientificAcceptance).toBe("not_accepted");for(const path of [...row.implementationEvidence,...row.regressionEvidence])expect(existsSync(resolve(path))).toBe(true)}
 expect(ledger.benchmarkProfile.dimensions).toEqual([...IMMUNO_DIMENSIONS]);expect(ledger.benchmarkProfile.finalCaseCount).toBe(buildImmunoProtocol().finalCaseCount);for(const [layer,quota] of Object.entries(ledger.benchmarkProfile.quotas))expect(buildImmunoProtocol().slots.filter(s=>s.layer===layer)).toHaveLength(quota as number);expect(ledger.benchmarkProfile.scientificFloorsApproved).toBe(false);
 const ids=new Set(ledger.proposedNextPrs.map((p:any)=>p.id));for(const proposal of ledger.proposedNextPrs){expect(proposal.state).toBe("proposed_not_opened");expect(proposal.githubPrNumber).toBeNull();for(const dependency of proposal.dependsOn)expect(ids.has(dependency)).toBe(true)}
});
