/** P1: evidence-based, fail-closed readiness audit across HSI's four scientific departments. */
import {HSI_SCIENTIFIC_DEPARTMENTS,type HsiScientificDepartment}
  from "./scientificDepartmentCoverage";

export type DepartmentEvidenceAudit={
  department:HsiScientificDepartment;
  liveSourceVerified:boolean;
  versionedProvenanceVerified:boolean;
  ontologyMappingReviewed:boolean;
  authenticatedResearchJourneyVerified:boolean;
  independentScientificEvaluationComplete:boolean;
  evidenceRunId?:string;
  reviewerAuditId?:string;
};
export type DepartmentReadiness={
  department:HsiScientificDepartment;
  readyForResearchPilot:boolean;
  scientificallyValidated:boolean;
  missing:readonly string[];
};
export function assessDepartmentEvidenceReadiness(
  audits:readonly DepartmentEvidenceAudit[],
):readonly DepartmentReadiness[]{
  const known=new Set(HSI_SCIENTIFIC_DEPARTMENTS.map(d=>d.id));
  const seen=new Set<HsiScientificDepartment>();
  for(const audit of audits){
    if(!known.has(audit.department))throw new Error("Unknown department");
    if(seen.has(audit.department))throw new Error("Duplicate department audit");
    seen.add(audit.department);
  }
  return HSI_SCIENTIFIC_DEPARTMENTS.map(d=>{
    const audit=audits.find(a=>a.department===d.id);
    const missing:string[]=[];
    if(!audit?.liveSourceVerified)missing.push("live_source");
    if(!audit?.versionedProvenanceVerified||!audit?.evidenceRunId?.trim())
      missing.push("versioned_provenance");
    if(!audit?.ontologyMappingReviewed)missing.push("ontology_review");
    if(!audit?.authenticatedResearchJourneyVerified)missing.push("authenticated_workflow");
    const readyForResearchPilot=missing.length===0;
    if(!audit?.independentScientificEvaluationComplete||!audit?.reviewerAuditId?.trim())
      missing.push("independent_scientific_evaluation");
    // Self-declared flags are not independently authenticated: this report
    // never issues scientific approval, even when all checks are marked true.
    return {department:d.id,readyForResearchPilot,
      scientificallyValidated:false as const,missing};
  });
}
