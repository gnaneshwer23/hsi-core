#!/usr/bin/env bun
import {
  runBoltzAdapter,
  serializeBoltzAdapterBundle,
  serializeBoltzAdapterMarkdown,
} from "../adapters/boltzAdapter";

const bundle = runBoltzAdapter();
process.stdout.write(serializeBoltzAdapterBundle(bundle));
if (process.argv.includes("--md")) {
  process.stderr.write(serializeBoltzAdapterMarkdown(bundle));
}
