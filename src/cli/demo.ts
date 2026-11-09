/**
 * Offline end-to-end demonstration.
 * The cohort is synthetic. No network calls and no database writes.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { runDemoScenario } from "../demo/scenario";

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
mkdirSync("site/public/demo", { recursive: true });
writeFileSync("site/public/demo/scenario.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
if (!report.secondMentionsApprovedEdge || report.patientQuestionSent || report.prescreen.confirmedEligible || !report.phiBlocked) {
  console.error("Demonstration invariants failed");
  process.exit(1);
}
