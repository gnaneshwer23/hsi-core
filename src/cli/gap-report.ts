#!/usr/bin/env bun
/**
 * Emit schema mapping gap report (backlog b2).
 * Usage: bun run gap-report [outPath]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { buildSchemaGapReport, serializeGapReport } from "../gapReport";

const outArg = process.argv[2] ?? "exports/hsi-gap-report.json";
const outPath = resolve(process.cwd(), outArg);
const report = buildSchemaGapReport();

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, serializeGapReport(report), "utf8");

console.log(
  JSON.stringify(
    {
      written: outPath,
      seedEdges: report.summary.seedEdges,
      bridgeCandidates: report.summary.bridgeCandidates,
      claimsMappedToIsi: report.summary.claimsMappedToIsi,
      claimsMappedToAksh: report.summary.claimsMappedToAksh,
      gapRows: report.gaps.length,
      gradeCounts: report.summary.gradeCounts,
      loinc: report.summary.loinc,
    },
    null,
    2,
  ),
);
