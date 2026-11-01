#!/usr/bin/env bun
/**
 * P3.2 REINVENT4 thin adapter CLI — emits ModelProposalArtifacts only.
 * Usage: bun run src/cli/reinvent4-adapter.ts [--live]
 * Default: deterministic stub. --live tries python3+reinvent import then falls back to stub.
 * Never downloads multi-GB weights; never clinic recommendation path.
 */
import {
  runReinvent4Adapter,
  serializeReinvent4AdapterBundle,
} from "../adapters/reinvent4Adapter";

const live = process.argv.includes("--live");
const bundle = runReinvent4Adapter({
  forceStub: !live,
});

process.stdout.write(serializeReinvent4AdapterBundle(bundle));
