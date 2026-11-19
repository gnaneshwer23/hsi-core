import { describe, expect, test } from "bun:test";
import {
  ACTIVATION_HONESTY,
  ACTIVATION_SCHEMA,
  assertActivationHonesty,
  buildActivationMilestone,
  emptyActivationStore,
  loadActivationStore,
  recordActivation,
} from "../src/investigation/activationMilestone";

function memoryStore(seed?: string): Storage {
  const map = new Map<string, string>();
  if (seed) map.set("hsi-activation-milestone-v1", seed);
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

describe("activation milestone", () => {
  test("keeps fail-closed honesty", () => {
    const honesty = assertActivationHonesty(ACTIVATION_HONESTY);
    expect(honesty.browserLocalOnly).toBe(true);
    expect(honesty.productionWritesEnabled).toBe(false);
    expect(honesty.inventsActivationFunnel).toBe(false);
    expect(honesty.inventsAggregateConversion).toBe(false);
    expect(honesty.journeyCompleteClaimed).toBe(false);
    expect(honesty.pilotConversionClaimed).toBe(false);
    expect(honesty.scientificApproval).toBe(false);
  });

  test("stays unreached before a live run", () => {
    const milestone = buildActivationMilestone(emptyActivationStore());
    expect(milestone.schemaVersion).toBe(ACTIVATION_SCHEMA);
    expect(milestone.reached).toBe(false);
    expect(milestone.note).toContain("Run a live investigation");
  });

  test("records the first successful live run once without inventing a funnel", () => {
    const storage = memoryStore();
    const first = recordActivation(storage, {
      briefHash: "abc123def456abc123def456abc123de",
      question: "Does IL-21 differ across contexts?",
      now: "2026-11-19T15:50:00.000Z",
    });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.recorded).toBe(true);

    const second = recordActivation(storage, {
      briefHash: "ffffffffffffffffffffffffffffffff",
      question: "Another question",
      now: "2026-11-19T16:00:00.000Z",
    });
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.recorded).toBe(false);
    expect(second.store.first?.briefHash).toBe("abc123def456abc123def456abc123de");

    const milestone = buildActivationMilestone(loadActivationStore(storage));
    expect(milestone.reached).toBe(true);
    expect(milestone.note).toContain("not an activation funnel");
    expect(milestone.honesty.inventsActivationFunnel).toBe(false);
  });
});
