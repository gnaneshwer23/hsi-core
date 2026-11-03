/**
 * Public honesty — four products + Available / In development / Planned.
 * Single source for /status, /products, /roadmap maturity. Update when founder signs a status change.
 * Engineering surfaces (Curator, Systems, Alignment) are secondary — not primary CTAs.
 */

export type MaturityChip = "available" | "in_development" | "planned";

export const MATURITY_CHIP_LABEL: Record<MaturityChip, string> = {
  available: "Available",
  in_development: "In development",
  planned: "Planned",
};

export type EcosystemProduct = {
  id: "aksh" | "clinical" | "isi" | "trials";
  name: string;
  oneLine: string;
  chip: MaturityChip;
  chipDetail: string;
  primaryCta: { label: string; href: string; external?: boolean };
  secondaryCta?: { label: string; href: string };
  mustNot: string[];
};

/** Four consumer products — Shared Core is not a fifth card. */
export const ECOSYSTEM_PRODUCTS: readonly EcosystemProduct[] = [
  {
    id: "aksh",
    name: "Aksh Health",
    oneLine: "Patient intelligence and clinic workflows (scoped).",
    chip: "available",
    chipDetail: "Available (scoped) — diabetes / HITL clinic plane; LIVE_ORGANISATIONS=0 honesty on Aksh side.",
    primaryCta: {
      label: "Explore Aksh Health",
      href: "/for-aksh",
    },
    secondaryCta: { label: "HITL boundary", href: "/aksh-agents" },
    mustNot: [
      "Not ISI Discovery",
      "No PHI into research DBs",
      "Not trial eligibility confirmation",
    ],
  },
  {
    id: "clinical",
    name: "HSI Clinical",
    oneLine: "Longitudinal clinical intelligence across authorised records.",
    chip: "in_development",
    chipDetail: "In development — synthetic timeline fixtures only; no live EMIS / FHIR SoT yet.",
    primaryCta: { label: "Open synthetic timeline", href: "/clinical-timeline" },
    secondaryCta: { label: "Status", href: "/status#clinical" },
    mustNot: [
      "Not a live hospital connector",
      "No invented patient histories",
      "Not bedside CDS",
    ],
  },
  {
    id: "isi",
    name: "Immune Super Intelligence",
    oneLine: "Biological and scientific discovery (research workspace).",
    chip: "available",
    chipDetail: "Available (research) — Ask / Atlas / M1 brief; educational limits; not CDS.",
    primaryCta: { label: "ISI research entry", href: "/for-isi" },
    secondaryCta: { label: "Open Discovery", href: "/discovery" },
    mustNot: [
      "Not clinical decision support",
      "Not HSI Trials matcher",
      "No PHI by default",
    ],
  },
  {
    id: "trials",
    name: "HSI Trials",
    oneLine: "Explainable trial screening and mechanism-linked discovery.",
    chip: "planned",
    chipDetail:
      "Planned product — marketing at /for-trials is Available; five-state demo In development; confirmedEligible always false.",
    primaryCta: { label: "Explore HSI Trials", href: "/for-trials" },
    secondaryCta: { label: "Five-state MVP", href: "/trials-criteria" },
    mustNot: [
      "Never confirmed eligible",
      "No auto-enrolment",
      "Not live registry product yet",
    ],
  },
] as const;

export type StatusColumnId = "available" | "in_development" | "planned";

export type StatusColumn = {
  id: StatusColumnId;
  title: string;
  items: string[];
};

/** Living §9 columns — keep aligned with ECOSYSTEM_PRODUCTS chips. */
export const STATUS_COLUMNS: readonly StatusColumn[] = [
  {
    id: "available",
    title: "Available",
    items: [
      "ISI Explore / Ask / Atlas / M1 investigation brief (research limits)",
      "hsi-core graded packs + Gate C patterns + Discovery Centre",
      "Aksh Health (scoped clinic / HITL — separate product)",
      "HSI Trials marketing landing (/for-trials) — product chip remains Planned; never confirmed eligible",
      "Public ecosystem status (/status) + honesty labels (research ≠ CDS; gaps ≠ worldwide literature absence)",
    ],
  },
  {
    id: "in_development",
    title: "In development",
    items: [
      "HSI Clinical synthetic longitudinal timeline (/clinical-timeline)",
      "HSI Discovery consume in ISI (/hsi-consume) — hardening continues",
      "Aksh ↔ HSI gateway stub UI (/gateway) — PHI→research denied",
      "Trials five-state criteria demo (/trials-criteria; never confirmed eligible)",
    ],
  },
  {
    id: "planned",
    title: "Planned",
    items: [
      "HSI Trials workspace / live registry product (never confirmed eligible)",
      "Full FHIR longitudinal reconstruction / live EMIS",
      "Omics runtimes (research plane) — live CDS remains a non-goal",
      "Partner-signed pilot lock (no invented MoU)",
    ],
  },
] as const;

/** Substrate demos for In-dev / Planned products — linked from /status. */
export const DEMO_LINKS = [
  {
    to: "/clinical-timeline",
    label: "Clinical synthetic timeline",
    product: "clinical" as const,
    note: "≥2 fixtures · Cap 9 missing-info · FHIR R4 notes only · syntheticOnly · no live EMIS",
  },
  {
    to: "/trials-criteria",
    label: "Trials five-state criteria",
    product: "trials" as const,
    note: "In development demo · multi-trial stubs · criterion_assessment_only · confirmedEligible=false · product remains Planned",
  },
  {
    to: "/gateway",
    label: "Aksh ↔ HSI gateway",
    product: "gateway" as const,
    note: "stubs only · PHI→research denied · syntheticOnly · no live PHI",
  },
] as const;

/** Engineering / substrate chrome — secondary nav only (not primary header). */
export const ENGINEERING_LINKS = [
  { to: "/clinical-timeline", label: "Clinical timeline (synth)" },
  { to: "/trials-criteria", label: "Trials criteria (MVP)" },
  { to: "/gateway", label: "Aksh↔HSI gateway (stub)" },
  { to: "/systems", label: "Systems" },
  { to: "/curator", label: "Curator" },
  { to: "/alignment", label: "Alignment" },
  { to: "/docs", label: "Technical docs" },
  { to: "/aksh-agents", label: "Aksh agents (ref)" },
] as const;

export const SHARED_CORE_NOTE =
  "Shared Intelligence Core is a governed service layer (orchestration, evidence, terminology, audit) — not a fifth consumer product card.";
