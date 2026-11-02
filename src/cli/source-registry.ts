#!/usr/bin/env bun
import { mkdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createSourceRegistry, importSourceMetadata, parseSourceRegistry } from "../sourceRegistry";
import { HSI_T2D_IMMUNO_SEED_EDGES } from "../seed/t2dImmunoMetabolic";

const [mode, input, target] = process.argv.slice(2);
const output = resolve((mode === "init" ? input : target) ?? "site/public/research/source-registry.json");
if (mode !== "init" && mode !== "import") throw new Error("Usage: source-registry.ts init | import INPUT [OUTPUT]");
let registry;
if (mode === "init") {
  // Initialisation never overwrites a registry containing imported revisions.
  if (await Bun.file(output).exists()) throw new Error("Registry already exists; use import to preserve source history.");
  registry = createSourceRegistry(HSI_T2D_IMMUNO_SEED_EDGES);
} else {
  if (!input) throw new Error("Pass a public source-metadata import JSON file.");
  const raw = readFileSync(resolve(input), "utf8");
  if (Buffer.byteLength(raw) > 5_000_000) throw new Error("Import exceeds size limit");
  const result = importSourceMetadata(parseSourceRegistry(JSON.parse(readFileSync(output, "utf8"))), JSON.parse(raw));
  console.log(JSON.stringify({ added: result.added, unchanged: result.unchanged, quarantined: result.quarantined }));
  if (result.quarantined.length) process.exit(1); // Keep the existing snapshot intact on partial/invalid imports.
  registry = result.registry;
}
mkdirSync(dirname(output), { recursive: true });
const temporary = `${output}.${process.pid}.tmp`;
writeFileSync(temporary, `${JSON.stringify(registry, null, 2)}\n`);
renameSync(temporary, output);
console.log(`Wrote ${registry.sources.length} source locators; exact claim support remains unassessed.`);
