import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {
  assertHsiScientificCompanionOwnerAuthorized,
  HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL,
  validateHsiScientificCompanionOwnerApproval,
} from "../src/hsiScientificCompanionAuthorization";
import {runHsiScientificCompanionTurn} from "../src/hsiScientificCompanionRuntime";
import {
  assertHsiScientificCompanionSoftLand,
  hsiScientificCompanionSoftLandPacket,
  hsiScientificCompanionSurfaceById,
} from "../src/operations/hsiScientificCompanionSoftLand";

describe("U41 Scientific Companion text-first", () => {
  test("owner approval refuses voice / avatar / networking / unfenced LLM", () => {
    expect(() =>
      validateHsiScientificCompanionOwnerApproval(HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL),
    ).not.toThrow();
    expect(HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL.voiceEnabled).toBe(false);
    expect(HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL.avatarEnabled).toBe(false);
    expect(HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL.networkingMatchingEnabled).toBe(false);
    expect(() =>
      validateHsiScientificCompanionOwnerApproval({
        ...HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL,
        avatarEnabled: true as false,
      }),
    ).toThrow("avatar");
  });

  test("soft-land catalogues Phase 2 text surfaces and keeps Phase 3+ gated", () => {
    const packet = hsiScientificCompanionSoftLandPacket();
    const summary = assertHsiScientificCompanionSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.voiceEnabled).toBe(false);
    expect(hsiScientificCompanionSurfaceById("text_discuss_turn").engineeringReady).toBe(true);
    expect(hsiScientificCompanionSurfaceById("voice_avatar").engineeringReady).toBe(false);
    expect(hsiScientificCompanionSurfaceById("networking_matching").phase).toBe(4);
  });

  test("discuss turn reuses interrogative planning without claiming approval", () => {
    assertHsiScientificCompanionOwnerAuthorized(HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL);
    const result = runHsiScientificCompanionTurn({
      authorization: HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL,
      mode: "discuss",
      question: "Which SSc mechanisms require investigation?",
      createdAt: "2026-11-21T23:00:00Z",
    });
    expect(result.schemaVersion).toBe("hsi-scientific-companion-runtime-1");
    expect(result.mode).toBe("discuss");
    expect(result.replyMarkdown).toContain("Companion discussion");
    expect(result.investigation.branches.length).toBeGreaterThan(0);
    expect(result.honesty.scientificApproval).toBe(false);
    expect(result.honesty.avatarEnabled).toBe(false);
    expect(result.honesty.llmUnfencedFreeText).toBe(false);
    expect(result.servicesUsed).toContain("interrogativeQuestionEngine");
    expect(result.limitations.some((l) => /not scientific approval/i.test(l))).toBe(true);
  });

  test("critique and experiment_planning modes stay deterministic", () => {
    const critique = runHsiScientificCompanionTurn({
      authorization: HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL,
      mode: "critique",
      question: "Which SSc mechanisms require investigation?",
      createdAt: "2026-11-21T23:00:00Z",
    });
    expect(critique.replyMarkdown).toContain("Companion critique");
    expect(critique.falsificationSummary?.branchCount).toBeGreaterThan(0);
    expect(critique.honesty.voiceEnabled).toBe(false);

    const experiments = runHsiScientificCompanionTurn({
      authorization: HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL,
      mode: "experiment_planning",
      question: "Which SSc mechanisms require investigation?",
      createdAt: "2026-11-21T23:00:00Z",
    });
    expect(experiments.replyMarkdown).toContain("experiment planning");
    expect(experiments.citations.some((c) => c.kind === "falsification_test")).toBe(true);
    expect(experiments.honesty.networkingMatchingEnabled).toBe(false);
  });

  test("runtime refuses without canonical owner approval", () => {
    expect(() =>
      runHsiScientificCompanionTurn({
        authorization: {
          ...HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL,
          approvedAt: "2099-01-01",
        },
        mode: "discuss",
        question: "Which SSc mechanisms require investigation?",
      }),
    ).toThrow("approval");
  });

  test("docs and route shell keep Phase 2 honesty", () => {
    const doc = readFileSync(
      join(
        import.meta.dir,
        "../docs/engineering/HSI_U41_SCIENTIFIC_COMPANION_TEXT_FIRST_2026-11-21.md",
      ),
      "utf8",
    );
    expect(doc).toContain("text-first");
    expect(doc).toContain("Phase 2");
    expect(doc).toContain("avatar");
    const page = readFileSync(
      join(import.meta.dir, "../site/src/pages/ScientificCompanion.tsx"),
      "utf8",
    );
    expect(page).toContain("Scientific Companion");
    expect(page).toContain("runHsiScientificCompanionTurn");
    expect(page).not.toMatch(/Nuance|avatar video|WebRTC/i);
  });
});
