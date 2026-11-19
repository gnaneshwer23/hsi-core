/**
 * Activation milestone — audit §H product metric (first live investigation).
 * Records the first successful device-local live run. Does not invent
 * activation funnels, conversion rates, or pilot success.
 * Browser-safe (no Node-only imports).
 */

export const ACTIVATION_KEY = "hsi-activation-milestone-v1";
export const ACTIVATION_SCHEMA = "hsi-activation-milestone-1" as const;

export type ActivationHonesty = {
  browserLocalOnly: true;
  productionWritesEnabled: false;
  inventsActivationFunnel: false;
  inventsAggregateConversion: false;
  journeyCompleteClaimed: false;
  pilotConversionClaimed: false;
  scientificApproval: false;
};

export const ACTIVATION_HONESTY: ActivationHonesty = {
  browserLocalOnly: true,
  productionWritesEnabled: false,
  inventsActivationFunnel: false,
  inventsAggregateConversion: false,
  journeyCompleteClaimed: false,
  pilotConversionClaimed: false,
  scientificApproval: false,
};

export type ActivationRecord = {
  briefHash: string;
  question: string;
  activatedAt: string;
  scientificApproval: false;
};

export type ActivationStore = {
  schemaVersion: typeof ACTIVATION_SCHEMA;
  honesty: ActivationHonesty;
  first: ActivationRecord | null;
};

export type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type ActivationMilestone = {
  schemaVersion: typeof ACTIVATION_SCHEMA;
  honesty: ActivationHonesty;
  reached: boolean;
  record: ActivationRecord | null;
  note: string;
};

export function assertActivationHonesty(honesty: ActivationHonesty): ActivationHonesty {
  if (honesty.browserLocalOnly !== true) throw Error("browserLocalOnly must be true");
  if (honesty.productionWritesEnabled !== false) {
    throw Error("productionWritesEnabled must be false");
  }
  if (honesty.inventsActivationFunnel !== false) {
    throw Error("inventsActivationFunnel must be false");
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

export function emptyActivationStore(): ActivationStore {
  return {
    schemaVersion: ACTIVATION_SCHEMA,
    honesty: assertActivationHonesty(ACTIVATION_HONESTY),
    first: null,
  };
}

function parseStore(raw: string | null): ActivationStore {
  if (!raw || raw.length > 50_000) return emptyActivationStore();
  try {
    const x = JSON.parse(raw) as ActivationStore;
    if (
      !x ||
      x.schemaVersion !== ACTIVATION_SCHEMA ||
      x.honesty?.browserLocalOnly !== true ||
      x.honesty?.productionWritesEnabled !== false ||
      x.honesty?.inventsActivationFunnel !== false ||
      x.honesty?.inventsAggregateConversion !== false ||
      x.honesty?.journeyCompleteClaimed !== false ||
      x.honesty?.pilotConversionClaimed !== false ||
      x.honesty?.scientificApproval !== false
    ) {
      return emptyActivationStore();
    }
    const first = x.first;
    if (
      first &&
      typeof first.briefHash === "string" &&
      first.briefHash.trim() &&
      typeof first.question === "string" &&
      typeof first.activatedAt === "string" &&
      first.scientificApproval === false
    ) {
      return {
        schemaVersion: ACTIVATION_SCHEMA,
        honesty: ACTIVATION_HONESTY,
        first: {
          briefHash: first.briefHash.trim().slice(0, 64),
          question: first.question.slice(0, 500),
          activatedAt: first.activatedAt.slice(0, 40),
          scientificApproval: false,
        },
      };
    }
    return emptyActivationStore();
  } catch {
    return emptyActivationStore();
  }
}

export function loadActivationStore(store: Store | null): ActivationStore {
  if (!store) return emptyActivationStore();
  try {
    return parseStore(store.getItem(ACTIVATION_KEY));
  } catch {
    return emptyActivationStore();
  }
}

export type RecordActivationInput = {
  briefHash: string;
  question: string;
  now?: string;
};

export type RecordActivationResult =
  | { ok: true; store: ActivationStore; recorded: boolean }
  | { ok: false; store: ActivationStore; error: string };

/** First-write-wins record of a successful live run — not an activation funnel. */
export function recordActivation(
  storage: Store | null,
  input: RecordActivationInput,
): RecordActivationResult {
  const honesty = assertActivationHonesty(ACTIVATION_HONESTY);
  const briefHash = input.briefHash.trim().slice(0, 64);
  if (!briefHash) {
    return {
      ok: false,
      store: emptyActivationStore(),
      error: "Missing briefHash — cannot record activation",
    };
  }
  if (!storage) {
    return {
      ok: false,
      store: emptyActivationStore(),
      error: "No browser storage",
    };
  }
  const current = loadActivationStore(storage);
  if (current.first) {
    return { ok: true, store: current, recorded: false };
  }
  const store: ActivationStore = {
    schemaVersion: ACTIVATION_SCHEMA,
    honesty,
    first: {
      briefHash,
      question: input.question.trim().slice(0, 500) || "Untitled investigation",
      activatedAt: input.now ?? new Date().toISOString(),
      scientificApproval: false,
    },
  };
  try {
    storage.setItem(ACTIVATION_KEY, JSON.stringify(store));
    return { ok: true, store, recorded: true };
  } catch {
    return {
      ok: false,
      store: current,
      error: "This browser blocked local saving",
    };
  }
}

export function buildActivationMilestone(store: ActivationStore): ActivationMilestone {
  const honesty = assertActivationHonesty(ACTIVATION_HONESTY);
  const reached = Boolean(store.first);
  return {
    schemaVersion: ACTIVATION_SCHEMA,
    honesty,
    reached,
    record: store.first,
    note: reached
      ? "First live investigation recorded on this device — not an activation funnel, not conversion, not pilot success."
      : "Run a live investigation to mark the first activation milestone locally.",
  };
}
