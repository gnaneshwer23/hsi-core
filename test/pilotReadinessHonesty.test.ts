import { describe, expect, test } from "bun:test";
import {
  PILOT_READINESS_HONESTY,
  PILOT_READINESS_SCHEMA,
  assertPilotReadinessHonesty,
  buildPilotReadinessChecklist,
} from "../src/investigation/pilotReadinessHonesty";

describe("pilot readiness honesty", () => {
  test("keeps fail-closed honesty", () => {
    const honesty = assertPilotReadinessHonesty(PILOT_READINESS_HONESTY);
    expect(honesty.browserLocalOnly).toBe(true);
    expect(honesty.productionWritesEnabled).toBe(false);
    expect(honesty.inventsPilotReady).toBe(false);
    expect(honesty.inventsPilotConversion).toBe(false);
    expect(honesty.inventsAggregateConversion).toBe(false);
    expect(honesty.journeyCompleteClaimed).toBe(false);
    expect(honesty.scientificApproval).toBe(false);
    expect(honesty.localSignalsOnly).toBe(true);
  });

  test("reports open local signals without claiming pilot ready", () => {
    const checklist = buildPilotReadinessChecklist({
      activationReached: false,
      firstUsefulReached: false,
      repeatReopenReached: false,
      willingnessStated: false,
    });
    expect(checklist.schemaVersion).toBe(PILOT_READINESS_SCHEMA);
    expect(checklist.localDoneCount).toBe(0);
    expect(checklist.localTotalCount).toBe(4);
    expect(checklist.allLocalSignalsDone).toBe(false);
    expect(checklist.pilotReadyClaimed).toBe(false);
    expect(checklist.blockedGates.every((g) => g.blocked)).toBe(true);
    expect(checklist.note).toContain("not pilot conversion");
  });

  test("keeps pilotReadyClaimed false even when every local signal is done", () => {
    const checklist = buildPilotReadinessChecklist({
      activationReached: true,
      firstUsefulReached: true,
      repeatReopenReached: true,
      willingnessStated: true,
    });
    expect(checklist.allLocalSignalsDone).toBe(true);
    expect(checklist.localDoneCount).toBe(4);
    expect(checklist.pilotReadyClaimed).toBe(false);
    expect(checklist.honesty.inventsPilotReady).toBe(false);
    expect(checklist.note).toContain("pilot ready claimed: false");
    expect(checklist.blockedGates).toHaveLength(7);
    expect(checklist.blockedGates.some((g) => g.id === "staging_grants")).toBe(true);
    expect(checklist.blockedGates.some((g) => g.id === "production_writes")).toBe(true);
  });
});
