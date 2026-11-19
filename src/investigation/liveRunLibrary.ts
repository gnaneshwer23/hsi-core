/**
 * Browser-local library of live investigation runs for USP C save/reopen.
 * Keeps the legacy single-slot LIVE_RUN_KEY as the "current" body while
 * indexing up to LIVE_RUN_LIBRARY_LIMIT bodies under BODY_PREFIX.
 * No server writes. No org sharing.
 */

export const LIVE_RUN_KEY = "hsi-live-investigation-v1";
export const LIVE_RUN_LIBRARY_KEY = "hsi-live-investigation-library-v1";
export const LIVE_RUN_LIBRARY_SCHEMA = "hsi-live-run-library-1" as const;
export const LIVE_RUN_LIBRARY_LIMIT = 8;
export const LIVE_RUN_BODY_PREFIX = "hsi-live-run-body-v1:";

export type LiveRunLibraryHonesty = {
  browserSaveOnly: true;
  productionWritesEnabled: false;
  orgSharingBlocked: true;
  scientificApproval: false;
};

export const LIVE_RUN_LIBRARY_HONESTY: LiveRunLibraryHonesty = {
  browserSaveOnly: true,
  productionWritesEnabled: false,
  orgSharingBlocked: true,
  scientificApproval: false,
};

export type LiveRunLibraryEntry = {
  id: string;
  briefHash: string;
  scenarioId: string;
  question: string;
  savedAt: string;
  candidateCount: number;
  supporting: number;
  opposing: number;
  checked: number;
  scientificApproval: false;
};

export type LiveRunLibrary = {
  schemaVersion: typeof LIVE_RUN_LIBRARY_SCHEMA;
  honesty: LiveRunLibraryHonesty;
  entries: LiveRunLibraryEntry[];
};

export type LiveRunLike = {
  question: string;
  scenarioId: string;
  briefHash: string;
  candidates: readonly {
    polarity?: string;
    verification?: string;
  }[];
};

export type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function emptyLiveRunLibrary(): LiveRunLibrary {
  return {
    schemaVersion: LIVE_RUN_LIBRARY_SCHEMA,
    honesty: LIVE_RUN_LIBRARY_HONESTY,
    entries: [],
  };
}

export function summariseLiveRun(run: LiveRunLike): Omit<LiveRunLibraryEntry, "id" | "savedAt"> {
  const c = run.candidates;
  return {
    briefHash: run.briefHash,
    scenarioId: run.scenarioId,
    question: run.question.slice(0, 500),
    candidateCount: c.length,
    supporting: c.filter((y) => y.polarity === "supporting" && y.verification !== "not_run").length,
    opposing: c.filter((y) => y.polarity === "opposing" && y.verification !== "not_run").length,
    checked: c.filter((y) => y.verification && y.verification !== "not_run").length,
    scientificApproval: false,
  };
}

export function entryIdForRun(run: Pick<LiveRunLike, "briefHash" | "scenarioId">): string {
  const hash = run.briefHash.trim();
  if (/^[a-f0-9]{16,64}$/i.test(hash)) return hash.slice(0, 64);
  return `${run.scenarioId}:${hash}`.slice(0, 120);
}

function parseLibrary(raw: string | null): LiveRunLibrary {
  if (!raw || raw.length > 500_000) return emptyLiveRunLibrary();
  try {
    const x = JSON.parse(raw) as LiveRunLibrary;
    if (
      !x ||
      x.schemaVersion !== LIVE_RUN_LIBRARY_SCHEMA ||
      !Array.isArray(x.entries) ||
      x.honesty?.browserSaveOnly !== true ||
      x.honesty?.productionWritesEnabled !== false ||
      x.honesty?.orgSharingBlocked !== true ||
      x.honesty?.scientificApproval !== false
    ) {
      return emptyLiveRunLibrary();
    }
    const entries = x.entries
      .filter(
        (e): e is LiveRunLibraryEntry =>
          !!e &&
          typeof e.id === "string" &&
          typeof e.briefHash === "string" &&
          typeof e.scenarioId === "string" &&
          typeof e.question === "string" &&
          typeof e.savedAt === "string" &&
          Number.isFinite(e.candidateCount) &&
          e.scientificApproval === false,
      )
      .slice(0, LIVE_RUN_LIBRARY_LIMIT);
    return { schemaVersion: LIVE_RUN_LIBRARY_SCHEMA, honesty: LIVE_RUN_LIBRARY_HONESTY, entries };
  } catch {
    return emptyLiveRunLibrary();
  }
}

export function loadLiveRunLibrary(store: Store | null): LiveRunLibrary {
  if (!store) return emptyLiveRunLibrary();
  try {
    return parseLibrary(store.getItem(LIVE_RUN_LIBRARY_KEY));
  } catch {
    return emptyLiveRunLibrary();
  }
}

function writeLibrary(store: Store, library: LiveRunLibrary): boolean {
  try {
    store.setItem(LIVE_RUN_LIBRARY_KEY, JSON.stringify(library));
    return true;
  } catch {
    return false;
  }
}

/** Save run as current slot + library entry/body. Returns false if storage blocked. */
export function saveLiveRunToLibrary(
  store: Store | null,
  run: LiveRunLike,
  nowIso: string = new Date().toISOString(),
): { ok: boolean; entry: LiveRunLibraryEntry | null; library: LiveRunLibrary; error?: string } {
  if (!store) {
    return {
      ok: false,
      entry: null,
      library: emptyLiveRunLibrary(),
      error: "No browser storage",
    };
  }
  if (
    typeof run.question !== "string" ||
    typeof run.scenarioId !== "string" ||
    typeof run.briefHash !== "string" ||
    !Array.isArray(run.candidates)
  ) {
    return {
      ok: false,
      entry: null,
      library: loadLiveRunLibrary(store),
      error: "Invalid run",
    };
  }

  const id = entryIdForRun(run);
  const summary = summariseLiveRun(run);
  const entry: LiveRunLibraryEntry = {
    id,
    savedAt: nowIso,
    ...summary,
  };

  try {
    const body = JSON.stringify(run);
    if (body.length > 1_800_000) {
      return {
        ok: false,
        entry: null,
        library: loadLiveRunLibrary(store),
        error: "Run too large for browser storage",
      };
    }
    store.setItem(LIVE_RUN_KEY, body);
    store.setItem(LIVE_RUN_BODY_PREFIX + id, body);
  } catch {
    return {
      ok: false,
      entry: null,
      library: loadLiveRunLibrary(store),
      error: "This browser blocked local saving",
    };
  }

  const prev = loadLiveRunLibrary(store);
  const rest = prev.entries.filter((e) => e.id !== id);
  const library: LiveRunLibrary = {
    schemaVersion: LIVE_RUN_LIBRARY_SCHEMA,
    honesty: LIVE_RUN_LIBRARY_HONESTY,
    entries: [entry, ...rest].slice(0, LIVE_RUN_LIBRARY_LIMIT),
  };

  // Drop bodies that fell out of the index.
  const keep = new Set(library.entries.map((e) => e.id));
  for (const old of prev.entries) {
    if (!keep.has(old.id)) {
      try {
        store.removeItem(LIVE_RUN_BODY_PREFIX + old.id);
      } catch {
        /* ignore */
      }
    }
  }

  if (!writeLibrary(store, library)) {
    return {
      ok: false,
      entry: null,
      library: prev,
      error: "This browser blocked local saving",
    };
  }
  return { ok: true, entry, library };
}

export function loadLiveRunBody(store: Store | null, id: string): LiveRunLike | null {
  if (!store || !id) return null;
  try {
    const raw = store.getItem(LIVE_RUN_BODY_PREFIX + id);
    const fallback = store.getItem(LIVE_RUN_KEY);
    const text = raw ?? (fallback && entryIdFromRaw(fallback) === id ? fallback : null);
    if (!text || text.length > 2_000_000) return null;
    const x = JSON.parse(text) as LiveRunLike;
    if (
      !x ||
      typeof x.question !== "string" ||
      typeof x.scenarioId !== "string" ||
      typeof x.briefHash !== "string" ||
      !Array.isArray(x.candidates)
    ) {
      return null;
    }
    return x;
  } catch {
    return null;
  }
}

function entryIdFromRaw(raw: string): string | null {
  try {
    const x = JSON.parse(raw) as LiveRunLike;
    if (!x?.briefHash || !x?.scenarioId) return null;
    return entryIdForRun(x);
  } catch {
    return null;
  }
}

/** Promote a library body into the current LIVE_RUN_KEY slot. */
export function reopenLiveRunFromLibrary(
  store: Store | null,
  id: string,
): { ok: boolean; run: LiveRunLike | null; error?: string } {
  const run = loadLiveRunBody(store, id);
  if (!run || !store) {
    return { ok: false, run: null, error: "Saved run not found in this browser" };
  }
  try {
    store.setItem(LIVE_RUN_KEY, JSON.stringify(run));
    return { ok: true, run };
  } catch {
    return { ok: false, run: null, error: "This browser blocked local storage" };
  }
}

/** Seed library index from legacy single-slot save when library is empty. */
export function migrateLegacyLiveRunIntoLibrary(store: Store | null): LiveRunLibrary {
  const library = loadLiveRunLibrary(store);
  if (!store || library.entries.length > 0) return library;
  try {
    const raw = store.getItem(LIVE_RUN_KEY);
    if (!raw) return library;
    const run = JSON.parse(raw) as LiveRunLike;
    const saved = saveLiveRunToLibrary(store, run);
    return saved.library;
  } catch {
    return library;
  }
}
