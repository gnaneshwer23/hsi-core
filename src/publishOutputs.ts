/**
 * Versioned publishable artifact bundle for Aksh / ISI consumers.
 *
 * Writes regenerable `dist/outputs/<bundleId>/` (gitignored via dist/).
 * Also refreshes legacy `exports/*.json` for local CLI / test convenience.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { buildAkshHitlStubBundle } from "./akshHitl";
import { buildIsiExportBundle, serializeIsiExport } from "./exportIsi";
import {
  buildGateCChecklist,
  serializeGateCChecklist,
} from "./gateCChecklist";
import { buildSchemaGapReport, serializeGapReport } from "./gapReport";
import {
  buildCuratorUxBundle,
  serializeCuratorUx,
  serializeCuratorUxMarkdown,
  serializeRichGapReportMarkdown,
  serializeRichGateCChecklistMarkdown,
} from "./curatorUx";
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
import {
  buildPilotAcceptancePack,
  serializePilotAcceptance,
  serializePilotAcceptanceMarkdown,
  serializePilotWalkthroughMarkdown,
} from "./pilotAcceptance";
import { getPartnerLock, partnerLockExportPointer } from "./partnerLock";
import {
  buildR2ValidationBundle,
  serializeR2Validation,
  serializeR2ValidationMarkdown,
} from "./r2Validation";
import {
  buildTranslationHandoffPack,
  serializeTranslationHandoff,
  serializeTranslationHandoffMarkdown,
} from "./translationHandoff";
import {
  buildSystemsVisionBundle,
  serializeSystemsVision,
} from "./systemsAxes";
import {
  buildEmbeddingSidecarsBundle,
  serializeEmbeddingSidecars,
} from "./embeddingSidecar";
import {
  buildModelEvalHarnessBundle,
  serializeModelEvalHarness,
  serializeModelEvalHarnessMarkdown,
} from "./modelEvalHarness";
import {
  buildExternalGenomePointersBundle,
  serializeExternalGenomePointers,
} from "./externalGenomePointers";
import {
  buildP3AdapterLicenseMatrixBundle,
  serializeP3AdapterLicenseMatrix,
  serializeP3AdapterLicenseMatrixMarkdown,
} from "./p3AdapterLicenseMatrix";
import {
  runRdkitAdapter,
  serializeRdkitAdapterBundle,
  serializeRdkitAdapterMarkdown,
} from "./adapters/rdkitAdapter";
import {
  runOpenmmAdapter,
  serializeOpenmmAdapterBundle,
  serializeOpenmmAdapterMarkdown,
} from "./adapters/openmmAdapter";
import {
  runReinvent4Adapter,
  serializeReinvent4AdapterBundle,
  serializeReinvent4AdapterMarkdown,
} from "./adapters/reinvent4Adapter";
import {
  runEsmAdapter,
  serializeEsmAdapterBundle,
  serializeEsmAdapterMarkdown,
} from "./adapters/esmAdapter";
import {
  runAf3Adapter,
  serializeAf3AdapterBundle,
  serializeAf3AdapterMarkdown,
} from "./adapters/af3Adapter";
import {
  runTdcAdapter,
  serializeTdcAdapterBundle,
  serializeTdcAdapterMarkdown,
} from "./adapters/tdcAdapter";
import {
  runBoltzAdapter,
  serializeBoltzAdapterBundle,
  serializeBoltzAdapterMarkdown,
} from "./adapters/boltzAdapter";
import {
  runIsiAgentsAdapter,
  serializeIsiAgentsAdapterBundle,
  serializeIsiAgentsAdapterMarkdown,
} from "./adapters/isiAgentsAdapter";
import {
  buildIsiConsumeContractBundle,
  serializeIsiConsumeContract,
  serializeIsiConsumeContractMarkdown,
} from "./isiConsumeContract";
import {
  buildPartnerFlipReadinessBundle,
  serializePartnerFlipReadiness,
  serializePartnerFlipReadinessMarkdown,
} from "./partnerFlipReadiness";
import {
  buildSourceLicensingStubBundle,
  serializeSourceLicensingStub,
  serializeSourceLicensingStubMarkdown,
} from "./sourceLicensingStub";
import {
  getVerticalDecision,
  verticalDecisionExportPointer,
} from "./verticalDecision";
import {
  buildSscPathwayPack,
  serializeSscPathwayPack,
  serializeSscPathwayPackMarkdown,
} from "./sscPathwayPack";
import {
  buildGutImmunePack,
  serializeGutImmunePack,
  serializeGutImmunePackMarkdown,
} from "./gutImmunePack";
import {
  buildNeuroImmunePack,
  serializeNeuroImmunePack,
  serializeNeuroImmunePackMarkdown,
} from "./neuroImmunePack";
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
  /** Static JSON copies for site `/discovery` (Phase 6). */
  discoverySynced: string[];
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

/** Richer curator gap markdown (P1.6) — buckets + backlog table. */
export function serializeGapReportMarkdown(
  report: ReturnType<typeof buildSchemaGapReport>,
): string {
  return serializeRichGapReportMarkdown(report);
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
  const acceptance = buildPilotAcceptancePack({
    generatedAt,
    lock: partnerLock,
    pack: pilotPack,
    rubric: reviewRubric,
    gateC,
    gap: gapReport,
  });
  const r2Validation = buildR2ValidationBundle({
    generatedAt,
    lock: partnerLock,
    pack: pilotPack,
    gap: gapReport,
  });
  const translationHandoff = buildTranslationHandoffPack({
    generatedAt,
    lock: partnerLock,
  });
  const systemsVision = buildSystemsVisionBundle({ generatedAt });
  const verticalDecision = getVerticalDecision();
  const sscPathwayPack = buildSscPathwayPack({ generatedAt });
  const gutImmunePack = buildGutImmunePack({ generatedAt });
  const neuroImmunePack = buildNeuroImmunePack({ generatedAt });
  const modelEvalHarness = buildModelEvalHarnessBundle({ generatedAt });
  const externalGenomePointers = buildExternalGenomePointersBundle({
    generatedAt,
  });
  const p3AdapterLicenseMatrix = buildP3AdapterLicenseMatrixBundle({
    generatedAt,
  });
  // Deterministic stub for publish/CI; live RDKit/OpenMM/REINVENT4/ESM optional via CLI --live.
  const rdkitAdapter = runRdkitAdapter({
    generatedAt,
    forceStub: true,
  });
  const openmmAdapter = runOpenmmAdapter({
    generatedAt,
    forceStub: true,
  });
  const reinvent4Adapter = runReinvent4Adapter({
    generatedAt,
    forceStub: true,
  });
  const esmAdapter = runEsmAdapter({
    generatedAt,
    forceStub: true,
  });
  const af3Adapter = runAf3Adapter({ generatedAt });
  const tdcAdapter = runTdcAdapter({ generatedAt });
  // Boltz publish uses WEIGHTS_POLICY_ACK=true for deterministic CI (policy documented).
  const boltzAdapter = runBoltzAdapter({
    generatedAt,
    env: { ...process.env, WEIGHTS_POLICY_ACK: "true" },
  });
  const isiAgentsAdapter = runIsiAgentsAdapter({ generatedAt });
  // P2.2 demo sidecars + P3.3 FAIR ESM-2 hash/ref overlays (ESM wins on colliding edgeIds).
  const embeddingSidecars = buildEmbeddingSidecarsBundle({
    generatedAt,
    overlayByEdgeId: esmAdapter.sidecarsByEdgeId,
  });
  // P0.2-HSI: ISI consume contract + partner flip-readiness + P0.3 licensing stub.
  const isiConsumeContract = buildIsiConsumeContractBundle({ generatedAt });
  const partnerFlipReadiness = buildPartnerFlipReadinessBundle({
    generatedAt,
    lock: partnerLock,
  });
  const sourceLicensingStub = buildSourceLicensingStubBundle({ generatedAt });
  // P1.6 curator UX — richer gap/Gate C markdown; no invented human decisions.
  const curatorUx = buildCuratorUxBundle({
    generatedAt,
    gap: gapReport,
    gateC,
    decisions: [],
  });

  const fileMap: Record<string, string> = {
    "hsi-isi-export.json": serializeIsiExport(isiBundle),
    "hsi-isi-rel-map.json": `${JSON.stringify(isiRelMap, null, 2)}\n`,
    "hsi-aksh-node-map.json": `${JSON.stringify(akshMap, null, 2)}\n`,
    "hsi-aksh-hitl-cards.json": `${JSON.stringify(hitlStub, null, 2)}\n`,
    "hsi-gap-report.json": serializeGapReport(gapReport),
    "hsi-gap-report.md": serializeGapReportMarkdown(gapReport),
    "gate-c-checklist.json": serializeGateCChecklist(gateC),
    "gate-c-checklist.md": serializeRichGateCChecklistMarkdown(gateC, []),
    "hsi-curator-ux.json": serializeCuratorUx(curatorUx),
    "hsi-curator-ux.md": serializeCuratorUxMarkdown(curatorUx),
    "hsi-pilot-evidence-pack.json": serializePilotEvidencePack(pilotPack),
    "hsi-pilot-evidence-pack.md": serializePilotEvidencePackMarkdown(pilotPack),
    "hsi-pilot-review-rubric.json": serializePilotReviewRubric(reviewRubric),
    "hsi-pilot-review-rubric.md": serializePilotReviewRubricMarkdown(reviewRubric),
    "hsi-pilot-acceptance.json": serializePilotAcceptance(acceptance),
    "hsi-pilot-acceptance.md": serializePilotAcceptanceMarkdown(acceptance),
    "hsi-pilot-walkthrough.md": serializePilotWalkthroughMarkdown(acceptance),
    "hsi-partner-lock.json": `${JSON.stringify(partnerLock, null, 2)}\n`,
    "hsi-vertical-decision.json": `${JSON.stringify(verticalDecision, null, 2)}\n`,
    "hsi-ssc-pathway-pack.json": serializeSscPathwayPack(sscPathwayPack),
    "hsi-ssc-pathway-pack.md": serializeSscPathwayPackMarkdown(sscPathwayPack),
    "hsi-gut-immune-pack.json": serializeGutImmunePack(gutImmunePack),
    "hsi-gut-immune-pack.md": serializeGutImmunePackMarkdown(gutImmunePack),
    "hsi-neuroimmune-pack.json": serializeNeuroImmunePack(neuroImmunePack),
    "hsi-neuroimmune-pack.md": serializeNeuroImmunePackMarkdown(neuroImmunePack),
    "hsi-r2-validation.json": serializeR2Validation(r2Validation),
    "hsi-r2-validation.md": serializeR2ValidationMarkdown(r2Validation),
    "hsi-translation-handoff.json": serializeTranslationHandoff(translationHandoff),
    "hsi-translation-handoff.md": serializeTranslationHandoffMarkdown(translationHandoff),
    "hsi-systems-vision.json": serializeSystemsVision(systemsVision),
    "hsi-embedding-sidecars.json": serializeEmbeddingSidecars(embeddingSidecars),
    "hsi-model-eval-harness.json": serializeModelEvalHarness(modelEvalHarness),
    "hsi-model-eval-harness.md": serializeModelEvalHarnessMarkdown(
      modelEvalHarness,
    ),
    "hsi-external-genome-pointers.json": serializeExternalGenomePointers(
      externalGenomePointers,
    ),
    "hsi-p3-adapter-license-matrix.json": serializeP3AdapterLicenseMatrix(
      p3AdapterLicenseMatrix,
    ),
    "hsi-p3-adapter-license-matrix.md": serializeP3AdapterLicenseMatrixMarkdown(
      p3AdapterLicenseMatrix,
    ),
    "hsi-rdkit-adapter-proposals.json": serializeRdkitAdapterBundle(rdkitAdapter),
    "hsi-rdkit-adapter-proposals.md": serializeRdkitAdapterMarkdown(rdkitAdapter),
    "hsi-openmm-adapter-proposals.json": serializeOpenmmAdapterBundle(
      openmmAdapter,
    ),
    "hsi-openmm-adapter-proposals.md": serializeOpenmmAdapterMarkdown(
      openmmAdapter,
    ),
    "hsi-reinvent4-adapter-proposals.json": serializeReinvent4AdapterBundle(
      reinvent4Adapter,
    ),
    "hsi-reinvent4-adapter-proposals.md": serializeReinvent4AdapterMarkdown(
      reinvent4Adapter,
    ),
    "hsi-esm-adapter-proposals.json": serializeEsmAdapterBundle(esmAdapter),
    "hsi-esm-adapter-proposals.md": serializeEsmAdapterMarkdown(esmAdapter),
    "hsi-af3-adapter-proposals.json": serializeAf3AdapterBundle(af3Adapter),
    "hsi-af3-adapter-proposals.md": serializeAf3AdapterMarkdown(af3Adapter),
    "hsi-tdc-adapter-proposals.json": serializeTdcAdapterBundle(tdcAdapter),
    "hsi-tdc-adapter-proposals.md": serializeTdcAdapterMarkdown(tdcAdapter),
    "hsi-boltz-adapter-proposals.json": serializeBoltzAdapterBundle(
      boltzAdapter,
    ),
    "hsi-boltz-adapter-proposals.md": serializeBoltzAdapterMarkdown(
      boltzAdapter,
    ),
    "hsi-isi-agents-adapter-proposals.json": serializeIsiAgentsAdapterBundle(
      isiAgentsAdapter,
    ),
    "hsi-isi-agents-adapter-proposals.md": serializeIsiAgentsAdapterMarkdown(
      isiAgentsAdapter,
    ),
    "hsi-isi-consume-contract.json": serializeIsiConsumeContract(
      isiConsumeContract,
    ),
    "hsi-isi-consume-contract.md": serializeIsiConsumeContractMarkdown(
      isiConsumeContract,
    ),
    "hsi-partner-flip-readiness.json": serializePartnerFlipReadiness(
      partnerFlipReadiness,
    ),
    "hsi-partner-flip-readiness.md": serializePartnerFlipReadinessMarkdown(
      partnerFlipReadiness,
    ),
    "hsi-source-licensing-stub.json": serializeSourceLicensingStub(
      sourceLicensingStub,
    ),
    "hsi-source-licensing-stub.md": serializeSourceLicensingStubMarkdown(
      sourceLicensingStub,
    ),
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
      curatorUxJson: "hsi-curator-ux.json",
      curatorUxMd: "hsi-curator-ux.md",
      pilotEvidencePackJson: "hsi-pilot-evidence-pack.json",
      pilotEvidencePackMd: "hsi-pilot-evidence-pack.md",
      pilotReviewRubricJson: "hsi-pilot-review-rubric.json",
      pilotReviewRubricMd: "hsi-pilot-review-rubric.md",
      pilotAcceptanceJson: "hsi-pilot-acceptance.json",
      pilotAcceptanceMd: "hsi-pilot-acceptance.md",
      pilotWalkthroughMd: "hsi-pilot-walkthrough.md",
      partnerLockJson: "hsi-partner-lock.json",
      verticalDecisionJson: "hsi-vertical-decision.json",
      sscPathwayPackJson: "hsi-ssc-pathway-pack.json",
      sscPathwayPackMd: "hsi-ssc-pathway-pack.md",
      gutImmunePackJson: "hsi-gut-immune-pack.json",
      gutImmunePackMd: "hsi-gut-immune-pack.md",
      neuroImmunePackJson: "hsi-neuroimmune-pack.json",
      neuroImmunePackMd: "hsi-neuroimmune-pack.md",
      r2ValidationJson: "hsi-r2-validation.json",
      r2ValidationMd: "hsi-r2-validation.md",
      translationHandoffJson: "hsi-translation-handoff.json",
      translationHandoffMd: "hsi-translation-handoff.md",
      systemsVisionJson: "hsi-systems-vision.json",
      embeddingSidecarsJson: "hsi-embedding-sidecars.json",
      modelEvalHarnessJson: "hsi-model-eval-harness.json",
      modelEvalHarnessMd: "hsi-model-eval-harness.md",
      externalGenomePointersJson: "hsi-external-genome-pointers.json",
      p3AdapterLicenseMatrixJson: "hsi-p3-adapter-license-matrix.json",
      p3AdapterLicenseMatrixMd: "hsi-p3-adapter-license-matrix.md",
      rdkitAdapterProposalsJson: "hsi-rdkit-adapter-proposals.json",
      rdkitAdapterProposalsMd: "hsi-rdkit-adapter-proposals.md",
      openmmAdapterProposalsJson: "hsi-openmm-adapter-proposals.json",
      openmmAdapterProposalsMd: "hsi-openmm-adapter-proposals.md",
      reinvent4AdapterProposalsJson: "hsi-reinvent4-adapter-proposals.json",
      reinvent4AdapterProposalsMd: "hsi-reinvent4-adapter-proposals.md",
      esmAdapterProposalsJson: "hsi-esm-adapter-proposals.json",
      esmAdapterProposalsMd: "hsi-esm-adapter-proposals.md",
      af3AdapterProposalsJson: "hsi-af3-adapter-proposals.json",
      af3AdapterProposalsMd: "hsi-af3-adapter-proposals.md",
      tdcAdapterProposalsJson: "hsi-tdc-adapter-proposals.json",
      tdcAdapterProposalsMd: "hsi-tdc-adapter-proposals.md",
      boltzAdapterProposalsJson: "hsi-boltz-adapter-proposals.json",
      boltzAdapterProposalsMd: "hsi-boltz-adapter-proposals.md",
      isiAgentsAdapterProposalsJson: "hsi-isi-agents-adapter-proposals.json",
      isiAgentsAdapterProposalsMd: "hsi-isi-agents-adapter-proposals.md",
      isiConsumeContractJson: "hsi-isi-consume-contract.json",
      isiConsumeContractMd: "hsi-isi-consume-contract.md",
      partnerFlipReadinessJson: "hsi-partner-flip-readiness.json",
      partnerFlipReadinessMd: "hsi-partner-flip-readiness.md",
      sourceLicensingStubJson: "hsi-source-licensing-stub.json",
      sourceLicensingStubMd: "hsi-source-licensing-stub.md",
    },
    counts: {
      isiEdges: isiBundle.edges.length,
      isiRelSuggestions: isiRelMap.summary.suggestions,
      akshMappedClaims: Object.keys(akshMap.claimToAkshNodeId).length,
      hitlCards: hitlStub.cards.length,
      gapRows: gapReport.gaps.length,
      curatorGapBuckets: curatorUx.gapAnalysis.buckets.length,
      curatorGateCActionable: curatorUx.gateCQueue.actionableCount,
      curatorGateCDecided: curatorUx.gateCQueue.decidedCount,
      curatorAwaitingPartnerReview:
        curatorUx.partnerReviewSession.status ===
        "awaiting_partner_review_session",
      gateCPending: gateC.summary.pendingGateC,
      gateCTranslationCandidates: gateC.summary.translationCandidates,
      gateCModelProposals: gateC.summary.modelProposals,
      gateCModelProposalsPending: gateC.summary.modelProposalsPending,
      pilotEvidenceMapRows: pilotPack.summary.evidenceMapRows,
      partnerScopedEvidenceRows: pilotPack.summary.partnerScopedEvidenceRows,
      claimsWithLoinc: pilotPack.summary.claimsWithLoinc,
      illustrativeDiseaseContexts: pilotPack.summary.illustrativeDiseaseContexts,
      reviewRubricReadyForHuman: reviewRubric.summary.readyForHuman,
      reviewRubricBlockedOnPartner: reviewRubric.summary.blockedOnPartner,
      reviewRubricSetForTest: reviewRubric.summary.setForTest,
      reviewRubricThresholdStatus: reviewRubric.summary.thresholdStatus,
      acceptancePass: acceptance.summary.pass,
      acceptanceFail: acceptance.summary.fail,
      acceptancePending: acceptance.summary.pending,
      acceptanceSetForTest: acceptance.summary.setForTest,
      stage1FourOutputsGreen: acceptance.summary.stage1FourOutputsGreen,
      partnerReadyWalkthrough: acceptance.summary.partnerReadyWalkthrough,
      r2HypothesisCards: r2Validation.summary.hypothesisCards,
      r2RankedGaps: r2Validation.summary.rankedGaps,
      r2LiteratureTests: r2Validation.summary.literatureTests,
      translationCandidates: translationHandoff.summary.candidates,
      translationWithLoinc: translationHandoff.summary.withLoinc,
      translationCdsSurfacable: translationHandoff.summary.cdsSurfacableCount,
      systemsVisionDomains: systemsVision.domains.length,
      systemsVisionGutEntities: systemsVision.gutMicrobiome.entities.length,
      systemsVisionNeuroEntities: systemsVision.neuroimmune.entities.length,
      systemsVisionCrossPredicates:
        systemsVision.crossAxisPredicates.predicates.length,
      systemsVisionAdapters: systemsVision.futureTechAdapters.length,
      sscPathwayEdges: sscPathwayPack.edges.length,
      sscDeepSeedsPresent: sscPathwayPack.deepSeedsPresent,
      sscCellCards: sscPathwayPack.cellCards.length,
      gutImmuneEdges: gutImmunePack.edges.length,
      gutDeepSeedsPresent: gutImmunePack.deepSeedsPresent,
      systemsVisionGutDeepSeedsPresent:
        systemsVision.gutMicrobiome.deepSeedsPresent,
      neuroImmuneEdges: neuroImmunePack.edges.length,
      neuroDeepSeedsPresent: neuroImmunePack.deepSeedsPresent,
      systemsVisionNeuroDeepSeedsPresent:
        systemsVision.neuroimmune.deepSeedsPresent,
      embeddingSidecarEdges: embeddingSidecars.summary.edgeCount,
      embeddingSidecarsWithHash: embeddingSidecars.summary.withContentHash,
      embeddingSidecarsWithRef: embeddingSidecars.summary.withVectorRef,
      embeddingSidecarsTinyDemo: embeddingSidecars.summary.withTinyDemo,
      modelEvalCases: modelEvalHarness.summary.caseCount,
      modelEvalPassed: modelEvalHarness.summary.passed,
      modelEvalFailed: modelEvalHarness.summary.failed,
      modelEvalFailClosedHits: modelEvalHarness.summary.failClosedHits,
      modelEvalStubBehaviorGreen: modelEvalHarness.summary.stubBehaviorGreen,
      modelEvalFixtureEdges: modelEvalHarness.fixtureSummary.edgeCount,
      p3AdapterCount: p3AdapterLicenseMatrix.summary.adapterCount,
      p3AdaptersBlockedUntilSignOff:
        p3AdapterLicenseMatrix.summary.blockedUntilSignOffCount,
      p3AdaptersResearchOkDocumented:
        p3AdapterLicenseMatrix.summary.researchOkDocumentedCount,
      rdkitAdapterProposals: rdkitAdapter.proposals.length,
      rdkitAdapterRuntimeStub: rdkitAdapter.runtime === "stub",
      rdkitAdapterMayFlipEvidenceGrade: rdkitAdapter.mayFlipEvidenceGrade,
      rdkitAdapterAutoApprove: rdkitAdapter.autoApprove,
      openmmAdapterProposals: openmmAdapter.proposals.length,
      openmmAdapterRuntimeStub: openmmAdapter.runtime === "stub",
      openmmAdapterMayFlipEvidenceGrade: openmmAdapter.mayFlipEvidenceGrade,
      openmmAdapterAutoApprove: openmmAdapter.autoApprove,
      reinvent4AdapterProposals: reinvent4Adapter.proposals.length,
      reinvent4AdapterRuntimeStub: reinvent4Adapter.runtime === "stub",
      reinvent4AdapterMayFlipEvidenceGrade:
        reinvent4Adapter.mayFlipEvidenceGrade,
      reinvent4AdapterAutoApprove: reinvent4Adapter.autoApprove,
      esmAdapterProposals: esmAdapter.proposals.length,
      esmAdapterRuntimeStub: esmAdapter.runtime === "stub",
      esmAdapterMayFlipEvidenceGrade: esmAdapter.mayFlipEvidenceGrade,
      esmAdapterAutoApprove: esmAdapter.autoApprove,
      esmAdapterSidecarEdges: Object.keys(esmAdapter.sidecarsByEdgeId).length,
      af3AdapterProposals: af3Adapter.proposals.length,
      af3AdapterNotCommercial: af3Adapter.notCommercial,
      af3AdapterCommercialRightsClaimed: af3Adapter.commercialAf3RightsClaimed,
      tdcAdapterProposals: tdcAdapter.proposals.length,
      boltzAdapterProposals: boltzAdapter.proposals.length,
      boltzAdapterWeightsPolicyAck: boltzAdapter.weightsPolicyAck,
      boltzAdapterVendorsModelWeights: boltzAdapter.vendorsModelWeights,
      isiAgentsAdapterProposals: isiAgentsAdapter.proposals.length,
      p3AdaptersSignedResearchTestOnly:
        p3AdapterLicenseMatrix.summary.signedResearchTestOnlyCount,
      researchSignOffFixtureActive:
        p3AdapterLicenseMatrix.summary.researchSignOffFixtureActive,
      isiConsumeArtifacts: isiConsumeContract.summary.artifactCount,
      isiConsumeRequiredCore: isiConsumeContract.summary.requiredCoreCount,
      isiConsumeRequiredPilot: isiConsumeContract.summary.requiredPilotCount,
      partnerFlipPass: partnerFlipReadiness.summary.pass,
      partnerFlipFail: partnerFlipReadiness.summary.fail,
      partnerFlipPending: partnerFlipReadiness.summary.pending,
      partnerFlipReadyToFlip:
        partnerFlipReadiness.summary.readyToFlipPartnerSigned,
      sourceLicensingPmidCount: sourceLicensingStub.summary.pmidCount,
      sourceLicensingNeedsReview: sourceLicensingStub.summary.needsReviewCount,
    },
    discoveryLoop: isiBundle.discoveryCentre.discoveryLoop.framing,
    partnerLock: partnerLockExportPointer(partnerLock),
    verticalDecision: verticalDecisionExportPointer(verticalDecision),
    acceptance: {
      schemaVersion: acceptance.schemaVersion,
      phase: acceptance.phase,
      overallStage1Acceptance: acceptance.summary.overallStage1Acceptance,
      stage1FourOutputsGreen: acceptance.summary.stage1FourOutputsGreen,
      partnerReadyWalkthrough: acceptance.summary.partnerReadyWalkthrough,
      partnerSigned: acceptance.scope.partnerSigned,
    },
    r2Validation: {
      schemaVersion: r2Validation.schemaVersion,
      phase: r2Validation.phase,
      targetRelease: r2Validation.targetRelease,
      hypothesisCards: r2Validation.summary.hypothesisCards,
      rankedGaps: r2Validation.summary.rankedGaps,
      byStatus: r2Validation.summary.byStatus,
    },
    translationHandoff: {
      schemaVersion: translationHandoff.schemaVersion,
      phase: translationHandoff.phase,
      targetReleases: translationHandoff.targetReleases,
      clinicalActive: translationHandoff.clinicalActive,
      clinicalUse: translationHandoff.clinicalUse,
      akenoProductIntegration: translationHandoff.akenoProductIntegration,
      candidates: translationHandoff.summary.candidates,
      cdsSurfacableCount: translationHandoff.summary.cdsSurfacableCount,
    },
    systemsVision: {
      schemaVersion: systemsVision.schemaVersion,
      notCds: systemsVision.notCds,
      domains: systemsVision.domains.length,
      bindingIntent: systemsVision.bindingIntent,
      verticalStrategy: systemsVision.verticalStrategy,
      activeScope: systemsVision.activeScope,
      prdMvpTarget: systemsVision.prdMvpTarget,
      stage1: systemsVision.stageGates.stage1,
      stage2: systemsVision.stageGates.stage2,
      stage3: systemsVision.stageGates.stage3,
    },
    consumerNotes: [
      "ISI: discovery / Ask / Radar only — use hsi-isi-export.json + hsi-isi-rel-map.json.",
      "ISI pilot walkthrough: hsi-pilot-walkthrough.md + hsi-pilot-evidence-pack.* + hsi-pilot-review-rubric.* + hsi-pilot-acceptance.* (Phase 5 acceptance on scope-locked RA/TNF; named partner Apolo Pharma may set lockedPilot=true; still no patient CDS).",
      "Partner lock honesty: hsi-partner-lock.json — Phase 2 = scopeLocked; named Apolo Pharma (partner:apolo-pharma) with legalBinding → lockedPilot; MoU operator-asserted; still not CDS. Swap via src/hypotheticalPartnerFixture.ts.",
      "Vertical decision A (dual_track): hsi-vertical-decision.json + lock/systems-vision fields — activeScope=ra-tnf; prdMvpTarget=ssc-tfh-b-il21; RA packs untouched.",
      "SSc PRD MVP pack: hsi-ssc-pathway-pack.* — thin Tfh–B–IL-21 literature slice; EBV hypothesized only; does not replace ASK.",
      "Gut–immune systems secondary pack: hsi-gut-immune-pack.* — SCFA/butyrate ↔ mucosal Treg/Th17 (P1.3); uncertain grades; does not replace RA ASK.",
      "Neuroimmune systems secondary pack: hsi-neuroimmune-pack.* — vagus / cholinergic anti-inflammatory reflex (P2.1); human VNS–RA hypothesized only; does not replace RA ASK.",
      "Phase 6–8: Discovery Centre at site `/discovery` loads site/public/discovery/*.json (ASK→MAP→REVIEW→VALIDATE→TRANSLATE; notCds; clinicalActive=false).",
      "Phase 7: R2 validation — hsi-r2-validation.* (hypothesis cards, ranked gaps, literature tests; research only).",
      "Phase 8 done (HSI substrate): hsi-translation-handoff.* — Stage 3 scaffolding; deferred_until_hitl; Akeno in-repo HITL consumer at /akeno (not live CDS; no Akeno Neon).",
      "Aksh: HITL map pointers only — use hsi-aksh-node-map.json + hsi-aksh-hitl-cards.json; CDS stays closed on seeds.",
      "Gate C: human checklist in gate-c-checklist.* (+ translationCandidates); P1.6 curator UX in hsi-curator-ux.* + richer gap/Gate C markdown (awaiting partner review session — no invented decisions). Optional HSI red-wave placeholders via bun run db:gate-c-local (pending only). ISI product approve stays autumn-snow — never from this workspace. Site: /curator.",
      "Phase 4: HSI Neon schema stub — bun run db:migrate (guards refuse ISI/Akeno/DeliverX).",
      "Systems vision: hsi-systems-vision.json — multi-axis target graph stubs (immune + gut–immune + neuroimmune + disease/tissue/biomarker + patient-plane rules + P3 adapters + aiFutureTech capabilities/hard bans/schema stubs); dual-track vertical fields; see docs/HSI_SYSTEMS_VISION_MAP.md + docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md.",
      "P2.2 embedding sidecars: hsi-embedding-sidecars.json — edgeId→modelId/dim/vectorRef|contentHash (+ optional tiny demo); doesNotSetHsiGrade=true; autoApprove=false; no PHI / no model weights; packs remain evidence authority.",
      "P2.3 offline eval harness: hsi-model-eval-harness.* — scores proposals/sidecars against frozen RA/SSc/gut/neuro fixtures; mayUseLivePhi=false; mayTrainModels=false; fail-closed clinical/PHI; never flips grades.",
      "P2.4 ClinVar/TCGA pointers: hsi-external-genome-pointers.json — accession + URL template + disease/gene context + optional edgeIds; reviewRequired=true; citation/ref only; no bulk genome dump / PHI; doesNotSetHsiGrade.",
      "P2.5 P3 adapter RFC + license matrix: docs/P3_ADAPTER_RFC.md + hsi-p3-adapter-license-matrix.* — ModelProposalArtifacts only; license gate before run; vendorsModelWeights=false; honest signOffStatus (not_signed|needs_review|non_commercial_only|research_ok_documented); no commercial signed without evidence.",
      "P3.0 RDKit thin adapter spike: hsi-rdkit-adapter-proposals.* — adapter-rdkit; runtime stub|rdkit; ModelProposalArtifacts only → Gate C pending; autoApprove=false; does not set hsiGrade; no weights / PHI / CDS / fake partnerSigned.",
      "P3.1 OpenMM thin adapter spike: hsi-openmm-adapter-proposals.* — adapter-openmm; runtime stub|openmm; ModelProposalArtifacts only → Gate C pending; autoApprove=false; does not set hsiGrade; MD ≠ Gate C evidence alone; no weights / PHI / CDS / fake partnerSigned.",
      "P3.2 REINVENT4 thin adapter spike: hsi-reinvent4-adapter-proposals.* — adapter-reinvent4; runtime stub|reinvent; ModelProposalArtifacts only → Gate C pending; autoApprove=false; does not set hsiGrade; never clinic recommendation path; no multi-GB weights / PHI / CDS / fake partnerSigned.",
      "P3.3 FAIR ESM-2 thin embedding stub: hsi-esm-adapter-proposals.* — adapter-esm; runtime stub|esm; ModelProposalArtifacts + embedding sidecar refs → Gate C pending; overlays hsi-embedding-sidecars.json; autoApprove=false; does not set hsiGrade; no weight vendoring / PHI sequences / CDS / fake partnerSigned.",
      "P3.5 Boltz weights-policy stub: hsi-boltz-adapter-proposals.* — adapter-boltz; WEIGHTS_POLICY_ACK=true required; optional BOLTZ_WEIGHTS_CACHE external only; ModelProposalArtifacts → Gate C pending; autoApprove=false; does not set hsiGrade; no multi-GB weight vendoring.",
      "P0.2-HSI ISI consume contract: hsi-isi-consume-contract.* — MANIFEST keys, pack schemas, grades semantics, Gate C rules, Discovery JSON paths; immunecity edits OUT OF REPO.",
      "P0.2-HSI partner flip-readiness: hsi-partner-flip-readiness.* — flipRequirements with pass/fail/pending/satisfied_by_fixture; named Apolo Pharma path can set readyToFlipPartnerSigned=true + lockedPilot=true; licensing/thresholds may stay pending.",
      "P0.3 source licensing stub: hsi-source-licensing-stub.* — RA/SSc/gut/neuro PMIDs curator-reviewed + Apolo Stage 1 clearanceScope (oa_reuse|cite_metadata_pilot|uncleared); no invented commercial publisher licenses.",
      "Boltz unblocked under WEIGHTS_POLICY_ACK (docs/P3_WEIGHTS_AND_LICENSE_POLICY.md); still never vendor multi-GB weights into git.",
      "Regenerate with: bun run outputs (also refreshes site/public/discovery).",
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

  // Phase 6: refresh committed static copies for the Discovery Centre site surface.
  const discoverySynced: string[] = [];
  const discoveryPublicDir = join(cwd, "site", "public", "discovery");
  mkdirSync(discoveryPublicDir, { recursive: true });
  const discoveryFiles = [
    "hsi-pilot-evidence-pack.json",
    "hsi-partner-lock.json",
    "hsi-vertical-decision.json",
    "hsi-ssc-pathway-pack.json",
    "hsi-gut-immune-pack.json",
    "hsi-neuroimmune-pack.json",
    "hsi-gap-report.json",
    "gate-c-checklist.json",
    "hsi-curator-ux.json",
    "hsi-r2-validation.json",
    "hsi-translation-handoff.json",
    "hsi-embedding-sidecars.json",
    "hsi-model-eval-harness.json",
    "hsi-external-genome-pointers.json",
    "hsi-p3-adapter-license-matrix.json",
    "hsi-rdkit-adapter-proposals.json",
    "hsi-openmm-adapter-proposals.json",
    "hsi-reinvent4-adapter-proposals.json",
    "hsi-esm-adapter-proposals.json",
    "hsi-af3-adapter-proposals.json",
    "hsi-tdc-adapter-proposals.json",
    "hsi-boltz-adapter-proposals.json",
    "hsi-isi-agents-adapter-proposals.json",
    "hsi-isi-consume-contract.json",
    "hsi-partner-flip-readiness.json",
    "hsi-source-licensing-stub.json",
  ] as const;
  for (const name of discoveryFiles) {
    const dest = join(discoveryPublicDir, name);
    copyFileSync(join(outDir, name), dest);
    discoverySynced.push(`site/public/discovery/${name}`);
  }
  const discoveryIndex = {
    schemaVersion: "hsi-discovery-centre-public-1" as const,
    notCds: true as const,
    noPatientLevelActions: true as const,
    autoApproveIntoKg: false as const,
    clinicalActive: false as const,
    clinicalUse: "not_for_clinical_use" as const,
    surfaceRole: "site_product_surface" as const,
    productSurfacePath: "/discovery",
    framing: "ASK → MAP → REVIEW → VALIDATE → TRANSLATE",
    phase: "8",
    generatedAt,
    bundleId,
    disease: partnerLock.disease?.label ?? null,
    researchQuestion: partnerLock.researchQuestion,
    scopeLocked: partnerLock.scopeLocked,
    partnerSigned: partnerLock.partnerSigned,
    lockedPilot: partnerLock.lockedPilot,
    agreementKind: partnerLock.agreementKind,
    legalBinding: partnerLock.legalBinding,
    isHypothetical: partnerLock.isHypothetical,
    notALegalAgreement: partnerLock.notALegalAgreement,
    testPilotMode: partnerLock.testPilotMode,
    testFixtureBanner: partnerLock.testFixtureBanner,
    partnerId: partnerLock.partner?.id ?? null,
    partnerType: partnerLock.partner?.type ?? null,
    verticalStrategy: partnerLock.verticalStrategy,
    activeScope: partnerLock.activeScope,
    prdMvpTarget: partnerLock.prdMvpTarget,
    files: [...discoveryFiles],
    notes: [
      partnerLock.testFixtureBanner
        ? `${partnerLock.testFixtureBanner} partner=${partnerLock.partner?.id}; agreementKind=${partnerLock.agreementKind}; legalBinding=${partnerLock.legalBinding}. Production ISI requires ALLOW_HYPOTHETICAL_PARTNER=true to trust fixture partnerSigned.`
        : "No hypothetical partner fixture active.",
      "Regenerate with bun run outputs — copies land here for the Vite site.",
      "Not diagnostic / not for clinical use. clinicalActive=false.",
      "ASK question stays RA / anti-TNF; SSc is dual-track secondary PRD target (hsi-ssc-pathway-pack.json).",
      "Systems secondary axes: gut–immune (hsi-gut-immune-pack.json) + neuroimmune vagus/cholinergic (hsi-neuroimmune-pack.json) — do not replace ASK.",
      "P2.2 embedding sidecars: hsi-embedding-sidecars.json — hash/ref only; doesNotSetHsiGrade; never auto-approve into KG.",
      "P2.3 offline eval harness: hsi-model-eval-harness.json — frozen-pack checks only; no PHI / no training / no grade flips.",
      "P2.4 ClinVar/TCGA pointers: hsi-external-genome-pointers.json — citation/ref only; reviewRequired; Gate C still required; no bulk dump / PHI.",
      "P2.5 P3 adapter license matrix: hsi-p3-adapter-license-matrix.json — RFC + honest sign-off; no weight vendoring; proposals only.",
      "P3.0 RDKit spike: hsi-rdkit-adapter-proposals.json — proposal-only; runtime stub|rdkit; Gate C pending; no grade flips.",
      "P3.1 OpenMM spike: hsi-openmm-adapter-proposals.json — proposal-only; runtime stub|openmm; Gate C pending; MD ≠ Gate C evidence alone.",
      "P3.2 REINVENT4 spike: hsi-reinvent4-adapter-proposals.json — proposal-only; runtime stub|reinvent; Gate C pending; never clinic path.",
      "P3.3 FAIR ESM-2 stub: hsi-esm-adapter-proposals.json — proposal + sidecar refs; runtime stub|esm; Gate C pending; no weight vendoring.",
      "AF3/TDC/ISI research sign-off fixtures + Boltz weights policy: hsi-af3|tdc|boltz|isi-agents-adapter-proposals.json — stub proposals; AF3 notCommercial; Boltz WEIGHTS_POLICY_ACK; no weight vendoring.",
      "P0.2-HSI: hsi-isi-consume-contract.json + hsi-partner-flip-readiness.json — ISI load map + flip checklist; named Apolo Pharma may set lockedPilot=true (legalBinding); fixture path uses hypothetical_test_only.",
      "P0.3 / Apolo clearance: hsi-source-licensing-stub.json — pack PMIDs with clearanceScope + partnerClearedCount (48/48 Stage 1; uncleared=0).",
      "P0.6 walkthrough hygiene: hsi-pilot-walkthrough.md + hsi-pilot-acceptance.* refreshed for named lock + clearance + lockedPilot.",
      "Phase 7 done = R2 validation (hsi-r2-validation.json) on VALIDATE tab.",
      "Phase 8 done = HSI translation substrate (hsi-translation-handoff.json) on TRANSLATE tab + in-repo Akeno HITL consumer at /akeno (not CDS).",
    ],
  };
  // catalogue.json under /discovery/* (machine). Do NOT write discovery/index.json —
  // that file shadows the SPA product route /discovery on Vercel static hosting.
  writeJson(join(discoveryPublicDir, "catalogue.json"), discoveryIndex);
  discoverySynced.push("site/public/discovery/catalogue.json");
  // Machine index at /discovery.json (non-breaking for JSON consumers).
  const sitePublicDir = join(process.cwd(), "site", "public");
  writeJson(join(sitePublicDir, "discovery.json"), {
    ...discoveryIndex,
    productSurfacePath: "/discovery",
    machineIndexPath: "/discovery.json",
    packBasePath: "/discovery/",
    note: "Product UI is /discovery (SPA). Pack JSON lives under /discovery/*.json. This file is the machine catalogue.",
  });
  discoverySynced.push("site/public/discovery.json");
  // Remove legacy shadowing index if present from older publishes.
  const legacyIndex = join(discoveryPublicDir, "index.json");
  if (existsSync(legacyIndex)) {
    unlinkSync(legacyIndex);
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
    discoverySynced,
  };
}
