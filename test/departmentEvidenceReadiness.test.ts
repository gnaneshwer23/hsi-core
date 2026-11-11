import {describe,expect,test} from "bun:test";
import {assessDepartmentEvidenceReadiness} from "../src/evidence/departmentEvidenceReadiness";
describe("P1 four-department evidence readiness",()=>{
  test("defaults to not ready across all four departments",()=>{
    const result=assessDepartmentEvidenceReadiness([]);
    expect(result).toHaveLength(4);
    expect(result.every(x=>!x.readyForResearchPilot&&!x.scientificallyValidated)).toBe(true);
    expect(result.every(x=>x.missing.includes("live_source"))).toBe(true);
  });
  test("requires immutable evidence run ID and authenticated workflow",()=>{
    const result=assessDepartmentEvidenceReadiness([{
      department:"immunology",liveSourceVerified:true,
      versionedProvenanceVerified:true,ontologyMappingReviewed:true,
      authenticatedResearchJourneyVerified:false,
      independentScientificEvaluationComplete:false,
    }]);
    expect(result[0]?.missing).toContain("versioned_provenance");
    expect(result[0]?.missing).toContain("authenticated_workflow");
  });
  test("cannot grant scientific approval from caller-supplied flags",()=>{
    const result=assessDepartmentEvidenceReadiness([{
      department:"immunology",liveSourceVerified:true,
      versionedProvenanceVerified:true,ontologyMappingReviewed:true,
      authenticatedResearchJourneyVerified:true,
      independentScientificEvaluationComplete:true,
      evidenceRunId:"run-123",reviewerAuditId:"review-123",
    }]);
    expect(result[0]?.readyForResearchPilot).toBe(true);
    expect(result[0]?.scientificallyValidated).toBe(false);
  });
  test("rejects duplicate audits",()=>{
    const audit={
      department:"metabolism" as const,liveSourceVerified:false,
      versionedProvenanceVerified:false,ontologyMappingReviewed:false,
      authenticatedResearchJourneyVerified:false,independentScientificEvaluationComplete:false,
    };
    expect(()=>assessDepartmentEvidenceReadiness([audit,audit])).toThrow();
  });
});
