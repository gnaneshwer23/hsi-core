#!/usr/bin/env bun
/**
 * P1.6 — Emit richer curator UX briefing (gap + Gate C).
 *
 * Usage:
 *   bun run curator-ux [outDir]
 *   bun run curator-ux --decisions path/to/decisions.json [outDir]
 *
 * Default: no human decisions → "awaiting partner review session".
 * Decisions JSON must match immunecity autumn-snow shape; autoApprove /
 * hsiGradeFlipped are refused.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import {
  buildCuratorUxBundle,
  parseCuratorGateCDecisions,
  serializeCuratorUx,
  serializeCuratorUxMarkdown,
  serializeRichGapReportMarkdown,
  serializeRichGateCChecklistMarkdown,
  type CuratorGateCDecision,
} from "../curatorUx";
import { buildGateCChecklist } from "../gateCChecklist";
import { buildSchemaGapReport } from "../gapReport";

function parseArgs(argv: string[]) {
  let decisionsPath: string | null = null;
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--decisions" || a === "-d") {
      decisionsPath = argv[i + 1] ?? null;
      i += 1;
      continue;
    }
    if (a.startsWith("-")) {
      throw new Error(`Unknown flag: ${a}`);
    }
    positional.push(a);
  }
  return {
    decisionsPath,
    outDir: resolve(process.cwd(), positional[0] ?? "exports/curator-ux"),
  };
}

const { decisionsPath, outDir } = parseArgs(process.argv.slice(2));
const generatedAt = new Date().toISOString();
const gap = buildSchemaGapReport({ generatedAt });
const gateC = buildGateCChecklist({ generatedAt });

let decisions: CuratorGateCDecision[] = [];
if (decisionsPath) {
  const raw = JSON.parse(readFileSync(resolve(process.cwd(), decisionsPath), "utf8"));
  const list = Array.isArray(raw) ? raw : raw?.decisions;
  decisions = parseCuratorGateCDecisions(list);
}

const bundle = buildCuratorUxBundle({
  generatedAt,
  gap,
  gateC,
  decisions,
});

mkdirSync(outDir, { recursive: true });
const jsonPath = join(outDir, "hsi-curator-ux.json");
const mdPath = join(outDir, "hsi-curator-ux.md");
const gapMdPath = join(outDir, "hsi-gap-report.md");
const gateMdPath = join(outDir, "gate-c-checklist.md");

writeFileSync(jsonPath, serializeCuratorUx(bundle), "utf8");
writeFileSync(mdPath, serializeCuratorUxMarkdown(bundle), "utf8");
writeFileSync(gapMdPath, serializeRichGapReportMarkdown(gap), "utf8");
writeFileSync(
  gateMdPath,
  serializeRichGateCChecklistMarkdown(gateC, decisions),
  "utf8",
);

console.log(
  JSON.stringify(
    {
      written: [jsonPath, mdPath, gapMdPath, gateMdPath].map((p) =>
        p.replace(process.cwd() + "/", ""),
      ),
      partnerReviewSession: bundle.partnerReviewSession.status,
      humanDecisionCount: bundle.partnerReviewSession.humanDecisionCount,
      inventedOutcomes: bundle.partnerReviewSession.inventedOutcomes,
      gapRows: bundle.gapAnalysis.gapRowCount,
      gateCActionable: bundle.gateCQueue.actionableCount,
      gateCDecided: bundle.gateCQueue.decidedCount,
      notCds: bundle.notCds,
      autoApproveIntoKg: bundle.autoApproveIntoKg,
      mayFlipHsiGrade: bundle.mayFlipHsiGrade,
      outDir: outDir.replace(process.cwd() + "/", ""),
      parent: dirname(outDir),
    },
    null,
    2,
  ),
);
