import {expect,test} from "bun:test";
import {investigatePublishedEvidence} from "../src/researchWorkbench";
import {createCandidateManifest,type ReleaseClaim} from "../src/graphRelease";
const source={id:"pmid:30760472",licenceStatus:"metadata_only" as const,retractionStatus:"none_reported" as const,polarity:"supports" as const,sourceVersion:"2026-11-04"};
const claim:ReleaseClaim={id:"HSI-C-SSC-001",subjectId:"Tfh",predicate:"increased_in",objectId:"SSc",assertion:"Cohort-specific finding",epistemicType:"observational_association",biologicalContext:{model:"human cohort"},status:"approved",sources:[source],reviews:[{id:"review-1",claimId:"HSI-C-SSC-001",decision:"approve",reviewerPrincipal:"test-reviewer",reviewerAuthorised:true,reviewedAt:"2026-11-04T10:00:00Z"}]};
function snapshot(claims:ReleaseClaim[]=[claim]){const m=createCandidateManifest("HSI-GR-test","1.0.0",claims,"2026-11-04T12:00:00Z");return {manifest:{...m,status:"published" as const},claims};}
test("returns source-grounded evidence, limitations and reproducible investigation ID",()=>{
 const s=snapshot();
 const r=investigatePublishedEvidence("What evidence links Tfh and SSc?",s,{subjectId:"Tfh"},"2026-11-04T12:30:00Z");
 expect(r.status).toBe("evidence_found");
 expect(r.evidence[0]?.sources[0]?.id).toBe("pmid:30760472");
 expect(r.gaps).toContain("Only observational associations found; mechanistic causality is not established");
 expect(r.hypotheses).toEqual([]);
 expect(investigatePublishedEvidence("What evidence links Tfh and SSc?",s,{subjectId:"Tfh"},"2026-11-04T12:30:00Z").id).toBe(r.id);
});
test("reports no evidence without inventing mechanisms",()=>{
 const r=investigatePublishedEvidence("Unmapped mechanism",snapshot(),{subjectId:"unknown"});
 expect(r.status).toBe("insufficient_evidence");
 expect(r.evidence).toHaveLength(0);
 expect(r.hypotheses).toHaveLength(0);
});
test("revoked evidence is excluded from workbench",()=>{
 const s=snapshot();
 s.claims[0]!.reviews=[...s.claims[0]!.reviews,{id:"revocation",claimId:claim.id,decision:"revoke",reviewerPrincipal:"test-reviewer",reviewerAuthorised:true,reviewedAt:"2026-11-04T11:00:00Z"}];
 expect(investigatePublishedEvidence("Tfh",s).evidence).toHaveLength(0);
});
test("invalid question and unpublished release fail closed",()=>{
 expect(()=>investigatePublishedEvidence(" ",snapshot())).toThrow("Research question");
 const s=snapshot();
 expect(()=>investigatePublishedEvidence("Tfh",{...s,manifest:{...s.manifest,status:"candidate" as "published"}})).toThrow("Unpublished");
});
