import {expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {runFixtureInvestigation} from "../src/investigationRunner";
import {validateContextConflictAudit} from "../src/evidence/contextConflictAudit";
import {comparabilityPolicyDigest,validateComparabilityPolicy,type ComparabilityPolicy} from "../src/evidence/passageLinkedContext";

const base=JSON.parse(readFileSync(new URL("../research/runner-fixtures/gut-immune-metabolic-crossdomain.v1.json",import.meta.url),"utf8"));
const ADD=" Effect size was reported as fold change in cytokine B.";
function variant(mutate?:(f:any)=>void){
 const f=structuredClone(base);
 for(const h of [...f.searches.support,...f.searches.oppose])h.text+=ADD;
 for(const id of Object.keys(f.recorded.extraction))f.recorded.extraction[id].context.estimand={quote:"fold change in cytokine B"};
 mutate?.(f);return f;
}
const policy:ComparabilityPolicy={id:"gut-tier-1",version:1,criticalFields:["species","estimand","tissueCompartment","cellType","assay"],reviewRef:"review:panel-1",reviewers:["user:scientist-1"]};

test("without a policy behaviour is unchanged: any unreported field abstains and no policy is recorded",async()=>{
 const r=await runFixtureInvestigation({fixture:variant()});
 expect(r.audit.report.map(x=>x.classification)).toEqual(["insufficient_evidence"]);
 expect("comparabilityPolicy" in r.audit).toBe(false);expect(r.audit.comparisons[0]!.trace.detailedComparability!.nonBlockingMissing).toBeUndefined();
});
test("with a reviewed policy, only critical gaps block: a real difference is surfaced, with the limitation stated",async()=>{
 const r=await runFixtureInvestigation({fixture:variant(),comparabilityPolicy:policy});
 const d=r.audit.comparisons[0]!.trace.detailedComparability!;
 expect(d.status).toBe("method_difference");expect(d.missing).toEqual([]);expect(d.nonBlockingMissing!.length).toBeGreaterThan(5);expect(d.policyDigest).toBe(comparabilityPolicyDigest(policy));
 expect(r.audit.report[0]!.classification).toBe("methodological_difference");expect(r.audit.report[0]!.reasons[0]).toContain("Limited comparison");
 expect(r.audit.comparabilityPolicy).toEqual(policy);expect(r.audit.graphPromotable).toBe(false);expect(r.audit.humanReview.status).toBe("required");
});
test("a missing CRITICAL field still abstains under a policy",async()=>{
 const f=variant(x=>{for(const id of Object.keys(x.recorded.extraction))delete x.recorded.extraction[id].context.estimand;for(const h of [...x.searches.support,...x.searches.oppose])h.text=h.text.replace(ADD,"")});
 const r=await runFixtureInvestigation({fixture:f,comparabilityPolicy:policy});
 expect(r.audit.report[0]!.classification).toBe("insufficient_evidence");expect(r.audit.comparisons[0]!.trace.detailedComparability!.missing).toContain("estimand");
});
test("consistency is never confirmed while optional context is unknown",async()=>{
 const f=variant(x=>{ // two findings with identical critical context and polarity, different wording
  x.searches.oppose[0].text=x.searches.support[0].text.replace("In a synthetic mouse study","In a second synthetic mouse study");
  const ids=Object.keys(x.recorded.extraction),[k1,k2]=[ids[0]!,ids[1]!];
  x.recorded.extraction[k2]=structuredClone(x.recorded.extraction[k1]);
  for(const v of Object.keys(x.recorded.entailment))x.recorded.entailment[v][k2]=structuredClone(x.recorded.entailment[v][k1]);
 });
 const r=await runFixtureInvestigation({fixture:f,comparabilityPolicy:policy});
 expect(r.audit.comparisons[0]!.outcome).toBe("consistent");            // the comparator sees agreement ...
 expect(r.audit.report[0]!.classification).toBe("insufficient_evidence"); // ... but the report will not confirm it
 expect(r.audit.report[0]!.reasons[0]).toContain("Limited comparison");
});
test("the policy is recorded in the audit and re-derived on validation; tampering is detected",async()=>{
 const r=await runFixtureInvestigation({fixture:variant(),comparabilityPolicy:policy});
 expect(()=>validateContextConflictAudit(r.audit)).not.toThrow();
 const tampered=structuredClone(r.audit);tampered.comparabilityPolicy!.criticalFields=["species","estimand"];
 expect(()=>validateContextConflictAudit(tampered)).toThrow();
});
test("policy validation: floor, known fields, named humans and a review reference",()=>{
 expect(()=>validateComparabilityPolicy(policy)).not.toThrow();
 const bad=(o:Partial<ComparabilityPolicy>)=>()=>validateComparabilityPolicy({...policy,...o} as ComparabilityPolicy);
 expect(bad({criticalFields:["species"]})).toThrow();                 // estimand is part of the floor
 expect(bad({criticalFields:["estimand"]})).toThrow();                // so is species
 expect(bad({criticalFields:["species","estimand","bogus" as never]})).toThrow();
 expect(bad({reviewers:[]})).toThrow();expect(bad({reviewers:["model:judge"]})).toThrow();expect(bad({reviewRef:""})).toThrow();
 expect(bad({version:0})).toThrow();expect(bad({id:"X"})).toThrow();
});
test("an invalid policy cannot start an audit",async()=>{
 await expect(runFixtureInvestigation({fixture:variant(),comparabilityPolicy:{...policy,reviewers:[]}})).rejects.toThrow("Invalid comparability policy");
});
