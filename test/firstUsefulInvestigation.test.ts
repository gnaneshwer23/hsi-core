import { describe, expect, test } from "bun:test";
import {
  FIRST_USEFUL_HONESTY,
  FIRST_USEFUL_SCHEMA,
  assertFirstUsefulHonesty,
  buildFirstUsefulMilestone,
  emptyFirstUsefulStore,
  loadFirstUsefulStore,
  recordFirstUsefulInvestigation,
} from "../src/investigation/firstUsefulInvestigation";

function memoryStore(seed?: string): Storage {
  const map = new Map<string, string>();
  if (seed) map.set("hsi-first-useful-investigation-v1", seed);
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

describe("first useful investigation", () => {
  test("keeps fail-closed honesty", () => {
    const honesty = assertFirstUsefulHonesty(FIRST_USEFUL_HONESTY);
    expect(honesty.browserLocalOnly).toBe(true);
    expect(honesty.productionWritesEnabled).toBe(false);
    expect(honesty.inventsAggregateConversion).toBe(false);
    expect(honesty.inventsActivationFunnel).toBe(false);
    expect(honesty.journeyCompleteClaimed).toBe(false);
    expect(honesty.pilotConversionClaimed).toBe(false);
    expect(honesty.scientificApproval).toBe(false);
  });

  test("stays unreached until a useful rating is saved", () => {
    const milestone = buildFirstUsefulMilestone(emptyFirstUsefulStore());
    expect(milestone.schemaVersion).toBe(FIRST_USEFUL_SCHEMA);
    expect(milestone.reached).toBe(false);

    const storage = memoryStore();
    const skip = recordFirstUsefulInvestigation(storage, {
      briefHash: "a".repeat(64),
      question: "Q",
      rating: "partially_useful",
    });
    expect(skip.ok).toBe(true);
    if (!skip.ok) return;
    expect(skip.recorded).toBe(false);
    expect(buildFirstUsefulMilestone(skip.store).reached).toBe(false);
  });

  test("records the first useful rating once and never invents conversion", () => {
    const storage = memoryStore();
    const first = recordFirstUsefulInvestigation(storage, {
      briefHash: "abc123def456abc123def456abc123de",
      question: "Does IL-21 differ across contexts?",
      rating: "useful",
      now: "2026-11-19T15:20:00.000Z",
    });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.recorded).toBe(true);
    expect(first.store.first?.rating).toBe("useful");
    expect(first.store.honesty.inventsAggregateConversion).toBe(false);

    const second = recordFirstUsefulInvestigation(storage, {
      briefHash: "ffffffffffffffffffffffffffffffff",
      question: "Another question",
      rating: "useful",
      now: "2026-11-19T16:00:00.000Z",
    });
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.recorded).toBe(false);
    expect(second.store.first?.briefHash).toBe("abc123def456abc123def456abc123de");

    const loaded = loadFirstUsefulStore(storage);
    const milestone = buildFirstUsefulMilestone(loaded);
    expect(milestone.reached).toBe(true);
    expect(milestone.note).toContain("not a conversion rate");
    expect(milestone.honesty.pilotConversionClaimed).toBe(false);
  });
});
