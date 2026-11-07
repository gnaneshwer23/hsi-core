import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  assessBlindedReviewerGate,
  buildBlindedArtifacts,
  buildBlindedRunManifest,
  buildBlindedUsefulnessProtocol,
  emptyExpertScorePacket,
  evaluateBlindedUsefulness,
  parseBlindedEvalReceipt,
  parseBlindedRunManifest,
  parseBlindedUsefulnessProtocol,
  parseExpertScorePacket,
  type ExpertScorePacket,
} from "../src/evidence/blindedExpertUsefulness";

const root = resolve(import.meta.dir, "..");

function freshProtocol() {
  return buildBlindedUsefulnessProtocol({generatedAt: "2026-11-07T23:00:00.000Z"});
}

describe("N6 blinded expert usefulness", () => {
  test("builds protocol with three conditions and empty score scaffolds", () => {
    const protocol = freshProtocol();
    expect(protocol.fabricatedExpertScoresPermitted).toBe(false);
    expect(protocol.scientificApproval).toBe(false);
    expect(protocol.conditions).toHaveLength(3);
    expect(protocol.questions).toHaveLength(4);
    expect(protocol.analysisPlan.automatedUsefulnessScoreForbidden).toBe(true);
    expect(protocol.proposedThresholds.status).toBe("proposed_unagreed");
    expect(protocol.blinding.scoreRowsOmitConditionId).toBe(true);

    const artifacts = buildBlindedArtifacts(protocol);
    expect(artifacts).toHaveLength(12);
    expect(artifacts.every((a) => a.systemIdentityVisible === false)).toBe(true);

    const scores = emptyExpertScorePacket(protocol, artifacts);
    expect(scores.status).toBe("awaiting_blinded_reviewers");
    expect(scores.rows.every((r) => r.reviewerId === null)).toBe(true);
    expect(scores.rows.every((r) => Object.values(r.scores).every((v) => v === null))).toBe(true);
  });

  test("reviewer gate stays BLOCKED and eval usefulness metrics stay null", () => {
    const protocol = freshProtocol();
    const artifacts = buildBlindedArtifacts(protocol);
    const scores = emptyExpertScorePacket(protocol, artifacts);
    const gate = assessBlindedReviewerGate(scores);
    expect(gate.status).toBe("BLOCKED");
    expect(gate.scoredRows).toBe(0);

    const run = buildBlindedRunManifest({
      protocol,
      scorePacket: scores,
      generatedAt: "2026-11-07T23:00:00.000Z",
      n3KitHash: null,
      n4BriefReceiptHash: null,
      n5CriteriaReceiptHash: null,
    });
    expect(run.gates.engineeringHarness).toBe("CLEARED");
    expect(run.gates.protocolFrozen).toBe("CLEARED");
    expect(run.gates.blindingScaffold).toBe("CLEARED");
    expect(run.gates.emptyScorePacket).toBe("CLEARED");
    expect(run.gates.independentBlindedReviewers).toBe("BLOCKED");
    expect(run.gates.scientificAcceptance).toBe("BLOCKED");
    expect(run.usefulnessClaimed).toBe(false);

    const receipt = evaluateBlindedUsefulness(protocol, scores, run, "2026-11-07T23:00:00.000Z");
    expect(receipt.scientificAcceptance).toBe("BLOCKED");
    expect(receipt.usefulnessDeltaVsBaseline).toBeNull();
    expect(receipt.usefulnessDeltaVsConventional).toBeNull();
    expect(receipt.majorErrorRate).toBeNull();
    expect(receipt.interRaterAgreement).toBeNull();
    expect(receipt.usefulnessClaimed).toBe(false);
    parseBlindedEvalReceipt(receipt);
  });

  test("score rows cannot carry conditionId or partial fabricated scores", () => {
    const protocol = freshProtocol();
    const scores = emptyExpertScorePacket(protocol, buildBlindedArtifacts(protocol));
    const bad = structuredClone(scores) as ExpertScorePacket & {rows: Array<Record<string, unknown>>};
    bad.rows[0]!.conditionId = "hsi_grounded_brief";
    expect(() => parseExpertScorePacket(bad)).toThrow();

    const partial = emptyExpertScorePacket(protocol, buildBlindedArtifacts(protocol));
    partial.rows[0]!.scores.relevant_evidence_coverage = 5;
    expect(() => parseExpertScorePacket(partial)).toThrow("Incomplete human score");
  });

  test("run cannot clear scientificAcceptance", () => {
    const protocol = freshProtocol();
    const scores = emptyExpertScorePacket(protocol, buildBlindedArtifacts(protocol));
    const run = buildBlindedRunManifest({
      protocol,
      scorePacket: scores,
      generatedAt: "2026-11-07T23:00:00.000Z",
    });
    const bad = structuredClone(run);
    bad.gates.scientificAcceptance = "CLEARED";
    expect(() => parseBlindedRunManifest(bad)).toThrow("scientificAcceptance");
  });

  test("questions reuse N4 investigation ids where applicable", () => {
    const protocol = freshProtocol();
    expect(protocol.questions.map((q) => q.n4InvestigationId)).toEqual([
      "N4-Q-01",
      "N4-Q-02",
      "N4-Q-03",
      "N4-Q-04",
    ]);
    expect(protocol.blindingKey.A).toBe("deterministic_baseline");
    expect(protocol.blindingKey.B).toBe("hsi_grounded_brief");
    expect(protocol.blindingKey.C).toBe("conventional_research");
  });

  test("on-disk n6 artifacts match builder when present", () => {
    const protocolPath = resolve(root, "research/domain-graph/n6/protocol.v1.json");
    const scoresPath = resolve(root, "research/domain-graph/n6/scores.awaiting_reviewers.json");
    const runPath = resolve(root, "research/domain-graph/n6/run-manifest.v1.json");
    const protocol = parseBlindedUsefulnessProtocol(JSON.parse(readFileSync(protocolPath, "utf8")));
    const scores = parseExpertScorePacket(JSON.parse(readFileSync(scoresPath, "utf8")));
    const run = parseBlindedRunManifest(JSON.parse(readFileSync(runPath, "utf8")));
    expect(protocol.questions).toHaveLength(4);
    expect(scores.status).toBe("awaiting_blinded_reviewers");
    expect(run.gates.scientificAcceptance).toBe("BLOCKED");
    expect(evaluateBlindedUsefulness(protocol, scores, run, protocol.generatedAt).scoredRows).toBe(0);
  });
});
