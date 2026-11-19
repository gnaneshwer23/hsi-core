import { describe, expect, test } from "bun:test";
import {
  BLOCKED_JOURNEY_STEPS_HONESTY,
  BLOCKED_JOURNEY_STEPS_SCHEMA,
  assertBlockedJourneyStepsHonesty,
  buildBlockedJourneySteps,
} from "../src/investigation/blockedJourneyStepsHonesty";

describe("blocked journey steps honesty", () => {
  test("keeps fail-closed honesty", () => {
    const honesty = assertBlockedJourneyStepsHonesty(BLOCKED_JOURNEY_STEPS_HONESTY);
    expect(honesty.orgSharingEnabled).toBe(false);
    expect(honesty.collaboratorLinksEnabled).toBe(false);
    expect(honesty.liveSourceRefreshAccepted).toBe(false);
    expect(honesty.priorApprovalsTransfer).toBe(false);
    expect(honesty.inventsSharingAuthority).toBe(false);
    expect(honesty.productionWritesEnabled).toBe(false);
    expect(honesty.scientificApproval).toBe(false);
    expect(honesty.journeyCompleteClaimed).toBe(false);
  });

  test("always exposes steps 12 and 13 as blocked", () => {
    const pack = buildBlockedJourneySteps({
      briefHash: null,
      libraryCount: 0,
      reopenedThisSession: false,
    });
    expect(pack.schemaVersion).toBe(BLOCKED_JOURNEY_STEPS_SCHEMA);
    expect(pack.steps.map((s) => s.stepNumber)).toEqual([12, 13]);
    expect(pack.steps.every((s) => s.status === "blocked")).toBe(true);
    expect(pack.browserReopenAvailable).toBe(false);
    expect(pack.steps[1]?.availableInstead).toContain("Save to the browser library");
  });

  test("points re-evaluation to browser reopen when a library entry exists", () => {
    const pack = buildBlockedJourneySteps({
      briefHash: "a".repeat(64),
      libraryCount: 2,
      reopenedThisSession: false,
    });
    expect(pack.browserReopenAvailable).toBe(true);
    expect(pack.steps[0]?.id).toBe("share_collaborator");
    expect(pack.steps[0]?.availableInstead).toContain("does not create a share link");
    expect(pack.steps[1]?.availableInstead).toContain("same briefHash");
    expect(pack.honesty.liveSourceRefreshAccepted).toBe(false);
    expect(pack.honesty.orgSharingEnabled).toBe(false);
  });
});
