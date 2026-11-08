/**
 * Synthetic research-workspace test fixture (engineering only).
 * Not scientific approval, Gate C, MoU, legalBinding, or live CDS/PHI.
 */
import {createHash} from "node:crypto";
import {planSscInterrogation} from "./interrogativeQuestionEngine";
import {validateInterrogativeInvestigation,type InterrogativeInvestigation} from "./interrogativeContracts";

export const RESEARCH_WORKSPACE_TEST_FIXTURE = {
  label: "synthetic-test-fixture",
  honestyBanner:
    "SYNTHETIC/TEST FIXTURE ONLY — not scientific approval, Gate C auto-approve, MoU, legalBinding, or live CDS/PHI",
  releaseId: "hsi-release-test-fixture-ssc-ws-001",
  releaseVersion: "0.0.1",
  investigationId: "hsi-interrogative-test-fixture-ws-001",
  createdBy: "synthetic-test-fixture-operator",
  question:
    "[TEST/SYNTHETIC FIXTURE — not scientific approval] What candidate mechanisms may contribute to dermal fibrosis in systemic sclerosis?",
  defaultPrincipalId: "6c2342fd-c581-4a8a-b40e-1b7fa065e237",
  createdAt: "2026-11-08T12:00:00.000Z",
} as const;

/** Must match authenticatedInterrogativeStore content hashing. */
export function fixtureContentHash(investigation: InterrogativeInvestigation): string {
  return createHash("sha256").update(canonical(investigation)).digest("hex");
}

export function fixtureManifestHash(): string {
  const manifest = {
    schemaVersion: "hsi-test-fixture-manifest-1",
    releaseId: RESEARCH_WORKSPACE_TEST_FIXTURE.releaseId,
    releaseVersion: RESEARCH_WORKSPACE_TEST_FIXTURE.releaseVersion,
    honesty: RESEARCH_WORKSPACE_TEST_FIXTURE.honestyBanner,
    claims: [] as const,
    scientificAcceptance: false,
    gateCAutoApprove: false,
    legalBinding: false,
    containsPhi: false,
  };
  return createHash("sha256").update(JSON.stringify(manifest)).digest("hex");
}

export function buildResearchWorkspaceTestInvestigation(input?: {
  principalId?: string;
  createdAt?: string;
}): {investigation: InterrogativeInvestigation; contentHash: string; manifestHash: string} {
  const principalId = (input?.principalId ?? RESEARCH_WORKSPACE_TEST_FIXTURE.defaultPrincipalId).trim();
  if (!principalId) throw new Error("principalId required");
  const manifestHash = fixtureManifestHash();
  const release = {
    id: RESEARCH_WORKSPACE_TEST_FIXTURE.releaseId,
    version: RESEARCH_WORKSPACE_TEST_FIXTURE.releaseVersion,
    manifestHash,
  };
  const planned = planSscInterrogation({
    question: RESEARCH_WORKSPACE_TEST_FIXTURE.question,
    actorPrincipal: principalId,
    createdAt: input?.createdAt ?? RESEARCH_WORKSPACE_TEST_FIXTURE.createdAt,
    dataClass: "public_biomedical",
    focus: "systemic_sclerosis",
    release,
  });
  const investigation: InterrogativeInvestigation = {
    ...planned,
    id: RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId,
    conclusion: {
      ...planned.conclusion,
      limitations: [RESEARCH_WORKSPACE_TEST_FIXTURE.honestyBanner, ...planned.conclusion.limitations],
    },
  };
  validateInterrogativeInvestigation(investigation);
  return {investigation, contentHash: fixtureContentHash(investigation), manifestHash};
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  if (value && typeof value === "object") {
    return (
      "{" +
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => JSON.stringify(k) + ":" + canonical(v))
        .join(",") +
      "}"
    );
  }
  return JSON.stringify(value) ?? "null";
}
