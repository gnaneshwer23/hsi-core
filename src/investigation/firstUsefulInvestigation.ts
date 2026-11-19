/**
 * First useful investigation milestone — audit §H product metric.
 * Records the first device-local usefulness rating of "useful".
 * Does not invent aggregate conversion, pilot success, or journey completion.
 * Browser-safe (no Node-only imports).
 */

export const FIRST_USEFUL_KEY = "hsi-first-useful-investigation-v1";
export const FIRST_USEFUL_SCHEMA = "hsi-first-useful-investigation-1" as const;

export type FirstUsefulHonesty = {
  browserLocalOnly: true;
  productionWritesEnabled: false;
  inventsAggregateConversion: false;
  inventsActivationFunnel: false;
  journeyCompleteClaimed: false;
  pilotConversionClaimed: false;
  scientificApproval: false;
};

export const FIRST_USEFUL_HONESTY: FirstUsefulHonesty = {
  browserLocalOnly: true,
  productionWritesEnabled: false,
  inventsAggregateConversion: false,
  inventsActivationFunnel: false,
  journeyCompleteClaimed: false,
  pilotConversionClaimed: false,
  scientificApproval: false,
};

export type FirstUsefulRecord = {
  briefHash: string;
  question: string;
  ratedAt: string;
  rating: "useful";
  scientificApproval: false;
};

export type FirstUsefulStore = {
  schemaVersion: typeof FIRST_USEFUL_SCHEMA;
  honesty: FirstUsefulHonesty;
  first: FirstUsefulRecord | null;
};

export type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type FirstUsefulMilestone = {
  schemaVersion: typeof FIRST_USEFUL_SCHEMA;
  honesty: FirstUsefulHonesty;
  reached: boolean;
  record: FirstUsefulRecord | null;
  note: string;
};

export function assertFirstUsefulHonesty(honesty: FirstUsefulHonesty): FirstUsefulHonesty {
  if (honesty.browserLocalOnly !== true) throw Error("browserLocalOnly must be true");
  if (honesty.productionWritesEnabled !== false) {
    throw Error("productionWritesEnabled must be false");
  }
  if (honesty.inventsAggregateConversion !== false) {
    throw Error("inventsAggregateConversion must be false");
  }
  if (honesty.inventsActivationFunnel !== false) {
    throw Error("inventsActivationFunnel must be false");
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

export function emptyFirstUsefulStore(): FirstUsefulStore {
  return {
    schemaVersion: FIRST_USEFUL_SCHEMA,
    honesty: assertFirstUsefulHonesty(FIRST_USEFUL_HONESTY),
    first: null,
  };
}

function parseStore(raw: string | null): FirstUsefulStore {
  if (!raw || raw.length > 50_000) return emptyFirstUsefulStore();
  try {
    const x = JSON.parse(raw) as FirstUsefulStore;
    if (
      !x ||
      x.schemaVersion !== FIRST_USEFUL_SCHEMA ||
      x.honesty?.browserLocalOnly !== true ||
      x.honesty?.productionWritesEnabled !== false ||
      x.honesty?.inventsAggregateConversion !== false ||
      x.honesty?.inventsActivationFunnel !== false ||
      x.honesty?.journeyCompleteClaimed !== false ||
      x.honesty?.pilotConversionClaimed !== false ||
      x.honesty?.scientificApproval !== false
    ) {
      return emptyFirstUsefulStore();
    }
    const first = x.first;
    if (
      first &&
      typeof first.briefHash === "string" &&
      first.briefHash.trim() &&
      typeof first.question === "string" &&
      typeof first.ratedAt === "string" &&
      first.rating === "useful" &&
      first.scientificApproval === false
    ) {
      return {
        schemaVersion: FIRST_USEFUL_SCHEMA,
        honesty: FIRST_USEFUL_HONESTY,
        first: {
          briefHash: first.briefHash.trim().slice(0, 64),
          question: first.question.slice(0, 500),
          ratedAt: first.ratedAt.slice(0, 40),
          rating: "useful",
          scientificApproval: false,
        },
      };
    }
    return emptyFirstUsefulStore();
  } catch {
    return emptyFirstUsefulStore();
  }
}

export function loadFirstUsefulStore(store: Store | null): FirstUsefulStore {
  if (!store) return emptyFirstUsefulStore();
  try {
    return parseStore(store.getItem(FIRST_USEFUL_KEY));
  } catch {
    return emptyFirstUsefulStore();
  }
}

export type RecordFirstUsefulInput = {
  briefHash: string;
  question: string;
  rating: "useful" | "partially_useful" | "not_useful";
  now?: string;
};

export type RecordFirstUsefulResult =
  | { ok: true; store: FirstUsefulStore; recorded: boolean }
  | { ok: false; store: FirstUsefulStore; error: string };

/**
 * Record the first useful rating only. Later ratings do not overwrite.
 * Non-useful ratings never set the milestone.
 */
export function recordFirstUsefulInvestigation(
  storage: Store | null,
  input: RecordFirstUsefulInput,
): RecordFirstUsefulResult {
  const honesty = assertFirstUsefulHonesty(FIRST_USEFUL_HONESTY);
  if (input.rating !== "useful") {
    return { ok: true, store: loadFirstUsefulStore(storage), recorded: false };
  }
  const briefHash = input.briefHash.trim().slice(0, 64);
  if (!briefHash) {
    return {
      ok: false,
      store: emptyFirstUsefulStore(),
      error: "Missing briefHash — cannot record first useful investigation",
    };
  }
  if (!storage) {
    return {
      ok: false,
      store: emptyFirstUsefulStore(),
      error: "No browser storage",
    };
  }
  const current = loadFirstUsefulStore(storage);
  if (current.first) {
    return { ok: true, store: current, recorded: false };
  }
  const store: FirstUsefulStore = {
    schemaVersion: FIRST_USEFUL_SCHEMA,
    honesty,
    first: {
      briefHash,
      question: input.question.trim().slice(0, 500) || "Untitled investigation",
      ratedAt: input.now ?? new Date().toISOString(),
      rating: "useful",
      scientificApproval: false,
    },
  };
  try {
    storage.setItem(FIRST_USEFUL_KEY, JSON.stringify(store));
    return { ok: true, store, recorded: true };
  } catch {
    return {
      ok: false,
      store: current,
      error: "This browser blocked local saving",
    };
  }
}

export function buildFirstUsefulMilestone(store: FirstUsefulStore): FirstUsefulMilestone {
  const honesty = assertFirstUsefulHonesty(FIRST_USEFUL_HONESTY);
  const reached = Boolean(store.first);
  return {
    schemaVersion: FIRST_USEFUL_SCHEMA,
    honesty,
    reached,
    record: store.first,
    note: reached
      ? "First useful investigation recorded on this device — not a conversion rate, not pilot success, not journey complete."
      : "Rate an investigation as Useful after the brief to mark the first useful milestone locally.",
  };
}
