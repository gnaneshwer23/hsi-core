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
const modules = [
  { name: "sharedTechnology", version: "hsi-shared-technology-1" },
  { name: "researchContracts", version: "hsi-research-contract-1" },
  { name: "investigationService", version: "hsi-investigation-1" },
  { name: "investigationBackend", version: "hsi-investigation-backend-1" },
  { name: "raEvidenceRelease", version: "hsi-ra-evidence-release-1" },
];
// Preflight every source before writing any consumer file.
for (const module of modules) {
  if (execFileSync("git", ["status", "--porcelain", "--", `src/${module.name}.ts`], { cwd: root, encoding: "utf8" }).trim()) {
    throw new Error("Commit canonical shared technology before exporting it.");
  }
}
const commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
for (const module of modules) {
  const path = `src/${module.name}.ts`;
  const source = readFileSync(resolve(root, path), "utf8");
  const provenance = {
    repository: "gnaneshwer23/hsi-core", commit, path, version: module.version,
    sha256: createHash("sha256").update(source).digest("hex"),
    distribution: "exact_source_snapshot", executable: true, includesProductData: false,
  };
  for (const name of requested) {
    const destination = destinations[name as keyof typeof destinations];
    mkdirSync(destination, { recursive: true });
    writeFileSync(resolve(destination, `${module.name}.ts`), source);
    writeFileSync(resolve(destination, `${module.name}.provenance.json`), JSON.stringify(provenance, null, 2) + "\n");
    console.log(`Exported ${module.name} to ${name}`);
  }
}
