import { describe, expect, test } from "bun:test";
import {
  STAGE2_COMPLETION_HONESTY,
  STAGE2_COMPLETION_SCHEMA,
  assertStage2CompletionHonesty,
  buildStage2CompletionChecklist,
} from "../src/investigation/stage2CompletionChecklist";

const base = {
  briefHash: null as string | null,
  hasRun: false,
  candidateCount: 0,
  hasPassportOrDisagreement: false,
  hasGapsOrTestable: false,
  briefAvailable: false,
  savedOrReopened: false,
  usefulnessRated: false,
};

describe("stage 2 completion checklist", () => {
  test("keeps fail-closed honesty even when all items are done", () => {
    const honesty = assertStage2CompletionHonesty(STAGE2_COMPLETION_HONESTY);
    expect(honesty.journeyCompleteClaimed).toBe(false);
    expect(honesty.scientificApproval).toBe(false);
    expect(honesty.productionWritesEnabled).toBe(false);
    expect(honesty.inventsAggregateConversion).toBe(false);
    expect(honesty.pilotAccepted).toBe(false);
    expect(honesty.localProgressOnly).toBe(true);

    const done = buildStage2CompletionChecklist({
      briefHash: "a".repeat(64),
      hasRun: true,
      candidateCount: 3,
      hasPassportOrDisagreement: true,
      hasGapsOrTestable: true,
      briefAvailable: true,
      savedOrReopened: true,
      usefulnessRated: true,
    });
    expect(done.schemaVersion).toBe(STAGE2_COMPLETION_SCHEMA);
    expect(done.allLocalItemsDone).toBe(true);
    expect(done.doneCount).toBe(done.totalCount);
    expect(done.honesty.journeyCompleteClaimed).toBe(false);
    expect(done.note).toContain("journey complete claimed: false");
  });

  test("starts empty before a run", () => {
    const checklist = buildStage2CompletionChecklist(base);
    expect(checklist.doneCount).toBe(0);
    expect(checklist.allLocalItemsDone).toBe(false);
    expect(checklist.note).toContain("briefHash");
  });

  test("advances through local Stage 2 items without inventing conversion", () => {
    const mid = buildStage2CompletionChecklist({
      ...base,
      briefHash: "abc123",
      hasRun: true,
      candidateCount: 2,
      briefAvailable: true,
    });
    expect(mid.doneCount).toBe(3);
    expect(mid.items.find((i) => i.id === "ask_run")?.done).toBe(true);
    expect(mid.items.find((i) => i.id === "evidence")?.done).toBe(true);
    expect(mid.items.find((i) => i.id === "brief")?.done).toBe(true);
    expect(mid.items.find((i) => i.id === "usefulness")?.done).toBe(false);
    expect(mid.honesty.inventsAggregateConversion).toBe(false);
  });
});
