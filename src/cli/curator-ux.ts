#!/usr/bin/env bun
/**
 * P1.6 / P1.7 — Emit richer curator UX briefing (gap + Gate C).
 *
 * Usage:
 *   bun run curator-ux [outDir]
 *   bun run curator-ux --decisions path/to/decisions.json [outDir]
 *   bun run curator-ux --dry-run --decisions path/to/decisions.json
 *   bun run curator-ux --export-template [path]
 *   bun run curator-ux --write-hypothetical-fixture [path]
 *   bun run curator-ux --write-operator-authorized [path]
 *
 * Default: no human decisions → "awaiting partner review session".
 * Decisions JSON: immunecity autumn-snow array OR P1.7/P2.1 envelope
 * (`isHypothetical` / `notProductionApproved`). autoApprove /
 * hsiGradeFlipped / productionApproved=true are refused.
 * --dry-run validates only (writes nothing).
 * --write-operator-authorized emits P2.1 operator-authorized Gate C
 * decisions (explicit human permission; not invented Apolo signatures).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import {
  buildCuratorUxBundle,
  serializeCuratorUx,
  serializeCuratorUxMarkdown,
  serializeRichGapReportMarkdown,
  serializeRichGateCChecklistMarkdown,
  type CuratorGateCDecision,
} from "../curatorUx";
import {
  buildAwaitingGateCDecisionsTemplate,
  buildHypotheticalGateCDecisionsFixture,
  buildOperatorAuthorizedGateCDecisions,
  dryRunGateCDecisionsImport,
  parseGateCDecisionsImport,
  serializeGateCDecisionsEnvelope,
} from "../gateCDecisionsImport";
import { buildGateCChecklist } from "../gateCChecklist";
import { buildSchemaGapReport } from "../gapReport";

function parseArgs(argv: string[]) {
  let decisionsPath: string | null = null;
  let dryRun = false;
  let exportTemplate: string | null = null;
  let writeHypothetical: string | null = null;
  let writeOperatorAuthorized: string | null = null;
  let exportTemplateSet = false;
  let writeHypotheticalSet = false;
  let writeOperatorAuthorizedSet = false;
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--decisions" || a === "-d") {
      decisionsPath = argv[i + 1] ?? null;
      i += 1;
      continue;
    }
    if (a === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (a === "--export-template") {
      exportTemplateSet = true;
      const next = argv[i + 1];
      if (next && !next.startsWith("-")) {
        exportTemplate = next;
        i += 1;
      } else {
        exportTemplate =
          "examples/gate-c-decisions/awaiting.empty.json";
      }
      continue;
    }
    if (a === "--write-hypothetical-fixture") {
      writeHypotheticalSet = true;
      const next = argv[i + 1];
      if (next && !next.startsWith("-")) {
        writeHypothetical = next;
        i += 1;
      } else {
        writeHypothetical =
          "examples/gate-c-decisions/hypothetical.schema-fixture.json";
      }
      continue;
    }
    if (a === "--write-operator-authorized") {
      writeOperatorAuthorizedSet = true;
      const next = argv[i + 1];
      if (next && !next.startsWith("-")) {
        writeOperatorAuthorized = next;
        i += 1;
      } else {
        writeOperatorAuthorized =
          "examples/gate-c-decisions/operator-authorized.2026-11-02.json";
      }
      continue;
    }
    if (a.startsWith("-")) {
      throw new Error(`Unknown flag: ${a}`);
    }
    positional.push(a);
  }
  return {
    decisionsPath,
    dryRun,
    exportTemplate: exportTemplateSet ? exportTemplate : null,
    writeHypothetical: writeHypotheticalSet ? writeHypothetical : null,
    writeOperatorAuthorized: writeOperatorAuthorizedSet
      ? writeOperatorAuthorized
      : null,
    outDir: resolve(process.cwd(), positional[0] ?? "exports/curator-ux"),
  };
}

const args = parseArgs(process.argv.slice(2));
const generatedAt = new Date().toISOString();

if (args.exportTemplate) {
  const path = resolve(process.cwd(), args.exportTemplate);
  mkdirSync(dirname(path), { recursive: true });
  const envelope = buildAwaitingGateCDecisionsTemplate({ generatedAt });
  writeFileSync(path, serializeGateCDecisionsEnvelope(envelope), "utf8");
  console.log(
    JSON.stringify(
      {
        written: path.replace(process.cwd() + "/", ""),
        kind: envelope.kind,
        decisionCount: 0,
        awaiting: true,
        productionApproved: false,
        notCds: true,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (args.writeHypothetical) {
  const path = resolve(process.cwd(), args.writeHypothetical);
  mkdirSync(dirname(path), { recursive: true });
  const envelope = buildHypotheticalGateCDecisionsFixture({ generatedAt });
  writeFileSync(path, serializeGateCDecisionsEnvelope(envelope), "utf8");
  console.log(
    JSON.stringify(
      {
        written: path.replace(process.cwd() + "/", ""),
        kind: envelope.kind,
        isHypothetical: true,
        notProductionApproved: true,
        productionApproved: false,
        decisionCount: envelope.decisions.length,
        inventedApoloOutcomes: false,
        notCds: true,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (args.writeOperatorAuthorized) {
  const path = resolve(process.cwd(), args.writeOperatorAuthorized);
  mkdirSync(dirname(path), { recursive: true });
  const envelope = buildOperatorAuthorizedGateCDecisions({ generatedAt });
  writeFileSync(path, serializeGateCDecisionsEnvelope(envelope), "utf8");
  console.log(
    JSON.stringify(
      {
        written: path.replace(process.cwd() + "/", ""),
        kind: envelope.kind,
        isHypothetical: false,
        notProductionApproved: true,
        productionApproved: false,
        decisionCount: envelope.decisions.length,
        inventedApoloOutcomes: false,
        operatorAuthorized: true,
        notCds: true,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

let decisions: CuratorGateCDecision[] = [];
let decisionsAreHypothetical = false;
let importKind: string = "none";

if (args.decisionsPath) {
  const raw = JSON.parse(
    readFileSync(resolve(process.cwd(), args.decisionsPath), "utf8"),
  );
  if (args.dryRun) {
    const report = dryRunGateCDecisionsImport(raw, { generatedAt });
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.ok ? 0 : 1);
  }
  const parsed = parseGateCDecisionsImport(raw);
  decisions = parsed.decisions;
  decisionsAreHypothetical = parsed.envelope.isHypothetical;
  importKind = parsed.rawArray ? "raw_array" : parsed.envelope.kind;
} else if (args.dryRun) {
  const report = dryRunGateCDecisionsImport(
    buildAwaitingGateCDecisionsTemplate({ generatedAt }),
    { generatedAt },
  );
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

const gap = buildSchemaGapReport({ generatedAt });
const gateC = buildGateCChecklist({ generatedAt });

const bundle = buildCuratorUxBundle({
  generatedAt,
  gap,
  gateC,
  decisions,
  decisionsAreHypothetical,
});

mkdirSync(args.outDir, { recursive: true });
const jsonPath = join(args.outDir, "hsi-curator-ux.json");
const mdPath = join(args.outDir, "hsi-curator-ux.md");
const gapMdPath = join(args.outDir, "hsi-gap-report.md");
const gateMdPath = join(args.outDir, "gate-c-checklist.md");

writeFileSync(jsonPath, serializeCuratorUx(bundle), "utf8");
writeFileSync(mdPath, serializeCuratorUxMarkdown(bundle), "utf8");
writeFileSync(gapMdPath, serializeRichGapReportMarkdown(gap), "utf8");
writeFileSync(
  gateMdPath,
  serializeRichGateCChecklistMarkdown(gateC, decisions, {
    decisionsAreHypothetical,
  }),
  "utf8",
);

console.log(
  JSON.stringify(
    {
      written: [jsonPath, mdPath, gapMdPath, gateMdPath].map((p) =>
        p.replace(process.cwd() + "/", ""),
      ),
      importKind,
      partnerReviewSession: bundle.partnerReviewSession.status,
      humanDecisionCount: bundle.partnerReviewSession.humanDecisionCount,
      isHypothetical: bundle.partnerReviewSession.isHypothetical,
      notProductionApproved: bundle.partnerReviewSession.notProductionApproved,
      productionApproved: bundle.partnerReviewSession.productionApproved,
      inventedOutcomes: bundle.partnerReviewSession.inventedOutcomes,
      gapRows: bundle.gapAnalysis.gapRowCount,
      gateCActionable: bundle.gateCQueue.actionableCount,
      gateCDecided: bundle.gateCQueue.decidedCount,
      notCds: bundle.notCds,
      autoApproveIntoKg: bundle.autoApproveIntoKg,
      mayFlipHsiGrade: bundle.mayFlipHsiGrade,
      outDir: args.outDir.replace(process.cwd() + "/", ""),
      parent: dirname(args.outDir),
    },
    null,
    2,
  ),
);
