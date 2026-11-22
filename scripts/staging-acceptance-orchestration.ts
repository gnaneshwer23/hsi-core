#!/usr/bin/env bun
/**
 * U46 — P0 staging acceptance orchestration CLI.
 * --check / --fixture are CI-safe. --dry-apply requires an owner proposal path
 * and never claims preview GO or checklist #1.
 */
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  HSI_STAGING_ACCEPTANCE_ORCHESTRATION_OWNER_APPROVAL,
} from "../src/hsiStagingAcceptanceOrchestrationAuthorization";
import {
  runHsiStagingAcceptanceOrchestration,
  type HsiStagingAcceptanceOrchestrationMode,
} from "../src/operations/hsiStagingAcceptanceOrchestration";
import type {HsiU12EvidenceFillProposal} from "../src/operations/hsiRestrictedPreviewEvidenceSuite";
import type {HsiU12PendingWorksheet} from "../src/operations/hsiU12EvidenceFillApply";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const check = process.argv.includes("--check");
const fixture = process.argv.includes("--fixture");
const dryApply = process.argv.includes("--dry-apply");

let mode: HsiStagingAcceptanceOrchestrationMode = "check";
if (dryApply) mode = "dry_apply";
else if (fixture) mode = "fixture";
else if (check) mode = "check";

const root = resolve(import.meta.dir, "..");

try {
  let proposal: HsiU12EvidenceFillProposal | undefined;
  let u12Pending: HsiU12PendingWorksheet | undefined;
  let continuousJourneyPending: HsiU12PendingWorksheet | undefined;

  if (mode === "dry_apply") {
    const proposalPath = arg("--proposal");
    if (!proposalPath) {
      throw Error("Required: --proposal <path-to-u12-fill-proposal.json>");
    }
    proposal = JSON.parse(
      readFileSync(resolve(proposalPath), "utf8"),
    ) as HsiU12EvidenceFillProposal;
    u12Pending = JSON.parse(
      readFileSync(
        resolve(
          root,
          "operations/staging/hsi-10-restricted-preview-readiness-u12.pending.json",
        ),
        "utf8",
      ),
    ) as HsiU12PendingWorksheet;
    continuousJourneyPending = JSON.parse(
      readFileSync(
        resolve(
          root,
          "operations/staging/hsi-10-continuous-journey-evidence.pending.json",
        ),
        "utf8",
      ),
    ) as HsiU12PendingWorksheet;
  }

  const result = await runHsiStagingAcceptanceOrchestration({
    authorization: HSI_STAGING_ACCEPTANCE_ORCHESTRATION_OWNER_APPROVAL,
    mode,
    proposal,
    u12Pending,
    continuousJourneyPending,
  });

  if (
    result.restrictedPreviewClaimed !== false ||
    result.checklist1Verified !== false ||
    result.acceptedForScope !== false ||
    result.inventedStagingUrl !== false ||
    result.inventedGrant !== false
  ) {
    throw Error("honesty invariant broken");
  }

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
} catch (error) {
  console.error(
    JSON.stringify({
      ok: false,
      mode,
      error: error instanceof Error ? error.message : String(error),
    }),
  );
  process.exit(1);
}
