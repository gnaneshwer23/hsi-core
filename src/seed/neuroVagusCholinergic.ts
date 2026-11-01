/**
 * Neuroimmune neighbourhood — vagus / cholinergic anti-inflammatory reflex.
 *
 * P2.1 thin literature slice for systems vision neuro axis. Chosen over
 * microglia–cytokine or BBB↔circulating cytokines because the Tracey / α7 /
 * ChAT-T-cell / VNS arc has the clearest landmark public PMID chain and a
 * coherent S–P–O neighbourhood without inventing MS/neurodegeneration disease
 * atlases. Does **not** replace RA Stage 1 ASK / partnerLock, does **not**
 * touch SSc dual-track A or gut P1.3 pack, does **not** flip partnerSigned.
 *
 * Honesty: animal / mechanism edges stay `uncertain` + associative; human VNS
 * in RA (Koopman) is `hypothesized` only — **not** a clinical brain–immune cure,
 * **not** CDS, **not** dosing advice.
 *
 * Verified public PMIDs (PubMed, 2026-11-01):
 * - 10839541 Borovikova 2000 Nature — VNS attenuates endotoxin systemic inflammation / TNF
 * - 12490958 Tracey 2002 Nature — The inflammatory reflex (conceptual frame)
 * - 12508119 Wang 2003 Nature — α7 nAChR essential for cholinergic TNF inhibition
 * - 16025117 de Jonge 2005 Nat Immunol — vagus / α7 → Jak2–STAT3 macrophage attenuation
 * - 21921156 Rosas-Ballina 2011 Science — ACh-synthesizing T cells relay vagus circuit
 * - 27382171 Koopman 2016 PNAS — implantable VNS modulates TNF / RA scores (pilot; hypothesized)
 *
 * Not Gate C approved. Not CDS. No PHI.
 */
import { gradeForSeed } from "../validate";
import type { HsiClaim, HsiEdge } from "../schema";
import type { HsiCurationReview, HsiTeachingStatus } from "../grades";
import type { SystemsCrossAxisPredicate } from "../systemsAxes";

const RECORDED = "2026-11-01T19:00:00.000Z";

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
    notes:
      partial.notes ??
      "Neuroimmune P2.1 seed — awaiting Gate C human review. Not CDS.",
    recordedAt: RECORDED,
  };
}

type SeedSpec = {
  id: string;
  edgeType: HsiEdge["edgeType"];
  /** Systems-vision cross-axis predicate (mapped onto Phase 0 HSI_EDGE_TYPES). */
  systemsPredicate: SystemsCrossAxisPredicate;
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

/**
 * Thin vagus / cholinergic anti-inflammatory reflex slice.
 * Primary claim/edge ids: HSI-C-NI-* / HSI-E-NI-*.
 */
const SPECS: SeedSpec[] = [
  {
    id: "HSI-E-NI-001",
    edgeType: "inhibits",
    systemsPredicate: "suppresses_peripheral_inflammation",
    subjectId: "HSI-N-vagus-efferent",
    subjectLabel: "Efferent vagus nerve stimulation",
    objectId: "HSI-N-peripheral-tnf-tone",
    objectLabel: "Peripheral / systemic TNF inflammatory tone",
    claimId: "HSI-C-NI-001",
    assertion:
      "Electrical stimulation of the peripheral vagus nerve attenuates systemic inflammatory responses to endotoxin, including hepatic and serum TNF, in rodent endotoxaemia models (cholinergic anti-inflammatory neighbourhood — not CDS).",
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
    pmid: "10839541",
    doi: "10.1038/35013070",
    citationLabel:
      "Borovikova LV et al. Nature 2000 — Vagus nerve stimulation attenuates the systemic inflammatory response to endotoxin.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/10839541/",
    notes:
      "P2.1 primary vagus→TNF suppression edge. PMID 10839541 verified. Rodent endotoxaemia + macrophage culture — teaching=associative; hsiGrade uncertain. Do not overclaim human therapeutic cure. Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-NI-002",
    edgeType: "bridges_domain",
    systemsPredicate: "signals_via_axis",
    subjectId: "HSI-N-inflammatory-reflex",
    subjectLabel: "Inflammatory reflex (cholinergic axis)",
    objectId: "HSI-N-peripheral-tnf-tone",
    objectLabel: "Peripheral / systemic TNF inflammatory tone",
    claimId: "HSI-C-NI-002",
    assertion:
      "The inflammatory reflex frames a hard-wired autonomic (vagal cholinergic) pathway that reflexively monitors and adjusts acute inflammatory cytokine responses in real time (conceptual neighbourhood frame — not a disease cure claim).",
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
    pmid: "12490958",
    doi: "10.1038/nature01321",
    citationLabel:
      "Tracey KJ. Nature 2002 — The inflammatory reflex.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/12490958/",
    notes:
      "P2.1 conceptual axis frame. PMID 12490958 verified (review). Maps signals_via_axis → bridges_domain. Teaching=associative; not clinical protocol. Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-NI-003",
    edgeType: "inhibits",
    systemsPredicate: "suppresses_peripheral_inflammation",
    subjectId: "HSI-N-alpha7-nachr",
    subjectLabel: "Nicotinic ACh receptor α7 subunit (macrophage)",
    objectId: "HSI-N-macrophage-tnf-release",
    objectLabel: "Macrophage TNF synthesis / release",
    claimId: "HSI-C-NI-003",
    assertion:
      "The nicotinic acetylcholine receptor α7 subunit is required for acetylcholine- and vagus-mediated inhibition of macrophage TNF synthesis (essential receptor node of the cholinergic anti-inflammatory pathway).",
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
    pmid: "12508119",
    doi: "10.1038/nature01339",
    citationLabel:
      "Wang H et al. Nature 2003 — Nicotinic acetylcholine receptor alpha7 subunit is an essential regulator of inflammation.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/12508119/",
    notes:
      "P2.1 α7 receptor node. PMID 12508119 verified. Mouse genetics + macrophage assays — keep uncertain grades; not human dosing. Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-NI-004",
    edgeType: "associated_with",
    systemsPredicate: "associates_neuroimmune",
    subjectId: "HSI-N-vagus-efferent",
    subjectLabel: "Efferent vagus nerve stimulation",
    objectId: "HSI-N-alpha7-jak2-stat3",
    objectLabel: "α7 nAChR–Jak2–STAT3 macrophage programme",
    claimId: "HSI-C-NI-004",
    assertion:
      "Vagus / nicotinic α7 signalling attenuates macrophage activation via Jak2–STAT3 phosphorylation in experimental inflammation (mechanism companion to α7 TNF inhibition).",
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    pmid: "16025117",
    doi: "10.1038/ni1229",
    citationLabel:
      "de Jonge WJ et al. Nat Immunol 2005 — Stimulation of the vagus nerve attenuates macrophage activation by activating the Jak2-STAT3 signaling pathway.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/16025117/",
    notes:
      "P2.1 mechanism companion. PMID 16025117 verified. Mouse postoperative ileus / macrophage STAT3 — teaching=associative. Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-NI-005",
    edgeType: "bridges_domain",
    systemsPredicate: "signals_via_axis",
    subjectId: "HSI-N-chat-memory-tcell",
    subjectLabel: "Acetylcholine-synthesizing memory T cells",
    objectId: "HSI-N-macrophage-tnf-release",
    objectLabel: "Macrophage TNF synthesis / release",
    claimId: "HSI-C-NI-005",
    assertion:
      "Acetylcholine-producing memory-phenotype T cells relay vagus nerve signals required for inflammatory-reflex inhibition of macrophage TNF (neural → lymphoid → innate immune hop).",
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
    pmid: "21921156",
    doi: "10.1126/science.1209985",
    citationLabel:
      "Rosas-Ballina M et al. Science 2011 — Acetylcholine-synthesizing T cells relay neural signals in a vagus nerve circuit.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/21921156/",
    notes:
      "P2.1 T-cell relay hop. PMID 21921156 verified. Mouse circuit — teaching=associative; do not invent human CDS. Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-NI-006",
    edgeType: "associated_with",
    systemsPredicate: "hypothesized_brain_immune",
    subjectId: "HSI-N-implantable-vns",
    subjectLabel: "Implantable vagus nerve stimulator (experimental)",
    objectId: "HSI-N-peripheral-tnf-tone",
    objectLabel: "Peripheral / systemic TNF inflammatory tone",
    claimId: "HSI-C-NI-006",
    assertion:
      "Implantable vagus nerve stimulation can modulate peripheral blood TNF production and RA clinical composite scores in small human pilot cohorts (hypothesized translational frame — not a settled clinical cure; not CDS).",
    review: "source-verified",
    teaching: "hypothesized",
    domain: "immuno_metabolic",
    pmid: "27382171",
    doi: "10.1073/pnas.1605635113",
    citationLabel:
      "Koopman FA et al. PNAS 2016 — Vagus nerve stimulation inhibits cytokine production and attenuates disease severity in rheumatoid arthritis.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/27382171/",
    notes:
      "P2.1 human translational pilot ONLY. PMID 27382171 verified. teaching=hypothesized — small open-label / pilot; NEVER overclaim clinical brain–immune cure, dosing, or EHR CDS. Does not flip partnerSigned or replace RA ASK evidence map. Gate C = human only. Not CDS. No PHI.",
  },
  {
    id: "HSI-E-NI-007",
    edgeType: "associated_with",
    systemsPredicate: "hypothesized_brain_immune",
    subjectId: "HSI-N-spleen-innate",
    subjectLabel: "Spleen (innate cytokine reservoir)",
    objectId: "HSI-N-inflammatory-reflex",
    objectLabel: "Inflammatory reflex",
    claimId: "HSI-C-NI-007",
    assertion:
      "Splenectomy inactivates the cholinergic anti-inflammatory pathway during lethal endotoxemia and polymicrobial sepsis — spleen as required effector organ for vagus-mediated TNF brake (rodent).",
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    pmid: "16785311",
    doi: "10.1084/jem.20052362",
    citationLabel:
      "Huston JM et al. J Exp Med 2006 — Splenectomy inactivates the cholinergic antiinflammatory pathway during lethal endotoxemia and polymicrobial sepsis.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/16785311/",
    notes:
      "Depth deepen: PMID 16785311 verified. Rodent circuit organ — teaching=associative; not human CDS. Gate C = human only. Not CDS. No PHI.",
  },
  {
    id: "HSI-E-NI-008",
    edgeType: "inhibits",
    systemsPredicate: "suppresses_peripheral_inflammation",
    subjectId: "HSI-N-splenic-nerve",
    subjectLabel: "Splenic nerve (catecholaminergic)",
    objectId: "HSI-N-macrophage-tnf-release",
    objectLabel: "Macrophage TNF release",
    claimId: "HSI-C-NI-008",
    assertion:
      "The splenic nerve is required for cholinergic anti-inflammatory pathway control of TNF in endotoxemia (vagus → celiac/superior mesenteric → splenic nerve → spleen macrophage TNF brake).",
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    pmid: "18669662",
    doi: "10.1073/pnas.0803237105",
    citationLabel:
      "Rosas-Ballina M et al. PNAS 2008 — Splenic nerve is required for cholinergic antiinflammatory pathway control of TNF in endotoxemia.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/18669662/",
    notes:
      "Depth deepen: PMID 18669662 verified. Rodent wiring — teaching=associative; do not invent human nerve-stimulation CDS. Gate C = human only. Not CDS. No PHI.",
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

export const HSI_NI_SEED_EDGES: HsiEdge[] = SPECS.map(toEdge);
export const HSI_NI_SEED_CLAIMS: HsiClaim[] = SPECS.map(toClaim);

/** Systems-predicate annotations parallel to edges (not on HsiEdge schema yet — P1.4). */
export const HSI_NI_SEED_SYSTEMS_PREDICATES: ReadonlyArray<{
  edgeId: string;
  systemsPredicate: SystemsCrossAxisPredicate;
}> = SPECS.map((s) => ({
  edgeId: s.id,
  systemsPredicate: s.systemsPredicate,
}));

export const NI_PATHWAY_ID = "neuro-vagus-cholinergic-reflex" as const;

export const NI_PATHWAY_META = {
  id: NI_PATHWAY_ID,
  label: "Neuroimmune · vagus / cholinergic anti-inflammatory reflex",
  role: "systems_secondary_axis" as const,
  verticalStrategy: "dual_track" as const,
  deepSeedsPresent: true as const,
  neighbourhoodChoiceRationale:
    "Clearest landmark PMID chain (Borovikova → Tracey → Wang α7 → de Jonge STAT3 → Rosas-Ballina ChAT-T → Koopman VNS pilot) vs microglia–cytokine or BBB cytokine atlases; coherent S–P–O without inventing MS/neurodegeneration disease packs.",
  rationale:
    "P2.1 first honest neuroimmune literature slice for systems vision. Secondary Discovery axis only — does not replace RA ASK. Human VNS–RA kept hypothesized; animal mechanism edges uncertain/associative. No clinical cure claims.",
  primaryClaimIds: SPECS.map((s) => s.claimId),
  primaryEdgeIds: SPECS.map((s) => s.id),
  primaryPmids: [
    "10839541",
    "12490958",
    "12508119",
    "16025117",
    "21921156",
    "27382171",
    "16785311",
    "18669662",
  ],
  deepenPhase: "p2_1_neuro_spleen_circuit_depth" as const,
  entities: [
    {
      id: "HSI-N-vagus-efferent",
      label: "Efferent vagus stimulation",
      kind: "neuroimmune_axis",
    },
    {
      id: "HSI-N-inflammatory-reflex",
      label: "Inflammatory reflex",
      kind: "neuroimmune_axis",
    },
    {
      id: "HSI-N-alpha7-nachr",
      label: "α7 nAChR (macrophage)",
      kind: "neuro_mediator",
    },
    {
      id: "HSI-N-alpha7-jak2-stat3",
      label: "α7–Jak2–STAT3 programme",
      kind: "neuro_mediator",
    },
    {
      id: "HSI-N-chat-memory-tcell",
      label: "ACh-synthesizing memory T cells",
      kind: "glial_or_barrier_cell",
    },
    {
      id: "HSI-N-macrophage-tnf-release",
      label: "Macrophage TNF release",
      kind: "neuro_mediator",
    },
    {
      id: "HSI-N-peripheral-tnf-tone",
      label: "Peripheral TNF inflammatory tone",
      kind: "neuro_mediator",
    },
    {
      id: "HSI-N-implantable-vns",
      label: "Implantable VNS (experimental)",
      kind: "neuroimmune_axis",
    },
    {
      id: "HSI-N-spleen-innate",
      label: "Spleen (innate cytokine reservoir)",
      kind: "neuroimmune_axis",
    },
    {
      id: "HSI-N-splenic-nerve",
      label: "Splenic nerve (catecholaminergic)",
      kind: "neuroimmune_axis",
    },
  ],
} as const;

/** True when at least one neuro edge carries a verified PMID locator. */
export function neuroDeepSeedsLanded(
  edges: readonly HsiEdge[] = HSI_NI_SEED_EDGES,
): boolean {
  return edges.some(
    (e) =>
      e.id.startsWith("HSI-E-NI-") && Boolean(e.provenance?.pmid?.trim()),
  );
}
