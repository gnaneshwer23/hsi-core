#!/usr/bin/env bun
/**
 * Synthetic e2e honesty regression check.
 * Quarantine never ingests; Gate C / legalBinding stay false.
 */
import {resolve} from "node:path";
import {checkSyntheticE2eHonestyRegression} from "../src/evidence/syntheticE2eHonestyRegression";

const root = resolve(import.meta.dir, "..");

export function runSyntheticE2eHonestyCheck(): ReturnType<typeof checkSyntheticE2eHonestyRegression> {
  return checkSyntheticE2eHonestyRegression(root);
}

if (import.meta.main) {
  const result = runSyntheticE2eHonestyCheck();
  console.log(
    JSON.stringify(
      {
        ok: result.ok,
        regressionId: result.regressionId,
        quarantineRows: result.quarantineRows,
        oracleCases: result.oracleCases,
        engineeringHarness: result.engineeringHarness,
        scientificAcceptance: result.scientificAcceptance,
        banner: result.banner,
        check: "fixture:synthetic-e2e:honesty",
      },
      null,
      2,
    ),
  );
}
