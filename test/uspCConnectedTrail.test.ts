import { describe, expect, test } from "bun:test";
import {
  assertUspCTrailHonesty,
  buildUspCConnectedTrail,
  USP_C_TRAIL_HONESTY,
} from "../src/investigation/uspCConnectedTrail";
import {
  emptyLiveRunLibrary,
  entryIdForRun,
  loadLiveRunLibrary,
  migrateLegacyLiveRunIntoLibrary,
  reopenLiveRunFromLibrary,
  saveLiveRunToLibrary,
  LIVE_RUN_KEY,
  LIVE_RUN_LIBRARY_LIMIT,
  type Store,
} from "../src/investigation/liveRunLibrary";

function memoryStore(seed: Record<string, string> = {}): Store & { data: Record<string, string> } {
  const data = { ...seed };
  return {
    data,
    getItem: (k) => (k in data ? data[k]! : null),
    setItem: (k, v) => {
      data[k] = v;
    },
    removeItem: (k) => {
      delete data[k];
    },
  };
}

const sampleRun = (hash: string, question = "Why IL-21?") => ({
  question,
  scenarioId: "il21-autoimmune",
  briefHash: hash,
  candidates: [
    { polarity: "supporting", verification: "agree_directional" },
    { polarity: "opposing", verification: "agree_directional" },
    { polarity: "uncertain", verification: "not_run" },
  ],
});

describe("USP C connected trail", () => {
  test("keeps fail-closed honesty", () => {
    const honesty = assertUspCTrailHonesty(USP_C_TRAIL_HONESTY);
    expect(honesty.usp).toBe("C");
    expect(honesty.productionWritesEnabled).toBe(false);
    expect(honesty.serverProfileDurableClaimed).toBe(false);
    expect(honesty.orgSharingBlocked).toBe(true);
    expect(honesty.alertsArePreferencesNotLiveDelivery).toBe(true);
    expect(honesty.browserSaveOnly).toBe(true);
  });

  test("starts at profile before onboarding", () => {
    const trail = buildUspCConnectedTrail({
      profileOnboarded: false,
      hasResearchQuestion: false,
      interestCount: 0,
      alertCadence: "off",
      hasRun: false,
      libraryCount: 0,
      savedThisSession: false,
      reopenedThisSession: false,
      briefOpen: false,
    });
    expect(trail.activeStep).toBe("profile");
    expect(trail.steps.map((s) => s.id)).toEqual([
      "profile",
      "workspace",
      "save",
      "reopen",
      "brief",
    ]);
  });

  test("advances through workspace, save, reopen, brief", () => {
    expect(
      buildUspCConnectedTrail({
        profileOnboarded: true,
        hasResearchQuestion: true,
        interestCount: 2,
        alertCadence: "weekly",
        hasRun: false,
        libraryCount: 0,
        savedThisSession: false,
        reopenedThisSession: false,
        briefOpen: false,
      }).activeStep,
    ).toBe("workspace");

    expect(
      buildUspCConnectedTrail({
        profileOnboarded: true,
        hasResearchQuestion: true,
        interestCount: 2,
        alertCadence: "weekly",
        hasRun: true,
        libraryCount: 1,
        savedThisSession: true,
        reopenedThisSession: false,
        briefOpen: false,
      }).activeStep,
    ).toBe("save");

    expect(
      buildUspCConnectedTrail({
        profileOnboarded: true,
        hasResearchQuestion: true,
        interestCount: 2,
        alertCadence: "weekly",
        hasRun: true,
        libraryCount: 1,
        savedThisSession: true,
        reopenedThisSession: true,
        briefOpen: false,
      }).activeStep,
    ).toBe("reopen");

    expect(
      buildUspCConnectedTrail({
        profileOnboarded: true,
        hasResearchQuestion: true,
        interestCount: 2,
        alertCadence: "weekly",
        hasRun: true,
        libraryCount: 1,
        savedThisSession: true,
        reopenedThisSession: true,
        briefOpen: true,
      }).activeStep,
    ).toBe("brief");
  });
});

describe("live run library", () => {
  test("saves and reopens the same briefHash version", () => {
    const store = memoryStore();
    const run = sampleRun("a".repeat(64));
    const saved = saveLiveRunToLibrary(store, run, "2026-11-19T14:00:00.000Z");
    expect(saved.ok).toBe(true);
    expect(saved.library.honesty.productionWritesEnabled).toBe(false);
    expect(saved.library.honesty.orgSharingBlocked).toBe(true);
    expect(saved.entry?.briefHash).toBe(run.briefHash);
    expect(store.getItem(LIVE_RUN_KEY)).toContain(run.question);

    const id = entryIdForRun(run);
    const reopened = reopenLiveRunFromLibrary(store, id);
    expect(reopened.ok).toBe(true);
    expect(reopened.run?.briefHash).toBe(run.briefHash);
  });

  test("caps library size and migrates legacy single slot", () => {
    const store = memoryStore({
      [LIVE_RUN_KEY]: JSON.stringify(sampleRun("b".repeat(64), "legacy")),
    });
    const migrated = migrateLegacyLiveRunIntoLibrary(store);
    expect(migrated.entries).toHaveLength(1);
    expect(migrated.entries[0]?.question).toBe("legacy");

    for (let i = 0; i < LIVE_RUN_LIBRARY_LIMIT + 2; i++) {
      saveLiveRunToLibrary(store, sampleRun(`${i}`.padStart(64, "c"), `q${i}`));
    }
    expect(loadLiveRunLibrary(store).entries.length).toBe(LIVE_RUN_LIBRARY_LIMIT);
  });

  test("empty library honesty", () => {
    const empty = emptyLiveRunLibrary();
    expect(empty.entries).toEqual([]);
    expect(empty.honesty.browserSaveOnly).toBe(true);
  });
});
