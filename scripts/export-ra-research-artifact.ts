/** Export the RA research working-set artifact into product corpora. Separate from rights-verified RA export. */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import {
  RA_RESEARCH_RELEASE_ID,
  buildRaResearchEvidenceBundle,
  parseRaResearchEvidenceRelease,
  raResearchEvidenceReadiness,
} from "../src/raResearchEvidenceRelease";

const root = resolve(import.meta.dir, "..");
const destinations = {
  isi: resolve(root, "../immunecity/src/data/hsi/ra-anti-tnf-research"),
  aksh: resolve(root, "../aksh-health-redesign/packages/platform-uk/data/hsi/ra-anti-tnf-research"),
} as const;

const requested = process.argv.slice(2);
if (!requested.length || requested.some((name) => !(name in destinations))) {
  throw new Error("Usage: bun scripts/export-ra-research-artifact.ts isi aksh");
}

for (const relative of ["research/ra-anti-tnf-research/release.json", "src/raResearchEvidenceRelease.ts"]) {
  if (execFileSync("git", ["status", "--porcelain", "--", relative], { cwd: root, encoding: "utf8" }).trim()) {
    throw new Error(`Commit ${relative} before exporting the research artifact.`);
  }
}

const commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const releasePath = resolve(root, "research/ra-anti-tnf-research/release.json");
const readmePath = resolve(root, "research/ra-anti-tnf-research/README.md");
const releaseRaw = JSON.parse(readFileSync(releasePath, "utf8")) as unknown;
const readiness = raResearchEvidenceReadiness(releaseRaw);
if (!readiness.available) throw new Error(`Research release is not available: ${readiness.reason}`);
const release = parseRaResearchEvidenceRelease(releaseRaw);
const bundle = buildRaResearchEvidenceBundle(releaseRaw);
if (bundle.claims.length) throw new Error("Research artifact export refuses claim-bearing releases");
if (bundle.context.dataClass !== "synthetic") throw new Error("Research artifact must remain synthetic");

const readme = existsSync(readmePath) ? readFileSync(readmePath, "utf8") : null;
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const releaseText = `${JSON.stringify(release, null, 2)}\n`;

for (const name of requested) {
  const destination = destinations[name as keyof typeof destinations];
  mkdirSync(destination, { recursive: true });
  const manifest = {
    schemaVersion: "hsi-ra-research-evidence-artifact-1",
    releaseId: RA_RESEARCH_RELEASE_ID,
    corpusKind: "research_working_set",
    notForScientificClaim: true,
    repository: "gnaneshwer23/hsi-core",
    commit,
    distribution: "research_artifact_snapshot",
    executable: false,
    includesProductData: false,
    scientificReview: "unreviewed",
    readiness,
    bundleVersion: bundle.context.provenance.version,
    files: {
      release: { path: "release.json", sha256: digest(releaseText) },
      readme: readme ? { path: "README.md", sha256: digest(readme) } : null,
    },
  };
  writeFileSync(resolve(destination, "release.json"), releaseText);
  if (readme) writeFileSync(resolve(destination, "README.md"), readme);
  writeFileSync(resolve(destination, "artifact.manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Exported RA research artifact to ${name} (available=${readiness.available}, notForScientificClaim=true)`);
}
