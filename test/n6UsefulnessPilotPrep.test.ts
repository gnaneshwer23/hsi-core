import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  buildBlindedArtifacts,
  buildBlindedRunManifest,
  buildBlindedUsefulnessProtocol,
  emptyExpertScorePacket,
  evaluateBlindedUsefulness,
} from "../src/evidence/blindedExpertUsefulness";
import {
  buildN6UsefulnessPilotPrep,
  parseN6UsefulnessPilotPrep,
} from "../src/evidence/n6UsefulnessPilotPrep";

const root = resolve(import.meta.dir, "..");
const generatedAt = "2026-11-07T23:00:00.000Z";
const pilotPrepGeneratedAt = "2026-11-08T12:00:00.000Z";

function freshBundle() {
  const protocol = buildBlindedUsefulnessProtocol({generatedAt});
  const artifacts = buildBlindedArtifacts(protocol);
  const scores = emptyExpertScorePacket(protocol, artifacts);
  const run = buildBlindedRunManifest({
    protocol,
    scorePacket: scores,
    generatedAt,
    n3KitHash: null,
    n4BriefReceiptHash: null,
    n5CriteriaReceiptHash: null,
  });
  const receipt = evaluateBlindedUsefulness(protocol, scores, run, generatedAt);
  return {protocol, scores, run, receipt};
}

describe("N6 usefulness pilot prep (audit Phase #7)", () => {
  test("builds eng-CLEARED prep with usefulness NO-GO and empty reviewer slots", () => {
    const bundle = freshBundle();
    const prep = buildN6UsefulnessPilotPrep({
      ...bundle,
      generatedAt: pilotPrepGeneratedAt,
    });
    expect(prep.engineeringScaffold).toBe("CLEARED");
    expect(prep.usefulnessPilotGoNoGo).toBe("NO_GO");
    expect(prep.n3HumanLabelFreezePrerequisite).toBe("BLOCKED");
    expect(prep.scientificAcceptance).toBe("BLOCKED");
    expect(prep.usefulnessClaimed).toBe(false);
    expect(prep.scoredRows).toBe(0);
    expect(prep.summary.reviewerSlotsFilled).toBe(0);
    expect(prep.summary.usefulnessPilotCleared).toBe(false);
    expect(prep.thresholdsStatus).toBe("proposed_unagreed");
    expect(prep.reviewerRosterSlots.every((s) => s.principal === null)).toBe(true);
    expect(prep.checks.filter((c) => c.plane === "engineering").every((c) => c.status === "CLEARED")).toBe(
      true,
    );
    expect(
      prep.checks
        .filter((c) => c.plane === "human")
        .every((c) => c.status === "PENDING_HUMAN" || c.status === "NO_GO"),
    ).toBe(true);
    expect(parseN6UsefulnessPilotPrep(prep).prepHash).toBe(prep.prepHash);
  });

  test("refuses invented reviewer principals in roster slots", () => {
    const bundle = freshBundle();
    const prep = buildN6UsefulnessPilotPrep({
      ...bundle,
      generatedAt: pilotPrepGeneratedAt,
    });
    const bad = structuredClone(prep) as typeof prep;
    bad.reviewerRosterSlots[0]!.principal = "Dr Invented" as unknown as null;
    expect(() => parseN6UsefulnessPilotPrep(bad)).toThrow("invent reviewer");
  });

  test("refuses claiming usefulness pilot CLEARED", () => {
    const bundle = freshBundle();
    const prep = buildN6UsefulnessPilotPrep({
      ...bundle,
      generatedAt: pilotPrepGeneratedAt,
    });
    const bad = structuredClone(prep) as typeof prep & {usefulnessPilotGoNoGo: string};
    (bad as {usefulnessPilotGoNoGo: string}).usefulnessPilotGoNoGo = "GO";
    expect(() => parseN6UsefulnessPilotPrep(bad)).toThrow();
  });

  test("on-disk pilot-prep.v1.json parses and stays NO-GO when present", () => {
    const path = resolve(root, "research/domain-graph/n6/pilot-prep.v1.json");
    const raw = JSON.parse(readFileSync(path, "utf8"));
    const prep = parseN6UsefulnessPilotPrep(raw);
    expect(prep.usefulnessPilotGoNoGo).toBe("NO_GO");
    expect(prep.n3HumanLabelFreezePrerequisite).toBe("BLOCKED");
    expect(prep.summary.reviewerSlotsFilled).toBe(0);
    expect(prep.remediationPhase).toBe("production_readiness_audit_phase_7");
  });
});
