/**
 * N1 gut–immune–T2D bibliographic candidate queue.
 * Materialises expansion DOI pointers into an explicit import/review queue.
 * Queue membership is not scientific approval.
 */
export type N1Candidate = {
  queueId: string;
  sourceId: string;
  doi: string;
  requestedTitle: string;
  requestedUrl: string;
  expansionKey: string | null;
  modelAnnotation: string | null;
  designAnnotation: string | null;
  outcomeAnnotation: string | null;
  limitations: string | null;
  priorIdentityStatus: "bibliographic_candidate_not_retrieved";
  priorRights: "unverified";
};

export type N1CandidateQueue = {
  schemaVersion: "hsi-n1-candidate-queue-1";
  programme: "gut_immune_t2d";
  phase: "N1";
  scientificApproval: false;
  graphPromotable: false;
  claimEntailmentAssessed: false;
  candidates: N1Candidate[];
};

const DOI = /^10\.\d{4,9}\/\S+$/;
const QUEUE_ID = /^N1-C-\d{2}$/;

function text(v: unknown, max: number): v is string {
  return typeof v === "string" && v.trim().length > 0 && v.length <= max && !/[\u0000-\u0008]/.test(v);
}

function exact(value: unknown, keys: string[]): void {
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).sort().join("|") !== [...keys].sort().join("|")) {
    throw new Error("Invalid N1 candidate queue shape");
  }
}

export function parseN1CandidateQueue(value: unknown): N1CandidateQueue {
  exact(value, [
    "schemaVersion",
    "programme",
    "phase",
    "scientificApproval",
    "graphPromotable",
    "claimEntailmentAssessed",
    "candidates",
  ]);
  const q = value as N1CandidateQueue;
  if (
    q.schemaVersion !== "hsi-n1-candidate-queue-1" ||
    q.programme !== "gut_immune_t2d" ||
    q.phase !== "N1" ||
    q.scientificApproval !== false ||
    q.graphPromotable !== false ||
    q.claimEntailmentAssessed !== false ||
    !Array.isArray(q.candidates) ||
    q.candidates.length !== 12
  ) {
    throw new Error("N1 queue must contain exactly 12 gut–immune–T2D candidates without approval flags");
  }
  const ids = new Set<string>();
  const dois = new Set<string>();
  for (const c of q.candidates) {
    exact(c, [
      "queueId",
      "sourceId",
      "doi",
      "requestedTitle",
      "requestedUrl",
      "expansionKey",
      "modelAnnotation",
      "designAnnotation",
      "outcomeAnnotation",
      "limitations",
      "priorIdentityStatus",
      "priorRights",
    ]);
    if (!QUEUE_ID.test(c.queueId) || ids.has(c.queueId)) throw new Error("Invalid or duplicate N1 queueId");
    ids.add(c.queueId);
    if (!text(c.sourceId, 220) || !c.sourceId.startsWith("doi:") || c.sourceId !== `doi:${c.doi}`) throw new Error("Invalid N1 sourceId");
    if (!DOI.test(c.doi) || dois.has(c.doi.toLowerCase())) throw new Error("Invalid or duplicate N1 DOI");
    dois.add(c.doi.toLowerCase());
    if (!text(c.requestedTitle, 3000) || c.requestedUrl !== `https://doi.org/${c.doi}`) throw new Error("Invalid N1 title/url");
    if (c.priorIdentityStatus !== "bibliographic_candidate_not_retrieved" || c.priorRights !== "unverified") {
      throw new Error("N1 candidates must start as unreverified bibliographic pointers");
    }
    for (const k of ["expansionKey", "modelAnnotation", "designAnnotation", "outcomeAnnotation", "limitations"] as const) {
      if (c[k] !== null && !text(c[k], 4000)) throw new Error(`Invalid N1 field ${k}`);
    }
  }
  return q;
}

/** Build the reviewable queue from domain-graph expansion.sources. */
export function materializeN1QueueFromExpansion(expansion: unknown): N1CandidateQueue {
  if (!expansion || typeof expansion !== "object" || Array.isArray(expansion)) throw new Error("Invalid expansion seed");
  const sources = (expansion as {sources?: unknown}).sources;
  if (!Array.isArray(sources) || sources.length !== 12) throw new Error("Expansion must expose exactly 12 bibliographic candidates");
  const candidates: N1Candidate[] = sources.map((raw, index) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Invalid expansion source");
    const s = raw as Record<string, unknown>;
    const doi = typeof s.doi === "string" ? s.doi : "";
    const title = typeof s.title === "string" ? s.title : "";
    const id = typeof s.id === "string" ? s.id : "";
    const url = typeof s.url === "string" ? s.url : "";
    if (s.identityStatus !== "bibliographic_candidate_not_retrieved" || s.rights !== "unverified") {
      throw new Error("Expansion source is not an unreverified bibliographic candidate");
    }
    if (s.passage !== null && s.passage !== undefined) throw new Error("Bibliographic candidates must not carry invented passage text");
    return {
      queueId: `N1-C-${String(index + 1).padStart(2, "0")}`,
      sourceId: id,
      doi,
      requestedTitle: title,
      requestedUrl: url,
      expansionKey: typeof s.key === "string" ? s.key : null,
      modelAnnotation: typeof s.model === "string" ? s.model : null,
      designAnnotation: typeof s.design === "string" ? s.design : null,
      outcomeAnnotation: typeof s.outcome === "string" ? s.outcome : null,
      limitations: typeof s.limitations === "string" ? s.limitations : null,
      priorIdentityStatus: "bibliographic_candidate_not_retrieved",
      priorRights: "unverified",
    };
  });
  return parseN1CandidateQueue({
    schemaVersion: "hsi-n1-candidate-queue-1",
    programme: "gut_immune_t2d",
    phase: "N1",
    scientificApproval: false,
    graphPromotable: false,
    claimEntailmentAssessed: false,
    candidates,
  });
}
