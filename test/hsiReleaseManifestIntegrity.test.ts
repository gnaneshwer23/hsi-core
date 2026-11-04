import {test,expect} from "bun:test";
import {computeReleaseManifestHash,createCandidateManifest,type ReleaseClaim} from "../src/graphRelease";
const reviewed:ReleaseClaim={
 id:"ssc-claim-1",subjectId:"cell:fibroblast",predicate:"associated_with",objectId:"disease:ssc",
 assertion:"Reviewed research assertion",epistemicType:"association",biologicalContext:{tissue:"skin"},
 status:"approved",
 sources:[{id:"pmid:1",licenceStatus:"metadata_only",retractionStatus:"none_reported",polarity:"supports",sourceVersion:"sha256-1"}],
 reviews:[{id:"review-1",claimId:"ssc-claim-1",decision:"approve",reviewerPrincipal:"reviewer-1",reviewerAuthorised:true,reviewedAt:"2026-11-04T12:00:00Z"}]
};
test("canonical manifest hashing agrees with eligible candidate creation",()=>{
 const manifest=createCandidateManifest("HSI-GR-SSC-1","1.0.0",[reviewed],"2026-11-04T13:00:00.000Z");
 expect(manifest.manifestHash).toBe(computeReleaseManifestHash(manifest));
});
test("canonical hash is insensitive to claim input order but detects tampering",()=>{
 const args={schemaVersion:"hsi-graph-release-1" as const,releaseId:"HSI-GR-SSC-1",releaseVersion:"1.0.0",generatedAt:"2026-11-04T13:00:00.000Z",claimIds:["a","b"]};
 expect(computeReleaseManifestHash(args)).toBe(computeReleaseManifestHash({...args,claimIds:["b","a"]}));
 expect(computeReleaseManifestHash(args)).not.toBe(computeReleaseManifestHash({...args,claimIds:["a","c"]}));
});
test("unresolved source retraction blocks release",()=>{
 expect(()=>createCandidateManifest("HSI-GR-SSC-1","1.0.0",[{...reviewed,sources:[{...reviewed.sources[0]!,retractionStatus:"unknown"}]}],"2026-11-04T13:00:00.000Z")).toThrow("Release blocked");
});
