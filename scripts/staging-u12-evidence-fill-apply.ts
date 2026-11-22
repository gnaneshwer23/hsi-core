#!/usr/bin/env bun
/**
 * U43 — apply a U40 U12 evidence fill proposal into pending worksheets.
 *
 * Default is dry-run (prints next JSON). --write requires dual owner flags and
 * never sets restrictedPreviewClaimed or checklist1Verified.
 */
import {readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  HSI_U12_EVIDENCE_FILL_APPLY_OWNER_APPROVAL,
} from "../src/hsiU12EvidenceFillApplyAuthorization";
import {
  applyHsiU12EvidenceFillProposal,
  type HsiU12PendingWorksheet,
} from "../src/operations/hsiU12EvidenceFillApply";
import type {HsiU12EvidenceFillProposal} from "../src/operations/hsiRestrictedPreviewEvidenceSuite";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const write = process.argv.includes("--write");
const proposalPath = arg("--proposal");
if (!proposalPath) {
  console.error(
    JSON.stringify({
      ok: false,
      error: "Required: --proposal <path-to-u12-fill-proposal.json>",
    }),
  );
  process.exit(1);
}

const root = resolve(import.meta.dir, "..");
const u12Path = resolve(
  root,
  "operations/staging/hsi-10-restricted-preview-readiness-u12.pending.json",
);
const journeyPath = resolve(
  root,
  "operations/staging/hsi-10-continuous-journey-evidence.pending.json",
);

try {
  if (write) {
    if (process.env.HSI_U12_FILL_APPLY_ENABLED !== "1") {
      throw Error(
        "Write apply refused: set HSI_U12_FILL_APPLY_ENABLED=1 only for an owner-reviewed fill",
      );
    }
    if (process.env.HSI_U12_FILL_APPLY_WRITE_AUTHORIZED !== "1") {
      throw Error(
        "Write apply refused: set HSI_U12_FILL_APPLY_WRITE_AUTHORIZED=1 for an owner-reviewed write",
      );
    }
  }

  const proposal = JSON.parse(
    readFileSync(resolve(proposalPath), "utf8"),
  ) as HsiU12EvidenceFillProposal;
  const u12Pending = JSON.parse(readFileSync(u12Path, "utf8")) as HsiU12PendingWorksheet;
  const continuousJourneyPending = JSON.parse(
    readFileSync(journeyPath, "utf8"),
  ) as HsiU12PendingWorksheet;

  const result = applyHsiU12EvidenceFillProposal({
    authorization: HSI_U12_EVIDENCE_FILL_APPLY_OWNER_APPROVAL,
    proposal,
    u12Pending,
    continuousJourneyPending,
    dryRun: !write,
  });

  if (
    result.restrictedPreviewClaimed !== false ||
    result.checklist1Verified !== false ||
    result.acceptedForScope !== false
  ) {
    throw Error("honesty invariant broken");
  }

  if (write) {
    writeFileSync(u12Path, `${JSON.stringify(result.u12Next, null, 2)}\n`);
    writeFileSync(journeyPath, `${JSON.stringify(result.continuousJourneyNext, null, 2)}\n`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        dryRun: result.dryRun,
        wrote: write,
        restrictedPreviewClaimed: result.restrictedPreviewClaimed,
        checklist1Verified: result.checklist1Verified,
        appliedReferenceKeys: result.appliedReferenceKeys,
        notes: result.notes,
        u12Next: write ? undefined : result.u12Next,
        continuousJourneyNext: write ? undefined : result.continuousJourneyNext,
      },
      null,
      2,
    ),
  );
  process.exit(0);
} catch (error) {
  console.error(
    JSON.stringify({
      ok: false,
      write,
      error: error instanceof Error ? error.message : String(error),
    }),
  );
  process.exit(1);
}
