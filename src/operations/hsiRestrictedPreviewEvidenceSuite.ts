/**
 * U40 — restricted-preview auth + continuous-journey evidence runners.
 *
 * Modes:
 * - check: CI-safe honesty catalog (no network, no staging)
 * - fixture: local auth/journey evidence probes without staging hosts
 * - live: owner-gated staging origin probes; can propose U12 worksheet fills
 *
 * Never invents staging hosts, grants, preview GO, write enablement,
 * scientific approval, Gate C, or checklist #1 verified.
 */
import {
  assertHsi10ContinuousJourneyEvidenceSoftLand,
  hsi10ContinuousJourneyEvidencePacket,
} from "./hsi10ContinuousJourneyEvidenceSoftLand";
import {
  assertHsi10RestrictedPreviewReadinessU12SoftLand,
  hsi10RestrictedPreviewReadinessU12Packet,
} from "./hsi10RestrictedPreviewReadinessU12SoftLand";

export const HSI_RESTRICTED_PREVIEW_EVIDENCE_SUITE_SCHEMA =
  "hsi-restricted-preview-evidence-suite-1" as const;

export type HsiRestrictedPreviewEvidenceSuiteMode = "check" | "fixture" | "live";

export type HsiRestrictedPreviewEvidenceSurfaceId =
  | "auth_grant_fail_closed"
  | "auth_session_expiry_honesty"
  | "continuous_journey_local_e2e"
  | "continuous_journey_staging_grant"
  | "device_local_save_reopen"
  | "production_writes_refused"
  | "u12_worksheet_fill";

export type HsiRestrictedPreviewEvidenceSurfaceRow = {
  surface: HsiRestrictedPreviewEvidenceSurfaceId;
  engineeringReady: boolean;
  ownerEvidenceRequired: boolean;
  restrictedPreviewClaimed: false;
  acceptedForScope: false;
  scientificApproval: false;
  checklistItem: 1 | 5 | null;
  notes: string;
};

export type HsiRestrictedPreviewEvidencePacket = {
  schemaVersion: typeof HSI_RESTRICTED_PREVIEW_EVIDENCE_SUITE_SCHEMA;
  purpose: "hsi_restricted_preview_evidence_runners_u40";
  backlogId: "HSI-U40-RESTRICTED-PREVIEW-EVIDENCE";
  fillsSoftLand: readonly ["U12", "HSI-1.0-CONTINUOUS-JOURNEY-EVIDENCE"];
  scientificApproval: false;
  restrictedPreviewClaimed: false;
  acceptedForScope: false;
  checklist1Verified: false;
  gateCAutoApprove: false;
  productionWritesEnabled: false;
  inventedStagingUrl: false;
  inventedGrant: false;
  ciSafeModes: readonly Extract<HsiRestrictedPreviewEvidenceSuiteMode, "check" | "fixture">[];
  surfaces: readonly HsiRestrictedPreviewEvidenceSurfaceRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPaths: readonly [
    "operations/staging/hsi-10-restricted-preview-readiness-u12.pending.json",
    "operations/staging/hsi-10-continuous-journey-evidence.pending.json",
  ];
  softLandDocPath: "docs/engineering/HSI_U40_RESTRICTED_PREVIEW_EVIDENCE_RUNNERS_2026-11-21.md";
  honesty: {
    fixtureIsNotStagingGrant: true;
    liveRequiresOwnerOrigin: true;
    acceptedForScopeStaysFalse: true;
    checklist1StaysUnverifiedUntilOwnerRefs: true;
    noInventedHosts: true;
    noInventedGrants: true;
    noGateC: true;
    noProductionWrites: true;
  };
};

export type HsiRestrictedPreviewEvidenceAssessment = {
  schemaVersion: "hsi-restricted-preview-evidence-assessment-1";
  suiteMode: HsiRestrictedPreviewEvidenceSuiteMode;
  mayClaimRestrictedPreview: false;
  mayClaimChecklist1Verified: false;
  mayInventStagingUrl: false;
  mayInventGrant: false;
  mayEnableProductionWrites: false;
  mayProposeU12WorksheetFill: boolean;
  mayProbeStagingOrigin: boolean;
  ciSafe: boolean;
  reasons: string[];
};

const PLACEHOLDER_REF =
  /^(NOT_STARTED|NOT_APPROVED|UNASSIGNED|BLOCKED|BLOCKED_UNTIL_STAGING_GRANT|ENGINEERING_AUTHORIZED_AWAITING_STAGING|null|undefined)?$/i;

const SURFACES: readonly HsiRestrictedPreviewEvidenceSurfaceRow[] = [
  {
    surface: "auth_grant_fail_closed",
    engineeringReady: true,
    ownerEvidenceRequired: true,
    restrictedPreviewClaimed: false,
    acceptedForScope: false,
    scientificApproval: false,
    checklistItem: null,
    notes:
      "Research APIs fail closed without provider session / grant. Live mode probes staging origin; never invents principals.",
  },
  {
    surface: "auth_session_expiry_honesty",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    restrictedPreviewClaimed: false,
    acceptedForScope: false,
    scientificApproval: false,
    checklistItem: null,
    notes:
      "Session expiry copy stays distinct from auth-unavailable / grant-denied (AUTH_GRANT_GATE_AND_SESSION_EXPIRY).",
  },
  {
    surface: "continuous_journey_local_e2e",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    restrictedPreviewClaimed: false,
    acceptedForScope: false,
    scientificApproval: false,
    checklistItem: 1,
    notes:
      "Local Playwright continuous Ask→brief→save is engineering-ready. Not a staging grant run.",
  },
  {
    surface: "continuous_journey_staging_grant",
    engineeringReady: false,
    ownerEvidenceRequired: true,
    restrictedPreviewClaimed: false,
    acceptedForScope: false,
    scientificApproval: false,
    checklistItem: 1,
    notes:
      "Owner must capture a real staging grant continuous journey. Runner proposes U12 fill only with non-placeholder refs.",
  },
  {
    surface: "device_local_save_reopen",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    restrictedPreviewClaimed: false,
    acceptedForScope: false,
    scientificApproval: false,
    checklistItem: 5,
    notes: "Device-local library remains default while productionWritesEnabled is false.",
  },
  {
    surface: "production_writes_refused",
    engineeringReady: true,
    ownerEvidenceRequired: false,
    restrictedPreviewClaimed: false,
    acceptedForScope: false,
    scientificApproval: false,
    checklistItem: 5,
    notes: "POST research writes stay refused until separately authorised staging scope.",
  },
  {
    surface: "u12_worksheet_fill",
    engineeringReady: true,
    ownerEvidenceRequired: true,
    restrictedPreviewClaimed: false,
    acceptedForScope: false,
    scientificApproval: false,
    checklistItem: 1,
    notes:
      "Fill helper validates owner-supplied refs and refuses placeholders. Never marks restrictedPreviewClaimed or checklist #1 verified.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Approve a disposable or staging HTTPS origin privately — never invent hosts in git.",
  "Provision a real research-preview grant (verified neon_auth user id) privately.",
  "Set HSI_PREVIEW_EVIDENCE_ENABLED=1 and HSI_PREVIEW_EVIDENCE_LIVE_AUTHORIZED=1 only for that run.",
  "Set HSI_PREVIEW_EVIDENCE_ORIGIN and HSI_PREVIEW_EVIDENCE_APPROVED_ORIGIN to the same reviewed HTTPS origin.",
  "Capture continuous Ask→brief→device-local save evidence under the grant; keep production writes false.",
  "Apply U12 / continuous-journey pending refs only with real digests from the runner proposal — never placeholders.",
  "Restricted-preview GO remains a separate owner decision after staging evidence exists.",
];

export function hsiRestrictedPreviewEvidencePacket(): HsiRestrictedPreviewEvidencePacket {
  return {
    schemaVersion: HSI_RESTRICTED_PREVIEW_EVIDENCE_SUITE_SCHEMA,
    purpose: "hsi_restricted_preview_evidence_runners_u40",
    backlogId: "HSI-U40-RESTRICTED-PREVIEW-EVIDENCE",
    fillsSoftLand: ["U12", "HSI-1.0-CONTINUOUS-JOURNEY-EVIDENCE"],
    scientificApproval: false,
    restrictedPreviewClaimed: false,
    acceptedForScope: false,
    checklist1Verified: false,
    gateCAutoApprove: false,
    productionWritesEnabled: false,
    inventedStagingUrl: false,
    inventedGrant: false,
    ciSafeModes: ["check", "fixture"],
    surfaces: SURFACES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPaths: [
      "operations/staging/hsi-10-restricted-preview-readiness-u12.pending.json",
      "operations/staging/hsi-10-continuous-journey-evidence.pending.json",
    ],
    softLandDocPath: "docs/engineering/HSI_U40_RESTRICTED_PREVIEW_EVIDENCE_RUNNERS_2026-11-21.md",
    honesty: {
      fixtureIsNotStagingGrant: true,
      liveRequiresOwnerOrigin: true,
      acceptedForScopeStaysFalse: true,
      checklist1StaysUnverifiedUntilOwnerRefs: true,
      noInventedHosts: true,
      noInventedGrants: true,
      noGateC: true,
      noProductionWrites: true,
    },
  };
}

export function hsiRestrictedPreviewEvidenceSurfaceById(
  surface: HsiRestrictedPreviewEvidenceSurfaceId,
): HsiRestrictedPreviewEvidenceSurfaceRow {
  switch (surface) {
    case "auth_grant_fail_closed":
    case "auth_session_expiry_honesty":
    case "continuous_journey_local_e2e":
    case "continuous_journey_staging_grant":
    case "device_local_save_reopen":
    case "production_writes_refused":
    case "u12_worksheet_fill": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing U40 surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown U40 surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessHsiRestrictedPreviewEvidenceMode(
  mode: HsiRestrictedPreviewEvidenceSuiteMode,
): HsiRestrictedPreviewEvidenceAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-restricted-preview-evidence-assessment-1",
        suiteMode: mode,
        mayClaimRestrictedPreview: false,
        mayClaimChecklist1Verified: false,
        mayInventStagingUrl: false,
        mayInventGrant: false,
        mayEnableProductionWrites: false,
        mayProposeU12WorksheetFill: false,
        mayProbeStagingOrigin: false,
        ciSafe: true,
        reasons: [
          "check mode validates U12 / continuous-journey honesty catalogs only",
          "no staging origin probe and no worksheet fill",
        ],
      };
    case "fixture":
      return {
        schemaVersion: "hsi-restricted-preview-evidence-assessment-1",
        suiteMode: mode,
        mayClaimRestrictedPreview: false,
        mayClaimChecklist1Verified: false,
        mayInventStagingUrl: false,
        mayInventGrant: false,
        mayEnableProductionWrites: false,
        mayProposeU12WorksheetFill: false,
        mayProbeStagingOrigin: false,
        ciSafe: true,
        reasons: [
          "fixture runs local auth + journey soft-land probes without staging hosts",
          "fixture green is not staging grant acceptance or checklist #1 verified",
        ],
      };
    case "live":
      return {
        schemaVersion: "hsi-restricted-preview-evidence-assessment-1",
        suiteMode: mode,
        mayClaimRestrictedPreview: false,
        mayClaimChecklist1Verified: false,
        mayInventStagingUrl: false,
        mayInventGrant: false,
        mayEnableProductionWrites: false,
        mayProposeU12WorksheetFill: true,
        mayProbeStagingOrigin: true,
        ciSafe: false,
        reasons: [
          "live requires owner-reviewed staging origin + dual authorization flags",
          "worksheet fill proposes refs only; restrictedPreviewClaimed and checklist #1 stay false",
        ],
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown U40 suite mode: ${String(_exhaustive)}`);
    }
  }
}

export function assertHsiRestrictedPreviewEvidenceSoftLand(
  packet: HsiRestrictedPreviewEvidencePacket = hsiRestrictedPreviewEvidencePacket(),
): {
  surfaceCount: number;
  restrictedPreviewClaimed: false;
  checklist1Verified: false;
  inventedStagingUrl: false;
  productionWritesEnabled: false;
} {
  if (packet.schemaVersion !== HSI_RESTRICTED_PREVIEW_EVIDENCE_SUITE_SCHEMA) {
    throw new Error("unexpected U40 schema");
  }
  if (packet.backlogId !== "HSI-U40-RESTRICTED-PREVIEW-EVIDENCE") {
    throw new Error("soft-land must bind HSI-U40-RESTRICTED-PREVIEW-EVIDENCE");
  }
  if (
    packet.restrictedPreviewClaimed !== false ||
    packet.acceptedForScope !== false ||
    packet.checklist1Verified !== false ||
    packet.scientificApproval !== false ||
    packet.gateCAutoApprove !== false ||
    packet.productionWritesEnabled !== false ||
    packet.inventedStagingUrl !== false ||
    packet.inventedGrant !== false
  ) {
    throw new Error(
      "U40 soft-land must keep preview GO, checklist #1, writes, hosts, grants, and Gate C closed",
    );
  }
  if (packet.surfaces.length !== 7) {
    throw new Error("expected seven U40 surfaces");
  }
  const staging = packet.surfaces.find((s) => s.surface === "continuous_journey_staging_grant");
  if (!staging || staging.engineeringReady !== false || staging.ownerEvidenceRequired !== true) {
    throw new Error("staging continuous journey must stay owner-gated");
  }
  // Bind existing soft-lands so U40 cannot drift away from U12 honesty.
  assertHsi10RestrictedPreviewReadinessU12SoftLand(hsi10RestrictedPreviewReadinessU12Packet());
  assertHsi10ContinuousJourneyEvidenceSoftLand(hsi10ContinuousJourneyEvidencePacket());
  return {
    surfaceCount: packet.surfaces.length,
    restrictedPreviewClaimed: false,
    checklist1Verified: false,
    inventedStagingUrl: false,
    productionWritesEnabled: false,
  };
}

/** Refuse live mode unless dual flags + matching HTTPS staging origin pins verify. */
export function assertHsiRestrictedPreviewEvidenceLiveAuthorization(input: {
  enabled: string | undefined;
  liveAuthorized: string | undefined;
  origin: string | undefined;
  approvedOrigin: string | undefined;
}): void {
  if (input.enabled !== "1") {
    throw Error(
      "Live preview-evidence refused: set HSI_PREVIEW_EVIDENCE_ENABLED=1 only on an owner-reviewed staging origin",
    );
  }
  if (input.liveAuthorized !== "1") {
    throw Error(
      "Live preview-evidence refused: set HSI_PREVIEW_EVIDENCE_LIVE_AUTHORIZED=1 for an owner-reviewed run",
    );
  }
  const origin = input.origin?.trim() ?? "";
  const approved = input.approvedOrigin?.trim() ?? "";
  if (!origin || !approved) {
    throw Error(
      "Live preview-evidence refused: HSI_PREVIEW_EVIDENCE_ORIGIN and HSI_PREVIEW_EVIDENCE_APPROVED_ORIGIN required",
    );
  }
  if (origin !== approved) {
    throw Error(
      "Live preview-evidence refused: origin and approvedOrigin must match the same reviewed staging HTTPS host",
    );
  }
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    throw Error("Live preview-evidence refused: origin must be a valid URL");
  }
  if (parsed.protocol !== "https:") {
    throw Error("Live preview-evidence refused: staging origin must be https");
  }
  if (
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname.endsWith(".local")
  ) {
    throw Error("Live preview-evidence refused: localhost is not a staging grant origin");
  }
}

export type HsiU12EvidenceFillProposal = {
  schemaVersion: "hsi-u12-evidence-fill-proposal-1";
  restrictedPreviewClaimed: false;
  acceptedForScope: false;
  checklist1Verified: false;
  productionWritesEnabled: false;
  inventedStagingUrl: false;
  inventedGrant: false;
  references: {
    staging_target_ref: string;
    preview_grant_ref: string;
    staging_grant_run_ref: string;
    continuous_journey_evidence_digest: string;
    auth_probe_digest: string;
  };
  notes: string;
};

function assertNonPlaceholderRef(name: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed || PLACEHOLDER_REF.test(trimmed) || trimmed.length < 8) {
    throw Error(`U12 evidence fill refused: ${name} must be a real non-placeholder ref`);
  }
  if (/^(https?:\/\/)?(localhost|127\.0\.0\.1)/i.test(trimmed)) {
    throw Error(`U12 evidence fill refused: ${name} must not use localhost`);
  }
  if (/invent|example\.com|placeholder|TODO|FIXME/i.test(trimmed)) {
    throw Error(`U12 evidence fill refused: ${name} looks invented`);
  }
  return trimmed;
}

/**
 * Build a U12 / continuous-journey worksheet fill proposal from owner-supplied refs.
 * Never sets restrictedPreviewClaimed, checklist1Verified, or acceptedForScope.
 */
export function buildHsiU12EvidenceFillProposal(input: {
  stagingTargetRef: string;
  previewGrantRef: string;
  stagingGrantRunRef: string;
  continuousJourneyEvidenceDigest: string;
  authProbeDigest: string;
}): HsiU12EvidenceFillProposal {
  return {
    schemaVersion: "hsi-u12-evidence-fill-proposal-1",
    restrictedPreviewClaimed: false,
    acceptedForScope: false,
    checklist1Verified: false,
    productionWritesEnabled: false,
    inventedStagingUrl: false,
    inventedGrant: false,
    references: {
      staging_target_ref: assertNonPlaceholderRef("staging_target_ref", input.stagingTargetRef),
      preview_grant_ref: assertNonPlaceholderRef("preview_grant_ref", input.previewGrantRef),
      staging_grant_run_ref: assertNonPlaceholderRef(
        "staging_grant_run_ref",
        input.stagingGrantRunRef,
      ),
      continuous_journey_evidence_digest: assertNonPlaceholderRef(
        "continuous_journey_evidence_digest",
        input.continuousJourneyEvidenceDigest,
      ),
      auth_probe_digest: assertNonPlaceholderRef("auth_probe_digest", input.authProbeDigest),
    },
    notes:
      "Proposal only. Owner applies refs to pending worksheets privately. restrictedPreviewClaimed and checklist #1 stay false until separate owner GO.",
  };
}
