/** Automated verification for pending-real vs research RA investigation paths (memory store; no product Neon). */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  createCorpusRetrievalProvider,
  createInvestigationService,
  createMemoryInvestigationStore,
} from "../src/investigationService";
import { investigationError } from "../src/investigationBackend";
import { RaEvidenceUnavailableError, raEvidenceReadiness, RA_RELEASE_ID } from "../src/raEvidenceRelease";
import {
  RA_RESEARCH_RELEASE_ID,
  buildRaResearchEvidenceBundle,
  raResearchEvidenceReadiness,
} from "../src/raResearchEvidenceRelease";
import { emptyCorrectionProvenanceBundle, assertCorrectionFeedSeparation, routeCorrectionStub } from "../src/correctionProvenance";
import { bridgeObservationToBiology } from "../src/observationBiologyBridge";
import { secondIndicationPackStub } from "../src/secondPackStub";
import { decideClinicalResearchScaffold } from "../src/clinicalResearchScaffold";
import { researchRunState } from "../src/researchContracts";

const root = resolve(import.meta.dir, "..");
const pending = JSON.parse(readFileSync(resolve(root, "research/ra-anti-tnf/release.json"), "utf8"));
const research = JSON.parse(readFileSync(resolve(root, "research/ra-anti-tnf-research/release.json"), "utf8"));

const checks: Array<{ name: string; ok: boolean; detail: string }> = [];
function check(name: string, ok: boolean, detail: string) {
  checks.push({ name, ok, detail });
  if (!ok) throw new Error(`VERIFY FAIL: ${name} — ${detail}`);
}

const pendingReady = raEvidenceReadiness(pending);
check("pending_unavailable", pendingReady.available === false, pendingReady.reason ?? "missing reason");
const pendingError = investigationError(new RaEvidenceUnavailableError());
check("pending_maps_evidence_not_ready", pendingError.status === 422, `status=${pendingError.status}`);

const researchReady = raResearchEvidenceReadiness(research);
check("research_available", researchReady.available === true, researchReady.reason ?? "ok");
check("research_not_for_claim", researchReady.notForScientificClaim === true, "flag");

const token = Symbol("verify");
const service = createInvestigationService({
  store: createMemoryInvestigationStore(),
  providers: { retrieval: createCorpusRetrievalProvider() },
  authorize: async (credential) => {
    if (credential !== token) throw new Error("denied");
    return { id: "research-reviewer", role: "reviewer" };
  },
});

const key = "verify-ra-research";
const started = await service.start(key, buildRaResearchEvidenceBundle(research), token);
check("research_start_passages", (started.payloads.retrieval?.passageIds.length ?? 0) >= 2, JSON.stringify(started.payloads.retrieval));
check("research_state_awaiting_review", researchRunState(started.bundle.runs[0]!) === "awaiting_human_review", researchRunState(started.bundle.runs[0]!));
check("research_synthetic", started.bundle.context.dataClass === "synthetic", started.bundle.context.dataClass);
check("research_no_claims", started.bundle.claims.length === 0, String(started.bundle.claims.length));

const reviewed = await service.review(key, started.revision, "accept_for_research", "Accept for investigation workflow only; not scientific validation.", token);
const exported = await service.exportDossier(key, token);
check("research_export_json", exported.markdown.includes("research") || exported.markdown.includes("synthetic") || exported.markdown.includes("RS-000"), "export body");
check("research_reload", (await service.get(key, token)).revision === reviewed.revision, "reload revision");

const corrections = emptyCorrectionProvenanceBundle();
assertCorrectionFeedSeparation(corrections);
const routed = routeCorrectionStub({
  id: "SYN-CORR-RESEARCH-1",
  investigationKey: key,
  releaseId: RA_RESEARCH_RELEASE_ID,
  rationale: "Correction stays in research_working_set_only feed.",
  createdAt: "2026-11-03T16:05:00.000Z",
  intendedFeed: "research_working_set_only",
});
check("correction_research_feed", routed.feed === "research_working_set_only" && routed.notForScientificClaim, routed.feed);

const bridge = bridgeObservationToBiology({
  id: "SYN-OBS-RESEARCH-1",
  label: "Synthetic RF/anti-CCP observation for RA anti-TNF research bridge",
  observationCode: "SYN-RA-SEROLOGY",
  valueSummary: "Research serology pointer; rheumatoid arthritis anti-TNF context.",
  containsPhi: false,
  syntheticOnly: true,
  liveEmis: false,
});
check("observation_bridge", bridge.concepts.some((c) => c.conceptId === "D001"), JSON.stringify(bridge.concepts));

const pack = secondIndicationPackStub();
check("second_pack_blocked", pack.dependsOn.researchWorkingSetDoesNotSatisfy === true && pack.candidateIndication === null, pack.status);

const refuseLive = decideClinicalResearchScaffold({
  purpose: "live_cds",
  containsPhi: false,
  syntheticOnly: true,
});
check("clinical_refuses_live_cds", refuseLive.allow === false && refuseLive.reason === "live_cds_refused", JSON.stringify(refuseLive));
const allowSynth = decideClinicalResearchScaffold({
  purpose: "trials_criteria_stub",
  containsPhi: false,
  syntheticOnly: true,
});
check("clinical_allows_synthetic", allowSynth.allow === true, JSON.stringify(allowSynth));

console.log(JSON.stringify({
  ok: true,
  pendingReleaseId: RA_RELEASE_ID,
  researchReleaseId: RA_RESEARCH_RELEASE_ID,
  checks: checks.map((c) => c.name),
  note: "Product Neon activation (ISI 0029 / Aksh 056) and SME licence verification remain human-gated.",
}, null, 2));
