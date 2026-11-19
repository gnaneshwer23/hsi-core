import { describe, expect, test } from "bun:test";
import {
  WILLINGNESS_TO_PAY_HONESTY,
  WILLINGNESS_TO_PAY_SCHEMA,
  assertWillingnessToPayHonesty,
  buildWillingnessToPayMilestone,
  emptyWillingnessToPayStore,
  loadWillingnessToPayStore,
  recordWillingnessToPay,
} from "../src/investigation/willingnessToPayMilestone";

function memoryStore(seed?: string): Storage {
  const map = new Map<string, string>();
  if (seed) map.set("hsi-willingness-to-pay-milestone-v1", seed);
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

describe("willingness to pay milestone", () => {
  test("keeps fail-closed honesty", () => {
    const honesty = assertWillingnessToPayHonesty(WILLINGNESS_TO_PAY_HONESTY);
    expect(honesty.browserLocalOnly).toBe(true);
    expect(honesty.productionWritesEnabled).toBe(false);
    expect(honesty.inventsAggregateConversion).toBe(false);
    expect(honesty.inventsRevenue).toBe(false);
    expect(honesty.checkoutEnabled).toBe(false);
    expect(honesty.journeyCompleteClaimed).toBe(false);
    expect(honesty.pilotConversionClaimed).toBe(false);
    expect(honesty.scientificApproval).toBe(false);
  });

  test("stays unreached before an answer", () => {
    const milestone = buildWillingnessToPayMilestone(emptyWillingnessToPayStore());
    expect(milestone.schemaVersion).toBe(WILLINGNESS_TO_PAY_SCHEMA);
    expect(milestone.reached).toBe(false);
    expect(milestone.note).toContain("State Yes / No / Maybe");
  });

  test("ignores skipped answers and records the first stated signal once", () => {
    const storage = memoryStore();
    const skipped = recordWillingnessToPay(storage, {
      briefHash: "abc123def456abc123def456abc123de",
      question: "Does IL-21 differ across contexts?",
      answer: null,
    });
    expect(skipped.ok).toBe(true);
    if (!skipped.ok) return;
    expect(skipped.recorded).toBe(false);
    expect(buildWillingnessToPayMilestone(skipped.store).reached).toBe(false);

    const first = recordWillingnessToPay(storage, {
      briefHash: "abc123def456abc123def456abc123de",
      question: "Does IL-21 differ across contexts?",
      answer: "maybe",
      now: "2026-11-19T15:45:00.000Z",
    });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.recorded).toBe(true);

    const second = recordWillingnessToPay(storage, {
      briefHash: "ffffffffffffffffffffffffffffffff",
      question: "Another question",
      answer: "yes",
      now: "2026-11-19T16:00:00.000Z",
    });
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.recorded).toBe(false);
    expect(second.store.first?.answer).toBe("maybe");

    const milestone = buildWillingnessToPayMilestone(loadWillingnessToPayStore(storage));
    expect(milestone.reached).toBe(true);
    expect(milestone.note).toContain("not revenue");
    expect(milestone.honesty.pilotConversionClaimed).toBe(false);
    expect(milestone.honesty.checkoutEnabled).toBe(false);
  });
});
