#!/usr/bin/env bun
/**
 * P3.1 OpenMM thin adapter CLI — emits ModelProposalArtifacts only.
 * Usage: bun run src/cli/openmm-adapter.ts [--live]
 * Default: deterministic stub. --live tries python3+openmm then falls back to stub.
 */
import {
  runOpenmmAdapter,
  serializeOpenmmAdapterBundle,
} from "../adapters/openmmAdapter";

const live = process.argv.includes("--live");
const bundle = runOpenmmAdapter({
  forceStub: !live,
});

process.stdout.write(serializeOpenmmAdapterBundle(bundle));
