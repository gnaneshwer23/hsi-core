import { describe, expect, test } from "bun:test";
import {
  HOME_LOCAL_METRICS_HONESTY,
  HOME_LOCAL_METRICS_SUMMARY_SCHEMA,
  assertHomeLocalMetricsHonesty,
  buildHomeLocalMetricsSummary,
} from "../src/investigation/homeLocalMetricsSummary";
import { ACTIVATION_KEY, ACTIVATION_SCHEMA, ACTIVATION_HONESTY } from "../src/investigation/activationMilestone";

function memoryStore(seed: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(seed));
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

describe("home local metrics summary", () => {
  test("keeps fail-closed honesty", () => {
    const honesty = assertHomeLocalMetricsHonesty(HOME_LOCAL_METRICS_HONESTY);
    expect(honesty.browserLocalOnly).toBe(true);
    expect(honesty.productionWritesEnabled).toBe(false);
    expect(honesty.inventsAggregateConversion).toBe(false);
    expect(honesty.inventsConversionRate).toBe(false);
    expect(honesty.inventsPilotReady).toBe(false);
    expect(honesty.journeyCompleteClaimed).toBe(false);
  });

  test("reports 0/4 and unset alert when storage is empty", () => {
    const summary = buildHomeLocalMetricsSummary({
      storage: memoryStore(),
      cadence: "off",
    });
    expect(summary.schemaVersion).toBe(HOME_LOCAL_METRICS_SUMMARY_SCHEMA);
    expect(summary.localDoneCount).toBe(0);
    expect(summary.localTotalCount).toBe(4);
    expect(summary.alertPreferenceSet).toBe(false);
    expect(summary.subtitle).toContain("0 of 4 first steps done");
    expect(summary.subtitle).toContain("alert preference unset");
    expect(summary.subtitle).toContain("kept in this browser only, not usage analytics");
    expect(summary.honesty.inventsConversionRate).toBe(false);
  });

  test("counts activation done without inventing conversion", () => {
    const summary = buildHomeLocalMetricsSummary({
      storage: memoryStore({
        [ACTIVATION_KEY]: JSON.stringify({
          schemaVersion: ACTIVATION_SCHEMA,
          honesty: ACTIVATION_HONESTY,
          first: {
            briefHash: "a".repeat(64),
            question: "Why IL-21?",
            activatedAt: "2026-11-19T12:00:00.000Z",
            scientificApproval: false,
          },
        }),
      }),
      cadence: "weekly",
    });
    expect(summary.localDoneCount).toBe(1);
    expect(summary.alertPreferenceSet).toBe(true);
    expect(summary.subtitle).toContain("1 of 4 first steps done");
    expect(summary.subtitle).toContain("alert preference set");
    expect(summary.subtitle).not.toMatch(/%/);
  });

  test("marks milestones unknown when storage is unavailable", () => {
    const summary = buildHomeLocalMetricsSummary({
      storage: null,
      cadence: "daily",
    });
    expect(summary.storageAvailable).toBe(false);
    expect(summary.localDoneCount).toBe(0);
    expect(summary.alertPreferenceSet).toBe(false);
    expect(summary.subtitle).toContain("First steps unknown in this browser");
    expect(summary.subtitle).not.toContain("alert preference");
    expect(summary.subtitle).toContain("not usage analytics");
  });
});
