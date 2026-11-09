import { describe, expect, test } from "bun:test";
import { DEMO_HITL_ACTORS, HitlError, HitlStore } from "../src/hitl";
import { generateSyntheticCohort } from "../src/demo/cohort";
import { runDemoScenario } from "../src/demo/scenario";
import { similaritySatisfiesEligibility, similarPatients } from "../src/demo/similarity";
import { prescreen } from "../src/demo/trials";
import { assertPhiCannotEnterGraph } from "../src/demo/phiBarrier";
import { seedRelease } from "../src/demo/graphRelease";
import { latestLab } from "../src/demo/cohort";

describe("synthetic demonstration scenario", () => {
  test("cohort is deterministic and keeps type 1 and type 2 diabetes distinct", () => {
    const first = generateSyntheticCohort();
    const second = generateSyntheticCohort();
    expect(first).toHaveLength(240);
    expect(first.map((patient) => patient.pseudonym).join()).toBe(second.map((patient) => patient.pseudonym).join());
    expect(first.every((patient) => patient.synthetic)).toBe(true);
    const type1 = new Set(first.filter((patient) => patient.condition.diabetes === "t1d").map((patient) => patient.pseudonym));
    const type2 = new Set(first.filter((patient) => patient.condition.diabetes === "t2d").map((patient) => patient.pseudonym));
    expect([...type1].some((id) => type2.has(id))).toBe(false);
    expect(first.some((patient) => patient.condition.diabetes === "t1d")).toBe(true);
    expect(first.some((patient) => patient.condition.diabetes === "t2d" && patient.condition.rheumatoidArthritis)).toBe(true);
  });

  test("approved review publishes a release that the next investigation reads", async () => {
    const report = await runDemoScenario();
    expect(report.networkUsed).toBe(false);
    expect(report.evidence.literature.length).toBeGreaterThan(0);
    expect(report.reviewStatus).toBe("approved");
    expect(report.release.version).toBe("1.0.1");
    expect(report.release.priorReleaseId).toBe("lhkg-demo-1.0.0");
    expect(report.release.patientDataIncluded).toBe(false);
    expect(report.secondInvestigationReadRelease).toBe(report.release.releaseId);
    expect(report.secondMentionsApprovedEdge).toBe(true);
    expect(report.patientQuestionSent).toBe(false);
    expect(report.patientQuestionBlocked).toBe(true);
  });

  test("demo literature uses verified PubMed records and dated Open Targets scores", async () => {
    const report = await runDemoScenario();
    const pmids = report.evidence.literature.map((row) => row.pmid);
    expect(pmids).toEqual(["27912057", "11298065"]);
    expect(report.evidence.literature[0]?.title).toContain("Gut Microbiota Regulate Motor Deficits");
    expect(report.evidence.literature[1]?.title).toContain("Anti-TNF agents for rheumatoid arthritis");
    expect(report.evidence.literatureVerifiedAt).toBe("2026-11-09");
    expect(report.evidence.openTargets.ok).toBe(true);
    if (!report.evidence.openTargets.ok) throw new Error("expected Open Targets ok");
    expect(report.evidence.openTargets.diseaseId).toBe("MONDO_0008383");
    expect(report.evidence.openTargets.fetchedAt).toBe("2026-11-09");
    expect(report.targets.map((row) => row.symbol)).toEqual(["TNF", "IL6", "FFAR2"]);
    expect(report.targets[0]?.ensemblId).toBe("ENSG00000232810");
    expect(report.targets.every((row) => row.scoreFetchedAt === "2026-11-09")).toBe(true);
    expect(report.targets.every((row) => row.scoreIsNotCausation)).toBe(true);
  });

  test("similarity never satisfies eligibility", () => {
    const cohort = generateSyntheticCohort();
    const index = cohort[20];
    if (!index) throw new Error("missing patient");
    const hits = similarPatients(index, cohort);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((hit) => hit.note === "similarity_is_not_eligibility")).toBe(true);
    expect(similaritySatisfiesEligibility("similarity_only")).toBe(false);
  });

  test("unknown stays unknown and self-report is unverified", () => {
    const cohort = generateSyntheticCohort();
    const missing = cohort.find((patient) => latestLab(patient, "1988-5")?.missing);
    if (!missing) throw new Error("expected a missing CRP");
    const report = prescreen(missing);
    expect(report.criteria.find((item) => item.id === "crp")?.state).toBe("unknown");
    expect(report.criteria.find((item) => item.id === "diet")?.state).toBe("unknown");
    expect(report.confirmedEligible).toBe(false);
    expect(report.selfReportVerified).toBe(false);
    expect(missing.diet.verified).toBe(false);
  });

  test("PHI text cannot enter the research graph", () => {
    const release = seedRelease();
    const result = assertPhiCannotEnterGraph(release, ["NHS number 485 777 3456"]);
    expect(result.blocked).toBe(true);
    expect(JSON.stringify(release).includes("NHS number")).toBe(false);
  });
});

describe("question and review state machine", () => {
  test("idempotency, four eyes, expiry and permission withdrawal", () => {
    const store = new HitlStore(DEMO_HITL_ACTORS);
    const job = store.createJob({
      gapKey: "gap-1",
      audience: "scientific_reviewer",
      recipientActorId: "actor-scientist",
      prompt: "Is the association supported?",
      chartVersion: 2,
      idempotencyKey: "create-1",
      at: "2026-11-09T00:00:00.000Z",
      actorId: "actor-coordinator",
    });
    const again = store.createJob({
      gapKey: "gap-1",
      audience: "scientific_reviewer",
      recipientActorId: "actor-scientist",
      prompt: "Is the association supported?",
      chartVersion: 2,
      idempotencyKey: "create-1",
      at: "2026-11-09T00:00:00.000Z",
      actorId: "actor-coordinator",
    });
    expect(again.id).toBe(job.id);
    expect(() =>
      store.createJob({
        gapKey: "other",
        audience: "scientific_reviewer",
        recipientActorId: "actor-scientist",
        prompt: "different",
        chartVersion: 2,
        idempotencyKey: "create-1",
        at: "2026-11-09T00:01:00.000Z",
        actorId: "actor-coordinator",
      }),
    ).toThrow(HitlError);
    store.approveSend(job.id, "actor-coordinator", "send-1", "2026-11-09T00:02:00.000Z");
    expect(store.outbox().some((row) => row.channel === "simulated_local_only")).toBe(true);
    store.deliverSimulated("actor-coordinator", "2026-11-09T00:03:00.000Z");
    store.answer(job.id, "actor-scientist", { decision: "approve" }, "answer-1", "2026-11-09T00:04:00.000Z");
    expect(() => store.review(job.id, "actor-scientist", "approve", "review-bad", "2026-11-09T00:05:00.000Z")).toThrow(HitlError);
    const expired = new HitlStore(DEMO_HITL_ACTORS);
    const waiting = expired.createJob({
      gapKey: "gap-expire",
      audience: "scientific_reviewer",
      recipientActorId: "actor-scientist",
      prompt: "Still open?",
      chartVersion: 1,
      idempotencyKey: "create-expire",
      at: "2026-11-09T00:00:00.000Z",
      actorId: "actor-coordinator",
    });
    expect(expired.expire(waiting.id, "actor-coordinator", "2026-11-09T02:00:00.000Z").state).toBe("expired");
    const withdrawn = new HitlStore(DEMO_HITL_ACTORS);
    const open = withdrawn.createJob({
      gapKey: "gap-withdraw",
      audience: "scientific_reviewer",
      recipientActorId: "actor-scientist",
      prompt: "Withdraw?",
      chartVersion: 1,
      idempotencyKey: "create-withdraw",
      at: "2026-11-09T00:00:00.000Z",
      actorId: "actor-coordinator",
    });
    expect(withdrawn.withdrawPermission(open.id, "actor-privacy", "2026-11-09T00:06:00.000Z").state).toBe("cancelled_permission");
  });

  test("a newer chart version supersedes an approved job", () => {
    const store = new HitlStore(DEMO_HITL_ACTORS);
    const job = store.createJob({
      gapKey: "gap-chart",
      audience: "scientific_reviewer",
      recipientActorId: "actor-scientist",
      prompt: "Chart?",
      chartVersion: 1,
      idempotencyKey: "create-chart",
      at: "2026-11-09T00:00:00.000Z",
      actorId: "actor-coordinator",
    });
    store.approveSend(job.id, "actor-coordinator", "send-chart", "2026-11-09T00:01:00.000Z");
    store.deliverSimulated("actor-coordinator", "2026-11-09T00:02:00.000Z");
    store.answer(job.id, "actor-scientist", { ok: true }, "answer-chart", "2026-11-09T00:03:00.000Z");
    store.review(job.id, "actor-reviewer", "approve", "review-chart", "2026-11-09T00:04:00.000Z");
    const applied = store.apply(job.id, "actor-coordinator", "apply-chart", "2026-11-09T00:05:00.000Z", 2, () => ({}));
    expect(applied.status).toBe("superseded");
  });
});
