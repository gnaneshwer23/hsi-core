#!/usr/bin/env bun
/**
 * Synthetic e2e → N4 context-mismatch adapter check.
 * Engineering fixture only — groundedClaimAccepted stays false.
 */
import {resolve} from "node:path";
import {
  adaptVendoredSyntheticE2eN4Demo,
  checkSyntheticE2eN4Adapter,
  parseSyntheticE2eN4AdapterDemo,
} from "../src/evidence/syntheticE2eN4Adapter";

const root = resolve(import.meta.dir, "..");

export function runSyntheticE2eN4AdapterCheck(): ReturnType<typeof checkSyntheticE2eN4Adapter> {
  const demo = parseSyntheticE2eN4AdapterDemo(
    adaptVendoredSyntheticE2eN4Demo({
      repoRoot: root,
      generatedAt: "2026-11-08T05:40:00.000Z",
    }),
  );
  if (demo.brief.groundedClaimAccepted !== false) {
    throw new Error("groundedClaimAccepted must stay false");
  }
  if (!demo.hasWrongContext) {
    throw new Error("species/context mismatch hit required");
  }
  return checkSyntheticE2eN4Adapter(root);
}

if (import.meta.main) {
  const result = runSyntheticE2eN4AdapterCheck();
  console.log(
    JSON.stringify(
      {
        ok: result.ok,
        adapterId: result.adapterId,
        outcome: result.outcome,
        supportAssessments: result.supportAssessments,
        groundedClaimAccepted: result.groundedClaimAccepted,
        engineeringHarness: result.engineeringHarness,
        scientificAcceptance: result.scientificAcceptance,
        check: "fixture:synthetic-e2e:n4-adapter",
      },
      null,
      2,
    ),
  );
}
