/**
 * Fail-closed source reliability labels for the live workspace path.
 * Surfaces existing record fields — never invents clearance, rights, or scientific approval.
 * Browser-safe.
 */

export const LIVE_SOURCE_RELIABILITY_SCHEMA = "hsi-live-source-reliability-1" as const;

/** Minimal record shape used by workspace + brief renderers. */
export type LiveSourceReliabilityInput = {
  sourceUrl: string;
  title?: string | null;
  doi?: string | null;
  pmid?: string | null;
  licenceStatus?: string | null;
  verificationState?: string | null;
  reviewState?: string | null;
  retraction?: string | null;
  retrievedAt?: string | null;
  provider?: string | null;
};

export type LiveSourceReliabilityHonesty = {
  schemaVersion: typeof LIVE_SOURCE_RELIABILITY_SCHEMA;
  sourceClearanceVerified: false;
  scientificApproval: false;
  graphPromotable: false;
  rights: "unverified";
  licenceStatus: string;
  verificationState: string;
  reviewState: string;
  locatorIsNotProofOfSupport: true;
};

export const LIVE_SOURCE_RELIABILITY_HONESTY: LiveSourceReliabilityHonesty = {
  schemaVersion: LIVE_SOURCE_RELIABILITY_SCHEMA,
  sourceClearanceVerified: false,
  scientificApproval: false,
  graphPromotable: false,
  rights: "unverified",
  licenceStatus: "not_assessed",
  verificationState: "metadata_retrieved_not_claim_verified",
  reviewState: "unreviewed",
  locatorIsNotProofOfSupport: true,
};

export function assertLiveSourceReliabilityHonesty(
  honesty: LiveSourceReliabilityHonesty,
): LiveSourceReliabilityHonesty {
  if (honesty.sourceClearanceVerified !== false) {
    throw Error("sourceClearanceVerified must be false");
  }
  if (honesty.scientificApproval !== false) throw Error("scientificApproval must be false");
  if (honesty.graphPromotable !== false) throw Error("graphPromotable must be false");
  if (honesty.rights !== "unverified") throw Error("rights must be unverified");
  if (honesty.locatorIsNotProofOfSupport !== true) {
    throw Error("locatorIsNotProofOfSupport must be true");
  }
  return honesty;
}

function displayOrAbsent(value: string | null | undefined, label: string): string {
  const t = typeof value === "string" ? value.trim() : "";
  return t ? `${label} ${t}` : `${label} not stated`;
}

/** Compact meta line for sources list / inspect panel (no abstracts). */
export function formatLiveSourceReliabilityMeta(
  input: LiveSourceReliabilityInput,
): string {
  const honesty = assertLiveSourceReliabilityHonesty(LIVE_SOURCE_RELIABILITY_HONESTY);
  const licence = input.licenceStatus?.trim() || honesty.licenceStatus;
  const verification =
    input.verificationState?.trim() || honesty.verificationState;
  const review = input.reviewState?.trim() || honesty.reviewState;
  const parts = [
    input.provider?.trim() || null,
    displayOrAbsent(input.doi ?? null, "DOI"),
    displayOrAbsent(input.pmid ?? null, "PMID"),
    input.retrievedAt ? `retrieved ${input.retrievedAt}` : null,
    input.retraction
      ? `retraction: ${input.retraction.replaceAll("_", " ")}`
      : null,
    `licenceStatus: ${licence.replaceAll("_", " ")}`,
    `verificationState: ${verification.replaceAll("_", " ")}`,
    `reviewState: ${review.replaceAll("_", " ")}`,
    `rights: ${honesty.rights}`,
    `sourceClearanceVerified: ${String(honesty.sourceClearanceVerified)}`,
  ].filter(Boolean);
  return parts.join(" · ");
}

/** Always-visible reliability limitations for briefs (fail-closed). */
export function liveSourceReliabilityLimitations(): readonly string[] {
  const honesty = assertLiveSourceReliabilityHonesty(LIVE_SOURCE_RELIABILITY_HONESTY);
  return [
    `sourceClearanceVerified: ${String(honesty.sourceClearanceVerified)} — source clearance is not verified on the live path.`,
    `licenceStatus: ${honesty.licenceStatus.replaceAll("_", " ")} — reuse rights are not assessed.`,
    `verificationState: ${honesty.verificationState.replaceAll("_", " ")} — metadata retrieved is not claim verification.`,
    `rights: ${honesty.rights} — locators (PMID/DOI) are not proof of support or permitted reuse.`,
    "Abstracts are not redistributed in exports; current permissions must be rechecked before sharing or citing.",
  ];
}
