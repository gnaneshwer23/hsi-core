#!/usr/bin/env bun
import {
  runTdcAdapter,
  serializeTdcAdapterBundle,
  serializeTdcAdapterMarkdown,
} from "../adapters/tdcAdapter";

const bundle = runTdcAdapter();
process.stdout.write(serializeTdcAdapterBundle(bundle));
if (process.argv.includes("--md")) {
  process.stderr.write(serializeTdcAdapterMarkdown(bundle));
}
