/**
 * HSI Phase 0 — curated placeholder T2D / immuno-metabolic edge set.
 * Provenance fields present; many PMIDs intentionally null until evidence sprint.
 * Not Gate C approved. Not clinical advice. Not for EHR write-back.
 */
import { gradeForSeed } from "../validate";
import type { HsiClaim, HsiEdge, HsiMarker, HsiTranslationCard } from "../schema";
import type { HsiCurationReview, HsiTeachingStatus } from "../grades";
import {
  HSI_SSC_SEED_CLAIMS,
  HSI_SSC_SEED_EDGES,
} from "./sscTfhBIl21";

const RECORDED = "2026-10-31T00:00:00.000Z";

function prov(
  partial: Partial<{
    pmid: string | null;
    doi: string | null;
    citationLabel: string | null;
    sourceUrl: string | null;
    notes: string | null;
  }> = {},
) {
  return {
    pmid: partial.pmid ?? null,
    doi: partial.doi ?? null,
    citationLabel: partial.citationLabel ?? null,
    sourceUrl: partial.sourceUrl ?? null,
    notes: partial.notes ?? "Phase 0 placeholder — awaiting citation + Gate C review.",
    recordedAt: RECORDED,
  };
}

/** True when seed has a durable literature locator (PMID/DOI/label) — not Gate C. */
export function hasEvidenceLocator(edge: Pick<HsiEdge, "provenance">): boolean {
  const p = edge.provenance;
  return Boolean(p?.pmid?.trim() || p?.doi?.trim() || p?.citationLabel?.trim());
}

type SeedSpec = {
  id: string;
  edgeType: HsiEdge["edgeType"];
  subjectId: string;
  subjectLabel: string;
  objectId: string;
  objectLabel: string;
  claimId: string;
  assertion: string;
  review: HsiCurationReview;
  teaching: HsiTeachingStatus;
  domain: HsiEdge["domain"];
  bridgeCandidate?: boolean;
  pmid?: string | null;
  doi?: string | null;
  citationLabel?: string | null;
  sourceUrl?: string | null;
  notes?: string | null;
};

const SPECS: SeedSpec[] = [
  // —— T2D core (Aksh-facing) ——
  {
    id: "HSI-E-T2D-001",
    edgeType: "biomarker_of",
    subjectId: "HSI-N-hba1c",
    subjectLabel: "HbA1c",
    objectId: "HSI-N-t2d",
    objectLabel: "Type 2 diabetes mellitus",
    claimId: "HSI-C-T2D-001",
    assertion: "Elevated HbA1c is used to diagnose and monitor type 2 diabetes.",
    review: "source-verified",
    teaching: "established",
    domain: "t2d",
    citationLabel: "ADA Standards of Care (placeholder citation label)",
    notes: "Clinical practice standard — map to durable locator in evidence sprint.",
  },
  {
    id: "HSI-E-T2D-002",
    edgeType: "biomarker_of",
    subjectId: "HSI-N-fpg",
    subjectLabel: "Fasting plasma glucose",
    objectId: "HSI-N-t2d",
    objectLabel: "Type 2 diabetes mellitus",
    claimId: "HSI-C-T2D-002",
    assertion: "Fasting plasma glucose above diagnostic thresholds indicates T2D.",
    review: "source-verified",
    teaching: "established",
    domain: "t2d",
    citationLabel: "WHO / ADA diagnostic criteria (placeholder)",
  },
  {
    id: "HSI-E-T2D-003",
    edgeType: "associated_with",
    subjectId: "HSI-N-insulin-resistance",
    subjectLabel: "Insulin resistance",
    objectId: "HSI-N-t2d",
    objectLabel: "Type 2 diabetes mellitus",
    claimId: "HSI-C-T2D-003",
    assertion: "Insulin resistance is a core pathophysiologic feature of T2D.",
    review: "unreviewed",
    teaching: "associative",
    domain: "t2d",
  },
  {
    id: "HSI-E-T2D-004",
    edgeType: "contributes_to",
    subjectId: "HSI-N-beta-cell-dysfunction",
    subjectLabel: "Pancreatic β-cell dysfunction",
    objectId: "HSI-N-t2d",
    objectLabel: "Type 2 diabetes mellitus",
    claimId: "HSI-C-T2D-004",
    assertion: "Progressive β-cell dysfunction contributes to hyperglycemia in T2D.",
    review: "unreviewed",
    teaching: "associative",
    domain: "t2d",
  },
  {
    id: "HSI-E-T2D-005",
    edgeType: "treats",
    subjectId: "HSI-N-metformin",
    subjectLabel: "Metformin",
    objectId: "HSI-N-t2d",
    objectLabel: "Type 2 diabetes mellitus",
    claimId: "HSI-C-T2D-005",
    assertion: "Metformin is first-line pharmacotherapy for many adults with T2D.",
    review: "source-verified",
    teaching: "established",
    domain: "t2d",
    citationLabel: "ADA pharmacologic therapy guidance (placeholder)",
  },
  {
    id: "HSI-E-T2D-006",
    edgeType: "treats",
    subjectId: "HSI-N-sglt2i",
    subjectLabel: "SGLT2 inhibitors",
    objectId: "HSI-N-t2d",
    objectLabel: "Type 2 diabetes mellitus",
    claimId: "HSI-C-T2D-006",
    assertion: "SGLT2 inhibitors lower glucose and reduce cardiorenal risk in selected T2D patients.",
    review: "claim-assessed",
    teaching: "associative",
    domain: "t2d",
    citationLabel: "Cardiorenal outcome trials class (placeholder)",
  },
  {
    id: "HSI-E-T2D-007",
    edgeType: "treats",
    subjectId: "HSI-N-glp1ra",
    subjectLabel: "GLP-1 receptor agonists",
    objectId: "HSI-N-t2d",
    objectLabel: "Type 2 diabetes mellitus",
    claimId: "HSI-C-T2D-007",
    assertion: "GLP-1 receptor agonists improve glycemic control and weight in T2D.",
    review: "claim-assessed",
    teaching: "associative",
    domain: "t2d",
  },
  {
    id: "HSI-E-T2D-008",
    edgeType: "risk_factor_for",
    subjectId: "HSI-N-obesity",
    subjectLabel: "Obesity",
    objectId: "HSI-N-t2d",
    objectLabel: "Type 2 diabetes mellitus",
    claimId: "HSI-C-T2D-008",
    assertion: "Obesity is a major modifiable risk factor for incident T2D.",
    review: "source-verified",
    teaching: "established",
    domain: "t2d",
    citationLabel: "Epidemiologic risk literature (placeholder)",
  },
  {
    id: "HSI-E-T2D-009",
    edgeType: "associated_with",
    subjectId: "HSI-N-cgm-tir",
    subjectLabel: "CGM time-in-range",
    objectId: "HSI-N-t2d",
    objectLabel: "Type 2 diabetes mellitus",
    claimId: "HSI-C-T2D-009",
    assertion: "CGM time-in-range complements HbA1c for glycemic assessment in T2D.",
    review: "unreviewed",
    teaching: "hypothesized",
    domain: "t2d",
  },
  {
    id: "HSI-E-T2D-010",
    edgeType: "worsens",
    subjectId: "HSI-N-glucocorticoids",
    subjectLabel: "Systemic glucocorticoids",
    objectId: "HSI-N-hyperglycemia",
    objectLabel: "Hyperglycemia",
    claimId: "HSI-C-T2D-010",
    assertion: "Systemic glucocorticoids can worsen hyperglycemia and unmask diabetes.",
    // Locator supports ISI REL-I010-suppresses-P001 (GC → NF-κB), not hyperglycemia S-P-O.
    review: "source-verified",
    teaching: "associative",
    domain: "t2d",
    pmid: "7569976",
    doi: "10.1126/science.270.5234.286",
    citationLabel:
      "Auphan N et al. Science 1995 — Immunosuppression by glucocorticoids: inhibition of NF-κB via IκB induction.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/7569976/",
    notes:
      "PMID 7569976 verified via Europe PMC. Supports ISI related_axis REL-I010-suppresses-P001 (corticosteroid → NF-κB). HSI hyperglycemia object is not this paper's claim — curator must not approve as hyperglycemia evidence. Gate C = human Neon approve only.",
  },

  // —— Immuno-metabolic bridge candidates (ISI ↔ Aksh) ——
  {
    id: "HSI-E-IM-001",
    edgeType: "bridges_domain",
    subjectId: "HSI-N-chronic-inflammation",
    subjectLabel: "Low-grade chronic inflammation",
    objectId: "HSI-N-insulin-resistance",
    objectLabel: "Insulin resistance",
    claimId: "HSI-C-IM-001",
    assertion: "Low-grade chronic inflammation is linked to insulin resistance (immuno-metabolic bridge).",
    review: "unreviewed",
    teaching: "hypothesized",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
  },
  {
    id: "HSI-E-IM-002",
    edgeType: "upregulates",
    subjectId: "HSI-N-tnf-alpha",
    subjectLabel: "TNF-α",
    objectId: "HSI-N-insulin-resistance",
    objectLabel: "Insulin resistance",
    claimId: "HSI-C-IM-002",
    assertion: "TNF-α signalling can impair insulin action in metabolic tissues.",
    // Locator supports ISI REL-M001-contributes_to-D001 (TNF → RA), not insulin-resistance S-P-O.
    review: "source-verified",
    teaching: "hypothesized",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
    pmid: "11244034",
    doi: "10.1146/annurev.immunol.19.1.163",
    citationLabel:
      "Feldmann M, Maini RN. Annu Rev Immunol 2001 — Anti-TNF-α therapy of rheumatoid arthritis: what have we learned?",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/11244034/",
    notes:
      "PMID 11244034 verified via Europe PMC. Supports ISI related_axis REL-M001-contributes_to-D001 (TNF → RA). Insulin-resistance object is absent from ISI — not T2D proof. Gate C = human Neon approve only.",
  },
  {
    id: "HSI-E-IM-003",
    edgeType: "associated_with",
    subjectId: "HSI-N-il6",
    subjectLabel: "IL-6",
    objectId: "HSI-N-t2d",
    objectLabel: "Type 2 diabetes mellitus",
    claimId: "HSI-C-IM-003",
    assertion: "Circulating IL-6 is associated with T2D risk and inflammatory tone.",
    // Locator supports ISI REL-M003-contributes_to-D001 (IL-6 pathway → RA), not T2D S-P-O.
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
    pmid: "18625622",
    doi: "10.1136/ard.2008.092932",
    citationLabel:
      "Emery P et al. Ann Rheum Dis 2008 — Tocilizumab (IL-6R inhibition) improves outcomes in RA refractory to anti-TNF.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/18625622/",
    notes:
      "PMID 18625622 verified via Europe PMC. Supports ISI related_axis REL-M003-contributes_to-D001 (IL-6 axis in RA). No Type 2 diabetes node in ISI — not T2D proof. Gate C = human Neon approve only.",
  },
  {
    id: "HSI-E-IM-004",
    edgeType: "biomarker_of",
    subjectId: "HSI-N-crp",
    subjectLabel: "hs-CRP",
    objectId: "HSI-N-chronic-inflammation",
    objectLabel: "Low-grade chronic inflammation",
    claimId: "HSI-C-IM-004",
    assertion: "hs-CRP is a clinical marker of systemic inflammatory burden.",
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
    pmid: "12813013",
    doi: "10.1172/JCI18921",
    citationLabel: "Pepys MB, Hirschfield GM. J Clin Invest 2003 — C-reactive protein: a critical update.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/12813013/",
    notes:
      "PMID 12813013 verified via Europe PMC. Supports ISI related_axis REL-P021-produces-B001 (acute-phase → CRP marker). Not a T2D edge. Gate C = human Neon approve only.",
  },
  {
    id: "HSI-E-IM-005",
    edgeType: "associated_with",
    subjectId: "HSI-N-adipose-macrophages",
    subjectLabel: "Adipose tissue macrophages",
    objectId: "HSI-N-insulin-resistance",
    objectLabel: "Insulin resistance",
    claimId: "HSI-C-IM-005",
    assertion: "Adipose tissue macrophage infiltration associates with insulin resistance.",
    // Locator supports ISI REL-C003-produces-M001 (macrophage → TNF), not adipose/IR S-P-O.
    review: "source-verified",
    teaching: "hypothesized",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
    pmid: "2993897",
    doi: "10.1038/316552a0",
    citationLabel:
      "Beutler B et al. Nature 1985 — Identity of tumour necrosis factor and the macrophage-secreted factor cachectin.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/2993897/",
    notes:
      "PMID 2993897 verified via Europe PMC. Supports ISI related_axis REL-C003-produces-M001 (macrophage → TNF). Adipose-tissue macrophage / insulin-resistance pair is not this paper — Gate C = human Neon approve only.",
  },
  {
    id: "HSI-E-IM-006",
    edgeType: "contributes_to",
    subjectId: "HSI-N-nlrp3",
    subjectLabel: "NLRP3 inflammasome",
    objectId: "HSI-N-metabolic-inflammation",
    objectLabel: "Metabolic inflammation",
    claimId: "HSI-C-IM-006",
    assertion: "NLRP3 inflammasome activation contributes to metabolic inflammation.",
    // Locator supports ISI REL-R004-activates-P003 (NLRP3 → inflammasome), not metabolic-inflammation object.
    review: "source-verified",
    teaching: "hypothesized",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
    pmid: "15030775",
    doi: "10.1016/s1074-7613(04)00046-9",
    citationLabel:
      "Agostini L et al. Immunity 2004 — NALP3 forms an IL-1β-processing inflammasome (Muckle-Wells).",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/15030775/",
    notes:
      "PMID 15030775 verified via Europe PMC. Supports ISI related_axis REL-R004-activates-P003 (NLRP3/NALP3 → inflammasome). Metabolic-inflammation object is not a KG node — not T2D proof. Gate C = human Neon approve only.",
  },
  {
    id: "HSI-E-IM-007",
    edgeType: "associated_with",
    subjectId: "HSI-N-t2d",
    subjectLabel: "Type 2 diabetes mellitus",
    objectId: "HSI-N-infection-risk",
    objectLabel: "Infection susceptibility",
    claimId: "HSI-C-IM-007",
    assertion: "T2D is associated with increased susceptibility to certain infections.",
    review: "claim-assessed",
    teaching: "associative",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
  },
  {
    id: "HSI-E-IM-008",
    edgeType: "worsens",
    subjectId: "HSI-N-hyperglycemia",
    subjectLabel: "Hyperglycemia",
    objectId: "HSI-N-innate-dysfunction",
    objectLabel: "Innate immune dysfunction",
    claimId: "HSI-C-IM-008",
    assertion: "Sustained hyperglycemia can impair aspects of innate immune function.",
    review: "unreviewed",
    teaching: "hypothesized",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
  },
  {
    id: "HSI-E-IM-009",
    edgeType: "associated_with",
    subjectId: "HSI-N-pcos-autoimmune-overlap",
    subjectLabel: "Autoimmune–metabolic comorbidity",
    objectId: "HSI-N-t2d",
    objectLabel: "Type 2 diabetes mellitus",
    claimId: "HSI-C-IM-009",
    assertion: "Some autoimmune conditions co-occur with higher T2D risk (bridge shortlist).",
    review: "draft",
    teaching: "unknown",
    domain: "autoimmunity",
    bridgeCandidate: true,
  },
  {
    id: "HSI-E-IM-010",
    edgeType: "inhibits",
    subjectId: "HSI-N-anti-il1",
    subjectLabel: "IL-1 pathway blockade",
    objectId: "HSI-N-metabolic-inflammation",
    objectLabel: "Metabolic inflammation",
    claimId: "HSI-C-IM-010",
    assertion: "IL-1 pathway blockade has been studied for metabolic inflammation (research only).",
    review: "source-verified",
    teaching: "hypothesized",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
    pmid: "28845751",
    doi: "10.1056/NEJMoa1707914",
    citationLabel:
      "Ridker PM et al. N Engl J Med 2017 — CANTOS: antiinflammatory therapy with canakinumab (IL-1β).",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/28845751/",
    notes:
      "PMID 28845751 verified via Europe PMC / PubMed. Supports ISI related_axis REL-I023-targets-M002 (canakinumab → IL-1β). Discovery / research only — not Aksh CDS-actionable; not metabolic-inflammation KG proof. Gate C = human Neon approve only.",
  },

  // —— IO / autoimmunity wedge stubs (ISI density, not CDS) ——
  {
    id: "HSI-E-IO-001",
    edgeType: "drives",
    subjectId: "HSI-N-pd1",
    subjectLabel: "PD-1",
    objectId: "HSI-N-tcell-exhaustion",
    objectLabel: "T-cell exhaustion",
    claimId: "HSI-C-IO-001",
    assertion: "PD-1 signalling contributes to T-cell exhaustion phenotypes (educational graph).",
    // Real PubMed locator (Barber 2006 Nature). HSI source-verified only —
    // NOT Gate C approved, NOT live-KG auto-approve, NOT CDS.
    review: "source-verified",
    teaching: "associative",
    domain: "io",
    pmid: "16382236",
    doi: "10.1038/nature04444",
    citationLabel: "Barber DL et al. Nature 2006 — Restoring function in exhausted CD8 T cells during chronic viral infection.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/16382236/",
    notes:
      "PMID 16382236 verified via PubMed/E-utilities. Maps to ISI REL-R011-drives-P015 for Gate C handoff. Same paper is also cited on REL-C015-expresses-R011 (expression axis) — curator must re-assess claim_support=supports for drives→P015 S-P-O before approve. Do not treat HSI source-verified as Neon Gate C pass.",
  },
  {
    id: "HSI-E-IO-002",
    edgeType: "associated_with",
    subjectId: "HSI-N-checkpoint-therapy",
    subjectLabel: "Immune checkpoint therapy",
    objectId: "HSI-N-irae",
    objectLabel: "Immune-related adverse events",
    claimId: "HSI-C-IO-002",
    assertion: "Immune checkpoint therapy is associated with immune-related adverse events.",
    review: "source-verified",
    teaching: "associative",
    domain: "io",
    citationLabel: "irAE clinical reviews (placeholder)",
  },
  {
    id: "HSI-E-IO-003",
    edgeType: "associated_with",
    subjectId: "HSI-N-irae",
    subjectLabel: "Immune-related adverse events",
    objectId: "HSI-N-hyperglycemia",
    objectLabel: "Hyperglycemia",
    claimId: "HSI-C-IO-003",
    assertion: "Some irAEs and steroid treatment can present with hyperglycemia (bridge-relevant).",
    review: "unreviewed",
    teaching: "hypothesized",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
  },
  {
    id: "HSI-E-AU-001",
    edgeType: "associated_with",
    subjectId: "HSI-N-t1d-autoimmunity",
    subjectLabel: "Type 1 diabetes autoimmunity",
    objectId: "HSI-N-islet-autoantibodies",
    objectLabel: "Islet autoantibodies",
    claimId: "HSI-C-AU-001",
    assertion: "Islet autoantibodies mark autoimmune β-cell targeting in T1D (contrast with T2D).",
    // Locator supports ISI REL-B015-predicts_eligibility_for-I013 (autoAbs → teplizumab eligibility).
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    pmid: "31180194",
    doi: "10.1056/NEJMoa1902226",
    citationLabel:
      "Herold KC et al. N Engl J Med 2019 — Teplizumab in relatives at risk for type 1 diabetes (autoantibody-defined eligibility).",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/31180194/",
    notes:
      "PMID 31180194 verified via Europe PMC. Supports ISI related_axis REL-B015-predicts_eligibility_for-I013 (islet autoantibodies → teplizumab eligibility). T1D contrast with T2D clinics — not a T2D edge. Gate C = human Neon approve only.",
  },
  {
    id: "HSI-E-AU-002",
    edgeType: "bridges_domain",
    subjectId: "HSI-N-lada",
    subjectLabel: "LADA / latent autoimmune diabetes",
    objectId: "HSI-N-t2d",
    objectLabel: "Type 2 diabetes mellitus",
    claimId: "HSI-C-AU-002",
    assertion: "LADA can present with adult-onset diabetes phenotypes overlapping T2D clinics.",
    review: "unreviewed",
    teaching: "associative",
    domain: "autoimmunity",
    bridgeCandidate: true,
  },

  // —— RA / TNF pathway (Phase 2 scope-locked; Phase 3 evidence depth; partnerSigned=false) ——
  // Partner-scoped literature slice for anti-TNF response heterogeneity (see partnerLock.ts).
  // SLE / psoriasis / IBD below remain illustrative-only stubs.
  {
    id: "HSI-E-RA-001",
    edgeType: "contributes_to",
    subjectId: "HSI-N-tnf-alpha",
    subjectLabel: "TNF-α",
    objectId: "HSI-N-ra",
    objectLabel: "Rheumatoid arthritis",
    claimId: "HSI-C-RA-001",
    assertion:
      "TNF-α contributes to synovial inflammation in rheumatoid arthritis (scope-locked pathway seed — not a partner-signed lock).",
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    pmid: "11244034",
    doi: "10.1146/annurev.immunol.19.1.163",
    citationLabel:
      "Feldmann M, Maini RN. Annu Rev Immunol 2001 — Anti-TNF-α therapy of rheumatoid arthritis: what have we learned?",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/11244034/",
    notes:
      "Scope-locked RA pathway seed (scopeLocked=true; partnerSigned=false; lockedPilot=false). PMID 11244034 verified. Maps toward ISI REL-M001-contributes_to-D001. Gate C handoff pattern mirrors PMID 16382236 (evidence-linked · pending human Neon approve). Not partner-signed.",
  },
  {
    id: "HSI-E-RA-002",
    edgeType: "biomarker_of",
    subjectId: "HSI-N-anti-ccp",
    subjectLabel: "Anti-CCP antibodies",
    objectId: "HSI-N-ra",
    objectLabel: "Rheumatoid arthritis",
    claimId: "HSI-C-RA-002",
    assertion:
      "Anti-CCP (ACPA) antibodies are a serologic biomarker used in rheumatoid arthritis workup (scope-locked — not partner-signed / not CDS).",
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    pmid: "10662881",
    doi: "10.1002/1529-0131(200001)43:1<155::AID-ANR20>3.0.CO;2-3",
    citationLabel:
      "Schellekens GA et al. Arthritis Rheum 2000 — The diagnostic properties of rheumatoid arthritis antibodies recognizing a cyclic citrullinated peptide.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/10662881/",
    notes:
      "Scope-locked RA biomarker seed with LOINC 53031-9. PMID 10662881 verified via PubMed. No durable ISI REL-* for anti-CCP→RA yet — marker_only map. Gate C = human Neon approve only. Not CDS.",
  },
  {
    id: "HSI-E-RA-003",
    edgeType: "treats",
    subjectId: "HSI-N-anti-tnf",
    subjectLabel: "Anti-TNF therapy",
    objectId: "HSI-N-ra",
    objectLabel: "Rheumatoid arthritis",
    claimId: "HSI-C-RA-003",
    assertion:
      "Anti-TNF therapy (e.g. infliximab class) improves clinical outcomes in rheumatoid arthritis when combined with methotrexate in established trials (scope-locked — response heterogeneity remains open).",
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    pmid: "11087881",
    doi: "10.1056/NEJM200011303432202",
    citationLabel:
      "Lipsky PE et al. N Engl J Med 2000 — Infliximab and methotrexate in the treatment of rheumatoid arthritis.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/11087881/",
    notes:
      "Scope-locked RA treatment seed for anti-TNF response question. PMID 11087881 verified. Does not prove uniform response — pairs with RA-004/005 and Phase 3 ADA/serology edges. No invented ISI REL; Gate C = human Neon approve only. Not CDS.",
  },
  {
    id: "HSI-E-RA-004",
    edgeType: "contributes_to",
    subjectId: "HSI-N-il6",
    subjectLabel: "IL-6",
    objectId: "HSI-N-ra",
    objectLabel: "Rheumatoid arthritis",
    claimId: "HSI-C-RA-004",
    assertion:
      "IL-6 pathway signalling contributes to rheumatoid arthritis inflammatory tone (competing axis vs TNF-centric framing).",
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    pmid: "18625622",
    doi: "10.1136/ard.2008.092932",
    citationLabel:
      "Emery P et al. Ann Rheum Dis 2008 — Tocilizumab (IL-6R inhibition) improves outcomes in RA refractory to anti-TNF.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/18625622/",
    notes:
      "Scope-locked RA multi-cytokine seed. PMID 18625622 verified. Supports ISI related_axis REL-M003-contributes_to-D001. Same paper underpins anti-TNF-refractory framing (RA-005). Gate C = human Neon approve only.",
  },
  {
    id: "HSI-E-RA-005",
    edgeType: "associated_with",
    subjectId: "HSI-N-anti-tnf-refractory",
    subjectLabel: "Anti-TNF refractory RA phenotype",
    objectId: "HSI-N-il6-axis",
    objectLabel: "IL-6 pathway axis",
    claimId: "HSI-C-RA-005",
    assertion:
      "Some patients with inadequate anti-TNF response still show benefit from IL-6 pathway inhibition — supporting competing mechanisms for response heterogeneity (uncertain grade).",
    review: "source-verified",
    teaching: "hypothesized",
    domain: "autoimmunity",
    pmid: "18625622",
    doi: "10.1136/ard.2008.092932",
    citationLabel:
      "Emery P et al. Ann Rheum Dis 2008 — Tocilizumab improves outcomes in RA refractory to anti-TNF.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/18625622/",
    notes:
      "Scope-locked response-heterogeneity seed for the pilot question. PMID 18625622 verified. S-P-O is related_axis (trial population = anti-TNF inadequate responders → IL-6R blockade), not a universal causal map. Curator must re-assess claim_support before Neon Gate C approve — same honesty pattern as PMID 16382236 handoff. Not CDS.",
  },
  {
    id: "HSI-E-RA-006",
    edgeType: "upregulates",
    subjectId: "HSI-N-synovial-macrophages",
    subjectLabel: "Synovial macrophages",
    objectId: "HSI-N-tnf-alpha",
    objectLabel: "TNF-α",
    claimId: "HSI-C-RA-006",
    assertion:
      "Macrophages are a cellular source of TNF-α — relevant to synovial TNF biology in rheumatoid arthritis (entity-slice seed).",
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    pmid: "2993897",
    doi: "10.1038/316552a0",
    citationLabel:
      "Beutler B et al. Nature 1985 — Identity of tumour necrosis factor and the macrophage-secreted factor cachectin.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/2993897/",
    notes:
      "Scope-locked cell→cytokine seed. PMID 2993897 verified. Supports ISI related_axis REL-C003-produces-M001 (macrophage → TNF); HSI edgeType=upregulates (no produces predicate in Phase 0). Paper is foundational identity, not RA synovial histology — curator must not overclaim tissue specificity at Gate C. Not CDS.",
  },
  // —— Phase 3 depth: ADA/immunogenicity, serology tension, RF LOINC, MTX combo ——
  {
    id: "HSI-E-RA-007",
    edgeType: "associated_with",
    subjectId: "HSI-N-anti-tnf-ada",
    subjectLabel: "Anti-drug antibodies to anti-TNF (ADA)",
    objectId: "HSI-N-anti-tnf-refractory",
    objectLabel: "Anti-TNF refractory RA phenotype",
    claimId: "HSI-C-RA-007",
    assertion:
      "Development of anti-infliximab antibodies is associated with reduced clinical response to infliximab in rheumatoid arthritis (immunogenicity competing frame for anti-TNF response heterogeneity).",
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    pmid: "16508927",
    doi: "10.1002/art.21671",
    citationLabel:
      "Wolbink GJ et al. Arthritis Rheum 2006 — Development of antiinfliximab antibodies and relationship to clinical response in RA.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/16508927/",
    notes:
      "Phase 3 partner-scoped depth. PMID 16508927 verified via PubMed/E-utilities. Competing explanation vs cytokine-axis-only narratives — ADA/immunogenicity as a response-heterogeneity mechanism. Infliximab-specific cohort; do not over-generalise to all anti-TNF agents at Gate C. Not CDS; partnerSigned=false.",
  },
  {
    id: "HSI-E-RA-008",
    edgeType: "associated_with",
    subjectId: "HSI-N-anti-tnf-ada",
    subjectLabel: "Anti-drug antibodies to anti-TNF (ADA)",
    objectId: "HSI-N-anti-tnf-immunogenicity",
    objectLabel: "Anti-TNF immunogenicity / bioavailability monitoring",
    claimId: "HSI-C-RA-008",
    assertion:
      "Low early trough infliximab levels and subsequent anti-infliximab antibodies associate with infusion reactions and treatment failure — supporting immunogenicity monitoring as a response-heterogeneity axis (not CDS).",
    review: "source-verified",
    teaching: "hypothesized",
    domain: "autoimmunity",
    pmid: "17133559",
    doi: "10.1002/art.22214",
    citationLabel:
      "Bendtzen K et al. Arthritis Rheum 2006 — Individualized monitoring of drug bioavailability and immunogenicity in infliximab-treated RA.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/17133559/",
    notes:
      "Phase 3 partner-scoped depth. PMID 17133559 verified via PubMed/E-utilities. Deepens ADA frame (pairs with RA-007); teaching=hypothesized because assay/threshold generalisation to all anti-TNF remains open. No invented ISI REL-*. Gate C = human Neon approve only. Not CDS.",
  },
  {
    id: "HSI-E-RA-009",
    edgeType: "associated_with",
    subjectId: "HSI-N-ra-seropositive",
    subjectLabel: "RF/ACPA seropositive RA phenotype",
    objectId: "HSI-N-anti-tnf-response-het",
    objectLabel: "Anti-TNF response heterogeneity",
    claimId: "HSI-C-RA-009",
    assertion:
      "RF and/or anti-CCP positivity has been associated with differential mean DAS28 improvement on anti-TNF therapy in observational cohorts (serology competing frame — direction and magnitude remain contested).",
    review: "source-verified",
    teaching: "hypothesized",
    domain: "autoimmunity",
    pmid: "18375541",
    doi: "10.1136/ard.2007.084715",
    citationLabel:
      "Potter C et al. Ann Rheum Dis 2009 — Association of RF and anti-CCP positivity with anti-TNF response in RA.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/18375541/",
    notes:
      "Phase 3 partner-scoped depth. PMID 18375541 verified via PubMed/E-utilities. Seropositive patients showed smaller mean DAS28 improvement in this cohort — do not invent predictive CDS rules. Competes with RA-010 meta-analysis finding no association. Gate C = human Neon approve only.",
  },
  {
    id: "HSI-E-RA-010",
    edgeType: "associated_with",
    subjectId: "HSI-N-ra-seropositive",
    subjectLabel: "RF/ACPA seropositive RA phenotype",
    objectId: "HSI-N-anti-tnf",
    objectLabel: "Anti-TNF therapy",
    claimId: "HSI-C-RA-010",
    assertion:
      "Pooled evidence does not support RF or anti-CCP status as a reliable predictor of clinical response to anti-TNFα agents (competing with single-cohort serology associations).",
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    pmid: "24586782",
    doi: "10.1371/journal.pone.0089442",
    citationLabel:
      "Lv Q et al. PLoS One 2014 — RF and anti-CCP status are not associated with anti-TNFα treatment effect (meta-analysis).",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/24586782/",
    notes:
      "Phase 3 partner-scoped depth. PMID 24586782 verified via PubMed/E-utilities. Explicit competing frame vs RA-009 — keep both visible; do not collapse serology into a confident response predictor. Meta-analysis heterogeneity noted in paper. Gate C = human Neon approve only. Not CDS.",
  },
  {
    id: "HSI-E-RA-011",
    edgeType: "biomarker_of",
    subjectId: "HSI-N-rf",
    subjectLabel: "Rheumatoid factor (RF)",
    objectId: "HSI-N-ra",
    objectLabel: "Rheumatoid arthritis",
    claimId: "HSI-C-RA-011",
    assertion:
      "Rheumatoid factor is a serologic biomarker used in rheumatoid arthritis classification and workup alongside ACPA (scope-locked LOINC marker — not an anti-TNF response predictor by itself).",
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    pmid: "20699241",
    doi: "10.1136/ard.2010.138461",
    citationLabel:
      "Aletaha D et al. Ann Rheum Dis 2010 — 2010 ACR/EULAR rheumatoid arthritis classification criteria.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/20699241/",
    notes:
      "Phase 3 partner-scoped depth. PMID 20699241 verified via PubMed/E-utilities. LOINC 11572-5 on RF marker. Classification/workup context only — do not equate RF positivity with anti-TNF response prediction (see RA-009/010 tension). No invented ISI REL-*. Gate C = human Neon approve only. Not CDS.",
  },
  {
    id: "HSI-E-RA-012",
    edgeType: "treats",
    subjectId: "HSI-N-mtx-anti-tnf-combo",
    subjectLabel: "Methotrexate + anti-TNF combination therapy",
    objectId: "HSI-N-ra",
    objectLabel: "Rheumatoid arthritis",
    claimId: "HSI-C-RA-012",
    assertion:
      "Infliximab plus methotrexate improves clinical and radiographic outcomes versus methotrexate alone in RA — relevant background for interpreting anti-TNF response and immunogenicity in combination regimens.",
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    pmid: "10622295",
    doi: "10.1016/s0140-6736(99)05246-0",
    citationLabel:
      "Maini R et al. Lancet 1999 — ATTRACT: infliximab vs placebo in RA patients receiving concomitant methotrexate.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/10622295/",
    notes:
      "Phase 3 partner-scoped depth. PMID 10622295 verified via PubMed/E-utilities. Complements Lipsky 2000 (RA-003) with the earlier ATTRACT combination-therapy frame; not a duplicate of ADA edges. No invented ISI REL-*. Gate C = human Neon approve only. Not CDS.",
  },
  {
    id: "HSI-E-SLE-001",
    edgeType: "associated_with",
    subjectId: "HSI-N-type1-ifn",
    subjectLabel: "Type I interferon pathway",
    objectId: "HSI-N-sle",
    objectLabel: "Systemic lupus erythematosus",
    claimId: "HSI-C-SLE-001",
    assertion:
      "Type I interferon pathway activation associates with SLE pathophysiology (illustrative — not locked pilot).",
    review: "unreviewed",
    teaching: "hypothesized",
    domain: "autoimmunity",
    notes:
      "Illustrative SLE pathway stub for Discovery Centre vocabulary. No invented PMID. Partner lock TBD.",
  },
  {
    id: "HSI-E-SLE-002",
    edgeType: "biomarker_of",
    subjectId: "HSI-N-ana",
    subjectLabel: "Antinuclear antibodies (ANA)",
    objectId: "HSI-N-sle",
    objectLabel: "Systemic lupus erythematosus",
    claimId: "HSI-C-SLE-002",
    assertion:
      "ANA testing is used in the serologic workup of SLE (illustrative biomarker — not locked pilot / not CDS).",
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    citationLabel: "ANA clinical laboratory guidance (placeholder locator)",
    notes:
      "Illustrative SLE biomarker seed with LOINC-capable marker. Not a diagnosis claim. Gate C deferred.",
  },
  {
    id: "HSI-E-PSO-001",
    edgeType: "drives",
    subjectId: "HSI-N-il17",
    subjectLabel: "IL-17 pathway",
    objectId: "HSI-N-psoriasis",
    objectLabel: "Psoriasis / psoriatic disease",
    claimId: "HSI-C-PSO-001",
    assertion:
      "IL-17 pathway signalling drives psoriatic skin inflammation (illustrative — not locked pilot).",
    review: "unreviewed",
    teaching: "hypothesized",
    domain: "autoimmunity",
    notes:
      "Illustrative psoriasis pathway stub aligned to Discovery Centre disease picker. No invented PMID.",
  },
  {
    id: "HSI-E-IBD-001",
    edgeType: "associated_with",
    subjectId: "HSI-N-il23",
    subjectLabel: "IL-23 pathway",
    objectId: "HSI-N-ibd",
    objectLabel: "Inflammatory bowel disease",
    claimId: "HSI-C-IBD-001",
    assertion:
      "IL-23 pathway biology associates with IBD inflammatory tone (illustrative — not locked pilot).",
    review: "unreviewed",
    teaching: "hypothesized",
    domain: "autoimmunity",
    notes:
      "Illustrative IBD pathway stub aligned to Discovery Centre disease picker. No invented PMID.",
  },
];

function toEdge(spec: SeedSpec): HsiEdge {
  const curationReview = spec.review;
  return {
    id: spec.id,
    edgeType: spec.edgeType,
    subjectId: spec.subjectId,
    subjectLabel: spec.subjectLabel,
    objectId: spec.objectId,
    objectLabel: spec.objectLabel,
    claimId: spec.claimId,
    curationReview,
    hsiGrade: gradeForSeed(curationReview),
    teachingStatus: spec.teaching,
    domain: spec.domain,
    provenance: prov({
      pmid: spec.pmid ?? null,
      doi: spec.doi ?? null,
      citationLabel: spec.citationLabel ?? null,
      sourceUrl: spec.sourceUrl ?? null,
      notes: spec.notes ?? null,
    }),
    bridgeCandidate: Boolean(spec.bridgeCandidate),
    seedKind: "placeholder",
  };
}

function toClaim(spec: SeedSpec): HsiClaim {
  return {
    id: spec.claimId,
    assertion: spec.assertion,
    domain: spec.domain,
    isiRelationshipId: null,
    akshNodeId: null,
  };
}

/** Core T2D / immuno / RA / illustrative stubs — SSc dual-track slice appended (no RA wipe). */
export const HSI_T2D_IMMUNO_SEED_EDGES: HsiEdge[] = [
  ...SPECS.map(toEdge),
  ...HSI_SSC_SEED_EDGES,
];
export const HSI_T2D_IMMUNO_SEED_CLAIMS: HsiClaim[] = [
  ...SPECS.map(toClaim),
  ...HSI_SSC_SEED_CLAIMS,
];

export const HSI_MARKERS: HsiMarker[] = [
  {
    id: "HSI-N-hba1c",
    name: "Hemoglobin A1c",
    loinc: "4548-4",
    unit: "%",
    description: "Glycated hemoglobin — glycemic control / diagnosis support.",
  },
  {
    id: "HSI-N-fpg",
    name: "Fasting plasma glucose",
    loinc: "1558-6",
    unit: "mg/dL",
    description: "Fasting glucose for diagnosis and monitoring.",
  },
  {
    id: "HSI-N-crp",
    name: "C-reactive protein (high sensitivity)",
    loinc: "30522-7",
    unit: "mg/L",
    description: "Systemic inflammatory marker (immuno-metabolic bridge).",
  },
  {
    id: "HSI-N-il6",
    name: "Interleukin-6",
    loinc: "26881-3",
    unit: "pg/mL",
    description: "Cytokine often elevated in inflammatory / metabolic contexts.",
  },
  {
    id: "HSI-N-cgm-tir",
    name: "CGM time in range",
    loinc: null,
    unit: "%",
    description: "Proportion of CGM readings in target range (LOINC TBD).",
  },
  {
    id: "HSI-N-anti-ccp",
    name: "Cyclic citrullinated peptide Ab (anti-CCP)",
    loinc: "53031-9",
    unit: null,
    description:
      "Serologic marker used in RA workup (scope-locked partner pathway — partnerSigned=false / not CDS).",
  },
  {
    id: "HSI-N-rf",
    name: "Rheumatoid factor (RF)",
    loinc: "11572-5",
    unit: null,
    description:
      "Serologic marker used in RA classification / workup (Phase 3 LOINC coverage — not an anti-TNF response predictor / not CDS).",
  },
  {
    id: "HSI-N-ana",
    name: "Antinuclear antibodies (ANA)",
    loinc: "42254-3",
    unit: null,
    description:
      "ANA pattern / titer used in SLE and related autoimmune workup (illustrative — not CDS).",
  },
];

/** One T2D + one IO/immuno-metabolic translation card (roadmap b3). */
export const HSI_EXAMPLE_TRANSLATION_CARDS: HsiTranslationCard[] = [
  {
    id: "HSI-CARD-T2D-001",
    claim: HSI_T2D_IMMUNO_SEED_CLAIMS.find((c) => c.id === "HSI-C-T2D-001")!,
    edge: HSI_T2D_IMMUNO_SEED_EDGES.find((e) => e.id === "HSI-E-T2D-001")!,
    marker: HSI_MARKERS[0]!,
    observation: {
      id: "HSI-OBS-FIXTURE-001",
      markerId: "HSI-N-hba1c",
      value: 8.2,
      unit: "%",
      observedAt: "visit",
      dataClass: "fixture",
    },
    action: {
      id: "HSI-ACT-T2D-001",
      label: "Review glycemic regimen (HITL)",
      rationale: "Elevated HbA1c observation linked to graded T2D monitoring claim — clinician decides.",
      requiresHitl: true,
      // Not established+approved yet → must stay false until Gate C.
      cdsEligibleHint: false,
    },
  },
  {
    id: "HSI-CARD-IM-001",
    claim: HSI_T2D_IMMUNO_SEED_CLAIMS.find((c) => c.id === "HSI-C-IM-004")!,
    edge: HSI_T2D_IMMUNO_SEED_EDGES.find((e) => e.id === "HSI-E-IM-004")!,
    marker: HSI_MARKERS[2]!,
    observation: {
      id: "HSI-OBS-FIXTURE-002",
      markerId: "HSI-N-crp",
      value: 4.1,
      unit: "mg/L",
      observedAt: "visit",
      dataClass: "fixture",
    },
    action: {
      id: "HSI-ACT-IM-001",
      label: "Flag immuno-metabolic context for review (discovery / HITL)",
      rationale: "hs-CRP marker links inflammation claim to patient signal — not auto diagnosis.",
      requiresHitl: true,
      cdsEligibleHint: false,
    },
  },
];

export function listBridgeCandidates(): HsiEdge[] {
  return HSI_T2D_IMMUNO_SEED_EDGES.filter((e) => e.bridgeCandidate);
}
