#!/usr/bin/env bun
/**
 * U47 — apply a Human #2/#3/#5 owner-packet fill proposal into the U6 pending worksheet.
 *
 * Default is dry-run (prints next JSON). --write requires dual owner flags and
 * never claims Human gates closed or signed packets.
 */
import {readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  HSI_OWNER_PACKET_FILL_APPLY_OWNER_APPROVAL,
} from "../src/hsiOwnerPacketFillApplyAuthorization";
import {
  applyHsiOwnerPacketFillProposal,
  type HsiOwnerPacketFillProposal,
  type HsiOwnerPacketPendingWorksheet,
} from "../src/operations/hsiOwnerPacketFillApply";

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
      error: "Required: --proposal <path-to-owner-packet-fill-proposal.json>",
    }),
  );
  process.exit(1);
}

const root = resolve(import.meta.dir, "..");
const ownerPacketsPath = resolve(
  root,
  "operations/staging/hsi-10-owner-packets.pending.json",
);

try {
  if (write) {
    if (process.env.HSI_OWNER_PACKET_FILL_APPLY_ENABLED !== "1") {
      throw Error(
        "Write apply refused: set HSI_OWNER_PACKET_FILL_APPLY_ENABLED=1 only for an owner-reviewed fill",
      );
    }
    if (process.env.HSI_OWNER_PACKET_FILL_APPLY_WRITE_AUTHORIZED !== "1") {
      throw Error(
        "Write apply refused: set HSI_OWNER_PACKET_FILL_APPLY_WRITE_AUTHORIZED=1 for an owner-reviewed write",
      );
    }
  }

  const proposal = JSON.parse(
    readFileSync(resolve(proposalPath), "utf8"),
  ) as HsiOwnerPacketFillProposal;
  const ownerPacketsPending = JSON.parse(
    readFileSync(ownerPacketsPath, "utf8"),
  ) as HsiOwnerPacketPendingWorksheet;

  const result = applyHsiOwnerPacketFillProposal({
    authorization: HSI_OWNER_PACKET_FILL_APPLY_OWNER_APPROVAL,
    proposal,
    ownerPacketsPending,
    dryRun: !write,
  });

  if (
    result.human2Closed !== false ||
    result.human3Closed !== false ||
    result.human5Closed !== false ||
    result.signedPacketClaimed !== false ||
    result.acceptedForScope !== false
  ) {
    throw Error("honesty invariant broken");
  }

  if (write) {
    writeFileSync(
      ownerPacketsPath,
      `${JSON.stringify(result.ownerPacketsNext, null, 2)}\n`,
    );
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        dryRun: result.dryRun,
        wrote: write,
        human2Closed: result.human2Closed,
        human3Closed: result.human3Closed,
        human5Closed: result.human5Closed,
        signedPacketClaimed: result.signedPacketClaimed,
        appliedReferenceKeys: result.appliedReferenceKeys,
        notes: result.notes,
        ownerPacketsNext: write ? undefined : result.ownerPacketsNext,
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
