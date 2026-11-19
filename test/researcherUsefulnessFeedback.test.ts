import { describe, expect, test } from "bun:test";
import {
  RESEARCHER_USEFULNESS_HONESTY,
  RESEARCHER_USEFULNESS_SCHEMA,
  assertResearcherUsefulnessHonesty,
  buildResearcherUsefulnessPanel,
  emptyResearcherUsefulnessStore,
  getUsefulnessForBrief,
  loadResearcherUsefulnessStore,
  saveResearcherUsefulness,
} from "../src/investigation/researcherUsefulnessFeedback";

function memoryStore(seed?: string): Storage {
  const map = new Map<string, string>();
  if (seed) map.set("hsi-researcher-usefulness-v1", seed);
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

describe("researcher usefulness feedback", () => {
  test("keeps fail-closed honesty", () => {
    const honesty = assertResearcherUsefulnessHonesty(RESEARCHER_USEFULNESS_HONESTY);
    expect(honesty.browserLocalOnly).toBe(true);
    expect(honesty.productionWritesEnabled).toBe(false);
    expect(honesty.inventsAggregateConversion).toBe(false);
    expect(honesty.scientificApproval).toBe(false);
    expect(honesty.journeyCompleteClaimed).toBe(false);
    expect(honesty.pilotConversionClaimed).toBe(false);
  });

  test("stays not ready without a briefHash", () => {
    const panel = buildResearcherUsefulnessPanel({
      briefHash: null,
      store: emptyResearcherUsefulnessStore(),
    });
    expect(panel.schemaVersion).toBe(RESEARCHER_USEFULNESS_SCHEMA);
    expect(panel.ready).toBe(false);
    expect(panel.existing).toBeNull();
  });

  test("saves and reloads rating for the same briefHash without inventing aggregates", () => {
    const storage = memoryStore();
    const saved = saveResearcherUsefulness(storage, {
      briefHash: "abc123def456abc123def456abc123de",
      question: "Does IL-21 link Tfh expansion across contexts?",
      rating: "useful",
      willingness: "maybe",
      now: "2026-11-19T14:00:00.000Z",
    });
    expect(saved.ok).toBe(true);
    if (!saved.ok) return;

    const loaded = loadResearcherUsefulnessStore(storage);
    expect(loaded.honesty.inventsAggregateConversion).toBe(false);
    expect(loaded.entries).toHaveLength(1);

    const entry = getUsefulnessForBrief(loaded, "abc123def456abc123def456abc123de");
    expect(entry?.rating).toBe("useful");
    expect(entry?.willingness).toBe("maybe");
    expect(entry?.scientificApproval).toBe(false);

    const panel = buildResearcherUsefulnessPanel({
      briefHash: "abc123def456abc123def456abc123de",
      store: loaded,
    });
    expect(panel.ready).toBe(true);
    expect(panel.existing?.rating).toBe("useful");
  });

  test("upserts the same briefHash and rejects missing storage", () => {
    const storage = memoryStore();
    saveResearcherUsefulness(storage, {
      briefHash: "hash1hash1hash1hash1hash1hash1ha",
      question: "Q1",
      rating: "not_useful",
      willingness: null,
      now: "2026-11-19T14:00:00.000Z",
    });
    const again = saveResearcherUsefulness(storage, {
      briefHash: "hash1hash1hash1hash1hash1hash1ha",
      question: "Q1 updated",
      rating: "partially_useful",
      willingness: "no",
      now: "2026-11-19T15:00:00.000Z",
    });
    expect(again.ok).toBe(true);
    if (!again.ok) return;
    expect(again.store.entries).toHaveLength(1);
    expect(again.entry.rating).toBe("partially_useful");
    expect(again.entry.willingness).toBe("no");

    const blocked = saveResearcherUsefulness(null, {
      briefHash: "hash1hash1hash1hash1hash1hash1ha",
      question: "Q1",
      rating: "useful",
      willingness: "yes",
    });
    expect(blocked.ok).toBe(false);
    if (blocked.ok) return;
    expect(blocked.error).toContain("No browser storage");
  });
});
