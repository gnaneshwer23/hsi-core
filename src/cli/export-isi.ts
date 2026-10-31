#!/usr/bin/env bun
/**
 * Write ISI-compatible HSI export JSON (discovery / not-CDS).
 * Usage: bun run export:isi [outPath]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { buildIsiExportBundle, serializeIsiExport } from "../exportIsi";
import { validateHsiEdge } from "../validate";

const outArg = process.argv[2] ?? "exports/hsi-isi-export.json";
const outPath = resolve(process.cwd(), outArg);
const bundle = buildIsiExportBundle();

let failed = 0;
for (const edge of bundle.edges) {
  const result = validateHsiEdge(edge);
  if (!result.ok) {
    failed += 1;
    console.error(`${edge.id}: ${result.issues.map((i) => i.message).join("; ")}`);
  }
}

if (failed > 0) {
  console.error(`Refusing export — ${failed} invalid edge(s)`);
  process.exit(1);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, serializeIsiExport(bundle), "utf8");
console.log(
  JSON.stringify(
    {
      written: outPath,
      edges: bundle.edges.length,
      gradeCounts: bundle.gradeCounts,
      loincCoverage: bundle.loincCoverage,
      notCds: bundle.notCds,
    },
    null,
    2,
  ),
);
