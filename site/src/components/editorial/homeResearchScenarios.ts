/** Illustrative homepage research scenarios — live_backend false until staging verification. */

export type ScenarioCoverage="illustrative"|"pack_backed"|"staging_verified";

export type HomeResearchScenario={
  id:string;
  demonstration_id:string;
  short_label:string;
  live_backend:false;
  review_status:"not_reviewed";
  coverage:ScenarioCoverage;
  /** Optional disease label; null = disease-independent biology. */
  disease:string|null;
  domains:readonly string[];
  question:string;
  mechanism_path:readonly string[];
  supporting:number;
  conflicting:number;
  missing:string;
  gaps:readonly string[];
  disclaimer:string;
  supporting_rows:readonly {label:string;context:string}[];
  conflicting_rows:readonly {label:string;context:string}[];
  nodes:readonly {id:string;label:string;x:number;y:number}[];
  edges:readonly [string,string][];
  default_node:string;
};

export const HOME_RESEARCH_SCENARIOS:readonly HomeResearchScenario[]=[
  {
    id:"ssc_fibrosis",
    demonstration_id:"demo_ssc_fibrosis_001",
    short_label:"SSc fibrosis",
    live_backend:false,
    review_status:"not_reviewed",
    coverage:"illustrative",
    disease:"Systemic sclerosis",
    domains:["immunity","biology","evidence"],
    question:"How might immune activation contribute to fibrosis?",
    mechanism_path:[
      "Immune activation",
      "Cytokine signalling",
      "Fibroblast activation",
      "Extracellular-matrix remodelling",
      "Tissue fibrosis",
    ],
    supporting:4,
    conflicting:1,
    missing:"Longitudinal human tissue data",
    gaps:[
      "Live literature retrieval not bound in this demonstration",
      "No independent scientific review of this illustrative path",
    ],
    disclaimer:"Illustrative demonstration; not a live research investigation. Uses curated example data. Systemic sclerosis is a validation case — not the product boundary.",
    supporting_rows:[
      {label:"Immune → cytokine axis",context:"Curated example · context-limited"},
      {label:"Cytokine → fibroblast signalling",context:"Curated example · tissue not specified"},
      {label:"Fibroblast activation → matrix",context:"Curated example · model-dependent"},
      {label:"Matrix remodelling → fibrosis",context:"Curated example · association only"},
    ],
    conflicting_rows:[
      {label:"Immune activation without fibrotic progression",context:"Curated counter-example · population differs"},
    ],
    nodes:[
      {id:"immune",label:"Immune activation",x:70,y:120},
      {id:"cyto",label:"Cytokines",x:220,y:55},
      {id:"fibro",label:"Fibroblasts",x:370,y:120},
      {id:"matrix",label:"Matrix",x:520,y:55},
      {id:"fibrosis",label:"Fibrosis",x:670,y:120},
    ],
    edges:[["immune","cyto"],["cyto","fibro"],["fibro","matrix"],["matrix","fibrosis"],["immune","fibro"]],
    default_node:"fibro",
  },
  {
    id:"gut_neuro",
    demonstration_id:"demo_gut_neuroinflammation_001",
    short_label:"Gut–neuro",
    live_backend:false,
    review_status:"not_reviewed",
    coverage:"illustrative",
    disease:null,
    domains:["microbiome","immunity","biology"],
    question:"How might gut microbial metabolites influence neuroinflammation?",
    mechanism_path:[
      "Microbial community",
      "Metabolite signal",
      "Peripheral immune tone",
      "CNS immune cells",
      "Neuroinflammation context",
    ],
    supporting:3,
    conflicting:1,
    missing:"Matched human gut–CSF cohorts with metabolite assays",
    gaps:[
      "Cross-tissue causal evidence not established in this demo",
      "Ontology bridges for microbe→glia remain incomplete on substrate",
    ],
    disclaimer:"Illustrative cross-domain path. Coverage is shallower than the SSc validation case — not equal evidence depth.",
    supporting_rows:[
      {label:"Microbe → short-chain metabolite",context:"Curated example · species not specified"},
      {label:"Metabolite → circulating immune tone",context:"Curated example · association"},
      {label:"Peripheral signal → CNS immune cells",context:"Curated example · model-dependent"},
    ],
    conflicting_rows:[
      {label:"Metabolite change without CNS immune shift",context:"Curated counter-example · context differs"},
    ],
    nodes:[
      {id:"microbe",label:"Microbes",x:70,y:120},
      {id:"metab",label:"Metabolites",x:220,y:55},
      {id:"periph",label:"Peripheral immune",x:370,y:120},
      {id:"glia",label:"CNS immune cells",x:520,y:55},
      {id:"neuro",label:"Neuroinflammation",x:670,y:120},
    ],
    edges:[["microbe","metab"],["metab","periph"],["periph","glia"],["glia","neuro"],["metab","glia"]],
    default_node:"metab",
  },
  {
    id:"metabolic_inflammation",
    demonstration_id:"demo_metabolic_inflammation_001",
    short_label:"Metabolic",
    live_backend:false,
    review_status:"not_reviewed",
    coverage:"illustrative",
    disease:null,
    domains:["biology","immunity","clinical"],
    question:"How might metabolic inflammation relate to insulin resistance?",
    mechanism_path:[
      "Nutrient / energy stress",
      "Innate immune activation",
      "Inflammatory mediators",
      "Insulin signalling interference",
      "Insulin resistance context",
    ],
    supporting:3,
    conflicting:1,
    missing:"Tissue-resolved human time-series with matched omics",
    gaps:[
      "Live metabolic / omics connectors not claimed",
      "Disease context optional — not required for this question",
    ],
    disclaimer:"Illustrative metabolic–immune path. Not a claim of equal validation depth with systemic sclerosis packs.",
    supporting_rows:[
      {label:"Energy stress → innate immune activation",context:"Curated example · tissue-limited"},
      {label:"Innate activation → inflammatory mediators",context:"Curated example · association"},
      {label:"Mediators → insulin pathway interference",context:"Curated example · model-dependent"},
    ],
    conflicting_rows:[
      {label:"Inflammation markers without insulin resistance",context:"Curated counter-example · population differs"},
    ],
    nodes:[
      {id:"stress",label:"Energy stress",x:70,y:120},
      {id:"innate",label:"Innate immune",x:220,y:55},
      {id:"inflam",label:"Mediators",x:370,y:120},
      {id:"insulin",label:"Insulin signalling",x:520,y:55},
      {id:"ir",label:"Insulin resistance",x:670,y:120},
    ],
    edges:[["stress","innate"],["innate","inflam"],["inflam","insulin"],["insulin","ir"],["stress","inflam"]],
    default_node:"inflam",
  },
  {
    id:"cytokine_cross_tissue",
    demonstration_id:"demo_cytokine_cross_tissue_001",
    short_label:"Cytokine (no disease)",
    live_backend:false,
    review_status:"not_reviewed",
    coverage:"illustrative",
    disease:null,
    domains:["biology","immunity","omics"],
    question:"How does the same cytokine signalling axis behave across distinct tissues?",
    mechanism_path:[
      "Ligand / receptor pair",
      "Tissue A context",
      "Tissue B context",
      "Shared pathway nodes",
      "Context-dependent outcomes",
    ],
    supporting:2,
    conflicting:2,
    missing:"Harmonised multi-tissue expression + functional assays",
    gaps:[
      "Disease identifier intentionally omitted",
      "Substrate create path still disease-narrow — demo is illustrative only",
    ],
    disclaimer:"Disease-independent illustrative question. Backend investigation create must accept null disease before this can be staging-verified.",
    supporting_rows:[
      {label:"Shared receptor → pathway activation",context:"Curated example · multi-tissue"},
      {label:"Pathway → context-specific transcription",context:"Curated example · association"},
    ],
    conflicting_rows:[
      {label:"Activation in tissue A without tissue B effect",context:"Curated counter-example"},
      {label:"Opposite directionality by tissue state",context:"Curated counter-example · unresolved"},
    ],
    nodes:[
      {id:"ligand",label:"Ligand/receptor",x:70,y:120},
      {id:"tissa",label:"Tissue A",x:250,y:50},
      {id:"tissb",label:"Tissue B",x:250,y:150},
      {id:"path",label:"Shared pathway",x:450,y:100},
      {id:"out",label:"Context outcomes",x:650,y:100},
    ],
    edges:[["ligand","tissa"],["ligand","tissb"],["tissa","path"],["tissb","path"],["path","out"]],
    default_node:"path",
  },
  {
    id:"tumour_immune",
    demonstration_id:"demo_tumour_immune_001",
    short_label:"Tumour immune",
    live_backend:false,
    review_status:"not_reviewed",
    coverage:"illustrative",
    disease:null,
    domains:["immunity","biology","trials"],
    question:"How might tumour immune-cell states relate to treatment resistance?",
    mechanism_path:[
      "Tumour microenvironment",
      "Immune-cell states",
      "Checkpoint / effector balance",
      "Therapeutic pressure",
      "Resistance context",
    ],
    supporting:2,
    conflicting:1,
    missing:"Longitudinal single-cell cohorts under therapy",
    gaps:[
      "Cancer-immunology ontology coverage sparse on substrate",
      "No live trial-matching claimed",
    ],
    disclaimer:"Illustrative oncology–immune path. Shallower curated depth than SSc — honesty over completeness.",
    supporting_rows:[
      {label:"TME → exhausted / suppressor states",context:"Curated example · context-limited"},
      {label:"State shift → reduced effector function",context:"Curated example · association"},
    ],
    conflicting_rows:[
      {label:"Resistant disease without clear immune-state shift",context:"Curated counter-example"},
    ],
    nodes:[
      {id:"tme",label:"TME",x:70,y:120},
      {id:"state",label:"Immune states",x:220,y:55},
      {id:"balance",label:"Effector balance",x:370,y:120},
      {id:"tx",label:"Therapy pressure",x:520,y:55},
      {id:"resist",label:"Resistance",x:670,y:120},
    ],
    edges:[["tme","state"],["state","balance"],["balance","tx"],["tx","resist"],["state","resist"]],
    default_node:"state",
  },
] as const;

export const DEFAULT_HOME_SCENARIO_ID="ssc_fibrosis";

export function getHomeScenario(id:string):HomeResearchScenario{
  return HOME_RESEARCH_SCENARIOS.find(s=>s.id===id)??HOME_RESEARCH_SCENARIOS[0]!;
}

/** @deprecated Prefer getHomeScenario — kept for imports that expect a single default demo object. */
export const HOME_DEMO=getHomeScenario(DEFAULT_HOME_SCENARIO_ID);
