import { describe, expect, test } from "bun:test";
import type { UnifiedJourneyStepId } from "../src/investigation/unifiedJourneyTrail";
import { workspaceTrailNavActions } from "../src/investigation/workspaceTrailNavigation";

const ALL_IDS: readonly UnifiedJourneyStepId[] = [
  "ask",
  "evidence",
  "passport",
  "disagreement",
  "crossDomain",
  "gaps",
  "brief",
  "save",
];

describe("workspaceTrailNavActions", () => {
  test("covers every unified step with at least one action", () => {
    for (const id of ALL_IDS) {
      expect(workspaceTrailNavActions(id).length).toBeGreaterThan(0);
    }
  });

  test("passport selects first claim then scrolls to verification", () => {
    expect(workspaceTrailNavActions("passport")).toEqual([
      { kind: "selectFirstClaim" },
      { kind: "scroll", elementId: "ws-vf-h" },
    ]);
  });

  test("disagreement opens USP fold, selects first comparison, scrolls to Why differ", () => {
    expect(workspaceTrailNavActions("disagreement")).toEqual([
      { kind: "openDetails", elementId: "ws-usp-panels" },
      { kind: "selectFirstComparison" },
      { kind: "scroll", elementId: "ws-disagree-h" },
    ]);
  });

  test("gaps opens gaps fold", () => {
    expect(workspaceTrailNavActions("gaps")).toEqual([
      { kind: "openDetails", elementId: "ws-gaps-testable" },
      { kind: "scroll", elementId: "ws-gp-h" },
    ]);
  });

  test("brief opens brief then scrolls", () => {
    expect(workspaceTrailNavActions("brief")).toEqual([
      { kind: "openBrief" },
      { kind: "scroll", elementId: "ws-brief-panel" },
    ]);
  });
});
