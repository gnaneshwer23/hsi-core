export type HeroDomainKey = "immune" | "neural" | "genome" | "microbiome" | "tissue";
export const HERO_DOMAINS: {
  key: HeroDomainKey;
  label: string;
  detail: string;
  pos: [number, number, number];
  screen: [number, number];
}[] = [
  {
    key: "immune",
    label: "Immune cell",
    detail: "Surface receptors sense cytokines and microbial signals.",
    pos: [-3.1, 1.1, -0.5],
    screen: [22, 30],
  },
  {
    key: "neural",
    label: "Neuron",
    detail: "Dendritic arbours integrate neuroimmune input.",
    pos: [3.2, 1.0, -1],
    screen: [76, 30],
  },
  {
    key: "genome",
    label: "Genome",
    detail: "Variants and regulation shape every layer above.",
    pos: [0, -0.1, 0.4],
    screen: [50, 50],
  },
  {
    key: "microbiome",
    label: "Microbial ecosystem",
    detail: "Commensal communities produce metabolites the host reads.",
    pos: [-2.6, -1.7, 0.6],
    screen: [25, 74],
  },
  {
    key: "tissue",
    label: "Tissue architecture",
    detail: "Epithelial barriers mediate exchange between systems.",
    pos: [2.8, -1.6, 0.3],
    screen: [74, 72],
  },
];
