/**
 * Shared Demo Research Universe catalog — publications, organisations and nodes
 * reused across Phase 1–2 scenarios. Read-only; no production graph writes.
 */
import { DEMO_HONESTY, type DemoMechanismNode, type DemoOrganisation, type DemoPublication, type DemoResearcher } from "../types";

export { DEMO_HONESTY };

/** Bibliographic metadata verified offline in src/demo/evidenceFixtures.ts (2026-11-09). */
export const SHARED_PUBLICATIONS: readonly DemoPublication[] = [
  {
    id: "DEMO-PUB-001",
    provenance: "verified_public_source",
    title:
      "Gut Microbiota Regulate Motor Deficits and Neuroinflammation in a Model of Parkinson's Disease.",
    pmid: "27912057",
    doi: "10.1016/j.cell.2016.11.018",
    year: 2016,
    journal: "Cell",
    authorsShort: "Sampson TR, Debelius JW, Thron T, et al.",
    verifiedAt: "2026-11-09",
    rightsNote: "Bibliographic metadata only; abstract not reproduced; not scientific approval.",
    abstractReproduced: false,
  },
  {
    id: "DEMO-PUB-002",
    provenance: "verified_public_source",
    title: "Anti-TNF agents for rheumatoid arthritis.",
    pmid: "11298065",
    doi: "10.1046/j.1365-2125.2001.00321.x",
    year: 2001,
    journal: "Br J Clin Pharmacol",
    authorsShort: "Seymour HE, Worsley A, Smith JM, Thomas SH.",
    verifiedAt: "2026-11-09",
    rightsNote: "Bibliographic metadata only; abstract not reproduced; association ≠ causation.",
    abstractReproduced: false,
  },
];

export const SHARED_ORGANISATIONS: readonly DemoOrganisation[] = [
  {
    id: "DEMO-ORG-001",
    name: "Northbridge Systems Immunology Group",
    kind: "university_group",
    fictional: true,
  },
  {
    id: "DEMO-ORG-002",
    name: "Cedarline Translational Biotech (demo)",
    kind: "biotech",
    fictional: true,
  },
];

export const SHARED_RESEARCHERS: readonly DemoResearcher[] = [
  {
    id: "DEMO-RESEARCHER-001",
    displayName: "Dr Alex Rivera",
    role: "postdoc",
    organisationId: "DEMO-ORG-001",
    interests: ["microbiome", "immunometabolism", "insulin signalling"],
    fictional: true,
  },
  {
    id: "DEMO-RESEARCHER-002",
    displayName: "Prof Jordan Okonkwo",
    role: "professor",
    organisationId: "DEMO-ORG-001",
    interests: ["inflammation", "translational research"],
    fictional: true,
  },
  {
    id: "DEMO-RESEARCHER-003",
    displayName: "Dr Sam Chen",
    role: "biotech_scientist",
    organisationId: "DEMO-ORG-002",
    interests: ["single-cell", "fibrosis", "target triage"],
    fictional: true,
  },
];

/** Cross-scenario mechanism nodes — scenarios reference subsets via sharedNodeIds. */
export const SHARED_NODES: readonly DemoMechanismNode[] = [
  { id: "DEMO-NODE-butyrate", label: "Butyrate / SCFA class", kind: "metabolite", domainIds: ["microbiome-metabolism", "immune-inflammation"] },
  { id: "DEMO-NODE-ffar2", label: "FFAR2", kind: "gene", domainIds: ["microbiome-metabolism", "immune-inflammation"] },
  { id: "DEMO-NODE-macrophage", label: "Macrophage / myeloid signalling", kind: "cell", domainIds: ["immune-inflammation"] },
  { id: "DEMO-NODE-adipose", label: "Adipose tissue", kind: "tissue", domainIds: ["organ-tissue-biology", "microbiome-metabolism"] },
  { id: "DEMO-NODE-cytokine", label: "Inflammatory cytokine response", kind: "phenotype", domainIds: ["immune-inflammation"] },
  { id: "DEMO-NODE-insulin-resistance", label: "Insulin sensitivity / resistance", kind: "phenotype", domainIds: ["microbiome-metabolism", "disease-mechanisms"] },
  { id: "DEMO-NODE-gut", label: "Gut microbial community", kind: "organism", domainIds: ["microbiome-metabolism"] },
  { id: "DEMO-NODE-tnf", label: "TNF pathway (separate association)", kind: "pathway", domainIds: ["immune-inflammation", "disease-mechanisms"] },
  { id: "DEMO-NODE-il6", label: "IL-6 signalling", kind: "pathway", domainIds: ["immune-inflammation", "disease-mechanisms"] },
  { id: "DEMO-NODE-microglia", label: "Microglia", kind: "cell", domainIds: ["neuroscience", "immune-inflammation"] },
  { id: "DEMO-NODE-blood-brain", label: "Blood–brain barrier interface", kind: "tissue", domainIds: ["neuroscience", "organ-tissue-biology"] },
  { id: "DEMO-NODE-synuclein", label: "α-synuclein / neuroinflammation context", kind: "protein", domainIds: ["neuroscience", "disease-mechanisms"] },
  { id: "DEMO-NODE-tcell", label: "T cell subset programme", kind: "cell", domainIds: ["immune-inflammation", "genomics-multi-omics"] },
  { id: "DEMO-NODE-scrnaseq", label: "scRNA-seq cluster annotation", kind: "mechanism", domainIds: ["genomics-multi-omics"] },
  { id: "DEMO-NODE-fibroblast", label: "Activated fibroblast", kind: "cell", domainIds: ["organ-tissue-biology", "disease-mechanisms"] },
  { id: "DEMO-NODE-ecm", label: "Extracellular matrix remodelling", kind: "pathway", domainIds: ["organ-tissue-biology"] },
  { id: "DEMO-NODE-tgfb", label: "TGF-β pathway", kind: "pathway", domainIds: ["organ-tissue-biology", "disease-mechanisms"] },
  { id: "DEMO-NODE-ssc", label: "Systemic sclerosis / fibrosis phenotype", kind: "disease", domainIds: ["disease-mechanisms", "immune-inflammation"] },
  { id: "DEMO-NODE-ra", label: "Rheumatoid arthritis phenotype", kind: "disease", domainIds: ["disease-mechanisms", "immune-inflammation"] },
];

export function nodesByIds(ids: readonly string[]): DemoMechanismNode[] {
  const map = new Map(SHARED_NODES.map((n) => [n.id, n]));
  return ids.map((id) => {
    const node = map.get(id);
    if (!node) throw new Error(`Unknown shared demo node: ${id}`);
    return node;
  });
}
