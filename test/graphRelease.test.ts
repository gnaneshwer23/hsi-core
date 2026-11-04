import {expect,test} from "bun:test";
import {assessReleaseClaim,createCandidateManifest,queryPublishedGraph,type ReleaseClaim} from "../src/graphRelease";
const claim:ReleaseClaim={
 id:"HSI-C-SSC-001",subjectId:"Tfh",predicate:"associated_with",objectId:"SSc",
 assertion:"Cohort-specific association",epistemicType:"observational_association",biologicalContext:{model:"human"},
 status:"approved",sources:[{id:"pmid:30760472",licenceStatus:"metadata_only",retractionStatus:"none_reported",polarity:"supports",sourceVersion:"2026-11-04"}],
 reviews:[{id:"review-1",claimId:"HSI-C-SSC-001",decision:"approve",reviewerPrincipal:"oidc:scientist",reviewerAuthorised:true,reviewedAt:"2026-11-04T10:00:00Z"}]
};
test("constructs a candidate manifest, not a published release",()=>{
 const m=createCandidateManifest("HSI-GR-ssc-1","1.0.0",[claim],"2026-11-04T12:00:00Z");
 expect(m.status).toBe("candidate");
 expect(m.manifestHash).toHaveLength(64);
});
test("blocks unreviewed and rejected SSc candidates",()=>{
 expect(assessReleaseClaim({...claim,status:"under_review"}).eligible).toBe(false);
 expect(()=>createCandidateManifest("HSI-GR-ssc-1","1.0.0",[{...claim,status:"draft"}],"2026-11-04T12:00:00Z")).toThrow("Release blocked");
});
test("blocks retractions, unknown status, contradiction and hypotheses",()=>{
 for(const status of ["unknown","corrected","retracted"] as const){
  expect(assessReleaseClaim({...claim,sources:[{...claim.sources[0]!,retractionStatus:status}]}).eligible).toBe(false);
 }
 expect(assessReleaseClaim({...claim,epistemicType:"hypothesis"}).eligible).toBe(false);
 expect(assessReleaseClaim({...claim,sources:[...claim.sources,{...claim.sources[0]!,polarity:"contradicts"}]}).eligible).toBe(false);
});
test("latest revocation blocks publication and retrieval",()=>{
 const revoked={...claim,reviews:[...claim.reviews,{...claim.reviews[0]!,id:"review-2",decision:"revoke" as const,reviewedAt:"2026-11-04T11:00:00Z"}]};
 expect(assessReleaseClaim(revoked).eligible).toBe(false);
 const manifest=createCandidateManifest("HSI-GR-ssc-1","1.0.0",[claim],"2026-11-04T12:00:00Z");
 const published={manifest:{...manifest,status:"published" as const},claims:[revoked]};
 expect(queryPublishedGraph(published,{}).results).toHaveLength(0);
});
test("published snapshot query carries provenance and release ID",()=>{
 const manifest=createCandidateManifest("HSI-GR-ssc-1","1.0.0",[claim],"2026-11-04T12:00:00Z");
 const published={manifest:{...manifest,status:"published" as const},claims:[claim]};
 const out=queryPublishedGraph(published,{subjectId:"Tfh"});
 expect(out.results[0]?.sources[0]?.id).toBe("pmid:30760472");
 expect(out.releaseId).toBe("HSI-GR-ssc-1");
 expect(queryPublishedGraph(published,{subjectId:"different"}).results).toHaveLength(0);
 expect(()=>queryPublishedGraph(published,{limit:1000})).toThrow("Invalid query limit");
});
