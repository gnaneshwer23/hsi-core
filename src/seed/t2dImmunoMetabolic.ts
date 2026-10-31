/**
 * HSI Phase 0 — curated placeholder T2D / immuno-metabolic edge set.
 * Provenance fields present; many PMIDs intentionally null until evidence sprint.
 * Not Gate C approved. Not clinical advice. Not for EHR write-back.
 */
import { gradeForSeed } from "../validate";
import type { HsiClaim, HsiEdge, HsiMarker, HsiTranslationCard } from "../schema";
import type { HsiCurationReview, HsiTeachingStatus } from "../grades";

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
  citationLabel?: string | null;
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
    review: "source-verified",
    teaching: "associative",
    domain: "t2d",
    citationLabel: "Drug-induced hyperglycemia reviews (placeholder)",
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
    review: "draft",
    teaching: "hypothesized",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
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
    review: "unreviewed",
    teaching: "associative",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
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
    citationLabel: "Inflammation biomarker practice (placeholder)",
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
    review: "draft",
    teaching: "hypothesized",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
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
    review: "unreviewed",
    teaching: "hypothesized",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
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
    review: "unreviewed",
    teaching: "hypothesized",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
    notes: "ISI discovery only — not Aksh CDS-actionable.",
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
    review: "draft",
    teaching: "hypothesized",
    domain: "io",
    notes: "Align with ISI honesty overrides; placeholder for HSI mapping.",
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
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    citationLabel: "Islet autoantibody consensus (placeholder)",
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
      citationLabel: spec.citationLabel ?? null,
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

export const HSI_T2D_IMMUNO_SEED_EDGES: HsiEdge[] = SPECS.map(toEdge);
export const HSI_T2D_IMMUNO_SEED_CLAIMS: HsiClaim[] = SPECS.map(toClaim);

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
