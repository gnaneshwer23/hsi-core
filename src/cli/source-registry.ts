#!/usr/bin/env bun
import { mkdirSync, readFileSync, writeFileSync, renameSync, openSync, closeSync, unlinkSync, existsSync, statSync, fsyncSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createSourceRegistry, importSourceMetadata, parseSourceRegistry } from "../sourceRegistry";
import { HSI_T2D_IMMUNO_SEED_EDGES } from "../seed/t2dImmunoMetabolic";

const [mode, input, target] = process.argv.slice(2);
const output = resolve((mode === "init" ? input : target) ?? "site/public/research/source-registry.json");
if (mode !== "init" && mode !== "import") throw new Error("Usage: source-registry.ts init | import INPUT [OUTPUT]");
mkdirSync(dirname(output), { recursive: true });
const lock = `${output}.lock`;
let lockDescriptor: number;
try { lockDescriptor = openSync(lock, "wx", 0o600); } catch { throw new Error("Registry is locked by another writer; inspect the lock before retrying."); }
const temporary = `${output}.${process.pid}.tmp`;
try {
let registry;
if (mode === "init") {
  // Initialisation never overwrites a registry containing imported revisions.
  if (await Bun.file(output).exists()) throw new Error("Registry already exists; use import to preserve source history.");
  registry = createSourceRegistry(HSI_T2D_IMMUNO_SEED_EDGES);
} else {
  if (!input) throw new Error("Pass a public source-metadata import JSON file.");
  if (statSync(resolve(input)).size > 5_000_000 || statSync(output).size > 5_000_000) throw new Error("Import or registry exceeds size limit");
  const raw = readFileSync(resolve(input), "utf8");
  if (Buffer.byteLength(raw) > 5_000_000) throw new Error("Import exceeds size limit");
  const result = importSourceMetadata(parseSourceRegistry(JSON.parse(readFileSync(output, "utf8"))), JSON.parse(raw));
  console.log(JSON.stringify({ added: result.added, unchanged: result.unchanged, quarantined: result.quarantined }));
  if (result.quarantined.length) throw new Error("Import rejected; the existing registry is unchanged.");
  registry = result.registry;
}
parseSourceRegistry(registry);
writeFileSync(temporary, `${JSON.stringify(registry, null, 2)}\n`, { flag: "wx" });
const descriptor = openSync(temporary, "r");
try { fsyncSync(descriptor); } finally { closeSync(descriptor); }
renameSync(temporary, output);
console.log(`Wrote ${registry.sources.length} source locators; exact claim support remains unassessed.`);
} finally {
  if (existsSync(temporary)) unlinkSync(temporary);
  closeSync(lockDescriptor);
  unlinkSync(lock);
}
