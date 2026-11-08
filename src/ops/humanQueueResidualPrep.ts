/**
 * HUMAN QUEUE residual pack (post Audit #1–#10 eng scaffolds).
 * Deepens eng-safe operator surfaces for residuals #2 / #3 / #4 / #5 / #8.
 * Never invents MoU, claim_support, SME labels, licence clearance, Gate C, or production writes.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "../evidence/researchEvidenceCorpus";

export const HUMAN_QUEUE_SCHEMA = "hsi-human-queue-residuals-1" as const;
export const N1_ATTESTATION_WORKSHEET_SCHEMA = "hsi-n1-rights-attestation-worksheet-1" as const;
export const N3_SME_WORKSHEET_SCHEMA = "hsi-n3-sme-label-worksheet-1" as const;
export const STAGING_OPS_WORKSHEET_SCHEMA = "hsi-staging-ops-acceptance-worksheet-1" as const;
export const PARTNER_MOU_WORKSHEET_SCHEMA = "hsi-partner-mou-attestation-worksheet-1" as const;

export type HumanResidualId =
  | "audit_2_n1_rights"
  | "audit_3_isi_cite_hitl"
  | "audit_4_n3_sme_labels"
  | "audit_5_staging_two_account"
  | "audit_8_partner_mou";

export type ResidualPlane =
  | "science"
  | "hitl"
  | "ops"
  | "founder";

export type ResidualStatus = "ENG_CLEARED_HUMAN_BLOCKED";

export type HumanQueueResidual = {
  residualId: HumanResidualId;
  auditPhase: 2 | 3 | 4 | 5 | 8;
  title: string;
  plane: ResidualPlane;
  status: ResidualStatus;
  engScaffoldCleared: true;
  humanAcceptance: "BLOCKED";
  neonTarget: "red-wave" | "autumn-snow" | "none";
  metricSnapshot: {
    key: string;
    value: number | string | boolean | null;
  }[];
  checklistPath: string;
  worksheetPath: string;
  verifyCommand: string;
  onlyHumansCan: string[];
  engMustNever: string[];
};

export type N1AttestationRow = {
  queueId: string;
  sourceId: string;
  doi: string;
  providerArticleUrl: string | null;
  providerLicenseLabel: string | null;
  providerIsOpenAccess: string | null;
  /** Empty until accountable human fills — keep null in git. */
  attestation: {
    decision: null;
    principal: null;
    recordedAt: null;
    licenceEvidenceUri: null;
    permittedUses: [];
    rationale: null;
    passageImportAuthorized: false;
  };
  curatorPrompt: string;
};

export type N1AttestationWorksheet = {
  schemaVersion: typeof N1_ATTESTATION_WORKSHEET_SCHEMA;
  residualId: "audit_2_n1_rights";
  generatedAt: string;
  engineeringScaffold: "CLEARED";
  humanAcceptance: "BLOCKED";
  scientificApproval: false;
  anyPassageImported: false;
  anyLicenceEvidenceUriSet: false;
  humanCleared: 0;
  passageImported: 0;
  honesty: {
    providerSignalsAreNotClearance: true;
    openAccessIsNotCorpusReusePermission: true;
    emptyAttestationIsNotClearance: true;
    noInventedLicenceEvidenceUri: true;
    metadataOnlyUntilHumanRightsClearance: true;
  };
  rows: N1AttestationRow[];
  summary: {
    rows: 12;
    attested: 0;
    pending: 12;
  };
  worksheetHash: string;
};

export type N3SmeWorksheetRow = {
  itemId: string;
  itemHash: string;
  expectedOutcome: null;
  annotatorId: null;
  labelledAt: null;
  rationale: null;
  disagreement: "none";
  adjudicatorId: null;
  adjudicatedAt: null;
  insufficientContext: true;
};

export type N3SmeLabelWorksheet = {
  schemaVersion: typeof N3_SME_WORKSHEET_SCHEMA;
  residualId: "audit_4_n3_sme_labels";
  generatedAt: string;
  engineeringScaffold: "CLEARED";
  humanLabelFreeze: "BLOCKED";
  scientificAcceptance: "BLOCKED";
  fabricatedLabelsPermitted: false;
  honesty: {
    emptyLabelsAreNotScores: true;
    roleSlotsAreNotPeople: true;
    noInventedSmeIdentities: true;
    noGateCAutoApprove: true;
  };
  smeRosterSlots: {
    slotId: string;
    roleLabel: string;
    principal: null;
    organisation: null;
    recruitedAt: null;
    credentialsAttested: false;
  }[];
  rows: N3SmeWorksheetRow[];
  summary: {
    smeSlotsReserved: number;
    smeSlotsFilled: 0;
    calibrationRows: number;
    labelledRows: 0;
  };
  worksheetHash: string;
};

export type StagingOpsAcceptanceWorksheet = {
  schemaVersion: typeof STAGING_OPS_WORKSHEET_SCHEMA;
  residualId: "audit_5_staging_two_account";
  generatedAt: string;
  engineeringScaffold: "CLEARED";
  opsAcceptance: "BLOCKED";
  liveAuthVerified: false;
  researchWritesLiveVerified: false;
  productionWritesEnabled: false;
  authAWwwUserConfirmed: true;
  honesty: {
    roleSlotsAreNotAccounts: true;
    noInventedNeonAuthPrincipals: true;
    noProductionWritesFromThisWorksheet: true;
    noAutumnSnowForHsi: true;
    noGateCAutoApprove: true;
  };
  accountSlots: {
    slotId: string;
    roleLabel: string;
    neonAuthUserId: null;
    email: null;
    emailVerified: false;
    researchAccessGranted: false;
    reviewerAuthorityGranted: false;
  }[];
  journeyReceipt: {
    researcherInvestigationCreated: null;
    reviewerIndependentDecision: null;
    denialCasesExercised: null;
    stagingWritesEnabledObserved: null;
    productionWritesRemainDisabledObserved: null;
    privateOpsReceiptUri: null;
    recordedAt: null;
    principal: null;
  };
  summary: {
    accountSlotsReserved: number;
    accountSlotsFilled: 0;
    journeyStepsCompleted: 0;
  };
  worksheetHash: string;
};

export type PartnerMouAttestationWorksheet = {
  schemaVersion: typeof PARTNER_MOU_WORKSHEET_SCHEMA;
  residualId: "audit_8_partner_mou";
  generatedAt: string;
  engineeringScaffold: "CLEARED";
  founderAcceptance: "BLOCKED";
  lockedPilot: false;
  legalBinding: false;
  agreementKind: "hypothetical_test_only";
  honesty: {
    fixturePartnerSignedIsNotMou: true;
    emptyMouSlotsAreNotAgreements: true;
    noInventedMouText: true;
    noInventedNamedOrg: true;
    priorApoloPathRevoked: true;
  };
  mouSlots: {
    slotId: string;
    roleLabel: string;
    organisationName: null;
    writtenConfirmUri: null;
    mouDocumentUri: null;
    mouSignedAt: null;
    legalBindingAttested: false;
  }[];
  founderAttestation: {
    principal: null;
    recordedAt: null;
    legalBinding: false;
    writtenConfirmObserved: false;
    notes: null;
  };
  summary: {
    mouSlotsReserved: number;
    mouSlotsFilled: 0;
  };
  worksheetHash: string;
};

export type CiteHitlResidualPointer = {
  residualId: "audit_3_isi_cite_hitl";
  productRepo: "immunecity";
  neonTarget: "autumn-snow";
  engScaffoldCleared: true;
  hitlAcceptance: "BLOCKED";
  pinSupports: 0;
  pinPublicCiteApproved: 0;
  readyForHumanSupportsAssess: 13;
  checklistPath: "immunecity/docs/GATE_C_CURATOR_PATH.md";
  runbookPath: "immunecity/docs/engineering/CITE_HITL_CURATOR_RUNBOOK.md";
  worksheetPath: "immunecity/public/hsi-discovery/cite-hitl-residual-worksheet.json";
  verifyCommand: "cd immunecity && bun run hsi:curator-status && bun run hsi:cite-hitl:check";
  onlyHumansCan: string[];
  engMustNever: string[];
};

export type HumanQueueResidualPack = {
  schemaVersion: typeof HUMAN_QUEUE_SCHEMA;
  remediationPhase: "production_readiness_human_queue_residuals";
  generatedAt: string;
  rankedEngTrack: "COMPLETE_THROUGH_10";
  engineeringScaffold: "CLEARED";
  humanAcceptance: "BLOCKED";
  honesty: {
    noInventedMou: true;
    noInventedClaimSupport: true;
    noInventedSmeLabels: true;
    noInventedLicenceClearance: true;
    noGateCAutoApprove: true;
    noLiveCdsPhi: true;
    noProductionWritesEnabled: true;
    hsiNeonRedWaveOnly: true;
    isiCiteNeonAutumnSnowOnly: true;
  };
  residuals: HumanQueueResidual[];
  citeHitlPointer: CiteHitlResidualPointer;
  stopList: string[];
  summary: {
    residualCount: 5;
    engClearedHumanBlocked: 5;
    n1HumanCleared: 0;
    n1PassageImported: 0;
    citeSupports: 0;
    citePublicApproved: 0;
    n3Labels: 0;
    n3SmeSlotsFilled: 0;
    stagingAccountSlotsFilled: 0;
    stagingOpsAcceptance: "BLOCKED";
    partnerMouSlotsFilled: 0;
    partnerLockedPilot: false;
  };
  packHash: string;
};

export class HumanQueueResidualPrepError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HumanQueueResidualPrepError";
  }
}

function digest(value: unknown): string {
  return createHash("sha256").update(canonicalEvidenceJson(value)).digest("hex");
}

function sealWorksheet<T extends {worksheetHash?: string}>(
  body: Omit<T, "worksheetHash">,
): T {
  return {...body, worksheetHash: digest(body)} as T;
}

function sealPack(body: Omit<HumanQueueResidualPack, "packHash">): HumanQueueResidualPack {
  return {...body, packHash: digest(body)};
}

export type N1AttestationSourceRow = {
  queueId: string;
  sourceId: string;
  doi: string;
  providerArticleUrl: string | null;
  providerLicenseLabel: string | null;
  providerIsOpenAccess: string | null;
};

/** Map rights-inventory entries → attestation source rows (provider signals only). */
export function n1AttestationSourcesFromRightsInventory(inventory: {
  entries: Array<{
    queueId: string;
    sourceId: string;
    doi: string;
    providerArticleUrl: string | null;
    providerSignals: {
      isOpenAccess: string | null;
      providerLicenseLabel: string | null;
    } | null;
  }>;
}): N1AttestationSourceRow[] {
  if (!Array.isArray(inventory.entries) || inventory.entries.length !== 12) {
    throw new HumanQueueResidualPrepError("Rights inventory must provide 12 entries for attestation worksheet");
  }
  return inventory.entries.map((e) => ({
    queueId: e.queueId,
    sourceId: e.sourceId,
    doi: e.doi,
    providerArticleUrl: e.providerArticleUrl,
    providerLicenseLabel: e.providerSignals?.providerLicenseLabel ?? null,
    providerIsOpenAccess: e.providerSignals?.isOpenAccess ?? null,
  }));
}

export function buildN1AttestationWorksheet(input: {
  generatedAt: string;
  sources: readonly N1AttestationSourceRow[];
}): N1AttestationWorksheet {
  if (input.sources.length !== 12) {
    throw new HumanQueueResidualPrepError("N1 attestation worksheet requires exactly 12 sources");
  }
  const rows: N1AttestationRow[] = input.sources.map((src) => ({
    queueId: src.queueId,
    sourceId: src.sourceId,
    doi: src.doi,
    providerArticleUrl: src.providerArticleUrl,
    providerLicenseLabel: src.providerLicenseLabel,
    providerIsOpenAccess: src.providerIsOpenAccess,
    attestation: {
      decision: null,
      principal: null,
      recordedAt: null,
      licenceEvidenceUri: null,
      permittedUses: [],
      rationale: null,
      passageImportAuthorized: false,
    },
    curatorPrompt:
      "Human only: record licenceEvidenceUri + permittedUses from publisher terms; do not invent clearance from Europe PMC OA labels; keep passageImported=0 until attested.",
  }));
  return sealWorksheet({
    schemaVersion: N1_ATTESTATION_WORKSHEET_SCHEMA,
    residualId: "audit_2_n1_rights",
    generatedAt: input.generatedAt,
    engineeringScaffold: "CLEARED",
    humanAcceptance: "BLOCKED",
    scientificApproval: false,
    anyPassageImported: false,
    anyLicenceEvidenceUriSet: false,
    humanCleared: 0,
    passageImported: 0,
    honesty: {
      providerSignalsAreNotClearance: true,
      openAccessIsNotCorpusReusePermission: true,
      emptyAttestationIsNotClearance: true,
      noInventedLicenceEvidenceUri: true,
      metadataOnlyUntilHumanRightsClearance: true,
    },
    rows,
    summary: {rows: 12, attested: 0, pending: 12},
  });
}

export function parseN1AttestationWorksheet(value: unknown): N1AttestationWorksheet {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HumanQueueResidualPrepError("Invalid N1 attestation worksheet");
  }
  const sheet = value as N1AttestationWorksheet;
  if (sheet.schemaVersion !== N1_ATTESTATION_WORKSHEET_SCHEMA) {
    throw new HumanQueueResidualPrepError("Unsupported N1 attestation worksheet schema");
  }
  if (
    sheet.humanAcceptance !== "BLOCKED" ||
    sheet.humanCleared !== 0 ||
    sheet.passageImported !== 0 ||
    sheet.anyPassageImported !== false ||
    sheet.anyLicenceEvidenceUriSet !== false ||
    sheet.scientificApproval !== false
  ) {
    throw new HumanQueueResidualPrepError(
      "N1 attestation worksheet cannot invent clearance or passage import",
    );
  }
  if (!Array.isArray(sheet.rows) || sheet.rows.length !== 12) {
    throw new HumanQueueResidualPrepError("N1 attestation worksheet must cover 12 sources");
  }
  for (const row of sheet.rows) {
    if (
      row.attestation.decision !== null ||
      row.attestation.principal !== null ||
      row.attestation.licenceEvidenceUri !== null ||
      row.attestation.permittedUses.length !== 0 ||
      row.attestation.passageImportAuthorized !== false
    ) {
      throw new HumanQueueResidualPrepError(
        "N1 attestation worksheet cannot invent licenceEvidenceUri or principals",
      );
    }
  }
  const {worksheetHash, ...body} = sheet;
  if (worksheetHash !== digest(body)) {
    throw new HumanQueueResidualPrepError("N1 attestation worksheet hash mismatch");
  }
  return sheet;
}

export function buildN3SmeLabelWorksheet(input: {
  generatedAt: string;
  labelRows: ReadonlyArray<{
    itemId: string;
    itemHash: string;
    expectedOutcome: null;
    annotatorId: null;
    labelledAt: null;
    rationale: null;
    disagreement: "none";
    insufficientContext: boolean;
  }>;
}): N3SmeLabelWorksheet {
  if (input.labelRows.length < 20 || input.labelRows.length > 50) {
    throw new HumanQueueResidualPrepError("N3 SME worksheet expects 20–50 calibration rows");
  }
  for (const row of input.labelRows) {
    if (
      row.expectedOutcome !== null ||
      row.annotatorId !== null ||
      row.labelledAt !== null ||
      row.rationale !== null
    ) {
      throw new HumanQueueResidualPrepError("N3 SME worksheet refuses pre-filled scientific labels");
    }
  }
  const rows: N3SmeWorksheetRow[] = input.labelRows.map((row) => ({
    itemId: row.itemId,
    itemHash: row.itemHash,
    expectedOutcome: null,
    annotatorId: null,
    labelledAt: null,
    rationale: null,
    disagreement: "none",
    adjudicatorId: null,
    adjudicatedAt: null,
    insufficientContext: true,
  }));
  return sealWorksheet({
    schemaVersion: N3_SME_WORKSHEET_SCHEMA,
    residualId: "audit_4_n3_sme_labels",
    generatedAt: input.generatedAt,
    engineeringScaffold: "CLEARED",
    humanLabelFreeze: "BLOCKED",
    scientificAcceptance: "BLOCKED",
    fabricatedLabelsPermitted: false,
    honesty: {
      emptyLabelsAreNotScores: true,
      roleSlotsAreNotPeople: true,
      noInventedSmeIdentities: true,
      noGateCAutoApprove: true,
    },
    smeRosterSlots: [
      {
        slotId: "SME-ANNOTATOR-A",
        roleLabel: "Annotator A",
        principal: null,
        organisation: null,
        recruitedAt: null,
        credentialsAttested: false,
      },
      {
        slotId: "SME-ANNOTATOR-B",
        roleLabel: "Annotator B",
        principal: null,
        organisation: null,
        recruitedAt: null,
        credentialsAttested: false,
      },
      {
        slotId: "SME-ADJUDICATOR",
        roleLabel: "Adjudicator",
        principal: null,
        organisation: null,
        recruitedAt: null,
        credentialsAttested: false,
      },
      {
        slotId: "SME-OPERATOR",
        roleLabel: "Operator / programme lead",
        principal: null,
        organisation: null,
        recruitedAt: null,
        credentialsAttested: false,
      },
    ],
    rows,
    summary: {
      smeSlotsReserved: 4,
      smeSlotsFilled: 0,
      calibrationRows: rows.length,
      labelledRows: 0,
    },
  });
}

export function parseN3SmeLabelWorksheet(value: unknown): N3SmeLabelWorksheet {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HumanQueueResidualPrepError("Invalid N3 SME worksheet");
  }
  const sheet = value as N3SmeLabelWorksheet;
  if (sheet.schemaVersion !== N3_SME_WORKSHEET_SCHEMA) {
    throw new HumanQueueResidualPrepError("Unsupported N3 SME worksheet schema");
  }
  if (
    sheet.humanLabelFreeze !== "BLOCKED" ||
    sheet.scientificAcceptance !== "BLOCKED" ||
    sheet.summary.labelledRows !== 0 ||
    sheet.summary.smeSlotsFilled !== 0 ||
    sheet.fabricatedLabelsPermitted !== false
  ) {
    throw new HumanQueueResidualPrepError("N3 SME worksheet cannot invent labels or freeze");
  }
  for (const slot of sheet.smeRosterSlots) {
    if (slot.principal !== null || slot.organisation !== null || slot.credentialsAttested !== false) {
      throw new HumanQueueResidualPrepError("N3 SME worksheet cannot invent SME identities");
    }
  }
  for (const row of sheet.rows) {
    if (
      row.expectedOutcome !== null ||
      row.annotatorId !== null ||
      row.labelledAt !== null ||
      row.rationale !== null ||
      row.adjudicatorId !== null
    ) {
      throw new HumanQueueResidualPrepError("N3 SME worksheet cannot invent scientific labels");
    }
  }
  const {worksheetHash, ...body} = sheet;
  if (worksheetHash !== digest(body)) {
    throw new HumanQueueResidualPrepError("N3 SME worksheet hash mismatch");
  }
  return sheet;
}

export function buildStagingOpsAcceptanceWorksheet(input: {
  generatedAt: string;
}): StagingOpsAcceptanceWorksheet {
  return sealWorksheet({
    schemaVersion: STAGING_OPS_WORKSHEET_SCHEMA,
    residualId: "audit_5_staging_two_account",
    generatedAt: input.generatedAt,
    engineeringScaffold: "CLEARED",
    opsAcceptance: "BLOCKED",
    liveAuthVerified: false,
    researchWritesLiveVerified: false,
    productionWritesEnabled: false,
    authAWwwUserConfirmed: true,
    honesty: {
      roleSlotsAreNotAccounts: true,
      noInventedNeonAuthPrincipals: true,
      noProductionWritesFromThisWorksheet: true,
      noAutumnSnowForHsi: true,
      noGateCAutoApprove: true,
    },
    accountSlots: [
      {
        slotId: "STAGING-RESEARCHER",
        roleLabel: "Staging researcher",
        neonAuthUserId: null,
        email: null,
        emailVerified: false,
        researchAccessGranted: false,
        reviewerAuthorityGranted: false,
      },
      {
        slotId: "STAGING-REVIEWER",
        roleLabel: "Independent reviewer",
        neonAuthUserId: null,
        email: null,
        emailVerified: false,
        researchAccessGranted: false,
        reviewerAuthorityGranted: false,
      },
      {
        slotId: "STAGING-GRANT-OPERATOR",
        roleLabel: "Grant operator",
        neonAuthUserId: null,
        email: null,
        emailVerified: false,
        researchAccessGranted: false,
        reviewerAuthorityGranted: false,
      },
    ],
    journeyReceipt: {
      researcherInvestigationCreated: null,
      reviewerIndependentDecision: null,
      denialCasesExercised: null,
      stagingWritesEnabledObserved: null,
      productionWritesRemainDisabledObserved: null,
      privateOpsReceiptUri: null,
      recordedAt: null,
      principal: null,
    },
    summary: {
      accountSlotsReserved: 3,
      accountSlotsFilled: 0,
      journeyStepsCompleted: 0,
    },
  });
}

export function parseStagingOpsAcceptanceWorksheet(
  value: unknown,
): StagingOpsAcceptanceWorksheet {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HumanQueueResidualPrepError("Invalid staging ops worksheet");
  }
  const sheet = value as StagingOpsAcceptanceWorksheet;
  if (sheet.schemaVersion !== STAGING_OPS_WORKSHEET_SCHEMA) {
    throw new HumanQueueResidualPrepError("Unsupported staging ops worksheet schema");
  }
  if (
    sheet.opsAcceptance !== "BLOCKED" ||
    sheet.liveAuthVerified !== false ||
    sheet.researchWritesLiveVerified !== false ||
    sheet.productionWritesEnabled !== false ||
    sheet.summary.accountSlotsFilled !== 0
  ) {
    throw new HumanQueueResidualPrepError(
      "Staging ops worksheet cannot invent opsAcceptance or production writes",
    );
  }
  for (const slot of sheet.accountSlots) {
    if (slot.neonAuthUserId !== null || slot.email !== null || slot.researchAccessGranted !== false) {
      throw new HumanQueueResidualPrepError(
        "Staging ops worksheet cannot invent neon_auth principals",
      );
    }
  }
  const receipt = sheet.journeyReceipt;
  if (
    receipt.researcherInvestigationCreated !== null ||
    receipt.reviewerIndependentDecision !== null ||
    receipt.stagingWritesEnabledObserved !== null ||
    receipt.privateOpsReceiptUri !== null ||
    receipt.principal !== null
  ) {
    throw new HumanQueueResidualPrepError(
      "Staging ops worksheet cannot invent live journey receipts",
    );
  }
  const {worksheetHash, ...body} = sheet;
  if (worksheetHash !== digest(body)) {
    throw new HumanQueueResidualPrepError("Staging ops worksheet hash mismatch");
  }
  return sheet;
}

export function buildPartnerMouAttestationWorksheet(input: {
  generatedAt: string;
}): PartnerMouAttestationWorksheet {
  return sealWorksheet({
    schemaVersion: PARTNER_MOU_WORKSHEET_SCHEMA,
    residualId: "audit_8_partner_mou",
    generatedAt: input.generatedAt,
    engineeringScaffold: "CLEARED",
    founderAcceptance: "BLOCKED",
    lockedPilot: false,
    legalBinding: false,
    agreementKind: "hypothetical_test_only",
    honesty: {
      fixturePartnerSignedIsNotMou: true,
      emptyMouSlotsAreNotAgreements: true,
      noInventedMouText: true,
      noInventedNamedOrg: true,
      priorApoloPathRevoked: true,
    },
    mouSlots: [
      {
        slotId: "PARTNER-MOU-ORG",
        roleLabel: "Named partner organisation",
        organisationName: null,
        writtenConfirmUri: null,
        mouDocumentUri: null,
        mouSignedAt: null,
        legalBindingAttested: false,
      },
      {
        slotId: "PARTNER-MOU-WRITTEN",
        roleLabel: "Written confirm artifact",
        organisationName: null,
        writtenConfirmUri: null,
        mouDocumentUri: null,
        mouSignedAt: null,
        legalBindingAttested: false,
      },
      {
        slotId: "PARTNER-MOU-LEGAL",
        roleLabel: "Legal MoU / MoA artifact",
        organisationName: null,
        writtenConfirmUri: null,
        mouDocumentUri: null,
        mouSignedAt: null,
        legalBindingAttested: false,
      },
      {
        slotId: "PARTNER-MOU-SCOPE",
        roleLabel: "Disease + research question confirm",
        organisationName: null,
        writtenConfirmUri: null,
        mouDocumentUri: null,
        mouSignedAt: null,
        legalBindingAttested: false,
      },
      {
        slotId: "PARTNER-MOU-RUBRIC",
        roleLabel: "Licensing + Stage 1 rubric confirm",
        organisationName: null,
        writtenConfirmUri: null,
        mouDocumentUri: null,
        mouSignedAt: null,
        legalBindingAttested: false,
      },
      {
        slotId: "PARTNER-MOU-FOUNDER",
        roleLabel: "Founder legalBinding attestor",
        organisationName: null,
        writtenConfirmUri: null,
        mouDocumentUri: null,
        mouSignedAt: null,
        legalBindingAttested: false,
      },
    ],
    founderAttestation: {
      principal: null,
      recordedAt: null,
      legalBinding: false,
      writtenConfirmObserved: false,
      notes: null,
    },
    summary: {
      mouSlotsReserved: 6,
      mouSlotsFilled: 0,
    },
  });
}

export function parsePartnerMouAttestationWorksheet(
  value: unknown,
): PartnerMouAttestationWorksheet {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HumanQueueResidualPrepError("Invalid partner MoU worksheet");
  }
  const sheet = value as PartnerMouAttestationWorksheet;
  if (sheet.schemaVersion !== PARTNER_MOU_WORKSHEET_SCHEMA) {
    throw new HumanQueueResidualPrepError("Unsupported partner MoU worksheet schema");
  }
  if (
    sheet.founderAcceptance !== "BLOCKED" ||
    sheet.lockedPilot !== false ||
    sheet.legalBinding !== false ||
    sheet.summary.mouSlotsFilled !== 0 ||
    sheet.founderAttestation.legalBinding !== false
  ) {
    throw new HumanQueueResidualPrepError(
      "Partner MoU worksheet cannot invent legalBinding or lockedPilot",
    );
  }
  for (const slot of sheet.mouSlots) {
    if (
      slot.organisationName !== null ||
      slot.writtenConfirmUri !== null ||
      slot.mouDocumentUri !== null ||
      slot.legalBindingAttested !== false
    ) {
      throw new HumanQueueResidualPrepError(
        "Partner MoU worksheet cannot invent MoU text or named orgs",
      );
    }
  }
  const {worksheetHash, ...body} = sheet;
  if (worksheetHash !== digest(body)) {
    throw new HumanQueueResidualPrepError("Partner MoU worksheet hash mismatch");
  }
  return sheet;
}

function defaultResiduals(): HumanQueueResidual[] {
  return [
    {
      residualId: "audit_2_n1_rights",
      auditPhase: 2,
      title: "N1 human rights attestation (licenceEvidenceUri)",
      plane: "science",
      status: "ENG_CLEARED_HUMAN_BLOCKED",
      engScaffoldCleared: true,
      humanAcceptance: "BLOCKED",
      neonTarget: "red-wave",
      metricSnapshot: [
        {key: "humanCleared", value: 0},
        {key: "passageImported", value: 0},
        {key: "pendingHumanReview", value: 12},
      ],
      checklistPath: "docs/engineering/N1_PASSAGE_RIGHTS_ATTESTATION_CHECKLIST.md",
      worksheetPath: "research/domain-graph/n1/attestation-worksheet.v1.json",
      verifyCommand: "bun run human-queue:check",
      onlyHumansCan: [
        "Supply real licenceEvidenceUri + permittedUses per source",
        "Authorize passage import only after attestation",
        "Record accountable principal + timestamp outside invented chat claims",
      ],
      engMustNever: [
        "Invent licenceEvidenceUri from Europe PMC OA/CC labels",
        "Set humanCleared>0 or passageImported>0 in git without human attestation",
        "Promote uncleared passages into the graph",
      ],
    },
    {
      residualId: "audit_3_isi_cite_hitl",
      auditPhase: 3,
      title: "ISI cite HITL (Claim support → Approve)",
      plane: "hitl",
      status: "ENG_CLEARED_HUMAN_BLOCKED",
      engScaffoldCleared: true,
      humanAcceptance: "BLOCKED",
      neonTarget: "autumn-snow",
      metricSnapshot: [
        {key: "claim_support=supports", value: 0},
        {key: "publicCiteApproved", value: 0},
        {key: "readyForHumanSupportsAssess", value: 13},
      ],
      checklistPath: "immunecity/docs/GATE_C_CURATOR_PATH.md",
      worksheetPath: "immunecity/public/hsi-discovery/cite-hitl-residual-worksheet.json",
      verifyCommand: "cd immunecity && bun run hsi:cite-hitl:check",
      onlyHumansCan: [
        "Neon Auth scientific reviewer / admin S-P-O assess on /curation?hsi=cite",
        "Set claim_support per row after reading the paper",
        "Approve only when verified + mapped + supports; remeasure with --neon",
      ],
      engMustNever: [
        "Invent claim_support=supports",
        "Auto-approve or flip hsiGrade",
        "Write cite Approve against red-wave",
      ],
    },
    {
      residualId: "audit_4_n3_sme_labels",
      auditPhase: 4,
      title: "N3 SME calibration labels + freeze",
      plane: "science",
      status: "ENG_CLEARED_HUMAN_BLOCKED",
      engScaffoldCleared: true,
      humanAcceptance: "BLOCKED",
      neonTarget: "red-wave",
      metricSnapshot: [
        {key: "labelledCalibrationCount", value: 0},
        {key: "smeSlotsFilled", value: 0},
        {key: "calibrationItems", value: 24},
      ],
      checklistPath: "docs/engineering/N3_CALIBRATION_FREEZE_CHECKLIST.md",
      worksheetPath: "research/domain-graph/n3/sme-label-worksheet.v1.json",
      verifyCommand: "bun run human-queue:check",
      onlyHumansCan: [
        "Recruit Annotator A/B + Adjudicator into empty roster slots",
        "Fill expectedOutcome / rationale for 20–50 calibration items",
        "Adjudicate disagreements and set frozen_human_labels",
      ],
      engMustNever: [
        "Invent SME identities or expectedOutcome values",
        "Clear humanLabelFreeze without real labels",
        "Fabricate usefulness scores ahead of freeze",
      ],
    },
    {
      residualId: "audit_5_staging_two_account",
      auditPhase: 5,
      title: "Staging two-account Auth opsAcceptance",
      plane: "ops",
      status: "ENG_CLEARED_HUMAN_BLOCKED",
      engScaffoldCleared: true,
      humanAcceptance: "BLOCKED",
      neonTarget: "red-wave",
      metricSnapshot: [
        {key: "opsAcceptance", value: "BLOCKED"},
        {key: "accountSlotsFilled", value: 0},
        {key: "authAWwwUserConfirmed", value: true},
        {key: "productionWritesEnabled", value: false},
      ],
      checklistPath: "docs/engineering/STAGING_TWO_ACCOUNT_AUTH_CHECKLIST.md",
      worksheetPath: "operations/staging/ops-acceptance-worksheet.v1.json",
      verifyCommand: "bun run staging:auth-prep:check && bun run human-queue:check",
      onlyHumansCan: [
        "Align Preview env to staging Auth + ep-sweet-hill",
        "Create two verified neon_auth principals + grants",
        "Flip staging writes only; run live two-account journey; private ops receipt",
      ],
      engMustNever: [
        "Invent neon_auth user ids or grants in git",
        "Enable production writesEnabled=true",
        "Point HSI at autumn-snow",
      ],
    },
    {
      residualId: "audit_8_partner_mou",
      auditPhase: 8,
      title: "Founder MoU / partner lock",
      plane: "founder",
      status: "ENG_CLEARED_HUMAN_BLOCKED",
      engScaffoldCleared: true,
      humanAcceptance: "BLOCKED",
      neonTarget: "none",
      metricSnapshot: [
        {key: "mouSlotsFilled", value: 0},
        {key: "legalBinding", value: false},
        {key: "lockedPilot", value: false},
      ],
      checklistPath: "docs/engineering/PARTNER_LOCK_CHECKLIST.md",
      worksheetPath: "operations/partner/mou-attestation-worksheet.v1.json",
      verifyCommand: "bun run partner:lock-prep:check && bun run human-queue:check",
      onlyHumansCan: [
        "Obtain written partner confirm / MoU for a real named org",
        "Fill empty MoU slots with real URIs (keep bodies private)",
        "Attest legalBinding and swap off hypothetical fixture",
      ],
      engMustNever: [
        "Invent MoU text, named orgs, or legalBinding=true",
        "Claim lockedPilot under hypothetical_test_only",
        "Re-lock Apolo without new written confirm",
      ],
    },
  ];
}

export function buildHumanQueueResidualPack(input: {
  generatedAt: string;
}): HumanQueueResidualPack {
  const residuals = defaultResiduals();
  return sealPack({
    schemaVersion: HUMAN_QUEUE_SCHEMA,
    remediationPhase: "production_readiness_human_queue_residuals",
    generatedAt: input.generatedAt,
    rankedEngTrack: "COMPLETE_THROUGH_10",
    engineeringScaffold: "CLEARED",
    humanAcceptance: "BLOCKED",
    honesty: {
      noInventedMou: true,
      noInventedClaimSupport: true,
      noInventedSmeLabels: true,
      noInventedLicenceClearance: true,
      noGateCAutoApprove: true,
      noLiveCdsPhi: true,
      noProductionWritesEnabled: true,
      hsiNeonRedWaveOnly: true,
      isiCiteNeonAutumnSnowOnly: true,
    },
    residuals,
    citeHitlPointer: {
      residualId: "audit_3_isi_cite_hitl",
      productRepo: "immunecity",
      neonTarget: "autumn-snow",
      engScaffoldCleared: true,
      hitlAcceptance: "BLOCKED",
      pinSupports: 0,
      pinPublicCiteApproved: 0,
      readyForHumanSupportsAssess: 13,
      checklistPath: "immunecity/docs/GATE_C_CURATOR_PATH.md",
      runbookPath: "immunecity/docs/engineering/CITE_HITL_CURATOR_RUNBOOK.md",
      worksheetPath: "immunecity/public/hsi-discovery/cite-hitl-residual-worksheet.json",
      verifyCommand: "cd immunecity && bun run hsi:curator-status && bun run hsi:cite-hitl:check",
      onlyHumansCan: residuals.find((r) => r.residualId === "audit_3_isi_cite_hitl")!.onlyHumansCan,
      engMustNever: residuals.find((r) => r.residualId === "audit_3_isi_cite_hitl")!.engMustNever,
    },
    stopList: [
      "Do not invent MoU text / legalBinding=true / signed partners",
      "Do not invent claim_support or Approve on cites",
      "Do not invent SME scientific labels / usefulness scores",
      "Do not invent licence clearance or passage imports",
      "Do not Gate C auto-approve / live CDS-PHI",
      "Do not set production writesEnabled=true",
      "Ranked eng track #1–#10 is complete — remaining work is HUMAN QUEUE only",
    ],
    summary: {
      residualCount: 5,
      engClearedHumanBlocked: 5,
      n1HumanCleared: 0,
      n1PassageImported: 0,
      citeSupports: 0,
      citePublicApproved: 0,
      n3Labels: 0,
      n3SmeSlotsFilled: 0,
      stagingAccountSlotsFilled: 0,
      stagingOpsAcceptance: "BLOCKED",
      partnerMouSlotsFilled: 0,
      partnerLockedPilot: false,
    },
  });
}

export function parseHumanQueueResidualPack(value: unknown): HumanQueueResidualPack {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HumanQueueResidualPrepError("Invalid human-queue residual pack");
  }
  const pack = value as HumanQueueResidualPack;
  if (pack.schemaVersion !== HUMAN_QUEUE_SCHEMA) {
    throw new HumanQueueResidualPrepError("Unsupported human-queue schema");
  }
  if (
    pack.humanAcceptance !== "BLOCKED" ||
    pack.engineeringScaffold !== "CLEARED" ||
    pack.summary.residualCount !== 5 ||
    pack.summary.n1HumanCleared !== 0 ||
    pack.summary.citeSupports !== 0 ||
    pack.summary.n3Labels !== 0 ||
    pack.summary.partnerLockedPilot !== false ||
    pack.summary.stagingOpsAcceptance !== "BLOCKED"
  ) {
    throw new HumanQueueResidualPrepError(
      "Human-queue pack cannot invent residual clearance",
    );
  }
  if (pack.residuals.length !== 5) {
    throw new HumanQueueResidualPrepError("Human-queue pack must list residuals #2/#3/#4/#5/#8");
  }
  for (const residual of pack.residuals) {
    if (residual.humanAcceptance !== "BLOCKED" || residual.engScaffoldCleared !== true) {
      throw new HumanQueueResidualPrepError("Residual rows must stay ENG CLEARED / HUMAN BLOCKED");
    }
  }
  if (
    pack.citeHitlPointer.pinSupports !== 0 ||
    pack.citeHitlPointer.pinPublicCiteApproved !== 0 ||
    pack.citeHitlPointer.hitlAcceptance !== "BLOCKED"
  ) {
    throw new HumanQueueResidualPrepError("Cite HITL pointer cannot invent supports/Approve");
  }
  const {packHash, ...body} = pack;
  if (packHash !== digest(body)) {
    throw new HumanQueueResidualPrepError("Human-queue pack hash mismatch");
  }
  return pack;
}
