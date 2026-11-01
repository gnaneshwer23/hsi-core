#!/usr/bin/env bun
/**
 * Publish versioned consumer artifacts to dist/outputs/.
 * Usage: bun run outputs [cwd]
 * Alias: bun run publish
 */
import { publishOutputs } from "../publishOutputs";

const cwdArg = process.argv[2];
const result = publishOutputs(cwdArg ? { cwd: cwdArg } : undefined);

console.log(
  JSON.stringify(
    {
      ok: true,
      bundleId: result.bundleId,
      version: result.version,
      generatedAt: result.generatedAt,
      outDir: result.outDir,
      files: result.files,
      latestPointer: result.latestPointerPath,
      exportsSynced: result.exportsSynced,
      discoverySynced: result.discoverySynced,
    },
    null,
    2,
  ),
);
