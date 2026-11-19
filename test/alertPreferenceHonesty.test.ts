import { describe, expect, test } from "bun:test";
import {
  ALERT_PREFERENCE_HONESTY,
  ALERT_PREFERENCE_SCHEMA,
  assertAlertPreferenceHonesty,
  buildAlertPreferencePanel,
  emptyAlertPreferenceEngagement,
  loadAlertPreferenceEngagement,
  recordAlertPreferenceChange,
} from "../src/investigation/alertPreferenceHonesty";

function memoryStore(seed?: string): Storage {
  const map = new Map<string, string>();
  if (seed) map.set("hsi-alert-preference-engagement-v1", seed);
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

describe("alert preference honesty", () => {
  test("keeps fail-closed honesty", () => {
    const honesty = assertAlertPreferenceHonesty(ALERT_PREFERENCE_HONESTY);
    expect(honesty.preferenceOnly).toBe(true);
    expect(honesty.liveDeliveryEnabled).toBe(false);
    expect(honesty.emailDeliveryClaimed).toBe(false);
    expect(honesty.inventsOpenRates).toBe(false);
    expect(honesty.productionWritesEnabled).toBe(false);
    expect(honesty.usp).toBe("C");
  });

  test("off cadence stays manual radar with no invented delivery", () => {
    const panel = buildAlertPreferencePanel({
      cadence: "off",
      engagement: emptyAlertPreferenceEngagement(),
    });
    expect(panel.schemaVersion).toBe(ALERT_PREFERENCE_SCHEMA);
    expect(panel.radarRefreshMode).toBe("manual_open_only");
    expect(panel.honesty.liveDeliveryEnabled).toBe(false);
    expect(panel.note).toContain("email delivery is not available");
  });

  test("records preference changes locally without inventing open rates", () => {
    const storage = memoryStore();
    const first = recordAlertPreferenceChange(storage, {
      from: "off",
      to: "weekly",
      now: "2026-11-19T15:00:00.000Z",
    });
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const second = recordAlertPreferenceChange(storage, {
      from: "weekly",
      to: "daily",
      now: "2026-11-19T16:00:00.000Z",
    });
    expect(second.ok).toBe(true);
    if (!second.ok) return;

    const loaded = loadAlertPreferenceEngagement(storage);
    expect(loaded.events).toHaveLength(2);
    expect(loaded.events[0]?.to).toBe("daily");
    expect(loaded.honesty.inventsOpenRates).toBe(false);

    const panel = buildAlertPreferencePanel({ cadence: "daily", engagement: loaded });
    expect(panel.preferenceEngaged).toBe(true);
    expect(panel.engagementCount).toBe(2);
    expect(panel.radarRefreshMode).toBe("preference_daily");
  });

  test("noop same cadence and missing storage stay honest", () => {
    const storage = memoryStore();
    const noop = recordAlertPreferenceChange(storage, { from: "off", to: "off" });
    expect(noop.ok).toBe(true);
    expect(noop.store.events).toHaveLength(0);

    const blocked = recordAlertPreferenceChange(null, { from: "off", to: "weekly" });
    expect(blocked.ok).toBe(false);
    if (blocked.ok) return;
    expect(blocked.error).toContain("No browser storage");
  });
});
