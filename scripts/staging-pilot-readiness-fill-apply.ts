#!/usr/bin/env bun
/**
 * U49 — apply a Human #8 pilot readiness fill proposal into U8 + NEXT-F pendings.
 *
 * Default is dry-run. --write requires dual owner flags and never claims
 * soakAccepted, pilotReleaseSigned, or checklist #8 invites.
 */
import {readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  HSI_PILOT_READINESS_FILL_APPLY_OWNER_APPROVAL,
} from "../src/hsiPilotReadinessFillApplyAuthorization";
import {
  applyHsiPilotReadinessFillProposal,
  type HsiPilotReadinessFillProposal,
  type HsiPilotReadinessPendingWorksheet,
} from "../src/operations/hsiPilotReadinessFillApply";

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
      error: "Required: --proposal <path-to-pilot-readiness-fill-proposal.json>",
    }),
  );
  process.exit(1);
}

const root = resolve(import.meta.dir, "..");
const u8Path = resolve(
  root,
  "operations/staging/hsi-10-pilot-readiness-u8.pending.json",
);
const nextFPath = resolve(
  root,
  "operations/staging/next-f-soak-pilot-release.pending.json",
);

try {
  if (write) {
    if (process.env.HSI_PILOT_READINESS_FILL_APPLY_ENABLED !== "1") {
      throw Error(
        "Write apply refused: set HSI_PILOT_READINESS_FILL_APPLY_ENABLED=1 only for an owner-reviewed fill",
      );
    }
    if (process.env.HSI_PILOT_READINESS_FILL_APPLY_WRITE_AUTHORIZED !== "1") {
      throw Error(
        "Write apply refused: set HSI_PILOT_READINESS_FILL_APPLY_WRITE_AUTHORIZED=1 for an owner-reviewed write",
      );
    }
  }

  const proposal = JSON.parse(
    readFileSync(resolve(proposalPath), "utf8"),
  ) as HsiPilotReadinessFillProposal;
  const u8Pending = JSON.parse(
    readFileSync(u8Path, "utf8"),
  ) as HsiPilotReadinessPendingWorksheet;
  const nextFPending = JSON.parse(
    readFileSync(nextFPath, "utf8"),
  ) as HsiPilotReadinessPendingWorksheet;

  const result = applyHsiPilotReadinessFillProposal({
    authorization: HSI_PILOT_READINESS_FILL_APPLY_OWNER_APPROVAL,
    proposal,
    u8Pending,
    nextFPending,
    dryRun: !write,
  });

  if (
    result.soakAccepted !== false ||
    result.pilotReleaseSigned !== false ||
    result.pilotInviteAllowed !== false ||
    result.acceptedForScope !== false
  ) {
    throw Error("honesty invariant broken");
  }

  if (write) {
    writeFileSync(u8Path, `${JSON.stringify(result.u8Next, null, 2)}\n`);
    writeFileSync(nextFPath, `${JSON.stringify(result.nextFNext, null, 2)}\n`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        dryRun: result.dryRun,
        wrote: write,
        soakAccepted: result.soakAccepted,
        pilotReleaseSigned: result.pilotReleaseSigned,
        pilotInviteAllowed: result.pilotInviteAllowed,
        appliedReferenceKeys: result.appliedReferenceKeys,
        notes: result.notes,
        u8Next: write ? undefined : result.u8Next,
        nextFNext: write ? undefined : result.nextFNext,
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
