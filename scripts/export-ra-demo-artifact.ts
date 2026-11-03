/** Export the DEMO RA fixture artifact into product corpora. Separate from rights-verified RA export. */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import {
  RA_DEMO_RELEASE_ID,
  buildRaDemoEvidenceBundle,
  parseRaDemoEvidenceRelease,
  raDemoEvidenceReadiness,
} from "../src/raDemoEvidenceRelease";

const root = resolve(import.meta.dir, "..");
const destinations = {
  isi: resolve(root, "../immunecity/src/data/hsi/ra-anti-tnf-demo"),
  aksh: resolve(root, "../aksh-health-redesign/packages/platform-uk/data/hsi/ra-anti-tnf-demo"),
} as const;

const requested = process.argv.slice(2);
if (!requested.length || requested.some((name) => !(name in destinations))) {
  throw new Error("Usage: bun scripts/export-ra-demo-artifact.ts isi aksh");
}

for (const relative of ["research/ra-anti-tnf-demo/release.json", "src/raDemoEvidenceRelease.ts"]) {
  if (execFileSync("git", ["status", "--porcelain", "--", relative], { cwd: root, encoding: "utf8" }).trim()) {
    throw new Error(`Commit ${relative} before exporting the demo research artifact.`);
  }
}

const commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const releasePath = resolve(root, "research/ra-anti-tnf-demo/release.json");
const readmePath = resolve(root, "research/ra-anti-tnf-demo/README.md");
const releaseRaw = JSON.parse(readFileSync(releasePath, "utf8")) as unknown;
const readiness = raDemoEvidenceReadiness(releaseRaw);
if (!readiness.available) throw new Error(`Demo release is not available: ${readiness.reason}`);
const release = parseRaDemoEvidenceRelease(releaseRaw);
const bundle = buildRaDemoEvidenceBundle(releaseRaw);
if (bundle.claims.length) throw new Error("Demo artifact export refuses claim-bearing releases");
if (bundle.context.dataClass !== "synthetic") throw new Error("Demo artifact must remain synthetic");

const readme = existsSync(readmePath) ? readFileSync(readmePath, "utf8") : null;
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const releaseText = `${JSON.stringify(release, null, 2)}\n`;

for (const name of requested) {
  const destination = destinations[name as keyof typeof destinations];
  mkdirSync(destination, { recursive: true });
  const manifest = {
    schemaVersion: "hsi-ra-demo-evidence-artifact-1",
    releaseId: RA_DEMO_RELEASE_ID,
    corpusKind: "demo_fixture",
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
  console.log(`Exported RA DEMO artifact to ${name} (available=${readiness.available}, not_for_scientific_claim=true)`);
}
