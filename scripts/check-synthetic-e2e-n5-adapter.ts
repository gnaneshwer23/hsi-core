#!/usr/bin/env bun
/**
 * Synthetic e2e → N5 Path B adapter check.
 * Vendored samples only — no HTTP server, Neon clinical writes, Gate C, or CDS.
 */
import {resolve} from "node:path";
import {
  adaptVendoredSyntheticE2eDefaultSlice,
  checkSyntheticE2eN5Adapter,
  parseSyntheticE2eN5AdapterSlice,
} from "../src/evidence/syntheticE2eN5Adapter";

const root = resolve(import.meta.dir, "..");

export function runSyntheticE2eN5AdapterCheck(): ReturnType<typeof checkSyntheticE2eN5Adapter> {
  const primary = parseSyntheticE2eN5AdapterSlice(
    adaptVendoredSyntheticE2eDefaultSlice({
      repoRoot: root,
      sampleRelativePath: "outputs/sample_response.json",
      generatedAt: "2026-11-08T05:30:00.000Z",
    }),
  );
  if (primary.patientId !== "SYNTHETIC/PATIENT/0000") {
    throw new Error("default slice must be SYNTHETIC/PATIENT/0000");
  }
  if (primary.protocolVersionId !== "SYNTHETIC/TRIAL/RA/v2") {
    throw new Error("default slice must use SYNTHETIC/TRIAL/RA/v2");
  }
  if (primary.inspections.length < 1) {
    throw new Error("default slice must map criteria");
  }
  return checkSyntheticE2eN5Adapter(root);
}

if (import.meta.main) {
  const result = runSyntheticE2eN5AdapterCheck();
  console.log(
    JSON.stringify(
      {
        ok: result.ok,
        adapterId: result.adapterId,
        slices: result.slices,
        patientIds: result.patientIds,
        packStatuses: result.packStatuses,
        engineeringHarness: result.engineeringHarness,
        scientificAcceptance: result.scientificAcceptance,
        check: "fixture:synthetic-e2e:n5-adapter",
      },
      null,
      2,
    ),
  );
}
