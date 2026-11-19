/**
 * Repeat usage milestone — audit §H product metric (saved/reopened).
 * Records the first device-local reopen of a browser-saved investigation.
 * Does not invent retention rates, DAU, or pilot conversion.
 * Browser-safe (no Node-only imports).
 */

export const REPEAT_USAGE_KEY = "hsi-repeat-usage-milestone-v1";
export const REPEAT_USAGE_SCHEMA = "hsi-repeat-usage-milestone-1" as const;

export type RepeatUsageHonesty = {
  browserLocalOnly: true;
  productionWritesEnabled: false;
  inventsRetentionMetrics: false;
  inventsAggregateConversion: false;
  journeyCompleteClaimed: false;
  pilotConversionClaimed: false;
  scientificApproval: false;
};

export const REPEAT_USAGE_HONESTY: RepeatUsageHonesty = {
  browserLocalOnly: true,
  productionWritesEnabled: false,
  inventsRetentionMetrics: false,
  inventsAggregateConversion: false,
  journeyCompleteClaimed: false,
  pilotConversionClaimed: false,
  scientificApproval: false,
};

export type RepeatUsageRecord = {
  briefHash: string;
  question: string;
  reopenedAt: string;
  scientificApproval: false;
};

export type RepeatUsageStore = {
  schemaVersion: typeof REPEAT_USAGE_SCHEMA;
  honesty: RepeatUsageHonesty;
  firstReopen: RepeatUsageRecord | null;
};

export type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type RepeatUsageMilestone = {
  schemaVersion: typeof REPEAT_USAGE_SCHEMA;
  honesty: RepeatUsageHonesty;
  reached: boolean;
  record: RepeatUsageRecord | null;
  note: string;
};

export function assertRepeatUsageHonesty(honesty: RepeatUsageHonesty): RepeatUsageHonesty {
  if (honesty.browserLocalOnly !== true) throw Error("browserLocalOnly must be true");
  if (honesty.productionWritesEnabled !== false) {
    throw Error("productionWritesEnabled must be false");
  }
  if (honesty.inventsRetentionMetrics !== false) {
    throw Error("inventsRetentionMetrics must be false");
  }
  if (honesty.inventsAggregateConversion !== false) {
    throw Error("inventsAggregateConversion must be false");
  }
  if (honesty.journeyCompleteClaimed !== false) {
    throw Error("journeyCompleteClaimed must be false");
  }
  if (honesty.pilotConversionClaimed !== false) {
    throw Error("pilotConversionClaimed must be false");
  }
  if (honesty.scientificApproval !== false) throw Error("scientificApproval must be false");
  return honesty;
}

export function emptyRepeatUsageStore(): RepeatUsageStore {
  return {
    schemaVersion: REPEAT_USAGE_SCHEMA,
    honesty: assertRepeatUsageHonesty(REPEAT_USAGE_HONESTY),
    firstReopen: null,
  };
}

function parseStore(raw: string | null): RepeatUsageStore {
  if (!raw || raw.length > 50_000) return emptyRepeatUsageStore();
  try {
    const x = JSON.parse(raw) as RepeatUsageStore;
    if (
      !x ||
      x.schemaVersion !== REPEAT_USAGE_SCHEMA ||
      x.honesty?.browserLocalOnly !== true ||
      x.honesty?.productionWritesEnabled !== false ||
      x.honesty?.inventsRetentionMetrics !== false ||
      x.honesty?.inventsAggregateConversion !== false ||
      x.honesty?.journeyCompleteClaimed !== false ||
      x.honesty?.pilotConversionClaimed !== false ||
      x.honesty?.scientificApproval !== false
    ) {
      return emptyRepeatUsageStore();
    }
    const first = x.firstReopen;
    if (
      first &&
      typeof first.briefHash === "string" &&
      first.briefHash.trim() &&
      typeof first.question === "string" &&
      typeof first.reopenedAt === "string" &&
      first.scientificApproval === false
    ) {
      return {
        schemaVersion: REPEAT_USAGE_SCHEMA,
        honesty: REPEAT_USAGE_HONESTY,
        firstReopen: {
          briefHash: first.briefHash.trim().slice(0, 64),
          question: first.question.slice(0, 500),
          reopenedAt: first.reopenedAt.slice(0, 40),
          scientificApproval: false,
        },
      };
    }
    return emptyRepeatUsageStore();
  } catch {
    return emptyRepeatUsageStore();
  }
}

export function loadRepeatUsageStore(store: Store | null): RepeatUsageStore {
  if (!store) return emptyRepeatUsageStore();
  try {
    return parseStore(store.getItem(REPEAT_USAGE_KEY));
  } catch {
    return emptyRepeatUsageStore();
  }
}

export type RecordRepeatUsageInput = {
  briefHash: string;
  question: string;
  now?: string;
};

export type RecordRepeatUsageResult =
  | { ok: true; store: RepeatUsageStore; recorded: boolean }
  | { ok: false; store: RepeatUsageStore; error: string };

/** First-write-wins record of a browser reopen — not a retention rate. */
export function recordRepeatUsageReopen(
  storage: Store | null,
  input: RecordRepeatUsageInput,
): RecordRepeatUsageResult {
  const honesty = assertRepeatUsageHonesty(REPEAT_USAGE_HONESTY);
  const briefHash = input.briefHash.trim().slice(0, 64);
  if (!briefHash) {
    return {
      ok: false,
      store: emptyRepeatUsageStore(),
      error: "Missing briefHash — cannot record repeat usage",
    };
  }
  if (!storage) {
    return {
      ok: false,
      store: emptyRepeatUsageStore(),
      error: "No browser storage",
    };
  }
  const current = loadRepeatUsageStore(storage);
  if (current.firstReopen) {
    return { ok: true, store: current, recorded: false };
  }
  const store: RepeatUsageStore = {
    schemaVersion: REPEAT_USAGE_SCHEMA,
    honesty,
    firstReopen: {
      briefHash,
      question: input.question.trim().slice(0, 500) || "Untitled investigation",
      reopenedAt: input.now ?? new Date().toISOString(),
      scientificApproval: false,
    },
  };
  try {
    storage.setItem(REPEAT_USAGE_KEY, JSON.stringify(store));
    return { ok: true, store, recorded: true };
  } catch {
    return {
      ok: false,
      store: current,
      error: "This browser blocked local saving",
    };
  }
}

export function buildRepeatUsageMilestone(store: RepeatUsageStore): RepeatUsageMilestone {
  const honesty = assertRepeatUsageHonesty(REPEAT_USAGE_HONESTY);
  const reached = Boolean(store.firstReopen);
  return {
    schemaVersion: REPEAT_USAGE_SCHEMA,
    honesty,
    reached,
    record: store.firstReopen,
    note: reached
      ? "First reopen recorded on this device — not a retention rate, not DAU, not pilot conversion."
      : "Reopen a browser-saved investigation to mark the first repeat-usage milestone locally.",
  };
}
