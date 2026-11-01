/**
 * P0.3 stub — rights / licensing table for PMIDs used in RA / SSc / gut / neuro packs.
 *
 * Honest default: licenseStatus=needs_review. Does not invent commercial
 * clearance or flip partnerSigned.
 */

import { getPartnerLock } from "./partnerLock";
import { SSC_PATHWAY_META } from "./seed/sscTfhBIl21";
import { GUT_PATHWAY_META } from "./seed/gutScfaMucosal";
import { NI_PATHWAY_META } from "./seed/neuroVagusCholinergic";

export const SOURCE_LICENSING_STUB_SCHEMA =
  "hsi-source-licensing-stub-1" as const;

export type SourceLicenseStatus =
  | "needs_review"
  | "public_domain_or_open"
  | "fair_use_research_ok"
  | "partner_cleared"
  | "blocked";

export type SourcePackId = "ra_tnf" | "ssc_tfh_b_il21" | "gut_scfa" | "neuro_vagus";

export type SourceLicensingRow = {
  pmid: string;
  packs: SourcePackId[];
  licenseStatus: SourceLicenseStatus;
  attributionNote: string;
  europePmcUrl: string;
};

export type SourceLicensingStubBundle = {
  schemaVersion: typeof SOURCE_LICENSING_STUB_SCHEMA;
  phase: "P0.3-stub";
  notCds: true;
  containsPhi: false;
  partnerSigned: false;
  generatedAt: string;
  summary: {
    pmidCount: number;
    needsReviewCount: number;
    partnerClearedCount: number;
    blockedCount: number;
  };
  rows: SourceLicensingRow[];
  honesty: string[];
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

export function buildSourceLicensingStubBundle(opts?: {
  generatedAt?: string;
}): SourceLicensingStubBundle {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const lock = getPartnerLock();
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
    .map(([pmid, packs]) => ({
      pmid,
      packs: [...packs].sort(),
      licenseStatus: "needs_review" as const,
      attributionNote:
        "Public PMID locator used in HSI regenerable packs. Full-text / figure reuse / commercial redistribution rights NOT cleared — partner + curator review required before partnerSigned pilot corpus lock.",
      europePmcUrl: pubmedUrl(pmid),
    }));

  return {
    schemaVersion: SOURCE_LICENSING_STUB_SCHEMA,
    phase: "P0.3-stub",
    notCds: true,
    containsPhi: false,
    partnerSigned: false,
    generatedAt,
    summary: {
      pmidCount: rows.length,
      needsReviewCount: rows.length,
      partnerClearedCount: 0,
      blockedCount: 0,
    },
    rows,
    honesty: [
      "Every row starts as licenseStatus=needs_review — no invented clearance.",
      "PMID presence ≠ republication rights for PDFs, figures, or abstracts beyond fair research citation.",
      "Promote to partner_cleared only after named partner + curator agree attribution for the pilot corpus.",
      "Does not flip partnerSigned; does not contain PHI.",
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
  const lines = [
    "# Source licensing stub (P0.3)",
    "",
    `Schema: \`${bundle.schemaVersion}\` · generated ${bundle.generatedAt}`,
    "",
    `**partnerSigned=${bundle.partnerSigned}** · PMIDs=${bundle.summary.pmidCount} · needs_review=${bundle.summary.needsReviewCount}`,
    "",
    "| PMID | Packs | Status | Europe PMC |",
    "|------|-------|--------|------------|",
  ];
  for (const r of bundle.rows) {
    lines.push(
      `| ${r.pmid} | ${r.packs.join(", ")} | ${r.licenseStatus} | ${r.europePmcUrl} |`,
    );
  }
  lines.push("", "## Honesty", "");
  for (const h of bundle.honesty) {
    lines.push(`- ${h}`);
  }
  lines.push("");
  return lines.join("\n");
}
