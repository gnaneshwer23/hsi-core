import { describe, expect, test } from "bun:test";
import {
  REPEAT_USAGE_HONESTY,
  REPEAT_USAGE_SCHEMA,
  assertRepeatUsageHonesty,
  buildRepeatUsageMilestone,
  emptyRepeatUsageStore,
  loadRepeatUsageStore,
  recordRepeatUsageReopen,
} from "../src/investigation/repeatUsageMilestone";

function memoryStore(seed?: string): Storage {
  const map = new Map<string, string>();
  if (seed) map.set("hsi-repeat-usage-milestone-v1", seed);
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
    key() {
      return null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

describe("repeat usage milestone", () => {
  test("keeps fail-closed honesty", () => {
    const honesty = assertRepeatUsageHonesty(REPEAT_USAGE_HONESTY);
    expect(honesty.browserLocalOnly).toBe(true);
    expect(honesty.productionWritesEnabled).toBe(false);
    expect(honesty.inventsRetentionMetrics).toBe(false);
    expect(honesty.inventsAggregateConversion).toBe(false);
    expect(honesty.journeyCompleteClaimed).toBe(false);
    expect(honesty.pilotConversionClaimed).toBe(false);
    expect(honesty.scientificApproval).toBe(false);
  });

  test("stays unreached before a reopen", () => {
    const milestone = buildRepeatUsageMilestone(emptyRepeatUsageStore());
    expect(milestone.schemaVersion).toBe(REPEAT_USAGE_SCHEMA);
    expect(milestone.reached).toBe(false);
    expect(milestone.note).toContain("Reopen a browser-saved investigation");
  });

  test("records the first reopen once without inventing retention metrics", () => {
    const storage = memoryStore();
    const first = recordRepeatUsageReopen(storage, {
      briefHash: "abc123def456abc123def456abc123de",
      question: "Does IL-21 differ across contexts?",
      now: "2026-11-19T15:30:00.000Z",
    });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.recorded).toBe(true);

    const second = recordRepeatUsageReopen(storage, {
      briefHash: "ffffffffffffffffffffffffffffffff",
      question: "Another question",
      now: "2026-11-19T16:00:00.000Z",
    });
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.recorded).toBe(false);
    expect(second.store.firstReopen?.briefHash).toBe("abc123def456abc123def456abc123de");

    const milestone = buildRepeatUsageMilestone(loadRepeatUsageStore(storage));
    expect(milestone.reached).toBe(true);
    expect(milestone.note).toContain("not a retention rate");
    expect(milestone.honesty.inventsRetentionMetrics).toBe(false);
  });
});
