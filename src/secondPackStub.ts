/**
 * Second indication pack stub (Phase 9 scaffolding).
 * Declares a future pack without inventing evidence, SME labels, or licence grants.
 */
export const SECOND_PACK_STUB_VERSION = "hsi-second-pack-stub-1" as const;

export type SecondPackStub = {
  schemaVersion: typeof SECOND_PACK_STUB_VERSION;
  packId: "indication-pack-2-stub";
  status: "scaffolding_only";
  scientificReview: "unreviewed";
  containsPhi: false;
  clinicalAdvice: false;
  kgWrite: false;
  notForScientificClaim: true;
  /** Intentionally unset until a rights-verified protocol exists. */
  candidateIndication: null;
  dependsOn: {
    firstPackReleaseId: "ra-anti-tnf-evidence";
    firstPackStatusRequired: "rights_verified_import";
    researchWorkingSetDoesNotSatisfy: true;
  };
  blockedUntil: string[];
  nextOperatorSteps: string[];
};

export function secondIndicationPackStub(): SecondPackStub {
  return {
    schemaVersion: SECOND_PACK_STUB_VERSION,
    packId: "indication-pack-2-stub",
    status: "scaffolding_only",
    scientificReview: "unreviewed",
    containsPhi: false,
    clinicalAdvice: false,
    kgWrite: false,
    notForScientificClaim: true,
    candidateIndication: null,
    dependsOn: {
      firstPackReleaseId: "ra-anti-tnf-evidence",
      firstPackStatusRequired: "rights_verified_import",
      researchWorkingSetDoesNotSatisfy: true,
    },
    blockedUntil: [
      "Real RA/anti-TNF release leaves awaiting_verified_source_import with explicit CC URI rights.",
      "Independent scientific review of the first pack (not research working-set workflow acceptance).",
      "Separate protocol registration for the second indication — do not invent candidates here.",
    ],
    nextOperatorSteps: [
      "Keep ra-anti-tnf-research as the bounded investigation working set only.",
      "Do not clone SYN-RA-SRC working-set sources into a second scientific pack.",
      "When a second protocol is authorised, add research/<pack>/protocol.json and an unavailable release marker first.",
    ],
  };
}
