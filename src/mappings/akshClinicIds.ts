/**
 * Durable Aksh clinic concept ids for HSI ↔ HITL joins.
 *
 * No live Aksh clinical KG repo publishes canonical graph ids yet
 * (aksh-health platform uses LOINC lab kinds + SNOMED/ICD in pathway copy).
 * Until that KG ships, hsi-core owns a stable `aksh:` namespace grounded in
 * akshhealth.com / platform-uk clinic concepts (conditions, findings,
 * medicines, risk, interactions) — NOT random AKSH-E-001 placeholders.
 *
 * Rules:
 * - Filling claim.akshNodeId never opens CDS / EHR write-back / Gate C.
 * - Prefer LOINC when the concept is a lab finding Aksh already catalogues.
 * - Old provisional `AKSH-N-*` ids migrate via PROVISIONAL_AKSH_TO_DURABLE.
 */

/** Concept kinds under the `aksh:` namespace. */
export type AkshClinicKind =
  | "condition"
  | "finding"
  | "medicine"
  | "risk"
  | "pathway"
  | "interaction"
  | "watch";

export type AkshClinicConcept = {
  /** Canonical durable id, e.g. `aksh:finding:hba1c`. */
  id: string;
  kind: AkshClinicKind;
  /** Short human label (clinic-facing). */
  label: string;
  /** Grounding note — Aksh surface / terminology, not invented science. */
  grounding: string;
  /** Primary LOINC when the concept is a lab finding; null otherwise. */
  loinc: string | null;
  /** Optional ICD-10 / SNOMED hint from Aksh pathway copy (not a KG claim). */
  codingHint: string | null;
};

const NS = "aksh" as const;

function id(kind: AkshClinicKind, slug: string): string {
  return `${NS}:${kind}:${slug}`;
}

/**
 * Registry of durable clinic concepts used by the P1 HITL map.
 * Slugs are stable; do not renumber — extend with new slugs only.
 */
export const AKSH_CLINIC_CONCEPTS: readonly AkshClinicConcept[] = [
  // —— Conditions ——
  {
    id: id("condition", "t2dm"),
    kind: "condition",
    label: "Type 2 diabetes mellitus",
    grounding:
      "Aksh diabetes module + marketing T2D pathway (E11.* / SNOMED 44054006 in platform-uk pathway copy).",
    loinc: null,
    codingHint: "ICD-10 E11; SNOMED 44054006",
  },
  {
    id: id("condition", "lada"),
    kind: "condition",
    label: "Latent autoimmune diabetes in adults",
    grounding: "Adult-onset autoimmune diabetes differential in T2D clinics — pathway template only.",
    loinc: null,
    codingHint: null,
  },
  {
    id: id("condition", "obesity"),
    kind: "condition",
    label: "Obesity",
    grounding: "Aksh ORACLE / metabolic risk surface — modifiable T2D comorbidity slot.",
    loinc: null,
    codingHint: null,
  },

  // —— Findings (LOINC-linked where Aksh lab catalog already accepts them) ——
  {
    id: id("finding", "hba1c"),
    kind: "finding",
    label: "HbA1c",
    grounding:
      "Aksh LAB_CATALOG.hba1c — primary LOINC 4548-4 (also 17856-6, 41995-2, 59261-8).",
    loinc: "4548-4",
    codingHint: null,
  },
  {
    id: id("finding", "fpg"),
    kind: "finding",
    label: "Fasting plasma glucose",
    grounding:
      "Aksh LAB_CATALOG.glucose — fasting diagnostic use; LOINC 1558-6 (FPG) / family 2345-7.",
    loinc: "1558-6",
    codingHint: null,
  },
  {
    id: id("finding", "hscrp"),
    kind: "finding",
    label: "High-sensitivity C-reactive protein",
    grounding: "Inflammatory marker for immuno-metabolic context cards; HSI marker LOINC 30522-7.",
    loinc: "30522-7",
    codingHint: null,
  },
  {
    id: id("finding", "cgm-tir"),
    kind: "finding",
    label: "CGM time-in-range",
    grounding: "Aksh connected-diabetes / CGM journey — complements HbA1c; no single LOINC yet.",
    loinc: null,
    codingHint: null,
  },
  {
    id: id("finding", "islet-autoantibodies"),
    kind: "finding",
    label: "Islet autoantibodies",
    grounding: "T1D / LADA differential labs — not T2D CDS proof.",
    loinc: null,
    codingHint: null,
  },
  {
    id: id("finding", "hyperglycemia"),
    kind: "finding",
    label: "Hyperglycaemia",
    grounding: "Clinic finding used in steroid / irAE watch pathways (E11.65 in demo cases).",
    loinc: null,
    codingHint: "ICD-10 E11.65 (with hyperglycaemia)",
  },

  // —— Medicines ——
  {
    id: id("medicine", "metformin"),
    kind: "medicine",
    label: "Metformin",
    grounding: "Aksh T2D demo regimens + GUARDIAN med review — first-line pharmacotherapy concept.",
    loinc: null,
    codingHint: null,
  },
  {
    id: id("medicine", "sglt2i"),
    kind: "medicine",
    label: "SGLT2 inhibitor class",
    grounding: "Aksh diabetes pharmacotherapy class slot — class-level HITL, not a single RxNorm.",
    loinc: null,
    codingHint: null,
  },
  {
    id: id("medicine", "glp1ra"),
    kind: "medicine",
    label: "GLP-1 receptor agonist class",
    grounding: "Aksh diabetes pharmacotherapy class slot — class-level HITL.",
    loinc: null,
    codingHint: null,
  },
  {
    id: id("medicine", "glucocorticoid"),
    kind: "medicine",
    label: "Systemic glucocorticoid",
    grounding: "Steroid exposure → hyperglycaemia watch in metabolic / irAE pathways.",
    loinc: null,
    codingHint: null,
  },

  // —— Risk ——
  {
    id: id("risk", "infection-susceptibility"),
    kind: "risk",
    label: "Infection susceptibility (T2D context)",
    grounding: "Clinic-relevant bridge watch — not day-1 CDS.",
    loinc: null,
    codingHint: null,
  },

  // —— Pathway templates ——
  {
    id: id("pathway", "insulin-resistance"),
    kind: "pathway",
    label: "Insulin resistance",
    grounding: "Pathophysiology template for future HITL cards — not CDS-actionable from map alone.",
    loinc: null,
    codingHint: null,
  },
  {
    id: id("pathway", "beta-cell-dysfunction"),
    kind: "pathway",
    label: "β-cell dysfunction",
    grounding: "T2D pathway context for HITL — map pointer only.",
    loinc: null,
    codingHint: null,
  },

  // —— Interactions / watches (immuno-metabolic bridges) ——
  {
    id: id("interaction", "inflammation-insulin-resistance"),
    kind: "interaction",
    label: "Chronic inflammation ↔ insulin resistance",
    grounding: "Immuno-metabolic bridge shortlist — no ISI REL yet; watch id only.",
    loinc: null,
    codingHint: null,
  },
  {
    id: id("interaction", "tnf-insulin-resistance"),
    kind: "interaction",
    label: "TNF-α ↔ insulin resistance",
    grounding: "Bridge watch; seed PMID may support ISI RA axis, not T2D CDS.",
    loinc: null,
    codingHint: null,
  },
  {
    id: id("interaction", "il6-t2dm"),
    kind: "interaction",
    label: "IL-6 ↔ T2D association",
    grounding: "Bridge watch / lab context — not CDS from map alone.",
    loinc: null,
    codingHint: null,
  },
  {
    id: id("interaction", "adipose-macrophage-ir"),
    kind: "interaction",
    label: "Adipose macrophage ↔ insulin resistance",
    grounding: "Research bridge watch — not visit CDS.",
    loinc: null,
    codingHint: null,
  },
  {
    id: id("interaction", "nlrp3-metabolic-inflammation"),
    kind: "interaction",
    label: "NLRP3 → metabolic inflammation",
    grounding: "Discovery / bridge watch — not Aksh day-1 CDS.",
    loinc: null,
    codingHint: null,
  },
  {
    id: id("interaction", "hyperglycemia-innate"),
    kind: "interaction",
    label: "Hyperglycaemia → innate dysfunction",
    grounding: "Bridge watch; hypothesized — no CDS.",
    loinc: null,
    codingHint: null,
  },
  {
    id: id("interaction", "autoimmune-metabolic-comorbidity"),
    kind: "interaction",
    label: "Autoimmune–metabolic comorbidity ↔ T2D",
    grounding: "LADA / overlap clinic shortlist watch.",
    loinc: null,
    codingHint: null,
  },
  {
    id: id("watch", "irae-hyperglycemia"),
    kind: "watch",
    label: "irAE / steroid → hyperglycaemia",
    grounding: "Clinic-relevant when IO patients enter metabolic pathways — autoSurfaceCds=false.",
    loinc: null,
    codingHint: null,
  },
  {
    id: id("interaction", "glucocorticoid-hyperglycemia"),
    kind: "interaction",
    label: "Systemic glucocorticoids → hyperglycaemia",
    grounding: "HITL watch for steroid-exposed T2D visits — ISI GC→NF-κB PMID is related-axis only.",
    loinc: null,
    codingHint: null,
  },
] as const;

/** Lookup by durable id. */
export const AKSH_CLINIC_BY_ID: ReadonlyMap<string, AkshClinicConcept> = new Map(
  AKSH_CLINIC_CONCEPTS.map((c) => [c.id, c]),
);

/**
 * Migration from provisional P1 stubs (`AKSH-N-*`) → durable `aksh:` ids.
 * Consumers must rewrite stored pointers; both forms must not be treated as CDS keys.
 */
export const PROVISIONAL_AKSH_TO_DURABLE: Readonly<Record<string, string>> = {
  "AKSH-N-hba1c": id("finding", "hba1c"),
  "AKSH-N-fpg": id("finding", "fpg"),
  "AKSH-N-insulin-resistance": id("pathway", "insulin-resistance"),
  "AKSH-N-beta-cell-dysfunction": id("pathway", "beta-cell-dysfunction"),
  "AKSH-N-metformin": id("medicine", "metformin"),
  "AKSH-N-sglt2i": id("medicine", "sglt2i"),
  "AKSH-N-glp1ra": id("medicine", "glp1ra"),
  "AKSH-N-obesity": id("condition", "obesity"),
  "AKSH-N-cgm-tir": id("finding", "cgm-tir"),
  "AKSH-N-glucocorticoid-hyperglycemia": id("interaction", "glucocorticoid-hyperglycemia"),
  "AKSH-N-inflammation-insulin-resistance": id("interaction", "inflammation-insulin-resistance"),
  "AKSH-N-tnf-insulin-resistance": id("interaction", "tnf-insulin-resistance"),
  "AKSH-N-il6-t2d": id("interaction", "il6-t2dm"),
  "AKSH-N-hscrp": id("finding", "hscrp"),
  "AKSH-N-adipose-macrophage-ir": id("interaction", "adipose-macrophage-ir"),
  "AKSH-N-nlrp3-metabolic-inflammation": id("interaction", "nlrp3-metabolic-inflammation"),
  "AKSH-N-t2d-infection-risk": id("risk", "infection-susceptibility"),
  "AKSH-N-hyperglycemia-innate": id("interaction", "hyperglycemia-innate"),
  "AKSH-N-autoimmune-metabolic-comorbidity": id("interaction", "autoimmune-metabolic-comorbidity"),
  "AKSH-N-irae-hyperglycemia": id("watch", "irae-hyperglycemia"),
  "AKSH-N-islet-autoantibodies": id("finding", "islet-autoantibodies"),
  "AKSH-N-lada": id("condition", "lada"),
};

/** True when id is a durable `aksh:` namespaced clinic concept. */
export function isDurableAkshClinicId(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^aksh:(condition|finding|medicine|risk|pathway|interaction|watch):[a-z0-9-]+$/.test(
    value,
  );
}

/** True when id is a legacy provisional stub. */
export function isProvisionalAkshId(value: string | null | undefined): boolean {
  if (!value) return false;
  return value.startsWith("AKSH-");
}

/** Resolve provisional → durable; pass through durable ids; else null. */
export function migrateAkshNodeId(value: string | null | undefined): string | null {
  if (!value) return null;
  if (isDurableAkshClinicId(value)) return value;
  return PROVISIONAL_AKSH_TO_DURABLE[value] ?? null;
}

export function listAkshClinicConcepts(): AkshClinicConcept[] {
  return [...AKSH_CLINIC_CONCEPTS];
}

export function akshClinicConcept(idValue: string): AkshClinicConcept | undefined {
  return AKSH_CLINIC_BY_ID.get(idValue);
}
