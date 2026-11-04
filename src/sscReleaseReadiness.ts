/** ARCH-003 Step 8: explicit SSc release readiness assessment.
 * This evaluator does not publish releases or treat test fixtures as real evidence.
 */
export type SscReadinessEvidence={
 migrationsApplied:readonly string[];
 authenticatedResearcherCount:number;
 authorisedReviewerCount:number;
 evidenceSourceCount:number;
 approvedClaimCount:number;
 publishedReleaseCount:number;
 persistedInvestigationCount:number;
 reviewedInvestigationCount:number;
 ciPassed:boolean;
 integrationTestsPassed:boolean;
 scientificValidationPassed:boolean;
 safetyReviewPassed:boolean;
};
export type SscReadinessGate={
 id:string;name:string;passed:boolean;reason:string;
};
export type SscReadinessResult={
 schemaVersion:"hsi-ssc-release-readiness-1";
 decision:"BLOCKED"|"READY_FOR_HUMAN_RELEASE_REVIEW";
 gates:readonly SscReadinessGate[];
 blockingReasons:readonly string[];
};
export function assessSscReleaseReadiness(e:SscReadinessEvidence):SscReadinessResult{
 const required=["001","002","003","004","005","006","007"];
 const hasMigration=(prefix:string)=>e.migrationsApplied.some(m=>m===prefix||m.startsWith(prefix+"_"));
 const gates:SscReadinessGate[]=[
  {id:"schema",name:"Staging schema migrations",passed:required.every(hasMigration),reason:"All ARCH-003 dependencies must be migrated"},
  {id:"researcher",name:"Authenticated research access",passed:e.authenticatedResearcherCount>0,reason:"At least one independently verified research account is required"},
  {id:"reviewer",name:"Accountable scientific reviewer",passed:e.authorisedReviewerCount>0,reason:"An authorised SSc reviewer is required"},
  {id:"sources",name:"Real source provenance",passed:e.evidenceSourceCount>0,reason:"A rights-checked, non-retracted SSc source corpus is required"},
  {id:"claims",name:"Scientifically approved claims",passed:e.approvedClaimCount>0,reason:"Evidence must be reviewed before graph publication"},
  {id:"graph",name:"Published and verified graph release",passed:e.publishedReleaseCount>0,reason:"A verified manifest and release are required"},
  {id:"investigation",name:"Persisted interrogative workflow",passed:e.persistedInvestigationCount>0,reason:"A real authorised investigation must be persisted"},
  {id:"scientific_review",name:"Human investigation decision",passed:e.reviewedInvestigationCount>0,reason:"An accountable human decision must be recorded"},
  {id:"ci",name:"Continuous integration",passed:e.ciPassed,reason:"Current main commit must pass CI"},
  {id:"integration",name:"Live integration verification",passed:e.integrationTestsPassed,reason:"Authenticated graph, research and review paths must be tested end to end"},
  {id:"scientific_validation",name:"Independent SSc scientific validation",passed:e.scientificValidationPassed,reason:"An expert must evaluate source coverage, uncertainty and false claims"},
  {id:"safety",name:"Safety and governance sign-off",passed:e.safetyReviewPassed,reason:"Research boundary, access, audit and safety controls must be reviewed"}
 ];
 const blockingReasons=gates.filter(g=>!g.passed).map(g=>g.id+": "+g.reason);
 return {schemaVersion:"hsi-ssc-release-readiness-1",decision:blockingReasons.length?"BLOCKED":"READY_FOR_HUMAN_RELEASE_REVIEW",gates,blockingReasons};
}
