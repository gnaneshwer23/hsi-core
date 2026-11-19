/**
 * Willingness-to-pay milestone — audit §H product metric / pilot signal.
 * Records the first device-local yes/no/maybe answer. Does not invent
 * conversion rates, revenue, checkout, or pilot success.
 * Browser-safe (no Node-only imports).
 */

export const WILLINGNESS_TO_PAY_KEY = "hsi-willingness-to-pay-milestone-v1";
export const WILLINGNESS_TO_PAY_SCHEMA = "hsi-willingness-to-pay-milestone-1" as const;

export type WillingnessToPayAnswer = "yes" | "no" | "maybe";

export type WillingnessToPayHonesty = {
  browserLocalOnly: true;
  productionWritesEnabled: false;
  inventsAggregateConversion: false;
  inventsRevenue: false;
  checkoutEnabled: false;
  journeyCompleteClaimed: false;
  pilotConversionClaimed: false;
  scientificApproval: false;
};

export const WILLINGNESS_TO_PAY_HONESTY: WillingnessToPayHonesty = {
  browserLocalOnly: true,
  productionWritesEnabled: false,
  inventsAggregateConversion: false,
  inventsRevenue: false,
  checkoutEnabled: false,
  journeyCompleteClaimed: false,
  pilotConversionClaimed: false,
  scientificApproval: false,
};

export type WillingnessToPayRecord = {
  briefHash: string;
  question: string;
  answer: WillingnessToPayAnswer;
  answeredAt: string;
  scientificApproval: false;
};

export type WillingnessToPayStore = {
  schemaVersion: typeof WILLINGNESS_TO_PAY_SCHEMA;
  honesty: WillingnessToPayHonesty;
  first: WillingnessToPayRecord | null;
};

export type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type WillingnessToPayMilestone = {
  schemaVersion: typeof WILLINGNESS_TO_PAY_SCHEMA;
  honesty: WillingnessToPayHonesty;
  reached: boolean;
  record: WillingnessToPayRecord | null;
  note: string;
};

export function assertWillingnessToPayHonesty(
  honesty: WillingnessToPayHonesty,
): WillingnessToPayHonesty {
  if (honesty.browserLocalOnly !== true) throw Error("browserLocalOnly must be true");
  if (honesty.productionWritesEnabled !== false) {
    throw Error("productionWritesEnabled must be false");
  }
  if (honesty.inventsAggregateConversion !== false) {
    throw Error("inventsAggregateConversion must be false");
  }
  if (honesty.inventsRevenue !== false) throw Error("inventsRevenue must be false");
  if (honesty.checkoutEnabled !== false) throw Error("checkoutEnabled must be false");
  if (honesty.journeyCompleteClaimed !== false) {
    throw Error("journeyCompleteClaimed must be false");
  }
  if (honesty.pilotConversionClaimed !== false) {
    throw Error("pilotConversionClaimed must be false");
  }
  if (honesty.scientificApproval !== false) throw Error("scientificApproval must be false");
  return honesty;
}

export function emptyWillingnessToPayStore(): WillingnessToPayStore {
  return {
    schemaVersion: WILLINGNESS_TO_PAY_SCHEMA,
    honesty: assertWillingnessToPayHonesty(WILLINGNESS_TO_PAY_HONESTY),
    first: null,
  };
}

function isAnswer(x: unknown): x is WillingnessToPayAnswer {
  return x === "yes" || x === "no" || x === "maybe";
}

function parseStore(raw: string | null): WillingnessToPayStore {
  if (!raw || raw.length > 50_000) return emptyWillingnessToPayStore();
  try {
    const x = JSON.parse(raw) as WillingnessToPayStore;
    if (
      !x ||
      x.schemaVersion !== WILLINGNESS_TO_PAY_SCHEMA ||
      x.honesty?.browserLocalOnly !== true ||
      x.honesty?.productionWritesEnabled !== false ||
      x.honesty?.inventsAggregateConversion !== false ||
      x.honesty?.inventsRevenue !== false ||
      x.honesty?.checkoutEnabled !== false ||
      x.honesty?.journeyCompleteClaimed !== false ||
      x.honesty?.pilotConversionClaimed !== false ||
      x.honesty?.scientificApproval !== false
    ) {
      return emptyWillingnessToPayStore();
    }
    const first = x.first;
    if (
      first &&
      typeof first.briefHash === "string" &&
      first.briefHash.trim() &&
      typeof first.question === "string" &&
      isAnswer(first.answer) &&
      typeof first.answeredAt === "string" &&
      first.scientificApproval === false
    ) {
      return {
        schemaVersion: WILLINGNESS_TO_PAY_SCHEMA,
        honesty: WILLINGNESS_TO_PAY_HONESTY,
        first: {
          briefHash: first.briefHash.trim().slice(0, 64),
          question: first.question.slice(0, 500),
          answer: first.answer,
          answeredAt: first.answeredAt.slice(0, 40),
          scientificApproval: false,
        },
      };
    }
    return emptyWillingnessToPayStore();
  } catch {
    return emptyWillingnessToPayStore();
  }
}

export function loadWillingnessToPayStore(store: Store | null): WillingnessToPayStore {
  if (!store) return emptyWillingnessToPayStore();
  try {
    return parseStore(store.getItem(WILLINGNESS_TO_PAY_KEY));
  } catch {
    return emptyWillingnessToPayStore();
  }
}

export type RecordWillingnessToPayInput = {
  briefHash: string;
  question: string;
  answer: WillingnessToPayAnswer | null;
  now?: string;
};

export type RecordWillingnessToPayResult =
  | { ok: true; store: WillingnessToPayStore; recorded: boolean }
  | { ok: false; store: WillingnessToPayStore; error: string };

/**
 * Record the first stated willingness answer only. Null/skipped answers do not
 * set the milestone. Later answers do not overwrite.
 */
export function recordWillingnessToPay(
  storage: Store | null,
  input: RecordWillingnessToPayInput,
): RecordWillingnessToPayResult {
  const honesty = assertWillingnessToPayHonesty(WILLINGNESS_TO_PAY_HONESTY);
  if (!input.answer) {
    return { ok: true, store: loadWillingnessToPayStore(storage), recorded: false };
  }
  if (!isAnswer(input.answer)) {
    return {
      ok: false,
      store: emptyWillingnessToPayStore(),
      error: "Invalid willingness answer",
    };
  }
  const briefHash = input.briefHash.trim().slice(0, 64);
  if (!briefHash) {
    return {
      ok: false,
      store: emptyWillingnessToPayStore(),
      error: "Missing briefHash — cannot record willingness to pay",
    };
  }
  if (!storage) {
    return {
      ok: false,
      store: emptyWillingnessToPayStore(),
      error: "No browser storage",
    };
  }
  const current = loadWillingnessToPayStore(storage);
  if (current.first) {
    return { ok: true, store: current, recorded: false };
  }
  const store: WillingnessToPayStore = {
    schemaVersion: WILLINGNESS_TO_PAY_SCHEMA,
    honesty,
    first: {
      briefHash,
      question: input.question.trim().slice(0, 500) || "Untitled investigation",
      answer: input.answer,
      answeredAt: input.now ?? new Date().toISOString(),
      scientificApproval: false,
    },
  };
  try {
    storage.setItem(WILLINGNESS_TO_PAY_KEY, JSON.stringify(store));
    return { ok: true, store, recorded: true };
  } catch {
    return {
      ok: false,
      store: current,
      error: "This browser blocked local saving",
    };
  }
}

export function buildWillingnessToPayMilestone(
  store: WillingnessToPayStore,
): WillingnessToPayMilestone {
  const honesty = assertWillingnessToPayHonesty(WILLINGNESS_TO_PAY_HONESTY);
  const reached = Boolean(store.first);
  return {
    schemaVersion: WILLINGNESS_TO_PAY_SCHEMA,
    honesty,
    reached,
    record: store.first,
    note: reached
      ? "First willingness-to-pay signal recorded on this device — not revenue, not checkout, not pilot conversion."
      : "State Yes / No / Maybe after a brief to mark the first willingness-to-pay milestone locally.",
  };
}
