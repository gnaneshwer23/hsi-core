import {test, expect} from "bun:test";
import {
  assertHsiPhiRemainClosedUnderOwnerDeployApprovals,
  HSI_CLINICAL_PLANE_SYNTHETIC_ENGINEERING_APPROVAL,
  HSI_PUBLIC_L0_DEPLOY_APPROVAL,
  validateHsiClinicalPlaneSyntheticEngineeringApproval,
  validateHsiPublicL0DeployApproval,
} from "../src/hsiOwnerDeployAuthorizations";
import {buildHsiClinicalPlanePrivateRepoReadiness} from "../src/clinicalPlane/clinicalPlanePrivateRepoReadiness";
import {HSI_CDS_PHI_INVARIANTS} from "../src/cdsPhiBoundary";

test("public L0 deploy approval records owner GO without research writes or PHI", () => {
  validateHsiPublicL0DeployApproval(HSI_PUBLIC_L0_DEPLOY_APPROVAL);
  expect(HSI_PUBLIC_L0_DEPLOY_APPROVAL.publicLaunchGo).toBe(true);
  expect(HSI_PUBLIC_L0_DEPLOY_APPROVAL.publicL0DeployAuthorized).toBe(true);
  expect(HSI_PUBLIC_L0_DEPLOY_APPROVAL.productionResearchWritesEnabled).toBe(false);
  expect(HSI_PUBLIC_L0_DEPLOY_APPROVAL.phiAllowed).toBe(false);
  expect(HSI_PUBLIC_L0_DEPLOY_APPROVAL.scientificApproval).toBe(false);
});

test("clinical-plane synthetic approval keeps real PHI and ADR-0010 gates open", () => {
  validateHsiClinicalPlaneSyntheticEngineeringApproval(
    HSI_CLINICAL_PLANE_SYNTHETIC_ENGINEERING_APPROVAL,
  );
  expect(HSI_CLINICAL_PLANE_SYNTHETIC_ENGINEERING_APPROVAL.clinicalPlaneSyntheticEngineeringAuthorized).toBe(
    true,
  );
  expect(HSI_CLINICAL_PLANE_SYNTHETIC_ENGINEERING_APPROVAL.realPatientDataEnabled).toBe(false);
  expect(HSI_CLINICAL_PLANE_SYNTHETIC_ENGINEERING_APPROVAL.adr0010GatesClosed).toBe(false);
  expect(HSI_CLINICAL_PLANE_SYNTHETIC_ENGINEERING_APPROVAL.liveCds).toBe(false);
});

test("owner deploy approvals cannot flip scientific-plane CDS/PHI invariants", () => {
  assertHsiPhiRemainClosedUnderOwnerDeployApprovals();
  expect(HSI_CDS_PHI_INVARIANTS.mayUseLivePhi).toBe(false);
  expect(HSI_CDS_PHI_INVARIANTS.containsPhi).toBe(false);
  expect(HSI_CDS_PHI_INVARIANTS.clinicalActive).toBe(false);
  expect(HSI_CDS_PHI_INVARIANTS.notCds).toBe(true);
});

test("clinical-plane private-repo readiness catalogues every open ADR-0010 gate", () => {
  const readiness = buildHsiClinicalPlanePrivateRepoReadiness();
  expect(readiness.gates).toHaveLength(7);
  expect(readiness.gates.every((g) => g.status !== "closed")).toBe(true);
  expect(readiness.realPatientDataEnabled).toBe(false);
  expect(readiness.syntheticLiftReadyCodePresent).toBe(true);
  expect(readiness.liveCds).toBe(false);
});

test("approvals refuse false honesty flips", () => {
  expect(() =>
    validateHsiPublicL0DeployApproval({
      ...HSI_PUBLIC_L0_DEPLOY_APPROVAL,
      phiAllowed: true as false,
    }),
  ).toThrow("PHI");
  expect(() =>
    validateHsiClinicalPlaneSyntheticEngineeringApproval({
      ...HSI_CLINICAL_PLANE_SYNTHETIC_ENGINEERING_APPROVAL,
      realPatientDataEnabled: true as false,
    }),
  ).toThrow("real PHI");
});
