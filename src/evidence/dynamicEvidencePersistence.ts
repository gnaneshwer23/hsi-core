/**
 * PR 3 — Persist permitted dynamic-retrieval metadata with dedup identity linking.
 *
 * Extends existing evidence infrastructure (002 sources + search-record tables).
 * Critical honesty:
 * - Record identity ≠ study identity ≠ independent evidence.
 * - Bibliographic / OT metadata never fabricates claim support.
 * - Candidates stay draft / unexplored; graphPromotable=false; no Gate C auto-approve.
 * - Open Targets Europe PMC–derived literature is not automatic independent corroboration.
 * - Restricted full text is never imported here.
 */
import {createHash} from "node:crypto";
import type {HsiCurationReview, HsiGrade, HsiTeachingStatus} from "../grades";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import {
  DYNAMIC_SEARCH_RECORD_SCHEMA,
  type DynamicSearchRecord,
  type PermittedBibliographicMetadata,
  type PermittedOpenTargetsMetadata,
  type SourceIdentityState,
  type ClaimSupportState,
  type ContentAccessState,
} from "./dynamicEvidenceRetrieval";
import {OPEN_TARGETS_PROVIDER} from "./openTargetsLookup";

export const DYNAMIC_PERSISTENCE_SCHEMA = "hsi-dynamic-evidence-persistence-1" as const;
export const DYNAMIC_PERSISTENCE_METHOD = "hsi.dynamic_evidence_persistence.v1" as const;

export type EvidenceIdentityLayer = "record" | "study" | "independent_evidence";

export type IdentityLinkRelation =
  | "same_provider_record"
  | "cross_provider_same_record"
  | "same_study"
  | "cites_or_reviews"
  | "derived_not_independent";

/** Optional human/curator-declared study relationships (never invented from title heuristics alone). */
export type DeclaredStudyRelationship =
  | {
      kind: "preprint_of";
      preprintPmid: string;
      publishedPmid: string;
      sharedDoi?: string | null;
    }
  | {
      kind: "review_cites_primary";
      reviewPmid: string;
      primaryPmid: string;
    }
  | {
      kind: "cross_provider_same_record";
      pmid: string;
      providerA: string;
      providerB: string;
      recordIdA: string;
      recordIdB: string;
    };

export type DynamicCandidateAxes = {
  curationReview: Extract<HsiCurationReview, "draft">;
  hsiGrade: Extract<HsiGrade, "unexplored">;
  teachingStatus: Extract<HsiTeachingStatus, "unknown">;
};

export type DynamicCandidateSource = {
  id: string;
  sourceKind: "publication" | "registry";
  externalId: string;
  title: string;
  sourceUrl: string | null;
  doi: string | null;
  pmid: string | null;
  licenceStatus: "metadata_only";
  retractionStatus: "unknown";
  retrievedAt: string;
  provider: "europe_pmc" | typeof OPEN_TARGETS_PROVIDER;
  responseIdentity: string | null;
  sourceIdentity: SourceIdentityState;
  contentAccess: ContentAccessState;
  claimSupport: ClaimSupportState;
  identityLayer: "provider_record";
  scientificApproval: false;
  graphPromotable: false;
  passageImported: false;
  independentCorroborationOfEuropePmc: false | null;
  axes: DynamicCandidateAxes;
  searchRecordHash: string;
  metadata: Record<string, unknown>;
};

export type DynamicCandidateBinding = {
  sourceId: string;
  role: "bibliographic_candidate" | "open_targets_candidate" | "duplicate_retrieval";
  responseIdentity: string | null;
  pmid: string | null;
  provider: string;
};

export type EvidenceIdentityLink = {
  id: string;
  fromIdentity: string;
  toIdentity: string;
  fromLayer: EvidenceIdentityLayer;
  toLayer: EvidenceIdentityLayer;
  relation: IdentityLinkRelation;
  countsAsIndependentEvidence: boolean;
  rationale: string;
  provenance: Record<string, unknown>;
};

export type DynamicPersistencePlan = {
  schemaVersion: typeof DYNAMIC_PERSISTENCE_SCHEMA;
  method: typeof DYNAMIC_PERSISTENCE_METHOD;
  searchRecord: DynamicSearchRecord;
  searchRecordId: string;
  candidates: DynamicCandidateSource[];
  bindings: DynamicCandidateBinding[];
  identityLinks: EvidenceIdentityLink[];
  honesty: {
    metadataOnly: true;
    claimSupport: ClaimSupportState;
    sourceIdentityDistinctFromClaimSupport: true;
    recordStudyIndependenceDistinct: true;
    passageImportFailClosed: true;
    scientificApproval: false;
    graphPromotable: false;
    gateCAutoApprove: false;
    legalBinding: false;
    cdsPhi: false;
    fixturesAreNotLiveEvidence: true;
    openTargetsNotIndependentEuropePmcCorroboration: true;
    autoPromotedToApprovedGraph: false;
  };
};

export type DynamicPersistResult = {
  searchRecordId: string;
  candidateCount: number;
  bindingCount: number;
  identityLinkCount: number;
  preservedFailures: number;
  preservedDeduped: number;
};

export type DynamicEvidencePersistStore = {
  upsertSearchRecord(plan: DynamicPersistencePlan): Promise<{id: string}>;
  upsertCandidate(candidate: DynamicCandidateSource): Promise<void>;
  upsertBinding(searchRecordId: string, binding: DynamicCandidateBinding): Promise<void>;
  upsertIdentityLink(searchRecordId: string, link: EvidenceIdentityLink): Promise<void>;
  getSearchRecord?(id: string): Promise<DynamicSearchRecord | null>;
  listCandidates?(searchRecordId?: string): Promise<DynamicCandidateSource[]>;
  listBindings?(searchRecordId?: string): Promise<(DynamicCandidateBinding & {searchRecordId: string})[]>;
  listIdentityLinks?(searchRecordId?: string): Promise<(EvidenceIdentityLink & {searchRecordId: string})[]>;
};

const DRAFT_AXES: DynamicCandidateAxes = {
  curationReview: "draft",
  hsiGrade: "unexplored",
  teachingStatus: "unknown",
};

function fail(message: string): never {
  throw new Error(message);
}

function assertPmid(value: string, label: string): string {
  if (!/^\d{1,9}$/.test(value)) fail(`Invalid ${label} PMID`);
  return value;
}

function recordIdentity(pmid: string): string {
  return `pmid:${pmid}`;
}

function studyIdentity(key: string): string {
  return `study:${key}`;
}

function linkId(parts: Record<string, unknown>): string {
  return createHash("sha256").update(canonicalEvidenceJson(parts)).digest("hex");
}

function bibliographicCandidateId(row: PermittedBibliographicMetadata): string {
  if (row.pmid) return recordIdentity(row.pmid);
  if (row.doi) return `doi:${row.doi.toLowerCase()}`;
  return `epmc-response:${row.responseIdentity}`;
}

function openTargetsCandidateId(row: PermittedOpenTargetsMetadata): string {
  return `open_targets:disease:${row.diseaseId}`;
}

function toBibliographicCandidate(
  row: PermittedBibliographicMetadata,
  searchRecordHash: string,
): DynamicCandidateSource {
  if (row.claimSupport !== "not_assessed") fail("Bibliographic candidate fabricated claim support");
  if (row.scientificApproval !== false || row.graphPromotable !== false || row.passageImported !== false) {
    fail("Bibliographic candidate must stay unapproved / non-promotable / metadata-only");
  }
  if (row.contentAccess !== "metadata") fail("Restricted content access refused for persistence");
  const id = bibliographicCandidateId(row);
  return {
    id,
    sourceKind: "publication",
    externalId: row.pmid ?? row.doi ?? row.responseIdentity,
    title: row.title,
    sourceUrl: row.url,
    doi: row.doi,
    pmid: row.pmid,
    licenceStatus: "metadata_only",
    retractionStatus: "unknown",
    retrievedAt: row.retrievedAt,
    provider: "europe_pmc",
    responseIdentity: row.responseIdentity,
    sourceIdentity: row.sourceIdentity,
    contentAccess: "metadata",
    claimSupport: "not_assessed",
    identityLayer: "provider_record",
    scientificApproval: false,
    graphPromotable: false,
    passageImported: false,
    independentCorroborationOfEuropePmc: null,
    axes: {...DRAFT_AXES},
    searchRecordHash,
    metadata: {
      provider: "europe_pmc",
      journal: row.journal,
      publicationYear: row.publicationYear,
      responseIdentity: row.responseIdentity,
      duplicateOfPmid: row.duplicateOfPmid,
      identityLayer: row.identityLayer,
      curationReview: DRAFT_AXES.curationReview,
      hsiGrade: DRAFT_AXES.hsiGrade,
      teachingStatus: DRAFT_AXES.teachingStatus,
      searchRecordHash,
    },
  };
}

function toOpenTargetsCandidate(
  row: PermittedOpenTargetsMetadata,
  searchRecordHash: string,
): DynamicCandidateSource {
  if (row.claimSupport !== "not_assessed") fail("Open Targets candidate fabricated claim support");
  if (
    row.scientificApproval !== false ||
    row.graphPromotable !== false ||
    row.passageImported !== false ||
    row.independentCorroborationOfEuropePmc !== false
  ) {
    fail("Open Targets candidate honesty flags violated");
  }
  return {
    id: openTargetsCandidateId(row),
    sourceKind: "registry",
    externalId: row.diseaseId,
    title: row.diseaseName,
    sourceUrl: null,
    doi: null,
    pmid: null,
    licenceStatus: "metadata_only",
    retractionStatus: "unknown",
    retrievedAt: row.retrievedAt,
    provider: OPEN_TARGETS_PROVIDER,
    responseIdentity: row.responseIdentity,
    sourceIdentity: row.sourceIdentity,
    contentAccess: "metadata",
    claimSupport: "not_assessed",
    identityLayer: "provider_record",
    scientificApproval: false,
    graphPromotable: false,
    passageImported: false,
    independentCorroborationOfEuropePmc: false,
    axes: {...DRAFT_AXES},
    searchRecordHash,
    metadata: {
      provider: OPEN_TARGETS_PROVIDER,
      diseaseId: row.diseaseId,
      associationCount: row.associationCount,
      associationSymbols: row.associationSymbols,
      associations: row.associations,
      associationScope: row.associationScope,
      enableIndirect: row.enableIndirect,
      scoreHonesty: row.scoreHonesty,
      responseIdentity: row.responseIdentity,
      independentCorroborationOfEuropePmc: false,
      curationReview: DRAFT_AXES.curationReview,
      hsiGrade: DRAFT_AXES.hsiGrade,
      teachingStatus: DRAFT_AXES.teachingStatus,
      searchRecordHash,
    },
  };
}

function pushUniqueLink(links: EvidenceIdentityLink[], link: EvidenceIdentityLink): void {
  const key = `${link.fromIdentity}|${link.toIdentity}|${link.relation}`;
  if (links.some((l) => `${l.fromIdentity}|${l.toIdentity}|${l.relation}` === key)) return;
  links.push(link);
}

function buildDedupLinks(record: DynamicSearchRecord): EvidenceIdentityLink[] {
  const links: EvidenceIdentityLink[] = [];
  for (const d of record.deduped) {
    const pmid = assertPmid(d.pmid, "deduped");
    const from = `epmc-response:${d.keptResponseIdentity}:dup`;
    const to = recordIdentity(pmid);
    pushUniqueLink(links, {
      id: linkId({relation: "same_provider_record", pmid, kept: d.keptResponseIdentity}),
      fromIdentity: from,
      toIdentity: to,
      fromLayer: "record",
      toLayer: "record",
      relation: "same_provider_record",
      countsAsIndependentEvidence: false,
      rationale:
        "Duplicate Europe PMC retrieval of the same PMID linked without discarding dropped retrieval provenance.",
      provenance: {
        keptResponseIdentity: d.keptResponseIdentity,
        droppedCount: d.droppedCount,
        provider: "europe_pmc",
      },
    });
    pushUniqueLink(links, {
      id: linkId({relation: "same_study", pmid, via: "pmid"}),
      fromIdentity: to,
      toIdentity: studyIdentity(`pmid:${pmid}`),
      fromLayer: "record",
      toLayer: "study",
      relation: "same_study",
      countsAsIndependentEvidence: false,
      rationale: "Multiple retrievals of one PMID share a single study identity; they are not independent evidence.",
      provenance: {pmid, droppedCount: d.droppedCount},
    });
  }
  return links;
}

function buildOpenTargetsIndependenceLinks(record: DynamicSearchRecord): EvidenceIdentityLink[] {
  const links: EvidenceIdentityLink[] = [];
  const bibliographicPmids = record.retrievedBibliographic
    .filter((r) => r.pmid && r.duplicateOfPmid === null)
    .map((r) => r.pmid!);
  if (bibliographicPmids.length === 0 || record.retrievedOpenTargets.length === 0) return links;

  for (const ot of record.retrievedOpenTargets) {
    const from = openTargetsCandidateId(ot);
    for (const pmid of bibliographicPmids) {
      pushUniqueLink(links, {
        id: linkId({
          relation: "derived_not_independent",
          diseaseId: ot.diseaseId,
          pmid,
          searchRecordHash: record.searchRecordHash,
        }),
        fromIdentity: from,
        toIdentity: recordIdentity(pmid),
        fromLayer: "record",
        toLayer: "independent_evidence",
        relation: "derived_not_independent",
        countsAsIndependentEvidence: false,
        rationale:
          "Open Targets Europe PMC–derived literature is not automatic independent corroboration of Europe PMC bibliographic hits from the same retrieval.",
        provenance: {
          openTargetsDiseaseId: ot.diseaseId,
          europePmcPmid: pmid,
          independentCorroborationOfEuropePmc: false,
        },
      });
    }
  }
  return links;
}

function buildDeclaredLinks(
  record: DynamicSearchRecord,
  declared: readonly DeclaredStudyRelationship[],
): EvidenceIdentityLink[] {
  const links: EvidenceIdentityLink[] = [];
  const knownPmids = new Set(
    record.retrievedBibliographic.filter((r) => r.pmid).map((r) => r.pmid!),
  );

  for (const rel of declared) {
    switch (rel.kind) {
      case "preprint_of": {
        const preprint = assertPmid(rel.preprintPmid, "preprint");
        const published = assertPmid(rel.publishedPmid, "published");
        if (!knownPmids.has(preprint) || !knownPmids.has(published)) {
          fail("preprint_of relationship requires both PMIDs in the search record");
        }
        const studyKey = rel.sharedDoi
          ? `doi:${rel.sharedDoi.toLowerCase()}`
          : `preprint-published:${preprint}:${published}`;
        pushUniqueLink(links, {
          id: linkId({relation: "same_study", preprint, published, studyKey}),
          fromIdentity: recordIdentity(preprint),
          toIdentity: studyIdentity(studyKey),
          fromLayer: "record",
          toLayer: "study",
          relation: "same_study",
          countsAsIndependentEvidence: false,
          rationale: "Preprint and published article linked as one study identity; not independent evidence.",
          provenance: {preprintPmid: preprint, publishedPmid: published, sharedDoi: rel.sharedDoi ?? null},
        });
        pushUniqueLink(links, {
          id: linkId({relation: "same_study", published, studyKey, side: "published"}),
          fromIdentity: recordIdentity(published),
          toIdentity: studyIdentity(studyKey),
          fromLayer: "record",
          toLayer: "study",
          relation: "same_study",
          countsAsIndependentEvidence: false,
          rationale: "Published counterpart shares study identity with its preprint record.",
          provenance: {preprintPmid: preprint, publishedPmid: published, sharedDoi: rel.sharedDoi ?? null},
        });
        break;
      }
      case "review_cites_primary": {
        const review = assertPmid(rel.reviewPmid, "review");
        const primary = assertPmid(rel.primaryPmid, "primary");
        if (!knownPmids.has(review) || !knownPmids.has(primary)) {
          fail("review_cites_primary relationship requires both PMIDs in the search record");
        }
        pushUniqueLink(links, {
          id: linkId({relation: "cites_or_reviews", review, primary}),
          fromIdentity: recordIdentity(review),
          toIdentity: recordIdentity(primary),
          fromLayer: "record",
          toLayer: "independent_evidence",
          relation: "cites_or_reviews",
          countsAsIndependentEvidence: false,
          rationale:
            "Review citing a primary study is an evidence dependency, not independent corroboration of that primary finding.",
          provenance: {reviewPmid: review, primaryPmid: primary},
        });
        break;
      }
      case "cross_provider_same_record": {
        const pmid = assertPmid(rel.pmid, "cross-provider");
        pushUniqueLink(links, {
          id: linkId({
            relation: "cross_provider_same_record",
            pmid,
            a: rel.recordIdA,
            b: rel.recordIdB,
          }),
          fromIdentity: rel.recordIdA,
          toIdentity: rel.recordIdB,
          fromLayer: "record",
          toLayer: "record",
          relation: "cross_provider_same_record",
          countsAsIndependentEvidence: false,
          rationale:
            "Same article retrieved from two providers shares record identity; providers are not independent evidence.",
          provenance: {
            pmid,
            providerA: rel.providerA,
            providerB: rel.providerB,
            recordIdA: rel.recordIdA,
            recordIdB: rel.recordIdB,
          },
        });
        pushUniqueLink(links, {
          id: linkId({relation: "same_study", pmid, via: "cross_provider"}),
          fromIdentity: recordIdentity(pmid),
          toIdentity: studyIdentity(`pmid:${pmid}`),
          fromLayer: "record",
          toLayer: "study",
          relation: "same_study",
          countsAsIndependentEvidence: false,
          rationale: "Cross-provider duplicate records collapse to one study identity.",
          provenance: {pmid, providerA: rel.providerA, providerB: rel.providerB},
        });
        break;
      }
      default: {
        const _exhaustive: never = rel;
        return _exhaustive;
      }
    }
  }
  return links;
}

/**
 * Build an in-memory persistence plan from a reproducible dynamic search record.
 * Does not write Neon; use persistDynamicEvidencePlan with a store.
 */
export function buildDynamicPersistencePlan(input: {
  searchRecord: DynamicSearchRecord;
  declaredRelationships?: readonly DeclaredStudyRelationship[];
}): DynamicPersistencePlan {
  const record = input.searchRecord;
  if (!record || record.schemaVersion !== DYNAMIC_SEARCH_RECORD_SCHEMA) {
    fail("Invalid dynamic search record schema");
  }
  if (!record.searchRecordHash || !/^[a-f0-9]{64}$/.test(record.searchRecordHash)) {
    fail("Search record hash required before persistence");
  }
  if (record.honesty.claimSupport !== "not_assessed") fail("Search record fabricated claim support");
  if (record.honesty.scientificApproval !== false || record.honesty.graphPromotable !== false) {
    fail("Search record must stay unapproved / non-promotable");
  }
  if (record.honesty.gateCAutoApprove !== false) fail("Gate C auto-approve refused");
  if (record.filters.contentAccess !== "metadata" || record.filters.metadataOnly !== true) {
    fail("Only metadata-only search records may persist");
  }

  const searchRecordHash = record.searchRecordHash;
  const searchRecordId = `dynsearch:${searchRecordHash}`;
  const candidates: DynamicCandidateSource[] = [];
  const bindings: DynamicCandidateBinding[] = [];
  const seenCandidateIds = new Set<string>();

  for (const row of record.retrievedBibliographic) {
    if (row.duplicateOfPmid) {
      const primaryId = recordIdentity(row.duplicateOfPmid);
      bindings.push({
        sourceId: primaryId,
        role: "duplicate_retrieval",
        responseIdentity: row.responseIdentity,
        pmid: row.pmid,
        provider: "europe_pmc",
      });
      continue;
    }
    const candidate = toBibliographicCandidate(row, searchRecordHash);
    if (!seenCandidateIds.has(candidate.id)) {
      candidates.push(candidate);
      seenCandidateIds.add(candidate.id);
    }
    bindings.push({
      sourceId: candidate.id,
      role: "bibliographic_candidate",
      responseIdentity: row.responseIdentity,
      pmid: row.pmid,
      provider: "europe_pmc",
    });
  }

  for (const row of record.retrievedOpenTargets) {
    const candidate = toOpenTargetsCandidate(row, searchRecordHash);
    if (!seenCandidateIds.has(candidate.id)) {
      candidates.push(candidate);
      seenCandidateIds.add(candidate.id);
    }
    bindings.push({
      sourceId: candidate.id,
      role: "open_targets_candidate",
      responseIdentity: row.responseIdentity,
      pmid: null,
      provider: OPEN_TARGETS_PROVIDER,
    });
  }

  const identityLinks = [
    ...buildDedupLinks(record),
    ...buildOpenTargetsIndependenceLinks(record),
    ...buildDeclaredLinks(record, input.declaredRelationships ?? []),
  ];

  return {
    schemaVersion: DYNAMIC_PERSISTENCE_SCHEMA,
    method: DYNAMIC_PERSISTENCE_METHOD,
    searchRecord: record,
    searchRecordId,
    candidates,
    bindings,
    identityLinks,
    honesty: {
      metadataOnly: true,
      claimSupport: "not_assessed",
      sourceIdentityDistinctFromClaimSupport: true,
      recordStudyIndependenceDistinct: true,
      passageImportFailClosed: true,
      scientificApproval: false,
      graphPromotable: false,
      gateCAutoApprove: false,
      legalBinding: false,
      cdsPhi: false,
      fixturesAreNotLiveEvidence: true,
      openTargetsNotIndependentEuropePmcCorroboration: true,
      autoPromotedToApprovedGraph: false,
    },
  };
}

/** Persist a plan through an injected store (memory or Neon). Failures/coverage stay on the search record. */
export async function persistDynamicEvidencePlan(
  plan: DynamicPersistencePlan,
  store: DynamicEvidencePersistStore,
): Promise<DynamicPersistResult> {
  if (plan.honesty.autoPromotedToApprovedGraph !== false) fail("Auto graph promotion refused");
  if (plan.honesty.claimSupport !== "not_assessed") fail("Claim support fabrication refused");
  const {id} = await store.upsertSearchRecord(plan);
  for (const candidate of plan.candidates) {
    if (candidate.axes.curationReview !== "draft") fail("Candidates must remain draft-labelled");
    if (candidate.axes.hsiGrade !== "unexplored") fail("Candidates must remain hsiGrade=unexplored");
    if (candidate.graphPromotable !== false || candidate.scientificApproval !== false) {
      fail("Candidate promotion / approval refused");
    }
    await store.upsertCandidate(candidate);
  }
  for (const binding of plan.bindings) {
    await store.upsertBinding(id, binding);
  }
  for (const link of plan.identityLinks) {
    await store.upsertIdentityLink(id, link);
  }
  return {
    searchRecordId: id,
    candidateCount: plan.candidates.length,
    bindingCount: plan.bindings.length,
    identityLinkCount: plan.identityLinks.length,
    preservedFailures: plan.searchRecord.failures.length,
    preservedDeduped: plan.searchRecord.deduped.length,
  };
}

/** In-memory store for unit tests — no Neon, no autumn-snow. */
export function createMemoryDynamicEvidencePersistStore(): DynamicEvidencePersistStore & {
  searchRecords: Map<string, DynamicSearchRecord>;
  candidates: Map<string, DynamicCandidateSource>;
  bindings: (DynamicCandidateBinding & {searchRecordId: string})[];
  links: (EvidenceIdentityLink & {searchRecordId: string})[];
} {
  const searchRecords = new Map<string, DynamicSearchRecord>();
  const candidates = new Map<string, DynamicCandidateSource>();
  const bindings: (DynamicCandidateBinding & {searchRecordId: string})[] = [];
  const links: (EvidenceIdentityLink & {searchRecordId: string})[] = [];

  return {
    searchRecords,
    candidates,
    bindings,
    links,
    async upsertSearchRecord(plan) {
      searchRecords.set(plan.searchRecordId, structuredClone(plan.searchRecord));
      return {id: plan.searchRecordId};
    },
    async upsertCandidate(candidate) {
      candidates.set(candidate.id, structuredClone(candidate));
    },
    async upsertBinding(searchRecordId, binding) {
      const existing = bindings.findIndex(
        (b) =>
          b.searchRecordId === searchRecordId &&
          b.sourceId === binding.sourceId &&
          b.role === binding.role &&
          b.responseIdentity === binding.responseIdentity,
      );
      const row = {...binding, searchRecordId};
      if (existing >= 0) bindings[existing] = row;
      else bindings.push(row);
    },
    async upsertIdentityLink(searchRecordId, link) {
      const existing = links.findIndex(
        (l) =>
          l.searchRecordId === searchRecordId &&
          l.fromIdentity === link.fromIdentity &&
          l.toIdentity === link.toIdentity &&
          l.relation === link.relation,
      );
      const row = {...link, searchRecordId};
      if (existing >= 0) links[existing] = row;
      else links.push(row);
    },
    async getSearchRecord(id) {
      return searchRecords.get(id) ?? null;
    },
    async listCandidates() {
      return [...candidates.values()];
    },
    async listBindings(searchRecordId) {
      return searchRecordId ? bindings.filter((b) => b.searchRecordId === searchRecordId) : [...bindings];
    },
    async listIdentityLinks(searchRecordId) {
      return searchRecordId ? links.filter((l) => l.searchRecordId === searchRecordId) : [...links];
    },
  };
}
