/**
 * Stage 3 researcher alert preference honesty.
 * Cadence stays a device-local preference. Live email/push delivery is not
 * enabled — engagement means preference changes recorded in this browser only.
 * Browser-safe (no Node-only imports).
 */

export const ALERT_PREFERENCE_KEY = "hsi-alert-preference-engagement-v1";
export const ALERT_PREFERENCE_SCHEMA = "hsi-alert-preference-honesty-1" as const;
export const ALERT_PREFERENCE_EVENT_LIMIT = 40;

export type AlertCadence = "off" | "weekly" | "daily";

export type AlertPreferenceHonesty = {
  preferenceOnly: true;
  liveDeliveryEnabled: false;
  emailDeliveryClaimed: false;
  inventsOpenRates: false;
  productionWritesEnabled: false;
  usp: "C";
};

export const ALERT_PREFERENCE_HONESTY: AlertPreferenceHonesty = {
  preferenceOnly: true,
  liveDeliveryEnabled: false,
  emailDeliveryClaimed: false,
  inventsOpenRates: false,
  productionWritesEnabled: false,
  usp: "C",
};

export type AlertPreferenceEvent = {
  at: string;
  from: AlertCadence;
  to: AlertCadence;
};

export type AlertPreferenceEngagementStore = {
  schemaVersion: typeof ALERT_PREFERENCE_SCHEMA;
  honesty: AlertPreferenceHonesty;
  events: AlertPreferenceEvent[];
};

export type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type AlertPreferencePanelState = {
  schemaVersion: typeof ALERT_PREFERENCE_SCHEMA;
  honesty: AlertPreferenceHonesty;
  cadence: AlertCadence;
  preferenceEngaged: boolean;
  engagementCount: number;
  lastChangedAt: string | null;
  radarRefreshMode: "manual_open_only" | "preference_weekly" | "preference_daily";
  note: string;
};

export function assertAlertPreferenceHonesty(
  honesty: AlertPreferenceHonesty,
): AlertPreferenceHonesty {
  if (honesty.preferenceOnly !== true) throw Error("preferenceOnly must be true");
  if (honesty.liveDeliveryEnabled !== false) throw Error("liveDeliveryEnabled must be false");
  if (honesty.emailDeliveryClaimed !== false) throw Error("emailDeliveryClaimed must be false");
  if (honesty.inventsOpenRates !== false) throw Error("inventsOpenRates must be false");
  if (honesty.productionWritesEnabled !== false) {
    throw Error("productionWritesEnabled must be false");
  }
  if (honesty.usp !== "C") throw Error("usp must be C");
  return honesty;
}

export function emptyAlertPreferenceEngagement(): AlertPreferenceEngagementStore {
  return {
    schemaVersion: ALERT_PREFERENCE_SCHEMA,
    honesty: assertAlertPreferenceHonesty(ALERT_PREFERENCE_HONESTY),
    events: [],
  };
}

function isCadence(x: unknown): x is AlertCadence {
  return x === "off" || x === "weekly" || x === "daily";
}

function parseEngagement(raw: string | null): AlertPreferenceEngagementStore {
  if (!raw || raw.length > 100_000) return emptyAlertPreferenceEngagement();
  try {
    const x = JSON.parse(raw) as AlertPreferenceEngagementStore;
    if (
      !x ||
      x.schemaVersion !== ALERT_PREFERENCE_SCHEMA ||
      !Array.isArray(x.events) ||
      x.honesty?.preferenceOnly !== true ||
      x.honesty?.liveDeliveryEnabled !== false ||
      x.honesty?.emailDeliveryClaimed !== false ||
      x.honesty?.inventsOpenRates !== false ||
      x.honesty?.productionWritesEnabled !== false ||
      x.honesty?.usp !== "C"
    ) {
      return emptyAlertPreferenceEngagement();
    }
    const events: AlertPreferenceEvent[] = [];
    for (const e of x.events.slice(0, ALERT_PREFERENCE_EVENT_LIMIT)) {
      if (
        !e ||
        typeof e.at !== "string" ||
        !isCadence(e.from) ||
        !isCadence(e.to)
      ) {
        continue;
      }
      events.push({ at: e.at.slice(0, 40), from: e.from, to: e.to });
    }
    return {
      schemaVersion: ALERT_PREFERENCE_SCHEMA,
      honesty: ALERT_PREFERENCE_HONESTY,
      events,
    };
  } catch {
    return emptyAlertPreferenceEngagement();
  }
}

export function loadAlertPreferenceEngagement(
  store: Store | null,
): AlertPreferenceEngagementStore {
  if (!store) return emptyAlertPreferenceEngagement();
  try {
    return parseEngagement(store.getItem(ALERT_PREFERENCE_KEY));
  } catch {
    return emptyAlertPreferenceEngagement();
  }
}

export type RecordAlertPreferenceChangeResult =
  | { ok: true; store: AlertPreferenceEngagementStore }
  | { ok: false; store: AlertPreferenceEngagementStore; error: string };

/** Record a local cadence preference change — not an email open or delivery. */
export function recordAlertPreferenceChange(
  storage: Store | null,
  input: { from: AlertCadence; to: AlertCadence; now?: string },
): RecordAlertPreferenceChangeResult {
  const honesty = assertAlertPreferenceHonesty(ALERT_PREFERENCE_HONESTY);
  if (!isCadence(input.from) || !isCadence(input.to)) {
    return {
      ok: false,
      store: loadAlertPreferenceEngagement(storage),
      error: "Invalid cadence preference",
    };
  }
  if (input.from === input.to) {
    return { ok: true, store: loadAlertPreferenceEngagement(storage) };
  }
  if (!storage) {
    return {
      ok: false,
      store: emptyAlertPreferenceEngagement(),
      error: "No browser storage",
    };
  }
  const current = loadAlertPreferenceEngagement(storage);
  const event: AlertPreferenceEvent = {
    at: input.now ?? new Date().toISOString(),
    from: input.from,
    to: input.to,
  };
  const store: AlertPreferenceEngagementStore = {
    schemaVersion: ALERT_PREFERENCE_SCHEMA,
    honesty,
    events: [event, ...current.events].slice(0, ALERT_PREFERENCE_EVENT_LIMIT),
  };
  try {
    storage.setItem(ALERT_PREFERENCE_KEY, JSON.stringify(store));
    return { ok: true, store };
  } catch {
    return {
      ok: false,
      store: current,
      error: "This browser blocked local saving",
    };
  }
}

export function buildAlertPreferencePanel(input: {
  cadence: AlertCadence;
  engagement: AlertPreferenceEngagementStore;
}): AlertPreferencePanelState {
  const honesty = assertAlertPreferenceHonesty(ALERT_PREFERENCE_HONESTY);
  const cadence = isCadence(input.cadence) ? input.cadence : "off";
  const engagementCount = input.engagement.events.length;
  const lastChangedAt = input.engagement.events[0]?.at ?? null;
  const radarRefreshMode =
    cadence === "daily"
      ? "preference_daily"
      : cadence === "weekly"
        ? "preference_weekly"
        : "manual_open_only";
  return {
    schemaVersion: ALERT_PREFERENCE_SCHEMA,
    honesty,
    cadence,
    preferenceEngaged: engagementCount > 0 || cadence !== "off",
    engagementCount,
    lastChangedAt,
    radarRefreshMode,
    note:
      cadence === "off"
        ? "Alert preference is off. Research radar still refreshes when you open HSI — email delivery is not available."
        : `Cadence preference: ${cadence}. This guides how often you intend to check the radar — live email/push delivery is not enabled.`,
  };
}
