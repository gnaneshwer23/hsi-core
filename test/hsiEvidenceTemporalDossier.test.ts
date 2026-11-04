import {test,expect} from "bun:test";
import {assessHsiRelationshipDossier,toHsiReleaseSources,type HsiRelationshipDossier} from "../src/hsiEvidenceTemporalDossier";
const base=():HsiRelationshipDossier=>({
 schemaVersion:"hsi-lhkg-dossier-1",
 relationship:{schemaVersion:"hsi-lhkg-edge-1",id:"edge:1",subjectId:"cell:1",predicate:"ASSOCIATED_WITH",objectId:"disease:1",layer:"human_biology",epistemicType:"association",visibility:"public_biomedical",reviewState:"approved",sourceEvidenceIds:["pmid:1"],version:"1.0.0",context:{species:"human"},causalClaim:false,reviewDecisionId:"review:1"},
 temporal:{assertedAt:"2026-11-04T12:00:00Z",sourceAsOf:"2026-11-01T12:00:00Z",validFrom:"2020-01-01T00:00:00Z"},
 observations:[{evidenceId:"pmid:1",sourceVersion:"1",retrievedAt:"2026-11-01T12:00:00Z",licenceStatus:"metadata_only",retractionStatus:"none_reported",polarity:"supports",context:{species:"human",assay:"flow cytometry"},uncertainty:"cohort-specific"}],
 reviews:[{id:"review:1",claimId:"edge:1",decision:"approve",reviewerPrincipal:"scientist:1",reviewerAuthorised:true,reviewedAt:"2026-11-04T12:00:00Z"}],generationMethod:"human_curated"
});
test("source-versioned reviewed association is eligible for dossier validation",()=>{
 const d=base();expect(assessHsiRelationshipDossier(d)).toEqual({valid:true,reasons:[],evidenceAssessment:"supported"});
 expect(toHsiReleaseSources(d)[0]?.sourceVersion).toBe("1");
});
test("contradictory source is preserved and blocks public release",()=>{
 const d=base();d.observations=[...d.observations,{...d.observations[0]!,evidenceId:"pmid:2",polarity:"contradicts"}];
 const result=assessHsiRelationshipDossier(d);expect(result.evidenceAssessment).toBe("contested");expect(result.reasons).toContain("contradiction_requires_adjudication");
});
test("retraction and licence failures block public release",()=>{
 for(const patch of [{retractionStatus:"retracted" as const},{licenceStatus:"unverified" as const}]){
  const d=base();d.observations=[{...d.observations[0]!,...patch}];expect(assessHsiRelationshipDossier(d).valid).toBe(false);
 }
});
test("reversed time and missing provenance fail closed",()=>{
 const d=base();d.temporal={...d.temporal,validUntil:"2010-01-01T00:00:00Z"};d.observations=[{...d.observations[0]!,sourceVersion:""}];
 const result=assessHsiRelationshipDossier(d);expect(result.reasons).toContain("reversed_validity_window");expect(result.reasons).toContain("incomplete_evidence_provenance");
});
test("revoked approval and computational inference cannot become public authority",()=>{
 const d=base();d.reviews=[{...d.reviews[0]!,decision:"revoke"}];d.relationship={...d.relationship,epistemicType:"computational_inference"};
 const result=assessHsiRelationshipDossier(d);expect(result.reasons).toContain("missing_current_authorised_review");expect(result.reasons).toContain("nonpublishable_epistemic_type");
});
