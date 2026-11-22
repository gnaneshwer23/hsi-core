#!/usr/bin/env bun
/**
 * U48 — apply a Human #4 SME reliability fill proposal into U7 + E2E-10 pendings.
 *
 * Default is dry-run. --write requires dual owner flags and never claims
 * smeGoldFilled or scientificApproval.
 */
import {readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  HSI_SME_RELIABILITY_FILL_APPLY_OWNER_APPROVAL,
} from "../src/hsiSmeReliabilityFillApplyAuthorization";
import {
  applyHsiSmeReliabilityFillProposal,
  type HsiSmeReliabilityFillProposal,
  type HsiSmeReliabilityPendingWorksheet,
} from "../src/operations/hsiSmeReliabilityFillApply";

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
      error: "Required: --proposal <path-to-sme-reliability-fill-proposal.json>",
    }),
  );
  process.exit(1);
}

const root = resolve(import.meta.dir, "..");
const u7Path = resolve(
  root,
  "operations/staging/hsi-10-scientific-reliability-u7.pending.json",
);
const e2e10Path = resolve(
  root,
  "operations/staging/e2e-10-sme-gold-vault.pending.json",
);

try {
  if (write) {
    if (process.env.HSI_SME_RELIABILITY_FILL_APPLY_ENABLED !== "1") {
      throw Error(
        "Write apply refused: set HSI_SME_RELIABILITY_FILL_APPLY_ENABLED=1 only for an owner-reviewed fill",
      );
    }
    if (process.env.HSI_SME_RELIABILITY_FILL_APPLY_WRITE_AUTHORIZED !== "1") {
      throw Error(
        "Write apply refused: set HSI_SME_RELIABILITY_FILL_APPLY_WRITE_AUTHORIZED=1 for an owner-reviewed write",
      );
    }
  }

  const proposal = JSON.parse(
    readFileSync(resolve(proposalPath), "utf8"),
  ) as HsiSmeReliabilityFillProposal;
  const u7Pending = JSON.parse(
    readFileSync(u7Path, "utf8"),
  ) as HsiSmeReliabilityPendingWorksheet;
  const e2e10Pending = JSON.parse(
    readFileSync(e2e10Path, "utf8"),
  ) as HsiSmeReliabilityPendingWorksheet;

  const result = applyHsiSmeReliabilityFillProposal({
    authorization: HSI_SME_RELIABILITY_FILL_APPLY_OWNER_APPROVAL,
    proposal,
    u7Pending,
    e2e10Pending,
    dryRun: !write,
  });

  if (
    result.smeGoldFilled !== false ||
    result.scientificApproval !== false ||
    result.adjudicatedCases !== 0 ||
    result.acceptedForScope !== false
  ) {
    throw Error("honesty invariant broken");
  }

  if (write) {
    writeFileSync(u7Path, `${JSON.stringify(result.u7Next, null, 2)}\n`);
    writeFileSync(e2e10Path, `${JSON.stringify(result.e2e10Next, null, 2)}\n`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        dryRun: result.dryRun,
        wrote: write,
        smeGoldFilled: result.smeGoldFilled,
        scientificApproval: result.scientificApproval,
        adjudicatedCases: result.adjudicatedCases,
        appliedReferenceKeys: result.appliedReferenceKeys,
        notes: result.notes,
        u7Next: write ? undefined : result.u7Next,
        e2e10Next: write ? undefined : result.e2e10Next,
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
