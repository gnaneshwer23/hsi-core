/**
 * Offline end-to-end demonstration.
 * The cohort is synthetic. No network calls and no database writes.
 *
 * By default writes only to a temp file so tests/local runs do not rewrite tracked
 * `site/public/demo/scenario.json`. Pass `--write-site` to refresh the committed asset.
 */
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runDemoScenario } from "../demo/scenario";

const writeSite = process.argv.includes("--write-site");
const report = await runDemoScenario();
const summary = {
  synthetic: report.synthetic,
  networkUsed: report.networkUsed,
  question: report.question,
  cohortSize: report.cohortSize,
  diabetesKeptDistinct: report.diabetesCounts,
  focus: report.focus.pseudonym,
  evidenceMode: report.evidence.mode,
  literatureCount: report.evidence.literature.length,
  targetSymbols: report.targets.map((target) => target.symbol),
  reviewStatus: report.reviewStatus,
  release: report.release,
  laterInvestigationUsesRelease: report.secondMentionsApprovedEdge,
  patientQuestionSent: report.patientQuestionSent,
  similarityIsEligibility: report.similarityIsEligibility,
  confirmedEligible: report.prescreen.confirmedEligible,
  unknownCriterion: report.prescreen.criteria.find((item) => item.state === "unknown")?.id ?? null,
  phiBlocked: report.phiBlocked,
  adapters: report.repurposing[0]?.adapters ?? [],
};
const outPath = writeSite
  ? "site/public/demo/scenario.json"
  : join(mkdtempSync(join(tmpdir(), "hsi-demo-")), "scenario.json");
if (writeSite) mkdirSync("site/public/demo", { recursive: true });
writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...summary, scenarioPath: outPath, wroteTrackedSite: writeSite }, null, 2));
if (!report.secondMentionsApprovedEdge || report.patientQuestionSent || report.prescreen.confirmedEligible || !report.phiBlocked) {
  console.error("Demonstration invariants failed");
  process.exit(1);
}
