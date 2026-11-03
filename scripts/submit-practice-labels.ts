/**
 * Validate and store a filled practice labelling packet.
 * Usage: bun scripts/submit-practice-labels.ts <annotator-a|annotator-b> <submission.json>
 *
 * Submission JSON shape: PracticeLabelSubmission (see contextAnnotationBenchmark.ts).
 * Never promotes practice rows into evaluation.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { acceptPracticeLabelSubmission, type PracticeLabelSubmission } from "../src/contextAnnotationBenchmark";

const slotArg = process.argv[2];
const submissionPath = process.argv[3];
if ((slotArg !== "annotator-a" && slotArg !== "annotator-b") || !submissionPath) {
  throw new Error("Usage: bun scripts/submit-practice-labels.ts annotator-a|annotator-b <submission.json>");
}

const root = resolve(import.meta.dir, "..");
const packetFile =
  slotArg === "annotator-a"
    ? "research/ra-anti-tnf/annotation-kit/practice-packet-annotator-a.json"
    : "research/ra-anti-tnf/annotation-kit/practice-packet-annotator-b.json";
const blank = JSON.parse(readFileSync(resolve(root, packetFile), "utf8"));
const submission = JSON.parse(readFileSync(resolve(submissionPath), "utf8")) as PracticeLabelSubmission;
const accepted = acceptPracticeLabelSubmission(blank, submission);

const outDir = resolve(root, "research/ra-anti-tnf/annotation-kit/practice-submissions");
mkdirSync(outDir, { recursive: true });
const outPath = resolve(outDir, `${accepted.annotatorSlot}-${accepted.annotatorId.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`);
writeFileSync(outPath, `${JSON.stringify(accepted, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      ok: true,
      outPath: outPath.replace(`${root}/`, ""),
      rows: accepted.rows.length,
      partition: accepted.partition,
      notForEvaluation: accepted.notForEvaluation,
      note: "Practice submission stored. Does not enter frozen evaluation.",
    },
    null,
    2,
  ),
);
