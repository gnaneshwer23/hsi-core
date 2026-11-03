/**
 * Scaffold empty context-annotation worksheet rows.
 * Usage:
 *   bun scripts/scaffold-ra-annotation.ts practice
 *   bun scripts/scaffold-ra-annotation.ts verified
 *
 * `verified` requires a rights-verified research/ra-anti-tnf/release.json.
 * Never invents SME labels.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  emptyContextAnnotationBenchmarkKit,
  scaffoldPracticeRowsFromResearchRelease,
  scaffoldRowsFromVerifiedRelease,
  buildDoubleBlindLabelPackets,
  assignPartitionsByPolicy,
  assertBenchmarkKitHonesty,
  type ContextAnnotationBenchmarkKit,
} from "../src/contextAnnotationBenchmark";
import { RaEvidenceUnavailableError } from "../src/raEvidenceRelease";

const mode = process.argv[2];
if (mode !== "practice" && mode !== "verified") {
  throw new Error("Usage: bun scripts/scaffold-ra-annotation.ts practice|verified");
}

const root = resolve(import.meta.dir, "..");
const outDir = resolve(root, "research/ra-anti-tnf/annotation-kit");
mkdirSync(outDir, { recursive: true });
const kitPath = resolve(outDir, "benchmark-kit.json");

function loadPriorPracticeRows(): ContextAnnotationBenchmarkKit["emptyLabelStore"]["practice_not_evaluation"] {
  if (!existsSync(kitPath)) return [];
  try {
    const prior = JSON.parse(readFileSync(kitPath, "utf8")) as ContextAnnotationBenchmarkKit;
    const rows = prior.emptyLabelStore?.practice_not_evaluation;
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

const kit = emptyContextAnnotationBenchmarkKit(
  mode === "verified" ? "ready_for_sme_kickoff" : "awaiting_rights_verified_passages",
);

try {
  if (mode === "practice") {
    const research = JSON.parse(readFileSync(resolve(root, "research/ra-anti-tnf-research/release.json"), "utf8"));
    kit.emptyLabelStore.practice_not_evaluation = scaffoldPracticeRowsFromResearchRelease(research);
    // Keep any previously minted verified partitions when re-scaffolding practice only.
    if (existsSync(kitPath)) {
      try {
        const prior = JSON.parse(readFileSync(kitPath, "utf8")) as ContextAnnotationBenchmarkKit;
        kit.emptyLabelStore.evaluation_frozen = prior.emptyLabelStore?.evaluation_frozen ?? [];
        kit.emptyLabelStore.training_candidate = prior.emptyLabelStore?.training_candidate ?? [];
        if (kit.emptyLabelStore.evaluation_frozen.length || kit.emptyLabelStore.training_candidate.length) {
          kit.status = "ready_for_sme_kickoff";
        }
      } catch {
        /* ignore corrupt prior kit */
      }
    }
    const [packetA, packetB] = buildDoubleBlindLabelPackets(kit.emptyLabelStore.practice_not_evaluation);
    writeFileSync(resolve(outDir, "practice-packet-annotator-a.json"), `${JSON.stringify(packetA, null, 2)}\n`);
    writeFileSync(resolve(outDir, "practice-packet-annotator-b.json"), `${JSON.stringify(packetB, null, 2)}\n`);
  } else {
    const release = JSON.parse(readFileSync(resolve(root, "research/ra-anti-tnf/release.json"), "utf8"));
    const rows = scaffoldRowsFromVerifiedRelease(release, "evaluation_frozen");
    const split = assignPartitionsByPolicy(rows);
    kit.emptyLabelStore.evaluation_frozen = split.evaluation_frozen;
    kit.emptyLabelStore.training_candidate = [...split.training_candidate, ...split.holdout_candidate];
    kit.emptyLabelStore.practice_not_evaluation = loadPriorPracticeRows();
    kit.status = "ready_for_sme_kickoff";
    const [packetA, packetB] = buildDoubleBlindLabelPackets([
      ...kit.emptyLabelStore.evaluation_frozen,
      ...kit.emptyLabelStore.training_candidate,
    ]);
    writeFileSync(resolve(outDir, "eval-packet-annotator-a.json"), `${JSON.stringify(packetA, null, 2)}\n`);
    writeFileSync(resolve(outDir, "eval-packet-annotator-b.json"), `${JSON.stringify(packetB, null, 2)}\n`);
  }
} catch (error) {
  if (error instanceof RaEvidenceUnavailableError || (error as Error)?.message?.includes("RA evidence release")) {
    writeFileSync(
      resolve(outDir, "STATUS.json"),
      `${JSON.stringify(
        {
          ok: false,
          mode,
          status: "awaiting_rights_verified_passages",
          reason: "Rights-verified RA release is not available; practice mode can still run.",
        },
        null,
        2,
      )}\n`,
    );
    console.log(JSON.stringify({ ok: false, mode, blocked: "awaiting_rights_verified_passages" }, null, 2));
    process.exit(mode === "verified" ? 2 : 1);
  }
  throw error;
}

assertBenchmarkKitHonesty(kit);
writeFileSync(resolve(outDir, "benchmark-kit.json"), `${JSON.stringify(kit, null, 2)}\n`);
writeFileSync(
  resolve(outDir, "STATUS.json"),
  `${JSON.stringify(
    {
      ok: true,
      mode,
      status: kit.status,
      practiceRows: kit.emptyLabelStore.practice_not_evaluation.length,
      evaluationRows: kit.emptyLabelStore.evaluation_frozen.length,
      trainingRows: kit.emptyLabelStore.training_candidate.length,
      labelledRows: 0,
      note: "Empty scaffolds only — SME labels not fabricated.",
    },
    null,
    2,
  )}\n`,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      mode,
      outDir: "research/ra-anti-tnf/annotation-kit",
      practiceRows: kit.emptyLabelStore.practice_not_evaluation.length,
      evaluationRows: kit.emptyLabelStore.evaluation_frozen.length,
      trainingRows: kit.emptyLabelStore.training_candidate.length,
    },
    null,
    2,
  ),
);
