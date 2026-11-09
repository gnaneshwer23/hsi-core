/**
 * Milestone 8 / PR1 — Incremental Evidence Monitoring.
 *
 * Extends Europe PMC / Open Targets / ClinicalTrials.gov / UniProt adapters
 * (Reactome: stub identifier recognition only — no live fetch) with research-
 * topic subscriptions, incremental cursors, bounded schedules, rate limits,
 * retry honesty, duplicate hooks, freshness, and source availability.
 *
 * Does NOT invent Kafka, a new graph DB, a separate event platform, a new
 * agent framework, change-detection pipeline (PR2), notifications UI, Gate C
 * auto-approve, MoU, PHI/CDS, or auto-promotion of unreviewed evidence into
 * approved graph facts. Fixtures ≠ live. Continuous monitoring ≠ validated science.
 *
 * Persistence: in-process validated contracts + JSON projection. No new Neon
 * migration in PR1 — prefer existing job / durable patterns later.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import {
  DYNAMIC_EUROPE_PMC_MAX_PAGES,
  DYNAMIC_MAX_RESULTS_DEFAULT,
  DYNAMIC_MAX_RESULTS_MAX,
  DYNAMIC_RATE_LIMIT_MS,
  type ResearcherQueryInput,
} from "./dynamicEvidenceRetrieval";
import {
  EUROPE_PMC_CURSOR_MARK_START,
  EUROPE_PMC_PROVIDER_VERSION,
} from "./europePmcBibliographicLookup";
import {OPEN_TARGETS_PROVIDER} from "./openTargetsLookup";
import {UNIPROT_PROVIDER} from "./uniprotMetadataLookup";
import {CTGOV_PROVIDER} from "./clinicalTrialsGovLookup";
import {
  resolveReactomeIdentityStub,
  type TranslationalIdentityRef,
} from "./translationalEvidenceContracts";
import type {
  InvestigationFreshness,
  ScientificInvestigationContract,
} from "./investigationOrchestrationContracts";

export const INCREMENTAL_MONITORING_SCHEMA =
  "hsi-incremental-evidence-monitoring-1" as const;
export const INCREMENTAL_MONITORING_METHOD =
  "hsi.incremental_evidence_monitoring.v1" as const;
export const INCREMENTAL_MONITORING_VERSION = "0.1.0" as const;

/** Topic kinds researchers may subscribe to for incremental refresh. */
export const MONITORING_TOPIC_KINDS = [
  "disease",
  "gene",
  "pathway",
  "target",
  "trial",
  "saved_investigation",
] as const;
export type MonitoringTopicKind = (typeof MONITORING_TOPIC_KINDS)[number];

/**
 * Live-capable providers for PR1. Reactome is intentionally absent —
 * pathway topics use stub identity only.
 */
export const MONITORING_LIVE_PROVIDERS = [
  "europe_pmc",
  "open_targets",
  "clinicaltrials_gov",
  "uniprot",
] as const;
export type MonitoringLiveProvider = (typeof MONITORING_LIVE_PROVIDERS)[number];

export type MonitoringProviderRef =
  | MonitoringLiveProvider
  | "reactome_stub";

export const MONITORING_SCHEDULE_INTERVALS = [
  "manual",
  "hourly_bounded",
  "daily_bounded",
  "weekly_bounded",
] as const;
export type MonitoringScheduleInterval =
  (typeof MONITORING_SCHEDULE_INTERVALS)[number];

export type MonitoringRunMode = "offline_fixture" | "gated_live";

export type MonitoringRunStatus =
  | "skipped_offline"
  | "gated_not_run"
  | "completed_bounded"
  | "provider_unavailable"
  | "budget_exhausted"
  | "invalid_subscription";

/** Closed retry honesty — never silent infinite retry. */
export type MonitoringRetryHonesty = {
  maxAttempts: 1 | 2;
  attempted: number;
  retriedOnTransient: boolean;
  infiniteRetryForbidden: true;
  lastTransientHttpStatus: number | null;
};

export type MonitoringBudgets = {
  /** Max external fetches per scheduled check (hard cap). */
  maxExternalFetches: number;
  /** Max unique literature / association hits retained. */
  maxResults: number;
  /** Max Europe PMC cursor pages (reuses dynamic retrieval cap). */
  maxEuropePmcPages: number;
  /** Minimum ms between provider calls. */
  rateLimitMs: number;
  /** Wall-clock bound for one check (ms). */
  maxWallClockMs: number;
  /** Explicit: full provider DB scrape is refused. */
  fullDatabaseScrape: false;
};

export type IncrementalCursorState = {
  provider: MonitoringProviderRef;
  /**
   * Europe PMC cursorMark (`*` first page), or opaque page token for other
   * providers when known; null when provider has no cursor yet.
   */
  cursorMark: string | null;
  /** Last successfully observed external identity (PMID / NCT / Ensembl / accession). */
  lastSeenExternalId: string | null;
  /** ISO timestamp of last successful provider response for this cursor. */
  lastRetrievedAt: string | null;
  /** Provider version token for cache / honesty. */
  providerVersion: string;
  exhausted: boolean;
};

export type MonitoringFreshness = {
  asOf: string | null;
  maxAgeHours: number | null;
  /** Null when not yet assessed. */
  stale: boolean | null;
  lastSuccessfulCheckAt: string | null;
};

export type DuplicateDetectionHook = {
  /** Stable evidence identity key (provider + external id). */
  evidenceKey: string;
  provider: MonitoringProviderRef;
  externalId: string;
  /** True when this key was already observed in prior cursor / pin set. */
  duplicateOfPrior: boolean;
  priorSeenAt: string | null;
  /** Duplicate detection never grants claim support. */
  claimSupport: "not_assessed";
};

export type SourceAvailabilityRow = {
  provider: MonitoringProviderRef;
  probed: boolean;
  /**
   * null = not probed (offline / gated). false = probed unreachable.
   * true = probed reachable — still not scientific validity.
   */
  reachable: boolean | null;
  detail: string;
  rateLimited: boolean;
  retryHonesty: MonitoringRetryHonesty;
};

export type ResearchTopicSubscription = {
  schemaVersion: typeof INCREMENTAL_MONITORING_SCHEMA;
  method: typeof INCREMENTAL_MONITORING_METHOD;
  version: typeof INCREMENTAL_MONITORING_VERSION;
  subscriptionId: string;
  topicKind: MonitoringTopicKind;
  topicId: string;
  topicLabel: string | null;
  /** Optional bind to M6 investigation contract id. */
  investigationId: string | null;
  providers: readonly MonitoringProviderRef[];
  schedule: {
    interval: MonitoringScheduleInterval;
    /** ISO; null = not yet scheduled. */
    nextCheckAt: string | null;
    /** Explicit human/operator gate before live network. */
    liveRequiresExplicitGate: true;
  };
  cursors: readonly IncrementalCursorState[];
  budgets: MonitoringBudgets;
  freshness: MonitoringFreshness;
  /** Pathway topics may carry Reactome stub refs — never live fetch. */
  reactomeStub: TranslationalIdentityRef | null;
  createdAt: string;
  updatedAt: string;
  contentHash: string;
  note: string;
  honesty: {
    fixturesAreNotLiveEvidence: true;
    unreviewedNotAutoApproved: true;
    graphPromotable: false;
    scientificApproval: false;
    gateCAutoApprove: false;
    cdsPhi: false;
    fullDatabaseScrape: false;
    noKafka: true;
    noNewGraphDb: true;
    noSeparateEventPlatform: true;
    noNewAgentFramework: true;
    continuousMonitoringIsNotValidatedScience: true;
    reactomeLiveFetch: false;
    neonRedWaveOnly: true;
    changeDetectionPipelineNotImplemented: true;
  };
};

export type IncrementalMonitoringCheckReceipt = {
  schemaVersion: "hsi-incremental-monitoring-check-receipt-1";
  method: typeof INCREMENTAL_MONITORING_METHOD;
  version: typeof INCREMENTAL_MONITORING_VERSION;
  subscriptionId: string;
  mode: MonitoringRunMode;
  status: MonitoringRunStatus;
  generatedAt: string;
  startedAt: string;
  completedAt: string;
  providersProbed: readonly MonitoringProviderRef[];
  cursorsAfter: readonly IncrementalCursorState[];
  duplicates: readonly DuplicateDetectionHook[];
  freshness: MonitoringFreshness;
  sourceAvailability: readonly SourceAvailabilityRow[];
  /** Thin projection of researcher query that would drive dynamic retrieval. */
  dynamicRetrievalQuery: ResearcherQueryInput | null;
  investigationFreshnessProjection: InvestigationFreshness | null;
  hitCountBounded: number;
  truncatedByBudget: boolean;
  engineeringHarness: "CLEARED";
  scientificAcceptance: "BLOCKED";
  honesty: ResearchTopicSubscription["honesty"] & {
    liveNetworkUsed: boolean;
    offlineStatusHonest: true;
  };
  receiptHash: string;
};

export type IncrementalMonitoringPack = {
  schemaVersion: "hsi-incremental-monitoring-pack-1";
  method: typeof INCREMENTAL_MONITORING_METHOD;
  version: typeof INCREMENTAL_MONITORING_VERSION;
  generatedAt: string;
  subscriptions: readonly ResearchTopicSubscription[];
  honesty: ResearchTopicSubscription["honesty"];
};

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/;
const TOPIC_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,119}$/;

function fail(message: string): never {
  throw new Error(message);
}

function textOk(value: string, max: number): boolean {
  const t = value.trim();
  return t.length >= 1 && t.length <= max;
}

function isoOk(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

function assertId(id: string, label: string): string {
  const t = id.trim();
  if (!ID.test(t)) fail(`Invalid ${label}`);
  return t;
}

function defaultBudgets(): MonitoringBudgets {
  return {
    maxExternalFetches: 8,
    maxResults: DYNAMIC_MAX_RESULTS_DEFAULT,
    maxEuropePmcPages: DYNAMIC_EUROPE_PMC_MAX_PAGES,
    rateLimitMs: DYNAMIC_RATE_LIMIT_MS,
    maxWallClockMs: 30_000,
    fullDatabaseScrape: false,
  };
}

function defaultHonesty(): ResearchTopicSubscription["honesty"] {
  return {
    fixturesAreNotLiveEvidence: true,
    unreviewedNotAutoApproved: true,
    graphPromotable: false,
    scientificApproval: false,
    gateCAutoApprove: false,
    cdsPhi: false,
    fullDatabaseScrape: false,
    noKafka: true,
    noNewGraphDb: true,
    noSeparateEventPlatform: true,
    noNewAgentFramework: true,
    continuousMonitoringIsNotValidatedScience: true,
    reactomeLiveFetch: false,
    neonRedWaveOnly: true,
    changeDetectionPipelineNotImplemented: true,
  };
}

function defaultRetryHonesty(): MonitoringRetryHonesty {
  return {
    maxAttempts: 2,
    attempted: 0,
    retriedOnTransient: false,
    infiniteRetryForbidden: true,
    lastTransientHttpStatus: null,
  };
}

function providerVersionFor(provider: MonitoringProviderRef): string {
  switch (provider) {
    case "europe_pmc":
      return EUROPE_PMC_PROVIDER_VERSION;
    case "open_targets":
      return OPEN_TARGETS_PROVIDER;
    case "clinicaltrials_gov":
      return CTGOV_PROVIDER;
    case "uniprot":
      return UNIPROT_PROVIDER;
    case "reactome_stub":
      return "reactome_identifier_stub";
    default: {
      const _exhaustive: never = provider;
      return _exhaustive;
    }
  }
}

function initialCursor(provider: MonitoringProviderRef): IncrementalCursorState {
  return {
    provider,
    cursorMark: provider === "europe_pmc" ? EUROPE_PMC_CURSOR_MARK_START : null,
    lastSeenExternalId: null,
    lastRetrievedAt: null,
    providerVersion: providerVersionFor(provider),
    exhausted: false,
  };
}

function defaultProvidersForTopic(
  topicKind: MonitoringTopicKind,
): MonitoringProviderRef[] {
  switch (topicKind) {
    case "disease":
      return ["europe_pmc", "open_targets"];
    case "gene":
      return ["europe_pmc", "uniprot", "open_targets"];
    case "pathway":
      // Reactome stub only — no live pathway scrape.
      return ["reactome_stub", "europe_pmc"];
    case "target":
      return ["open_targets", "uniprot", "europe_pmc"];
    case "trial":
      return ["clinicaltrials_gov", "europe_pmc"];
    case "saved_investigation":
      return ["europe_pmc", "open_targets", "clinicaltrials_gov", "uniprot"];
    default: {
      const _exhaustive: never = topicKind;
      return _exhaustive;
    }
  }
}

function hashSubscription(
  body: Omit<ResearchTopicSubscription, "contentHash">,
): string {
  return createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex");
}

function hashReceipt(
  body: Omit<IncrementalMonitoringCheckReceipt, "receiptHash">,
): string {
  return createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex");
}

function assertHonesty(s: ResearchTopicSubscription): void {
  if (s.honesty.gateCAutoApprove !== false) fail("Gate C auto-approve refused");
  if (s.honesty.cdsPhi !== false) fail("CDS/PHI refused");
  if (s.honesty.scientificApproval !== false || s.honesty.graphPromotable !== false) {
    fail("Monitoring hits must stay unapproved / non-promotable");
  }
  if (s.honesty.unreviewedNotAutoApproved !== true) {
    fail("Unreviewed evidence must not auto-approve");
  }
  if (s.honesty.fullDatabaseScrape !== false || s.budgets.fullDatabaseScrape !== false) {
    fail("Full database scrape refused");
  }
  if (
    s.honesty.noKafka !== true ||
    s.honesty.noNewGraphDb !== true ||
    s.honesty.noSeparateEventPlatform !== true ||
    s.honesty.noNewAgentFramework !== true
  ) {
    fail("Kafka / new graph DB / event platform / agent framework refused");
  }
  if (s.honesty.reactomeLiveFetch !== false) fail("Reactome live fetch refused in PR1");
  if (s.honesty.changeDetectionPipelineNotImplemented !== true) {
    fail("PR1 must not claim change-detection pipeline implemented");
  }
  if (s.honesty.continuousMonitoringIsNotValidatedScience !== true) {
    fail("Continuous monitoring must not claim validated science");
  }
  if (s.schedule.liveRequiresExplicitGate !== true) {
    fail("Live monitoring requires explicit gate");
  }
}

function assertBudgets(b: MonitoringBudgets): void {
  if (!Number.isInteger(b.maxExternalFetches) || b.maxExternalFetches < 1 || b.maxExternalFetches > 24) {
    fail("maxExternalFetches must be 1–24");
  }
  if (!Number.isInteger(b.maxResults) || b.maxResults < 1 || b.maxResults > DYNAMIC_MAX_RESULTS_MAX) {
    fail(`maxResults must be 1–${DYNAMIC_MAX_RESULTS_MAX}`);
  }
  if (
    !Number.isInteger(b.maxEuropePmcPages) ||
    b.maxEuropePmcPages < 1 ||
    b.maxEuropePmcPages > DYNAMIC_EUROPE_PMC_MAX_PAGES
  ) {
    fail(`maxEuropePmcPages must be 1–${DYNAMIC_EUROPE_PMC_MAX_PAGES}`);
  }
  if (!Number.isInteger(b.rateLimitMs) || b.rateLimitMs < DYNAMIC_RATE_LIMIT_MS) {
    fail(`rateLimitMs must be ≥ ${DYNAMIC_RATE_LIMIT_MS}`);
  }
  if (!Number.isInteger(b.maxWallClockMs) || b.maxWallClockMs < 1_000 || b.maxWallClockMs > 120_000) {
    fail("maxWallClockMs must be 1000–120000");
  }
  if (b.fullDatabaseScrape !== false) fail("fullDatabaseScrape must stay false");
}

/**
 * Validate a research-topic subscription contract (fail-closed).
 */
export function validateResearchTopicSubscription(
  subscription: ResearchTopicSubscription,
): void {
  if (subscription.schemaVersion !== INCREMENTAL_MONITORING_SCHEMA) {
    fail("Unexpected monitoring schemaVersion");
  }
  if (subscription.method !== INCREMENTAL_MONITORING_METHOD) {
    fail("Unexpected monitoring method");
  }
  if (subscription.version !== INCREMENTAL_MONITORING_VERSION) {
    fail("Unexpected monitoring version");
  }
  assertId(subscription.subscriptionId, "subscriptionId");
  if (!MONITORING_TOPIC_KINDS.includes(subscription.topicKind)) {
    fail("Invalid topicKind");
  }
  if (!TOPIC_ID.test(subscription.topicId.trim())) fail("Invalid topicId");
  if (subscription.topicLabel !== null && !textOk(subscription.topicLabel, 200)) {
    fail("Invalid topicLabel");
  }
  if (subscription.investigationId !== null) {
    assertId(subscription.investigationId, "investigationId");
  }
  if (subscription.topicKind === "saved_investigation" && !subscription.investigationId) {
    fail("saved_investigation topic requires investigationId");
  }
  if (!subscription.providers.length) fail("At least one provider required");
  for (const p of subscription.providers) {
    if (p === "reactome_stub") continue;
    if (!(MONITORING_LIVE_PROVIDERS as readonly string[]).includes(p)) {
      fail(`Unknown monitoring provider ${p}`);
    }
  }
  if (
    subscription.providers.includes("reactome_stub") &&
    subscription.honesty.reactomeLiveFetch !== false
  ) {
    fail("reactome_stub provider cannot claim live fetch");
  }
  if (!MONITORING_SCHEDULE_INTERVALS.includes(subscription.schedule.interval)) {
    fail("Invalid schedule interval");
  }
  if (
    subscription.schedule.nextCheckAt !== null &&
    !isoOk(subscription.schedule.nextCheckAt)
  ) {
    fail("Invalid nextCheckAt");
  }
  assertBudgets(subscription.budgets);
  if (subscription.freshness.asOf !== null && !isoOk(subscription.freshness.asOf)) {
    fail("Invalid freshness.asOf");
  }
  if (
    subscription.freshness.lastSuccessfulCheckAt !== null &&
    !isoOk(subscription.freshness.lastSuccessfulCheckAt)
  ) {
    fail("Invalid lastSuccessfulCheckAt");
  }
  if (
    subscription.freshness.maxAgeHours !== null &&
    (!Number.isFinite(subscription.freshness.maxAgeHours) ||
      subscription.freshness.maxAgeHours < 1)
  ) {
    fail("maxAgeHours must be ≥ 1 when set");
  }
  if (!isoOk(subscription.createdAt) || !isoOk(subscription.updatedAt)) {
    fail("Invalid createdAt/updatedAt");
  }
  if (Date.parse(subscription.updatedAt) < Date.parse(subscription.createdAt)) {
    fail("updatedAt must not precede createdAt");
  }
  for (const c of subscription.cursors) {
    if (c.provider === "europe_pmc" && c.cursorMark !== null && !textOk(c.cursorMark, 200)) {
      fail("Invalid europe_pmc cursorMark");
    }
    if (c.lastRetrievedAt !== null && !isoOk(c.lastRetrievedAt)) {
      fail("Invalid cursor lastRetrievedAt");
    }
  }
  if (subscription.topicKind === "pathway") {
    if (!subscription.reactomeStub) {
      fail("pathway topic requires reactomeStub identity");
    }
    if (subscription.reactomeStub.resolution !== "stub_only") {
      fail("pathway reactomeStub must resolve as stub_only (valid Reactome id)");
    }
    if (subscription.reactomeStub.sourceProvider !== "reactome_identifier_stub") {
      fail("pathway reactomeStub must stay identifier stub (no live fetch)");
    }
  } else if (subscription.reactomeStub !== null) {
    fail("reactomeStub only permitted on pathway topics");
  }
  assertHonesty(subscription);
  const {contentHash: _ignored, ...body} = subscription;
  const expected = hashSubscription(body);
  if (subscription.contentHash !== expected) fail("Subscription contentHash mismatch");
}

export type DraftResearchTopicSubscriptionInput = {
  subscriptionId?: string;
  topicKind: MonitoringTopicKind;
  topicId: string;
  topicLabel?: string | null;
  investigationId?: string | null;
  providers?: readonly MonitoringProviderRef[];
  scheduleInterval?: MonitoringScheduleInterval;
  nextCheckAt?: string | null;
  budgets?: Partial<MonitoringBudgets>;
  freshness?: Partial<MonitoringFreshness>;
  /** Required for pathway topics (Reactome id e.g. R-HSA-123). */
  reactomePathwayId?: string;
  note?: string;
  createdAt?: string;
};

/**
 * Draft a research-topic subscription with bounded budgets and honesty gates.
 */
export function draftResearchTopicSubscription(
  input: DraftResearchTopicSubscriptionInput,
): ResearchTopicSubscription {
  if (!MONITORING_TOPIC_KINDS.includes(input.topicKind)) fail("Invalid topicKind");
  const topicId = input.topicId.trim();
  if (!TOPIC_ID.test(topicId)) fail("Invalid topicId");
  const createdAt = input.createdAt ?? new Date().toISOString();
  if (!isoOk(createdAt)) fail("Invalid createdAt");

  const subscriptionId =
    input.subscriptionId?.trim() ||
    `hsi-mon-${createHash("sha256")
      .update(`${input.topicKind}:${topicId}:${createdAt}`)
      .digest("hex")
      .slice(0, 24)}`;
  assertId(subscriptionId, "subscriptionId");

  const investigationId =
    input.investigationId === undefined || input.investigationId === null
      ? null
      : assertId(input.investigationId.trim(), "investigationId");

  if (input.topicKind === "saved_investigation" && !investigationId) {
    fail("saved_investigation topic requires investigationId");
  }

  const providers = [
    ...(input.providers?.length
      ? input.providers
      : defaultProvidersForTopic(input.topicKind)),
  ];

  let reactomeStub: TranslationalIdentityRef | null = null;
  if (input.topicKind === "pathway") {
    const pathwayId = (input.reactomePathwayId ?? topicId).trim();
    reactomeStub = resolveReactomeIdentityStub(pathwayId);
    if (
      reactomeStub.resolution !== "stub_only" ||
      reactomeStub.sourceProvider !== "reactome_identifier_stub"
    ) {
      fail("pathway topic requires a valid Reactome id (stub recognition only; no live fetch)");
    }
    if (!providers.includes("reactome_stub")) providers.unshift("reactome_stub");
  } else if (input.reactomePathwayId) {
    fail("reactomePathwayId only valid for pathway topics");
  }

  const budgets: MonitoringBudgets = {
    ...defaultBudgets(),
    ...(input.budgets ?? {}),
    fullDatabaseScrape: false,
  };
  assertBudgets(budgets);

  const body: Omit<ResearchTopicSubscription, "contentHash"> = {
    schemaVersion: INCREMENTAL_MONITORING_SCHEMA,
    method: INCREMENTAL_MONITORING_METHOD,
    version: INCREMENTAL_MONITORING_VERSION,
    subscriptionId,
    topicKind: input.topicKind,
    topicId,
    topicLabel: input.topicLabel?.trim() || null,
    investigationId,
    providers,
    schedule: {
      interval: input.scheduleInterval ?? "manual",
      nextCheckAt: input.nextCheckAt ?? null,
      liveRequiresExplicitGate: true,
    },
    cursors: providers.map(initialCursor),
    budgets,
    freshness: {
      asOf: input.freshness?.asOf ?? createdAt,
      maxAgeHours: input.freshness?.maxAgeHours ?? 24,
      stale: input.freshness?.stale ?? null,
      lastSuccessfulCheckAt: input.freshness?.lastSuccessfulCheckAt ?? null,
    },
    reactomeStub,
    createdAt,
    updatedAt: createdAt,
    note:
      input.note?.trim() ||
      "M8 PR1 incremental evidence monitoring subscription — change detection not implemented; fixtures ≠ live.",
    honesty: defaultHonesty(),
  };

  const subscription: ResearchTopicSubscription = {
    ...body,
    contentHash: hashSubscription(body),
  };
  validateResearchTopicSubscription(subscription);
  return subscription;
}

/**
 * Advance a single provider cursor after a bounded page. Never invents
 * exhaustion=false when next cursor is absent.
 */
export function advanceIncrementalCursor(
  cursor: IncrementalCursorState,
  input: {
    nextCursorMark: string | null;
    lastSeenExternalId?: string | null;
    retrievedAt: string;
    hitCount: number;
  },
): IncrementalCursorState {
  if (!isoOk(input.retrievedAt)) fail("Invalid retrievedAt");
  if (!Number.isInteger(input.hitCount) || input.hitCount < 0) {
    fail("hitCount must be ≥ 0");
  }
  const next = input.nextCursorMark?.trim() || null;
  const exhausted =
    next === null ||
    next === cursor.cursorMark ||
    input.hitCount === 0;
  return {
    ...cursor,
    cursorMark: exhausted ? cursor.cursorMark : next,
    lastSeenExternalId:
      input.lastSeenExternalId === undefined
        ? cursor.lastSeenExternalId
        : input.lastSeenExternalId,
    lastRetrievedAt: input.retrievedAt,
    exhausted,
  };
}

/**
 * Duplicate detection hook — keys are provider + external id.
 * Does not assess claim support.
 */
export function detectDuplicateEvidenceKeys(input: {
  priorKeys: readonly string[];
  candidates: readonly {
    provider: MonitoringProviderRef;
    externalId: string;
    seenAt?: string | null;
  }[];
}): DuplicateDetectionHook[] {
  const prior = new Set(input.priorKeys.map((k) => k.trim()).filter(Boolean));
  const hooks: DuplicateDetectionHook[] = [];
  const seenThisBatch = new Set<string>();

  for (const c of input.candidates) {
    const externalId = c.externalId.trim();
    if (!externalId) fail("externalId required for duplicate detection");
    const evidenceKey = `${c.provider}:${externalId}`;
    const duplicateOfPrior = prior.has(evidenceKey) || seenThisBatch.has(evidenceKey);
    hooks.push({
      evidenceKey,
      provider: c.provider,
      externalId,
      duplicateOfPrior,
      priorSeenAt: prior.has(evidenceKey) ? (c.seenAt ?? null) : null,
      claimSupport: "not_assessed",
    });
    seenThisBatch.add(evidenceKey);
  }
  return hooks;
}

/**
 * Assess subscription freshness against asOf / maxAgeHours.
 */
export function assessSubscriptionFreshness(
  freshness: MonitoringFreshness,
  nowIso: string,
): MonitoringFreshness {
  if (!isoOk(nowIso)) fail("Invalid nowIso");
  const asOf = freshness.asOf;
  if (asOf === null || freshness.maxAgeHours === null) {
    return {...freshness, stale: null};
  }
  if (!isoOk(asOf)) fail("Invalid freshness.asOf");
  const ageMs = Date.parse(nowIso) - Date.parse(asOf);
  if (ageMs < 0) fail("nowIso must not precede asOf");
  const stale = ageMs > freshness.maxAgeHours * 3_600_000;
  return {...freshness, stale};
}

/**
 * Report source availability — offline/gated paths stay honest (reachable=null).
 */
export function reportSourceAvailability(input: {
  providers: readonly MonitoringProviderRef[];
  mode: MonitoringRunMode;
  /** Optional probe results when gated live actually ran. */
  liveReachability?: Partial<Record<MonitoringLiveProvider, boolean>>;
}): SourceAvailabilityRow[] {
  return input.providers.map((provider) => {
    if (provider === "reactome_stub") {
      return {
        provider,
        probed: false,
        reachable: null,
        detail:
          "Reactome identifier stub only — live pathway fetch not implemented in M8 PR1",
        rateLimited: false,
        retryHonesty: defaultRetryHonesty(),
      };
    }
    if (input.mode === "offline_fixture") {
      return {
        provider,
        probed: false,
        reachable: null,
        detail: "Offline/fixture mode — provider not probed; fixtures ≠ live",
        rateLimited: false,
        retryHonesty: defaultRetryHonesty(),
      };
    }
    const live = input.liveReachability?.[provider];
    if (live === undefined) {
      return {
        provider,
        probed: false,
        reachable: null,
        detail: "Gated live mode without explicit probe — status gated_not_run honest",
        rateLimited: false,
        retryHonesty: defaultRetryHonesty(),
      };
    }
    return {
      provider,
      probed: true,
      reachable: live,
      detail: live
        ? "Provider probe reachable (metadata only; not scientific validity)"
        : "Provider probe unreachable",
      rateLimited: false,
      retryHonesty: defaultRetryHonesty(),
    };
  });
}

/**
 * Thin wire: project a subscription into a ResearcherQueryInput for dynamic retrieval.
 */
export function projectSubscriptionToResearcherQuery(
  subscription: ResearchTopicSubscription,
): ResearcherQueryInput {
  validateResearchTopicSubscription(subscription);
  const label = subscription.topicLabel ?? subscription.topicId;
  const question = `Incremental monitoring refresh for ${subscription.topicKind} ${label}`.slice(
    0,
    1_000,
  );

  const entities: NonNullable<ResearcherQueryInput["entities"]> = {
    freeTextTerms: [label.slice(0, 120)],
  };

  switch (subscription.topicKind) {
    case "disease":
      entities.diseaseIds = [subscription.topicId];
      break;
    case "gene":
    case "target":
      // Prefer UniProt when topic looks like accession; else free-text + optional disease omit.
      if (/^[OPQ][0-9][A-Z0-9]{3}[0-9]$|^[A-NR-Z][0-9][A-Z0-9]{3}[0-9]$/i.test(subscription.topicId)) {
        entities.uniprotAccessions = [subscription.topicId.toUpperCase()];
      }
      break;
    case "pathway":
      // Literature search only — Reactome stays stub.
      break;
    case "trial":
      // NCT identity is handled by CT.gov path; bibliographic free-text carries NCT.
      entities.freeTextTerms = [subscription.topicId.slice(0, 120)];
      break;
    case "saved_investigation":
      break;
    default: {
      const _exhaustive: never = subscription.topicKind;
      return _exhaustive;
    }
  }

  return {
    question,
    entities,
    ordering: "date_desc",
    pageSize: Math.min(25, subscription.budgets.maxResults),
    maxResults: subscription.budgets.maxResults,
    contentAccess: "metadata",
    openTargetsEnableIndirect: false,
  };
}

/**
 * Thin wire: project monitoring freshness onto an M6 investigation contract.
 * Does not mutate scientific approval / graph promotion.
 */
export function projectMonitoringFreshnessOntoInvestigation(
  subscription: ResearchTopicSubscription,
  contract: ScientificInvestigationContract,
): InvestigationFreshness {
  validateResearchTopicSubscription(subscription);
  if (
    subscription.investigationId &&
    subscription.investigationId !== contract.investigationId
  ) {
    fail("Subscription investigationId does not match contract");
  }
  const assessed = assessSubscriptionFreshness(
    subscription.freshness,
    contract.freshness.asOf ?? contract.updatedAt,
  );
  return {
    asOf: assessed.asOf,
    maxAgeDays:
      assessed.maxAgeHours === null
        ? contract.freshness.maxAgeDays
        : Math.max(1, Math.ceil(assessed.maxAgeHours / 24)),
    stale: assessed.stale,
  };
}

/**
 * Bind subscription cursor state after a dynamic retrieval record (metadata only).
 */
export function applyDynamicRetrievalCursors(input: {
  subscription: ResearchTopicSubscription;
  europePmcNextCursorMark: string | null;
  europePmcLastPmid: string | null;
  retrievedAt: string;
  literatureHitCount: number;
}): ResearchTopicSubscription {
  validateResearchTopicSubscription(input.subscription);
  if (!isoOk(input.retrievedAt)) fail("Invalid retrievedAt");

  const cursors = input.subscription.cursors.map((c) => {
    if (c.provider !== "europe_pmc") return c;
    return advanceIncrementalCursor(c, {
      nextCursorMark: input.europePmcNextCursorMark,
      lastSeenExternalId: input.europePmcLastPmid,
      retrievedAt: input.retrievedAt,
      hitCount: input.literatureHitCount,
    });
  });

  const freshness = assessSubscriptionFreshness(
    {
      ...input.subscription.freshness,
      asOf: input.retrievedAt,
      lastSuccessfulCheckAt: input.retrievedAt,
    },
    input.retrievedAt,
  );

  const {contentHash: _priorHash, ...rest} = input.subscription;
  const body: Omit<ResearchTopicSubscription, "contentHash"> = {
    ...rest,
    cursors,
    freshness,
    updatedAt: input.retrievedAt,
  };
  const next: ResearchTopicSubscription = {
    ...body,
    contentHash: hashSubscription(body),
  };
  validateResearchTopicSubscription(next);
  return next;
}

/**
 * Scheduled check runner stub — fail-closed offline / gated live.
 * Does not perform live network I/O in PR1; live mode without gate stays gated_not_run.
 */
export function runIncrementalEvidenceMonitoringCheck(input: {
  subscription: ResearchTopicSubscription;
  mode: MonitoringRunMode;
  /** Required true for gated_live to leave gated_not_run. */
  liveGateEnabled?: boolean;
  generatedAt?: string;
  /** Fixture prior keys for duplicate detection honesty. */
  priorEvidenceKeys?: readonly string[];
  /** Fixture candidate identities observed this check (offline replay). */
  fixtureCandidates?: readonly {
    provider: MonitoringProviderRef;
    externalId: string;
  }[];
}): IncrementalMonitoringCheckReceipt {
  validateResearchTopicSubscription(input.subscription);
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  if (!isoOk(generatedAt)) fail("Invalid generatedAt");

  const startedAt = generatedAt;
  let status: MonitoringRunStatus;
  let liveNetworkUsed = false;
  let hitCountBounded = 0;
  let truncatedByBudget = false;
  let cursorsAfter = [...input.subscription.cursors];
  let dynamicRetrievalQuery: ResearcherQueryInput | null = null;
  let duplicates: DuplicateDetectionHook[] = [];

  if (input.mode === "offline_fixture") {
    status = "skipped_offline";
    dynamicRetrievalQuery = projectSubscriptionToResearcherQuery(input.subscription);
    const candidates = input.fixtureCandidates ?? [];
    hitCountBounded = Math.min(
      candidates.length,
      input.subscription.budgets.maxResults,
    );
    truncatedByBudget = candidates.length > input.subscription.budgets.maxResults;
    duplicates = detectDuplicateEvidenceKeys({
      priorKeys: input.priorEvidenceKeys ?? [],
      candidates: candidates.slice(0, input.subscription.budgets.maxResults),
    });
  } else if (input.liveGateEnabled !== true) {
    status = "gated_not_run";
    dynamicRetrievalQuery = projectSubscriptionToResearcherQuery(input.subscription);
  } else {
    // PR1 stub: even with gate, do not invent live success — status stays honest.
    status = "gated_not_run";
    liveNetworkUsed = false;
    dynamicRetrievalQuery = projectSubscriptionToResearcherQuery(input.subscription);
  }

  const sourceAvailability = reportSourceAvailability({
    providers: input.subscription.providers,
    mode: input.mode,
  });

  const freshness = assessSubscriptionFreshness(
    input.subscription.freshness,
    generatedAt,
  );

  const investigationFreshnessProjection: InvestigationFreshness | null =
    input.subscription.investigationId
      ? {
          asOf: freshness.asOf,
          maxAgeDays:
            freshness.maxAgeHours === null
              ? null
              : Math.max(1, Math.ceil(freshness.maxAgeHours / 24)),
          stale: freshness.stale,
        }
      : null;

  const body: Omit<IncrementalMonitoringCheckReceipt, "receiptHash"> = {
    schemaVersion: "hsi-incremental-monitoring-check-receipt-1",
    method: INCREMENTAL_MONITORING_METHOD,
    version: INCREMENTAL_MONITORING_VERSION,
    subscriptionId: input.subscription.subscriptionId,
    mode: input.mode,
    status,
    generatedAt,
    startedAt,
    completedAt: generatedAt,
    providersProbed: [...input.subscription.providers],
    cursorsAfter,
    duplicates,
    freshness,
    sourceAvailability,
    dynamicRetrievalQuery,
    investigationFreshnessProjection,
    hitCountBounded,
    truncatedByBudget,
    engineeringHarness: "CLEARED",
    scientificAcceptance: "BLOCKED",
    honesty: {
      ...input.subscription.honesty,
      liveNetworkUsed,
      offlineStatusHonest: true,
    },
  };

  return {...body, receiptHash: hashReceipt(body)};
}

export function buildIncrementalMonitoringPack(input: {
  subscriptions: readonly ResearchTopicSubscription[];
  generatedAt?: string;
}): IncrementalMonitoringPack {
  for (const s of input.subscriptions) validateResearchTopicSubscription(s);
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  if (!isoOk(generatedAt)) fail("Invalid generatedAt");
  return {
    schemaVersion: "hsi-incremental-monitoring-pack-1",
    method: INCREMENTAL_MONITORING_METHOD,
    version: INCREMENTAL_MONITORING_VERSION,
    generatedAt,
    subscriptions: [...input.subscriptions],
    honesty: defaultHonesty(),
  };
}

/** Persistence projection lines for existing Neon JSON / job patterns (no new table). */
export function projectMonitoringSubscriptionPersistenceLines(
  subscription: ResearchTopicSubscription,
): string[] {
  validateResearchTopicSubscription(subscription);
  return [
    `monitoring.subscription_id=${subscription.subscriptionId}`,
    `monitoring.topic_kind=${subscription.topicKind}`,
    `monitoring.topic_id=${subscription.topicId}`,
    `monitoring.investigation_id=${subscription.investigationId ?? ""}`,
    `monitoring.schedule=${subscription.schedule.interval}`,
    `monitoring.providers=${subscription.providers.join(",")}`,
    `monitoring.full_db_scrape=${subscription.budgets.fullDatabaseScrape}`,
    `monitoring.graph_promotable=${subscription.honesty.graphPromotable}`,
    `monitoring.scientific_approval=${subscription.honesty.scientificApproval}`,
    `monitoring.unreviewed_not_auto_approved=${subscription.honesty.unreviewedNotAutoApproved}`,
    `monitoring.change_detection=${!subscription.honesty.changeDetectionPipelineNotImplemented}`,
    `monitoring.content_hash=${subscription.contentHash}`,
  ];
}
