/**
 * One offline investigation across the synthetic cohort.
 * Scientific review is simulated by fixture actors. Patient questions are never sent.
 * No EHR write-back and no live clinical decision support.
 */
import { DEMO_HITL_ACTORS, HitlStore } from "../hitl";
import { generateSyntheticCohort, latestLab, type SyntheticPatient } from "./cohort";
import { prioritiseTargets, repurposingHypotheses } from "./discovery";
import { retrieveFixtureEvidence } from "./evidenceFixtures";
import { toFhirBundle } from "./fhir";
import { seedRelease } from "./graphRelease";
import { edgesAfterApproval, releaseFromApproval, runInvestigation, DEMO_QUESTION } from "./investigation";
import { assertPhiCannotEnterGraph } from "./phiBarrier";
import { similarPatients, similaritySatisfiesEligibility } from "./similarity";
import { prescreen } from "./trials";

export type DemoScenario = Awaited<ReturnType<typeof runDemoScenario>>;

export async function runDemoScenario() {
  const cohort = generateSyntheticCohort();
  const focus = cohort.find((patient) => patient.condition.rheumatoidArthritis && patient.condition.diabetes === "t2d") ?? cohort[0];
  if (!focus) throw new Error("Synthetic cohort was empty");
  const missingCrp = cohort.find((patient) => latestLab(patient, "1988-5")?.missing) ?? focus;
  const evidence = await retrieveFixtureEvidence();
  const initial = seedRelease();
  const first = await runInvestigation(initial);
  const store = new HitlStore(DEMO_HITL_ACTORS);
  const at = "2026-11-09T12:00:00.000Z";
  const scientific = store.transaction(() =>
    store.createJob({
      gapKey: "gap-butyrate-neuro",
      audience: "scientific_reviewer",
      recipientActorId: "actor-scientist",
      prompt: first.brief.hypotheses[0]?.text ?? DEMO_QUESTION,
      chartVersion: 1,
      idempotencyKey: "create-scientific-1",
      at,
      actorId: "actor-coordinator",
    }),
  );
  store.transaction(() => store.approveSend(scientific.id, "actor-coordinator", "approve-scientific-1", "2026-11-09T12:01:00.000Z"));
  store.transaction(() => store.deliverSimulated("actor-coordinator", "2026-11-09T12:02:00.000Z"));
  store.transaction(() =>
    store.answer(scientific.id, "actor-scientist", { decision: "association_only", note: "Do not promote a causal mechanism." }, "answer-scientific-1", "2026-11-09T12:10:00.000Z"),
  );
  const review = store.transaction(() =>
    store.review(scientific.id, "actor-reviewer", "approve", "review-scientific-1", "2026-11-09T12:20:00.000Z"),
  );
  const applied = store.transaction(() =>
    store.apply(scientific.id, "actor-coordinator", "apply-scientific-1", "2026-11-09T12:30:00.000Z", 1, () => {
      const next = releaseFromApproval(
        initial,
        edgesAfterApproval(first.proposedEdges, "review-scientific-1"),
        "review-scientific-1",
        "2026-11-09T12:30:00.000Z",
      );
      return { releaseId: next.releaseId, version: next.version };
    }),
  );
  if (applied.status !== "applied") throw new Error("Scientific review did not apply");
  const published = releaseFromApproval(
    initial,
    edgesAfterApproval(first.proposedEdges, "review-scientific-1"),
    "review-scientific-1",
    "2026-11-09T12:30:00.000Z",
  );
  const second = await runInvestigation(published);
  let patientBlocked = false;
  try {
    store.transaction(() => {
      const patientJob = store.createJob({
        gapKey: "gap-patient-diet",
        audience: "patient",
        recipientActorId: "actor-patient",
        prompt: "What did you eat yesterday?",
        chartVersion: 1,
        idempotencyKey: "create-patient-1",
        at: "2026-11-09T12:40:00.000Z",
        actorId: "actor-coordinator",
      });
      store.approveSend(patientJob.id, "actor-coordinator", "approve-patient-1", "2026-11-09T12:41:00.000Z");
    });
  } catch (error) {
    patientBlocked = error instanceof Error && error.message.includes("never sent");
  }
  const phi = assertPhiCannotEnterGraph(published, ["NHS number 485 777 3456"]);
  const screen = prescreen(missingCrp);
  const similar = similarPatients(focus, cohort);
  return {
    synthetic: true as const,
    networkUsed: false,
    question: DEMO_QUESTION,
    cohortSize: cohort.length,
    diabetesCounts: {
      t1d: cohort.filter((patient) => patient.condition.diabetes === "t1d").length,
      t2d: cohort.filter((patient) => patient.condition.diabetes === "t2d").length,
    },
    focus: summarise(focus),
    fhirResourceTypes: [...new Set(toFhirBundle(focus).entry.map((item) => String(item.resource.resourceType)))],
    evidence,
    firstBrief: first.brief,
    firstSteps: first.steps,
    reviewStatus: review.status,
    release: {
      releaseId: published.releaseId,
      version: published.version,
      priorReleaseId: published.priorReleaseId,
      manifestHash: published.manifestHash,
      patientDataIncluded: published.patientDataIncluded,
      approvedEdge: published.edges.find((edge) => edge.reviewDecisionId === "review-scientific-1")?.id ?? null,
    },
    secondInvestigationReadRelease: second.brief.releaseRead,
    secondMentionsApprovedEdge: second.brief.mechanisms.some((line) => line.includes(published.releaseId)),
    learningLoop: {
      step8Label: "Review approved → release published → next investigation reads it",
      before: {
        releaseId: initial.releaseId,
        version: initial.version,
        approvedEdgeCount: initial.edges.filter((edge) => edge.reviewState === "approved").length,
        step8Detail: first.steps.find((step) => step.id === 8)?.detail ?? null,
        releaseRead: first.brief.releaseRead,
      },
      after: {
        releaseId: published.releaseId,
        version: published.version,
        priorReleaseId: published.priorReleaseId,
        approvedEdgeId: published.edges.find((edge) => edge.reviewDecisionId === "review-scientific-1")?.id ?? null,
        approvedEdgeCount: published.edges.filter((edge) => edge.reviewState === "approved").length,
        step8Detail: second.steps.find((step) => step.id === 8)?.detail ?? null,
        releaseRead: second.brief.releaseRead,
        mechanismMentionsRelease: second.brief.mechanisms.some((line) => line.includes(published.releaseId)),
      },
      timeline: [
        { label: "Scientific review approved", at: "2026-11-09T12:20:00.000Z" },
        { label: `Graph release ${published.version} published`, at: "2026-11-09T12:30:00.000Z", releaseId: published.releaseId },
        { label: "Next investigation reads the published release", at: "2026-11-09T12:31:00.000Z", releaseId: published.releaseId },
      ],
    },
    patientQuestionSent: false,
    patientQuestionBlocked: patientBlocked,
    outboxChannels: [...new Set(store.outbox().map((row) => row.channel))],
    similar,
    similarityIsEligibility: similaritySatisfiesEligibility("similarity_only"),
    prescreen: screen,
    targets: evidence.openTargets.ok ? prioritiseTargets(evidence.targets) : [],
    repurposing: repurposingHypotheses(),
    phiBlocked: phi.blocked,
    reviewEvents: store.events().map((event) => ({ name: event.name, at: event.at })),
  };
}

function summarise(patient: SyntheticPatient) {
  const hba1c = latestLab(patient, "4548-4");
  const crp = latestLab(patient, "1988-5");
  return {
    pseudonym: patient.pseudonym,
    consentScopes: patient.consentScopes,
    condition: patient.condition,
    ageYears: patient.ageYears,
    hba1c: hba1c?.value ?? null,
    crpMissing: crp?.missing ?? true,
    diet: patient.diet,
    medications: patient.medications,
    microbiomeMissing: patient.microbiome.missing,
  };
}
