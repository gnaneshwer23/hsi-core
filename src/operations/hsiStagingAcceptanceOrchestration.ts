/**
 * U46 — P0 staging acceptance orchestration.
 *
 * Composes U40 preview-evidence + U43 U12 fill-apply honesty into one
 * owner-facing suite. Modes:
 * - check: CI-safe soft-land asserts (no network, no write)
 * - fixture: local U40 fixture probe + placeholder-refuse on apply
 * - dry_apply: dry-run apply of an owner-supplied U12 fill proposal
 *
 * Never invents hosts/grants, never claims checklist #1 or preview GO.
 */
import {
  assertHsiStagingAcceptanceOrchestrationOwnerAuthorized,
  HSI_STAGING_ACCEPTANCE_ORCHESTRATION_OWNER_APPROVAL,
  type HsiStagingAcceptanceOrchestrationOwnerApproval,
} from "../hsiStagingAcceptanceOrchestrationAuthorization";
import {
  HSI_U12_EVIDENCE_FILL_APPLY_OWNER_APPROVAL,
} from "../hsiU12EvidenceFillApplyAuthorization";
import {
  HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL,
} from "../hsiRestrictedPreviewEvidenceAuthorization";
import {runHsiRestrictedPreviewEvidenceSuite} from "./hsiRestrictedPreviewEvidenceRunner";
import {
  assertHsiRestrictedPreviewEvidenceSoftLand,
  buildHsiU12EvidenceFillProposal,
  hsiRestrictedPreviewEvidencePacket,
  type HsiU12EvidenceFillProposal,
} from "./hsiRestrictedPreviewEvidenceSuite";
import {
  applyHsiU12EvidenceFillProposal,
  type HsiU12PendingWorksheet,
} from "./hsiU12EvidenceFillApply";
import {
  assertHsiU12EvidenceFillApplySoftLand,
  hsiU12EvidenceFillApplySoftLandPacket,
} from "./hsiU12EvidenceFillApplySoftLand";
import {
  assertHsi10RestrictedPreviewReadinessU12SoftLand,
  hsi10RestrictedPreviewReadinessU12Packet,
} from "./hsi10RestrictedPreviewReadinessU12SoftLand";
import {
  assertHsi10ContinuousJourneyEvidenceSoftLand,
  hsi10ContinuousJourneyEvidencePacket,
} from "./hsi10ContinuousJourneyEvidenceSoftLand";
import {
  assertHsiStagingAcceptanceOrchestrationSoftLand,
  hsiStagingAcceptanceOrchestrationSoftLandPacket,
} from "./hsiStagingAcceptanceOrchestrationSoftLand";

export const HSI_STAGING_ACCEPTANCE_ORCHESTRATION_SCHEMA =
  "hsi-staging-acceptance-orchestration-1" as const;

export type HsiStagingAcceptanceOrchestrationMode =
  | "check"
  | "fixture"
  | "dry_apply";

export type HsiStagingAcceptanceOrchestrationResult = {
  schemaVersion: typeof HSI_STAGING_ACCEPTANCE_ORCHESTRATION_SCHEMA;
  authorization: HsiStagingAcceptanceOrchestrationOwnerApproval;
  mode: HsiStagingAcceptanceOrchestrationMode;
  steps: readonly string[];
  u12FillProposal: HsiU12EvidenceFillProposal | null;
  applyDryRun: {
    applied: boolean;
    restrictedPreviewClaimed: false;
    checklist1Verified: false;
  } | null;
  restrictedPreviewClaimed: false;
  checklist1Verified: false;
  acceptedForScope: false;
  inventedStagingUrl: false;
  inventedGrant: false;
  productionWritesEnabled: false;
  notes: string;
};

export function assessHsiStagingAcceptanceOrchestrationMode(
  mode: HsiStagingAcceptanceOrchestrationMode,
): {
  ciSafe: boolean;
  mayProbeStaging: boolean;
  mayDryApplyProposal: boolean;
  mayClaimChecklist1: false;
  mayClaimPreviewGo: false;
} {
  switch (mode) {
    case "check":
      return {
        ciSafe: true,
        mayProbeStaging: false,
        mayDryApplyProposal: false,
        mayClaimChecklist1: false,
        mayClaimPreviewGo: false,
      };
    case "fixture":
      return {
        ciSafe: true,
        mayProbeStaging: false,
        mayDryApplyProposal: false,
        mayClaimChecklist1: false,
        mayClaimPreviewGo: false,
      };
    case "dry_apply":
      return {
        ciSafe: false,
        mayProbeStaging: false,
        mayDryApplyProposal: true,
        mayClaimChecklist1: false,
        mayClaimPreviewGo: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown staging-acceptance mode: ${String(_exhaustive)}`);
    }
  }
}

/**
 * Run one staging-acceptance orchestration mode under owner approval.
 */
export async function runHsiStagingAcceptanceOrchestration(input: {
  authorization: HsiStagingAcceptanceOrchestrationOwnerApproval;
  mode: HsiStagingAcceptanceOrchestrationMode;
  proposal?: HsiU12EvidenceFillProposal;
  u12Pending?: HsiU12PendingWorksheet;
  continuousJourneyPending?: HsiU12PendingWorksheet;
}): Promise<HsiStagingAcceptanceOrchestrationResult> {
  assertHsiStagingAcceptanceOrchestrationOwnerAuthorized(input.authorization);
  const assessment = assessHsiStagingAcceptanceOrchestrationMode(input.mode);
  const steps: string[] = [];

  // Always bind the soft-lands this orchestration composes.
  assertHsiStagingAcceptanceOrchestrationSoftLand(
    hsiStagingAcceptanceOrchestrationSoftLandPacket(),
  );
  assertHsiRestrictedPreviewEvidenceSoftLand(hsiRestrictedPreviewEvidencePacket());
  assertHsiU12EvidenceFillApplySoftLand(hsiU12EvidenceFillApplySoftLandPacket());
  assertHsi10RestrictedPreviewReadinessU12SoftLand(hsi10RestrictedPreviewReadinessU12Packet());
  assertHsi10ContinuousJourneyEvidenceSoftLand(hsi10ContinuousJourneyEvidencePacket());
  steps.push("bound_u46_u40_u43_u12_continuous_journey_soft_lands");

  let u12FillProposal: HsiU12EvidenceFillProposal | null = null;
  let applyDryRun: HsiStagingAcceptanceOrchestrationResult["applyDryRun"] = null;

  switch (input.mode) {
    case "check": {
      steps.push("check_honesty_catalogs_only");
      break;
    }
    case "fixture": {
      const fixture = await runHsiRestrictedPreviewEvidenceSuite({
        authorization: HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL,
        mode: "fixture",
      });
      steps.push("u40_fixture_probe");
      if (fixture.restrictedPreviewClaimed !== false || fixture.checklist1Verified !== false) {
        throw Error("U40 fixture must keep preview GO and checklist #1 closed");
      }
      // Prove placeholder apply is refused (U43 honesty).
      try {
        buildHsiU12EvidenceFillProposal({
          stagingTargetRef: "NOT_APPROVED",
          previewGrantRef: "UNASSIGNED",
          stagingGrantRunRef: "NOT_STARTED",
          continuousJourneyEvidenceDigest: "BLOCKED",
          authProbeDigest: "TODO",
        });
        throw Error("expected placeholder fill proposal to be refused");
      } catch (error) {
        if (!(error instanceof Error) || !/refused|placeholder|invented/i.test(error.message)) {
          throw error;
        }
        steps.push("u43_placeholder_fill_refused");
      }
      break;
    }
    case "dry_apply": {
      if (!assessment.mayDryApplyProposal) {
        throw Error("dry_apply mode misconfigured");
      }
      if (!input.proposal || !input.u12Pending || !input.continuousJourneyPending) {
        throw Error(
          "dry_apply requires proposal + u12Pending + continuousJourneyPending from owner-supplied refs",
        );
      }
      u12FillProposal = input.proposal;
      const applied = applyHsiU12EvidenceFillProposal({
        authorization: HSI_U12_EVIDENCE_FILL_APPLY_OWNER_APPROVAL,
        proposal: input.proposal,
        u12Pending: input.u12Pending,
        continuousJourneyPending: input.continuousJourneyPending,
        dryRun: true,
      });
      if (
        applied.restrictedPreviewClaimed !== false ||
        applied.checklist1Verified !== false ||
        applied.dryRun !== true
      ) {
        throw Error("dry_apply must stay dry-run with preview GO and checklist #1 closed");
      }
      applyDryRun = {
        applied: true,
        restrictedPreviewClaimed: false,
        checklist1Verified: false,
      };
      steps.push("u43_dry_run_apply");
      break;
    }
    default: {
      const _exhaustive: never = input.mode;
      throw new Error(`Unknown staging-acceptance mode: ${String(_exhaustive)}`);
    }
  }

  return {
    schemaVersion: HSI_STAGING_ACCEPTANCE_ORCHESTRATION_SCHEMA,
    authorization: HSI_STAGING_ACCEPTANCE_ORCHESTRATION_OWNER_APPROVAL,
    mode: input.mode,
    steps,
    u12FillProposal,
    applyDryRun,
    restrictedPreviewClaimed: false,
    checklist1Verified: false,
    acceptedForScope: false,
    inventedStagingUrl: false,
    inventedGrant: false,
    productionWritesEnabled: false,
    notes:
      "P0 orchestration soft-land only. Live staging grant + real refs still required for checklist #1. Preview GO stays false.",
  };
}
