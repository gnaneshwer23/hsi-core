/**
 * N1 per-source passage reuse rights inventory.
 * Records provider OA/licence signals and pending human attestation.
 * Provider signals ≠ passage clearance ≠ claim entailment ≠ Gate C.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import type {N1Candidate, N1CandidateQueue} from "./n1CandidateQueue";
import {parseN1CandidateQueue} from "./n1CandidateQueue";
import type {BibliographicLookupResult, BibliographicRightsSignals} from "./europePmcBibliographicLookup";
import {assertValidDoi} from "./europePmcBibliographicLookup";
import type {N1ImportReceipt} from "./n1SourceVerification";
import {parseN1ImportReceipt} from "./n1SourceVerification";

export type N1PassageRightsDecision = "pending_human_review";

export type N1PassageRightsEntry = {
  queueId: string;
  sourceId: string;
  doi: string;
  pmid: string | null;
  pmcid: string | null;
  title: string | null;
  identityOutcome: N1ImportReceipt["results"][number]["outcome"];
  /** Always false in this inventory — no passage text is imported here. */
  passageTextImported: false;
  /** Fail-closed until an accountable human records permitted uses. */
  passageUsePermitted: false;
  rightsStatus: "unverified_metadata_only";
  decision: N1PassageRightsDecision;
  providerSignals: BibliographicRightsSignals | null;
  providerArticleUrl: string | null;
  humanAttestation: {
    decision: null;
    principal: null;
    recordedAt: null;
    licenceEvidenceUri: null;
    permittedUses: [];
    rationale: null;
  };
  notes: string[];
};

export type N1PassageRightsInventory = {
  schemaVersion: "hsi-n1-passage-rights-inventory-1";
  phase: "N1";
  programme: "gut_immune_t2d";
  remediationPhase: "production_readiness_audit_phase_2";
  generatedAt: string;
  mode: "offline_fixture" | "live_provider";
  scientificApproval: false;
  graphPromotable: false;
  claimEntailmentAssessed: false;
  anyPassageImported: false;
  anyPassageUsePermitted: false;
  n1ReceiptHash: string;
  honesty: {
    providerSignalsAreNotClearance: true;
    openAccessIsNotCorpusReusePermission: true;
    metadataOnlyUntilHumanRightsClearance: true;
  };
  entries: N1PassageRightsEntry[];
  summary: {
    total: 12;
    withProviderSignals: number;
    openAccessReported: number;
    providerLicenseLabelPresent: number;
    humanCleared: 0;
    passageImported: 0;
    pendingHumanReview: 12;
  };
  inventoryHash: string;
};

function emptySignalsNotes(candidate: N1Candidate, identityOutcome: N1PassageRightsEntry["identityOutcome"]): string[] {
  return [
    `Queue ${candidate.queueId} remains metadata-only.`,
    `Identity outcome: ${identityOutcome}.`,
    "No Europe PMC rights signals were attached (lookup failed or unmatched).",
    "Human licence evidence URI and permitted-use decision required before any passage import.",
  ];
}

function signalNotes(signals: BibliographicRightsSignals): string[] {
  const notes = [
    "Europe PMC OA/licence fields are provider observations only.",
    "Open-access or Creative Commons labels do not clear HSI corpus storage, display or research reuse.",
    "Exact passage text stays unimported until an accountable human records licenceEvidenceUri and permitted uses.",
  ];
  if (signals.isOpenAccess === "Y") {
    notes.push("Provider reported isOpenAccess=Y; still pending human reuse attestation.");
  }
  if (signals.isOpenAccess === "N") {
    notes.push("Provider reported isOpenAccess=N; treat as rights-restricted until human review.");
  }
  if (signals.providerLicenseLabel) {
    notes.push(`Provider license label recorded as "${signals.providerLicenseLabel}" (label only; URI unset).`);
  }
  if (signals.inPMC === "Y" || signals.inEPMC === "Y") {
    notes.push("Full text may be visible at PMC/Europe PMC; visibility ≠ HSI import permission.");
  }
  return notes;
}

function entryFromLookup(input: {
  candidate: N1Candidate;
  identityOutcome: N1PassageRightsEntry["identityOutcome"];
  lookup: BibliographicLookupResult | undefined;
}): N1PassageRightsEntry {
  const {candidate, identityOutcome, lookup} = input;
  const doi = assertValidDoi(candidate.doi);
  if (!lookup?.ok) {
    return {
      queueId: candidate.queueId,
      sourceId: candidate.sourceId,
      doi,
      pmid: null,
      pmcid: null,
      title: null,
      identityOutcome,
      passageTextImported: false,
      passageUsePermitted: false,
      rightsStatus: "unverified_metadata_only",
      decision: "pending_human_review",
      providerSignals: null,
      providerArticleUrl: null,
      humanAttestation: {
        decision: null,
        principal: null,
        recordedAt: null,
        licenceEvidenceUri: null,
        permittedUses: [],
        rationale: null,
      },
      notes: emptySignalsNotes(candidate, identityOutcome),
    };
  }
  const record = lookup.records.find((r) => r.doi === doi) ?? lookup.records[0] ?? null;
  if (!record) {
    return {
      queueId: candidate.queueId,
      sourceId: candidate.sourceId,
      doi,
      pmid: null,
      pmcid: null,
      title: null,
      identityOutcome,
      passageTextImported: false,
      passageUsePermitted: false,
      rightsStatus: "unverified_metadata_only",
      decision: "pending_human_review",
      providerSignals: null,
      providerArticleUrl: null,
      humanAttestation: {
        decision: null,
        principal: null,
        recordedAt: null,
        licenceEvidenceUri: null,
        permittedUses: [],
        rationale: null,
      },
      notes: emptySignalsNotes(candidate, identityOutcome),
    };
  }
  return {
    queueId: candidate.queueId,
    sourceId: candidate.sourceId,
    doi,
    pmid: record.pmid,
    pmcid: record.pmcid,
    title: record.title,
    identityOutcome,
    passageTextImported: false,
    passageUsePermitted: false,
    rightsStatus: "unverified_metadata_only",
    decision: "pending_human_review",
    providerSignals: record.rightsSignals,
    providerArticleUrl: record.url,
    humanAttestation: {
      decision: null,
      principal: null,
      recordedAt: null,
      licenceEvidenceUri: null,
      permittedUses: [],
      rationale: null,
    },
    notes: signalNotes(record.rightsSignals),
  };
}

function seal(body: Omit<N1PassageRightsInventory, "inventoryHash">): N1PassageRightsInventory {
  const inventoryHash = createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex");
  return {...body, inventoryHash};
}

export function parseN1PassageRightsInventory(value: unknown): N1PassageRightsInventory {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid N1 rights inventory");
  const inventory = value as N1PassageRightsInventory;
  if (
    inventory.schemaVersion !== "hsi-n1-passage-rights-inventory-1" ||
    inventory.phase !== "N1" ||
    inventory.programme !== "gut_immune_t2d" ||
    inventory.remediationPhase !== "production_readiness_audit_phase_2"
  ) {
    throw new Error("Unsupported N1 rights inventory");
  }
  if (
    inventory.scientificApproval !== false ||
    inventory.graphPromotable !== false ||
    inventory.claimEntailmentAssessed !== false ||
    inventory.anyPassageImported !== false ||
    inventory.anyPassageUsePermitted !== false
  ) {
    throw new Error("N1 rights inventory cannot claim clearance or passage import");
  }
  if (!Array.isArray(inventory.entries) || inventory.entries.length !== 12) {
    throw new Error("N1 rights inventory must cover all 12 candidates");
  }
  if (inventory.summary.humanCleared !== 0 || inventory.summary.passageImported !== 0 || inventory.summary.pendingHumanReview !== 12) {
    throw new Error("N1 rights inventory must keep all 12 pending human review");
  }
  for (const entry of inventory.entries) {
    if (entry.passageTextImported || entry.passageUsePermitted || entry.rightsStatus !== "unverified_metadata_only") {
      throw new Error("N1 rights entry must remain metadata-only and uncleared");
    }
    if (entry.decision !== "pending_human_review" || entry.humanAttestation.decision !== null) {
      throw new Error("N1 rights entry cannot invent human attestation");
    }
    if (entry.humanAttestation.licenceEvidenceUri !== null || entry.humanAttestation.permittedUses.length !== 0) {
      throw new Error("N1 rights entry cannot invent licence evidence");
    }
  }
  const {inventoryHash, ...body} = inventory;
  const expected = createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex");
  if (inventoryHash !== expected) throw new Error("N1 rights inventory hash mismatch");
  return inventory;
}

/** Build fail-closed per-source rights inventory from an N1 receipt + the lookups used to produce it. */
export function buildN1PassageRightsInventory(input: {
  queue: N1CandidateQueue;
  receipt: N1ImportReceipt;
  lookups: Record<string, BibliographicLookupResult>;
  generatedAt: string;
}): N1PassageRightsInventory {
  const queue = parseN1CandidateQueue(input.queue);
  const receipt = parseN1ImportReceipt(input.receipt);
  if (receipt.results.some((r) => r.passageTextImported)) {
    throw new Error("N1 rights inventory refuses receipts that already imported passages");
  }
  const byId = Object.fromEntries(receipt.results.map((r) => [r.queueId, r]));
  const entries = queue.candidates.map((candidate) =>
    entryFromLookup({
      candidate,
      identityOutcome: byId[candidate.queueId]?.outcome ?? "lookup_failed",
      lookup: input.lookups[candidate.queueId],
    }),
  );
  const withSignals = entries.filter((e) => e.providerSignals !== null).length;
  const openAccessReported = entries.filter((e) => e.providerSignals?.isOpenAccess === "Y").length;
  const providerLicenseLabelPresent = entries.filter((e) => !!e.providerSignals?.providerLicenseLabel).length;
  return seal({
    schemaVersion: "hsi-n1-passage-rights-inventory-1",
    phase: "N1",
    programme: "gut_immune_t2d",
    remediationPhase: "production_readiness_audit_phase_2",
    generatedAt: input.generatedAt,
    mode: receipt.mode,
    scientificApproval: false,
    graphPromotable: false,
    claimEntailmentAssessed: false,
    anyPassageImported: false,
    anyPassageUsePermitted: false,
    n1ReceiptHash: receipt.receiptHash,
    honesty: {
      providerSignalsAreNotClearance: true,
      openAccessIsNotCorpusReusePermission: true,
      metadataOnlyUntilHumanRightsClearance: true,
    },
    entries,
    summary: {
      total: 12,
      withProviderSignals: withSignals,
      openAccessReported,
      providerLicenseLabelPresent,
      humanCleared: 0,
      passageImported: 0,
      pendingHumanReview: 12,
    },
  });
}
