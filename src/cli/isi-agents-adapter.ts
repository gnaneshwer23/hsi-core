#!/usr/bin/env bun
import {
  runIsiAgentsAdapter,
  serializeIsiAgentsAdapterBundle,
  serializeIsiAgentsAdapterMarkdown,
} from "../adapters/isiAgentsAdapter";

const bundle = runIsiAgentsAdapter();
process.stdout.write(serializeIsiAgentsAdapterBundle(bundle));
if (process.argv.includes("--md")) {
  process.stderr.write(serializeIsiAgentsAdapterMarkdown(bundle));
}
