#!/usr/bin/env bun
/**
 * P3.0 RDKit thin adapter CLI — emits ModelProposalArtifacts only.
 * Usage: bun run src/cli/rdkit-adapter.ts [--live]
 * Default: deterministic stub. --live tries python3+rdkit then falls back to stub.
 */
import {
  runRdkitAdapter,
  serializeRdkitAdapterBundle,
} from "../adapters/rdkitAdapter";

const live = process.argv.includes("--live");
const bundle = runRdkitAdapter({
  forceStub: !live,
});

process.stdout.write(serializeRdkitAdapterBundle(bundle));
