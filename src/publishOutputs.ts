/**
 * Versioned publishable artifact bundle for Aksh / ISI consumers.
 *
 * Writes regenerable `dist/outputs/<bundleId>/` (gitignored via dist/).
 * Also refreshes legacy `exports/*.json` for local CLI / test convenience.
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { buildAkshHitlStubBundle } from "./akshHitl";
import { buildIsiExportBundle, serializeIsiExport } from "./exportIsi";
import {
  buildGateCChecklist,
  serializeGateCChecklist,
  serializeGateCChecklistMarkdown,
} from "./gateCChecklist";
import { buildSchemaGapReport, serializeGapReport } from "./gapReport";
import {
  AKSH_CLINIC_CONCEPTS,
  PROVISIONAL_AKSH_TO_DURABLE,
} from "./mappings/akshClinicIds";
import {
  AKSH_NODE_SUGGESTIONS,
  akshNodeIdMap,
  summarizeAkshNodeMappings,
} from "./mappings/akshNodeSuggestions";
import {
  ISI_REL_SUGGESTIONS,
  summarizeIsiRelMappings,
} from "./mappings/isiRelSuggestions";
import {
  buildPilotEvidencePack,
  serializePilotEvidencePack,
  serializePilotEvidencePackMarkdown,
} from "./pilotEvidencePack";
import {
  buildPilotReviewRubric,
  serializePilotReviewRubric,
  serializePilotReviewRubricMarkdown,
} from "./pilotReviewRubric";
import { getPartnerLock, partnerLockExportPointer } from "./partnerLock";
import { validateHsiEdge } from "./validate";

function packageVersion(cwd: string): string {
  try {
    const raw = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8")) as {
      version?: string;
    };
    return raw.version?.trim() || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

export const OUTPUTS_MANIFEST_SCHEMA = "hsi-outputs-manifest-1" as const;

export type PublishOutputsOptions = {
  /** Repo root (default cwd). */
  cwd?: string;
  /** Override ISO timestamp used in bundle id + payloads. */
  generatedAt?: string;
  /** Also write legacy exports/*.json (default true). */
  syncExports?: boolean;
  /** Package version override (default package.json version). */
  version?: string;
};

export type PublishOutputsResult = {
  bundleId: string;
  version: string;
  generatedAt: string;
  outDir: string;
  files: string[];
  manifestPath: string;
  latestPointerPath: string;
  exportsSynced: string[];
};

function stamp(iso: string): string {
  // 2026-11-01T10:48:18.248Z → 20261101T104818248Z
  return iso.replace(/[-:.]/g, "");
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeText(path: string, text: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text.endsWith("\n") ? text : `${text}\n`, "utf8");
}

/** Short markdown summary of the schema gap report. */
export function serializeGapReportMarkdown(
  report: ReturnType<typeof buildSchemaGapReport>,
): string {
  const s = report.summary;
  const lines = [
    "# HSI schema gap report",
    "",
    `Schema: \`${report.schemaVersion}\` · generated ${report.generatedAt}`,
    "",
    "## Summary",
    "",
    `- Seed edges: ${s.seedEdges}`,
    `- Bridge candidates: ${s.bridgeCandidates}`,
    `- Claims mapped to ISI REL: ${s.claimsMappedToIsi}`,
    `- Claims mapped to Aksh node: ${s.claimsMappedToAksh}`,
    `- Claims with durable locator: ${s.claimsWithDurableLocator}`,
    `- Gap rows: ${report.gaps.length}`,
    `- Grades: established=${s.gradeCounts.established}, uncertain=${s.gradeCounts.uncertain}, unexplored=${s.gradeCounts.unexplored}`,
    `- LOINC linked claims: ${s.loinc.claimsWithLoincMarker}`,
    "",
    "## ISI REL mapping",
    "",
    `- Suggestions: ${report.isiRelMapping.suggestions}`,
    `- With REL id: ${report.isiRelMapping.withRelId}`,
    `- Unmapped: ${report.isiRelMapping.unmapped}`,
    `- Curated (HSI-side): ${report.isiRelMapping.curated}`,
    `- autoApproveIntoKg: ${report.isiRelMapping.autoApproveIntoKg}`,
    "",
    "## Aksh node mapping",
    "",
    `- T2D mapped: ${report.akshNodeMapping.t2dSeedsMapped}/${report.akshNodeMapping.t2dSeedsTotal}`,
    `- autoApplyToEhr: ${report.akshNodeMapping.autoApplyToEhr}`,
    `- anyCdsSurfacableOnSeedEdges: ${report.akshNodeMapping.anyCdsSurfacableOnSeedEdges}`,
    "",
    "## Bridge shortlist (top)",
    "",
  ];

  for (const b of report.bridgeShortlist.slice(0, 12)) {
    lines.push(
      `- \`${b.edgeId}\` → ${b.suggestedIsiRelationshipId ?? "unmapped"} (${b.matchKind}): ${b.subjectLabel} → ${b.objectLabel}`,
    );
  }

  lines.push("", "## Next actions", "");
  for (const a of report.nextActions) {
    lines.push(`- ${a}`);
  }
  lines.push("");
  return lines.join("\n");
}

function buildIsiRelMapPayload(generatedAt: string) {
  return {
    schemaVersion: "hsi-isi-rel-map-1" as const,
    notCds: true as const,
    autoApproveIntoKg: false as const,
    generatedAt,
    summary: summarizeIsiRelMappings(),
    suggestions: ISI_REL_SUGGESTIONS,
  };
}

function buildAkshMapPayload(generatedAt: string) {
  return {
    schemaVersion: "hsi-aksh-node-map-2" as const,
    idNamespace: "aksh:" as const,
    notCds: true as const,
    autoSurfaceCds: false as const,
    cdsRequiresApprovedEstablished: true as const,
    generatedAt,
    summary: summarizeAkshNodeMappings(),
    claimToAkshNodeId: akshNodeIdMap(),
    provisionalMigration: PROVISIONAL_AKSH_TO_DURABLE,
    clinicConcepts: AKSH_CLINIC_CONCEPTS,
    suggestions: AKSH_NODE_SUGGESTIONS,
  };
}

/**
 * Validate seed edges, then write a versioned outputs bundle under dist/outputs/.
 */
export function publishOutputs(opts?: PublishOutputsOptions): PublishOutputsResult {
  const cwd = resolve(opts?.cwd ?? process.cwd());
  const version = opts?.version ?? packageVersion(cwd);
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const bundleId = `hsi-core-${version}-${stamp(generatedAt)}`;
  const outDir = join(cwd, "dist", "outputs", bundleId);
  const syncExports = opts?.syncExports !== false;

  const isiBundle = buildIsiExportBundle({ generatedAt });
  let failed = 0;
  for (const edge of isiBundle.edges) {
    const result = validateHsiEdge(edge);
    if (!result.ok) {
      failed += 1;
      console.error(`${edge.id}: ${result.issues.map((i) => i.message).join("; ")}`);
    }
  }
  if (failed > 0) {
    throw new Error(`Refusing publish — ${failed} invalid edge(s)`);
  }

  mkdirSync(outDir, { recursive: true });

  const isiRelMap = buildIsiRelMapPayload(generatedAt);
  const akshMap = buildAkshMapPayload(generatedAt);
  const hitlStub = buildAkshHitlStubBundle();
  const gapReport = buildSchemaGapReport({ generatedAt });
  const gateC = buildGateCChecklist({ generatedAt });
  const partnerLock = getPartnerLock();
  const pilotPack = buildPilotEvidencePack({
    generatedAt,
    evidenceSnapshotRef: `dist/outputs/${bundleId}/hsi-isi-export.json`,
    lock: partnerLock,
  });
  const reviewRubric = buildPilotReviewRubric({
    generatedAt,
    lock: partnerLock,
    pack: pilotPack,
  });

  const fileMap: Record<string, string> = {
    "hsi-isi-export.json": serializeIsiExport(isiBundle),
    "hsi-isi-rel-map.json": `${JSON.stringify(isiRelMap, null, 2)}\n`,
    "hsi-aksh-node-map.json": `${JSON.stringify(akshMap, null, 2)}\n`,
    "hsi-aksh-hitl-cards.json": `${JSON.stringify(hitlStub, null, 2)}\n`,
    "hsi-gap-report.json": serializeGapReport(gapReport),
    "hsi-gap-report.md": serializeGapReportMarkdown(gapReport),
    "gate-c-checklist.json": serializeGateCChecklist(gateC),
    "gate-c-checklist.md": serializeGateCChecklistMarkdown(gateC),
    "hsi-pilot-evidence-pack.json": serializePilotEvidencePack(pilotPack),
    "hsi-pilot-evidence-pack.md": serializePilotEvidencePackMarkdown(pilotPack),
    "hsi-pilot-review-rubric.json": serializePilotReviewRubric(reviewRubric),
    "hsi-pilot-review-rubric.md": serializePilotReviewRubricMarkdown(reviewRubric),
    "hsi-partner-lock.json": `${JSON.stringify(partnerLock, null, 2)}\n`,
  };

  const files: string[] = [];
  for (const [name, body] of Object.entries(fileMap)) {
    const path = join(outDir, name);
    writeText(path, body);
    files.push(name);
  }

  const manifest = {
    schemaVersion: OUTPUTS_MANIFEST_SCHEMA,
    bundleId,
    package: "hsi-core",
    version,
    generatedAt,
    notCds: true as const,
    autoApproveIntoKg: false as const,
    autoSurfaceCds: false as const,
    files,
    artifacts: {
      isiExport: "hsi-isi-export.json",
      isiRelMap: "hsi-isi-rel-map.json",
      akshNodeMap: "hsi-aksh-node-map.json",
      akshHitlCards: "hsi-aksh-hitl-cards.json",
      gapReportJson: "hsi-gap-report.json",
      gapReportMd: "hsi-gap-report.md",
      gateCChecklistJson: "gate-c-checklist.json",
      gateCChecklistMd: "gate-c-checklist.md",
      pilotEvidencePackJson: "hsi-pilot-evidence-pack.json",
      pilotEvidencePackMd: "hsi-pilot-evidence-pack.md",
      pilotReviewRubricJson: "hsi-pilot-review-rubric.json",
      pilotReviewRubricMd: "hsi-pilot-review-rubric.md",
      partnerLockJson: "hsi-partner-lock.json",
    },
    counts: {
      isiEdges: isiBundle.edges.length,
      isiRelSuggestions: isiRelMap.summary.suggestions,
      akshMappedClaims: Object.keys(akshMap.claimToAkshNodeId).length,
      hitlCards: hitlStub.cards.length,
      gapRows: gapReport.gaps.length,
      gateCPending: gateC.summary.pendingGateC,
      pilotEvidenceMapRows: pilotPack.summary.evidenceMapRows,
      partnerScopedEvidenceRows: pilotPack.summary.partnerScopedEvidenceRows,
      claimsWithLoinc: pilotPack.summary.claimsWithLoinc,
      illustrativeDiseaseContexts: pilotPack.summary.illustrativeDiseaseContexts,
      reviewRubricReadyForHuman: reviewRubric.summary.readyForHuman,
      reviewRubricBlockedOnPartner: reviewRubric.summary.blockedOnPartner,
    },
    discoveryLoop: isiBundle.discoveryCentre.discoveryLoop.framing,
    partnerLock: partnerLockExportPointer(partnerLock),
    consumerNotes: [
      "ISI: discovery / Ask / Radar only — use hsi-isi-export.json + hsi-isi-rel-map.json.",
      "ISI pilot walkthrough: hsi-pilot-evidence-pack.* + hsi-pilot-review-rubric.* (Phase 2 scope-locked RA/TNF; partnerSigned=false; lockedPilot=false; no patient CDS).",
      "Partner lock honesty: hsi-partner-lock.json — Phase 2 done = scopeLocked; named partner still flips partnerSigned (then lockedPilot).",
      "Discovery Centre vocabulary is metadata only (ASK→MAP→REVIEW… + disease contexts) — not an interactive UI.",
      "Aksh: HITL map pointers only — use hsi-aksh-node-map.json + hsi-aksh-hitl-cards.json; CDS stays closed on seeds.",
      "Gate C: human checklist in gate-c-checklist.*; Neon approve is outside this repo (ISI autumn-snow only — never HSI red-wave).",
      "Regenerate with: bun run outputs",
    ],
  };

  const manifestPath = join(outDir, "MANIFEST.json");
  writeJson(manifestPath, manifest);
  files.push("MANIFEST.json");

  // Pointer for consumers who want a stable path without scanning bundle ids.
  const latestDir = join(cwd, "dist", "outputs", "latest");
  mkdirSync(latestDir, { recursive: true });
  for (const name of files) {
    copyFileSync(join(outDir, name), join(latestDir, name));
  }
  const latestPointerPath = join(cwd, "dist", "outputs", "LATEST.json");
  writeJson(latestPointerPath, {
    schemaVersion: OUTPUTS_MANIFEST_SCHEMA,
    bundleId,
    version,
    generatedAt,
    path: `dist/outputs/${bundleId}`,
    latestDir: "dist/outputs/latest",
  });

  const exportsSynced: string[] = [];
  if (syncExports) {
    const exportsDir = join(cwd, "exports");
    mkdirSync(exportsDir, { recursive: true });
    const legacy = [
      "hsi-isi-export.json",
      "hsi-isi-rel-map.json",
      "hsi-aksh-node-map.json",
      "hsi-gap-report.json",
    ] as const;
    for (const name of legacy) {
      copyFileSync(join(outDir, name), join(exportsDir, name));
      exportsSynced.push(`exports/${name}`);
    }
  }

  return {
    bundleId,
    version,
    generatedAt,
    outDir,
    files,
    manifestPath,
    latestPointerPath,
    exportsSynced,
  };
}
