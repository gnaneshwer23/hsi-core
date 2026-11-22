#!/usr/bin/env bun
/**
 * U40 — restricted-preview auth + continuous-journey evidence CLI.
 * --check / --fixture are CI-safe. --live requires owner env and never claims preview GO.
 */
import {
  HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL,
} from "../src/hsiRestrictedPreviewEvidenceAuthorization";
import {runHsiRestrictedPreviewEvidenceSuite} from "../src/operations/hsiRestrictedPreviewEvidenceRunner";
import type {HsiRestrictedPreviewEvidenceSuiteMode} from "../src/operations/hsiRestrictedPreviewEvidenceSuite";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const check = process.argv.includes("--check");
const fixture = process.argv.includes("--fixture");
const live = process.argv.includes("--live");

let mode: HsiRestrictedPreviewEvidenceSuiteMode = "check";
if (live) mode = "live";
else if (fixture) mode = "fixture";
else if (check) mode = "check";

const fillRefs =
  mode === "live" &&
  arg("--staging-target-ref") &&
  arg("--preview-grant-ref") &&
  arg("--staging-grant-run-ref")
    ? {
        stagingTargetRef: arg("--staging-target-ref")!,
        previewGrantRef: arg("--preview-grant-ref")!,
        stagingGrantRunRef: arg("--staging-grant-run-ref")!,
      }
    : undefined;

try {
  const result = await runHsiRestrictedPreviewEvidenceSuite({
    authorization: HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL,
    mode,
    fillRefs,
  });
  console.log(JSON.stringify(result, null, 2));
  if (result.restrictedPreviewClaimed !== false || result.checklist1Verified !== false) {
    throw Error("honesty invariant broken");
  }
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
