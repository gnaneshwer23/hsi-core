/**
 * Illustrative data for the interactive biological atlas (LEA-01A).
 * Every entity, relation and pathway here is a curated, hedged summary of widely discussed biology written for illustration.
 * None of it is an HSI output, a validated map, or a count of studies; no citations or confidence scores are implied.
 */
export type AtlasStatus = "supported" | "association" | "hypothesis" | "contested";
export type AtlasDomainKey = "immunology" | "neuroscience" | "microbiome" | "genomics" | "organ" | "disease";

export const STATUS_ORDER: AtlasStatus[] = ["supported", "association", "hypothesis", "contested"];
export const STATUS_META: Record<AtlasStatus, { label: string; short: string; colour: string; dash: string | undefined; width: number; gloss: string }> = {
  supported: { label: "Supported in model systems", short: "Supported", colour: "var(--verify)", dash: undefined, width: 2.2, gloss: "Consistent findings in experimental models; human evidence may be limited." },
  association: { label: "Association only", short: "Association", colour: "var(--signal)", dash: undefined, width: 1.6, gloss: "Observed together; causation is not established." },
  hypothesis: { label: "Hypothesis", short: "Hypothesis", colour: "var(--helix)", dash: "2 6", width: 1.8, gloss: "Proposed mechanism with limited direct evidence." },
  contested: { label: "Unresolved conflict", short: "Conflict", colour: "var(--conflict)", dash: "6 5", width: 2.2, gloss: "Published findings disagree; the explanatory variables are not settled." },
};

export type AtlasDomain = { key: AtlasDomainKey; name: string; short: string; x: number; y: number; w: number; h: number; accent: string };
const W = 370, H = 300;
export const ATLAS_VIEW = { w: 1200, h: 660 } as const;
export const ATLAS_DOMAINS: AtlasDomain[] = [
  { key: "microbiome", name: "Microbiome & Metabolism", short: "Microbiome", x: 20, y: 20, w: W, h: H, accent: "var(--primary)" },
  { key: "immunology", name: "Immunology & Inflammation", short: "Immunology", x: 415, y: 20, w: W, h: H, accent: "var(--helix)" },
  { key: "neuroscience", name: "Neuroscience", short: "Neuroscience", x: 810, y: 20, w: W, h: H, accent: "var(--primary)" },
  { key: "genomics", name: "Genomics & Multi-omics", short: "Genomics", x: 20, y: 340, w: W, h: H, accent: "var(--helix)" },
  { key: "organ", name: "Organ & Tissue Biology", short: "Organ & tissue", x: 415, y: 340, w: W, h: H, accent: "var(--primary)" },
  { key: "disease", name: "Disease Mechanisms", short: "Disease", x: 810, y: 340, w: W, h: H, accent: "var(--helix)" },
];
export const domainByKey = Object.fromEntries(ATLAS_DOMAINS.map((d) => [d.key, d])) as Record<AtlasDomainKey, AtlasDomain>;

export type AtlasEntity = { id: string; label: string; domain: AtlasDomainKey; kind: string; note: string; x: number; y: number; anchor?: "start" | "end" | "middle" };
export const ATLAS_ENTITIES: AtlasEntity[] = [
  { id: "microbiota", label: "Gut microbiota", domain: "microbiome", kind: "Community", note: "Community of gut bacteria; composition varies widely between individuals.", x: 110, y: 110 },
  { id: "butyrate", label: "Butyrate", domain: "microbiome", kind: "Metabolite", note: "Short-chain fatty acid produced by bacterial fermentation of dietary fibre.", x: 290, y: 160 },
  { id: "trp", label: "Tryptophan metabolites", domain: "microbiome", kind: "Metabolites", note: "Indole derivatives produced from dietary tryptophan by gut bacteria.", x: 150, y: 260 },
  { id: "treg", label: "FOXP3⁺ Treg", domain: "immunology", kind: "Cell subset", note: "Regulatory T-cell subset defined by the transcription factor FOXP3.", x: 500, y: 115 },
  { id: "il10", label: "IL-10", domain: "immunology", kind: "Cytokine", note: "Anti-inflammatory cytokine produced by several immune cell types.", x: 665, y: 90 },
  { id: "il6", label: "IL-6", domain: "immunology", kind: "Cytokine", note: "Pro-inflammatory cytokine; blood and cerebrospinal-fluid levels can differ.", x: 720, y: 200 },
  { id: "pd1", label: "PD-1 / PD-L1", domain: "immunology", kind: "Checkpoint", note: "Immune checkpoint pair that dampens T-cell activation.", x: 475, y: 250 },
  { id: "exhaust", label: "T-cell exhaustion", domain: "immunology", kind: "Cell state", note: "Dysfunctional T-cell state after chronic antigen exposure.", x: 625, y: 280 },
  { id: "microglia", label: "Microglia", domain: "neuroscience", kind: "Cell type", note: "Resident immune cells of the central nervous system.", x: 900, y: 150 },
  { id: "bbb", label: "Blood–brain barrier", domain: "neuroscience", kind: "Tissue barrier", note: "Selective barrier between the blood and brain tissue.", x: 880, y: 270 },
  { id: "neuroinf", label: "Neuroinflammation", domain: "neuroscience", kind: "Phenotype", note: "Composite phenotype; operational definitions differ between studies.", x: 1075, y: 215, anchor: "end" },
  { id: "eqtl", label: "Risk-locus eQTL (IL10 region)", domain: "genomics", kind: "Variant effect", note: "Variant associated with an expression change at a disease-risk locus.", x: 125, y: 445 },
  { id: "hla", label: "HLA-DRB1", domain: "genomics", kind: "Locus", note: "Antigen-presentation gene; alleles are associated with several autoimmune diseases.", x: 300, y: 520 },
  { id: "scrna", label: "Single-cell signature", domain: "genomics", kind: "Expression profile", note: "Expression profile of cell states measured by single-cell RNA sequencing.", x: 135, y: 585 },
  { id: "lgr5", label: "Crypt stem cells (LGR5⁺)", domain: "organ", kind: "Stem cells", note: "Stem cells that renew the intestinal epithelium.", x: 520, y: 535 },
  { id: "barrier", label: "Intestinal barrier", domain: "organ", kind: "Tissue barrier", note: "Epithelial layer and tight junctions (for example ZO-1) that limit passage from the gut lumen.", x: 665, y: 440 },
  { id: "ibd", label: "Inflammatory bowel disease", domain: "disease", kind: "Disease", note: "Chronic intestinal inflammation; heterogeneous in cause.", x: 870, y: 440 },
  { id: "pd", label: "Parkinson's disease", domain: "disease", kind: "Disease", note: "Neurodegenerative disease; gut and immune contributions are under investigation.", x: 1070, y: 410, anchor: "end" },
  { id: "nsclc", label: "NSCLC immune evasion", domain: "disease", kind: "Mechanism", note: "Tumour escape from T-cell attack, including acquired resistance to checkpoint blockade.", x: 980, y: 570 },
];
export const entityById = Object.fromEntries(ATLAS_ENTITIES.map((e) => [e.id, e])) as Record<string, AtlasEntity>;

export type AtlasEdge = { id: string; from: string; to: string; status: AtlasStatus; basis: string; unresolved?: string };
export const ATLAS_EDGES: AtlasEdge[] = [
  { id: "e-mic-but", from: "microbiota", to: "butyrate", status: "supported", basis: "Bacterial fermentation of dietary fibre produces short-chain fatty acids." },
  { id: "e-mic-trp", from: "microbiota", to: "trp", status: "supported", basis: "Gut bacteria convert dietary tryptophan into indole derivatives." },
  { id: "e-but-treg", from: "butyrate", to: "treg", status: "supported", basis: "Promotes regulatory T-cell differentiation in mouse and in-vitro studies; human intervention evidence is limited." },
  { id: "e-treg-il10", from: "treg", to: "il10", status: "supported", basis: "Regulatory T cells are an established source of IL-10." },
  { id: "e-il10-ibd", from: "il10", to: "ibd", status: "association", basis: "IL-10 pathway variants are linked to very-early-onset IBD; the contribution in typical disease is less certain." },
  { id: "e-but-bar", from: "butyrate", to: "barrier", status: "contested", basis: "Reported to strengthen or to impair barrier function.", unresolved: "Dose, timing and model system are candidate explanatory variables; the conflict is not settled." },
  { id: "e-bar-il6", from: "barrier", to: "il6", status: "contested", basis: "Raised permeability is proposed to increase systemic inflammatory signalling.", unresolved: "Whether permeability drives inflammation or follows it is disputed." },
  { id: "e-il6-bbb", from: "il6", to: "bbb", status: "hypothesis", basis: "Systemic inflammation is proposed to alter barrier permeability in the brain; evidence is mostly preclinical." },
  { id: "e-bbb-mg", from: "bbb", to: "microglia", status: "hypothesis", basis: "Altered permeability is proposed to expose microglia to circulating signals." },
  { id: "e-trp-mg", from: "trp", to: "microglia", status: "hypothesis", basis: "Microbial tryptophan metabolites are proposed to modulate microglial signalling, mainly in preclinical work." },
  { id: "e-mg-ni", from: "microglia", to: "neuroinf", status: "association", basis: "Microglial activation is used as a proxy for neuroinflammation; it is not a direct measure of cause." },
  { id: "e-ni-pd", from: "neuroinf", to: "pd", status: "contested", basis: "Neuroinflammation is observed in Parkinson's disease.", unresolved: "Whether it drives neurodegeneration or follows it is unresolved." },
  { id: "e-eqtl-il10", from: "eqtl", to: "il10", status: "association", basis: "Regulatory variants at risk loci are associated with expression change; the causal cell type and mechanism are unknown for most loci." },
  { id: "e-hla-ibd", from: "hla", to: "ibd", status: "association", basis: "Specific HLA alleles are associated with disease risk; association does not identify mechanism." },
  { id: "e-pd1-ex", from: "pd1", to: "exhaust", status: "supported", basis: "Sustained PD-1 signalling contributes to exhausted T-cell states." },
  { id: "e-ex-nsclc", from: "exhaust", to: "nsclc", status: "supported", basis: "Exhausted T cells contribute to tumour escape; checkpoint blockade can partly reverse it.", },
  { id: "e-sc-ex", from: "scrna", to: "exhaust", status: "association", basis: "Single-cell profiles define exhausted states; the profiles are descriptive and cell-state definitions vary." },
  { id: "e-lgr5-bar", from: "lgr5", to: "barrier", status: "supported", basis: "The intestinal epithelium is renewed from LGR5⁺ crypt stem cells." },
  { id: "e-bar-ibd", from: "barrier", to: "ibd", status: "association", basis: "Barrier dysfunction accompanies IBD; whether it is primary or secondary is debated." },
];
export const edgeById = Object.fromEntries(ATLAS_EDGES.map((e) => [e.id, e])) as Record<string, AtlasEdge>;

export type AtlasPathway = { id: string; name: string; summary: string; edges: string[] };
export const ATLAS_PATHWAYS: AtlasPathway[] = [
  { id: "treg", name: "Microbial metabolites and regulatory T cells", summary: "From a bacterial metabolite to an anti-inflammatory signal and a disease association.", edges: ["e-mic-but", "e-but-treg", "e-treg-il10", "e-il10-ibd"] },
  { id: "gutbrain", name: "Gut barrier and brain inflammation", summary: "A proposed route from gut permeability to neuroinflammation, with two unresolved conflicts.", edges: ["e-bar-il6", "e-il6-bbb", "e-bbb-mg", "e-mg-ni", "e-ni-pd"] },
  { id: "trp", name: "Tryptophan metabolites and microglia", summary: "Microbial metabolites proposed to reach brain immune cells; largely preclinical.", edges: ["e-mic-trp", "e-trp-mg", "e-mg-ni", "e-ni-pd"] },
  { id: "genetic", name: "Genetic risk and immune regulation", summary: "Risk variants linked to immune regulation and disease; associations, not mechanisms.", edges: ["e-eqtl-il10", "e-il10-ibd", "e-hla-ibd"] },
  { id: "checkpoint", name: "Checkpoint signalling and tumour immune evasion", summary: "Checkpoint signalling, T-cell exhaustion and tumour escape.", edges: ["e-sc-ex", "e-pd1-ex", "e-ex-nsclc"] },
  { id: "barrier", name: "Epithelial renewal and the gut barrier", summary: "Stem-cell renewal of the barrier, and a contested effect of butyrate on it.", edges: ["e-lgr5-bar", "e-mic-but", "e-but-bar", "e-bar-ibd"] },
];
export const pathwayById = Object.fromEntries(ATLAS_PATHWAYS.map((p) => [p.id, p])) as Record<string, AtlasPathway>;

/** Weakest evidence status among an entity's relations (conflict is weakest). Used for the status dot on each node. */
export function weakestStatus(entityId: string): AtlasStatus {
  let worst = -1;
  for (const e of ATLAS_EDGES) if (e.from === entityId || e.to === entityId) worst = Math.max(worst, STATUS_ORDER.indexOf(e.status));
  return STATUS_ORDER[Math.max(worst, 0)]!;
}
export function pathwayDomains(p: AtlasPathway): AtlasDomainKey[] {
  const keys: AtlasDomainKey[] = [];
  for (const id of p.edges) for (const ent of [entityById[edgeById[id]!.from]!, entityById[edgeById[id]!.to]!]) if (!keys.includes(ent.domain)) keys.push(ent.domain);
  return keys;
}
export function pathwayConflicts(p: AtlasPathway): number {
  return p.edges.filter((id) => edgeById[id]!.status === "contested").length;
}
/** Edges ordered so each step follows from the previous where possible (the data lists them in order already). */
export function relationsOf(entityId: string): AtlasEdge[] {
  return ATLAS_EDGES.filter((e) => e.from === entityId || e.to === entityId);
}
