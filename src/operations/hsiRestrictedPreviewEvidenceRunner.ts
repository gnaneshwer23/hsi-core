/**
 * U40 runner — restricted-preview auth + continuous-journey evidence collection.
 *
 * check/fixture are CI-safe. live probes an owner-reviewed staging HTTPS origin
 * and may emit a U12 worksheet fill proposal when real refs are supplied.
 */
import {createHash} from "node:crypto";
import {AUTH_ERROR_MESSAGES} from "../authErrors";
import {
  assertHsiRestrictedPreviewEvidenceOwnerAuthorized,
  HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL,
  type HsiRestrictedPreviewEvidenceOwnerApproval,
} from "../hsiRestrictedPreviewEvidenceAuthorization";
import {
  assertHsiRestrictedPreviewEvidenceLiveAuthorization,
  assertHsiRestrictedPreviewEvidenceSoftLand,
  assessHsiRestrictedPreviewEvidenceMode,
  buildHsiU12EvidenceFillProposal,
  hsiRestrictedPreviewEvidencePacket,
  type HsiRestrictedPreviewEvidenceSuiteMode,
  type HsiU12EvidenceFillProposal,
} from "./hsiRestrictedPreviewEvidenceSuite";

export const HSI_RESTRICTED_PREVIEW_EVIDENCE_RUN_RESULT_SCHEMA =
  "hsi-restricted-preview-evidence-run-1" as const;

export type HsiRestrictedPreviewEvidenceRunResult = {
  schemaVersion: typeof HSI_RESTRICTED_PREVIEW_EVIDENCE_RUN_RESULT_SCHEMA;
  mode: HsiRestrictedPreviewEvidenceSuiteMode;
  authorization: HsiRestrictedPreviewEvidenceOwnerApproval;
  surfacesProbed: readonly string[];
  authSessionExpiryDistinct: true;
  authGrantFailClosedDocumented: true;
  continuousJourneySoftLandBound: true;
  u12SoftLandBound: true;
  stagingHealth: {
    probed: boolean;
    writesEnabled: false | null;
    configurationValidated: boolean | null;
    origin: string | null;
  };
  evidenceDigests: {
    authHonesty: string;
    continuousJourneyCatalog: string;
    stagingHealth: string | null;
  };
  u12FillProposal: HsiU12EvidenceFillProposal | null;
  restrictedPreviewClaimed: false;
  acceptedForScope: false;
  checklist1Verified: false;
  scientificApproval: false;
  gateCAutoApprove: false;
  productionWritesEnabled: false;
  inventedStagingUrl: false;
  inventedGrant: false;
};

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function requireLiveEnv(name: string): string {
  const v = process.env[name];
  if (!v?.trim()) throw Error(`Missing required env ${name}`);
  return v.trim();
}

type StagingFetch = (
  input: string,
  init?: {method?: string; redirect?: RequestRedirect; headers?: Record<string, string>},
) => Promise<Response>;

async function probeStagingHealth(
  origin: string,
  fetchImpl: StagingFetch,
): Promise<{
  writesEnabled: false | null;
  configurationValidated: boolean | null;
  rawDigest: string;
}> {
  const url = new URL("/api/research/health", origin).toString();
  const response = await fetchImpl(url, {
    method: "GET",
    redirect: "error",
    headers: {accept: "application/json"},
  });
  const text = await response.text();
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    body = {parseError: true, status: response.status};
  }
  const writesEnabled = body.writesEnabled === false ? false : null;
  if (writesEnabled !== false) {
    throw Error(
      "Live preview-evidence refused: staging health must report writesEnabled=false (or fail closed)",
    );
  }
  const configurationValidated =
    typeof body.configuration_validated === "boolean"
      ? body.configuration_validated
      : typeof body.configurationValidated === "boolean"
        ? body.configurationValidated
        : null;
  return {
    writesEnabled: false,
    configurationValidated,
    rawDigest: digest({
      status: response.status,
      writesEnabled: false,
      configurationValidated,
      // Never retain cookies, tokens, or full body — status + honesty flags only.
    }),
  };
}

function assertAuthHonestyLocally(): {authHonestyDigest: string} {
  const sessionExpired = AUTH_ERROR_MESSAGES.AUTH_SESSION_EXPIRED;
  const unavailable = AUTH_ERROR_MESSAGES.AUTH_UNAVAILABLE;
  if (typeof sessionExpired !== "string" || typeof unavailable !== "string") {
    throw Error("AUTH_ERROR_MESSAGES must define session-expiry and unavailable copy");
  }
  if (!sessionExpired.match(/expired/i)) {
    throw Error("AUTH_SESSION_EXPIRED must mention expiry");
  }
  if (sessionExpired.match(/unavailable/i)) {
    throw Error("AUTH_SESSION_EXPIRED must stay distinct from auth-unavailable");
  }
  if (!sessionExpired.match(/does not grant research access/i)) {
    throw Error("AUTH_SESSION_EXPIRED must remind that session ≠ research grant");
  }
  return {
    authHonestyDigest: digest({
      AUTH_SESSION_EXPIRED: sessionExpired,
      AUTH_UNAVAILABLE: unavailable,
    }),
  };
}

/**
 * Run the owner-authorized restricted-preview evidence suite.
 */
export async function runHsiRestrictedPreviewEvidenceSuite(input: {
  authorization: HsiRestrictedPreviewEvidenceOwnerApproval;
  mode: HsiRestrictedPreviewEvidenceSuiteMode;
  /** Optional owner-supplied refs for a U12 fill proposal (live only). */
  fillRefs?: {
    stagingTargetRef: string;
    previewGrantRef: string;
    stagingGrantRunRef: string;
  };
  fetchImpl?: StagingFetch;
}): Promise<HsiRestrictedPreviewEvidenceRunResult> {
  assertHsiRestrictedPreviewEvidenceOwnerAuthorized(input.authorization);
  const assessment = assessHsiRestrictedPreviewEvidenceMode(input.mode);
  const packet = hsiRestrictedPreviewEvidencePacket();
  assertHsiRestrictedPreviewEvidenceSoftLand(packet);

  const auth = assertAuthHonestyLocally();
  const continuousJourneyCatalog = digest({
    backlogId: "HSI-1.0-CONTINUOUS-JOURNEY-EVIDENCE",
    fillsSoftLand: packet.fillsSoftLand,
  });

  const surfacesProbed = [
    "auth_session_expiry_honesty",
    "auth_grant_fail_closed",
    "continuous_journey_local_e2e",
    "production_writes_refused",
    "u12_worksheet_fill",
  ];

  let stagingHealth: HsiRestrictedPreviewEvidenceRunResult["stagingHealth"] = {
    probed: false,
    writesEnabled: null,
    configurationValidated: null,
    origin: null,
  };
  let stagingHealthDigest: string | null = null;
  let u12FillProposal: HsiU12EvidenceFillProposal | null = null;

  if (input.mode === "live") {
    if (!assessment.mayProbeStagingOrigin) {
      throw Error("Live mode assessment refused staging probe");
    }
    assertHsiRestrictedPreviewEvidenceLiveAuthorization({
      enabled: process.env.HSI_PREVIEW_EVIDENCE_ENABLED,
      liveAuthorized: process.env.HSI_PREVIEW_EVIDENCE_LIVE_AUTHORIZED,
      origin: process.env.HSI_PREVIEW_EVIDENCE_ORIGIN,
      approvedOrigin: process.env.HSI_PREVIEW_EVIDENCE_APPROVED_ORIGIN,
    });
    const origin = requireLiveEnv("HSI_PREVIEW_EVIDENCE_ORIGIN");
    const health = await probeStagingHealth(origin, input.fetchImpl ?? fetch);
    stagingHealth = {
      probed: true,
      writesEnabled: false,
      configurationValidated: health.configurationValidated,
      origin,
    };
    stagingHealthDigest = health.rawDigest;
    surfacesProbed.push("continuous_journey_staging_grant");

    if (input.fillRefs) {
      if (!assessment.mayProposeU12WorksheetFill) {
        throw Error("Live mode assessment refused U12 worksheet fill");
      }
      u12FillProposal = buildHsiU12EvidenceFillProposal({
        stagingTargetRef: input.fillRefs.stagingTargetRef,
        previewGrantRef: input.fillRefs.previewGrantRef,
        stagingGrantRunRef: input.fillRefs.stagingGrantRunRef,
        continuousJourneyEvidenceDigest: continuousJourneyCatalog,
        authProbeDigest: digest({
          authHonesty: auth.authHonestyDigest,
          stagingHealth: stagingHealthDigest,
        }),
      });
    }
  }

  return {
    schemaVersion: HSI_RESTRICTED_PREVIEW_EVIDENCE_RUN_RESULT_SCHEMA,
    mode: input.mode,
    authorization: HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL,
    surfacesProbed,
    authSessionExpiryDistinct: true,
    authGrantFailClosedDocumented: true,
    continuousJourneySoftLandBound: true,
    u12SoftLandBound: true,
    stagingHealth,
    evidenceDigests: {
      authHonesty: auth.authHonestyDigest,
      continuousJourneyCatalog,
      stagingHealth: stagingHealthDigest,
    },
    u12FillProposal,
    restrictedPreviewClaimed: false,
    acceptedForScope: false,
    checklist1Verified: false,
    scientificApproval: false,
    gateCAutoApprove: false,
    productionWritesEnabled: false,
    inventedStagingUrl: false,
    inventedGrant: false,
  };
}
