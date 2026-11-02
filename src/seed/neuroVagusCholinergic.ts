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
 * - 11901203 Bernik 2002 J Exp Med — pharmacological cholinergic anti-inflammatory stimulation
 * - 19542466 Huston 2009 J Immunol — cholinergic spleen signals ↓ leukocyte trafficking (CD11b)
 * - 12469056 Bernik 2002 J Vasc Surg — cholinergic pathway inhibits TNF in ischemia–reperfusion
 * P1.9 complementary microglia / BBB neighbourhood (honest uncertain; not MS atlas):
 * - 15831717 Nimmerjahn 2005 Science — resting microglia dynamically survey parenchyma
 * - 17220915 Perry 2007 Nat Rev Immunol — systemic infections/inflammation affect brain
 * - 25172555 Banks 2015 Brain Behav Immun — BBB as neuroimmune interface
 * - 8707929 Banks 1996 J Neuroimmunol — IL-1α saturable transport across BBB
 * - 19228962 D'Mello 2009 J Neurosci — cerebral microglia recruit monocytes via peripheral TNF
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
  /**
   * P1.4: prefer first-class systems predicates on HSI_EDGE_TYPES when promoted;
   * hypothesized human VNS–RA keeps Phase 0 associated_with.
   */
  edgeType: HsiEdge["edgeType"];
  /** Systems-vision cross-axis predicate (identity-maps when first-class). */
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
    edgeType: "suppresses_peripheral_inflammation",
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
    edgeType: "signals_via_axis",
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
      "P2.1 conceptual axis frame. PMID 12490958 verified (review). P1.4 first-class edgeType signals_via_axis (was alias→bridges_domain). Teaching=associative; not clinical protocol. Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-NI-003",
    edgeType: "suppresses_peripheral_inflammation",
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
    edgeType: "associates_neuroimmune",
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
    edgeType: "signals_via_axis",
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
    edgeType: "suppresses_peripheral_inflammation",
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
  {
    id: "HSI-E-NI-009",
    edgeType: "suppresses_peripheral_inflammation",
    systemsPredicate: "suppresses_peripheral_inflammation",
    subjectId: "HSI-N-cholinergic-agonist",
    subjectLabel: "Pharmacologic cholinergic anti-inflammatory stimulation",
    objectId: "HSI-N-peripheral-tnf-tone",
    objectLabel: "Peripheral / systemic TNF inflammatory tone",
    claimId: "HSI-C-NI-009",
    assertion:
      "Pharmacological stimulation of the cholinergic anti-inflammatory pathway attenuates systemic TNF responses (drug-pathway hop parallel to electrical VNS — rodent; not CDS).",
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    pmid: "11901203",
    doi: "10.1084/jem.20011714",
    citationLabel:
      "Bernik TR et al. J Exp Med 2002 — Pharmacological stimulation of the cholinergic antiinflammatory pathway.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/11901203/",
    notes:
      "Depth deepen: PMID 11901203 verified. Rodent pharmacologic frame — teaching=associative; never invent human cholinergic-drug CDS. Gate C = human only. Not CDS. No PHI.",
  },
  {
    id: "HSI-E-NI-010",
    edgeType: "suppresses_peripheral_inflammation",
    systemsPredicate: "suppresses_peripheral_inflammation",
    subjectId: "HSI-N-splenic-cholinergic-signal",
    subjectLabel: "Cholinergic neural signals to the spleen",
    objectId: "HSI-N-leukocyte-trafficking-cd11b",
    objectLabel: "Leukocyte trafficking via CD11b",
    claimId: "HSI-C-NI-010",
    assertion:
      "Cholinergic neural signals to the spleen down-regulate leukocyte trafficking via CD11b (trafficking hop beyond TNF-only frames — rodent).",
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    pmid: "19542466",
    doi: "10.4049/jimmunol.0802684",
    citationLabel:
      "Huston JM et al. J Immunol 2009 — Cholinergic neural signals to the spleen down-regulate leukocyte trafficking via CD11b.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/19542466/",
    notes:
      "Depth deepen: PMID 19542466 verified. Rodent trafficking — teaching=associative; not human CDS. Gate C = human only. Not CDS. No PHI.",
  },
  {
    id: "HSI-E-NI-011",
    edgeType: "suppresses_peripheral_inflammation",
    systemsPredicate: "suppresses_peripheral_inflammation",
    subjectId: "HSI-N-cholinergic-antiinflam-pathway",
    subjectLabel: "Cholinergic anti-inflammatory pathway",
    objectId: "HSI-N-ischemia-reperfusion-tnf",
    objectLabel: "Ischemia–reperfusion TNF response",
    claimId: "HSI-C-NI-011",
    assertion:
      "The cholinergic anti-inflammatory pathway can inhibit tumor necrosis factor during ischemia–reperfusion injury (context expand beyond endotoxin — rodent; not clinical cure).",
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    pmid: "12469056",
    doi: "10.1067/mva.2002.129643",
    citationLabel:
      "Bernik TR et al. J Vasc Surg 2002 — Cholinergic antiinflammatory pathway inhibition of tumor necrosis factor during ischemia reperfusion.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/12469056/",
    notes:
      "Depth deepen: PMID 12469056 verified. Rodent IR context — teaching=associative; never invent perioperative VNS CDS. Gate C = human only. Not CDS. No PHI.",
  },
  {
    id: "HSI-E-NI-012",
    edgeType: "associates_neuroimmune",
    systemsPredicate: "associates_neuroimmune",
    subjectId: "HSI-N-microglia-surveillance",
    subjectLabel: "Resting / surveying microglia",
    objectId: "HSI-N-brain-parenchyma-surveillance",
    objectLabel: "Brain parenchyma immune surveillance",
    claimId: "HSI-C-NI-012",
    assertion:
      "Resting microglial cells continuously survey brain parenchyma with highly dynamic processes (CNS-resident myeloid hop — complementary to vagus reflex; not an MS/neurodegeneration atlas; not CDS).",
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
    pmid: "15831717",
    doi: "10.1126/science.1110647",
    citationLabel:
      "Nimmerjahn A et al. Science 2005 — Resting microglial cells are highly dynamic surveillants of brain parenchyma in vivo.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/15831717/",
    notes:
      "P1.9 microglia neighbourhood. PMID 15831717 verified. In-vivo imaging — teaching=associative; do not invent disease-specific CDS. Gate C = human only. Not CDS. No PHI.",
  },
  {
    id: "HSI-E-NI-013",
    edgeType: "associates_neuroimmune",
    systemsPredicate: "associates_neuroimmune",
    subjectId: "HSI-N-systemic-inflammation",
    subjectLabel: "Systemic infection / peripheral inflammation",
    objectId: "HSI-N-cns-inflammatory-tone",
    objectLabel: "CNS inflammatory / neurodegenerative tone",
    claimId: "HSI-C-NI-013",
    assertion:
      "Systemic infections and peripheral inflammation can modulate chronic CNS inflammatory and neurodegenerative processes (immune-to-brain neighbourhood frame — review-level; not a clinical cure claim).",
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
    pmid: "17220915",
    doi: "10.1038/nri2015",
    citationLabel:
      "Perry VH et al. Nat Rev Immunol 2007 — Systemic infections and inflammation affect chronic neurodegeneration.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/17220915/",
    notes:
      "P1.9 peripheral→CNS frame. PMID 17220915 verified (review). teaching=associative; never invent neurodegeneration therapy CDS. Complements vagus TNF brake without collapsing frames. Gate C = human only. Not CDS. No PHI.",
  },
  {
    id: "HSI-E-NI-014",
    edgeType: "signals_via_axis",
    systemsPredicate: "signals_via_axis",
    subjectId: "HSI-N-bbb",
    subjectLabel: "Blood–brain barrier (neuroimmune interface)",
    objectId: "HSI-N-peripheral-immune-cns-axis",
    objectLabel: "Peripheral immune ↔ CNS communication axis",
    claimId: "HSI-C-NI-014",
    assertion:
      "The blood–brain barrier both separates and reconnects the immune and central nervous systems via regulated cytokine/cell exchange and immunomodulatory signalling (BBB interface neighbourhood — not CDS).",
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
    pmid: "25172555",
    doi: "10.1016/j.bbi.2014.08.007",
    citationLabel:
      "Banks WA. Brain Behav Immun 2015 — The blood-brain barrier in neuroimmunology: Tales of separation and assimilation.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/25172555/",
    notes:
      "P1.9 BBB axis frame. PMID 25172555 verified (review). teaching=associative; not clinical BBB-opening CDS. Gate C = human only. Not CDS. No PHI.",
  },
  {
    id: "HSI-E-NI-015",
    edgeType: "associated_with",
    systemsPredicate: "crosses_bbb",
    subjectId: "HSI-N-il1-alpha-circulating",
    subjectLabel: "Circulating interleukin-1α",
    objectId: "HSI-N-bbb",
    objectLabel: "Blood–brain barrier",
    claimId: "HSI-C-NI-015",
    assertion:
      "Interleukin-1α can cross the blood–brain barrier via saturable transport (and related extracellular pathways) — mechanistic BBB cytokine hop (rodent; not human dosing CDS).",
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    pmid: "8707929",
    doi: "10.1016/0165-5728(96)00036-7",
    citationLabel:
      "Banks WA et al. J Neuroimmunol 1996 — Comparison of saturable transport and extracellular pathways in the passage of interleukin-1 alpha across the blood-brain barrier.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/8707929/",
    notes:
      "P1.9 BBB cytokine transport. PMID 8707929 verified. systemsPredicate crosses_bbb (alias→associated_with). teaching=associative; never invent cytokine CNS dosing. Gate C = human only. Not CDS. No PHI.",
  },
  {
    id: "HSI-E-NI-016",
    edgeType: "associates_neuroimmune",
    systemsPredicate: "associates_neuroimmune",
    subjectId: "HSI-N-microglia-surveillance",
    subjectLabel: "Cerebral microglia",
    objectId: "HSI-N-monocyte-cns-recruitment",
    objectLabel: "Monocyte recruitment into brain",
    claimId: "HSI-C-NI-016",
    assertion:
      "Cerebral microglia can recruit monocytes into the brain in response to tumour necrosis factor-α signalling during peripheral organ inflammation (microglia–peripheral inflammation hop — mouse; hypothesized translational breadth only).",
    review: "source-verified",
    teaching: "hypothesized",
    domain: "immuno_metabolic",
    pmid: "19228962",
    doi: "10.1523/JNEUROSCI.3567-08.2009",
    citationLabel:
      "D'Mello C et al. J Neurosci 2009 — Cerebral microglia recruit monocytes into the brain in response to tumor necrosis factoralpha signaling during peripheral organ inflammation.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/19228962/",
    notes:
      "P1.9 microglia–peripheral TNF hop. PMID 19228962 verified. Mouse — teaching=hypothesized; do not invent human monocyte-trafficking CDS or MS claims. Gate C = human only. Not CDS. No PHI.",
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
    "Clearest landmark PMID chain (Borovikova → Tracey → Wang α7 → de Jonge STAT3 → Rosas-Ballina ChAT-T → Koopman VNS pilot) as P2.1 core; P1.9 adds complementary microglia/BBB cytokine neighbourhood (Nimmerjahn / Perry / Banks / D'Mello) without inventing MS/neurodegeneration disease packs.",
  rationale:
    "P2.1 first honest neuroimmune literature slice for systems vision + P1.9 microglia/BBB deepen. Secondary Discovery axis only — does not replace RA ASK. Human VNS–RA kept hypothesized; animal mechanism edges uncertain/associative. No clinical cure claims.",
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
    "11901203",
    "19542466",
    "12469056",
    "15831717",
    "17220915",
    "25172555",
    "8707929",
    "19228962",
  ],
  deepenPhase: "p1_9_neuro_microglia_bbb_neighbourhood" as const,
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
      id: "HSI-N-cholinergic-antiinflam-pathway",
      label: "Cholinergic anti-inflammatory pathway",
      kind: "neuroimmune_axis",
    },
    {
      id: "HSI-N-cholinergic-agonist",
      label: "Pharmacologic cholinergic stimulation",
      kind: "neuro_mediator",
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
      id: "HSI-N-ischemia-reperfusion-tnf",
      label: "Ischemia–reperfusion TNF response",
      kind: "neuro_mediator",
    },
    {
      id: "HSI-N-leukocyte-trafficking-cd11b",
      label: "Leukocyte trafficking (CD11b)",
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
    {
      id: "HSI-N-splenic-cholinergic-signal",
      label: "Cholinergic neural signals to spleen",
      kind: "neuroimmune_axis",
    },
    {
      id: "HSI-N-microglia-surveillance",
      label: "Microglia (CNS-resident myeloid)",
      kind: "glial_or_barrier_cell",
    },
    {
      id: "HSI-N-brain-parenchyma-surveillance",
      label: "Brain parenchyma surveillance",
      kind: "cns_compartment",
    },
    {
      id: "HSI-N-systemic-inflammation",
      label: "Systemic / peripheral inflammation",
      kind: "neuro_mediator",
    },
    {
      id: "HSI-N-cns-inflammatory-tone",
      label: "CNS inflammatory tone",
      kind: "cns_compartment",
    },
    {
      id: "HSI-N-bbb",
      label: "Blood–brain barrier",
      kind: "cns_compartment",
    },
    {
      id: "HSI-N-peripheral-immune-cns-axis",
      label: "Peripheral immune ↔ CNS axis",
      kind: "neuroimmune_axis",
    },
    {
      id: "HSI-N-il1-alpha-circulating",
      label: "Circulating IL-1α",
      kind: "neuro_mediator",
    },
    {
      id: "HSI-N-monocyte-cns-recruitment",
      label: "Monocyte CNS recruitment",
      kind: "glial_or_barrier_cell",
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
