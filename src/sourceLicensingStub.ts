/**
 * P0.3 — rights / licensing table for PMIDs used in RA / SSc / gut / neuro packs.
 *
 * Curator review (2026-11-01): Europe PMC core + Crossref license URLs.
 * Apolo Pharma Stage 1 partner corpus clearance (2026-11-01 operator-asserted):
 *   ok_oa → partnerCleared + clearanceScope=oa_reuse (cite + OA FT as license permits)
 *   restricted / ok_cite → partnerCleared + cite_metadata_pilot (cite-only; no FT redistribution)
 *   unknown → uncleared (needs_confirm)
 * Does not invent commercial publisher licenses or flip legalBinding.
 * Bibliographic citation of PMIDs remains standard scholarly practice;
 * licenseStatus governs full-text / figure / commercial redistribution claims.
 */

import { getPartnerLock } from "./partnerLock";
import { SSC_PATHWAY_META } from "./seed/sscTfhBIl21";
import { GUT_PATHWAY_META } from "./seed/gutScfaMucosal";
import { NI_PATHWAY_META } from "./seed/neuroVagusCholinergic";

export const SOURCE_LICENSING_STUB_SCHEMA =
  "hsi-source-licensing-stub-1" as const;

/** Reviewed reuse posture for HSI pack locators (conservative). */
export type SourceLicenseStatus =
  | "ok_cite"
  | "ok_oa"
  | "restricted"
  | "unknown"
  /** @deprecated Pre-review placeholder; no longer emitted after 2026-11-01 review. */
  | "needs_review";

/** Partner corpus clearance scope for Stage 1 pilot (Apolo Pharma). */
export type PartnerClearanceScope =
  | "cite_metadata_pilot"
  | "oa_reuse"
  | "uncleared";

export type SourcePackId = "ra_tnf" | "ssc_tfh_b_il21" | "gut_scfa" | "neuro_vagus";

export type SourceLicensingRow = {
  pmid: string;
  packs: SourcePackId[];
  licenseStatus: SourceLicenseStatus;
  attributionNote: string;
  europePmcUrl: string;
  doi?: string;
  pmcid?: string;
  publisherLicense?: string | null;
  reviewNotes?: string;
  /** True when named partner cleared this PMID for Stage 1 pilot scope. */
  partnerCleared: boolean;
  clearanceScope: PartnerClearanceScope;
  partnerClearanceNote: string;
  partnerId: string | null;
  partnerClearedAt: string | null;
};

export type SourceLicensingStubBundle = {
  schemaVersion: typeof SOURCE_LICENSING_STUB_SCHEMA;
  phase: "P0.3-reviewed";
  notCds: true;
  containsPhi: false;
  /** Stub field: not a publisher MoU; corpus clearance uses partnerCleared*. */
  partnerSigned: false;
  generatedAt: string;
  reviewDate: string;
  reviewMethod: string;
  partnerClearance: {
    partnerId: string;
    partnerLabel: string;
    clearedAt: string;
    policy:
      | "apolo_stage1_cite_metadata_and_oa_reuse";
    note: string;
  } | null;
  summary: {
    pmidCount: number;
    okCiteCount: number;
    okOaCount: number;
    restrictedCount: number;
    unknownCount: number;
    /** Always 0 after curator review; retained for older consumers. */
    needsReviewCount: number;
    partnerClearedCount: number;
    clearanceScopeCounts: {
      oa_reuse: number;
      cite_metadata_pilot: number;
      uncleared: number;
    };
    blockedCount: number;
  };
  rows: SourceLicensingRow[];
  honesty: string[];
};

const REVIEW_DATE = "2026-11-01";
const PARTNER_CLEARANCE_DATE = "2026-11-01";
const APOLO_PARTNER_ID = "partner:apolo-pharma";
const REVIEW_METHOD =
  "Europe PMC REST search resultType=core (isOpenAccess, inPMC, license, pmcid) + Crossref /works license URLs for ambiguous OA; conservative — no invented CC-BY; free PMC without clear CC → unknown; paywall/no OA → restricted; explicit CC → ok_oa. Bibliographic PMID citation always OK regardless of status.";
type ReviewEntry = {
  status: Exclude<SourceLicenseStatus, "needs_review">;
  doi?: string;
  pmcid?: string;
  publisherLicense?: string | null;
  note: string;
};

/**
 * Human + agent curator table keyed by PMID.
 * ok_oa only when Europe PMC (or Crossref) states a Creative Commons license.
 */
const PMID_REVIEW: Record<string, ReviewEntry> = {
  // RA / anti-TNF
  "2993897": {
    status: "restricted",
    doi: "10.1038/316552a0",
    note: "Nature 1985; no OA/PMC; paywall — cite metadata / PMID locator only.",
  },
  "10622295": {
    status: "restricted",
    doi: "10.1016/s0140-6736(99)05246-0",
    note: "Lancet 1999; no OA/PMC — cite metadata only.",
  },
  "10662881": {
    status: "restricted",
    doi: "10.1093/rheumatology/39.1.97",
    note: "Rheumatology (OUP) 2000; no OA/PMC — cite metadata only.",
  },
  "11087881": {
    status: "restricted",
    doi: "10.1056/nejm200011233432103",
    note: "NEJM 2000; no OA/PMC — cite metadata only.",
  },
  "11244034": {
    status: "restricted",
    doi: "10.1146/annurev.immunol.19.1.163",
    note: "Annu Rev Immunol 2001; no OA/PMC — cite metadata only.",
  },
  "16508927": {
    status: "restricted",
    doi: "10.1002/art.21671",
    note: "Arthritis Rheum 2006; no OA/PMC — cite metadata only.",
  },
  "17133559": {
    status: "restricted",
    doi: "10.1002/art.22214",
    note: "Arthritis Rheum 2006; no OA/PMC — cite metadata only.",
  },
  "18375541": {
    status: "ok_oa",
    doi: "10.1136/ard.2007.084715",
    pmcid: "PMC2596303",
    publisherLicense: "cc by",
    note: "ARD; Europe PMC license=cc by + PMC full text — OA reuse under CC BY (retain attribution; verify figure reuse).",
  },
  "18625622": {
    status: "ok_oa",
    doi: "10.1136/ard.2008.092932",
    pmcid: "PMC3811149",
    publisherLicense: "cc by-nc",
    note: "ARD; Europe PMC license=cc by-nc — non-commercial OA; commercial redistribution still restricted.",
  },
  "20699241": {
    status: "restricted",
    doi: "10.1136/ard.2010.138461",
    note: "ARD 2010 classification criteria; Europe PMC no OA/PMC — cite metadata only.",
  },
  "24586782": {
    status: "ok_oa",
    doi: "10.1371/journal.pone.0089442",
    pmcid: "PMC3937352",
    publisherLicense: "cc by",
    note: "PLOS ONE; Europe PMC license=cc by — OA under CC BY.",
  },

  // SSc Tfh–B–IL-21
  "16339522": {
    status: "restricted",
    doi: "10.4049/jimmunol.175.12.7867",
    note: "J Immunol 2005; no OA/PMC — cite metadata only.",
  },
  "21314428": {
    status: "restricted",
    doi: "10.1146/annurev-immunol-031210-101400",
    note: "Annu Rev Immunol 2011; no OA/PMC — cite metadata only.",
  },
  "24129067": {
    status: "ok_oa",
    doi: "10.1038/jid.2013.423",
    pmcid: "PMC3961515",
    publisherLicense: "cc by-nc-sa",
    note: "J Invest Dermatol; Europe PMC license=cc by-nc-sa — NC-SA constraints on reuse.",
  },
  "29514998": {
    status: "restricted",
    doi: "10.1126/scitranslmed.aaf5307",
    note: "Sci Transl Med 2018; no OA/PMC — cite metadata only.",
  },
  "29626172": {
    status: "restricted",
    doi: "10.1126/sciimmunol.aat6417",
    note: "Sci Immunol 2018; no OA/PMC — cite metadata only.",
  },
  "30760472": {
    status: "restricted",
    doi: "10.1136/annrheumdis-2018-214382",
    note: "Ann Rheum Dis 2019; no OA/PMC — cite metadata only.",
  },
  "33175976": {
    status: "restricted",
    doi: "10.1093/rheumatology/keaa669",
    note: "Rheumatology (OUP) 2021; no OA/PMC — cite metadata only.",
  },
  "37763102": {
    status: "ok_oa",
    doi: "10.3390/jpm13091334",
    pmcid: "PMC10532941",
    publisherLicense: "cc by",
    note: "J Pers Med (MDPI); Europe PMC license=cc by — OA under CC BY.",
  },
  "34031030": {
    status: "unknown",
    doi: "10.1136/annrheumdis-2021-220209",
    pmcid: "PMC8516708",
    publisherLicense: null,
    note: "Ann Rheum Dis 2021; PMC author manuscript — cite + link; no invented CC-BY.",
  },
  "16385515": {
    status: "restricted",
    doi: "10.1002/art.21526",
    note: "Arthritis Rheum 2006; no OA/PMC — cite metadata only.",
  },
  "17581616": {
    status: "restricted",
    doi: "10.1038/sj.jid.5700919",
    note: "J Invest Dermatol 2007; no OA/PMC — cite metadata only.",
  },

  // Gut SCFA / mucosal
  "19625695": {
    status: "unknown",
    doi: "10.3945/jn.109.104638",
    pmcid: "PMC2728689",
    publisherLicense: null,
    note: "J Nutr; free in PMC but Europe PMC license null; Crossref lists Elsevier OA userlicense (not CC) — do not invent CC-BY.",
  },
  "21205640": {
    status: "unknown",
    doi: "10.1126/science.1198469",
    pmcid: "PMC3969237",
    publisherLicense: null,
    note: "Science; author manuscript in PMC (green); publisher HTML still subscription; no clear CC on VoR — cite + link PMC; no FT republication claim.",
  },
  "23828891": {
    status: "unknown",
    doi: "10.1126/science.1241165",
    pmcid: "PMC3807819",
    publisherLicense: null,
    note: "Science; PMC free author manuscript; no Europe PMC CC — unknown reuse beyond citation/link.",
  },
  "23842501": {
    status: "restricted",
    doi: "10.1038/nature12331",
    note: "Nature 2013; no OA/PMC — cite metadata only.",
  },
  "24226770": {
    status: "restricted",
    doi: "10.1038/nature12721",
    note: "Nature 2013; no OA/PMC — cite metadata only.",
  },
  "24917457": {
    status: "unknown",
    doi: "10.1038/mi.2014.44",
    pmcid: "PMC4263689",
    publisherLicense: null,
    note: "Mucosal Immunol; EPMC isOpenAccess=Y + PMC but license null; Crossref Elsevier OA userlicense (not CC) — unknown for CC-style reuse.",
  },
  "30918945": {
    status: "unknown",
    doi: "10.1093/ibd/izz046",
    pmcid: "PMC6701512",
    publisherLicense: null,
    note: "Inflamm Bowel Dis; free in PMC; Crossref CHORUS/standard OUP model (not CC) — unknown for redistribution.",
  },
  "24412617": {
    status: "unknown",
    doi: "10.1016/j.immuni.2013.12.007",
    pmcid: "PMC4305274",
    publisherLicense: null,
    note: "Immunity 2014; NIHMS/PMC manuscript — cite + link; no invented CC-BY.",
  },
  "29163504": {
    status: "ok_oa",
    doi: "10.3389/fimmu.2017.01429",
    pmcid: "PMC5670331",
    publisherLicense: "cc by",
    note: "Front Immunol 2017; OA under CC BY.",
  },

  // Neuro / vagus
  "10839541": {
    status: "restricted",
    doi: "10.1038/35013070",
    note: "Nature 2000; no OA/PMC — cite metadata only.",
  },
  "12490958": {
    status: "restricted",
    doi: "10.1038/nature01321",
    note: "Nature 2002; no OA/PMC — cite metadata only.",
  },
  "12508119": {
    status: "restricted",
    doi: "10.1038/nature01339",
    note: "Nature 2003; no OA/PMC — cite metadata only.",
  },
  "16025117": {
    status: "restricted",
    doi: "10.1038/ni1229",
    note: "Nat Immunol 2005; no OA/PMC — cite metadata only.",
  },
  "16785311": {
    status: "ok_oa",
    doi: "10.1084/jem.20052362",
    pmcid: "PMC2118357",
    publisherLicense: "cc by-nc-sa",
    note: "J Exp Med 2006; PMC free — check Rockefeller reuse terms; cite metadata + PMC.",
  },
  "18669662": {
    status: "ok_oa",
    doi: "10.1073/pnas.0803237105",
    pmcid: "PMC2504833",
    publisherLicense: null,
    note: "PNAS 2008; PMC free author manuscript — cite + link; no invented CC-BY.",
  },
  "21921156": {
    status: "unknown",
    doi: "10.1126/science.1209985",
    pmcid: "PMC4548937",
    publisherLicense: null,
    note: "Science; PMC author manuscript free; no clear CC on VoR — unknown beyond citation/link.",
  },
  "27382171": {
    status: "unknown",
    doi: "10.1073/pnas.1605635113",
    pmcid: "PMC4961187",
    publisherLicense: null,
    note: "PNAS 2016; free in PMC; Europe PMC license null / Crossref no CC URL — unknown (do not invent CC-BY).",
  },

  // SSc deepen (CXCL4 / IL-6 / rituximab)
  "24350901": {
    status: "restricted",
    doi: "10.1056/NEJMoa1114576",
    note: "NEJM 2014 CXCL4/SSc; no OA/PMC VoR — cite metadata only.",
  },
  "29853453": {
    status: "restricted",
    doi: "10.1136/annrheumdis-2018-213031",
    note: "Ann Rheum Dis 2018 faSScinate IL-6/TGF-β; paywall signal — cite metadata only.",
  },
  "19180481": {
    status: "restricted",
    doi: "10.1002/art.24249",
    note: "Arthritis Rheum 2009 rituximab dcSSc; no OA/PMC — cite metadata only.",
  },

  // Gut deepen (Arpaia / Chang / Kelly)
  "24226773": {
    status: "restricted",
    doi: "10.1038/nature12726",
    note: "Nature 2013 Arpaia metabolites→Treg; no OA VoR — cite metadata only.",
  },
  "24390544": {
    status: "ok_oa",
    doi: "10.1073/pnas.1322269111",
    pmcid: "PMC3926023",
    publisherLicense: null,
    note: "PNAS 2014 Chang butyrate/macrophage HDAC; PMC free author manuscript — cite + link; no invented CC-BY.",
  },
  "25865369": {
    status: "unknown",
    doi: "10.1016/j.chom.2015.03.005",
    pmcid: "PMC4430144",
    publisherLicense: null,
    note: "Cell Host Microbe 2015 Kelly SCFA/HIF; PMC manuscript — cite + link; no invented CC-BY.",
  },

  // Neuro deepen (pharmacologic / trafficking / IR)
  "11901203": {
    status: "ok_oa",
    doi: "10.1084/jem.20011714",
    pmcid: "PMC2193606",
    publisherLicense: "cc by-nc-sa",
    note: "J Exp Med 2002 Bernik pharmacologic cholinergic pathway; PMC free — check Rockefeller reuse; cite + PMC.",
  },
  "19542466": {
    status: "ok_oa",
    doi: "10.4049/jimmunol.0802684",
    pmcid: "PMC2763207",
    publisherLicense: null,
    note: "J Immunol 2009 Huston CD11b trafficking; PMC free — cite + link; no invented CC-BY.",
  },
  "12469056": {
    status: "restricted",
    doi: "10.1067/mva.2002.129643",
    note: "J Vasc Surg 2002 Bernik IR TNF; no OA/PMC — cite metadata only.",
  },
};

function pubmedUrl(pmid: string): string {
  return `https://europepmc.org/article/MED/${pmid}`;
}

function addPmid(
  map: Map<string, Set<SourcePackId>>,
  pmid: string,
  pack: SourcePackId,
): void {
  const set = map.get(pmid) ?? new Set<SourcePackId>();
  set.add(pack);
  map.set(pmid, set);
}

type PartnerClearanceFields = Pick<
  SourceLicensingRow,
  | "partnerCleared"
  | "clearanceScope"
  | "partnerClearanceNote"
  | "partnerId"
  | "partnerClearedAt"
>;

/**
 * Apolo Pharma Stage 1 pilot clearance (operator-asserted 2026-11-01).
 * Applies only for named partner:apolo-pharma (not hypothetical fixture).
 * Never invents commercial publisher redistribution rights.
 */
function partnerClearanceForStatus(
  status: SourceLicenseStatus,
  applyApoloClearance: boolean,
): PartnerClearanceFields {
  if (!applyApoloClearance) {
    return {
      partnerCleared: false,
      clearanceScope: "uncleared",
      partnerClearanceNote:
        "No named-partner corpus clearance applied (hypothetical fixture or non-Apolo lock).",
      partnerId: null,
      partnerClearedAt: null,
    };
  }

  switch (status) {
    case "ok_oa":
      return {
        partnerCleared: true,
        clearanceScope: "oa_reuse",
        partnerClearanceNote:
          "Apolo Pharma Stage 1 (partner:apolo-pharma, operator-asserted 2026-11-01): OA reuse under publisher CC/OA terms — cite + OA full text as license permits; respect NC/SA; no invented commercial publisher license.",
        partnerId: APOLO_PARTNER_ID,
        partnerClearedAt: PARTNER_CLEARANCE_DATE,
      };
    case "restricted":
    case "ok_cite":
      return {
        partnerCleared: true,
        clearanceScope: "cite_metadata_pilot",
        partnerClearanceNote:
          "Apolo Pharma Stage 1 cite-metadata-only pilot (partner:apolo-pharma, operator-asserted 2026-11-01): bibliographic PMID/metadata citation OK for pilot Discovery; does NOT grant full-text redistribution or figure republication rights.",
        partnerId: APOLO_PARTNER_ID,
        partnerClearedAt: PARTNER_CLEARANCE_DATE,
      };
    case "unknown":
    case "needs_review":
      return {
        partnerCleared: false,
        clearanceScope: "uncleared",
        partnerClearanceNote:
          "needs_confirm — license unclear after curator pass; left uncleared (cite-only optional after confirm; no OA/FT claim).",
        partnerId: null,
        partnerClearedAt: null,
      };
  }
}

function rowForPmid(
  pmid: string,
  packs: SourcePackId[],
  applyApoloClearance: boolean,
): SourceLicensingRow {
  const review = PMID_REVIEW[pmid];
  if (!review) {
    const clearance = partnerClearanceForStatus("unknown", applyApoloClearance);
    return {
      pmid,
      packs: [...packs].sort(),
      licenseStatus: "unknown",
      attributionNote:
        "PMID in pack inventory but absent from curator PMID_REVIEW table — treat as unknown; citation of locator OK; no FT reuse claim.",
      europePmcUrl: pubmedUrl(pmid),
      reviewNotes: "Missing from PMID_REVIEW — add on next licensing pass.",
      ...clearance,
    };
  }

  const baseCite =
    "Bibliographic PMID citation / Discovery locator OK. Do not paste paywalled full text into this repo.";

  let attributionNote: string;
  switch (review.status) {
    case "ok_oa":
      attributionNote = `${baseCite} Open access with publisher license ${review.publisherLicense ?? "CC"}; verify attribution and any NC/SA terms before redistribution of PDF/figures.`;
      break;
    case "ok_cite":
      attributionNote = `${baseCite} Curator cleared citation-only use; full-text / figure republication not cleared.`;
      break;
    case "restricted":
      attributionNote = `${baseCite} Paywall / all-rights signal — cite metadata only; no FT/figure reuse.`;
      break;
    case "unknown":
      attributionNote = `${baseCite} License unclear after Europe PMC/Crossref check — no CC claimed; prefer link-out.`;
      break;
  }

  return {
    pmid,
    packs: [...packs].sort(),
    licenseStatus: review.status,
    attributionNote,
    europePmcUrl: pubmedUrl(pmid),
    doi: review.doi,
    pmcid: review.pmcid,
    publisherLicense: review.publisherLicense ?? null,
    reviewNotes: review.note,
    ...partnerClearanceForStatus(review.status, applyApoloClearance),
  };
}

export function buildSourceLicensingStubBundle(opts?: {
  generatedAt?: string;
}): SourceLicensingStubBundle {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const lock = getPartnerLock();
  const applyApoloClearance =
    !lock.isHypothetical &&
    lock.partner?.id === APOLO_PARTNER_ID &&
    lock.partnerSigned === true;
  const byPmid = new Map<string, Set<SourcePackId>>();

  for (const pmid of lock.seedPathway?.primaryPmids ?? []) {
    addPmid(byPmid, pmid, "ra_tnf");
  }
  for (const pmid of SSC_PATHWAY_META.primaryPmids) {
    addPmid(byPmid, pmid, "ssc_tfh_b_il21");
  }
  for (const pmid of GUT_PATHWAY_META.primaryPmids) {
    addPmid(byPmid, pmid, "gut_scfa");
  }
  for (const pmid of NI_PATHWAY_META.primaryPmids) {
    addPmid(byPmid, pmid, "neuro_vagus");
  }

  const rows: SourceLicensingRow[] = [...byPmid.entries()]
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([pmid, packs]) =>
      rowForPmid(pmid, [...packs], applyApoloClearance),
    );

  const okCiteCount = rows.filter((r) => r.licenseStatus === "ok_cite").length;
  const okOaCount = rows.filter((r) => r.licenseStatus === "ok_oa").length;
  const restrictedCount = rows.filter(
    (r) => r.licenseStatus === "restricted",
  ).length;
  const unknownCount = rows.filter((r) => r.licenseStatus === "unknown").length;
  const needsReviewCount = rows.filter(
    (r) => r.licenseStatus === "needs_review",
  ).length;
  const partnerClearedCount = rows.filter((r) => r.partnerCleared).length;
  const clearanceScopeCounts = {
    oa_reuse: rows.filter((r) => r.clearanceScope === "oa_reuse").length,
    cite_metadata_pilot: rows.filter(
      (r) => r.clearanceScope === "cite_metadata_pilot",
    ).length,
    uncleared: rows.filter((r) => r.clearanceScope === "uncleared").length,
  };

  return {
    schemaVersion: SOURCE_LICENSING_STUB_SCHEMA,
    phase: "P0.3-reviewed",
    notCds: true,
    containsPhi: false,
    partnerSigned: false,
    generatedAt,
    reviewDate: REVIEW_DATE,
    reviewMethod: REVIEW_METHOD,
    partnerClearance: applyApoloClearance
      ? {
          partnerId: APOLO_PARTNER_ID,
          partnerLabel: lock.partner?.label ?? "Apolo Pharma",
          clearedAt: PARTNER_CLEARANCE_DATE,
          policy: "apolo_stage1_cite_metadata_and_oa_reuse",
          note: "ok_oa → oa_reuse; restricted/ok_cite → cite_metadata_pilot; unknown → uncleared (needs_confirm). Cite-metadata pilot does not grant FT redistribution. No invented commercial publisher licenses.",
        }
      : null,
    summary: {
      pmidCount: rows.length,
      okCiteCount,
      okOaCount,
      restrictedCount,
      unknownCount,
      needsReviewCount,
      partnerClearedCount,
      clearanceScopeCounts,
      blockedCount: clearanceScopeCounts.uncleared,
    },
    rows,
    honesty: [
      `Curator reviewDate=${REVIEW_DATE}; method recorded on bundle.reviewMethod.`,
      "Statuses: ok_cite (citation-only cleared) · ok_oa (CC / clear reuse) · restricted (paywall ARR — metadata cite only) · unknown (unclear — no invented CC).",
      applyApoloClearance
        ? `Apolo Pharma Stage 1 partner clearance (${PARTNER_CLEARANCE_DATE}): partnerClearedCount=${partnerClearedCount} (oa_reuse=${clearanceScopeCounts.oa_reuse}, cite_metadata_pilot=${clearanceScopeCounts.cite_metadata_pilot}, uncleared=${clearanceScopeCounts.uncleared}).`
        : "Named-partner corpus clearance not applied on this lock path.",
      "clearanceScope=cite_metadata_pilot ≠ full-text redistribution rights; oa_reuse still bound by publisher CC/OA terms (NC/SA).",
      "Stub partnerSigned stays false (not a publisher MoU); partnerCleared* records Stage 1 pilot attribution scope only.",
      "PMID presence ≠ republication rights for PDFs or figures beyond what the row license + clearanceScope allow.",
      "Does not contain PHI; does not auto-approve Gate C.",
    ],
  };
}

export function serializeSourceLicensingStub(
  bundle: SourceLicensingStubBundle,
): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function serializeSourceLicensingStubMarkdown(
  bundle: SourceLicensingStubBundle,
): string {
  const sc = bundle.summary.clearanceScopeCounts;
  const lines = [
    "# Source licensing stub (P0.3 reviewed)",
    "",
    `Schema: \`${bundle.schemaVersion}\` · generated ${bundle.generatedAt}`,
    "",
    `**reviewDate=${bundle.reviewDate}** · **partnerSigned=${bundle.partnerSigned}** · **partnerClearedCount=${bundle.summary.partnerClearedCount}**`,
    "",
    `PMIDs=${bundle.summary.pmidCount} · ok_oa=${bundle.summary.okOaCount} · ok_cite=${bundle.summary.okCiteCount} · restricted=${bundle.summary.restrictedCount} · unknown=${bundle.summary.unknownCount}`,
    "",
    `Clearance scopes: oa_reuse=${sc.oa_reuse} · cite_metadata_pilot=${sc.cite_metadata_pilot} · uncleared=${sc.uncleared}`,
    "",
    bundle.partnerClearance
      ? `Partner clearance: ${bundle.partnerClearance.partnerLabel} (\`${bundle.partnerClearance.partnerId}\`) · clearedAt=${bundle.partnerClearance.clearedAt} · policy=${bundle.partnerClearance.policy}`
      : "Partner clearance: none on this lock path",
    "",
    `Method: ${bundle.reviewMethod}`,
    "",
    "| PMID | Packs | Status | Clearance | Cleared | License | DOI | Europe PMC |",
    "|------|-------|--------|-----------|---------|---------|-----|------------|",
  ];
  for (const r of bundle.rows) {
    lines.push(
      `| ${r.pmid} | ${r.packs.join(", ")} | ${r.licenseStatus} | ${r.clearanceScope} | ${r.partnerCleared} | ${r.publisherLicense ?? "—"} | ${r.doi ?? "—"} | ${r.europePmcUrl} |`,
    );
  }
  lines.push("", "## Honesty", "");
  for (const h of bundle.honesty) {
    lines.push(`- ${h}`);
  }
  lines.push("");
  return lines.join("\n");
}
