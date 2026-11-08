/**
 * N1 #2 rights eng-assist: factual Crossref / Europe PMC licence lookups.
 * Never invents MoU, Gate C, humanCleared, passageImported, or attestation stamps.
 * Incomplete / partial lookup ≠ rights CLEARED.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import type {N1PassageRightsInventory} from "./n1PassageRightsInventory";
import {parseN1PassageRightsInventory} from "./n1PassageRightsInventory";
import type {N1AttestationWorksheet} from "../ops/humanQueueResidualPrep";
import {parseN1AttestationWorksheet} from "../ops/humanQueueResidualPrep";
import {
  parseCrossrefWorksLicencePayload,
  type CrossrefWorksLicenceOk,
  type CrossrefWorksLicenceResult,
} from "./crossrefWorksLicenceLookup";

export const N1_LICENCE_LOOKUP_ASSIST_SCHEMA = "hsi-n1-licence-lookup-assist-1" as const;

export type N1EngLookupStatus =
  | "candidate_uri_observed"
  | "cc_uri_under_tdm_only"
  | "tdm_or_publisher_stub_only"
  | "empty_crossref_licences"
  | "lookup_failed";

export type N1LicenceLookupAssistRow = {
  queueId: string;
  sourceId: string;
  doi: string;
  pmid: string | null;
  pmcid: string | null;
  providerArticleUrl: string | null;
  providerLicenseLabel: string | null;
  providerIsOpenAccess: string | null;
  /** Eng-filled factual Crossref observations — not attestation.licenceEvidenceUri. */
  engLookup: {
    filledBy: "engineering";
    status: N1EngLookupStatus;
    crossrefResolvedDoi: string | null;
    crossrefPublisher: string | null;
    candidateEvidenceUrls: string[];
    tdmUrls: string[];
    creativeCommonsUrlsUnderTdmOnly: string[];
    doiRedirected: boolean;
    notes: string[];
  };
  /** Human-required attestation fields remain empty until principal signs. */
  humanAttestationRequired: {
    decision: null;
    principal: null;
    recordedAt: null;
    licenceEvidenceUri: null;
    permittedUses: [];
    rationale: null;
    passageImportAuthorized: false;
  };
  humanRequired: true;
  blocker: string | null;
};

export type N1LicenceLookupAssist = {
  schemaVersion: typeof N1_LICENCE_LOOKUP_ASSIST_SCHEMA;
  residualId: "audit_2_n1_rights";
  generatedAt: string;
  engPhaseStatus: "IN_PROGRESS_ENG_ASSIST";
  /** Explicit: lookups do not clear rights. */
  rightsCleared: false;
  humanAcceptance: "BLOCKED";
  scientificApproval: false;
  anyPassageImported: false;
  humanCleared: 0;
  passageImported: 0;
  honesty: {
    providerSignalsAreNotClearance: true;
    openAccessIsNotCorpusReusePermission: true;
    emptyAttestationIsNotClearance: true;
    incompleteLookupIsNotCleared: true;
    noInventedLicenceEvidenceUri: true;
    engLookupIsNotHumanAttestation: true;
    metadataOnlyUntilHumanRightsClearance: true;
  };
  rows: N1LicenceLookupAssistRow[];
  summary: {
    rows: 12;
    factualCandidateUriObserved: number;
    ccUriUnderTdmOnly: number;
    lookedUpNoCandidateUri: number;
    lookupFailed: number;
    stillNeedsHumanPrincipal: 12;
    attested: 0;
    pending: 12;
  };
  assistHash: string;
};

export type N1AttestationCompletenessReport = {
  residualId: "audit_2_n1_rights";
  engPhaseStatus: "IN_PROGRESS_ENG_ASSIST";
  rightsCleared: false;
  humanAcceptance: "BLOCKED";
  incompleteIsNotCleared: true;
  humanCleared: 0;
  passageImported: 0;
  rows: 12;
  attested: 0;
  pending: 12;
  incompleteRows: string[];
  factualCandidateUriObserved: number;
  stillNeedsHumanPrincipal: 12;
  gate: "FAIL_CLOSED_INCOMPLETE";
};

function seal(body: Omit<N1LicenceLookupAssist, "assistHash">): N1LicenceLookupAssist {
  const assistHash = createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex");
  return {...body, assistHash};
}

function classifyLookup(obs: CrossrefWorksLicenceOk): {
  status: N1EngLookupStatus;
  notes: string[];
  blocker: string | null;
} {
  const notes: string[] = [
    "Crossref license rows are provider observations only — not HSI passage clearance.",
    "Do not copy engLookup URLs into attestation.licenceEvidenceUri without human principal review of publisher terms.",
  ];
  if (obs.doiRedirected) {
    notes.push(
      `Crossref resolved DOI ${obs.resolvedDoi} (requested ${obs.requestedDoi}); confirm identity before attesting.`,
    );
  }
  if (obs.candidateEvidenceUrls.length > 0) {
    notes.push(
      `Observed ${obs.candidateEvidenceUrls.length} non-TDM vor/unspecified Crossref licence URL(s) for human review.`,
    );
    const springerTdmStub = obs.candidateEvidenceUrls.every((u) => /springer\.com\/tdm/i.test(u));
    if (springerTdmStub) {
      return {
        status: "tdm_or_publisher_stub_only",
        notes: [
          ...notes,
          "Non-TDM Crossref URL(s) are Springer TDM stubs — not corpus reuse licences; open publisher terms.",
        ],
        blocker: "Crossref only reports publisher TDM stub URLs; human must open publisher / VoR terms.",
      };
    }
    if (obs.candidateEvidenceUrls.some((u) => /by-nc|by-nd|by-nc-nd/i.test(u))) {
      notes.push(
        "Observed licence includes NC and/or ND terms — prefer metadata-only until human confirms permittedUses for HSI corpus.",
      );
    }
    if (obs.candidateEvidenceUrls.some((u) => /elsevier\.com\/open-access\/userlicense/i.test(u))) {
      notes.push(
        "Elsevier OA userlicense URL is not Creative Commons — human must decide cite-metadata vs passage scope.",
      );
    }
    return {
      status: "candidate_uri_observed",
      notes,
      blocker: null,
    };
  }
  if (obs.creativeCommonsUrlsUnderTdmOnly.length > 0) {
    return {
      status: "cc_uri_under_tdm_only",
      notes: [
        ...notes,
        "Creative Commons URL appears only under Crossref content-version=tdm; RA-style import refuses TDM-only. Human must confirm VoR / publisher OA statement.",
      ],
      blocker: "CC URL under TDM-only Crossref row — prefer metadata-only until human confirms VoR reuse terms.",
    };
  }
  if (obs.hasEmptyLicenceArray) {
    return {
      status: "empty_crossref_licences",
      notes: [...notes, "Crossref works license array is empty."],
      blocker: "No Crossref licence URL; human must open publisher landing / Europe PMC article page.",
    };
  }
  return {
    status: "tdm_or_publisher_stub_only",
    notes: [...notes, "Crossref licences are TDM-only or non-candidate stubs."],
    blocker: "Crossref lacks vor/unspecified reuse URI; human must open publisher terms (prefer metadata-only if ambiguous).",
  };
}

function rowFromInventoryAndLookup(input: {
  entry: N1PassageRightsInventory["entries"][number];
  lookup: CrossrefWorksLicenceResult;
}): N1LicenceLookupAssistRow {
  const {entry, lookup} = input;
  const humanAttestationRequired = {
    decision: null,
    principal: null,
    recordedAt: null,
    licenceEvidenceUri: null,
    permittedUses: [] as [],
    rationale: null,
    passageImportAuthorized: false as const,
  };
  if (!lookup.ok) {
    return {
      queueId: entry.queueId,
      sourceId: entry.sourceId,
      doi: entry.doi,
      pmid: entry.pmid,
      pmcid: entry.pmcid,
      providerArticleUrl: entry.providerArticleUrl,
      providerLicenseLabel: entry.providerSignals?.providerLicenseLabel ?? null,
      providerIsOpenAccess: entry.providerSignals?.isOpenAccess ?? null,
      engLookup: {
        filledBy: "engineering",
        status: "lookup_failed",
        crossrefResolvedDoi: null,
        crossrefPublisher: null,
        candidateEvidenceUrls: [],
        tdmUrls: [],
        creativeCommonsUrlsUnderTdmOnly: [],
        doiRedirected: false,
        notes: [
          `Crossref lookup failed (${lookup.outcome}): ${lookup.detail}`,
          "Europe PMC OA/licence labels remain observations only.",
        ],
      },
      humanAttestationRequired,
      humanRequired: true,
      blocker: "Crossref lookup failed; human must use publisher / Europe PMC landing pages.",
    };
  }
  const classified = classifyLookup(lookup);
  return {
    queueId: entry.queueId,
    sourceId: entry.sourceId,
    doi: entry.doi,
    pmid: entry.pmid,
    pmcid: entry.pmcid,
    providerArticleUrl: entry.providerArticleUrl,
    providerLicenseLabel: entry.providerSignals?.providerLicenseLabel ?? null,
    providerIsOpenAccess: entry.providerSignals?.isOpenAccess ?? null,
    engLookup: {
      filledBy: "engineering",
      status: classified.status,
      crossrefResolvedDoi: lookup.resolvedDoi,
      crossrefPublisher: lookup.publisher,
      candidateEvidenceUrls: lookup.candidateEvidenceUrls,
      tdmUrls: lookup.tdmUrls,
      creativeCommonsUrlsUnderTdmOnly: lookup.creativeCommonsUrlsUnderTdmOnly,
      doiRedirected: lookup.doiRedirected,
      notes: classified.notes,
    },
    humanAttestationRequired,
    humanRequired: true,
    blocker: classified.blocker,
  };
}

/** Build sealed eng-assist pack from rights inventory + Crossref lookup results. */
export function buildN1LicenceLookupAssist(input: {
  inventory: N1PassageRightsInventory;
  lookups: Record<string, CrossrefWorksLicenceResult>;
  generatedAt: string;
}): N1LicenceLookupAssist {
  const inventory = parseN1PassageRightsInventory(input.inventory);
  const rows = inventory.entries.map((entry) => {
    const lookup = input.lookups[entry.queueId];
    if (!lookup) {
      return rowFromInventoryAndLookup({
        entry,
        lookup: {
          ok: false,
          provider: "crossref_works",
          requestedDoi: entry.doi,
          retrievedAt: input.generatedAt,
          outcome: "invalid_response",
          detail: "Missing Crossref lookup for queue row",
        },
      });
    }
    return rowFromInventoryAndLookup({entry, lookup});
  });
  if (rows.length !== 12) throw new Error("N1 licence lookup assist must cover 12 rows");
  const factualCandidateUriObserved = rows.filter((r) => r.engLookup.status === "candidate_uri_observed").length;
  const ccUriUnderTdmOnly = rows.filter((r) => r.engLookup.status === "cc_uri_under_tdm_only").length;
  const lookupFailed = rows.filter((r) => r.engLookup.status === "lookup_failed").length;
  const lookedUpNoCandidateUri = 12 - factualCandidateUriObserved - lookupFailed;
  return seal({
    schemaVersion: N1_LICENCE_LOOKUP_ASSIST_SCHEMA,
    residualId: "audit_2_n1_rights",
    generatedAt: input.generatedAt,
    engPhaseStatus: "IN_PROGRESS_ENG_ASSIST",
    rightsCleared: false,
    humanAcceptance: "BLOCKED",
    scientificApproval: false,
    anyPassageImported: false,
    humanCleared: 0,
    passageImported: 0,
    honesty: {
      providerSignalsAreNotClearance: true,
      openAccessIsNotCorpusReusePermission: true,
      emptyAttestationIsNotClearance: true,
      incompleteLookupIsNotCleared: true,
      noInventedLicenceEvidenceUri: true,
      engLookupIsNotHumanAttestation: true,
      metadataOnlyUntilHumanRightsClearance: true,
    },
    rows,
    summary: {
      rows: 12,
      factualCandidateUriObserved,
      ccUriUnderTdmOnly,
      lookedUpNoCandidateUri,
      lookupFailed,
      stillNeedsHumanPrincipal: 12,
      attested: 0,
      pending: 12,
    },
  });
}

export function parseN1LicenceLookupAssist(value: unknown): N1LicenceLookupAssist {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid N1 licence lookup assist");
  }
  const assist = value as N1LicenceLookupAssist;
  if (assist.schemaVersion !== N1_LICENCE_LOOKUP_ASSIST_SCHEMA) {
    throw new Error("Unsupported N1 licence lookup assist schema");
  }
  if (
    assist.rightsCleared !== false ||
    assist.humanAcceptance !== "BLOCKED" ||
    assist.humanCleared !== 0 ||
    assist.passageImported !== 0 ||
    assist.anyPassageImported !== false ||
    assist.scientificApproval !== false ||
    assist.engPhaseStatus !== "IN_PROGRESS_ENG_ASSIST"
  ) {
    throw new Error("N1 licence lookup assist cannot claim rights clearance or passage import");
  }
  if (!Array.isArray(assist.rows) || assist.rows.length !== 12) {
    throw new Error("N1 licence lookup assist must cover 12 rows");
  }
  if (assist.summary.stillNeedsHumanPrincipal !== 12 || assist.summary.attested !== 0) {
    throw new Error("N1 licence lookup assist must keep all 12 pending human principal");
  }
  for (const row of assist.rows) {
    if (!row.humanRequired) throw new Error("N1 assist row must remain humanRequired");
    if (
      row.humanAttestationRequired.decision !== null ||
      row.humanAttestationRequired.principal !== null ||
      row.humanAttestationRequired.licenceEvidenceUri !== null ||
      row.humanAttestationRequired.permittedUses.length !== 0 ||
      row.humanAttestationRequired.passageImportAuthorized !== false
    ) {
      throw new Error("N1 assist cannot invent human attestation fields");
    }
    if (row.engLookup.filledBy !== "engineering") {
      throw new Error("N1 assist engLookup.filledBy must be engineering");
    }
  }
  const {assistHash, ...body} = assist;
  const expected = createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex");
  if (assistHash !== expected) throw new Error("N1 licence lookup assist hash mismatch");
  return assist;
}

/** Fail-closed completeness: empty/partial attestation ≠ CLEARED. */
export function reportN1AttestationCompleteness(input: {
  worksheet: N1AttestationWorksheet;
  assist: N1LicenceLookupAssist;
}): N1AttestationCompletenessReport {
  const worksheet = parseN1AttestationWorksheet(input.worksheet);
  const assist = parseN1LicenceLookupAssist(input.assist);
  const incompleteRows = worksheet.rows
    .filter(
      (row) =>
        row.attestation.decision === null ||
        row.attestation.principal === null ||
        row.attestation.licenceEvidenceUri === null ||
        row.attestation.permittedUses.length === 0,
    )
    .map((row) => row.queueId);
  if (incompleteRows.length !== 12) {
    // Worksheet parser already refuses any filled attestation; keep explicit fail-closed.
    throw new Error("Unexpected partial attestation in worksheet — human stamp path not yet wired for eng");
  }
  return {
    residualId: "audit_2_n1_rights",
    engPhaseStatus: "IN_PROGRESS_ENG_ASSIST",
    rightsCleared: false,
    humanAcceptance: "BLOCKED",
    incompleteIsNotCleared: true,
    humanCleared: 0,
    passageImported: 0,
    rows: 12,
    attested: 0,
    pending: 12,
    incompleteRows,
    factualCandidateUriObserved: assist.summary.factualCandidateUriObserved,
    stillNeedsHumanPrincipal: 12,
    gate: "FAIL_CLOSED_INCOMPLETE",
  };
}

/** Assert completeness gate refuses treating incomplete as cleared. */
export function assertN1AttestationNotCleared(report: N1AttestationCompletenessReport): void {
  if (report.rightsCleared !== false || report.gate !== "FAIL_CLOSED_INCOMPLETE") {
    throw new Error("N1 attestation completeness gate must fail-closed while incomplete");
  }
  if (report.humanCleared !== 0 || report.attested !== 0 || report.pending !== 12) {
    throw new Error("N1 attestation completeness cannot treat empty/partial as approved");
  }
}

export function loadCrossrefFixtureLookup(input: {
  queueId: string;
  doi: string;
  bodyText: string;
  retrievedAt: string;
}): CrossrefWorksLicenceResult {
  return parseCrossrefWorksLicencePayload({
    requestedDoi: input.doi,
    bodyText: input.bodyText,
    retrievedAt: input.retrievedAt,
  });
}
