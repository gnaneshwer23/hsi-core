#!/usr/bin/env bun
/**
 * P3.3 FAIR ESM-2 thin embedding stub CLI — emits ModelProposalArtifacts + sidecar refs.
 * Usage: bun run src/cli/esm-adapter.ts [--live]
 * Default: deterministic stub. --live tries python3+esm import then falls back to stub.
 * Never downloads multi-GB weights; never PHI / clinic sequences; Boltz deferred.
 */
import {
  runEsmAdapter,
  serializeEsmAdapterBundle,
} from "../adapters/esmAdapter";

const live = process.argv.includes("--live");
const bundle = runEsmAdapter({
  forceStub: !live,
});

process.stdout.write(serializeEsmAdapterBundle(bundle));
