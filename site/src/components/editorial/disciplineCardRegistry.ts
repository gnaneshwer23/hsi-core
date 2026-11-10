import { DOMAIN_SCENARIO_HINT } from "../../lib/researchContext";

export type DisciplineCard = {
  id: string;
  label: string;
  blurb: string;
  connected: readonly string[];
  to: string;
  cta: string;
  domainHint?: string;
};

/** Section 5 registry — navigates to existing routes; not separate apps. */
export const HOME_DISCIPLINE_CARDS: readonly DisciplineCard[] = [
  {
    id: "immunology",
    label: "Immunology",
    blurb: "Immune cells, signalling and disease-context research framing.",
    connected: ["Neuroimmunology", "Inflammation"],
    to: "/modules/isi",
    cta: "Open Immune Super Intelligence",
    domainHint: "immunity",
  },
  {
    id: "neuroimmunology",
    label: "Neuroimmunology",
    blurb: "Interfaces between neural and immune research questions.",
    connected: ["Immunology", "Gut–brain–immune"],
    to: "/science/graph",
    cta: "Explore biology graph",
    domainHint: "biology",
  },
  {
    id: "gut_brain_immune",
    label: "Gut–brain–immune interactions",
    blurb: "Host–microbe and neuroimmune candidates with model labels.",
    connected: ["Microbiome", "Neuroimmunology"],
    to: "/research/knowledge-graph",
    cta: "Open connected research graph",
    domainHint: "microbiome",
  },
  {
    id: "microbiome",
    label: "Microbiome and host biology",
    blurb: "Microbial functions, metabolites and host immunity research candidates.",
    connected: ["Immunology", "Metabolism"],
    to: "/research/knowledge-graph",
    cta: "Explore microbiome context",
    domainHint: "microbiome",
  },
  {
    id: "metabolic",
    label: "Metabolic and endocrine biology",
    blurb: "Metabolic pathways and immune activation as research questions.",
    connected: ["Inflammation", "Organ biology"],
    to: "/science/body",
    cta: "Explore body systems",
    domainHint: "clinical",
  },
  {
    id: "omics",
    label: "Genomics and multi-omics",
    blurb: "Molecular evidence framing is in development — not a live omics pipeline.",
    connected: ["Cellular biology", "Evidence"],
    to: "/technology",
    cta: "Read technology status",
    domainHint: "omics",
  },
  {
    id: "cancer_immuno",
    label: "Cancer immunology",
    blurb: "Tumour–immune research context with honesty labels — not eligibility.",
    connected: ["Immunology", "Therapeutics"],
    to: "/solutions",
    cta: "Explore applications",
    domainHint: "immunity",
  },
  {
    id: "inflammation",
    label: "Inflammation and autoimmunity",
    blurb: "Inflammatory mechanisms as illustrative investigation paths.",
    connected: ["Immunology", "Organ biology"],
    to: "/research",
    cta: "Open research overview",
    domainHint: "immunity",
  },
  {
    id: "organ",
    label: "Organ biology and physiology",
    blurb: "Organ and tissue context for mechanism exploration.",
    connected: ["Metabolism", "Disease mechanisms"],
    to: "/science",
    cta: "Explore science",
    domainHint: "biology",
  },
  {
    id: "therapeutics",
    label: "Drug discovery and therapeutics",
    blurb: "Target biology and evidence gaps — not validated therapeutic claims.",
    connected: ["Omics", "Trials"],
    to: "/modules/trials",
    cta: "Read Trials scope",
    domainHint: "trials",
  },
];

export function disciplineScenario(card: DisciplineCard): string | undefined {
  if (!card.domainHint) return undefined;
  return DOMAIN_SCENARIO_HINT[card.domainHint];
}
