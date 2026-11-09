import {HOME_DEMO} from "./homeResearchScenarios";

export type DomainStatus="research_preview"|"in_development"|"not_currently_available";

export type HomeDomain={
  id:string;
  label:string;
  status:DomainStatus;
  blurb:string;
  shows:string;
  connected:readonly string[];
  action:string;
  to?:string;
  cta?:string;
  path:readonly string[];
  visualNote:string;
};

export const STATUS_LABEL:Record<DomainStatus,string>={
  research_preview:"Research preview",
  in_development:"In development",
  not_currently_available:"Not currently available",
};

/** Eight-domain ecosystem — supporting layer for the research workbench, not equal-weight nav. */
export const HOME_DOMAINS:HomeDomain[]=[
  {
    id:"health",
    label:"Health",
    status:"research_preview",
    blurb:"Personal and longitudinal health context within product boundaries.",
    shows:"Personal and longitudinal health context",
    connected:["clinical","evidence"],
    action:"Aksh Health keeps care and data boundaries separate from HSI research tools.",
    to:"/modules/aksh-health",
    cta:"Open Aksh context",
    path:["Health context","Longitudinal signals","Care setting","No HSI PHI store"],
    visualNote:"Product boundary preserved — not a live care record inside HSI.",
  },
  {
    id:"clinical",
    label:"Clinical",
    status:"research_preview",
    blurb:"Clinical research and evidence context for education — not patient-specific advice.",
    shows:"Clinical research and evidence context",
    connected:["health","evidence","trials"],
    action:"Clinical context is explained in Research — it does not open a care record or EHR.",
    to:"/research",
    cta:"Open Research overview",
    path:["Research question","Population context","Study setting","Limitation labels","No care write-back"],
    visualNote:"Educational context only — not live clinical connectivity.",
  },
  {
    id:"biology",
    label:"Biology",
    status:"research_preview",
    blurb:"Cells, tissues, pathways and mechanisms. Inspect relationships before treating a path as causal.",
    shows:"Cells, tissues, pathways, mechanisms",
    connected:["immunity","omics","evidence"],
    action:"Stay with the homepage demonstration, or open the biology graph tool.",
    to:"/science/graph",
    cta:"Explore the Biology Graph",
    path:HOME_DEMO.mechanism_path,
    visualNote:"Illustrative fibrosis path from the homepage demonstration.",
  },
  {
    id:"immunity",
    label:"Immunity",
    status:"research_preview",
    blurb:"Immune cells, states, cytokines and disease context via Immune Super Intelligence.",
    shows:"Immune cells, states, cytokines, disease",
    connected:["biology","microbiome","evidence"],
    action:"ISI is a distinct product surface for immune-science research.",
    to:"/modules/isi",
    cta:"Open Immune Super Intelligence",
    path:["Immune activation","Cytokine signalling","Cell-state context","Disease framing"],
    visualNote:"ISI product boundary — not an HSI clinical engine.",
  },
  {
    id:"microbiome",
    label:"Microbiome",
    status:"research_preview",
    blurb:"Microbial functions, metabolites and host-immunity research candidates.",
    shows:"Microbial functions, metabolites, host immunity",
    connected:["immunity","biology","evidence"],
    action:"Gut–immune candidates live in the connected research graph with model labels.",
    to:"/research/knowledge-graph",
    cta:"Open connected research graph",
    path:["Microbial community","Metabolite signal","Host immune state","Model-labelled evidence"],
    visualNote:"Source candidates and gaps — not validated mechanisms.",
  },
  {
    id:"omics",
    label:"Omics",
    status:"in_development",
    blurb:"Molecular and multi-omic evidence framing is planned. No live omics pipeline is claimed.",
    shows:"Molecular and multi-omic evidence",
    connected:["biology","evidence"],
    action:"Capability is in development — do not treat UI polish as live omics retrieval.",
    path:["Assay context","Molecular signal","Integration (planned)","Review required"],
    visualNote:"Future capability — honesty label required.",
  },
  {
    id:"evidence",
    label:"Evidence",
    status:"research_preview",
    blurb:"Source-linked claims, supporting and conflicting findings, context and review status.",
    shows:"Source-linked claims and uncertainty",
    connected:["biology","clinical","trials"],
    action:"The demonstration shows illustrative evidence states. Deepen on Evidence & safety.",
    to:"/evidence-safety",
    cta:"Explore Evidence Intelligence",
    path:["Question framed","Sources gathered","Support vs conflict","Gaps named","Review attached"],
    visualNote:"Evidence states stay labelled — not a confidence score.",
  },
  {
    id:"trials",
    label:"Trials",
    status:"not_currently_available",
    blurb:"Therapeutic and registered-study context is planned. No live matching or enrolment.",
    shows:"Therapeutic and clinical research context",
    connected:["clinical","evidence"],
    action:"Read the Trials scope page — capability is not live.",
    to:"/modules/trials",
    cta:"Read Trials scope",
    path:["Registered study context","Eligibility questions","Matching (planned)","Enrolment (not offered)"],
    visualNote:"Not currently available — honesty labels stay on the Trials page.",
  },
];
