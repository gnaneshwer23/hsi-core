/**
 * Browser-local researcher usefulness feedback after the decision brief.
 * Stage 2 exit metric from the business vision execution audit — measures
 * researcher-rated usefulness + willingness signal without inventing
 * aggregate conversion, pilot claims, or production writes.
 * Browser-safe (no Node-only imports).
 */

export const RESEARCHER_USEFULNESS_KEY = "hsi-researcher-usefulness-v1";
export const RESEARCHER_USEFULNESS_SCHEMA = "hsi-researcher-usefulness-1" as const;
export const RESEARCHER_USEFULNESS_LIMIT = 24;

export type UsefulnessRating = "useful" | "partially_useful" | "not_useful";
export type WillingnessSignal = "yes" | "no" | "maybe";

export type ResearcherUsefulnessHonesty = {
  browserLocalOnly: true;
  productionWritesEnabled: false;
  inventsAggregateConversion: false;
  scientificApproval: false;
  journeyCompleteClaimed: false;
  pilotConversionClaimed: false;
};

export const RESEARCHER_USEFULNESS_HONESTY: ResearcherUsefulnessHonesty = {
  browserLocalOnly: true,
  productionWritesEnabled: false,
  inventsAggregateConversion: false,
  scientificApproval: false,
  journeyCompleteClaimed: false,
  pilotConversionClaimed: false,
};

export type ResearcherUsefulnessEntry = {
  briefHash: string;
  question: string;
  rating: UsefulnessRating;
  willingness: WillingnessSignal | null;
  savedAt: string;
  scientificApproval: false;
};

export type ResearcherUsefulnessStore = {
  schemaVersion: typeof RESEARCHER_USEFULNESS_SCHEMA;
  honesty: ResearcherUsefulnessHonesty;
  entries: ResearcherUsefulnessEntry[];
};

export type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function assertResearcherUsefulnessHonesty(
  honesty: ResearcherUsefulnessHonesty,
): ResearcherUsefulnessHonesty {
  if (honesty.browserLocalOnly !== true) throw Error("browserLocalOnly must be true");
  if (honesty.productionWritesEnabled !== false) {
    throw Error("productionWritesEnabled must be false");
  }
  if (honesty.inventsAggregateConversion !== false) {
    throw Error("inventsAggregateConversion must be false");
  }
  if (honesty.scientificApproval !== false) throw Error("scientificApproval must be false");
  if (honesty.journeyCompleteClaimed !== false) {
    throw Error("journeyCompleteClaimed must be false");
  }
  if (honesty.pilotConversionClaimed !== false) {
    throw Error("pilotConversionClaimed must be false");
  }
  return honesty;
}

export function emptyResearcherUsefulnessStore(): ResearcherUsefulnessStore {
  return {
    schemaVersion: RESEARCHER_USEFULNESS_SCHEMA,
    honesty: assertResearcherUsefulnessHonesty(RESEARCHER_USEFULNESS_HONESTY),
    entries: [],
  };
}

function isRating(x: unknown): x is UsefulnessRating {
  return x === "useful" || x === "partially_useful" || x === "not_useful";
}

function isWillingness(x: unknown): x is WillingnessSignal {
  return x === "yes" || x === "no" || x === "maybe";
}

function parseStore(raw: string | null): ResearcherUsefulnessStore {
  if (!raw || raw.length > 200_000) return emptyResearcherUsefulnessStore();
  try {
    const x = JSON.parse(raw) as ResearcherUsefulnessStore;
    if (
      !x ||
      x.schemaVersion !== RESEARCHER_USEFULNESS_SCHEMA ||
      !Array.isArray(x.entries) ||
      x.honesty?.browserLocalOnly !== true ||
      x.honesty?.productionWritesEnabled !== false ||
      x.honesty?.inventsAggregateConversion !== false ||
      x.honesty?.scientificApproval !== false ||
      x.honesty?.journeyCompleteClaimed !== false ||
      x.honesty?.pilotConversionClaimed !== false
    ) {
      return emptyResearcherUsefulnessStore();
    }
    const entries: ResearcherUsefulnessEntry[] = [];
    for (const e of x.entries.slice(0, RESEARCHER_USEFULNESS_LIMIT)) {
      if (
        !e ||
        typeof e.briefHash !== "string" ||
        !e.briefHash.trim() ||
        typeof e.question !== "string" ||
        !isRating(e.rating) ||
        (e.willingness !== null && !isWillingness(e.willingness)) ||
        typeof e.savedAt !== "string" ||
        e.scientificApproval !== false
      ) {
        continue;
      }
      entries.push({
        briefHash: e.briefHash.trim().slice(0, 64),
        question: e.question.slice(0, 500),
        rating: e.rating,
        willingness: e.willingness,
        savedAt: e.savedAt.slice(0, 40),
        scientificApproval: false,
      });
    }
    return {
      schemaVersion: RESEARCHER_USEFULNESS_SCHEMA,
      honesty: RESEARCHER_USEFULNESS_HONESTY,
      entries,
    };
  } catch {
    return emptyResearcherUsefulnessStore();
  }
}

export function loadResearcherUsefulnessStore(store: Store | null): ResearcherUsefulnessStore {
  if (!store) return emptyResearcherUsefulnessStore();
  try {
    return parseStore(store.getItem(RESEARCHER_USEFULNESS_KEY));
  } catch {
    return emptyResearcherUsefulnessStore();
  }
}

export function getUsefulnessForBrief(
  store: ResearcherUsefulnessStore,
  briefHash: string,
): ResearcherUsefulnessEntry | null {
  const hash = briefHash.trim();
  if (!hash) return null;
  return store.entries.find((e) => e.briefHash === hash) ?? null;
}

export type SaveUsefulnessInput = {
  briefHash: string;
  question: string;
  rating: UsefulnessRating;
  willingness: WillingnessSignal | null;
  now?: string;
};

export type SaveUsefulnessResult =
  | { ok: true; store: ResearcherUsefulnessStore; entry: ResearcherUsefulnessEntry }
  | { ok: false; store: ResearcherUsefulnessStore; error: string };

/** Upsert a device-local usefulness rating for one briefHash version. */
export function saveResearcherUsefulness(
  storage: Store | null,
  input: SaveUsefulnessInput,
): SaveUsefulnessResult {
  const honesty = assertResearcherUsefulnessHonesty(RESEARCHER_USEFULNESS_HONESTY);
  const briefHash = input.briefHash.trim().slice(0, 64);
  if (!briefHash) {
    return {
      ok: false,
      store: emptyResearcherUsefulnessStore(),
      error: "Missing briefHash — cannot record usefulness",
    };
  }
  if (!isRating(input.rating)) {
    return {
      ok: false,
      store: loadResearcherUsefulnessStore(storage),
      error: "Invalid usefulness rating",
    };
  }
  if (input.willingness !== null && !isWillingness(input.willingness)) {
    return {
      ok: false,
      store: loadResearcherUsefulnessStore(storage),
      error: "Invalid willingness signal",
    };
  }
  if (!storage) {
    return {
      ok: false,
      store: emptyResearcherUsefulnessStore(),
      error: "No browser storage",
    };
  }

  const current = loadResearcherUsefulnessStore(storage);
  const entry: ResearcherUsefulnessEntry = {
    briefHash,
    question: input.question.trim().slice(0, 500) || "Untitled investigation",
    rating: input.rating,
    willingness: input.willingness,
    savedAt: input.now ?? new Date().toISOString(),
    scientificApproval: false,
  };
  const others = current.entries.filter((e) => e.briefHash !== briefHash);
  const store: ResearcherUsefulnessStore = {
    schemaVersion: RESEARCHER_USEFULNESS_SCHEMA,
    honesty,
    entries: [entry, ...others].slice(0, RESEARCHER_USEFULNESS_LIMIT),
  };
  try {
    storage.setItem(RESEARCHER_USEFULNESS_KEY, JSON.stringify(store));
    return { ok: true, store, entry };
  } catch {
    return {
      ok: false,
      store: current,
      error: "This browser blocked local saving",
    };
  }
}

export type ResearcherUsefulnessPanelState = {
  schemaVersion: typeof RESEARCHER_USEFULNESS_SCHEMA;
  honesty: ResearcherUsefulnessHonesty;
  briefHash: string | null;
  ready: boolean;
  existing: ResearcherUsefulnessEntry | null;
  note: string;
};

/** Panel state for the current run's brief — no invented aggregates. */
export function buildResearcherUsefulnessPanel(input: {
  briefHash: string | null;
  store: ResearcherUsefulnessStore;
}): ResearcherUsefulnessPanelState {
  const honesty = assertResearcherUsefulnessHonesty(RESEARCHER_USEFULNESS_HONESTY);
  const briefHash = input.briefHash?.trim() || null;
  const existing = briefHash ? getUsefulnessForBrief(input.store, briefHash) : null;
  return {
    schemaVersion: RESEARCHER_USEFULNESS_SCHEMA,
    honesty,
    briefHash,
    ready: Boolean(briefHash),
    existing,
    note: briefHash
      ? existing
        ? "Rating kept in this browser for this briefHash — not a pilot conversion."
        : "Rate this investigation locally. Does not claim journey complete or scientific approval."
      : "Available after a live run produces a briefHash.",
  };
}
