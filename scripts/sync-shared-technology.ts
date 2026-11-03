/** Distribute only executable canonical code and its provenance; never product data or environment files. */
import { createHash } from "node:crypto";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
const root = resolve(import.meta.dir, "..");
const destinations = {
  isi: resolve(root, "../immunecity/src/lib/hsi/vendor"),
  aksh: resolve(root, "../aksh-health-redesign/packages/platform-uk/lib/hsi"),
};
const requested = process.argv.slice(2);
if (!requested.length || requested.some((name) => !(name in destinations))) throw new Error("Usage: bun scripts/sync-shared-technology.ts isi aksh");
const source = readFileSync(resolve(root, "src/sharedTechnology.ts"), "utf8");
if (execFileSync("git", ["status", "--porcelain", "--", "src/sharedTechnology.ts"], { cwd: root, encoding: "utf8" }).trim()) throw new Error("Commit canonical shared technology before exporting it.");
const provenance = {
  repository: "gnaneshwer23/hsi-core", commit: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
  path: "src/sharedTechnology.ts", version: "hsi-shared-technology-1", sha256: createHash("sha256").update(source).digest("hex"),
  distribution: "exact_source_snapshot", executable: true, includesProductData: false,
};
for (const name of requested) {
  const destination = destinations[name as keyof typeof destinations]; mkdirSync(destination, { recursive: true });
  writeFileSync(resolve(destination, "sharedTechnology.ts"), source);
  writeFileSync(resolve(destination, "sharedTechnology.provenance.json"), JSON.stringify(provenance, null, 2) + "\n");
  console.log(`Exported shared technology to ${name}`);
}
