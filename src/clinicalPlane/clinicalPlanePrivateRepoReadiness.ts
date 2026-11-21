/** ADR-0010 clinical-plane private-repo readiness soft-land (U36).
 *
 * Catalogues gates before real patient data. Owner approved *synthetic*
 * clinical-plane engineering on 21 Nov 2026; every real-data gate remains open.
 * Does not create a private repo, enable PHI, or flip releaseGate real_data.
 */
import {
  HSI_CLINICAL_PLANE_SYNTHETIC_ENGINEERING_APPROVAL,
  validateHsiClinicalPlaneSyntheticEngineeringApproval,
} from "../hsiOwnerDeployAuthorizations";

export const HSI_CLINICAL_PLANE_PRIVATE_REPO_READINESS_SCHEMA =
  "hsi-clinical-plane-private-repo-readiness-1" as const;

export const HSI_ADR0010_REAL_DATA_GATES = [
  "clinical_plane_repository_and_uk_or_onprem_deploy",
  "independent_security_review_migrations_031_033",
  "clinical_safety_officer_dcb0129",
  "dpia_uk_gdpr_article_9",
  "data_sharing_agreement_hra_rec",
  "de_identification_process",
  "intended_purpose_mhra_samd_position",
] as const;

export type HsiAdr0010RealDataGate = (typeof HSI_ADR0010_REAL_DATA_GATES)[number];

export type HsiClinicalPlanePrivateRepoReadiness = {
  schemaVersion: typeof HSI_CLINICAL_PLANE_PRIVATE_REPO_READINESS_SCHEMA;
  authorization: typeof HSI_CLINICAL_PLANE_SYNTHETIC_ENGINEERING_APPROVAL;
  gates: ReadonlyArray<{
    gate: HsiAdr0010RealDataGate;
    status: "not_started" | "interim_insufficient" | "closed";
    notes: string;
  }>;
  syntheticLiftReadyCodePresent: true;
  realPatientDataEnabled: false;
  scientificApproval: false;
  liveCds: false;
};

export function buildHsiClinicalPlanePrivateRepoReadiness(): HsiClinicalPlanePrivateRepoReadiness {
  validateHsiClinicalPlaneSyntheticEngineeringApproval(
    HSI_CLINICAL_PLANE_SYNTHETIC_ENGINEERING_APPROVAL,
  );
  const readiness: HsiClinicalPlanePrivateRepoReadiness = {
    schemaVersion: HSI_CLINICAL_PLANE_PRIVATE_REPO_READINESS_SCHEMA,
    authorization: HSI_CLINICAL_PLANE_SYNTHETIC_ENGINEERING_APPROVAL,
    gates: [
      {
        gate: "clinical_plane_repository_and_uk_or_onprem_deploy",
        status: "not_started",
        notes: "Private clinical-plane repository not created yet; synthetic code remains in hsi-core lift-ready paths.",
      },
      {
        gate: "independent_security_review_migrations_031_033",
        status: "interim_insufficient",
        notes: "Founder interim reviewer does not satisfy independence; migrations 031–033 stay held.",
      },
      {
        gate: "clinical_safety_officer_dcb0129",
        status: "interim_insufficient",
        notes: "Interim CSO entry does not close DCB0129 expectations for real patient use.",
      },
      {
        gate: "dpia_uk_gdpr_article_9",
        status: "not_started",
        notes: "DPIA / Article 9 lawful basis not started.",
      },
      {
        gate: "data_sharing_agreement_hra_rec",
        status: "not_started",
        notes: "DSA / HRA-REC not started.",
      },
      {
        gate: "de_identification_process",
        status: "not_started",
        notes: "Pattern scan is not a de-identification engine.",
      },
      {
        gate: "intended_purpose_mhra_samd_position",
        status: "not_started",
        notes: "Intended purpose / MHRA SaMD position not started.",
      },
    ],
    syntheticLiftReadyCodePresent: true,
    realPatientDataEnabled: false,
    scientificApproval: false,
    liveCds: false,
  };
  if (readiness.gates.some((g) => g.status === "closed")) {
    throw Error("U36 must not invent closed ADR-0010 gates");
  }
  if (readiness.gates.length !== HSI_ADR0010_REAL_DATA_GATES.length) {
    throw Error("Every ADR-0010 real-data gate must be catalogued");
  }
  return readiness;
}
