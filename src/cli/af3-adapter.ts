#!/usr/bin/env bun
import {
  runAf3Adapter,
  serializeAf3AdapterBundle,
  serializeAf3AdapterMarkdown,
} from "../adapters/af3Adapter";

const bundle = runAf3Adapter();
process.stdout.write(serializeAf3AdapterBundle(bundle));
if (process.argv.includes("--md")) {
  process.stderr.write(serializeAf3AdapterMarkdown(bundle));
}
