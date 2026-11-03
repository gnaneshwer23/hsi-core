/** Versioned research-artifact export for product corpora. Separate from executable-code sync.
 * Never invents passages or licence grants. A failed/stale/unavailable import must not overwrite a previously valid release.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { parseRaEvidenceRelease, buildRaEvidenceBundle, raEvidenceReadiness, RA_RELEASE_ID } from "../src/raEvidenceRelease";
import { parseResearchBundle } from "../src/researchContracts";

const root = resolve(import.meta.dir, "..");
const destinations = {
  isi: resolve(root, "../immunecity/src/data/hsi/ra-anti-tnf"),
  aksh: resolve(root, "../aksh-health-redesign/packages/platform-uk/data/hsi/ra-anti-tnf"),
} as const;

const requested = process.argv.slice(2);
if (!requested.length || requested.some((name) => !(name in destinations))) {
  throw new Error("Usage: bun scripts/export-ra-evidence-artifact.ts isi aksh");
}

const releasePath = resolve(root, "research/ra-anti-tnf/release.json");
const graphPath = resolve(root, "research/ra-anti-tnf/graph-context.json");
const guidelinePath = resolve(root, "research/ra-anti-tnf/context-annotation-guideline-v1.md");
const worksheetPath = resolve(root, "research/ra-anti-tnf/context-annotation-worksheet-v1.json");

for (const relative of [
  "research/ra-anti-tnf/release.json",
  "research/ra-anti-tnf/graph-context.json",
  "src/raEvidenceRelease.ts",
]) {
  if (execFileSync("git", ["status", "--porcelain", "--", relative], { cwd: root, encoding: "utf8" }).trim()) {
    throw new Error(`Commit ${relative} before exporting the research artifact.`);
  }
}

const commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const releaseRaw = JSON.parse(readFileSync(releasePath, "utf8")) as unknown;
const graphRaw = JSON.parse(readFileSync(graphPath, "utf8")) as unknown;
const graph = parseResearchBundle(graphRaw);
const readiness = raEvidenceReadiness(releaseRaw);

let validatedRelease: unknown = releaseRaw;
let bundleVersion: string | null = null;
if (readiness.available) {
  const release = parseRaEvidenceRelease(releaseRaw);
  const bundle = buildRaEvidenceBundle(graph, releaseRaw);
  validatedRelease = release;
  bundleVersion = bundle.context.provenance.version;
  if (bundle.claims.length) throw new Error("RA artifact export refuses claim-bearing releases");
} else {
  // Keep the explicit pending marker; never invent passages to satisfy the validator.
  validatedRelease = releaseRaw;
  bundleVersion = null;
}

const guideline = existsSync(guidelinePath) ? readFileSync(guidelinePath, "utf8") : null;
const worksheet = existsSync(worksheetPath) ? JSON.parse(readFileSync(worksheetPath, "utf8")) : null;

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function writeAtomic(path: string, body: string) {
  writeFileSync(path, body);
}

for (const name of requested) {
  const destination = destinations[name as keyof typeof destinations];
  mkdirSync(destination, { recursive: true });
  const existingReleasePath = resolve(destination, "release.json");
  if (existsSync(existingReleasePath) && !readiness.available) {
    let existingValid = false;
    try {
      parseRaEvidenceRelease(JSON.parse(readFileSync(existingReleasePath, "utf8")));
      existingValid = true;
    } catch {
      existingValid = false;
    }
    if (existingValid) {
      throw new Error(`Refusing to overwrite a previously valid ${name} RA release with an unavailable import.`);
    }
  }

  const releaseText = `${JSON.stringify(validatedRelease, null, 2)}\n`;
  const graphText = `${JSON.stringify(graphRaw, null, 2)}\n`;
  const manifest = {
    schemaVersion: "hsi-ra-evidence-artifact-1",
    releaseId: RA_RELEASE_ID,
    repository: "gnaneshwer23/hsi-core",
    commit,
    distribution: "research_artifact_snapshot",
    executable: false,
    includesProductData: false,
    scientificReview: "unreviewed",
    readiness,
    bundleVersion,
    files: {
      release: { path: "release.json", sha256: digest(releaseText) },
      graphContext: { path: "graph-context.json", sha256: digest(graphText) },
      guideline: guideline ? { path: "context-annotation-guideline-v1.md", sha256: digest(guideline) } : null,
      worksheet: worksheet ? { path: "context-annotation-worksheet-v1.json", sha256: digest(`${JSON.stringify(worksheet, null, 2)}\n`) } : null,
    },
  };

  writeAtomic(resolve(destination, "release.json"), releaseText);
  writeAtomic(resolve(destination, "graph-context.json"), graphText);
  if (guideline) writeAtomic(resolve(destination, "context-annotation-guideline-v1.md"), guideline);
  if (worksheet) writeAtomic(resolve(destination, "context-annotation-worksheet-v1.json"), `${JSON.stringify(worksheet, null, 2)}\n`);
  writeAtomic(resolve(destination, "artifact.manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Exported RA research artifact to ${name} (available=${readiness.available})`);
}
